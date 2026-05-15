import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Topbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    if(storedUser){     
      setUser(storedUser);
    }
  }, []);

  return (
    <div className="topbar">
      <h3>Dashboard</h3>

      <div className="topbar-right">
        <span>{user?.fullname}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  )
}
 
export default Topbar