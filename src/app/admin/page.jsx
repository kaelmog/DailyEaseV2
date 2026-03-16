/**
 * @file page.jsx (Admin Wrapper)
 * @description Master Control Panel connecting all CRUD components with responsive tabs.
 */
"use client";
import React, { useState } from "react";
import AdminCategoryForm from "../../components/AdminCategoryForm";
import AdminUserForm from "../../components/AdminUserForm";
import AdminProductManager from "../../components/AdminProductManager";
import AdminBundlingManager from "../../components/AdminBundlingManager";
import AdminOutletManager from "../../components/AdminOutletManager";
import AdminIngredientManager from "../../components/AdminIngredientManager";
import { useAuth } from "../../components/AuthProvider";
import { t } from "../../utils/dictionary";
import { useRouter } from "next/navigation"; // For back button

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("products");
  const { user } = useAuth();
  const router = useRouter();

  if (user?.role !== "admin" && user?.role !== "supervisor") {
    return (
      <div className="p-10 text-center text-red-600 font-bold">
        {t("admin_access_denied")}
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
    <div className="min-h-screen bg-gray-100 py-6 md:py-8 px-4">
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            {t("admin_master_panel")}
          </h1>
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 font-bold hover:underline md:text-lg"
          >
            {t("btn_back")}
          </button>
        </div>

        {/* Scrollable horizontal tabs on mobile */}
        <div className="flex space-x-2 border-b border-gray-300 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 font-bold whitespace-nowrap rounded-t-lg transition-colors ${activeTab === tab.id ? "bg-blue-600 text-white shadow-sm" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white p-4 md:p-6 lg:p-8 rounded-b-xl rounded-tr-xl shadow-md border border-gray-200">
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
