import {
  Leaf,
  Github,
  Heart,
  Sparkles,
  ExternalLink,
  Linkedin,
  Code2,
  Rocket,
  Users,
  AlertTriangle,
  Wind,
  Droplets,
  ThermometerSun,
  TreePine,
  Zap,
  BarChart3,
  Globe,
  Shield,
  Cpu,
  Image as ImageIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-gray-300 border-t-4 border-green-500 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-500 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="container-custom py-16 relative z-10">
        {/* The Problem Section */}
        <div className="mt-16 mb-16 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 border-2 border-red-500/30 rounded-3xl p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
            <h2 className="text-3xl font-black text-white">The Urban Crisis</h2>
          </div>
          <p className="text-gray-300 text-lg mb-6 leading-relaxed">
            Green space planning in rapidly expanding modern cities is{" "}
            <span className="text-red-400 font-black">
              manual and time-consuming
            </span>
            . Cities prioritize roads and buildings, adding greenery only as an{" "}
            <span className="text-red-400 font-black">afterthought</span>.
          </p>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gray-900/80 p-5 rounded-2xl border-2 border-red-500/30 hover:border-red-400 transition-all hover:scale-105 transform">
              <ThermometerSun className="w-8 h-8 text-red-400 mb-3" />
              <h4 className="font-black text-white mb-2 text-sm">
                Urban Heat Island
              </h4>
              <p className="text-xs text-gray-400">
                Concrete retains heat, raising local temperatures dramatically
              </p>
            </div>

            <div className="bg-gray-900/80 p-5 rounded-2xl border-2 border-orange-500/30 hover:border-orange-400 transition-all hover:scale-105 transform">
              <Wind className="w-8 h-8 text-orange-400 mb-3" />
              <h4 className="font-black text-white mb-2 text-sm">
                Poor Air Quality
              </h4>
              <p className="text-xs text-gray-400">
                Lack of natural filtration and carbon absorption
              </p>
            </div>

            <div className="bg-gray-900/80 p-5 rounded-2xl border-2 border-blue-500/30 hover:border-blue-400 transition-all hover:scale-105 transform">
              <Droplets className="w-8 h-8 text-blue-400 mb-3" />
              <h4 className="font-black text-white mb-2 text-sm">
                Flooding Risks
              </h4>
              <p className="text-xs text-gray-400">
                Poor stormwater absorption due to lack of permeable surfaces
              </p>
            </div>

            <div className="bg-gray-900/80 p-5 rounded-2xl border-2 border-purple-500/30 hover:border-purple-400 transition-all hover:scale-105 transform">
              <Globe className="w-8 h-8 text-purple-400 mb-3" />
              <h4 className="font-black text-white mb-2 text-sm">
                Climate Impact
              </h4>
              <p className="text-xs text-gray-400">
                Increased energy consumption and carbon footprint
              </p>
            </div>
          </div>
        </div>

        {/* The Solution Section */}
        <div className="mb-16 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border-2 border-green-500/30 rounded-3xl p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-green-400 animate-pulse" />
            <h2 className="text-3xl font-black text-white">
              Our AI-Powered Solution
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900/80 p-6 rounded-2xl border-2 border-green-500/30 hover:border-green-400 transition-all hover:scale-105 transform hover:shadow-2xl hover:shadow-green-500/20">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <TreePine className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-black text-white mb-3 text-lg">
                🏗️ Infrastructure-Aware
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Automatically detects and{" "}
                <span className="text-green-400 font-bold">
                  preserves existing buildings, roads, and water bodies
                </span>
                . Suggests vegetation only in feasible open spaces.
              </p>
            </div>

            <div className="bg-gray-900/80 p-6 rounded-2xl border-2 border-blue-500/30 hover:border-blue-400 transition-all hover:scale-105 transform hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-black text-white mb-3 text-lg">
                📊 Measurable Impact
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Provides{" "}
                <span className="text-blue-400 font-bold">
                  quantifiable metrics
                </span>{" "}
                with before/after green coverage percentages. Not just
                visuals—real data!
              </p>
            </div>

            <div className="bg-gray-900/80 p-6 rounded-2xl border-2 border-purple-500/30 hover:border-purple-400 transition-all hover:scale-105 transform hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-black text-white mb-3 text-lg">
                ⚡ Instant Results
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Transforms{" "}
                <span className="text-purple-400 font-bold">
                  days/weeks of manual planning into seconds
                </span>
                . AI-powered automation for rapid visualization.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid md:grid-cols-4 gap-10">
          {/* About Section */}
          <div className="col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg transform hover:rotate-12 transition-all duration-300">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-black text-white">
                Eco-Urbanist{" "}
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  AI
                </span>
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed text-base">
              🌍{" "}
              <span className="font-bold text-green-400">
                AI-powered urban planning
              </span>{" "}
              combining computer vision and generative AI to automatically
              produce green-enhanced city layouts. Works with{" "}
              <span className="font-bold">desert AND city images!</span>
            </p>

            {/* Target Audience */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/30 rounded-2xl p-5 mb-6">
              <p className="text-sm font-black text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Built For
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Urban Planners</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Architects</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Sustainability Teams</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>GIS Analysts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Researchers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Students</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-5">
              <p className="text-sm font-black text-green-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Connect With Us
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {/* GitHub */}
                <a
                  href="https://github.com/anaskazi-dev-mind/Eco-Urbanist-AI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 bg-gray-800 px-5 py-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-110 hover:-translate-y-1 shadow-xl hover:shadow-2xl border border-gray-700 hover:border-green-500"
                  aria-label="View Source Code on GitHub"
                >
                  <Github className="w-5 h-5 group-hover:text-green-400 transition-colors" />
                  <span className="text-sm font-bold">GitHub</span>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/anaskazi001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-110 hover:-translate-y-1 shadow-xl hover:shadow-blue-500/50 border-2 border-blue-500"
                  aria-label="Connect on LinkedIn"
                >
                  <Linkedin className="w-5 h-5 text-white" />
                  <span className="text-sm font-bold text-white">LinkedIn</span>
                </a>
              </div>

              {/* Star on GitHub CTA */}
              <a
                href="https://github.com/anaskazi-dev-mind/Eco-Urbanist-AI"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 px-6 py-3 rounded-xl hover:bg-gradient-to-r hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400 transition-all backdrop-blur-sm transform hover:scale-105"
                aria-label="Star this project on GitHub"
              >
                <Sparkles className="w-5 h-5 text-green-400 animate-pulse" />
                <span className="text-sm font-black text-green-400">
                  ⭐ Star this project on GitHub
                </span>
                <ExternalLink className="w-4 h-4 text-green-400 group-hover:translate-x-1 transition-transform" />
              </a>

              {/* Team Badge */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 px-5 py-4 rounded-xl backdrop-blur-sm">
                <p className="text-xs text-purple-400 font-semibold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  College Project Team
                </p>
                <a
                  href="https://github.com/anaskazi-dev-mind"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-black text-white hover:text-green-400 transition-colors flex items-center gap-2 mb-1"
                  aria-label="Visit Anas Kazi's GitHub Profile"
                >
                  <Code2 className="w-4 h-4" />
                  Anas Kazi & Team
                  <ExternalLink className="w-3 h-3" />
                </a>
                <p className="text-xs text-gray-400">
                  Built with passion by students 🎓
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-black mb-6 text-lg flex items-center">
              <span className="bg-gradient-to-b from-green-400 to-green-600 w-1.5 h-7 mr-3 rounded-full"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="group flex items-center hover:text-green-400 transition-all font-semibold text-gray-400"
                >
                  <span className="mr-2 text-green-500 group-hover:translate-x-2 transition-transform">
                    →
                  </span>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/upload"
                  className="group flex items-center hover:text-green-400 transition-all font-semibold text-gray-400"
                >
                  <span className="mr-2 text-green-500 group-hover:translate-x-2 transition-transform">
                    →
                  </span>
                  Upload Image
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  className="group flex items-center hover:text-green-400 transition-all font-semibold text-gray-400"
                >
                  <span className="mr-2 text-green-500 group-hover:translate-x-2 transition-transform">
                    →
                  </span>
                  Gallery
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/anaskazi-dev-mind/Eco-Urbanist-AI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center hover:text-green-400 transition-all font-semibold text-gray-400"
                  aria-label="View Source Code"
                >
                  <span className="mr-2 text-green-500 group-hover:translate-x-2 transition-transform">
                    →
                  </span>
                  Source Code
                  <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/anaskazi-dev-mind/Eco-Urbanist-AI#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center hover:text-green-400 transition-all font-semibold text-gray-400"
                  aria-label="Read Documentation"
                >
                  <span className="mr-2 text-green-500 group-hover:translate-x-2 transition-transform">
                    →
                  </span>
                  Documentation
                  <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/anaskazi-dev-mind/Eco-Urbanist-AI/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center hover:text-green-400 transition-all font-semibold text-gray-400"
                  aria-label="Report Issues on GitHub"
                >
                  <span className="mr-2 text-green-500 group-hover:translate-x-2 transition-transform">
                    →
                  </span>
                  Report Issues
                  <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>

          {/* Technology Stack */}
          <div>
            <h3 className="text-white font-black mb-6 text-lg flex items-center">
              <span className="bg-gradient-to-b from-green-400 to-green-600 w-1.5 h-7 mr-3 rounded-full"></span>
              Tech Stack
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-400 hover:text-green-400 transition-all group">
                <span className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3 group-hover:scale-150 transition-transform shadow-lg shadow-green-500/50"></span>
                <span className="font-semibold">Pix2Pix GAN</span>
              </li>
              <li className="flex items-center text-gray-400 hover:text-green-400 transition-all group">
                <span className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3 group-hover:scale-150 transition-transform shadow-lg shadow-green-500/50"></span>
                <span className="font-semibold">U-Net Generator</span>
              </li>
              <li className="flex items-center text-gray-400 hover:text-green-400 transition-all group">
                <span className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3 group-hover:scale-150 transition-transform shadow-lg shadow-green-500/50"></span>
                <span className="font-semibold">TensorFlow AI</span>
              </li>
              <li className="flex items-center text-gray-400 hover:text-green-400 transition-all group">
                <span className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3 group-hover:scale-150 transition-transform shadow-lg shadow-green-500/50"></span>
                <span className="font-semibold">Python + FastAPI</span>
              </li>
              <li className="flex items-center text-gray-400 hover:text-green-400 transition-all group">
                <span className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3 group-hover:scale-150 transition-transform shadow-lg shadow-green-500/50"></span>
                <span className="font-semibold">React + Vite</span>
              </li>
              <li className="flex items-center text-gray-400 hover:text-green-400 transition-all group">
                <span className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-3 group-hover:scale-150 transition-transform shadow-lg shadow-green-500/50"></span>
                <span className="font-semibold">OpenCV</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 🔧 NEW: Real Project Highlights (No Fake Stats) */}
        <div className="mt-14 pt-10 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 hover:bg-gray-800 transition-all transform hover:scale-110 hover:-translate-y-2 border-2 border-gray-700 hover:border-green-500 shadow-lg hover:shadow-green-500/30">
              <div className="flex items-center justify-center mb-3">
                <Cpu className="w-12 h-12 text-green-400" />
              </div>
              <p className="text-sm text-gray-400 font-bold text-center">
                Pix2Pix GAN Model
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 hover:bg-gray-800 transition-all transform hover:scale-110 hover:-translate-y-2 border-2 border-gray-700 hover:border-blue-500 shadow-lg hover:shadow-blue-500/30">
              <div className="flex items-center justify-center mb-3">
                <ImageIcon className="w-12 h-12 text-blue-400" />
              </div>
              <p className="text-sm text-gray-400 font-bold text-center">
                Before/After Analysis
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 hover:bg-gray-800 transition-all transform hover:scale-110 hover:-translate-y-2 border-2 border-gray-700 hover:border-purple-500 shadow-lg hover:shadow-purple-500/30">
              <div className="flex items-center justify-center mb-3">
                <Shield className="w-12 h-12 text-purple-400" />
              </div>
              <p className="text-sm text-gray-400 font-bold text-center">
                Open Source Project
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 hover:bg-gray-800 transition-all transform hover:scale-110 hover:-translate-y-2 border-2 border-gray-700 hover:border-green-500 shadow-lg hover:shadow-green-500/30">
              <div className="text-4xl text-center mb-2">🎓</div>
              <p className="text-sm text-gray-400 font-bold text-center">
                College Project
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            <p className="text-gray-400 text-sm font-semibold">
              © {currentYear} Eco-Urbanist AI. All rights reserved.
            </p>

            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-gray-400 text-sm flex items-center font-semibold">
                Built with{" "}
                <Heart className="w-5 h-5 mx-2 text-red-500 fill-current animate-pulse" />{" "}
                by{" "}
                <a
                  href="https://github.com/anaskazi-dev-mind"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-green-400 hover:text-green-300 font-bold transition-colors"
                  aria-label="Visit Anas Kazi's GitHub"
                >
                  Anas Kazi & Team
                </a>
              </p>
              <span className="text-gray-500 text-xs bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full font-bold">
                🎓 Academic Project
              </span>
            </div>
          </div>

          {/* Tech Stack Badges */}
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-4 font-black uppercase tracking-widest flex items-center justify-center gap-2">
              <Rocket className="w-4 h-4 text-green-500" />
              Powered by Modern Technologies
            </p>
            <div className="pb-12 flex justify-center gap-2.5 flex-wrap">
              <span className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 rounded-full text-xs font-black text-gray-300 border-2 border-gray-700 hover:border-green-500 transition-all shadow-lg">
                🐍 Python
              </span>
              <span className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 rounded-full text-xs font-black text-gray-300 border-2 border-gray-700 hover:border-green-500 transition-all shadow-lg">
                ⚛️ React
              </span>
              <span className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 rounded-full text-xs font-black text-gray-300 border-2 border-gray-700 hover:border-green-500 transition-all shadow-lg">
                🤖 TensorFlow
              </span>
              <span className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 rounded-full text-xs font-black text-gray-300 border-2 border-gray-700 hover:border-green-500 transition-all shadow-lg">
                ⚡ FastAPI
              </span>
              <span className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-2 rounded-full text-xs font-black text-gray-300 border-2 border-gray-700 hover:border-green-500 transition-all shadow-lg">
                🎨 GAN Model
              </span>
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-full text-xs font-black text-white border-2 border-green-400 shadow-lg shadow-green-500/50 animate-pulse">
                💚 Open Source
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
