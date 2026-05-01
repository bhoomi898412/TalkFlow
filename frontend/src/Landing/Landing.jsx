import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  return (
    <div>

      {/* Hero */}
      <section className="hero">
        <h1>Premium Video Meetings for Everyone</h1>
        <p>Fast, secure, and crystal clear meetings anytime.</p>
        <button className="btn big" onClick={() => navigate("/login")}>Start Meeting</button>
      </section>

      {/* How it Works */}
      <section className="steps">
        <h2>How It Works</h2>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Create Meeting</h3>
            <p>Start a meeting instantly with one click.</p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Share Link</h3>
            <p>Invite others by simply sharing the link.</p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Start Talking</h3>
            <p>Enjoy smooth and secure conversations.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2>Trusted by Professionals</h2>

        <div className="testimonial-grid">

          <div className="testimonial-card">
            <img src="https://i.pravatar.cc/100?img=5" />
            <h4>Anjali Mehta</h4>
            <span>Product Manager</span>
            <p>"The video quality is amazing. Way better experience!"</p>
          </div>

          <div className="testimonial-card">
            <img src="https://i.pravatar.cc/100?img=8" />
            <h4>Rahul Sharma</h4>
            <span>UI Designer</span>
            <p>"Clean UI and super fast meetings. Love it!"</p>
          </div>

          <div className="testimonial-card">
            <img src="https://i.pravatar.cc/100?img=12" />
            <h4>Arjun Patel</h4>
            <span>Developer</span>
            <p>"Lightweight and powerful. Perfect for daily use."</p>
          </div>

        </div>
      </section>

    </div>
  );
}

export default Landing;