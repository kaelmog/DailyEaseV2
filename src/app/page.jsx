/**
 * @file page.jsx (Landing Page & Login)
 * @description Standard Username/Password Login and Role-based dashboard with Premium UI & i18n.
 */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabase";
import { useAuth } from "../components/AuthProvider";
import { t } from "../utils/dictionary";
import { UniversalInput } from "../components/ui/UniversalInput";
import { Button } from "../components/ui/BaseComponents";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showSpecialIntro, setShowSpecialIntro] = useState(false);

  useEffect(() => {
    if (user && user.username.toLowerCase() === "ralismee") {
      // eslint-disable-next-line
      setShowSpecialIntro(true);
      const timer = setTimeout(() => setShowSpecialIntro(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginUsername || !loginPin) return;
    setIsLoggingIn(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("app_users")
      .select("*")
      .ilike("username", loginUsername)
      .eq("pin", loginPin)
      .single();

    setIsLoggingIn(false);

    if (fetchError || !data) {
      setError(t("login_err_invalid"));
      setLoginPin("");
    } else {
      localStorage.setItem("wheat_user", JSON.stringify(data));
      window.location.reload();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("wheat_user");
    window.location.reload();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-5xl mb-4 block">🌾</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
              {t("app_title")}
            </h1>
            <p className="text-stone-500 font-medium mt-1">
              {t("app_subtitle")}
            </p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-stone-200">
            <h2 className="text-xl font-bold text-stone-800 mb-6 text-center">
              {t("login_title")}
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <UniversalInput
                label={t("login_user_label")}
                value={loginUsername}
                onChange={setLoginUsername}
                required
                placeholder={t("login_user_ph")}
              />
              <UniversalInput
                type="password"
                label={t("login_pin_label")}
                value={loginPin}
                onChange={setLoginPin}
                required
                placeholder={t("login_pin_ph")}
              />
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoggingIn}
                className="w-full py-4 text-lg mt-4 shadow-md"
              >
                {t("login_btn")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (showSpecialIntro) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4">
        <div className="text-center animate-pulse">
          <span className="text-6xl mb-6 block">🌹</span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-pink-400 tracking-tight mb-2">
            Halo Sayang...
          </h1>
          <p className="text-stone-400 text-lg font-medium">
            Semangat kerjanya hari ini ya! 💖
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center pt-8 md:pt-12 px-4">
      <div className="w-full max-w-5xl">
        <div className="bg-stone-900 text-stone-50 p-6 md:p-10 rounded-[2rem] shadow-xl mb-8 border-b-4 border-amber-600 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌾</span>
              <span className="text-amber-500 font-bold tracking-widest text-xs md:text-sm">
                {t("app_title")}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-stone-800 hover:bg-red-900/80 text-stone-300 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
            >
              <span className="hidden md:inline">{t("dash_logout")}</span>
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
              {user.username.toLowerCase() === "ralismee"
                ? "Hello, Sayang 💖"
                : `Hello, ${user.username.toUpperCase()}!`}
            </h1>
            <p className="text-stone-400 text-lg md:text-xl">
              {t("dash_subtitle")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* NEW: PRODUCT KNOWLEDGE CARD */}
          <div
            onClick={() => router.push("/knowledge")}
            className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200 cursor-pointer hover:shadow-lg hover:border-amber-400 hover:-translate-y-1 transition-all group"
          >
            <div className="text-5xl mb-5 group-hover:scale-110 transition-transform origin-left">
              📚
            </div>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">
              {t("dash_knowledge")}
            </h2>
            <p className="text-stone-500">{t("dash_knowledge_sub")}</p>
          </div>

          {(user.role === "admin" || user.role === "supervisor") && (
            <div
              onClick={() => router.push("/admin")}
              className="bg-stone-800 p-8 rounded-[2rem] shadow-md border border-stone-700 cursor-pointer hover:shadow-xl hover:bg-stone-900 hover:-translate-y-1 transition-all group"
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
