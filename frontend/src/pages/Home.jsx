import { useEffect, useRef, useState } from "react";
import Hero from "../components/Hero";
import {
  Zap,
  Shield,
  Gauge,
  Code,
  ArrowRight,
  TrendingUp,
  Lock,
  Sparkles,
} from "lucide-react";

const Home = () => {
  // Scroll animation state
  const [isVisible, setIsVisible] = useState({});
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observers = sectionRefs.current.map((ref, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [index]: true }));
          }
        },
        { threshold: 0.1 },
      );

      if (ref) observer.observe(ref);
      return observer;
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Stats Bar - ANIMATED */}
      <section className="py-12 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 animate-gradient-x">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div className="transform hover:scale-125 transition-all duration-500 hover:rotate-3 cursor-pointer">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-8 h-8 mr-2 animate-bounce" />
                <p className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200">
                  1000+
                </p>
              </div>
              <p className="text-green-100 font-semibold">Images Processed</p>
            </div>
            <div className="transform hover:scale-125 transition-all duration-500 hover:rotate-3 cursor-pointer">
              <div className="flex items-center justify-center mb-2">
                <Gauge className="w-8 h-8 mr-2 animate-pulse" />
                <p className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200">
                  95%
                </p>
              </div>
              <p className="text-green-100 font-semibold">
                Avg. Green Coverage Boost
              </p>
            </div>
            <div className="transform hover:scale-125 transition-all duration-500 hover:rotate-3 cursor-pointer">
              <div className="flex items-center justify-center mb-2">
                <Lock className="w-8 h-8 mr-2 animate-bounce" />
                <p className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200">
                  100%
                </p>
              </div>
              <p className="text-green-100 font-semibold">Privacy Protected</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container-custom">
          <div
            ref={addToRefs}
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible[0]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-5xl font-black text-gray-900 mb-4 hover:text-green-600 transition-colors">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to visualize urban green spaces
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 - CRAZY HOVER */}
            <div
              ref={addToRefs}
              className={`text-center bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl transition-all duration-500 transform hover:scale-110 hover:bg-gradient-to-br hover:from-yellow-100 hover:to-orange-100 hover:shadow-2xl hover:rotate-2 cursor-pointer border-4 border-transparent hover:border-yellow-400 ${
                isVisible[1]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:rotate-180 hover:scale-125 transition-all duration-700">
                <span className="text-4xl font-black text-white">1</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 hover:text-green-600 transition-colors">
                Upload Building Mask
              </h3>
              <p className="text-gray-600 font-medium">
                Upload a black and white image showing building footprints or
                urban structures
              </p>
            </div>

            {/* Step 2 - CRAZY HOVER */}
            <div
              ref={addToRefs}
              className={`text-center bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl transition-all duration-500 transform hover:scale-110 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 hover:shadow-2xl hover:-rotate-2 cursor-pointer border-4 border-transparent hover:border-blue-400 delay-100 ${
                isVisible[2]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:rotate-180 hover:scale-125 transition-all duration-700">
                <span className="text-4xl font-black text-white">2</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 hover:text-blue-600 transition-colors">
                AI Generation
              </h3>
              <p className="text-gray-600 font-medium">
                Our Pix2Pix GAN model transforms the mask into a realistic
                satellite image with green spaces
              </p>
            </div>

            {/* Step 3 - CRAZY HOVER */}
            <div
              ref={addToRefs}
              className={`text-center bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl transition-all duration-500 transform hover:scale-110 hover:bg-gradient-to-br hover:from-pink-100 hover:to-red-100 hover:shadow-2xl hover:rotate-2 cursor-pointer border-4 border-transparent hover:border-pink-400 delay-200 ${
                isVisible[3]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:rotate-180 hover:scale-125 transition-all duration-700">
                <span className="text-4xl font-black text-white">3</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 hover:text-pink-600 transition-colors">
                Analyze Results
              </h3>
              <p className="text-gray-600 font-medium">
                Get green score analytics, download results, and plan
                sustainable urban development
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
        <div className="container-custom">
          <div
            ref={addToRefs}
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible[4]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-5xl font-black text-gray-900 mb-4 hover:text-green-600 transition-colors">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for urban green space planning
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 - EXPLOSIVE HOVER */}
            <div
              ref={addToRefs}
              className={`bg-white p-6 rounded-2xl shadow-lg border-4 border-transparent hover:border-yellow-400 hover:shadow-2xl transform hover:scale-110 hover:-rotate-3 transition-all duration-500 cursor-pointer hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-50 ${
                isVisible[5]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="bg-gradient-to-br from-green-400 to-emerald-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4 transform hover:rotate-12 hover:scale-125 transition-all duration-500 shadow-xl">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-600 font-medium">
                Generate results in seconds with optimized AI models
              </p>
            </div>

            {/* Feature 2 - EXPLOSIVE HOVER */}
            <div
              ref={addToRefs}
              className={`bg-white p-6 rounded-2xl shadow-lg border-4 border-transparent hover:border-blue-400 hover:shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-500 cursor-pointer hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 delay-100 ${
                isVisible[6]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4 transform hover:rotate-12 hover:scale-125 transition-all duration-500 shadow-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">
                Privacy First
              </h3>
              <p className="text-gray-600 font-medium">
                Your images are processed locally and never stored
              </p>
            </div>

            {/* Feature 3 - EXPLOSIVE HOVER */}
            <div
              ref={addToRefs}
              className={`bg-white p-6 rounded-2xl shadow-lg border-4 border-transparent hover:border-purple-400 hover:shadow-2xl transform hover:scale-110 hover:-rotate-3 transition-all duration-500 cursor-pointer hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 delay-200 ${
                isVisible[7]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4 transform hover:rotate-12 hover:scale-125 transition-all duration-500 shadow-xl">
                <Gauge className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">
                Accurate Analysis
              </h3>
              <p className="text-gray-600 font-medium">
                HSV color analysis for precise vegetation measurement
              </p>
            </div>

            {/* Feature 4 - EXPLOSIVE HOVER */}
            <div
              ref={addToRefs}
              className={`bg-white p-6 rounded-2xl shadow-lg border-4 border-transparent hover:border-orange-400 hover:shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-500 cursor-pointer hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 delay-300 ${
                isVisible[8]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 w-16 h-16 rounded-xl flex items-center justify-center mb-4 transform hover:rotate-12 hover:scale-125 transition-all duration-500 shadow-xl">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">
                Open Source
              </h3>
              <p className="text-gray-600 font-medium">
                Built with modern open-source technologies
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - MEGA BUTTON */}
      <section className="py-24 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 relative overflow-hidden">
        {/* Crazy animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-300 rounded-full blur-3xl opacity-20 animate-bounce"></div>
        </div>

        <div className="container-custom text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 animate-pulse">
            Ready to Green Your City? 🌳
          </h2>
          <p className="text-2xl text-green-100 mb-10 max-w-2xl mx-auto font-semibold">
            Start visualizing sustainable urban development today
          </p>

          {/* MEGA CRAZY BUTTON */}
          <a
            href="/upload"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 text-gray-900 px-12 py-6 rounded-2xl font-black text-2xl shadow-2xl hover:shadow-yellow-400 transition-all duration-500 transform hover:scale-125 hover:rotate-3 border-8 border-white hover:border-yellow-200 animate-bounce hover:animate-none"
          >
            <Sparkles className="w-8 h-8 animate-spin" />
            <span className="relative z-10">🚀 GET STARTED NOW</span>
            <ArrowRight className="w-8 h-8 relative z-10 group-hover:translate-x-3 transition-transform duration-300 animate-pulse" />
          </a>

          <p
            className="text-white mt-8 text-lg font-bold animate-bounce"
            style={{ animationDelay: "0.5s" }}
          >
            ✨ No signup • Free forever • Start in 30 seconds ✨
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
