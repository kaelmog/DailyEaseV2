/**

    MENGHITUNG TOTAL PENDAPATAN HARIAN (GRAND TOTAL)

    Fungsi ini menjumlahkan semua nilai transaksi dari berbagai metode

    pembayaran (Tunai, QRIS, dan Mesin EDC) untuk mendapatkan total pendapatan akhir.

    @param {number} uangFisik - Jumlah uang tunai fisik di laci kasir

    @param {number} uangQris - Total nilai transaksi melalui scan QRIS

    @param {number} uangMesinEdc - Total nilai transaksi melalui mesin EDC/Debit

    @returns {number} Hasil penjumlahan keseluruhan pendapatan hari ini
    */
export function hitungGrandTotal(uangFisik, uangQris, uangMesinEdc) {
  return Number(uangFisik) + Number(uangQris) + Number(uangMesinEdc);
}

/**

    MENGHITUNG SELISIH KAS (CASH VARIANCE)

    Fungsi ini membandingkan uang fisik yang dihitung manual oleh kasir

    dengan total uang tunai yang seharusnya ada berdasarkan sistem POS.

    Jika hasilnya minus, berarti ada uang yang kurang (minus).

    Jika hasilnya plus, berarti ada uang lebih (plus).

    @param {number} uangFisikAktual - Uang tunai yang benar-benar ada di laci

    @param {number} uangFisikDiSistem - Uang tunai yang tercatat di sistem POS

    @returns {number} Selisih uang kas (0 berarti seimbang/balance)
    */
export function hitungSelisihKas(uangFisikAktual, uangFisikDiSistem) {
  return Number(uangFisikAktual) - Number(uangFisikDiSistem);
}
