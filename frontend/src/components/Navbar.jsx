import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // ADDED useNavigate
import {
  Menu,
  X,
  Leaf,
  Sparkles,
  Image as ImageIcon,
  LogOut,
  User,
} from "lucide-react"; // ADDED LogOut, User
import { useAuth } from "../context/AuthContext"; // ADDED

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate(); // ADDED
  const { currentUser, logout } = useAuth(); // ADDED

  const toggleMenu = () => setIsOpen(!isOpen);
  const isActive = (path) => location.pathname === path;

  // ADDED: logout handler
  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="container-custom">
        <div className="flex justify-between items-center h-20">
          {/* Logo — unchanged */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2.5 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black text-gray-900">
              Eco-Urbanist <span className="text-green-600">AI</span>
            </span>
          </Link>

          {/* ── Desktop Navigation ── */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/"
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 ${isActive("/") ? "text-green-600 bg-green-50" : "text-gray-700 hover:text-green-600 hover:bg-gray-50"}`}
            >
              Home
            </Link>

            {/* ADDED: show Upload + Gallery + user info only when logged in */}
            {currentUser ? (
              <>
                <Link
                  to="/upload"
                  className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 ${isActive("/upload") ? "text-green-600 bg-green-50" : "text-gray-700 hover:text-green-600 hover:bg-gray-50"}`}
                >
                  Upload
                </Link>
                <Link
                  to="/gallery"
                  className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${isActive("/gallery") ? "text-green-600 bg-green-50" : "text-gray-700 hover:text-green-600 hover:bg-gray-50"}`}
                >
                  <ImageIcon className="w-4 h-4" />
                  Gallery
                </Link>

                {/* ADDED: first name badge */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 font-semibold text-sm">
                  <User className="w-4 h-4" />
                  {currentUser.name.split(" ")[0]}
                </div>

                {/* ADDED: logout button — type="button" so it never submits a form */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="ml-2 flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-red-600 hover:bg-red-50 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* ADDED: Login + Get Started (Signup) when logged out */}
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-lg font-semibold text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-all duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="ml-2 group inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-7 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button — CHANGED: added type="button" + aria-label */}
          <button
            type="button"
            onClick={toggleMenu}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="md:hidden p-3 rounded-xl hover:bg-gray-100 transition-all duration-300 transform active:scale-95"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {isOpen && (
          <div className="md:hidden py-6 border-t border-gray-100 animate-fadeIn">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                onClick={toggleMenu}
                className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${isActive("/") ? "text-green-600 bg-green-50" : "text-gray-700 hover:text-green-600 hover:bg-gray-50"}`}
              >
                Home
              </Link>

              {/* ADDED: auth-aware mobile links */}
              {currentUser ? (
                <>
                  <Link
                    to="/upload"
                    onClick={toggleMenu}
                    className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${isActive("/upload") ? "text-green-600 bg-green-50" : "text-gray-700 hover:text-green-600 hover:bg-gray-50"}`}
                  >
                    Upload
                  </Link>
                  <Link
                    to="/gallery"
                    onClick={toggleMenu}
                    className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${isActive("/gallery") ? "text-green-600 bg-green-50" : "text-gray-700 hover:text-green-600 hover:bg-gray-50"}`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Gallery
                  </Link>

                  {/* ADDED: user name row in mobile menu */}
                  <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-50 text-green-700 font-semibold text-sm">
                    <User className="w-4 h-4" />
                    {currentUser.name}
                  </div>

                  {/* ADDED: logout — type="button" */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={toggleMenu}
                    className="px-5 py-3 rounded-xl font-semibold text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-all duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={toggleMenu}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-7 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold shadow-lg text-center"
                  >
                    <Sparkles className="w-4 h-4" />
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
