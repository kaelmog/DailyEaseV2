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
  
  // NEW: Controls the 2-step UI flow
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- AUTO-SAVE STATES ---
  const [outletType, setOutletType, clearOutlet, outletHydrated] = useAutoSave(
    "wheat_outlet",
    "fresh_bake"
  );
  const [inventory, setInventory, clearInventory, invHydrated] = useAutoSave(
    "wheat_inventory",
    {}
  );
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
    }
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
    if (outletType === "frozen_goods") return 0;
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
      (sales.credit || 0) +
      (sales.debit || 0) +
      (sales.grabfood || 0) +
      (sales.gofood || 0) +
      (sales.shopeefood || 0) +
      (sales.transfer || 0) +
      (sales.voucher || 0) +
      (sales.transfer_outstanding || 0)
    );
  }, [sales]);

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

  const formatIDR = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(num || 0);

  // --- EXACT TEMPLATE GENERATOR ---
  const generateReportText = () => {
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('id-ID', dateOptions);
    const outletName = outletType === 'fresh_bake' ? 'The Wheat Cibubur' : 'The Wheat Fresh Market';
    const outletNameUpper = outletName.toUpperCase();

    let text = `*Sales Report closing Outlet ${outletName} hari ${today}*\n\n`;
    text += `1. Cash\t: ${formatIDR(sales.cash)}\n`;
    text += `2. Qris\t: ${formatIDR(sales.qris)}\n`;
    text += `3. Grabfood\t: ${formatIDR(sales.grabfood)}\n`;
    text += `4. Gofood\t: ${formatIDR(sales.gofood)}\n`;
    text += `5. Shopeefood\t: ${formatIDR(sales.shopeefood)}\n`;
    text += `6. Debit\t: ${formatIDR(sales.debit)}\n`; 
    text += `7. Credit card\t: ${formatIDR(sales.credit)}\n`;
    text += `8. Transfer\t: ${formatIDR(sales.transfer)}\n`;
    text += `9. Voucher\t: ${formatIDR(sales.voucher)}\n`;
    text += `10. Transfer outstanding\t: ${formatIDR(sales.transfer_outstanding)}\n`;
    text += `*TOTAL*\t: ${formatIDR(totalRevenue)}\n\n\n`;

    text += `*Sales Report Produk ${outletName} hari ${today}*\n\n`;
    categories.forEach(cat => {
      text += `${cat.name} : Rp -\n`;
    });
    text += `Promo Bundling : Rp -\n`;
    text += `Hampers : Rp -\n`;
    text += `PB1 : Rp -\n\nTerima kasih 🙏\n\n\n`;

    const frozenList = [
      { label: "Butter Croissant", matchKeys: ["butter croissant", "croissant plain"] },
      { label: "Gourmandise", matchKeys: ["gourmandise"] },
      { label: "Mushroom", matchKeys: ["mushroom"] },
      { label: "Pistachio Matcha", matchKeys: ["pistachio"] },
      { label: "Egg&Corned", matchKeys: ["corn", "egg &"] },
      { label: "Bolognese", matchKeys: ["bolognese"] },
      { label: "Tape Cheese", matchKeys: ["tape"] },
      { label: "Martabak Croissant", matchKeys: ["martabak"] },
      { label: "Almond Croissant", matchKeys: ["almond"] },
      { label: "Pain Au Chocola", matchKeys: ["pain au"] },
      { label: "Matcha Kouign Aman", matchKeys: ["kouign"] },
      { label: "Cheese Cake Slice", matchKeys: ["cheese cake", "brunth"] },
      { label: "Ketupat Rendang", matchKeys: ["ketupat"] }
    ];

    const displayList = [
      { label: "Butter Croissant", matchKeys: ["butter croissant", "croissant plain"] },
      { label: "Gourmandise", matchKeys: ["gourmandise"] },
      { label: "Mushroom", matchKeys: ["mushroom"] },
      { label: "Pistachio Matcha", matchKeys: ["pistachio"] },
      { label: "Egg&Corned", matchKeys: ["corn", "egg &"] },
      { label: "Bolognese", matchKeys: ["bolognese"] },
      { label: "Tape Cheese", matchKeys: ["tape"] },
      { label: "Burnt Cheese Cake", matchKeys: ["cheese cake", "brunth"] },
      { label: "Pain Au Chocola", matchKeys: ["pain au"] },
      { label: "Matcha Kouign Aman", matchKeys: ["kouign"] },
      { label: "Royal Egg Tart", matchKeys: ["tart"] },
      { label: "Portuguese Quiche", matchKeys: ["quiche"] },
      { label: "Almond Croissant", matchKeys: ["almond"] },
      { label: "Martabak Croissant", matchKeys: ["martabak"] },
      { label: "Croissant Cereal", matchKeys: ["cereal"] },
      { label: "Bagelen", matchKeys: ["bagel"] },
      { label: "Bloeder Original", matchKeys: ["bloeder original"] },
      { label: "Bloeder Cheese", matchKeys: ["bloeder cheese"] },
      { label: "Bloeder Chococheese", matchKeys: ["chococheese"] },
      { label: "Bloeder Chocolate", matchKeys: ["bloeder choco", "bloeder cok"] },
      { label: "Sable Cookies Chocolate", matchKeys: ["sable cookies chocolate", "sable choco"] },
      { label: "Sable Cookies Vanilla", matchKeys: ["sable cookies vanilla", "sable van"] },
      { label: "Shiopan", matchKeys: ["shiopan"] },
      { label: "Ketupat Rendang", matchKeys: ["ketupat"] }
    ];

    const findProduct = (item) => products.find(prod => 
      item.matchKeys.some(key => prod.name.toLowerCase().includes(key.toLowerCase()))
    );

    text += `*PENJUALAN PRODUK ${outletNameUpper}*\n${today}\n\n`;
    displayList.forEach(item => {
      const p = findProduct(item);
      const data = p ? (inventory[p.id] || { sold: 0 }) : { sold: 0 };
      text += `* ${item.label.toLowerCase()} : ${data.sold || 0}\n`;
    });
    text += `\n\n`;

    text += `*PRODUK FROZEN DOUGH ${outletNameUpper}*\n${today}\n\n`;
    frozenList.forEach(item => {
      const p = findProduct(item);
      const data = p ? (inventory[p.id] || { start: 0 }) : { start: 0 };
      text += `-${item.label} = ${data.start || 0}\n`;
    });
    text += `\n\n`;

    // Solved: Only prints "In"
    text += `*PRODUK JADI / DISPLAY ${outletNameUpper}*\n\n`;
    displayList.forEach(item => {
      const p = findProduct(item);
      const data = p ? (inventory[p.id] || { in: 0 }) : { in: 0 };
      text += `-${item.label} = ${data.in || 0}\n`;
    });

    const usedIngKeys = Object.keys(usedIngredients);
    if (usedIngKeys.length > 0) {
      text += `\n\n*⚖️ PENGGUNAAN BAHAN (GRAMASI)*\n`;
      usedIngKeys.forEach((ingId) => {
        const ing = ingredients.find((i) => i.id === ingId);
        if (ing) {
          text += `- ${ing.name}: ${usedIngredients[ingId]} ${ing.unit}\n`;
        }
      });
    }

    return text;
  };

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
    }
  };

  if (!isReady || !invHydrated || !salesHydrated || !outletHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">
        Loading bentar...
      </div>
    );
  }

  // ==========================================
  // REVIEW SCREEN (STEP 2)
  // ==========================================
  if (isReviewing) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-100 pb-28">
        <div className="bg-gray-900 text-white p-6 shadow-md mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Review Report</h1>
          <p className="text-gray-400 text-sm">Verify the data before submitting.</p>
        </div>
        <div className="px-4">
          <textarea 
            readOnly 
            value={generateReportText()} 
            className="w-full h-[32rem] p-4 text-xs font-mono bg-white border border-gray-300 rounded-lg shadow-inner focus:outline-none"
          />
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3 max-w-md mx-auto shadow-md">
          <Button variant="secondary" onClick={() => setIsReviewing(false)} className="w-1/3 text-xs">
            Edit Data
          </Button>
          <Button variant="primary" onClick={submitShift} isLoading={isSubmitting} className="w-2/3">
            Copy & Submit DB
          </Button>
        </div>
      </div>
    );
  }

  // ==========================================
  // INPUT SCREEN (STEP 1)
  // ==========================================
  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-100 pb-28">
      <div className="bg-blue-900 text-white p-6 shadow-md mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">
          DailyEase Shift
        </h1>
        <p className="text-blue-200 text-sm mb-4">
          Closing ga harus ribet ;)
        </p>
        <UniversalInput
          type="select"
          value={outletType}
          onChange={setOutletType}
          options={[
            { id: "fresh_bake", name: "The Wheat Cibubur" },
            { id: "frozen_goods", name: "The Wheat Fresh Market" },
          ]}
          className="text-black"
        />
      </div>

      <div className="px-4 space-y-4">
        <AccordionSection title="💰 Financial & Sales Closing" defaultOpen={true}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <UniversalInput type="currency" label="Cash" value={sales.cash} onChange={(v) => handleSalesInput("cash", v)} />
              <UniversalInput type="currency" label="Debit" value={sales.debit} onChange={(v) => handleSalesInput("debit", v)} />
              <UniversalInput type="currency" label="QRIS" value={sales.qris} onChange={(v) => handleSalesInput("qris", v)} />
              <UniversalInput type="currency" label="Credit" value={sales.credit} onChange={(v) => handleSalesInput("credit", v)} />
              <UniversalInput type="currency" label="Transfer" value={sales.transfer} onChange={(v) => handleSalesInput("transfer", v)} />
              <UniversalInput type="currency" label="Transfer Outstanding" value={sales.transfer_outstanding} onChange={(v) => handleSalesInput("transfer_outstanding", v)} />
              <UniversalInput type="currency" label="GrabFood" value={sales.grabfood} onChange={(v) => handleSalesInput("grabfood", v)} />
              <UniversalInput type="currency" label="GoFood" value={sales.gofood} onChange={(v) => handleSalesInput("gofood", v)} />
              <UniversalInput type="currency" label="ShopeeFood" value={sales.shopeefood} onChange={(v) => handleSalesInput("shopeefood", v)} />
              <UniversalInput type="currency" label="Expenses" value={sales.expenses} onChange={(v) => handleSalesInput("expenses", v)} />
            </div>
            <UniversalInput label="Expense Notes" placeholder="e.g., Beli Plastik" value={sales.expenseNote} onChange={(v) => handleSalesInput("expenseNote", v)} />
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center font-extrabold text-green-800 text-xl">
              Total Revenue: {formatIDR(totalRevenue)}
            </div>
          </div>
        </AccordionSection>

        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.category_id === cat.id);
          if (catProducts.length === 0) return null;

          return (
            <AccordionSection key={cat.id} title={`📦 ${cat.name}`} defaultOpen={false}>
              <div className="space-y-6">
                {catProducts.map((prod) => {
                  const data = inventory[prod.id] || { start: 0, in: 0, sold: 0, waste: 0 };
                  const shaping = prod.is_base ? getShapingDeduction(prod.id) : 0;
                  const sisa = getSisa(prod);

                  return (
                    <div key={prod.id} className="p-3 bg-white shadow-sm border border-gray-200 rounded-xl relative overflow-hidden">
                      {prod.production_notes && outletType === "fresh_bake" && (
                        <div className="bg-yellow-100 text-yellow-800 text-xs font-bold p-2 -mx-3 -mt-3 mb-3 border-b border-yellow-200">
                          ⚠️ NOTE: {prod.production_notes}
                        </div>
                      )}

                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-gray-800">{prod.name}</span>
                        <span className={`text-sm font-bold px-2 py-1 rounded ${sisa < 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          Sisa: {sisa}
                        </span>
                      </div>

                      {prod.is_base && shaping > 0 && (
                        <div className="text-xs text-orange-600 font-bold mb-2 bg-orange-50 p-1.5 rounded border border-orange-100">
                          ⚙️ {shaping} deducted for shaping specialties
                        </div>
                      )}

                      <div className="grid grid-cols-4 gap-2">
                        <UniversalInput type="number" label="Start" value={data.start || ""} onChange={(val) => handleInventoryInput(prod.id, "start", val)} />
                        <UniversalInput type="number" label="In" value={data.in || ""} onChange={(val) => handleInventoryInput(prod.id, "in", val)} />
                        <UniversalInput type="number" label="Sold" value={data.sold || ""} onChange={(val) => handleInventoryInput(prod.id, "sold", val)} />
                        <UniversalInput type="number" label="Waste" value={data.waste || ""} onChange={(val) => handleInventoryInput(prod.id, "waste", val)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionSection>
          );
        })}

        <AccordionSection title="⚖️ Raw Material Usage" defaultOpen={false}>
          {Object.keys(usedIngredients).length === 0 ? (
            <p className="text-sm text-gray-500 italic">Input production (In) to see material usage.</p>
          ) : (
            <div className="space-y-2">
              {Object.keys(usedIngredients).map((ingId) => {
                const ing = ingredients.find((i) => i.id === ingId);
                if (!ing) return null;
                return (
                  <div key={ingId} className="flex justify-between text-sm border-b pb-1">
                    <span className="font-semibold text-gray-700">{ing.name}</span>
                    <span className="font-bold text-blue-700">{usedIngredients[ingId]} {ing.unit}</span>
                  </div>
                );
              })}
            </div>
          )}
        </AccordionSection>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center max-w-md mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <Button variant="primary" onClick={() => setIsReviewing(true)} className="w-full py-3 shadow-md text-lg">
          Review Report
        </Button>
      </div>
    </div>
  );
}
