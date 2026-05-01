// landing/LandingLayout.jsx
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function LandingLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default LandingLayout;