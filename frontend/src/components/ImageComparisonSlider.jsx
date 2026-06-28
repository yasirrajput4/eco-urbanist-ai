import { useState, useRef } from "react";
import { MoveHorizontal } from "lucide-react";

const ImageComparisonSlider = ({
  beforeImage,
  afterImage,
  beforeLabel = "Original",
  afterLabel = "AI Enhanced",
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  // Track mouse movements globally on the window during an active drag
  const handleMouseDown = (e) => {
    setIsDragging(true);

    const handleGlobalMouseMove = (moveEvent) => {
      handleMove(moveEvent.clientX);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
  };

  // Track touch movements globally on the window during an active drag
  const handleTouchStart = (e) => {
    setIsDragging(true);

    const handleGlobalTouchMove = (moveEvent) => {
      handleMove(moveEvent.touches[0].clientX);
    };

    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
      window.removeEventListener("touchend", handleGlobalTouchEnd);
    };

    window.addEventListener("touchmove", handleGlobalTouchMove, {
      passive: true,
    });

    // 🔧 FIXED: Added { passive: true } to eliminate touch scrolling jank and clear the linter warning
    window.addEventListener("touchend", handleGlobalTouchEnd, {
      passive: true,
    });
  };

  // Complete keyboard accessibility for slider role
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      setSliderPosition((prev) => Math.max(prev - 5, 0));
    } else if (e.key === "ArrowRight") {
      setSliderPosition((prev) => Math.min(prev + 5, 100));
    } else if (e.key === "Home") {
      setSliderPosition(0);
    } else if (e.key === "End") {
      setSliderPosition(100);
    }
  };

  return (
    <div className="w-full">
      {/* Instructions */}
      <div className="text-center mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
        <p className="text-sm font-bold text-gray-700 flex items-center justify-center gap-2">
          <MoveHorizontal className="w-5 h-5 text-green-600 animate-pulse" />
          Drag the slider to compare Before & After
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative w-full select-none overflow-hidden rounded-2xl shadow-2xl border-4 border-green-200 hover:border-green-400 transition-all cursor-ew-resize"
      >
        {/* After Image (Full Width - Base Layer) */}
        <div className="relative w-full">
          <img
            src={afterImage}
            alt={afterLabel}
            className="w-full h-auto block"
            draggable={false}
          />
          <div className="absolute top-6 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-2xl border-2 border-white animate-pulse">
            ✨ {afterLabel}
          </div>
        </div>

        {/* Before Image (Clipped Layer via pure CSS clip-path) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="w-full h-full object-cover block"
            draggable={false}
          />
          <div className="absolute top-6 left-6 bg-gradient-to-r from-gray-700 to-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-2xl border-2 border-white">
            📸 {beforeLabel}
          </div>
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
        >
          {/* Top Arrow */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white"></div>

          {/* Bottom Arrow */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"></div>
        </div>

        {/* Slider Handle Button */}
        <button
          type="button"
          className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-500 rounded-full z-10"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onKeyDown={handleKeyDown}
          role="slider"
          aria-valuenow={Math.round(sliderPosition)}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Image comparison slider handle"
        >
          <div
            className={`w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center cursor-ew-resize border-4 transition-all duration-300 ${
              isDragging
                ? "border-green-500 scale-125 shadow-green-500/50"
                : "border-gray-300 hover:border-green-400 hover:scale-110"
            }`}
          >
            <MoveHorizontal
              className={`w-8 h-8 transition-colors ${isDragging ? "text-green-600" : "text-gray-600"}`}
            />
          </div>
        </button>

        {/* Percentage Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-xs font-bold">
          {Math.round(sliderPosition)}% / {Math.round(100 - sliderPosition)}%
        </div>
      </div>

      {/* Labels Below */}
      <div className="flex justify-between mt-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-700 rounded"></div>
          <span className="text-sm font-bold text-gray-700">{beforeLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded"></div>
          <span className="text-sm font-bold text-green-600">{afterLabel}</span>
        </div>
      </div>
    </div>
  );
};

export default ImageComparisonSlider;
