import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

function useMeetingRoom(meetingId) {
  const navigate = useNavigate();

  const socketRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const screenRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const mySocketIdRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenShare, setIsScreenShare] = useState(false);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [remoteStreams, setRemoteStreams] = useState({});
  
  const [activePresenterId, setActivePresenterId] = useState(null);
  
  const [isChatOpen, setIsChatOpen] = useState(false);

  const stopLocalResources = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    Object.values(peerConnectionsRef.current).forEach((pc) => {
      pc.close();
    });
    peerConnectionsRef.current = {};

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }

    if (screenRef.current) {
      screenRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.log("Error accessing media devices", error);
      }
    };

    const createOffer = async (targetSocketId, pc) => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current.emit("offer", {
        offer,
        meetingId,
        targetSocketId,
      });
    };

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/chat/meeting/${meetingId}`
        );

        const data = await res.json();
        const storedUser = JSON.parse(localStorage.getItem("user"));

        setMessages(
          data.map((item) => ({
            ...item,
            isOwn: item.senderId === storedUser?.id,
          }))
        );
      } catch (error) {
        console.log("Error fetching messages", error);
      }
    };

    const setupMeeting = async () => {
      const createPeerConnection = (remoteSocketId) => {
        if (peerConnectionsRef.current[remoteSocketId]) {
          return peerConnectionsRef.current[remoteSocketId];
        }

        const pc = new RTCPeerConnection();
        peerConnectionsRef.current[remoteSocketId] = pc;

        streamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, streamRef.current);
        });

        pc.ontrack = (event) => {
          setRemoteStreams((prev) => ({
            ...prev,
            [remoteSocketId]: event.streams[0],
          }));
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socketRef.current.emit("ice-candidate", {
              candidate: event.candidate,
              targetSocketId: remoteSocketId,
            });
          }
        };

        return pc;
      };

      await startCamera();
      await fetchMessages();

      socketRef.current = io("http://localhost:5000");

      socketRef.current.on("connect", () => {
        mySocketIdRef.current = socketRef.current.id;
      });

      socketRef.current.on("receive-message", (newMessage) => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const isOwn = newMessage.senderId === storedUser?.id;

        setMessages((prev) => [
          ...prev,
          {
            ...newMessage,
            isOwn,
          },
        ]);

        if (!isOwn) {
          setIsChatOpen(true);
        }
      });

      socketRef.current.on("screen-share-started", ({ socketId }) => {
        setActivePresenterId(socketId);
      });

      socketRef.current.on("screen-share-stopped", ({ socketId }) => {
        setActivePresenterId((prev) => (prev === socketId ? null : prev));
      });

      socketRef.current.on("existing-users", async (users) => {
        for (const socketId of users) {
          if (peerConnectionsRef.current[socketId]) continue;

          const pc = createPeerConnection(socketId);
          await createOffer(socketId, pc);
        }
      });

      socketRef.current.on("receive-offer", async ({ offer, fromSocketId }) => {
        let pc = peerConnectionsRef.current[fromSocketId];

        if (!pc) {
          pc = createPeerConnection(fromSocketId);
        }

        await pc.setRemoteDescription(offer);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socketRef.current.emit("answer", {
          answer,
          targetSocketId: fromSocketId,
        });
      });

      socketRef.current.on("receive-answer", async ({ answer, fromSocketId }) => {
        const pc = peerConnectionsRef.current[fromSocketId];
        if (pc) {
          await pc.setRemoteDescription(answer);
        }
      });

      socketRef.current.on("receive-ice-candidate", async ({ candidate, fromSocketId }) => {
          const pc = peerConnectionsRef.current[fromSocketId];
          if (pc) {
            await pc.addIceCandidate(candidate);
          }
        }
      );

      socketRef.current.on("user-left", ({ socketId }) => {
        const pc = peerConnectionsRef.current[socketId];

        if (pc) {
          pc.close();
          delete peerConnectionsRef.current[socketId];
        }

        setRemoteStreams((prev) => {
          const updated = { ...prev };
          delete updated[socketId];
          return updated;
        });

        setActivePresenterId((prev) => (prev === socketId ? null : prev));
      });

      socketRef.current.emit("join-meeting", meetingId);
    };

    setupMeeting();

    return () => {
      stopLocalResources();
    };
  }, [meetingId]);

  const presenterIsLocal = activePresenterId === mySocketIdRef.current;
  const presenterStream = activePresenterId
    ? remoteStreams[activePresenterId]
    : null;

  const otherRemoteEntries = Object.entries(remoteStreams).filter(
    ([socketId]) => socketId !== activePresenterId
  );

  const participantCount = 1 + Object.keys(remoteStreams).length;

  let gridClass = "video-grid";
  if (participantCount === 1) gridClass += " one-user";
  else if (participantCount === 2) gridClass += " two-users";
  else if (participantCount === 3) gridClass += " three-users";
  else if (participantCount === 4) gridClass += " four-users";
  else gridClass += " many-users";

  const sendMessage = (e) => {
    e.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const cleanMessage = message.trim();

    if (!cleanMessage || !storedUser || !socketRef.current) {
      return;
    }

    socketRef.current.emit("send-message", {
      meetingId,
      senderId: storedUser.id,
      senderName: storedUser.fullname,
      message: cleanMessage,
    });

    setMessage("");
  };

  const endMeeting = () => {
    socketRef.current?.emit("leave-meeting", { meetingId });
    stopLocalResources();
    navigate("/dashboard");
  };

  const toggleMute = () => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!audioTrack.enabled);
  };

  const toggleCamera = () => {
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;
    setIsCameraOff(!videoTrack.enabled);
  };

  const stopScreenShare = () => {
    const cameraTrack = streamRef.current?.getVideoTracks()[0];
    if (!cameraTrack) return;

    Object.values(peerConnectionsRef.current).forEach((pc) => {
      const sender = pc.getSenders().find(
        (item) => item.track && item.track.kind === "video"
      );

      if (sender) {
        sender.replaceTrack(cameraTrack);
      }
    });

    if (videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }

    if (screenRef.current) {
      screenRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      screenRef.current = null;
    }

    setIsScreenShare(false);
    setActivePresenterId((prev) =>
      prev === mySocketIdRef.current ? null : prev
    );

    socketRef.current?.emit("screen-share-stop", { meetingId });
  };

  const toggleScreenShare = async () => {
    if (isScreenShare) {
      stopScreenShare();
      return;
    }

    socketRef.current.emit("screen-share-start", { meetingId }, async (response) => {
      if (!response?.success) {
        alert(response?.message || "Screen sharing is already active");
        return;
      }

      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        const screenTrack = screenStream.getVideoTracks()[0];
        screenRef.current = screenStream;

        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const sender = pc.getSenders().find(
            (item) => item.track && item.track.kind === "video"
          );

          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
        }

        setIsScreenShare(true);
        setActivePresenterId(mySocketIdRef.current);

        screenTrack.onended = () => {
          stopScreenShare();
        };
      } catch (error) {
        console.log("Error sharing screen:", error);
        socketRef.current.emit("screen-share-stop", { meetingId });
      }
    });
  };

  return {
    videoRef,
    remoteStreams,
    isMuted,
    isCameraOff,
    isScreenShare,
    activePresenterId,
    presenterIsLocal,
    presenterStream,
    otherRemoteEntries,
    gridClass,
    messages,
    message,
    setMessage,
    isChatOpen,
    setIsChatOpen,
    sendMessage,
    endMeeting,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  };
}

export default useMeetingRoom;


