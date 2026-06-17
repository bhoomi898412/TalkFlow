function VideoGrid({ videoRef, remoteStreams }) {

 return (

  <div className="meeting-stage">
    <div className="remote-grid">

      {Object.entries(remoteStreams).map(([socketId, stream], index) => (
        <div className="remote-tile" key={socketId}>
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
          <div className="video-label">
            Participant {index + 1}
          </div>
        </div>
      ))}

      {Object.keys(remoteStreams).length === 0 && (
        <div className="remote-tile">
          <video
            className="video-card local-video"
            ref={videoRef}
            autoPlay
            playsInline
            muted
          />
          <div className="video-label">
            You
          </div>
        </div>
      )}

    </div>
    
    {Object.keys(remoteStreams).length > 0 && (
      <div className="local-preview">
        <video
          className="video-card local-video"
          ref={videoRef}
          autoPlay
          playsInline
          muted
        />
        <div className="video-label">
          You
        </div>
      </div>
    )}
  </div>
  );
}

export default VideoGrid;