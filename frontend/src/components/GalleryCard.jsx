import { Eye, Trash2, Download, TrendingUp, TreePine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const GalleryCard = ({ item, onDelete }) => {
  const navigate = useNavigate();

  const handleView = () => {
    // Navigate to results page with saved data
    navigate("/results", {
      state: {
        result: {
          success: true,
          output_filename: item.outputFilename,
          green_scores: item.greenScores,
          visualization: item.visualization,
          metadata: item.metadata,
        },
        inputFile: null, // No input file needed for viewing
        fromGallery: true,
        galleryInputPreview: item.inputImage,
      },
    });
  };

  const handleDownload = async () => {
    try {
      await api.downloadImage(item.outputFilename);
    } catch (error) {
      console.error("Download failed:", error);
      alert(
        "Failed to download image. The file may no longer exist on the server.",
      );
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this result?")) {
      onDelete(item.id);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const improvement = item.greenScores?.improvement || 0;
  const treesPlaced = item.visualization?.trees_placed || 0;
  const inputScore = item.greenScores?.input?.green_score || 0;
  const outputScore = item.greenScores?.output?.green_score || 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 transform hover:scale-105">
      {/* Image Preview */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {item.inputImage ? (
          <img
            src={item.inputImage}
            alt="Input preview"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <TreePine className="w-16 h-16" />
          </div>
        )}

        {/* Overlay with stats */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center justify-between text-white text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="font-bold">
                  {inputScore.toFixed(1)}% → {outputScore.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TreePine className="w-4 h-4 text-green-400" />
                <span className="font-bold">{treesPlaced} trees</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Stats */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 font-semibold">
              Improvement
            </span>
            <span
              className={`text-2xl font-black ${improvement > 20 ? "text-green-600" : improvement > 10 ? "text-emerald-600" : "text-gray-700"}`}
            >
              +{improvement.toFixed(1)}%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(improvement * 3, 100)}%` }}
            />
          </div>
        </div>

        {/* Trees Placed */}
        <div className="bg-green-50 rounded-xl p-3 mb-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TreePine className="w-5 h-5 text-green-600" />
              <span className="text-sm font-bold text-gray-700">
                Trees Placed
              </span>
            </div>
            <span className="text-xl font-black text-green-600">
              {treesPlaced}
            </span>
          </div>
        </div>

        {/* Date */}
        <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
          <span>📅</span>
          {formatDate(item.timestamp)}
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleView}
            className="flex items-center justify-center gap-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold text-sm shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Eye className="w-4 h-4" />
            View
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 font-bold text-sm shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Download className="w-4 h-4" />
            Save
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 font-bold text-sm shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
