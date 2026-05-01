import { Routes, Route } from "react-router-dom";
import LandingLayout from "./LandingLayout";
import "./landingpagestyle.css";

import Landing from "./Landing";
import Features from "./Features";
import Pricing from "./Pricing";
import Login from "./Login";
import Signup from "./Signup";
import Support from "./Support";

function LandingPageWrapper() {
    return (
      <LandingLayout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/support" element={<Support />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
      </LandingLayout>
    )
}

export default LandingPageWrapper