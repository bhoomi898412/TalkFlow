function PresenterView({
  presenterIsLocal,
  presenterStream,
  videoRef,
  otherRemoteEntries,
  localStreamRef,
}) {
  return (
    <>
      <div className="presenter-stage">
        {presenterIsLocal ? (
          <div className="video-tile presenter-tile">
            <video
              className="video-card presenter-video"
              ref={videoRef}
              autoPlay
              playsInline
              muted
            />
            <div className="video-label">You are sharing</div>
          </div>
        ) : (
          <div className="video-tile presenter-tile">
            <video
              className="video-card presenter-video"
              autoPlay
              playsInline
              ref={(el) => {
                if (el && presenterStream) {
                  el.srcObject = presenterStream;
                }
              }}
            />
            <div className="video-label">Presenting</div>
          </div>
        )}
      </div>

      <div className="participant-strip">
        {!presenterIsLocal && (
          <div className="video-tile small-tile">
            <video
              className="video-card local-video"
              ref={(el) => {
                if (el && localStreamRef.current) {
                  el.srcObject = localStreamRef.current;
                }
              }}
              autoPlay
              playsInline
              muted
            />
            <div className="video-label">You</div>
          </div>
        )}

        {otherRemoteEntries.map(([socketId, stream], index) => (
          <div className="video-tile small-tile" key={socketId}>
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
    </>
  );
}

export default PresenterView;
