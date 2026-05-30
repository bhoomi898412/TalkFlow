import { Routes, Route } from "react-router-dom";
import "./dashboardpagestyle.css";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import DashboardHome from "./DashboardHome";
import MeetingRoom from "./MeetingRoom";
import History from "./History";

import FutureMeetings from "./components/pages/FutureMeetings";
import Chats from "./components/pages/Chats";
import Profile from "./components/pages/Profile";
import Help from "./components/pages/Help";

function DashboardPageWrapper() {
    return (
    <div className="dashboard-layout">
      
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="meeting/:meetingId" element={<MeetingRoom />} />
          <Route path="history" element={<History />} />
          <Route path="future-meetings" element={<FutureMeetings />} />
          <Route path="chats" element={<Chats />} />
          <Route path="profile" element={<Profile />} />
          <Route path="help" element={<Help />} />
        </Routes>

      </div>
    </div>
  );
}

export default DashboardPageWrapper