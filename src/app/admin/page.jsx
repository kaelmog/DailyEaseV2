/**
 * @file page.jsx (Admin Wrapper)
 * @description Master Control Panel connecting all CRUD components with Premium UI.
 */
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AdminCategoryForm from "../../components/AdminCategoryForm";
import AdminUserForm from "../../components/AdminUserForm";
import AdminProductManager from "../../components/AdminProductManager";
import AdminBundlingManager from "../../components/AdminBundlingManager";
import AdminOutletManager from "../../components/AdminOutletManager";
import AdminIngredientManager from "../../components/AdminIngredientManager";
import { useAuth } from "../../components/AuthProvider";
import { t } from "../../utils/dictionary";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("products");
  const { user } = useAuth();
  const router = useRouter();

  if (user?.role !== "admin" && user?.role !== "supervisor") {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 text-center">
          <span className="text-4xl block mb-4">⛔</span>
          <h1 className="text-xl font-bold text-stone-800 mb-2">
            {t("admin_access_denied")}
          </h1>
          <button
            onClick={() => router.push("/")}
            className="text-amber-600 font-bold hover:underline"
          >
            {t("btn_back")}
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "products", label: t("tab_products") },
    { id: "ingredients", label: t("tab_ingredients") },
    { id: "bundlings", label: t("tab_bundlings") },
    { id: "outlets", label: t("tab_outlets") },
    { id: "categories", label: t("tab_categories") },
    { id: "users", label: t("tab_users") },
  ];

  return (
    <div className="min-h-screen bg-stone-100 py-6 md:py-8 px-4">
      <div className="max-w-7xl mx-auto mb-6">
        {/* PREMIUM ADMIN HEADER */}
        <div className="bg-stone-900 text-stone-50 p-6 md:p-8 shadow-md mb-6 relative border-b-4 border-amber-600 rounded-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl hidden md:inline">⚙️</span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                {t("admin_master_panel")}
              </h1>
            </div>
            <button
              onClick={() => router.push("/")}
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-2 rounded-xl font-bold text-sm md:text-base transition-colors flex items-center gap-2 shadow-sm"
            >
              {t("btn_back")}
            </button>
          </div>
        </div>

        {/* TACTILE STONE TABS */}
        <div className="flex space-x-2 border-b border-stone-300 mb-6 overflow-x-auto pb-1 scrollbar-hide px-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 font-bold whitespace-nowrap rounded-t-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-stone-900 text-white shadow-sm transform translate-y-[1px]"
                  : "bg-stone-200 text-stone-600 hover:bg-stone-300 hover:text-stone-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* MAIN CONTENT CONTAINER */}
        <div className="bg-white p-4 md:p-6 lg:p-8 rounded-b-2xl rounded-tr-2xl shadow-sm border border-stone-200">
          {activeTab === "products" && <AdminProductManager />}
          {activeTab === "ingredients" && <AdminIngredientManager />}
          {activeTab === "bundlings" && <AdminBundlingManager />}
          {activeTab === "outlets" && <AdminOutletManager />}
          {activeTab === "categories" && <AdminCategoryForm />}
          {activeTab === "users" && <AdminUserForm />}
        </div>
      </div>
    </div>
  );
}
