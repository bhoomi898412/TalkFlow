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
      <button onClick={toggleMute}>{isMuted ? "Unmute" : "Mute"}</button>

      <button onClick={toggleCamera}>
        {isCameraOff ? "Open Camera" : "Close Camera"}
      </button>

      <button className="end-call" onClick={endMeeting}>
        End Meeting
      </button>

      <button className="screen-share" onClick={toggleScreenShare}>
        {isScreenShare ? "Stop Sharing" : "Screen Share"}
      </button>

      <button className="chat-toggle" onClick={toggleChat}>
        Chat {messagesCount > 0 ? `(${messagesCount})` : ""}
      </button>
    </div>
  );
}

export default MeetingControls;
