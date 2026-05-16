import { useEffect, useRef , useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

function MeetingRoom() {

  const socketRef = useRef(null);    //for holding socket connection

  const { meetingId } = useParams();

  const videoRef = useRef(null);       //for holding real HTML tag for video
  const streamRef = useRef(null);     //for holding stream which contain video and audio
  const peerConnectionsRef = useRef({});    //webRTC connection object
  const [remoteStreams, setRemoteStreams] = useState({});   //dusre user ka video dikhane ke liye
  const navigate = useNavigate();

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  useEffect(() => {

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        console.log("Camera stream:", stream);
        streamRef.current = stream;

        if(videoRef.current){
          videoRef.current.srcObject = stream;
        }

      } catch (error) {
        console.log("Error accessing media devices", error);
      }
    };

    const createOffer = async (targetSocketId, pc) => {
      console.log("Creating offer for:", targetSocketId);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log("Sending offer to:", targetSocketId);
        
      socketRef.current.emit("offer", {
        offer,
        meetingId,
        targetSocketId,
      });
    };

    const setupMeeting = async () => {

      const createPeerConnection = (remoteSocketId) => {    //webRTC connection object create
        if (peerConnectionsRef.current[remoteSocketId]) {   
          return peerConnectionsRef.current[remoteSocketId];
        }
      
        const pc = new RTCPeerConnection();
        peerConnectionsRef.current[remoteSocketId] = pc;
      
        streamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, streamRef.current);
        });
      
        pc.ontrack = (event) => {
          console.log("ontrack fired for:", remoteSocketId, event.streams);

          setRemoteStreams((prev) => ({
            ...prev,
            [remoteSocketId]: event.streams[0],
          }));
        };
      
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("Sending ICE to:", remoteSocketId, event.candidate);

            socketRef.current.emit("ice-candidate", {
              candidate: event.candidate,
              targetSocketId: remoteSocketId,
            });
          }
        };
      
        return pc;
      };      

      await startCamera();  
      socketRef.current = io("http://localhost:5000");    //create live connection with backend

      socketRef.current.on("existing-users", async (users) => {
        console.log("existing-users:", users);
        for (const socketId of users) {
          if (peerConnectionsRef.current[socketId]) continue;

          console.log("Creating offer for existing user:", socketId);
          const pc = createPeerConnection(socketId);
          await createOffer(socketId, pc);
        }
      });

      socketRef.current.on("user-joined", ({ socketId }) => {
        console.log("user-joined event:", socketId);
      });

      socketRef.current.on("receive-offer", async ({ offer, fromSocketId }) => {
        console.log("Received offer from:", fromSocketId);

        let pc = peerConnectionsRef.current[fromSocketId];

        if (!pc) {
          console.log("No PC found, creating for:", fromSocketId);
          pc = createPeerConnection(fromSocketId);
        }
      
        await pc.setRemoteDescription(offer);
      
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        console.log("Sending answer to:", fromSocketId);
      
        socketRef.current.emit("answer", {
          answer,
          targetSocketId: fromSocketId,
        });
      });

      socketRef.current.on("receive-answer", async ({ answer, fromSocketId }) => {
        console.log("Received answer from:", fromSocketId);

        const pc = peerConnectionsRef.current[fromSocketId];
        if (pc) {
          await pc.setRemoteDescription(answer);
        }
      });

      socketRef.current.on("receive-ice-candidate", async ({ candidate, fromSocketId }) => {
        console.log("Received ICE from:", fromSocketId, candidate);

        const pc = peerConnectionsRef.current[fromSocketId];
        if (pc) {
          await pc.addIceCandidate(candidate);
        }
      });

      socketRef.current.emit("join-meeting", meetingId);   //create req for join meeting using meetingId
    }

    setupMeeting();

    return () => {
      // 1. socket disconnect
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      // 2. close peer connection
      Object.values(peerConnectionsRef.current).forEach((pc) => {
        pc.close();
      });
      peerConnectionsRef.current = {};
      // 3. stop camera + mic
      if (streamRef.current) {      
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
      // 4. navigate to dashboard
      navigate("/dashboard");
    }
  }, []);

  console.log("remoteStreams state:", Object.keys(remoteStreams));

  const participantCount = 1 + Object.keys(remoteStreams).length;
  
  let gridClass = "video-grid";
  if (participantCount === 1) gridClass += " one-user";
  else if (participantCount === 2) gridClass += " two-users";
  else if (participantCount === 3) gridClass += " three-users";
  else if (participantCount === 4) gridClass += " four-users";
  else gridClass += " many-users";

  const endMeeting = async () => {
    // 1. socket disconnect
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    // 2. peer connection close
    Object.values(peerConnectionsRef.current).forEach((pc) => {
      pc.close();
    });
    peerConnectionsRef.current = {};
    // 3. stop camera + mic
    if (streamRef.current) {      
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }
    // 4. navigate to dashboard
    navigate("/dashboard");
  };

  const toggleMute = () => {
    const audioTrack = streamRef.current.getAudioTracks()[0];
    if(audioTrack.enabled){

      audioTrack.enabled = false;
      setIsMuted(true);

    } else {

      audioTrack.enabled = true;
      setIsMuted(false);

    }
  };

  const toggleCamera = () => {
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if(videoTrack.enabled){

      videoTrack.enabled = false;
      setIsCameraOff(true);

    } else {

      videoTrack.enabled = true;
      setIsCameraOff(false);

    }
  };

  return (
    <div className="meeting-room">

      <div className="meeting-header">
        <h2>Meeting ID: {meetingId}</h2>
      </div>
      
      <div className="meeting-body">

        <div className={gridClass}>
          <div className="video-tile">
            <video
              className="video-card local-video"
              ref={videoRef}
              autoPlay
              playsInline
              muted
            />
            <div className="video-label">You</div>
          </div>

          {Object.entries(remoteStreams).map(([socketId, stream], index) => (
            <div className="video-tile" key={socketId}>
              <video
                className="video-card remote-video"
                autoPlay
                playsInline
                ref={(el) => {
                  if (el) {
                    el.srcObject = stream;
                  }
                }}
              />
              <div className="video-label">Participant {index + 1}</div>
            </div>
          ))}
        </div>

        <div className="controls">
          <button onClick={toggleMute}>
            {isMuted ? "Unmute" : "Mute"}
          </button>

          <button onClick={toggleCamera}>
            {isCameraOff ? "Open Camera" : "Close Camera"}
          </button>

          <button className="end-call" onClick={endMeeting}>
            End Meeting
          </button>
        </div>
      </div>

    </div>
  );
}

export default MeetingRoom;