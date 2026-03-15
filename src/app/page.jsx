"use client";
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../utils/supabase";
import { useAutoSave } from "../hooks/useAutoSave";
import { AccordionSection, Card } from "../components/ui/Containers";
import { UniversalInput } from "../components/ui/UniversalInput";
import { Button } from "../components/ui/BaseComponents";
import { useAuth } from "../components/AuthProvider";

export default function DailyClosingApp() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- AUTO-SAVE STATES (Blackout Protection) ---
  const [outletType, setOutletType, clearOutlet, outletHydrated] = useAutoSave(
    "wheat_outlet",
    "fresh_bake",
  );
  const [inventory, setInventory, clearInventory, invHydrated] = useAutoSave(
    "wheat_inventory",
    {},
  );
  const [sales, setSales, clearSales, salesHydrated] = useAutoSave(
    "wheat_sales",
    {
      cash: 0,
      qris: 0,
      edc: 0,
      grabfood: 0,
      gofood: 0,
      shopeefood: 0,
      expenses: 0,
      expenseNote: "",
    },
  );

  useEffect(() => {
    async function loadData() {
      const [catsRes, prodsRes, ingsRes, recipesRes] = await Promise.all([
        supabase.from("product_categories").select("*").order("sort_order"),
        supabase.from("products").select("*").order("sort_order"),
        supabase.from("ingredients").select("*"),
        supabase.from("gramasi_recipes").select("*"),
      ]);

      if (catsRes.data) setCategories(catsRes.data);
      if (prodsRes.data) setProducts(prodsRes.data);
      if (ingsRes.data) setIngredients(ingsRes.data);
      if (recipesRes.data) setRecipes(recipesRes.data);
      setIsReady(true);
    }
    // eslint-disable-next-line
    loadData();
  }, []);

  // --- INPUT HANDLERS ---
  const handleInventoryInput = (productId, field, value) => {
    setInventory((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { start: 0, in: 0, sold: 0, waste: 0 }),
        [field]: value === "" ? 0 : parseInt(value, 10),
      },
    }));
  };

  const handleSalesInput = (field, value) => {
    setSales((prev) => ({ ...prev, [field]: value }));
  };

  // --- LOGIC ENGINES ---
  const getShapingDeduction = (baseProductId) => {
    if (outletType === "frozen_goods") return 0; // Frozen outlets don't shape dough
    let deduction = 0;
    products.forEach((p) => {
      if (p.base_product_id === baseProductId) {
        const pData = inventory[p.id];
        if (pData && pData.in) deduction += pData.in;
      }
    });
    return deduction;
  };

  const getSisa = (product) => {
    const data = inventory[product.id] || {
      start: 0,
      in: 0,
      sold: 0,
      waste: 0,
    };
    const shaping = product.is_base ? getShapingDeduction(product.id) : 0;
    return data.start + data.in - data.sold - data.waste - shaping;
  };

  const totalRevenue = useMemo(() => {
    return (
      (sales.cash || 0) +
      (sales.qris || 0) +
      (sales.edc || 0) +
      (sales.grabfood || 0) +
      (sales.gofood || 0) +
      (sales.shopeefood || 0)
    );
  }, [sales]);

  // GRAMASI DEPLETION CALCULATOR
  const usedIngredients = useMemo(() => {
    const usage = {};
    products.forEach((p) => {
      const data = inventory[p.id];
      if (data && data.in > 0) {
        const productRecipes = recipes.filter((r) => r.product_id === p.id);
        productRecipes.forEach((r) => {
          if (!usage[r.ingredient_id]) usage[r.ingredient_id] = 0;
          usage[r.ingredient_id] += data.in * r.amount_per_unit;
        });
      }
    });
    return usage;
  }, [inventory, products, recipes]);

  // --- WHATSAPP GENERATOR ---
  const formatIDR = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(num || 0);

  const generateReportText = () => {
    let text = `*LAPORAN CLOSING SHIFT*\nTanggal: ${new Date().toLocaleDateString("id-ID")}\nOutlet: ${outletType === "fresh_bake" ? "Fresh Bake" : "Frozen Goods"}\nStaff: ${user?.username || "Admin"}\n\n`;

    text += `*💰 FINANCIAL & SALES*\n`;
    text += `- Cash: ${formatIDR(sales.cash)}\n- QRIS: ${formatIDR(sales.qris)}\n- EDC: ${formatIDR(sales.edc)}\n`;
    text += `- GrabFood: ${formatIDR(sales.grabfood)}\n- GoFood: ${formatIDR(sales.gofood)}\n- ShopeeFood: ${formatIDR(sales.shopeefood)}\n`;
    text += `- Pengeluaran: ${formatIDR(sales.expenses)} ${sales.expenseNote ? `(${sales.expenseNote})` : ""}\n`;
    text += `*TOTAL REVENUE: ${formatIDR(totalRevenue)}*\n\n`;

    text += `*📦 INVENTORY PRODUK*\n`;
    categories.forEach((cat) => {
      const catProds = products.filter((p) => p.category_id === cat.id);
      if (catProds.length === 0) return;

      text += `\n[${cat.name.toUpperCase()}]\n`;
      catProds.forEach((p) => {
        const data = inventory[p.id] || { start: 0, in: 0, sold: 0, waste: 0 };
        const sisa = getSisa(p);
        const shaping = p.is_base ? getShapingDeduction(p.id) : 0;

        text += `- ${p.name}: Sold ${data.sold === 0 ? "-" : data.sold} | Sisa ${sisa}`;
        if (shaping > 0) text += ` (Shaping: -${shaping})`;
        if (data.waste > 0) text += ` (Waste: -${data.waste})`;
        text += `\n`;
      });
    });

    const usedIngKeys = Object.keys(usedIngredients);
    if (usedIngKeys.length > 0) {
      text += `\n*⚖️ PENGGUNAAN BAHAN (GRAMASI)*\n`;
      usedIngKeys.forEach((ingId) => {
        const ing = ingredients.find((i) => i.id === ingId);
        if (ing) {
          text += `- ${ing.name}: ${usedIngredients[ingId]} ${ing.unit}\n`;
        }
      });
    }

    return text;
  };

  // --- SUBMIT TO DATABASE ---
  const submitShift = async () => {
    if (!confirm("Submit final shift report to database?")) return;
    setIsSubmitting(true);

    const reportData = {
      outlet_type: outletType,
      sales_data: sales,
      inventory_data: inventory,
      gramasi_data: usedIngredients,
    };

    const { error } = await supabase.from("shift_reports").insert([reportData]);
    setIsSubmitting(false);

    if (error) {
      alert("Error saving shift: " + error.message);
    } else {
      navigator.clipboard.writeText(generateReportText());
      alert("Shift saved to database! WhatsApp report copied to clipboard.");
      // Optional: clear data for next shift
      // clearInventory(); clearSales();
    }
  };

  if (!isReady || !invHydrated || !salesHydrated || !outletHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">
        Loading ERP Core...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-100 pb-28">
      {/* HEADER & OUTLET SELECTOR */}
      <div className="bg-blue-900 text-white p-6 shadow-md mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">
          DailyEase Shift
        </h1>
        <p className="text-blue-200 text-sm mb-4">
          Input real-time stock and sales.
        </p>
        <UniversalInput
          type="select"
          value={outletType}
          onChange={setOutletType}
          options={[
            { id: "fresh_bake", name: "🏢 Fresh Bake Outlet (Shapes Dough)" },
            { id: "frozen_goods", name: "❄️ Frozen Goods Outlet" },
          ]}
          className="text-black"
        />
      </div>

      <div className="px-4 space-y-4">
        {/* FINANCIAL & SALES SECTION */}
        <AccordionSection
          title="💰 Financial & Sales Closing"
          defaultOpen={true}
        >
          <div className="space-y-3">
            <UniversalInput
              type="currency"
              label="Cash"
              value={sales.cash}
              onChange={(v) => handleSalesInput("cash", v)}
            />
            <div className="grid grid-cols-2 gap-3">
              <UniversalInput
                type="currency"
                label="QRIS"
                value={sales.qris}
                onChange={(v) => handleSalesInput("qris", v)}
              />
              <UniversalInput
                type="currency"
                label="EDC"
                value={sales.edc}
                onChange={(v) => handleSalesInput("edc", v)}
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
              label="Expense Notes"
              placeholder="e.g., Beli Plastik"
              value={sales.expenseNote}
              onChange={(v) => handleSalesInput("expenseNote", v)}
            />
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center font-extrabold text-green-800 text-xl">
              Total Revenue: {formatIDR(totalRevenue)}
            </div>
          </div>
        </AccordionSection>

        {/* INVENTORY SECTION */}
        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.category_id === cat.id);
          if (catProducts.length === 0) return null;

          return (
            <AccordionSection
              key={cat.id}
              title={`📦 ${cat.name}`}
              defaultOpen={false}
            >
              <div className="space-y-6">
                {catProducts.map((prod) => {
                  const data = inventory[prod.id] || {
                    start: 0,
                    in: 0,
                    sold: 0,
                    waste: 0,
                  };
                  const shaping = prod.is_base
                    ? getShapingDeduction(prod.id)
                    : 0;
                  const sisa = getSisa(prod);

                  return (
                    <div
                      key={prod.id}
                      className="p-3 bg-white shadow-sm border border-gray-200 rounded-xl relative overflow-hidden"
                    >
                      {/* PRODUCTION NOTES ALERT */}
                      {prod.production_notes && outletType === "fresh_bake" && (
                        <div className="bg-yellow-100 text-yellow-800 text-xs font-bold p-2 -mx-3 -mt-3 mb-3 border-b border-yellow-200">
                          ⚠️ NOTE: {prod.production_notes}
                        </div>
                      )}

                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-gray-800">
                          {prod.name}
                        </span>
                        <span
                          className={`text-sm font-bold px-2 py-1 rounded ${sisa < 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                        >
                          Sisa: {sisa}
                        </span>
                      </div>

                      {/* SHAPING WARNING */}
                      {prod.is_base && shaping > 0 && (
                        <div className="text-xs text-orange-600 font-bold mb-2 bg-orange-50 p-1.5 rounded border border-orange-100">
                          ⚙️ {shaping} deducted for shaping specialties
                        </div>
                      )}

                      <div className="grid grid-cols-4 gap-2">
                        <UniversalInput
                          type="number"
                          label="Start"
                          value={data.start || ""}
                          onChange={(val) =>
                            handleInventoryInput(prod.id, "start", val)
                          }
                        />
                        <UniversalInput
                          type="number"
                          label="In"
                          value={data.in || ""}
                          onChange={(val) =>
                            handleInventoryInput(prod.id, "in", val)
                          }
                        />
                        <UniversalInput
                          type="number"
                          label="Sold"
                          value={data.sold || ""}
                          onChange={(val) =>
                            handleInventoryInput(prod.id, "sold", val)
                          }
                        />
                        <UniversalInput
                          type="number"
                          label="Waste"
                          value={data.waste || ""}
                          onChange={(val) =>
                            handleInventoryInput(prod.id, "waste", val)
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionSection>
          );
        })}

        {/* GRAMASI USAGE DISPLAY */}
        <AccordionSection title="⚖️ Raw Material Usage" defaultOpen={false}>
          {Object.keys(usedIngredients).length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              Input production (In) to see material usage.
            </p>
          ) : (
            <div className="space-y-2">
              {Object.keys(usedIngredients).map((ingId) => {
                const ing = ingredients.find((i) => i.id === ingId);
                if (!ing) return null;
                return (
                  <div
                    key={ingId}
                    className="flex justify-between text-sm border-b pb-1"
                  >
                    <span className="font-semibold text-gray-700">
                      {ing.name}
                    </span>
                    <span className="font-bold text-blue-700">
                      {usedIngredients[ingId]} {ing.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </AccordionSection>
      </div>

      {/* FLOATING ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3 max-w-md mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <Button
          variant="secondary"
          onClick={() => navigator.clipboard.writeText(generateReportText())}
          className="w-1/3 text-xs"
        >
          📋 Copy WA
        </Button>
        <Button
          variant="primary"
          onClick={submitShift}
          isLoading={isSubmitting}
          className="w-2/3 shadow-md"
        >
          🚀 Submit Shift to DB
        </Button>
      </div>
    </div>
  );
}
