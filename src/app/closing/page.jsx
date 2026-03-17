/**
 * @file page.jsx (Closing Form)
 * @description Fully responsive shift closing interface, reordered for better UX flow with Premium UI.
 */
"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";
import { useAutoSave } from "../../hooks/useAutoSave";
import { AccordionSection, Card } from "../../components/ui/Containers";
import { UniversalInput } from "../../components/ui/UniversalInput";
import { Button } from "../../components/ui/BaseComponents";
import { useAuth } from "../../components/AuthProvider";

import {
  calculateTotalRevenue,
  getFrozenSisa,
  getDisplaySisa,
  calculateShapingDeduction,
  calculateUsedIngredients,
  formatIDR,
} from "../../utils/closingMath";
import {
  generateSalesReport,
  generateProductSales,
  generateFrozenDisplay,
} from "../../utils/templateGenerators";
import { t } from "../../utils/dictionary";

export default function DailyClosingApp() {
  const { user } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [outlets, setOutlets] = useState([]);
  const [outletProductsMap, setOutletProductsMap] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);

  // Default to today (YYYY-MM-DD)
  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Auto-Save States
  const [selectedOutletId, setSelectedOutletId, clearOutlet, outletHydrated] =
    useAutoSave("wheat_outlet_id", "");
  const [inventory, setInventory, clearInventory, invHydrated] = useAutoSave(
    "wheat_inventory_v2",
    {},
  );
  const [ingredientInv, setIngredientInv, clearIngInv, ingInvHydrated] =
    useAutoSave("wheat_ing_inv", {});
  const [sales, setSales, clearSales, salesHydrated] = useAutoSave(
    "wheat_sales",
    {
      cash: 0,
      qris: 0,
      credit: 0,
      debit: 0,
      grabfood: 0,
      gofood: 0,
      shopeefood: 0,
      transfer: 0,
      transfer_outstanding: 0,
      voucher: 0,
      expenses: 0,
      expenseNote: "",
    },
  );
  const [categorySales, setCategorySales, clearCatSales, catSalesHydrated] =
    useAutoSave("wheat_cat_sales", {
      croissant: 0,
      bread: 0,
      promo: 0,
      snack: 0,
      coffee: 0,
      beverage: 0,
      hampers: 0,
      pb1: 0,
    });

  useEffect(() => {
    async function loadData() {
      const [catsRes, prodsRes, ingsRes, recipesRes, outletsRes, mapRes] =
        await Promise.all([
          supabase.from("product_categories").select("*").order("sort_order"),
          supabase.from("products").select("*").order("sort_order"),
          supabase.from("ingredients").select("*").order("sort_order"),
          supabase.from("gramasi_recipes").select("*"),
          supabase
            .from("outlets")
            .select("*")
            .eq("is_active", true)
            .order("name"),
          supabase.from("outlet_products").select("*"),
        ]);
      if (catsRes.data) setCategories(catsRes.data);
      if (prodsRes.data) setProducts(prodsRes.data);
      if (ingsRes.data) setIngredients(ingsRes.data);
      if (recipesRes.data) setRecipes(recipesRes.data);

      if (user?.role === "baker" && user?.outlet_id) {
        setOutlets(
          outletsRes.data?.filter((o) => o.id === user.outlet_id) || [],
        );
        setSelectedOutletId(user.outlet_id);
      } else {
        setOutlets(outletsRes.data || []);
      }
      if (mapRes.data) setOutletProductsMap(mapRes.data);
      setIsReady(true);
    }
    loadData();
    // eslint-disable-next-line
  }, [user]);

  const activeProducts = useMemo(() => {
    if (!selectedOutletId) return [];
    const mappedIds = outletProductsMap
      .filter((op) => op.outlet_id === selectedOutletId)
      .map((op) => op.product_id);
    return products.filter((p) => mappedIds.includes(p.id));
  }, [products, outletProductsMap, selectedOutletId]);

  const currentOutlet = useMemo(
    () =>
      outlets.find((o) => o.id === selectedOutletId) || {
        name: "Unknown Outlet",
      },
    [outlets, selectedOutletId],
  );

  const handleInvInput = (id, field, value) =>
    setInventory((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value === "" ? 0 : parseInt(value, 10),
      },
    }));
  const handleIngInput = (id, field, value) =>
    setIngredientInv((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value === "" ? 0 : parseInt(value, 10),
      },
    }));
  const handleSalesInput = (field, value) =>
    setSales((prev) => ({ ...prev, [field]: value }));
  const handleCatSalesInput = (field, value) =>
    setCategorySales((prev) => ({ ...prev, [field]: value }));

  const totalRevenue = useMemo(() => calculateTotalRevenue(sales), [sales]);
  const usedIngredients = useMemo(
    () => calculateUsedIngredients(activeProducts, inventory, recipes),
    [inventory, activeProducts, recipes],
  );

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert(t("copied"));
  };
  const handleShareWA = (text) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const submitShift = async () => {
    if (!confirm("Submit final shift report to database?")) return;
    setIsSubmitting(true);
    const reportData = {
      report_date: reportDate,
      outlet_id: selectedOutletId,
      user_id: user?.id,
      outlet_type: currentOutlet.outlet_type,
      sales_data: sales,
      inventory_data: inventory,
      gramasi_data: usedIngredients,
    };
    const { error } = await supabase.from("shift_reports").insert([reportData]);
    setIsSubmitting(false);
    if (error) alert("Error saving shift: " + error.message);
    else {
      alert("Shift saved to database!");
      setIsReviewing(false);
    }
  };

  if (
    !isReady ||
    !invHydrated ||
    !salesHydrated ||
    !outletHydrated ||
    !catSalesHydrated ||
    !ingInvHydrated
  ) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center font-bold text-stone-500">
        {t("loading")}
      </div>
    );
  }

  // ==========================================
  // REVIEW SCREEN
  // ==========================================
  if (isReviewing) {
    const isCinere = currentOutlet.name.toLowerCase().includes("cinere");
    return (
      <div className="max-w-7xl mx-auto min-h-screen bg-stone-100 pb-28 shadow-xl">
        <div className="bg-stone-900 text-stone-50 p-6 md:p-8 shadow-md mb-2 border-b-4 border-amber-600">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            {t("review_title")}
          </h1>
          <p className="text-stone-400 text-sm md:text-base">
            {t("review_subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 md:px-8 pt-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 flex flex-col">
            <h3 className="font-bold text-stone-800 mb-2">{t("report_1")}</h3>
            <textarea
              readOnly
              value={generateSalesReport(
                reportDate,
                sales,
                categorySales,
                totalRevenue,
                currentOutlet.name,
              )}
              className="w-full flex-grow h-64 lg:h-96 p-3 text-xs md:text-sm font-mono bg-stone-50 border border-stone-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-stone-100 text-stone-700"
            />
            <div className="flex gap-2 mt-auto">
              <Button
                variant="secondary"
                onClick={() =>
                  handleCopy(
                    generateSalesReport(
                      reportDate,
                      sales,
                      categorySales,
                      totalRevenue,
                      currentOutlet.name,
                    ),
                  )
                }
                className="flex-1 py-3"
              >
                {t("btn_copy")}
              </Button>
              <Button
                variant="success"
                onClick={() =>
                  handleShareWA(
                    generateSalesReport(
                      reportDate,
                      sales,
                      categorySales,
                      totalRevenue,
                      currentOutlet.name,
                    ),
                  )
                }
                className="flex-1 py-3"
              >
                {t("btn_wa")}
              </Button>
            </div>
          </div>
          {!isCinere && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 flex flex-col">
              <h3 className="font-bold text-stone-800 mb-2">{t("report_2")}</h3>
              <textarea
                readOnly
                value={generateProductSales(
                  reportDate,
                  activeProducts,
                  inventory,
                  currentOutlet.name,
                )}
                className="w-full flex-grow h-64 lg:h-96 p-3 text-xs md:text-sm font-mono bg-stone-50 border border-stone-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-stone-100 text-stone-700"
              />
              <div className="flex gap-2 mt-auto">
                <Button
                  variant="secondary"
                  onClick={() =>
                    handleCopy(
                      generateProductSales(
                        reportDate,
                        activeProducts,
                        inventory,
                        currentOutlet.name,
                      ),
                    )
                  }
                  className="flex-1 py-3"
                >
                  {t("btn_copy")}
                </Button>
                <Button
                  variant="success"
                  onClick={() =>
                    handleShareWA(
                      generateProductSales(
                        reportDate,
                        activeProducts,
                        inventory,
                        currentOutlet.name,
                      ),
                    )
                  }
                  className="flex-1 py-3"
                >
                  {t("btn_wa")}
                </Button>
              </div>
            </div>
          )}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 flex flex-col">
            <h3 className="font-bold text-stone-800 mb-2">
              {isCinere ? t("report_3_cinere") : t("report_3_normal")}
            </h3>
            <textarea
              readOnly
              value={generateFrozenDisplay(
                reportDate,
                activeProducts,
                inventory,
                ingredients,
                usedIngredients,
                currentOutlet.name,
              )}
              className="w-full flex-grow h-64 lg:h-96 p-3 text-xs md:text-sm font-mono bg-stone-50 border border-stone-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-stone-100 text-stone-700"
            />
            <div className="flex gap-2 mt-auto">
              <Button
                variant="secondary"
                onClick={() =>
                  handleCopy(
                    generateFrozenDisplay(
                      reportDate,
                      activeProducts,
                      inventory,
                      ingredients,
                      usedIngredients,
                      currentOutlet.name,
                    ),
                  )
                }
                className="flex-1 py-3"
              >
                {t("btn_copy")}
              </Button>
              <Button
                variant="success"
                onClick={() =>
                  handleShareWA(
                    generateFrozenDisplay(
                      reportDate,
                      activeProducts,
                      inventory,
                      ingredients,
                      usedIngredients,
                      currentOutlet.name,
                    ),
                  )
                }
                className="flex-1 py-3"
              >
                {t("btn_wa")}
              </Button>
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl bg-white border-t border-stone-200 p-4 flex justify-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
          <Button
            variant="secondary"
            onClick={() => setIsReviewing(false)}
            className="w-full md:w-1/2 py-4 shadow-sm font-bold"
          >
            {t("btn_back")}
          </Button>
        </div>
      </div>
    );
  }

  // ==========================================
  // INPUT SCREEN
  // ==========================================
  return (
    <div className="max-w-6xl mx-auto min-h-screen bg-stone-100 pb-36 shadow-2xl relative">
      {/* --- PREMIUM BESPOKE HEADER --- */}
      <div className="bg-stone-900 text-stone-50 p-6 md:p-8 shadow-md mb-6 relative border-b-4 border-amber-600">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌾</span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              {t("app_title")}
            </h1>
          </div>
          <button
            onClick={() => router.push("/")}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-2 rounded-xl font-bold text-sm md:text-base transition-colors flex items-center gap-2"
          >
            {t("btn_back")}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
              Outlet
            </label>
            <div className="relative">
              <select
                value={selectedOutletId}
                onChange={(e) => setSelectedOutletId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-white font-bold bg-stone-800 appearance-none cursor-pointer transition-colors"
              >
                <option value="" disabled>
                  {t("select_outlet")}
                </option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-400">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
              {t("date_label")}
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-white font-bold bg-stone-800 cursor-pointer transition-colors [color-scheme:dark]"
            />
          </div>
        </div>
      </div>
      {/* --- END HEADER --- */}

      {!selectedOutletId ? (
        <div className="px-4 text-center mt-10">
          <p className="text-stone-500 font-bold text-lg md:text-xl">
            {t("select_prompt")}
          </p>
        </div>
      ) : (
        <div className="px-4 md:px-8 space-y-6">
          {/* TOP: FINANCIAL & SALES BY CATEGORY */}
          <AccordionSection title={t("financial_title")} defaultOpen={false}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
              <UniversalInput
                type="currency"
                label="Cash"
                value={sales.cash}
                onChange={(v) => handleSalesInput("cash", v)}
              />
              <UniversalInput
                type="currency"
                label="Debit"
                value={sales.debit}
                onChange={(v) => handleSalesInput("debit", v)}
              />
              <UniversalInput
                type="currency"
                label="QRIS"
                value={sales.qris}
                onChange={(v) => handleSalesInput("qris", v)}
              />
              <UniversalInput
                type="currency"
                label="Credit"
                value={sales.credit}
                onChange={(v) => handleSalesInput("credit", v)}
              />
              <UniversalInput
                type="currency"
                label="Transfer"
                value={sales.transfer}
                onChange={(v) => handleSalesInput("transfer", v)}
              />
              <UniversalInput
                type="currency"
                label="Outstanding"
                value={sales.transfer_outstanding}
                onChange={(v) => handleSalesInput("transfer_outstanding", v)}
              />
              <UniversalInput
                type="currency"
                label="GrabFood"
                value={sales.grabfood}
                onChange={(v) => handleSalesInput("grabfood", v)}
              />
              <UniversalInput
                type="currency"
                label="GoFood"
                value={sales.gofood}
                onChange={(v) => handleSalesInput("gofood", v)}
              />
              <UniversalInput
                type="currency"
                label="ShopeeFood"
                value={sales.shopeefood}
                onChange={(v) => handleSalesInput("shopeefood", v)}
              />
              <UniversalInput
                type="currency"
                label="Expenses"
                value={sales.expenses}
                onChange={(v) => handleSalesInput("expenses", v)}
              />
            </div>
            <UniversalInput
              label={t("expense_notes")}
              placeholder={t("expense_placeholder")}
              value={sales.expenseNote}
              onChange={(v) => handleSalesInput("expenseNote", v)}
              className="mb-4"
            />
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-center font-extrabold text-stone-800 text-xl md:text-2xl shadow-inner">
              {t("total_revenue")} {formatIDR(totalRevenue)}
            </div>
          </AccordionSection>

          <AccordionSection title={t("category_title")} defaultOpen={false}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <UniversalInput
                type="currency"
                label="Croissant"
                value={categorySales.croissant}
                onChange={(v) => handleCatSalesInput("croissant", v)}
              />
              <UniversalInput
                type="currency"
                label="Bread"
                value={categorySales.bread}
                onChange={(v) => handleCatSalesInput("bread", v)}
              />
              <UniversalInput
                type="currency"
                label="Bundling"
                value={categorySales.promo}
                onChange={(v) => handleCatSalesInput("promo", v)}
              />
              <UniversalInput
                type="currency"
                label="Snack"
                value={categorySales.snack}
                onChange={(v) => handleCatSalesInput("snack", v)}
              />
              <UniversalInput
                type="currency"
                label="Coffee"
                value={categorySales.coffee}
                onChange={(v) => handleCatSalesInput("coffee", v)}
              />
              <UniversalInput
                type="currency"
                label="Beverage"
                value={categorySales.beverage}
                onChange={(v) => handleCatSalesInput("beverage", v)}
              />
              <UniversalInput
                type="currency"
                label="Hampers"
                value={categorySales.hampers}
                onChange={(v) => handleCatSalesInput("hampers", v)}
              />
              <UniversalInput
                type="currency"
                label="PB1"
                value={categorySales.pb1}
                onChange={(v) => handleCatSalesInput("pb1", v)}
              />
            </div>
          </AccordionSection>

          {/* SECOND: PRODUCT CATEGORIES (Bread, Pastry, etc.) */}
          {categories.map((cat) => {
            const catProducts = activeProducts.filter(
              (p) => p.category_id === cat.id,
            );
            if (catProducts.length === 0) return null;
            return (
              <AccordionSection
                key={cat.id}
                title={`📦 ${cat.name}`}
                defaultOpen={false}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {catProducts.map((prod) => {
                    const data = inventory[prod.id] || {};
                    const shapingDeduction = prod.is_base
                      ? calculateShapingDeduction(
                          prod.id,
                          activeProducts,
                          inventory,
                        )
                      : 0;
                    return (
                      <div
                        key={prod.id}
                        className="p-5 bg-white shadow-sm border border-stone-200 rounded-2xl hover:shadow-md transition-shadow"
                      >
                        <div className="font-bold text-stone-900 text-lg md:text-xl mb-4 border-b border-stone-100 pb-2">
                          {prod.name}
                        </div>

                        <div className="mb-5 bg-stone-50 p-4 rounded-xl border border-stone-100">
                          <span className="text-sm font-bold text-stone-700 uppercase mb-3 block tracking-wide">
                            {t("frozen_book")}
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <UniversalInput
                              type="number"
                              label={t("start")}
                              value={data.frozen_start || ""}
                              onChange={(v) =>
                                handleInvInput(prod.id, "frozen_start", v)
                              }
                            />
                            <UniversalInput
                              type="number"
                              label={t("in")}
                              value={data.frozen_in || ""}
                              onChange={(v) =>
                                handleInvInput(prod.id, "frozen_in", v)
                              }
                            />
                            <UniversalInput
                              type="number"
                              label={t("out")}
                              value={data.frozen_out || ""}
                              onChange={(v) =>
                                handleInvInput(prod.id, "frozen_out", v)
                              }
                            />
                            <UniversalInput
                              type="number"
                              label={t("waste")}
                              value={data.frozen_waste || ""}
                              onChange={(v) =>
                                handleInvInput(prod.id, "frozen_waste", v)
                              }
                            />
                          </div>
                        </div>

                        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
                          <span className="text-sm font-bold text-amber-800 uppercase mb-3 block tracking-wide">
                            {t("display_book")}
                          </span>
                          {prod.is_base && shapingDeduction > 0 && (
                            <div className="text-xs md:text-sm text-amber-800 font-bold mb-3 bg-amber-100 p-2.5 rounded-lg border border-amber-200 flex items-center gap-2">
                              <span>⚙️</span> -{shapingDeduction}{" "}
                              {t("shaping_deducted")}
                            </div>
                          )}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                            <UniversalInput
                              type="number"
                              label={t("start")}
                              value={data.display_start || ""}
                              onChange={(v) =>
                                handleInvInput(prod.id, "display_start", v)
                              }
                            />
                            <UniversalInput
                              type="number"
                              label={t("in")}
                              value={data.display_in || ""}
                              onChange={(v) =>
                                handleInvInput(prod.id, "display_in", v)
                              }
                            />
                            <UniversalInput
                              type="number"
                              label={t("sold")}
                              value={data.display_sold || ""}
                              onChange={(v) =>
                                handleInvInput(prod.id, "display_sold", v)
                              }
                            />
                            <UniversalInput
                              type="number"
                              label={t("waste")}
                              value={data.display_waste || ""}
                              onChange={(v) =>
                                handleInvInput(prod.id, "display_waste", v)
                              }
                            />
                          </div>
                          <div className="w-full sm:w-1/2">
                            <UniversalInput
                              type="number"
                              label={t("shaping")}
                              value={data.display_shaping || ""}
                              onChange={(v) =>
                                handleInvInput(prod.id, "display_shaping", v)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionSection>
            );
          })}

          {/* THIRD: INGREDIENTS INVENTORY */}
          <AccordionSection title={t("ingredients_title")} defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ingredients.map((ing) => {
                const data = ingredientInv[ing.id] || {};
                const sisa =
                  (data.start || 0) +
                  (data.in || 0) -
                  (data.out || 0) -
                  (data.waste || 0);
                return (
                  <div
                    key={ing.id}
                    className="p-5 bg-white border border-stone-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center font-bold mb-4 border-b border-stone-100 pb-2">
                      <span className="text-stone-800">
                        {ing.name}{" "}
                        <span className="text-stone-400 font-normal text-xs md:text-sm">
                          ({ing.unit})
                        </span>
                      </span>
                      <span
                        className={`text-xs md:text-sm px-3 py-1 rounded-full font-bold ${sisa < 0 ? "bg-red-50 text-red-600 border border-red-100" : "bg-stone-100 text-stone-700"}`}
                      >
                        {t("sisa")}: {sisa}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <UniversalInput
                        type="number"
                        label={t("start")}
                        value={data.start || ""}
                        onChange={(v) => handleIngInput(ing.id, "start", v)}
                      />
                      <UniversalInput
                        type="number"
                        label={t("in")}
                        value={data.in || ""}
                        onChange={(v) => handleIngInput(ing.id, "in", v)}
                      />
                      <UniversalInput
                        type="number"
                        label={t("out")}
                        value={data.out || ""}
                        onChange={(v) => handleIngInput(ing.id, "out", v)}
                      />
                      <UniversalInput
                        type="number"
                        label={t("waste")}
                        value={data.waste || ""}
                        onChange={(v) => handleIngInput(ing.id, "waste", v)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionSection>

          {/* BOTTOM: LIVE SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title={t("live_display_title")} className="h-full">
              <div className="max-h-56 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-stone-200">
                {activeProducts.map((p) => {
                  const sisa = getDisplaySisa(
                    inventory[p.id] || {},
                    p.is_base
                      ? calculateShapingDeduction(
                          p.id,
                          activeProducts,
                          inventory,
                        )
                      : 0,
                  );
                  if (sisa === 0) return null;
                  return (
                    <div
                      key={p.id}
                      className="text-sm md:text-base flex justify-between border-b border-stone-50 pb-2"
                    >
                      <span className="text-stone-600">{p.name}</span>
                      <span className="font-bold text-stone-900">{sisa}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card title={t("live_frozen_title")} className="h-full">
              <div className="max-h-56 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-stone-200">
                {activeProducts.map((p) => {
                  const sisa = getFrozenSisa(inventory[p.id] || {});
                  if (sisa === 0) return null;
                  return (
                    <div
                      key={p.id}
                      className="text-sm md:text-base flex justify-between border-b border-stone-50 pb-2"
                    >
                      <span className="text-stone-600">{p.name}</span>
                      <span className="font-bold text-stone-900">{sisa}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card title={t("gramasi_title")} className="h-full">
              {Object.keys(usedIngredients).length === 0 ? (
                <p className="text-sm text-stone-400 italic">
                  Input production to see material usage.
                </p>
              ) : (
                <div className="space-y-3 pr-2 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-200">
                  {Object.keys(usedIngredients).map((ingId) => {
                    const ing = ingredients.find((i) => i.id === ingId);
                    if (!ing) return null;
                    return (
                      <div
                        key={ingId}
                        className="flex justify-between text-sm md:text-base border-b border-stone-50 pb-2"
                      >
                        <span className="font-semibold text-stone-600">
                          {ing.name}
                        </span>
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          {usedIngredients[ingId]} {ing.unit}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Floating Footer */}
      {selectedOutletId && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl bg-stone-100/90 backdrop-blur-md border-t border-stone-200 p-4 md:p-6 flex flex-col gap-3 shadow-[0_-10px_20px_-5px_rgba(28,25,23,0.05)] z-50">
          <Button
            variant="secondary"
            onClick={() => setIsReviewing(true)}
            className="w-full py-4 text-lg font-bold"
          >
            {t("btn_review")}
          </Button>
          <Button
            variant="success"
            onClick={submitShift}
            isLoading={isSubmitting}
            className="w-full py-4 text-lg font-bold"
          >
            {t("btn_submit_db")}
          </Button>
        </div>
      )}
    </div>
  );
}
