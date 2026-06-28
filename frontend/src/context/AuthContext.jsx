/**
 * AuthContext.jsx
 * Place at: frontend/src/context/AuthContext.jsx
 *
 * Global auth state — login, signup, logout, currentUser.
 * Wrap App with <AuthProvider> so every component can call useAuth().
 */

import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // true until localStorage check done

  // On mount: restore session from localStorage if token still exists
  useEffect(() => {
    const user = api.getCurrentUser();
    if (user && api.isLoggedIn()) {
      setCurrentUser(user);
    }
    setAuthLoading(false);
  }, []);

  const signup = async (name, email, password) => {
    const result = await api.signup(name, email, password);
    if (result.success) setCurrentUser(result.data.user);
    return result;
  };

  const login = async (email, password) => {
    const result = await api.login(email, password);
    if (result.success) setCurrentUser(result.data.user);
    return result;
  };

  const logout = () => {
    api.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, authLoading, signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — use this in any component
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
