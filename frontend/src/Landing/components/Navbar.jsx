import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/"><h2>TalkFlow</h2></NavLink>
      <div>
        <NavLink  to="/features" className={({ isActive }) => isActive ? "active" : ""}>Features</NavLink >
        <NavLink  to="/pricing" className={({ isActive }) => isActive ? "active" : ""}>Pricing</NavLink >
        <NavLink  to="/support" className={({ isActive }) => isActive ? "active" : ""}>Support</NavLink >
        <NavLink  to="/login" className={({ isActive }) => isActive ? "active" : ""}>Login</NavLink >
        <NavLink to="/signup" className={({ isActive }) => isActive ? "active" : ""}>Signup</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;