function ChatPanel({
  messages,
  message,
  setMessage,
  sendMessage,
  isChatOpen,
  setIsChatOpen,
}) {
  if (!isChatOpen) return null;

  return (
    <div className="chat-modal-backdrop" onClick={() => setIsChatOpen(false)}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>

        <div className="chat-modal-header">
          <div>
            <p>Live meeting</p>
            <h3>Chat</h3>
          </div>

          <button
            type="button"
            className="chat-close"
            onClick={() => setIsChatOpen(false)}
          >
            x
          </button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty-state">
              <h4>No messages yet</h4>
              <p>Start the conversation for this meeting.</p>
            </div>
          ) : (
            messages.map((item) => (
              <div
                className={`chat-message ${item.isOwn ? "own-message" : ""}`}
                key={item._id || item.id}
              >
                <span>{item.isOwn ? "You" : item.senderName}</span>
                <p>{item.message}</p>
              </div>
            ))
          )}
        </div>

        <form className="chat-form" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Write a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            autoFocus
          />

          <button type="submit">Send</button>
        </form>
        
      </div>
    </div>
  );
}

export default ChatPanel;