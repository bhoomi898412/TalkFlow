import { useEffect, useRef , useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

function MeetingRoom() {

  const socketRef = useRef(null);    //for holding socket connection

  const { meetingId } = useParams();

  const videoRef = useRef(null);       //for holding real HTML tag for video
  const streamRef = useRef(null);     //for holding stream which contain video and audio
  const peerConnectionRef = useRef(null);    //webRTC connection object
  const remoteVideoRef = useRef(null);   //dusre user ka video dikhane ke liye
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

        stream.getTracks().forEach((track) => {
          peerConnectionRef.current.addTrack(track, stream);
        });

        console.log(peerConnectionRef.current);

        if(videoRef.current){
          videoRef.current.srcObject = stream;
        }

      } catch (error) {
        console.log("Error accessing media devices", error);
      }
    };

    const createOffer = async () => {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      console.log("Offer:", offer);

      socketRef.current.emit("offer", {
        offer,
        meetingId,
      });
    }

    const setupMeeting = async () => {

      peerConnectionRef.current = new RTCPeerConnection();   //WebRTC connection object create

      peerConnectionRef.current.ontrack = (event) => {    //auto triger event by browser when any audio or video come from another user or browser
        console.log("Remote Stream Received");
        if(remoteVideoRef.current){
          remoteVideoRef.current.srcObject = event.streams[0];    
        }
      };

      peerConnectionRef.current.onicecandidate = (event) => {   //auto triger eveny by browser when any new internet path find 
        if(event.candidate){
          console.log("Sending ICE Candidate:", event.candidate);

          socketRef.current.emit("ice-candidate", {
            candidate: event.candidate,
            meetingId,
          });
        }
      };
  
      await startCamera();  
      
      socketRef.current = io("http://localhost:5000");    //create live connection with backend

      socketRef.current.on("user-joined", async () => {
        await createOffer();
      });

      socketRef.current.on("receive-offer", async (offer) => {
        console.log("Received Offer:", offer);
        await peerConnectionRef.current.setRemoteDescription(offer);

        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        console.log("Answer:", answer);

        socketRef.current.emit("answer", {
          answer,
          meetingId,
        });
      });

      socketRef.current.on("receive-answer", async (answer) => {
        console.log("Received Answer:", answer);
        await peerConnectionRef.current.setRemoteDescription(answer);
      });

      socketRef.current.on("receive-ice-candidate", async (candidate) => {
        console.log("Received ICE Candidate:", candidate);
        await peerConnectionRef.current.addIceCandidate(candidate);
      });

      socketRef.current.emit("join-meeting", meetingId);   //create req for join meeting using meetingId
    }

    setupMeeting();

    return () => {
      // 1. socket disconnect
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      // 2. peer connection close
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
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

  const endMeeting = async () => {
    // 1. socket disconnect
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    // 2. peer connection close
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
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
        <video
          className="video-card local-video"
          ref={videoRef}
          autoPlay
          playsInline
          muted
          width="50%"
        />

        <video
          className="video-card remote-video"
          ref={remoteVideoRef}
          autoPlay
          playsInline
          width="95%"
        />

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