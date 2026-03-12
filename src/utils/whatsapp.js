export function generateWhatsAppText(data, set = "set1") {
  const { cabang, inventory, keuangan, kategoriSales } = data;

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
  const d = new Date();
  const dateString = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;

  const formatRp = (num) =>
    num && Number(num) > 0
      ? `Rp${Number(num).toLocaleString("id-ID")}`
      : "Rp -";

  const totalPendapatan =
    Number(keuangan.cash || 0) +
    Number(keuangan.qris || 0) +
    Number(keuangan.grabfood || 0) +
    Number(keuangan.gofood || 0) +
    Number(keuangan.shopeefood || 0) +
    Number(keuangan.debit || 0) +
    Number(keuangan.credit_card || 0) +
    Number(keuangan.transfer || 0) +
    Number(keuangan.voucher || 0) +
    Number(keuangan.transfer_outstanding || 0);

  // SET 1: SALES REPORT & KATEGORI
  if (set === "set1") {
    let text = `1. *Sales Report closing Outlet The Wheat ${cabang} hari ${dateString}*\n\n`;
    text += `1. Cash    : ${formatRp(keuangan.cash)}\n`;
    text += `2. Qris    : ${formatRp(keuangan.qris)}\n`;
    text += `3. Grabfood    : ${formatRp(keuangan.grabfood)}\n`;
    text += `4. Gofood    : ${formatRp(keuangan.gofood)}\n`;
    text += `5. Shopeefood    : ${formatRp(keuangan.shopeefood)}\n`;
    text += `6. Debit    : ${formatRp(keuangan.debit)}\n`;
    text += `7. Credit card    : ${formatRp(keuangan.credit_card)}\n`;
    text += `8. Transfer    : ${formatRp(keuangan.transfer)}\n`;
    text += `9. Voucher    : ${formatRp(keuangan.voucher)}\n`;
    text += `10. Transfer oustanding    : ${formatRp(keuangan.transfer_outstanding)}\n\n`;
    text += `*TOTAL* : ${formatRp(totalPendapatan)}\n\n\n`;

    text += `*Sales Report Produk The Wheat ${cabang} hari ${dateString}*\n\n`;
    text += `Croissant & Viennoiserie : ${formatRp(kategoriSales?.croissant)}\n`;
    text += `Bread    : ${formatRp(kategoriSales?.bread)}\n`;
    text += `Promo Bundling : ${formatRp(kategoriSales?.promo)}\n`;
    text += `Snack    : ${formatRp(kategoriSales?.snack)}\n`;
    text += `Spoke coffee    : ${formatRp(kategoriSales?.coffee)}\n`;
    text += `Beverage : ${formatRp(kategoriSales?.beverage)}\n`;
    text += `Hampers: ${formatRp(kategoriSales?.hampers)}\n`;
    text += `PB1 : ${formatRp(kategoriSales?.pb1)}\n\n`;
    text += `Terima kasih 🙏\n`;
    return text;
  }

  // SET 2: PENJUALAN PRODUK (SOLD)
  if (set === "set2") {
    let text = `2. *PENJUALAN PRODUK THE WHEAT ${cabang.toUpperCase()}*\n`;
    text += `${dateString}\n\n`;
    inventory.forEach((item) => {
      text += `* ${item.name.toLowerCase()} : ${item.sold || 0}\n`;
    });
    return text;
  }

  // SET 3: PRODUK FROZEN & DISPLAY
  if (set === "set3") {
    let text = `3. *PRODUK FROZEN DOUGH THE WHEAT ${cabang.toUpperCase()}*\n`;
    text += `${dateString}\n\n`;
    inventory.forEach((item) => {
      text += `-${item.name} = ${item.frozen || 0}\n`;
    });
    text += `\n\n`;
    text += `*PRODUK JADI / DISPLAY THE WHEAT ${cabang.toUpperCase()}*\n\n`;
    inventory.forEach((item) => {
      text += `-${item.name} = ${item.display || 0}\n`;
    });
    return text;
  }
}
