/**
 * @file page.jsx (Landing Page & Login)
 * @description Standard Username/Password Login and Role-based dashboard with Premium UI.
 */
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabase";
import { useAuth } from "../components/AuthProvider";
import { t } from "../utils/dictionary";
import { UniversalInput } from "../components/ui/UniversalInput";
import { Button } from "../components/ui/BaseComponents";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // --- LOGIN STATE ---
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginUsername || !loginPin) return;
    setIsLoggingIn(true);
    setError("");

    // Fetch user from Supabase by Username and PIN (Password)
    const { data, error: fetchError } = await supabase
      .from("app_users")
      .select("*")
      .ilike("username", loginUsername) // ilike makes it case-insensitive
      .eq("pin", loginPin)
      .single();

    setIsLoggingIn(false);

    if (fetchError || !data) {
      setError("Username atau Password salah.");
      setLoginPin(""); // Clear password on fail
    } else {
      // Save session to local storage and reload so AuthProvider catches it
      localStorage.setItem("wheat_user", JSON.stringify(data));
      window.location.reload();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("wheat_user");
    window.location.reload();
  };

  // ==========================================
  // UNAUTHENTICATED VIEW: STANDARD LOGIN
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-5xl mb-4 block">🌾</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
              The Wheat
            </h1>
            <p className="text-stone-500 font-medium mt-1">
              Sistem Laporan & POS
            </p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-stone-200">
            <h2 className="text-xl font-bold text-stone-800 mb-6 text-center">
              Login Dashboard
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <UniversalInput
                label="Username"
                value={loginUsername}
                onChange={setLoginUsername}
                required
                placeholder="Masukkan username..."
              />
              <UniversalInput
                type="password"
                label="Password / PIN"
                value={loginPin}
                onChange={setLoginPin}
                required
                placeholder="••••••••"
              />
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoggingIn}
                className="w-full py-4 text-lg mt-4 shadow-md"
              >
                Masuk
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTHENTICATED VIEW: MAIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center pt-8 md:pt-12 px-4">
      <div className="w-full max-w-5xl">
        {/* PREMIUM DASHBOARD HEADER */}
        <div className="bg-stone-900 text-stone-50 p-6 md:p-10 rounded-[2rem] shadow-xl mb-8 border-b-4 border-amber-600 relative overflow-hidden">
          {/* Responsive Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌾</span>
              <span className="text-amber-500 font-bold tracking-widest text-xs md:text-sm">
                THE WHEAT POS
              </span>
            </div>
            {/* The Fully Responsive Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-stone-800 hover:bg-red-900/80 text-stone-300 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
            >
              <span className="hidden md:inline">Logout</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3 text-white tracking-tight">
              Hello, {user.username}!
            </h1>
            <p className="text-stone-400 text-lg md:text-xl">
              {t("dash_subtitle")}
            </p>
          </div>
        </div>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CLOSING APP CARD */}
          <div
            onClick={() => router.push("/closing")}
            className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200 cursor-pointer hover:shadow-lg hover:border-amber-400 hover:-translate-y-1 transition-all group"
          >
            <div className="text-5xl mb-5 group-hover:scale-110 transition-transform origin-left">
              📝
            </div>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">
              {t("dash_closing")}
            </h2>
            <p className="text-stone-500">{t("dash_closing_sub")}</p>
          </div>

          {/* HISTORY CARD */}
          <div
            onClick={() => router.push("/history")}
            className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200 cursor-pointer hover:shadow-lg hover:border-amber-400 hover:-translate-y-1 transition-all group"
          >
            <div className="text-5xl mb-5 group-hover:scale-110 transition-transform origin-left">
              🕰️
            </div>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">
              {t("dash_history")}
            </h2>
            <p className="text-stone-500">{t("dash_history_sub")}</p>
          </div>

          {/* ADMIN CARD (Only visible to admins/spv) */}
          {(user.role === "admin" || user.role === "supervisor") && (
            <div
              onClick={() => router.push("/admin")}
              className="bg-stone-800 p-8 rounded-[2rem] shadow-md border border-stone-700 cursor-pointer hover:shadow-xl hover:bg-stone-900 hover:-translate-y-1 transition-all md:col-span-2 group"
            >
              <div className="text-5xl mb-5 group-hover:scale-110 transition-transform origin-left">
                ⚙️
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {t("dash_admin")}
              </h2>
              <p className="text-stone-400">{t("dash_admin_sub")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
