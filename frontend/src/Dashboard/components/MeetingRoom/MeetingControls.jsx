import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaDesktop,
  FaComments,
  FaPhoneSlash,
} from "react-icons/fa";

function MeetingControls({
  isMuted,
  isCameraOff,
  isScreenShare,
  messagesCount,
  toggleMute,
  toggleCamera,
  endMeeting,
  toggleScreenShare,
  toggleChat,
}) {
  return (
    <div className="controls">
      <button onClick={toggleMute}>{isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}</button>

      <button onClick={toggleCamera}>
        {isCameraOff ? <FaVideoSlash /> : <FaVideo />}
      </button>

      <button className="end-call" onClick={endMeeting}>
        <FaPhoneSlash />
      </button>

      <button className="screen-share" onClick={toggleScreenShare}>
        <FaDesktop />
      </button>

      <button className="chat-toggle" onClick={toggleChat}>
         <FaComments />
      </button>
    </div>
  );
}

export default MeetingControls;
