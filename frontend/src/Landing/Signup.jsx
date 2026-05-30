import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if(password !== confirmPassword){
      setMessage("Passwords do not match");
      return;
    }

    if(password.length < 6){
      setMessage("Password must be at least 6 characters");
      return; 
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            fullname,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if(!response.ok){
        setMessage(data.message);
        return;
      }

      if(response.ok){
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
        navigate("/dashboard");
      }
    }catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
    setLoading(false);
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-box">

        <h2>Create Your Account</h2>
        <p>Join TalkFlow and start seamless video meetings in seconds.</p>

        {
          message && (
            <div className="message-box">
              {message}
            </div>
          )
        }

        <label htmlFor="fullname">Full Name</label>
        <input type="text" id="fullname" placeholder="Enter your full name" value={fullname} onChange={(e) => setFullname(e.target.value)}/>

        <label htmlFor="email">Email</label>
        <input type="email" id="email" placeholder="abc@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)}/>

        <label htmlFor="password">Password</label>
        <input type="password" id="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)}/>

        <label htmlFor="confirm">Confirm Password</label>
        <input type="password" id="confirm" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>

        <p className="hint">Password must be at least 6 characters</p>

        <button type="submit" className="btn" onClick={handleSignup}>{loading ? "signing in..." : "Signup"}</button>

        <p className="login-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <div className="divider">OR</div>

        <button className="social-btn google">Continue with Google</button>
        <button className="social-btn github">Continue with GitHub</button>

      </div>
    </div>
  );
}

export default Signup;