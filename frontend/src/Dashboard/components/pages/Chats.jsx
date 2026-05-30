import { useEffect, useMemo, useState } from "react";

function Chats() {
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [meetings, setMeetings] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!storedUser?.id) return;

      try {
        setLoadingMeetings(true);

        const res = await fetch(
          `http://localhost:5000/api/chat/user/${storedUser.id}`
        );

        const data = await res.json();
        setMeetings(data);
      } catch (error) {
        console.log("Error fetching chat meetings", error);
      } finally {
        setLoadingMeetings(false);
      }
    };

    fetchMeetings();
  }, []);

  const filteredMeetings = useMemo(() => {
  const value = searchText.trim().toLowerCase();

  if (!value) {
    return meetings;
  }

  return meetings.filter((meeting) => {
    const meetingId = meeting.meetingId?.toLowerCase() || "";
    const hostName = meeting.hostName?.toLowerCase() || "";

    return meetingId.includes(value) || hostName.includes(value);
  });
}, [meetings, searchText]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedMeetingId) return;

      try {
        setLoadingMessages(true);

        const res = await fetch(
          `http://localhost:5000/api/chat/meeting/${selectedMeetingId}`
        );

        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.log("Error fetching chat messages", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedMeetingId]);

  const handleSelectMeeting = (meetingId) => {
    setSelectedMeetingId(meetingId);
  };

  return (
    <div className="dashboard-chats-page">
      <div className="chat-list-panel">
        <div className="chat-list-title">
          <p>Meeting conversations</p>
          <h2>Chats</h2>
        </div>

        <input
          className="chat-search-input"
          type="text"
          placeholder="Search by meeting ID or host name"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
        />

        <div className="chat-meeting-list">
          {loadingMeetings ? (
            <div className="chat-empty-state">
              <h4>Loading...</h4>
              <p>Fetching your meetings.</p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="chat-empty-state">
              <h4>No match found</h4>
              <p>Try another meeting ID or host name.</p>
            </div>
          ) : (
            filteredMeetings.map((meeting) => (
              <button
                className={`chat-meeting-item ${
                  selectedMeetingId === meeting.meetingId ? "active" : ""
                }`}
                key={meeting.meetingId}
                onClick={() => handleSelectMeeting(meeting.meetingId)}
              >
                <strong>{meeting.meetingId}</strong>
                <span>{meeting.hostName}</span>
                <small>{new Date(meeting.date).toLocaleString()}</small>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="chat-history-panel">
        <div className="chat-history-header">
          <div>
            <p>Conversation</p>
            <h2>{selectedMeetingId || "Select a meeting"}</h2>
          </div>
        </div>

        <div className="chat-history-messages">
          {!selectedMeetingId ? (
            <div className="chat-empty-state">
              <h4>No meeting selected</h4>
              <p>Search and choose a meeting to view its chat.</p>
            </div>
          ) : loadingMessages ? (
            <div className="chat-empty-state">
              <h4>Loading...</h4>
              <p>Fetching messages.</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty-state">
              <h4>No messages</h4>
              <p>This meeting does not have chat messages yet.</p>
            </div>
          ) : (
            messages.map((item) => (
              <div
                className={`chat-message ${
                  item.senderId === storedUser?.id ? "own-message" : ""
                }`}
                key={item._id}
              >
                <span>
                  {item.senderId === storedUser?.id ? "You" : item.senderName}
                </span>
                <p>{item.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Chats;