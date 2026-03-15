"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { Card } from "./ui/Containers";
import { UniversalInput } from "./ui/UniversalInput";
import { Button } from "./ui/BaseComponents";

// Create a Context so any part of your app can check who is logged in
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  // Login Form State
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 1. Check if they already logged in yesterday
  useEffect(() => {
    const savedUser = localStorage.getItem("wheat_erp_user");
    if (savedUser) {
      // eslint-disable-next-line
      setUser(JSON.parse(savedUser));
    }

    setIsChecking(false);
  }, []);

  // 2. Handle the Login attempt against Supabase
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { data, error: dbError } = await supabase
      .from("app_users")
      .select("*")
      .ilike("username", username)
      .eq("pin", pin)
      .single();

    setIsLoading(false);

    if (dbError || !data) {
      setError("Invalid Username or PIN.");
      return;
    }

    // Success! Save to state and local storage
    setUser(data);
    localStorage.setItem("wheat_erp_user", JSON.stringify(data));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("wheat_erp_user");
  };

  // 3. Show a blank screen while checking localStorage to prevent flickering
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center font-bold text-gray-500">
        Loading bentar...
      </div>
    );
  }

  // 4. THE LOCK: If no user, FORCE them to see the login screen. No exceptions.
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="w-full max-w-md">
          <Card
            title="DailyEase TW"
            subtitle="Please login to access the system."
          >
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded text-sm font-bold">
                  {error}
                </div>
              )}
              <UniversalInput
                label="Username"
                value={username}
                onChange={setUsername}
                required
                placeholder="Usernane"
              />

              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  placeholder="Enter Password"
                  className="w-full p-2 border rounded-md font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-900"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 mt-2"
                isLoading={isLoading}
              >
                Login
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // 5. If they are logged in, render the actual application!
  return (
    <AuthContext.Provider value={{ user, logout: handleLogout }}>
      <div className="fixed top-2 right-2 z-50">
        <button
          onClick={handleLogout}
          className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold shadow-sm hover:bg-red-200 transition-colors"
        >
          Logout ({user.username})
        </button>
      </div>

      {children}
    </AuthContext.Provider>
  );
}
