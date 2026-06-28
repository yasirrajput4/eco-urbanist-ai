import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Results from "./pages/Results";
import Gallery from "./pages/Gallery";
import Login from "./pages/Login"; // ADDED
import Signup from "./pages/Signup"; // ADDED
import OnboardingTour from "./components/OnboardingTour";
import InstallPWA from "./components/InstallPWA";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute"; // ADDED
import { AuthProvider } from "./context/AuthContext"; // ADDED

function App() {
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("onboarding-tour-completed");
    if (!hasSeenTour) {
      setTimeout(() => setRunTour(true), 1000);
    }
  }, []);

  const handleTourFinish = () => {
    setRunTour(false);
    localStorage.setItem("onboarding-tour-completed", "true");
  };

  return (
    // ADDED: AuthProvider wraps everything — makes useAuth() available
    // in Navbar (logout, user name) and ProtectedRoute (login guard)
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen relative">
          {/* CHANGED: was an inline 8-prop style object. Now uses
              .leaves-overlay CSS class (add to index.css as above). */}
          <div className="leaves-overlay">
            {/* LEFT SIDE LEAVES */}
            <div
              style={{
                position: "absolute",
                left: "2%",
                top: "-10%",
                fontSize: "2rem",
                animation: "floatLeaf 15s infinite linear",
                animationDelay: "0s",
              }}
            >
              🍃
            </div>
            <div
              style={{
                position: "absolute",
                left: "8%",
                top: "-10%",
                fontSize: "1.5rem",
                animation: "floatLeafReverse 18s infinite linear",
                animationDelay: "3s",
              }}
            >
              🌿
            </div>
            <div
              style={{
                position: "absolute",
                left: "5%",
                top: "-10%",
                fontSize: "2rem",
                animation: "floatLeaf 15s infinite linear",
                animationDelay: "6s",
              }}
            >
              🍀
            </div>
            <div
              style={{
                position: "absolute",
                left: "12%",
                top: "-10%",
                fontSize: "2.5rem",
                animation: "floatLeafReverse 18s infinite linear",
                animationDelay: "2s",
              }}
            >
              🌱
            </div>
            <div
              style={{
                position: "absolute",
                left: "3%",
                top: "-10%",
                fontSize: "2rem",
                animation: "floatLeaf 15s infinite linear",
                animationDelay: "8s",
              }}
            >
              🌾
            </div>
            <div
              style={{
                position: "absolute",
                left: "10%",
                top: "-10%",
                fontSize: "1.8rem",
                animation: "floatLeafReverse 18s infinite linear",
                animationDelay: "5s",
              }}
            >
              🪴
            </div>
            <div
              style={{
                position: "absolute",
                left: "7%",
                top: "-10%",
                fontSize: "1.6rem",
                animation: "floatLeaf 15s infinite linear",
                animationDelay: "10s",
              }}
            >
              🍃
            </div>
            {/* RIGHT SIDE LEAVES */}
            <div
              style={{
                position: "absolute",
                right: "2%",
                top: "-10%",
                fontSize: "2rem",
                animation: "floatLeafReverse 18s infinite linear",
                animationDelay: "1s",
              }}
            >
              🌿
            </div>
            <div
              style={{
                position: "absolute",
                right: "8%",
                top: "-10%",
                fontSize: "1.5rem",
                animation: "floatLeaf 15s infinite linear",
                animationDelay: "4s",
              }}
            >
              🍀
            </div>
            <div
              style={{
                position: "absolute",
                right: "5%",
                top: "-10%",
                fontSize: "2.2rem",
                animation: "floatLeafReverse 18s infinite linear",
                animationDelay: "7s",
              }}
            >
              🌱
            </div>
            <div
              style={{
                position: "absolute",
                right: "12%",
                top: "-10%",
                fontSize: "2rem",
                animation: "floatLeaf 15s infinite linear",
                animationDelay: "2s",
              }}
            >
              🌾
            </div>
            <div
              style={{
                position: "absolute",
                right: "3%",
                top: "-10%",
                fontSize: "1.8rem",
                animation: "floatLeafReverse 18s infinite linear",
                animationDelay: "9s",
              }}
            >
              🪴
            </div>
            <div
              style={{
                position: "absolute",
                right: "10%",
                top: "-10%",
                fontSize: "2.3rem",
                animation: "floatLeaf 15s infinite linear",
                animationDelay: "5s",
              }}
            >
              🍃
            </div>
            <div
              style={{
                position: "absolute",
                right: "7%",
                top: "-10%",
                fontSize: "1.7rem",
                animation: "floatLeafReverse 18s infinite linear",
                animationDelay: "11s",
              }}
            >
              🌿
            </div>
          </div>

          <Navbar />
          <main className="flex-grow relative z-10">
            <ScrollToTop />
            <Routes>
              {/* Public routes — no login needed */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} /> {/* ADDED */}
              <Route path="/signup" element={<Signup />} /> {/* ADDED */}
              {/* ADDED: Protected routes — redirect to /login if not logged in */}
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <Upload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/results"
                element={
                  <ProtectedRoute>
                    <Results />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gallery"
                element={
                  <ProtectedRoute>
                    <Gallery />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />

          <OnboardingTour run={runTour} onFinish={handleTourFinish} />
          <InstallPWA />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
