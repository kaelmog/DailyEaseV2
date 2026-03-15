"use client";
import React, { useState } from "react";
import AdminCategoryForm from "../../components/AdminCategoryForm";
import AdminUserForm from "../../components/AdminUserForm";
import AdminProductManager from "../../components/AdminProductManager";
import AdminBundlingManager from "../../components/AdminBundlingManager";
import AdminOutletManager from "../../components/AdminOutletManager";
import { useAuth } from "../../components/AuthProvider";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("products");
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return (
      <div className="p-10 text-center text-red-600 font-bold">
        Access Denied. Admin only.
      </div>
    );
  }

  const tabs = [
    { id: "products", label: "Products" },
    { id: "bundlings", label: "Bundlings & Hampers" },
    { id: "outlets", label: "Outlets & Templates" },
    { id: "categories", label: "Categories" },
    { id: "users", label: "Staff" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
          Master Control Panel
        </h1>

        <div className="flex space-x-2 border-b border-gray-300 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-bold whitespace-nowrap rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white p-6 rounded-b-lg rounded-tr-lg shadow-sm">
          {activeTab === "products" && <AdminProductManager />}
          {activeTab === "bundlings" && <AdminBundlingManager />}
          {activeTab === "outlets" && <AdminOutletManager />}
          {activeTab === "categories" && <AdminCategoryForm />}
          {activeTab === "users" && <AdminUserForm />}
        </div>
      </div>
    </div>
  );
}
