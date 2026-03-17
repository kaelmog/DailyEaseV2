/**
 * @file page.jsx (History)
 * @description Fully responsive view for past shift reports with Premium POS UI and robust filters.
 */
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { Card } from "../../components/ui/Containers";
import { UniversalInput } from "../../components/ui/UniversalInput";
import { Button } from "../../components/ui/BaseComponents";
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
    <div className="min-h-screen bg-stone-100 py-6 md:py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* PREMIUM HEADER */}
        <div className="bg-stone-900 text-stone-50 p-6 md:p-8 shadow-md mb-6 md:mb-8 relative border-b-4 border-amber-600 rounded-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl hidden md:inline">🕰️</span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                {t("dash_history")}
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

        {/* FILTER CARD */}
        <Card className="mb-6 md:mb-8 shadow-sm">
          <h2 className="font-bold text-stone-800 mb-5 text-lg">
            Periode Laporan
          </h2>

          <div className="flex flex-wrap gap-2 mb-6 border-b border-stone-200 pb-5">
            {[
              { id: "today", label: t("filter_today") },
              { id: "week", label: t("filter_week") },
              { id: "month", label: t("filter_month") },
              { id: "custom", label: t("filter_custom") },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-stone-900 text-white shadow-sm transform translate-y-[1px]"
                    : "bg-stone-50 text-stone-600 hover:bg-stone-200 hover:text-stone-800 border border-stone-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 items-end">
            <div>
              <UniversalInput
                type="date"
                label={t("filter_start")}
                value={dateFrom}
                onChange={(val) => {
                  setDateFrom(val);
                  setActiveTab("custom");
                }}
              />
            </div>
            <div>
              <UniversalInput
                type="date"
                label={t("filter_end")}
                value={dateTo}
                onChange={(val) => {
                  setDateTo(val);
                  setActiveTab("custom");
                }}
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
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 font-bold text-stone-700 text-sm">
                Outlet:{" "}
                {outlets.find((o) => o.id === user?.outlet_id)?.name ||
                  "Unknown"}
              </div>
            )}
          </div>

          <Button
            onClick={fetchReports}
            variant="primary"
            className="mt-6 w-full md:w-auto px-10 py-3.5 md:py-4 text-base"
          >
            {t("filter_apply")}
          </Button>
        </Card>

        {/* REPORTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
          {isLoading ? (
            <p className="col-span-full text-center font-bold text-stone-500 py-10">
              {t("loading")}
            </p>
          ) : reports.length === 0 ? (
            <div className="col-span-full text-center text-stone-500 bg-white p-10 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center">
              <span className="text-4xl block mb-3 opacity-50">📄</span>
              <p className="font-medium text-lg">{t("filter_no_data")}</p>
            </div>
          ) : (
            reports.map((r) => {
              const total = calculateTotalRevenue(r.sales_data || {});
              return (
                <div
                  key={r.id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:shadow-md hover:border-amber-400 transition-all group"
                >
                  <div className="flex justify-between items-start border-b border-stone-100 pb-4 mb-4">
                    <div>
                      <h3 className="font-bold text-lg md:text-xl text-stone-800 group-hover:text-amber-700 transition-colors">
                        {new Date(r.report_date).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                      <p className="text-sm text-stone-500 mt-2 flex flex-wrap items-center gap-2">
                        <span className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-md text-stone-700 font-medium">
                          📍 {r.outlets?.name || r.outlet_type}
                        </span>
                        <span className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-md text-stone-700 font-medium">
                          👤 {r.app_users?.username || "Unknown"}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block uppercase tracking-widest font-bold mb-1">
                        Total Revenue
                      </span>
                      <span className="font-extrabold text-emerald-700 text-xl md:text-2xl">
                        {formatIDR(total)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 flex flex-col items-center text-center">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-1">
                        Cash
                      </span>
                      <span className="font-bold text-stone-800">
                        {formatIDR(r.sales_data?.cash)}
                      </span>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 flex flex-col items-center text-center">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-1">
                        QRIS
                      </span>
                      <span className="font-bold text-stone-800">
                        {formatIDR(r.sales_data?.qris)}
                      </span>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 flex flex-col items-center text-center">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-1">
                        Debit
                      </span>
                      <span className="font-bold text-stone-800">
                        {formatIDR(r.sales_data?.debit)}
                      </span>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 flex flex-col items-center text-center">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-1">
                        Gofood
                      </span>
                      <span className="font-bold text-stone-800">
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
