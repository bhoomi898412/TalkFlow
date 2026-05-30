function VideoGrid({ gridClass, videoRef, remoteStreams }) {
  return (
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
  );
}

export default VideoGrid;
