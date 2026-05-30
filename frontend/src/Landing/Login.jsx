import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hideError, setHideError] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if(!response.ok){
        setError(data.message);
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      navigate("/dashboard");
    }catch (error) {
      setError("Something went wrong");
      setHideError(false);

      setTimeout(() => {
        setHideError(true);
      }, 2000);

      setTimeout(() => {
        setError("");
      }, 2300);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome Back</h2>
        <p>Sign in to continue</p>

        {
          error && (
            <div className={`message-box error-message ${hideError ? "hide" : ""}`}>
              {error}
            </div>
          )
        }

        <label htmlFor="email">Email</label>
        <input type="email" id="email" placeholder="abc@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)}/>

        <label htmlFor="pass">Password</label>
        <input type="password" id="pass" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)}/>

        <button type="submit" className="btn" onClick={handleLogin}>{loading ? "Logging in..." : "Login"}</button>

        <p className="signup-text">
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;