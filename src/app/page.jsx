/**
 * @file page.jsx (Landing Page)
 * @description Role-based dashboard linking to various modules.
 */
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";
import { t } from "../utils/dictionary";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user)
    return <div className="p-10 text-center font-bold">Please log in.</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-10 px-4">
      <div className="w-full max-w-4xl">
        <div className="bg-blue-900 text-white p-8 rounded-2xl shadow-lg mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            Hello, {user.username}!
          </h1>
          <p className="text-blue-200 text-lg">{t("dash_subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CLOSING APP CARD */}
          <div
            onClick={() => router.push("/closing")}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-400 hover:-translate-y-1 transition-all"
          >
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t("dash_closing")}
            </h2>
            <p className="text-gray-500">{t("dash_closing_sub")}</p>
          </div>

          {/* HISTORY CARD */}
          <div
            onClick={() => router.push("/history")}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-400 hover:-translate-y-1 transition-all"
          >
            <div className="text-4xl mb-4">🕰️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t("dash_history")}
            </h2>
            <p className="text-gray-500">{t("dash_history_sub")}</p>
          </div>

          {/* ADMIN CARD (Only visible to admins/spv) */}
          {(user.role === "admin" || user.role === "supervisor") && (
            <div
              onClick={() => router.push("/admin")}
              className="bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-700 cursor-pointer hover:shadow-md hover:bg-gray-900 hover:-translate-y-1 transition-all md:col-span-2"
            >
              <div className="text-4xl mb-4">⚙️</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {t("dash_admin")}
              </h2>
              <p className="text-gray-400">{t("dash_admin_sub")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
