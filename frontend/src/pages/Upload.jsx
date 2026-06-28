import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload as UploadIcon,
  X,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react";
import api from "../services/api";
import { validateImageFile, fileToDataUrl } from "../utils/helpers";

const Upload = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const isGeneratingRef = useRef(false);

  const handleFileSelect = async (selectedFile) => {
    setError(null);

    const validation = validateImageFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setFile(selectedFile);

    try {
      const dataUrl = await fileToDataUrl(selectedFile);
      setPreview(dataUrl);
    } catch (err) {
      setError("Failed to generate preview");
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setProgress(0);
    setStatusMessage("");
    isGeneratingRef.current = false;
  };

  const handleGenerate = async () => {
    if (isGeneratingRef.current) {
      console.warn("⚠️ Generation already in progress");
      return;
    }

    if (!file) {
      setError("Please select an image first");
      return;
    }

    if (isProcessing) {
      console.warn("⚠️ Already processing");
      return;
    }

    isGeneratingRef.current = true;
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setStatusMessage("Initializing...");

    let progressInterval = null;

    try {
      // 🔧 SMOOTH PROGRESS SIMULATION - Updates every 300ms
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          // Cap at 95% until we get response
          if (prev >= 95) {
            setStatusMessage("🤖 AI is analyzing your image... Almost done!");
            return prev;
          }

          // Smooth increment by 1%
          const next = prev + 1;

          // Update status messages based on progress
          if (next <= 10) {
            setStatusMessage("📤 Uploading image to server...");
          } else if (next <= 20) {
            setStatusMessage("🔍 Validating image format...");
          } else if (next <= 35) {
            setStatusMessage("🌍 Detecting buildings and infrastructure...");
          } else if (next <= 50) {
            setStatusMessage("🏜️ Analyzing terrain and surfaces...");
          } else if (next <= 65) {
            setStatusMessage("🤖 AI model generating predictions...");
          } else if (next <= 80) {
            setStatusMessage("🌳 Calculating optimal green space placement...");
          } else if (next <= 90) {
            setStatusMessage("🎨 Applying green overlay and tree icons...");
          } else {
            setStatusMessage("📊 Finalizing results and calculations...");
          }

          return next;
        });
      }, 300); // Update every 300ms for smooth animation

      const result = await api.generatePrediction(file, preview); // preview already exists in state
      // Clear interval when response arrives
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      // Jump to 100% when complete
      setProgress(100);
      setStatusMessage("✅ Complete! Redirecting to results...");

      if (result.success) {
        // 🔧 FIX: isGeneratingRef was never reset on the success path.
        isGeneratingRef.current = false;

        setTimeout(() => {
          navigate("/results", {
            state: {
              result: result.data,
              inputFile: file,
            },
            replace: true,
          });
        }, 500);
      } else {
        setError(result.error || "Generation failed. Please try again.");
        setProgress(0);
        setStatusMessage("");
        isGeneratingRef.current = false;
      }
    } catch (err) {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      console.error("❌ Prediction failed:", err);

      // 🔧 BETTER ERROR HANDLING FOR MULTIPLE USERS
      if (err.response?.status === 503) {
        setError(
          "⏳ Server is busy processing another request. Please wait 30 seconds and try again.",
        );
      } else if (err.response?.status === 400) {
        const errorData = err.response.data;
        if (errorData.detail && typeof errorData.detail === "object") {
          setError(
            errorData.detail.message ||
              "Invalid image type. Please use a satellite/aerial image.",
          );
        } else {
          setError(
            errorData.detail ||
              "Invalid image. Please use a satellite/aerial image.",
          );
        }
      } else if (
        err.code === "ECONNABORTED" ||
        err.message.includes("timeout")
      ) {
        setError(
          "⏱️ Request timeout. The server is taking too long. Please try again with a smaller image or wait a moment.",
        );
      } else if (err.message === "Network Error") {
        setError(
          "🌐 Network error. The image might be too large. Please try a smaller image.",
        );
      } else {
        setError(
          err.message || "An unexpected error occurred. Please try again.",
        );
      }

      setProgress(0);
      setStatusMessage("");
      isGeneratingRef.current = false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBrowseClick = () => {
    document.getElementById("fileInput")?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 py-16">
      <div className="container-custom max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-white shadow-md border border-green-200 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 mr-2 text-green-600" />
            <span className="text-sm font-bold text-green-700">
              AI-Powered Analysis
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
            Upload Satellite Image
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload a satellite or aerial view to visualize green spaces
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 mb-10 border border-gray-100">
          {!file ? (
            // Upload Zone
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`upload-zone border-3 border-dashed rounded-2xl p-16 text-center transition-all duration-300 ${
                isDragging
                  ? "border-green-500 bg-green-50 scale-105 shadow-lg"
                  : "border-gray-300 hover:border-green-400 hover:bg-gray-50"
              }`}
            >
              <div
                className={`transition-transform duration-300 ${isDragging ? "scale-110" : ""}`}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <UploadIcon className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Drop Your Satellite Image Here
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  or click the button below to browse
                </p>

                <input
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  aria-label="Upload urban landscape image"
                />

                <button
                  type="button"
                  onClick={handleBrowseClick}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <UploadIcon className="w-5 h-5" />
                  Select Image
                </button>

                <p className="text-sm text-gray-500 mt-6">
                  Supports: PNG, JPEG (Max 10 MB)
                </p>
                <p className="text-sm text-green-600 font-semibold mt-2">
                  ✓ Works with desert AND city satellite images
                </p>
              </div>
            </div>
          ) : (
            // Preview Zone
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    Image Ready
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-3 hover:bg-red-50 rounded-xl transition-all duration-300 group"
                  disabled={isProcessing}
                >
                  <X className="w-6 h-6 text-gray-600 group-hover:text-red-600" />
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden border-4 border-green-200 shadow-xl mb-6">
                <img src={preview} alt="Preview" className="w-full h-auto" />
              </div>

              <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-xl">
                <ImageIcon className="w-5 h-5 mr-3 text-green-600" />
                <span className="font-medium flex-1">{file.name}</span>
                <span className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-5 bg-red-50 border-2 border-red-200 rounded-xl flex items-start">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-semibold">{error}</p>
                {error.includes("satellite") && (
                  <p className="text-red-600 text-sm mt-2">
                    💡 Tip: Use Google Maps satellite view screenshots or aerial
                    photos
                  </p>
                )}
                {error.includes("busy") && (
                  <p className="text-orange-600 text-sm mt-2 font-bold">
                    ⏳ Another user is being processed. Please wait 30-60
                    seconds and try again.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {isProcessing && (
            <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                  {statusMessage}
                </span>
                <span className="text-2xl font-black text-green-600">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 h-full transition-all duration-300 ease-out shadow-lg relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Processing time: 20-60 seconds on average
                </p>
                {progress >= 95 && (
                  <p className="text-sm text-orange-600 font-bold flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Final calculations in progress... Please don't close this
                    page!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Generate Button */}
          {file && !isProcessing && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isProcessing}
              className="generate-button w-full mt-8 group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-black text-xl shadow-2xl hover:shadow-green-500/50 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Generate Green Visualization
              <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </button>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-black text-gray-900 mb-2">📸 Image Type</h4>
            <p className="text-sm text-gray-600">
              Use satellite/aerial views from Google Maps or drone photos
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-black text-gray-900 mb-2">⚡ Processing</h4>
            <p className="text-sm text-gray-600">
              AI generation takes 20-60 seconds. Works with any terrain!
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-black text-gray-900 mb-2">🌳 Analysis</h4>
            <p className="text-sm text-gray-600">
              Advanced algorithms detect vegetation and suggest green spaces
            </p>
          </div>
        </div>
      </div>

      {/* Add shimmer animation CSS */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Upload;
