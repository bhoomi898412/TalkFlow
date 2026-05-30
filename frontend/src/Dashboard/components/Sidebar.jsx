import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>TalkFlow</h2>
      
      <div className="mainnavigation">
        <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/dashboard/future-meetings">Future Meetings</Link></li>
            <li><Link to="/dashboard/chats">Chats</Link></li>
            <li><Link to="/dashboard/profile">Profile</Link></li>
        </ul>
      </div>

      <div className="secondarynavigation">
        <ul>
            <li>❓ <Link to="/dashboard/help">Help / Support</Link></li>
        </ul>
      </div>
    </div>
  )
}

export default Sidebar