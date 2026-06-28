import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Image as ImageIcon,
  Search,
  SortDesc,
  Trash2,
  TrendingUp,
  TreePine,
  AlertCircle,
  Upload as UploadIcon,
} from "lucide-react";
import { galleryStorage } from "../utils/storage";
import GalleryCard from "../components/GalleryCard";

const Gallery = () => {
  // Use lazy state initializers to load from storage synchronously on initial render
  const [gallery, setGallery] = useState(() => galleryStorage.getAll());
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [stats, setStats] = useState(() => galleryStorage.getStats());

  // Extracted logic to synchronise both states when underlying storage modifications happen
  const refreshGalleryState = () => {
    setGallery(galleryStorage.getAll());
    setStats(galleryStorage.getStats());
  };

  const filteredGallery = useMemo(() => {
    let filtered = [...gallery];

    if (searchTerm) {
      filtered = filtered.filter((item) => {
        const date = new Date(item.timestamp).toLocaleDateString();
        return date.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.timestamp - a.timestamp;
        case "oldest":
          return a.timestamp - b.timestamp;
        case "improvement":
          return (
            (b.greenScores?.improvement || 0) -
            (a.greenScores?.improvement || 0)
          );
        case "trees":
          return (
            (b.visualization?.trees_placed || 0) -
            (a.visualization?.trees_placed || 0)
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [gallery, searchTerm, sortBy]);

  const handleDelete = (id) => {
    const success = galleryStorage.delete(id);
    if (success) refreshGalleryState();
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "⚠️ Are you sure you want to delete ALL results? This cannot be undone!",
      )
    ) {
      const success = galleryStorage.clearAll();
      if (success) refreshGalleryState();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 py-16">
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-white shadow-md border border-green-200 px-4 py-2 rounded-full mb-6">
            <ImageIcon className="w-4 h-4 mr-2 text-green-600" />
            <span className="text-sm font-bold text-green-700">
              Your Transformations
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
            🖼️ My Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            View all your green transformations
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500 font-bold uppercase">
                Total
              </span>
            </div>
            <p className="text-4xl font-black text-gray-900 mb-1">
              {stats.totalImages}
            </p>
            <p className="text-sm text-gray-600 font-semibold">
              Images Processed
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500 font-bold uppercase">
                Average
              </span>
            </div>
            <p className="text-4xl font-black text-green-600 mb-1">
              +
              {stats.averageImprovement
                ? stats.averageImprovement.toFixed(1)
                : "0.0"}
              %
            </p>
            <p className="text-sm text-gray-600 font-semibold">
              Green Improvement
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl">
                <TreePine className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-500 font-bold uppercase">
                Total
              </span>
            </div>
            <p className="text-4xl font-black text-emerald-600 mb-1">
              {stats.totalTreesPlanted}
            </p>
            <p className="text-sm text-gray-600 font-semibold">Trees Planted</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-10">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search gallery by date"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none font-semibold text-gray-700"
              />
            </div>

            <div className="relative">
              <SortDesc className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort gallery"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none font-semibold text-gray-700 appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="improvement">Highest Improvement</option>
                <option value="trees">Most Trees</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleClearAll}
              disabled={gallery.length === 0}
              className="flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-all duration-300 font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              <Trash2 className="w-5 h-5" />
              Clear All
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredGallery.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGallery.map((item) => (
              <GalleryCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
            {gallery.length === 0 ? (
              <>
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">
                  No Images Yet
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Your gallery is empty. Upload your first satellite image to
                  start creating green transformations!
                </p>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <UploadIcon className="w-5 h-5" />
                  Upload Image
                </Link>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">
                  No Results Found
                </h3>
                <p className="text-gray-600 mb-6">
                  No images match your search criteria. Try a different search
                  term.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="text-green-600 font-bold hover:text-green-700 transition-colors"
                >
                  Clear Search
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
