import { useReducer, useRef } from "react";
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

// 1. Initial State define
const initialState = {
  file: null,
  preview: null,
  isDragging: false,
  isProcessing: false,
  error: null,
  progress: 0,
  statusMessage: "",
};

// 2. Reducer function is builded for state transitions track
function uploadReducer(state, action) {
  switch (action.type) {
    case "SET_DRAG":
      return { ...state, isDragging: action.payload };
    case "START_PREVIEW":
      return { ...state, error: null };
    case "SET_FILE_SUCCESS":
      return {
        ...state,
        file: action.payload.file,
        preview: action.payload.preview,
        error: null,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isProcessing: false,
        progress: 0,
        statusMessage: "",
      };
    case "REMOVE_FILE":
      return { ...initialState }; // All states are reset
    case "START_GENERATION":
      return {
        ...state,
        isProcessing: true,
        error: null,
        progress: 0,
        statusMessage: "Initializing...",
      };
    case "UPDATE_PROGRESS":
      return {
        ...state,
        progress: action.payload.progress,
        statusMessage: action.payload.statusMessage,
      };
    case "GENERATION_SUCCESS":
      return {
        ...state,
        progress: 100,
        statusMessage: "✅ Complete! Redirecting to results...",
      };
    case "FINISH_PROCESSING":
      return { ...state, isProcessing: false };
    default:
      return state;
  }
}

const Upload = () => {
  const navigate = useNavigate();

  // 3. useReducer hook setup
  const [state, dispatch] = useReducer(uploadReducer, initialState);

  const {
    file,
    preview,
    isDragging,
    isProcessing,
    error,
    progress,
    statusMessage,
  } = state;

  const isGeneratingRef = useRef(false);

  const handleFileSelect = async (selectedFile) => {
    dispatch({ type: "START_PREVIEW" });

    const validation = validateImageFile(selectedFile);
    if (!validation.valid) {
      dispatch({ type: "SET_ERROR", payload: validation.error });
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(selectedFile);
      dispatch({
        type: "SET_FILE_SUCCESS",
        payload: { file: selectedFile, preview: dataUrl },
      });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: "Failed to generate preview" });
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
    dispatch({ type: "SET_DRAG", payload: true });
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dispatch({ type: "SET_DRAG", payload: false });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dispatch({ type: "SET_DRAG", payload: false });

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleRemoveFile = () => {
    dispatch({ type: "REMOVE_FILE" });
    isGeneratingRef.current = false;
  };

  const handleGenerate = async () => {
    if (isGeneratingRef.current) {
      console.warn("⚠️ Generation already in progress");
      return;
    }

    if (!file) {
      dispatch({ type: "SET_ERROR", payload: "Please select an image first" });
      return;
    }

    if (isProcessing) {
      console.warn("⚠️ Already processing");
      return;
    }

    isGeneratingRef.current = true;
    dispatch({ type: "START_GENERATION" });

    let progressInterval = null;

    try {
      progressInterval = setInterval(() => {
        let currentProgress = 0;

        dispatch({
          type: "UPDATE_PROGRESS",
          payload: () => {
            const prev = state.progress;
          },
        });
      }, 300);

      // 💡 Interval progress tracking block fixed to work seamlessly with useReducer state transitions:
      let localProgress = 0;
      progressInterval = setInterval(() => {
        if (localProgress >= 95) {
          dispatch({
            type: "UPDATE_PROGRESS",
            payload: {
              progress: 95,
              statusMessage: "🤖 AI is analyzing your image... Almost done!",
            },
          });
          return;
        }

        localProgress += 1;
        let msg = "";
        if (localProgress <= 10) msg = "📤 Uploading image to server...";
        else if (localProgress <= 20) msg = "🔍 Validating image format...";
        else if (localProgress <= 35)
          msg = "🌍 Detecting buildings and infrastructure...";
        else if (localProgress <= 50)
          msg = "🏜️ Analyzing terrain and surfaces...";
        else if (localProgress <= 65)
          msg = "🤖 AI model generating predictions...";
        else if (localProgress <= 80)
          msg = "🌳 Calculating optimal green space placement...";
        else if (localProgress <= 90)
          msg = "🎨 Applying green overlay and tree icons...";
        else msg = "📊 Finalizing results and calculations...";

        dispatch({
          type: "UPDATE_PROGRESS",
          payload: { progress: localProgress, statusMessage: msg },
        });
      }, 300);

      const result = await api.generatePrediction(file, preview);

      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      dispatch({ type: "GENERATION_SUCCESS" });

      if (result.success) {
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
        dispatch({
          type: "SET_ERROR",
          payload: result.error || "Generation failed. Please try again.",
        });
        isGeneratingRef.current = false;
      }
    } catch (err) {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      console.error("❌ Prediction failed:", err);
      let errMsg =
        err.message || "An unexpected error occurred. Please try again.";

      if (err.response?.status === 503) {
        errMsg =
          "⏳ Server is busy processing another request. Please wait 30 seconds and try again.";
      } else if (err.response?.status === 400) {
        const errorData = err.response.data;
        errMsg =
          errorData.detail?.message ||
          errorData.detail ||
          "Invalid image. Please use a satellite/aerial image.";
      } else if (
        err.code === "ECONNABORTED" ||
        err.message.includes("timeout")
      ) {
        errMsg =
          "⏱️ Request timeout. The server is taking too long. Please try again with a smaller image or wait a moment.";
      } else if (err.message === "Network Error") {
        errMsg =
          "🌐 Network error. The image might be too large. Please try a smaller image.";
      }

      dispatch({ type: "SET_ERROR", payload: errMsg });
      isGeneratingRef.current = false;
    } finally {
      dispatch({ type: "FINISH_PROCESSING" });
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
