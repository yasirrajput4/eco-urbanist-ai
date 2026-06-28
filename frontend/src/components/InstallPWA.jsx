import { useState, useEffect, useRef } from "react"; // 🔧 Fixed: Added useRef
import { Download, X, Smartphone, Zap, Wifi } from "lucide-react";

const InstallPWA = () => {
  // 🔧 Fixed: Used useRef instead of useState for deferredPrompt to prevent extra re-renders
  const deferredPromptRef = useRef(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed or dismissed
    const isDismissed = localStorage.getItem("pwa-install-dismissed");
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;

    if (isDismissed || isStandalone) {
      return;
    }

    let timerId; // 🔧 Added timer cleanup variable just in case

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e; // 🔧 Fixed: Assigned to ref instead of state

      // Show custom prompt after 3 seconds
      timerId = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      if (timerId) clearTimeout(timerId); // Cleanup timer if component unmounts early
    };
  }, []);

  const handleInstall = async () => {
    // 🔧 Fixed: Reading from ref.current
    if (!deferredPromptRef.current) {
      return;
    }

    deferredPromptRef.current.prompt();
    const { outcome } = await deferredPromptRef.current.userChoice;

    if (outcome === "accepted") {
      console.log("PWA installed");
    }

    deferredPromptRef.current = null; // 🔧 Fixed: Clear ref
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50 animate-slideUp">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-500 p-6 relative">
        {/* Close Button */}
        {/* 🔧 Fixed: Added type="button" and aria-label for better accessibility */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close installation prompt"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl mr-4">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900">
              Install Eco-Urbanist AI
            </h3>
            <p className="text-sm text-gray-600">Get the app experience</p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-gray-700">
            <Zap className="w-4 h-4 text-green-600 mr-2" />
            <span className="font-semibold">Faster loading & performance</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <Wifi className="w-4 h-4 text-green-600 mr-2" />
            <span className="font-semibold">Works offline</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <Download className="w-4 h-4 text-green-600 mr-2" />
            <span className="font-semibold">Install on home screen</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* 🔧 Fixed: Added type="button" */}
          <button
            type="button"
            onClick={handleDismiss}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Maybe Later
          </button>
          {/* 🔧 Fixed: Added type="button" */}
          <button
            type="button"
            onClick={handleInstall}
            className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Install Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
