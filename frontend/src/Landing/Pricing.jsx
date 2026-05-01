import { useNavigate } from "react-router-dom";

function Pricing() {
    const navigate = useNavigate();

    return (
        <div className="page">
          <div className="pricinghero">
            <h1>Simple & Transparent Pricing</h1>
            <p>Choose the plan that fits your needs. No hidden charges, cancel anytime.</p>

            <div className="pricinglist">
                <ul className="pricelistitem">
                    <li className="pricelistcard"><h3>Free Plan</h3>

                        <h4>₹0 / month</h4>
                        <p>Perfect for individuals getting started with online meetings.</p>

                        <h4 >Features:</h4>
                        <ul>
                            <li>Up to 40 minutes per meeting</li>
                            <li>HD video & audio</li>
                            <li>Screen sharing</li>
                            <li>Basic chat support</li>
                        </ul>

                        <button className="btn" onClick={() => navigate("/login")}>Get Started</button>
                    </li>

                    <li className="pricelistcard"><h3>Pro Plan (Most Popular)</h3>

                        <h4>₹499 / month</h4>
                        <p>Ideal for professionals and small teams.</p>

                        <h4>Features:</h4>
                        <ul>
                            <li>Unlimited meeting duration</li>
                            <li>Full HD video quality</li>
                            <li>Screen sharing</li>
                            <li>Advanced chat features</li>
                            <li>Priority support</li>
                        </ul>

                        <button className="btn">Get Started</button>
                    </li>

                    <li className="pricelistcard"><h3>Business Plan</h3>

                        <h4>₹999 / month</h4>
                        <p>Built for teams and organizations that need more control.</p>

                        <h4>Features:</h4>
                        <ul>
                            <li>Everything in Pro</li>
                            <li>Team management tools</li>
                            <li>Admin dashboard</li>
                            <li>Dedicated support</li>
                            <li>Enhanced security controls</li>
                        </ul>

                        <button className="btn">Get Started</button>
                    </li>
                </ul>
            </div>
          </div>

          <div>
            <h3>Not sure which plan is right for you?</h3>
            <h4>Start with our free plan and upgrade anytime as your needs grow.</h4>
            <button className="btn big" onClick={() => navigate("/login")}>Get Started for Free</button>
          </div>
        </div>
    );
}

export default Pricing