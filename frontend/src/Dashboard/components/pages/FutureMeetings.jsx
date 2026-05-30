import { useEffect, useState } from "react";

function FutureMeetings() {
    const [isFormOpen , setIsFormOpen] = useState(false);
    const [futureMeetings, setFutureMeetings] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
      const fetchFutureMeetings = async () => {
        try {
          const storedUser = JSON.parse(localStorage.getItem("user"));
        
          const response = await fetch(
            `http://localhost:5000/api/future-meetings/${storedUser.id}`
          );
        
          const data = await response.json();
        
          if (!response.ok) {
            setError(data.message);
            return;
          }
        
          setFutureMeetings(data);
        } catch (error) {
          console.log(error);
          setError("Something went wrong");
        }
      };
    
      fetchFutureMeetings();
    }, []);

    const generateMeetingId = () => {
      return (
        "TF-" +
        Math.floor(1000 + Math.random() * 9000) +
        "-" +
        Math.random().toString(36).substring(2, 4).toUpperCase()
      );
    };

    const getInitialFormData = () => ({
      title: "",
      description: "",
      scheduledDate: "",
      scheduledTime: "",
      meetingId: generateMeetingId(),
    });
    const [formData , setFormData] = useState(getInitialFormData());

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
          ...formData,
          [name]: value,
        });
    }

    const handleSubmit = async  (e) => {
      e.preventDefault();
      if (!formData.title.trim() || !formData.scheduledDate || !formData.scheduledTime || !formData.description) {
        setError("All Fields Are Required!");
        return;
      }
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
              
        const response = await fetch("http://localhost:5000/api/future-meetings/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            userId: storedUser.id,
          }),
        });
      
        const data = await response.json();
      
        if (!response.ok) {
          setError(data.message);
          return;
        }
      
        setFutureMeetings([...futureMeetings, data.futureMeeting]);
        setFormData(getInitialFormData());
        setIsFormOpen(false);
      } catch (error) {
        setError("Something went wrong");
      }
    };
  
    const handleOpenForm = () => {
      setError("");
      setFormData(getInitialFormData());
      setIsFormOpen(true);
    };

    const handleCloseForm = () => {
      setError("");
      setFormData(getInitialFormData());
      setIsFormOpen(false);
    };

    return(
        <div className="future-meetings-page">
          <div className="future-meetings-header">
            <div>
              <h2>Future Meetings</h2>
              <p>Schedule and manage your upcoming meetings.</p>
            </div>
              
            <button className="future-meeting-add-btn" onClick={handleOpenForm}>
              + Add New Meeting
            </button>
          </div>

          {error && <p className="future-meeting-error">{error}</p>}

          {isFormOpen && (
            <form className="future-meeting-form-card future-meeting-form" onSubmit={handleSubmit}>
              <div className="future-meeting-form-top">
                <h3>Schedule a New Meeting</h3>
                <button type="button" className="future-meeting-close-btn" onClick={handleCloseForm}>Close</button>
              </div>

              <input name="title" type="text" placeholder="Meeting title" 
              value={formData.title} 
              onChange={handleChange}/>

              <textarea name="description" placeholder="Meeting description" 
              value={formData.description} 
              onChange={handleChange}/>

              <input
                name="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                onKeyDown={(e) => e.preventDefault()}
                onFocus={(e) => e.target.showPicker?.()}
                onClick={(e) => e.target.showPicker?.()}
              />
                        
              <input
                name="scheduledTime"
                type="time"
                value={formData.scheduledTime}
                onChange={handleChange}
                step="300"
                onKeyDown={(e) => e.preventDefault()}
                onFocus={(e) => e.target.showPicker?.()}
                onClick={(e) => e.target.showPicker?.()}
              />

              <input name="meetingId" type="text" placeholder="Meeting ID" 
              value={formData.meetingId} 
              onChange={handleChange} readOnly/>

              <button type="submit" className="future-meeting-save-btn">Save Meeting</button>
            </form>
           )}

           <div className="future-meeting-list-card">
              <h3>Scheduled Meetings</h3>

              {futureMeetings.length === 0 ? (
                <p className="future-meeting-empty">No meetings scheduled yet</p>
              ) : (
                futureMeetings.map((meeting, index) => (
                  <div className="future-meeting-item" key={index}>
                    <div>
                      <h4>{meeting.title}</h4>
                      <p>{meeting.description}</p>
                    </div>
                                  
                    <div className="future-meeting-meta">
                      <strong>{meeting.meetingId}</strong>
                      <span>
                        {new Date(meeting.scheduledDate).toLocaleDateString()} at {meeting.scheduledTime}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
        </div>
    )
}

export default FutureMeetings;