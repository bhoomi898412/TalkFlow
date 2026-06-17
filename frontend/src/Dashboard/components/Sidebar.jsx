import { Link } from "react-router-dom";
import { useState } from "react";

function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="sidebar">
      <h2>TalkFlow</h2>

      <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
        ☰ Menu
      </button>
       
      {menuOpen && (
         <div
           className="mobile-overlay"
           onClick={() => setMenuOpen(false)}
         />
      )}

      <div className={`mobile-nav ${menuOpen ? "open" : ""}`}>
        <ul>
            <li><Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
            <li><Link to="/dashboard/future-meetings" onClick={() => setMenuOpen(false)}>Future Meetings</Link></li>
            <li><Link to="/dashboard/chats" onClick={() => setMenuOpen(false)}>Chats</Link></li>
            <li><Link to="/dashboard/profile" onClick={() => setMenuOpen(false)}>Profile</Link></li>
        </ul>

        <div className="secondarynavigation">
          <ul>
              <li>❓ <Link to="/dashboard/help" onClick={() => setMenuOpen(false)}>Help / Support</Link></li>
          </ul>
        </div>
      </div>

    </div>
  )
}

export default Sidebar