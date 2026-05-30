import { useState } from "react";

function Help() {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.message.trim()) {
      setError("Please fill all fields");
      setTimeout(() => {
        setError("");
      }, 2500);
      setSuccessMessage("");
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));

      if (!storedUser) {
        setError("Please login first");
        setTimeout(() => {
          setError("");
        }, 2500);
        setSuccessMessage("");
        return;
      }

      const response = await fetch("http://localhost:5000/api/support/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: storedUser.id,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        setTimeout(() => {
          setError("");
        }, 2500);
        setSuccessMessage("");
        return;
      }

      setError("");
      setSuccessMessage(data.message);

      setTimeout(() => {
        setSuccessMessage("");
      }, 2500);

      setFormData({
        subject: "",
        message: "",
      });
    } catch (error) {
      console.log(error);
      setError("Something went wrong");
      setTimeout(() => {
        setError("");
      }, 2500);
      setSuccessMessage("");
    }
  };

  return (
    <div className="help-page">
      <div className="help-header">
        <h2>Help & Support</h2>
        <p>Find quick answers or send a support request.</p>
      </div>

      <div className="help-grid">
        <div className="help-card">
          <h3>Common Issues</h3>

          <div className="help-item">
            <h4>Camera is not working</h4>
            <p>Allow camera permission from your browser settings and rejoin the meeting.</p>
          </div>

          <div className="help-item">
            <h4>Microphone is muted</h4>
            <p>Check browser microphone permission and make sure your device mic is selected.</p>
          </div>

          <div className="help-item">
            <h4>Unable to join meeting</h4>
            <p>Check the meeting ID, internet connection, and try refreshing the dashboard.</p>
          </div>
        </div>

        <div className="help-card">
          <h3>Quick Tips</h3>

          <ul className="help-tips">
            <li>Use a stable internet connection before joining a call.</li>
            <li>Close unused browser tabs for better video quality.</li>
            <li>Share the correct TalkFlow meeting ID with participants.</li>
            <li>Use headphones to reduce echo during meetings.</li>
          </ul>
        </div>
      </div>

      <form className="help-form-card" onSubmit={handleSubmit}>
        <h3>Contact Support</h3>

        {error && <p className="help-error">{error}</p>}
        {successMessage && <p className="help-success">{successMessage}</p>}

        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
        />

        <textarea
          name="message"
          placeholder="Describe your issue"
          value={formData.message}
          onChange={handleChange}
        />

        <button type="submit">Send Request</button>
      </form>
    </div>
  );
}

export default Help;