/**
 * @file templateGenerators.js
 * @description Generates formatted text reports for WhatsApp sharing.
 * Strictly maintains structure, showing '0' or 'Rp -' for all empty fields.
 */
import {
  getFrozenSisa,
  getDisplaySisa,
  calculateShapingDeduction,
} from "./closingMath";

const formatDateStr = (dateStr) => {
  const d = new Date(dateStr);
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const formatRp = (num) =>
  num && Number(num) > 0 ? `Rp${Number(num).toLocaleString("id-ID")}` : "Rp -";

export const generateSalesReport = (
  reportDate,
  sales,
  categorySales,
  totalRevenue,
  outletName,
) => {
  const dateString = formatDateStr(reportDate);

  let text = `*Sales Report closing Outlet The Wheat ${outletName} hari ${dateString}*\n\n`;

  const formatMethod = (idx, label, amountKey, trxKey) => {
    const amt = sales[amountKey] || 0;
    const trx = sales[trxKey] || 0;
    return `${idx}. ${label.padEnd(20, " ")} : ${formatRp(amt)} / ${trx} trx\n`;
  };

  text += formatMethod(1, "Cash", "cash", "cash_trx");
  text += formatMethod(2, "Qris", "qris", "qris_trx");
  text += formatMethod(3, "Grabfood", "grabfood", "grabfood_trx");
  text += formatMethod(4, "Gofood", "gofood", "gofood_trx");
  text += formatMethod(5, "Shopeefood", "shopeefood", "shopeefood_trx");
  text += formatMethod(6, "Debit", "debit", "debit_trx");
  text += formatMethod(7, "Credit card", "credit", "credit_trx");
  text += formatMethod(8, "Transfer", "transfer", "transfer_trx");
  text += formatMethod(9, "Voucher", "voucher", "voucher_trx");
  text += formatMethod(
    10,
    "Transfer outstanding",
    "transfer_outstanding",
    "transfer_outstanding_trx",
  );

  text += `\n*TOTAL* : ${formatRp(totalRevenue)}\n\n`;

  text += `*PENGELUARAN*\n`;
  text += `Nominal: ${formatRp(sales.expenses)}\n`;
  text += `Keterangan: ${sales.expenseNote || "-"}\n\n\n`;

  text += `*Sales Report Produk The Wheat ${outletName} hari ${dateString}*\n\n`;
  text += `Croissant & Viennoiserie : ${formatRp(categorySales.croissant)}\n`;
  text += `Bread    : ${formatRp(categorySales.bread)}\n`;
  text += `Promo Bundling : ${formatRp(categorySales.promo)}\n`;
  text += `Snack    : ${formatRp(categorySales.snack)}\n`;
  text += `Spoke coffee    : ${formatRp(categorySales.coffee)}\n`;
  text += `Beverage : ${formatRp(categorySales.beverage)}\n`;
  text += `Hampers: ${formatRp(categorySales.hampers)}\n`;
  text += `PB1 : ${formatRp(categorySales.pb1)}\n\n`;
  text += `Terima kasih 🙏`;

  return text;
};

export const generateProductSales = (
  reportDate,
  activeProducts,
  inventory,
  outletName,
) => {
  const dateString = formatDateStr(reportDate);
  let text = `*PENJUALAN PRODUK THE WHEAT ${outletName.toUpperCase()}*\n`;
  text += `${dateString}\n\n`;

  activeProducts.forEach((p) => {
    const sold = inventory[p.id]?.display_sold || 0;
    text += `* ${p.name.toLowerCase()} : ${sold}\n`;
  });

  return text;
};

export const generateFrozenDisplay = (
  reportDate,
  activeProducts,
  inventory,
  ingredients,
  usedIngredients,
  outletName,
) => {
  const dateString = formatDateStr(reportDate);
  let text = `*PRODUK FROZEN DOUGH THE WHEAT ${outletName.toUpperCase()}*\n`;
  text += `${dateString}\n\n`;

  activeProducts.forEach((p) => {
    const sisa = getFrozenSisa(inventory[p.id] || {});
    text += `-${p.name} = ${sisa}\n`;
  });

  text += `\n\n*PRODUK JADI / DISPLAY THE WHEAT ${outletName.toUpperCase()}*\n\n`;

  activeProducts.forEach((p) => {
    const deduction = p.is_base
      ? calculateShapingDeduction(p.id, activeProducts, inventory)
      : 0;
    const sisa = getDisplaySisa(inventory[p.id] || {}, deduction);
    text += `-${p.name} = ${sisa}\n`;
  });

  if (ingredients && ingredients.length > 0) {
    text += `\n\n*PEMAKAIAN BAHAN*\n\n`;
    ingredients.forEach((ing) => {
      const used = usedIngredients[ing.id] || 0;
      text += `-${ing.name} = ${used} ${ing.unit}\n`;
    });
  }

  return text;
};
