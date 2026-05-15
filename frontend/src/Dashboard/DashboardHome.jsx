import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function DashboardHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [meetingId, setMeetingId] = useState("");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [hideError, setHideError] = useState(false);

  useEffect(() => {
    if(storedUser){     
      setUser(storedUser);
    }
  }, []);

  const createMeeting = async () => {
    const meetingId =
      "TF-" +
      Math.floor(1000 + Math.random() * 9000) +
      "-" +
      Math.random().toString(36).substring(2, 4).toUpperCase();

      await fetch("http://localhost:5000/api/meeting/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingId,
          userId: storedUser.id
        })
      });

    navigate(`/dashboard/meeting/${meetingId}`);
  };

  const joinMeeting = async () => {
    setError("");

    if(!meetingId.trim()) {
      setError("Please enter meeting code");
      setHideError(false);

      setTimeout(() => {
        setHideError(true);
      }, 2000);

      setTimeout(() => {
        setError("");
      }, 2300);

      return;
    }

    await fetch("http://localhost:5000/api/meeting/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meetingId,
        userId: storedUser.id
      })
    });

    navigate(`/dashboard/meeting/${meetingId}`);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch(
        `http://localhost:5000/api/meeting/${storedUser.id}`
      );

      const data = await res.json();
      setHistory(data);
    };

  fetchHistory();
  }, []);
  
  return (
    <div className="dashboardhome">

        <h1>Welcome back, {user?.fullname} 👋</h1>
        <p>Start a new meeting or join an existing one instantly.</p>

        {
          error && (
            <div className={`message-box error-message ${hideError ? "hide" : ""}`}>
              {error}
            </div>
          )
        }

        <div className="actions">
          <div className="newmit">
            <button onClick={createMeeting}>+ Start New Meeting</button>
          </div>

          <div className="joinexistingmeet">
            <input type="text" placeholder="Enter Meeting ID" value={meetingId}onChange={(e) => setMeetingId(e.target.value)} />
            <button className="submit" onClick={joinMeeting}>Join Meeting</button>
          </div>
        </div>

        <div className="recent-section">
          <h3>Recent Meetings</h3>
    
          {
            history.map((item) => (
            <div className="meeting-card" key={item._id}>
              <p><strong>ID:</strong> {item.meetingId}</p>
              <p>{new Date(item.date).toLocaleString()}</p>

              <button onClick={() => navigate(`/dashboard/meeting/${item.meetingId}`)}>
                Rejoin
              </button>
            </div>
            ))
          }
        </div>

    </div>
  )
}

export default DashboardHome