import { useParams } from "react-router-dom";

import ChatPanel from "./components/MeetingRoom/ChatPanel";
import MeetingControls from "./components/MeetingRoom/MeetingControls";
import PresenterView from "./components/MeetingRoom/PresenterView";
import VideoGrid from "./components/MeetingRoom/VideoGrid";
import useMeetingRoom from "./hooks/useMeetingRoom";

function MeetingRoom() {
  const { meetingId } = useParams();

  const {
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
  } = useMeetingRoom(meetingId);

  return (
    <div className="meeting-room">
      <div className="meeting-header">
        <h2>Meeting ID: {meetingId}</h2>
      </div>

      <div className="meeting-body">
        <div
          className={
            activePresenterId ? "meeting-layout presenter-mode" : "meeting-layout"
          }
        >
          {activePresenterId ? (
            <PresenterView
              presenterIsLocal={presenterIsLocal}
              presenterStream={presenterStream}
              videoRef={videoRef}
              otherRemoteEntries={otherRemoteEntries}
            />
          ) : (
            <VideoGrid
              gridClass={gridClass}
              videoRef={videoRef}
              remoteStreams={remoteStreams}
            />
          )}

          <MeetingControls
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            isScreenShare={isScreenShare}
            messagesCount={messages.length}
            toggleMute={toggleMute}
            toggleCamera={toggleCamera}
            endMeeting={endMeeting}
            toggleScreenShare={toggleScreenShare}
            toggleChat={() => setIsChatOpen((prev) => !prev)}
          />

          <ChatPanel
            messages={messages}
            message={message}
            setMessage={setMessage}
            sendMessage={sendMessage}
            isChatOpen={isChatOpen}
            setIsChatOpen={setIsChatOpen}
          />
        </div>
      </div>
    </div>
  );
}

export default MeetingRoom;
