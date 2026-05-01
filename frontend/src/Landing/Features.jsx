import { useNavigate } from "react-router-dom";

function Features() {
    const navigate = useNavigate();

    return (
        <>
            <div className="page">
                <div className="featurehero">
                    <h1>Premium Features Built for Seamless <br></br> Communication</h1>
                    <p>Everything you need to connect, collaborate, and communicate without limits.</p>
                
                    <div className="featurelist">
                        <ul>
                            <li><h3>HD Video & Audio</h3>
                                Experience high-definition video and ultra-clear audio, even on low bandwidth. Every conversation feels natural and uninterrupted.
                            </li>
                            
                            <li><h3>Screen Sharing</h3>
                                Present ideas, demo projects, or collaborate in real-time by sharing your screen with just one click.
                            </li>

                            <li><h3>Real-Time Chat</h3>
                                Send messages, links, and quick updates without interrupting the flow of conversation.
                            </li>

                            <li><h3>Secure & Private</h3>
                                With end-to-end encryption and secure meeting links, your data and conversations are always protected.
                            </li>

                            <li><h3>Fast & Reliable Performance</h3>
                                Optimized for smooth performance across devices, ensuring lag-free meetings every time.
                            </li>

                            <li><h3>Join from Anywhere</h3>
                                Join meetings from mobile, desktop, or browser — no downloads required.
                            </li>
                        </ul>
                    </div>
                </div>

                <div>
                    <h3>Start Smarter Meetings Today</h3>
                    <h4>Join thousands of users who trust TalkFlow for their daily communication.</h4>
                    <button className="btn big" onClick={() => navigate("/login")}>Get Started for Free</button>
                </div>
            </div>
        </>
    )
}

export default Features