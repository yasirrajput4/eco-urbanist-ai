import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Results from "./pages/Results";
import Gallery from "./pages/Gallery";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OnboardingTour from "./components/OnboardingTour";
import InstallPWA from "./components/InstallPWA";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("onboarding-tour-completed");
    let timerId;

    if (!hasSeenTour) {
      timerId = setTimeout(() => setRunTour(true), 1000);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  const handleTourFinish = () => {
    setRunTour(false);
    localStorage.setItem("onboarding-tour-completed", "true");
  };

  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen relative overflow-hidden">
          {/* LEAVES OVERLAY (Ab saara inline style gayab) */}
          <div className="leaves-overlay pointer-events-none">
            {/* LEFT SIDE LEAVES */}
            <div className="leaf-item left-[2%] top-[-10%] text-[2rem] animate-float-leaf">
              🍃
            </div>
            <div className="leaf-item left-[8%] top-[-10%] text-[1.5rem] animate-float-leaf-rev [animation-delay:3s]">
              🌿
            </div>
            <div className="leaf-item left-[5%] top-[-10%] text-[2rem] animate-float-leaf [animation-delay:6s]">
              🍀
            </div>
            <div className="leaf-item left-[12%] top-[-10%] text-[2.5rem] animate-float-leaf-rev [animation-delay:2s]">
              🌱
            </div>
            <div className="leaf-item left-[3%] top-[-10%] text-[2rem] animate-float-leaf [animation-delay:8s]">
              🌾
            </div>
            <div className="leaf-item left-[10%] top-[-10%] text-[1.8rem] animate-float-leaf-rev [animation-delay:5s]">
              🪴
            </div>
            <div className="leaf-item left-[7%] top-[-10%] text-[1.6rem] animate-float-leaf [animation-delay:10s]">
              🍃
            </div>

            {/* RIGHT SIDE LEAVES */}
            <div className="leaf-item right-[2%] top-[-10%] text-[2rem] animate-float-leaf-rev [animation-delay:1s]">
              🌿
            </div>
            <div className="leaf-item right-[8%] top-[-10%] text-[1.5rem] animate-float-leaf [animation-delay:4s]">
              🍀
            </div>
            <div className="leaf-item right-[5%] top-[-10%] text-[2.2rem] animate-float-leaf-rev [animation-delay:7s]">
              🌱
            </div>
            <div className="leaf-item right-[12%] top-[-10%] text-[2rem] animate-float-leaf [animation-delay:2s]">
              🌾
            </div>
            <div className="leaf-item right-[3%] top-[-10%] text-[1.8rem] animate-float-leaf-rev [animation-delay:9s]">
              🪴
            </div>
            <div className="leaf-item right-[10%] top-[-10%] text-[2.3rem] animate-float-leaf [animation-delay:5s]">
              🍃
            </div>
            <div className="leaf-item right-[7%] top-[-10%] text-[1.7rem] animate-float-leaf-rev [animation-delay:11s]">
              🌿
            </div>
          </div>

          <Navbar />
          <main className="flex-grow relative z-10">
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
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
