import { useState, useEffect, useRef } from "react"; // 🔧 FIX: added useRef to guard one-time navigation
import Joyride, { STATUS } from "react-joyride";
import { useLocation, useNavigate } from "react-router-dom";

const OnboardingTour = ({ run, onFinish }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const hasRedirected = useRef(false); // 🔧 FIX: track whether we've already redirected for this tour run

  // 🔧 FIX: Original effect re-ran on every location change while `run`
  // was true, repeatedly calling navigate("/upload") — forcing the user
  // back to /upload any time they navigated elsewhere (e.g. /gallery)
  // during the tour, and re-triggering on every location update.
  // Now it only redirects once, right when the tour starts.
  useEffect(() => {
    if (run && !hasRedirected.current) {
      hasRedirected.current = true;
      if (location.pathname !== "/upload") {
        navigate("/upload");
      }
    }

    // Reset the guard once the tour stops, so it can redirect again
    // next time the tour is started.
    if (!run) {
      hasRedirected.current = false;
    }
  }, [run, location, navigate]);

  const steps = [
    {
      target: "body",
      content: (
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">
            👋 Welcome to Eco-Urbanist AI!
          </h2>
          <p className="text-gray-700 text-lg mb-4">
            Transform satellite images into green urban spaces using AI. Let's
            take a quick tour!
          </p>
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-800 font-semibold">
              ✨ This tour takes only 30 seconds
            </p>
          </div>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: ".upload-zone",
      content: (
        <div>
          <h3 className="text-xl font-black text-gray-900 mb-2">
            📤 Step 1: Upload Your Image
          </h3>
          <p className="text-gray-700 mb-3">
            Drag & drop a satellite or aerial image here, or click to browse
            your files.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Use Google Maps satellite view
              screenshots for best results!
            </p>
          </div>
        </div>
      ),
      placement: "bottom",
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: "body",
      content: (
        <div>
          <h3 className="text-xl font-black text-gray-900 mb-2">
            🤖 Step 2: Generate Green Spaces
          </h3>
          <p className="text-gray-700 mb-3">
            After uploading an image, you'll see a{" "}
            <strong className="text-green-600">
              "Generate Green Visualization"
            </strong>{" "}
            button.
          </p>
          <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded mb-3">
            <p className="text-sm text-purple-800">
              ⚡ Processing takes 20-60 seconds
            </p>
          </div>
          <p className="text-sm text-gray-600">
            Click that button to let AI transform your image with trees and
            green spaces!
          </p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: "body",
      content: (
        <div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">
            🎉 You're All Set!
          </h3>
          <p className="text-gray-700 text-lg mb-4">
            After generation, you'll see:
          </p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start">
              <span className="text-green-500 mr-2 text-xl">✓</span>
              <span className="text-gray-700">
                Before/After comparison slider
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 text-xl">✓</span>
              <span className="text-gray-700">Green coverage statistics</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 text-xl">✓</span>
              <span className="text-gray-700">
                Environmental impact analysis
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 text-xl">✓</span>
              <span className="text-gray-700">Download enhanced image</span>
            </li>
          </ul>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl text-center">
            <p className="font-bold text-lg">
              Ready to create green cities? 🌳
            </p>
          </div>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status, action, index, type } = data;

    // Handle all completion scenarios
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      onFinish();
    }

    // Update step index
    if (type === "step:after") {
      setStepIndex(index + (action === "next" ? 1 : -1));
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      stepIndex={stepIndex}
      callback={handleJoyrideCallback}
      disableScrolling={true}
      styles={{
        options: {
          primaryColor: "#22c55e",
          textColor: "#1f2937",
          width: 450,
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 16,
          padding: 24,
        },
        buttonNext: {
          backgroundColor: "#22c55e",
          borderRadius: 12,
          padding: "12px 24px",
          fontWeight: "bold",
          fontSize: 16,
        },
        buttonBack: {
          color: "#6b7280",
          marginRight: 12,
          fontWeight: "bold",
        },
        buttonSkip: {
          color: "#ef4444",
          fontWeight: "bold",
        },
      }}
      locale={{
        back: "← Back",
        close: "Close",
        last: "Done! 🎉",
        next: "Next →",
        skip: "Skip Tour",
      }}
    />
  );
};

export default OnboardingTour;
