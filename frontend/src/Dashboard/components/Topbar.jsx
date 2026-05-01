import { useNavigate } from "react-router-dom";

function Topbar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="topbar">
      <h3>Dashboard</h3>

      <div className="topbar-right">
        <span>User Name</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  )
}
 
export default Topbar