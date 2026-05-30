import { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.fullname?.charAt(0).toUpperCase()}
        </div>

        <div>
          <h2>My Profile</h2>
          <p>Manage your personal account details.</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-row">
          <span>Full Name</span>
          <strong>{user?.fullname}</strong>
        </div>

        <div className="profile-row">
          <span>Email</span>
          <strong>{user?.email}</strong>
        </div>

        <div className="profile-row">
          <span>User ID</span>
          <strong>{user?.id}</strong>
        </div>
      </div>
    </div>
  );
}

export default Profile;