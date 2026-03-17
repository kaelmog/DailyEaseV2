/**
 * @file templateGenerators.js
 * @description Generates formatted text reports for WhatsApp sharing. Automatically hides empty/zero values for a clean look.
 */
import {
  formatIDR,
  getFrozenSisa,
  getDisplaySisa,
  calculateShapingDeduction,
} from "./closingMath";

export const generateSalesReport = (
  reportDate,
  sales,
  categorySales,
  totalRevenue,
  outletName,
) => {
  // Format the date to something like "Selasa, 17 Maret 2026"
  const dateObj = new Date(reportDate);
  const formattedDate = dateObj.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let text = `*Sales Report closing Outlet ${outletName.toUpperCase()} ${formattedDate}*\n\n`;

  // Helper function to format exactly as requested: "Debit : Rp500.000 / 16 trx" or "Credit : Rp -"
  const formatMethod = (idx, label, amountKey, trxKey) => {
    const amt = sales[amountKey] || 0;
    const trx = sales[trxKey] || 0;

    const amtStr = amt > 0 ? formatIDR(amt) : "Rp -";
    const trxStr = trx > 0 ? ` / ${trx} trx` : "";

    return `${idx}. ${label.padEnd(20, " ")} : ${amtStr}${trxStr}\n`;
  };

  text += formatMethod(1, "Cash", "cash", "cash_trx");
  text += formatMethod(2, "Qris", "qris", "qris_trx");
  text += formatMethod(3, "Grabfood", "grabfood", "grabfood_trx");
  text += formatMethod(4, "Gofood", "gofood", "gofood_trx");
  text += formatMethod(5, "Shopeefood", "shopeefood", "shopeefood_trx");
  text += formatMethod(6, "Debit card", "debit", "debit_trx");
  text += formatMethod(7, "Credit card", "credit", "credit_trx");
  text += formatMethod(8, "Transfer", "transfer", "transfer_trx");
  text += formatMethod(9, "Voucher", "voucher", "voucher_trx");
  text += formatMethod(
    10,
    "Transfer outstanding",
    "transfer_outstanding",
    "transfer_outstanding_trx",
  );

  text += `\n*💰 TOTAL REVENUE: ${formatIDR(totalRevenue)}*\n\n`;

  // Only show expenses if there are any
  if (sales.expenses > 0) {
    text += `*💸 PENGELUARAN*\n`;
    text += `• Nominal: ${formatIDR(sales.expenses)}\n`;
    text += `• Keterangan: ${sales.expenseNote || "-"}\n\n`;
  }

  text += `*📦 SALES BY CATEGORY*\n`;
  const catMap = [
    { key: "croissant", label: "Croissant" },
    { key: "bread", label: "Bread" },
    { key: "promo", label: "Bundling/Promo" },
    { key: "snack", label: "Snack" },
    { key: "coffee", label: "Coffee" },
    { key: "beverage", label: "Beverage" },
    { key: "hampers", label: "Hampers" },
    { key: "pb1", label: "PB1" },
  ];

  let hasCategorySales = false;
  catMap.forEach(({ key, label }) => {
    if (categorySales[key] > 0) {
      text += `• ${label}: ${formatIDR(categorySales[key])}\n`;
      hasCategorySales = true;
    }
  });

  if (!hasCategorySales) text += `(Tidak ada penjualan per kategori)\n`;

  return text.trim();
};

export const generateProductSales = (
  reportDate,
  activeProducts,
  inventory,
  outletName,
) => {
  let text = `*LAPORAN PENJUALAN PRODUK*\n`;
  text += `📍 Outlet: ${outletName}\n`;
  text += `📅 Tanggal: ${reportDate}\n\n`;

  let hasSales = false;

  activeProducts.forEach((p) => {
    const data = inventory[p.id] || {};
    const sold = data.display_sold || 0;

    // Only show if sold > 0
    if (sold > 0) {
      text += `• ${p.name}: ${sold} pcs\n`;
      hasSales = true;
    }
  });

  if (!hasSales) text += `(Tidak ada produk terjual)\n`;

  return text.trim();
};

export const generateFrozenDisplay = (
  reportDate,
  activeProducts,
  inventory,
  ingredients,
  usedIngredients,
  outletName,
) => {
  let text = `*LAPORAN SISA STOK (FROZEN & DISPLAY)*\n`;
  text += `📍 Outlet: ${outletName}\n`;
  text += `📅 Tanggal: ${reportDate}\n\n`;

  text += `*❄️ SISA FROZEN*\n`;
  let hasFrozen = false;
  activeProducts.forEach((p) => {
    const sisa = getFrozenSisa(inventory[p.id] || {});
    // Only show if sisa is not zero
    if (sisa !== 0) {
      text += `• ${p.name}: ${sisa}\n`;
      hasFrozen = true;
    }
  });
  if (!hasFrozen) text += `(Kosong)\n`;

  text += `\n*🏪 SISA DISPLAY*\n`;
  let hasDisplay = false;
  activeProducts.forEach((p) => {
    const deduction = p.is_base
      ? calculateShapingDeduction(p.id, activeProducts, inventory)
      : 0;
    const sisa = getDisplaySisa(inventory[p.id] || {}, deduction);
    // Only show if sisa is not zero
    if (sisa !== 0) {
      text += `• ${p.name}: ${sisa}\n`;
      hasDisplay = true;
    }
  });
  if (!hasDisplay) text += `(Kosong)\n`;

  // Only show ingredients section if there is actual usage
  if (Object.keys(usedIngredients).length > 0) {
    let hasIngredients = false;
    let ingText = `\n*⚖️ PEMAKAIAN BAHAN*\n`;
    Object.keys(usedIngredients).forEach((ingId) => {
      const ing = ingredients.find((i) => i.id === ingId);
      if (ing && usedIngredients[ingId] > 0) {
        ingText += `• ${ing.name}: ${usedIngredients[ingId]} ${ing.unit}\n`;
        hasIngredients = true;
      }
    });
    if (hasIngredients) text += ingText;
  }

  return text.trim();
};
