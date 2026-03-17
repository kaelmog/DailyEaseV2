/**
 * @file AuthProvider.jsx
 * @description Global state manager for user authentication. Pure logic, no UI.
 */
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Check local storage for existing session
    const storedSession = localStorage.getItem("wheat_user");
    if (storedSession) {
      try {
        // eslint-disable-next-line
        setUser(JSON.parse(storedSession));
      } catch (err) {
        console.error("Failed to parse user session");
      }
    }
    setIsHydrated(true);
  }, []);

  const logout = () => {
    localStorage.removeItem("wheat_user");
    setUser(null);
    window.location.href = "/"; // Redirect to login/dashboard
  };

  // Prevent rendering children until hydration is complete to avoid hydration mismatches
  if (!isHydrated) return null;

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
