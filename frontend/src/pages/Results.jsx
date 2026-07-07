import { useEffect, useReducer, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Download,
  ArrowLeft,
  TrendingUp,
  Leaf,
  TreePine,
  Sparkles,
  Award,
  BarChart3,
  Cloud,
  Droplets,
  Sun,
  Wind,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import api from "../services/api";
import { getGreenScoreColor, getGreenScoreLabel } from "../utils/helpers";
import ImageComparisonSlider from "../components/ImageComparisonSlider";
import { galleryStorage } from "../utils/storage";

// ---- Reducer: a single call site handles every update to this state ----
const initialResultsState = {
  resultData: null,
  outputUrl: null,
  inputPreview: null,
  savedToGallery: false,
};

function resultsReducer(state, action) {
  switch (action.type) {
    case "SET_RESULTS":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [resultsState, dispatch] = useReducer(
    resultsReducer,
    initialResultsState,
  );
  const { resultData, outputUrl, inputPreview, savedToGallery } = resultsState;

  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const { result, inputFile, fromGallery, galleryInputPreview } =
      location.state || {};

    if (!result) {
      navigate("/upload");
      return;
    }

    const finalOutputUrl = result.output_filename
      ? api.getDownloadUrl(result.output_filename)
      : null;

    let cancelled = false;

    // Resolve the preview (sync for gallery items, async for freshly
    // uploaded files) into a single promise so we only ever need ONE
    // state update below, no matter which path we took.
    const resolvePreview = () => {
      if (fromGallery && galleryInputPreview) {
        return Promise.resolve({
          preview: galleryInputPreview,
          shouldSaveToGallery: false,
          saved: true,
        });
      }

      if (inputFile) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              preview: e.target.result,
              shouldSaveToGallery: true,
              saved: true,
            });
          };
          reader.readAsDataURL(inputFile);
        });
      }

      return Promise.resolve({
        preview: null,
        shouldSaveToGallery: false,
        saved: false,
      });
    };

    resolvePreview().then(({ preview, shouldSaveToGallery, saved }) => {
      if (cancelled) return;

      if (shouldSaveToGallery) {
        saveToGallery(result, preview);
      }

      // Single dispatch for this effect run, regardless of which
      // branch produced the data.
      dispatch({
        type: "SET_RESULTS",
        payload: {
          resultData: result,
          outputUrl: finalOutputUrl,
          inputPreview: preview,
          savedToGallery: saved,
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, [location, navigate]);

  const saveToGallery = (result, inputImagePreview) => {
    try {
      const galleryItem = {
        inputImage: inputImagePreview,
        outputFilename: result.output_filename,
        greenScores: result.green_scores,
        visualization: result.visualization,
        metadata: result.metadata,
      };
      galleryStorage.add(galleryItem);
      console.log("✅ Saved to gallery");
    } catch (error) {
      console.error("Failed to save to gallery:", error);
    }
  };

  const handleDownload = async () => {
    if (resultData?.output_filename) {
      setIsDownloading(true);
      try {
        await api.downloadImage(resultData.output_filename);
      } catch (error) {
        console.error("Download failed:", error);
        alert("Failed to download image. Please try again.");
      } finally {
        setIsDownloading(false);
      }
    }
  };

  if (!resultData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">
            Loading amazing results...
          </p>
        </div>
      </div>
    );
  }

  const greenScores = resultData.green_scores || {};
  const inputScore = greenScores.input?.green_score || 0;
  const outputScore = greenScores.output?.green_score || 0;
  const improvement = greenScores.improvement || 0;
  const visualization = resultData.visualization || {};
  const treesPlaced = visualization.trees_placed || 0;
  const iconBreakdown = visualization.icon_breakdown || {};
  const greenPixelsAdded =
    (greenScores.output?.green_pixels || 0) -
    (greenScores.input?.green_pixels || 0);

  const co2Absorbed = (treesPlaced * 21).toFixed(1);
  const oxygenProduced = (treesPlaced * 118).toFixed(0);
  const airQualityImprovement = Math.min((improvement * 2.5).toFixed(1), 100);
  const temperatureReduction = (improvement * 0.15).toFixed(1);

  const chartData = [
    { name: "Before", "Green Coverage": parseFloat(inputScore.toFixed(2)) },
    { name: "After", "Green Coverage": parseFloat(outputScore.toFixed(2)) },
  ];

  const radarData = [
    { metric: "Green Coverage", before: inputScore, after: outputScore },
    {
      metric: "Air Quality",
      before: 40,
      after: 40 + parseFloat(airQualityImprovement),
    },
    { metric: "Biodiversity", before: 30, after: 30 + improvement * 1.5 },
    { metric: "Temperature", before: 60, after: 60 + improvement * 1.2 },
    { metric: "Water Retention", before: 35, after: 35 + improvement * 1.8 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 py-16">
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <Link
              to="/upload"
              className="group inline-flex items-center text-green-600 hover:text-green-700 font-bold transition-all bg-white px-5 py-3 rounded-xl shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Generate Another
            </Link>

            {savedToGallery && (
              <Link
                to="/gallery"
                className="group inline-flex items-center text-blue-600 hover:text-blue-700 font-bold transition-all bg-white px-5 py-3 rounded-xl shadow-md hover:shadow-lg border-2 border-blue-200"
              >
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Saved to Gallery
              </Link>
            )}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center bg-white shadow-md border border-green-200 px-5 py-2.5 rounded-full mb-6">
              <Award className="w-5 h-5 mr-2 text-green-600" />
              <span className="text-sm font-bold text-green-700">
                Analysis Complete
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
              Green Visualization Results 🌳
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI-powered urban greening analysis with environmental impact
              assessment
            </p>
          </div>
        </div>

        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 rounded-3xl mb-10 shadow-2xl transform hover:scale-105 transition-transform">
          <div className="flex items-start">
            <div className="bg-white/20 p-4 rounded-2xl mr-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black mb-2">
                🎉 Visualization Generated Successfully!
              </h3>
              <p className="text-green-100 text-lg">
                Your image has been enhanced with{" "}
                <strong className="text-white">{treesPlaced} tree icons</strong>{" "}
                placed strategically. Green coverage improved by{" "}
                <strong className="text-yellow-300 text-2xl">
                  +{improvement.toFixed(2)}%
                </strong>
                !
              </p>
            </div>
          </div>
        </div>

        {/* Image Comparison Slider */}
        {outputUrl && (
          <div className="bg-white rounded-3xl shadow-2xl p-10 mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center justify-center">
              <Sparkles className="w-8 h-8 mr-3 text-green-600" />
              Before & After Comparison
            </h2>

            {inputPreview ? (
              <ImageComparisonSlider
                beforeImage={inputPreview}
                afterImage={outputUrl}
                beforeLabel="Original"
                afterLabel="AI Enhanced"
              />
            ) : (
              <div className="relative w-full rounded-2xl overflow-hidden border-4 border-green-200 shadow-2xl">
                <img
                  src={outputUrl}
                  alt="AI Enhanced"
                  className="w-full h-auto block"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
                  <div className="bg-white/90 px-6 py-3 rounded-xl font-bold text-gray-700 text-sm flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    Loading original image...
                  </div>
                </div>
                <div className="absolute top-6 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-2xl border-2 border-white animate-pulse">
                  ✨ AI Enhanced
                </div>
              </div>
            )}

            {/* Download Button */}
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-5 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] font-black text-xl shadow-2xl hover:shadow-green-500/50 transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Download
                  className={`w-6 h-6 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isDownloading ? "animate-spin" : "group-hover:translate-y-1"
                  }`}
                />
                <span>
                  {isDownloading ? "Downloading..." : "Download Enhanced Image"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all transform hover:scale-105 border-4 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-4 rounded-2xl shadow-lg">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <div className="bg-green-100 px-4 py-2 rounded-full">
                <span className="text-xs font-bold text-green-700">
                  IMPROVEMENT
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-2 text-sm font-semibold">
              Green Coverage Boost
            </p>
            <p className="text-6xl font-black text-green-600 mb-2">
              +{improvement.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">
              From {inputScore.toFixed(1)}% to {outputScore.toFixed(1)}%
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all transform hover:scale-105 border-4 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-4 rounded-2xl shadow-lg">
                <Leaf className="w-10 h-10 text-white" />
              </div>
              <div className="bg-blue-100 px-4 py-2 rounded-full">
                <span className="text-xs font-bold text-blue-700">PIXELS</span>
              </div>
            </div>
            <p className="text-gray-600 mb-2 text-sm font-semibold">
              Green Pixels Added
            </p>
            <p className="text-5xl font-black text-blue-600 mb-2">
              {greenPixelsAdded.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              Additional vegetation coverage
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all transform hover:scale-105 border-4 border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 p-4 rounded-2xl shadow-lg">
                <TreePine className="w-10 h-10 text-white" />
              </div>
              <div className="bg-emerald-100 px-4 py-2 rounded-full">
                <span className="text-xs font-bold text-emerald-700">
                  TREES
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-2 text-sm font-semibold">
              Trees Placed
            </p>
            <p className="text-6xl font-black text-emerald-600 mb-2">
              {treesPlaced}
            </p>
            <p className="text-xs text-gray-500">AI-positioned tree icons</p>
          </div>
        </div>

        {/* Environmental Impact Cards */}
        <div className="mb-10">
          <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center">
            <Sparkles className="w-8 h-8 mr-3 text-green-600" />
            Environmental Impact Assessment
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-3">
                <Cloud className="w-10 h-10" />
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                  Annual
                </span>
              </div>
              <p className="text-sm font-semibold mb-1 opacity-90">
                CO₂ Absorbed
              </p>
              <p className="text-4xl font-black mb-1">{co2Absorbed} kg</p>
              <p className="text-xs opacity-75">
                Equivalent to {(co2Absorbed / 411).toFixed(1)} cars off road/day
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-3">
                <Wind className="w-10 h-10" />
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                  Annual
                </span>
              </div>
              <p className="text-sm font-semibold mb-1 opacity-90">
                Oxygen Produced
              </p>
              <p className="text-4xl font-black mb-1">{oxygenProduced} kg</p>
              <p className="text-xs opacity-75">
                Supports {(oxygenProduced / 730).toFixed(0)} people yearly
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-3">
                <Droplets className="w-10 h-10" />
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                  Improvement
                </span>
              </div>
              <p className="text-sm font-semibold mb-1 opacity-90">
                Air Quality Index
              </p>
              <p className="text-4xl font-black mb-1">
                +{airQualityImprovement}%
              </p>
              <p className="text-xs opacity-75">Reduces PM2.5 particles</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-3">
                <Sun className="w-10 h-10" />
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                  Cooling
                </span>
              </div>
              <p className="text-sm font-semibold mb-1 opacity-90">
                Temperature Drop
              </p>
              <p className="text-4xl font-black mb-1">
                -{temperatureReduction}°C
              </p>
              <p className="text-xs opacity-75">Urban heat island effect</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-green-600" />
              Coverage Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  style={{ fontWeight: "bold" }}
                />
                <YAxis stroke="#6b7280" style={{ fontWeight: "bold" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "2px solid #22c55e",
                    borderRadius: "12px",
                    fontWeight: "bold",
                  }}
                  formatter={(value) => [`${value}%`, "Green Coverage"]}
                />
                <Legend wrapperStyle={{ fontWeight: "bold" }} />
                <Bar
                  dataKey="Green Coverage"
                  fill="url(#greenGradient)"
                  radius={[12, 12, 0, 0]}
                />
                <defs>
                  <linearGradient
                    id="greenGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 text-center bg-green-50 py-4 rounded-xl">
              <p className="text-sm text-gray-600">
                Total Improvement:{" "}
                <span className="font-black text-green-600 text-2xl">
                  +{improvement.toFixed(2)}%
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
              <Sparkles className="w-6 h-6 mr-3 text-green-600" />
              Multi-Factor Impact Analysis
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="metric"
                  style={{ fontSize: "12px", fontWeight: "bold" }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Before"
                  dataKey="before"
                  stroke="#94a3b8"
                  fill="#94a3b8"
                  fillOpacity={0.3}
                />
                <Radar
                  name="After"
                  dataKey="after"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.5}
                />
                <Legend />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "2px solid #22c55e",
                    borderRadius: "12px",
                    fontWeight: "bold",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600 font-semibold">
                Comprehensive environmental benefit assessment
              </p>
            </div>
          </div>
        </div>

        {/* Tree Distribution Analysis */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10">
          <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
            <TreePine className="w-6 h-6 mr-3 text-green-600" />
            Tree Distribution Analysis
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(iconBreakdown).map(
              ([type, count]) =>
                count > 0 && (
                  <div
                    key={type}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 text-center border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all transform hover:scale-110"
                  >
                    <div className="text-5xl mb-3">
                      {type === "small" && "🌱"}
                      {type === "medium" && "🌳"}
                      {type === "large" && "🌲"}
                      {type === "bush" && "🌿"}
                    </div>
                    <p className="text-sm text-gray-600 capitalize font-semibold mb-2">
                      {type} Trees
                    </p>
                    <p className="text-4xl font-black text-green-600">
                      {count}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {type === "small" && "Young saplings"}
                      {type === "medium" && "Mature trees"}
                      {type === "large" && "Old growth"}
                      {type === "bush" && "Shrubs"}
                    </p>
                  </div>
                ),
            )}
          </div>
        </div>

        {/* Sustainability Score Card */}
        <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 rounded-3xl shadow-2xl p-10 mb-10 text-white">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black mb-3">
              🏆 Sustainability Score
            </h2>
            <p className="text-green-100 text-lg">
              Based on green coverage, tree density, and environmental impact
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border-2 border-white/30">
              <p className="text-sm font-semibold mb-2 opacity-90">
                Overall Score
              </p>
              <p className="text-6xl font-black mb-2">
                {Math.min(Math.round(outputScore + improvement * 2), 100)}
              </p>
              <p className="text-xs opacity-75">Out of 100</p>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border-2 border-white/30">
              <p className="text-sm font-semibold mb-2 opacity-90">
                Sustainability Grade
              </p>
              <p className="text-6xl font-black mb-2">
                {outputScore >= 80
                  ? "A+"
                  : outputScore >= 70
                    ? "A"
                    : outputScore >= 60
                      ? "B+"
                      : outputScore >= 50
                        ? "B"
                        : "C"}
              </p>
              <p className="text-xs opacity-75">Excellent Rating</p>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border-2 border-white/30">
              <p className="text-sm font-semibold mb-2 opacity-90">
                Tree Density
              </p>
              <p className="text-5xl font-black mb-2">
                {Math.round(treesPlaced * 2.5)}
              </p>
              <p className="text-xs opacity-75">Trees per hectare (est.)</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <p className="text-center text-sm font-semibold mb-4">
              Achievement Unlocked 🎖️
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {improvement > 30 && (
                <span className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-xs font-black">
                  🌟 Green Champion
                </span>
              )}
              {treesPlaced > 50 && (
                <span className="bg-green-400 text-green-900 px-4 py-2 rounded-full text-xs font-black">
                  🌲 Forest Maker
                </span>
              )}
              {outputScore > 70 && (
                <span className="bg-blue-400 text-blue-900 px-4 py-2 rounded-full text-xs font-black">
                  💚 Eco Warrior
                </span>
              )}
              {co2Absorbed > 500 && (
                <span className="bg-purple-400 text-purple-900 px-4 py-2 rounded-full text-xs font-black">
                  ☁️ Carbon Fighter
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h3 className="text-2xl font-black text-gray-900 mb-6">
            Green Coverage Progress
          </h3>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-700 font-bold">Original Image</span>
                <span className="font-black text-gray-900 text-lg">
                  {inputScore.toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                <div
                  className="bg-gray-400 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(inputScore, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-700 font-bold">
                  AI Enhanced Image
                </span>
                <span className="font-black text-green-600 text-lg">
                  {outputScore.toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 h-full rounded-full transition-all duration-1000 shadow-lg"
                  style={{ width: `${Math.min(outputScore, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
