/**
 * @file page.jsx (History)
 * @description Fully responsive view for past shift reports with robust filters.
 */
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { Card } from "../../components/ui/Containers";
import { UniversalInput } from "../../components/ui/UniversalInput";
import { useAuth } from "../../components/AuthProvider";
import { formatIDR, calculateTotalRevenue } from "../../utils/closingMath";
import { t } from "../../utils/dictionary";
import { useRouter } from "next/navigation";

const getLocalDateString = (dateObj = new Date()) => {
  const d = new Date(dateObj);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
};

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("today");
  const [dateFrom, setDateFrom] = useState(getLocalDateString());
  const [dateTo, setDateTo] = useState(getLocalDateString());
  const [outletFilter, setOutletFilter] = useState("");

  useEffect(() => {
    async function loadInitial() {
      const { data: oData } = await supabase.from("outlets").select("*");
      if (oData) setOutlets(oData);
      if (user?.role === "baker" && user?.outlet_id)
        setOutletFilter(user.outlet_id);
      // eslint-disable-next-line
      fetchReports();
    }
    if (user) loadInitial();
    // eslint-disable-next-line
  }, [user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const today = new Date();

    if (tab === "today") {
      const d = getLocalDateString(today);
      setDateFrom(d);
      setDateTo(d);
    } else if (tab === "week") {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      setDateFrom(getLocalDateString(monday));
      setDateTo(getLocalDateString(sunday));
    } else if (tab === "month") {
      const y = today.getFullYear();
      const m = today.getMonth();
      const firstDay = new Date(y, m, 1);
      const lastDay = new Date(y, m + 1, 0);
      setDateFrom(getLocalDateString(firstDay));
      setDateTo(getLocalDateString(lastDay));
    }
  };

  const fetchReports = async () => {
    setIsLoading(true);
    let query = supabase
      .from("shift_reports")
      .select("*, outlets(name), app_users(username)")
      .gte("report_date", dateFrom)
      .lte("report_date", dateTo)
      .order("report_date", { ascending: false })
      .order("created_at", { ascending: false });

    const activeOutlet =
      user?.role === "baker" && user?.outlet_id ? user.outlet_id : outletFilter;
    if (activeOutlet) query = query.eq("outlet_id", activeOutlet);

    const { data, error } = await query;
    if (error) console.error("Error:", error);
    if (data) setReports(data);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 md:py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            {t("dash_history")}
          </h1>
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 font-bold hover:underline md:text-lg"
          >
            {t("btn_back")}
          </button>
        </div>

        <Card className="mb-6 md:mb-8 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4 text-lg">
            Periode Laporan
          </h2>
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
            {[
              { id: "today", label: t("filter_today") },
              { id: "week", label: t("filter_week") },
              { id: "month", label: t("filter_month") },
              { id: "custom", label: t("filter_custom") },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === tab.id ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                {t("filter_start")}
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setActiveTab("custom");
                }}
                className="w-full p-2.5 rounded border border-gray-300 text-sm font-bold bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                {t("filter_end")}
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setActiveTab("custom");
                }}
                className="w-full p-2.5 rounded border border-gray-300 text-sm font-bold bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {user?.role === "admin" || user?.role === "supervisor" ? (
              <UniversalInput
                type="select"
                label="Outlet"
                value={outletFilter}
                onChange={setOutletFilter}
                options={[{ id: "", name: "Semua Outlet" }, ...outlets]}
              />
            ) : (
              <div className="p-3 bg-gray-200 rounded border border-gray-300 font-bold text-gray-600 text-sm">
                Outlet:{" "}
                {outlets.find((o) => o.id === user?.outlet_id)?.name ||
                  "Unknown"}
              </div>
            )}
          </div>

          <button
            onClick={fetchReports}
            className="mt-6 w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded shadow-md hover:bg-blue-700 transition-colors"
          >
            {t("filter_apply")}
          </button>
        </Card>

        {/* RESPONSIVE GRID FOR REPORTS: 1 Col Mobile, 2 Cols Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {isLoading ? (
            <p className="col-span-full text-center font-bold text-gray-500 py-10">
              {t("loading")}
            </p>
          ) : reports.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 bg-white p-8 rounded-lg shadow-sm">
              {t("filter_no_data")}
            </p>
          ) : (
            reports.map((r) => {
              const total = calculateTotalRevenue(r.sales_data || {});
              return (
                <div
                  key={r.id}
                  className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start border-b pb-3 mb-4">
                    <div>
                      <h3 className="font-bold text-lg md:text-xl text-gray-900">
                        {new Date(r.report_date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        📍{" "}
                        <span className="font-semibold text-gray-700">
                          {r.outlets?.name || r.outlet_type}
                        </span>{" "}
                        • 👤{" "}
                        <span className="font-semibold text-gray-700">
                          {r.app_users?.username || "Unknown"}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block uppercase tracking-wider font-bold mb-1">
                        Total Revenue
                      </span>
                      <span className="font-extrabold text-green-700 text-xl">
                        {formatIDR(total)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col items-center text-center">
                      <span className="text-xs text-gray-500 mb-1">Cash</span>
                      <span className="font-bold text-gray-800">
                        {formatIDR(r.sales_data?.cash)}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col items-center text-center">
                      <span className="text-xs text-gray-500 mb-1">QRIS</span>
                      <span className="font-bold text-gray-800">
                        {formatIDR(r.sales_data?.qris)}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col items-center text-center">
                      <span className="text-xs text-gray-500 mb-1">Debit</span>
                      <span className="font-bold text-gray-800">
                        {formatIDR(r.sales_data?.debit)}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col items-center text-center">
                      <span className="text-xs text-gray-500 mb-1">Gofood</span>
                      <span className="font-bold text-gray-800">
                        {formatIDR(r.sales_data?.gofood)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
