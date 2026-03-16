/**
 * @file page.jsx (Closing Form)
 * @description Fully responsive shift closing interface, reordered for better UX flow.
 */
"use client";
import React, { useState, useEffect, useMemo } from "react";
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
      setIsReviewing(false); // Close modal on success
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
      <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">
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
      <div className="max-w-7xl mx-auto min-h-screen bg-gray-100 pb-28 shadow-xl">
        <div className="bg-gray-900 text-white p-6 md:p-8 shadow-md mb-2">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {t("review_title")}
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            {t("review_subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 md:px-8 pt-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <h3 className="font-bold text-gray-800 mb-2">{t("report_1")}</h3>
            <textarea
              readOnly
              value={generateSalesReport(
                reportDate,
                sales,
                categorySales,
                totalRevenue,
                currentOutlet.name,
              )}
              className="w-full flex-grow h-64 lg:h-96 p-3 text-xs md:text-sm font-mono bg-gray-50 border rounded mb-4 focus:outline-none"
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
                className="flex-1 py-2"
              >
                {t("btn_copy")}
              </Button>
              <Button
                variant="primary"
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
                className="flex-1 py-2 bg-green-600 hover:bg-green-700"
              >
                {t("btn_wa")}
              </Button>
            </div>
          </div>
          {!isCinere && (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col">
              <h3 className="font-bold text-gray-800 mb-2">{t("report_2")}</h3>
              <textarea
                readOnly
                value={generateProductSales(
                  reportDate,
                  activeProducts,
                  inventory,
                  currentOutlet.name,
                )}
                className="w-full flex-grow h-64 lg:h-96 p-3 text-xs md:text-sm font-mono bg-gray-50 border rounded mb-4 focus:outline-none"
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
                  className="flex-1 py-2"
                >
                  {t("btn_copy")}
                </Button>
                <Button
                  variant="primary"
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
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700"
                >
                  {t("btn_wa")}
                </Button>
              </div>
            </div>
          )}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <h3 className="font-bold text-gray-800 mb-2">
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
              className="w-full flex-grow h-64 lg:h-96 p-3 text-xs md:text-sm font-mono bg-gray-50 border rounded mb-4 focus:outline-none"
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
                className="flex-1 py-2"
              >
                {t("btn_copy")}
              </Button>
              <Button
                variant="primary"
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
                className="flex-1 py-2 bg-green-600 hover:bg-green-700"
              >
                {t("btn_wa")}
              </Button>
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl bg-white border-t p-4 flex justify-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
          <Button
            variant="secondary"
            onClick={() => setIsReviewing(false)}
            className="w-full md:w-1/2 py-3 shadow-md font-bold text-gray-700"
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
    <div className="max-w-6xl mx-auto min-h-screen bg-gray-100 pb-36 shadow-2xl relative">
      <div className="bg-blue-900 text-white p-6 md:p-8 shadow-md mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {t("app_title")}
        </h1>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <UniversalInput
              type="select"
              value={selectedOutletId}
              onChange={setSelectedOutletId}
              options={outlets.map((o) => ({ id: o.id, name: o.name }))}
              className="text-black font-bold h-full"
              placeholder={t("select_outlet")}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">
              {t("date_label")}
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold bg-white shadow-inner"
            />
          </div>
        </div>
      </div>

      {!selectedOutletId ? (
        <div className="px-4 text-center mt-10">
          <p className="text-gray-500 font-bold text-lg md:text-xl">
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
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center font-extrabold text-green-800 text-xl md:text-2xl shadow-inner">
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
                        className="p-4 bg-white shadow-sm border border-gray-300 rounded-xl hover:shadow-md transition-shadow"
                      >
                        <div className="font-bold text-gray-900 text-lg md:text-xl mb-4 border-b pb-2">
                          {prod.name}
                        </div>

                        <div className="mb-5 bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <span className="text-sm font-bold text-blue-800 uppercase mb-3 block">
                            {t("frozen_book")}
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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

                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                          <span className="text-sm font-bold text-orange-800 uppercase mb-3 block">
                            {t("display_book")}
                          </span>
                          {prod.is_base && shapingDeduction > 0 && (
                            <div className="text-xs md:text-sm text-orange-700 font-bold mb-3 bg-orange-100 p-2 rounded border border-orange-200">
                              ⚙️ -{shapingDeduction} {t("shaping_deducted")}
                            </div>
                          )}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    className="p-4 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center font-bold mb-3 border-b pb-2">
                      <span className="text-gray-800">
                        {ing.name}{" "}
                        <span className="text-gray-500 font-normal text-xs md:text-sm">
                          ({ing.unit})
                        </span>
                      </span>
                      <span
                        className={`text-xs md:text-sm px-2 py-1 rounded-full ${sisa < 0 ? "bg-red-200 text-red-800" : "bg-blue-100 text-blue-800"}`}
                      >
                        {t("sisa")}: {sisa}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
              <div className="max-h-56 overflow-y-auto space-y-2 pr-2">
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
                      className="text-sm md:text-base flex justify-between border-b border-gray-100 pb-1"
                    >
                      <span>{p.name}</span>
                      <span className="font-bold text-orange-700">{sisa}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card title={t("live_frozen_title")} className="h-full">
              <div className="max-h-56 overflow-y-auto space-y-2 pr-2">
                {activeProducts.map((p) => {
                  const sisa = getFrozenSisa(inventory[p.id] || {});
                  if (sisa === 0) return null;
                  return (
                    <div
                      key={p.id}
                      className="text-sm md:text-base flex justify-between border-b border-gray-100 pb-1"
                    >
                      <span>{p.name}</span>
                      <span className="font-bold text-blue-700">{sisa}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card title={t("gramasi_title")} className="h-full">
              {Object.keys(usedIngredients).length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  Input production to see material usage.
                </p>
              ) : (
                <div className="space-y-2 pr-2 max-h-56 overflow-y-auto">
                  {Object.keys(usedIngredients).map((ingId) => {
                    const ing = ingredients.find((i) => i.id === ingId);
                    if (!ing) return null;
                    return (
                      <div
                        key={ingId}
                        className="flex justify-between text-sm md:text-base border-b border-gray-100 pb-1"
                      >
                        <span className="font-semibold text-gray-700">
                          {ing.name}
                        </span>
                        <span className="font-bold text-green-700">
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
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl bg-white border-t p-4 flex flex-col gap-2 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] z-50">
          <Button
            variant="secondary"
            onClick={() => setIsReviewing(true)}
            className="w-full py-3 md:py-4 shadow-sm text-lg font-bold rounded-xl transition-colors"
          >
            {t("btn_review")}
          </Button>
          <Button
            variant="primary"
            onClick={submitShift}
            isLoading={isSubmitting}
            className="w-full py-3 md:py-4 shadow-md text-lg font-bold rounded-xl hover:scale-[1.01] transition-transform"
          >
            {t("btn_submit_db")}
          </Button>
        </div>
      )}
    </div>
  );
}
