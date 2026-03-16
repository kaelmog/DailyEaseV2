/**
 * @file templateGenerators.js
 * @description Generates specific WhatsApp formats dynamically based on the outlet.
 */
import { formatIDR, getFrozenSisa, getDisplaySisa } from "./closingMath";

// Timezone-safe local date formatter
const getDateString = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  // Adjust for timezone offset to prevent date shifting backwards
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const findProduct = (products, matchKeys) =>
  products.find((prod) =>
    matchKeys.some((key) =>
      prod.name.toLowerCase().includes(key.toLowerCase()),
    ),
  );

// --- LIST DEFINITIONS ---
const cibuburLists = {
  frozen: [
    {
      label: "Butter Croissant",
      keys: ["butter croissant", "croissant plain"],
    },
    { label: "Gourmandise", keys: ["gourmandise"] },
    { label: "Mushroom", keys: ["mushroom"] },
    { label: "Pistachio Matcha", keys: ["pistachio"] },
    { label: "Egg&Corned", keys: ["corn", "egg &"] },
    { label: "Bolognese", keys: ["bolognese"] },
    { label: "Tape Cheese", keys: ["tape"] },
    { label: "Martabak Croissant", keys: ["martabak"] },
    { label: "Almond Croissant", keys: ["almond"] },
    { label: "Pain Au Chocola", keys: ["pain au"] },
    { label: "Matcha Kouign Aman", keys: ["kouign"] },
    { label: "Cheese Cake Slice", keys: ["cheese cake", "brunth"] },
    { label: "Ketupat Rendang", keys: ["ketupat"] },
  ],
  display: [
    {
      label: "Butter Croissant",
      keys: ["butter croissant", "croissant plain"],
    },
    { label: "Gourmandise", keys: ["gourmandise"] },
    { label: "Mushroom", keys: ["mushroom"] },
    { label: "Pistachio Matcha", keys: ["pistachio"] },
    { label: "Egg&Corned", keys: ["corn", "egg &"] },
    { label: "Bolognese", keys: ["bolognese"] },
    { label: "Tape Cheese", keys: ["tape"] },
    { label: "Burnt Cheese Cake", keys: ["cheese cake", "brunth"] },
    { label: "Pain Au Chocola", keys: ["pain au"] },
    { label: "Matcha Kouign Aman", keys: ["kouign"] },
    { label: "Royal Egg Tart", keys: ["tart"] },
    { label: "Portuguese Quiche", keys: ["quiche"] },
    { label: "Almond Croissant", keys: ["almond"] },
    { label: "Martabak Croissant", keys: ["martabak"] },
    { label: "Croissant Cereal", keys: ["cereal"] },
    { label: "Bagelen", keys: ["bagel"] },
    { label: "Bloeder Original", keys: ["bloeder original"] },
    { label: "Bloeder Cheese", keys: ["bloeder cheese"] },
    { label: "Bloeder Chococheese", keys: ["chococheese"] },
    { label: "Bloeder Chocolate", keys: ["bloeder choco"] },
    {
      label: "Sable Cookies Chocolate",
      keys: ["sable cookies chocolate", "sable choco"],
    },
    {
      label: "Sable Cookies Vanilla",
      keys: ["sable cookies vanilla", "sable van"],
    },
    { label: "Shiopan", keys: ["shiopan"] },
    { label: "Ketupat Rendang", keys: ["ketupat"] },
  ],
};

const freshMarketLists = {
  salesKeys: ["pastry", "Bread", "Drink", "Ongkir", "Snack", "Hampers", "PB1"],
  frozen: [
    { label: "Butter croissant", keys: ["butter croissant"] },
    { label: "gourmandise", keys: ["gourmandise"] },
    { label: "mushroom", keys: ["mushroom"] },
    { label: "egg kornet", keys: ["corn", "egg &"] },
    { label: "pistachio macha", keys: ["pistachio"] },
    { label: "kuingaman", keys: ["kouign"] },
    { label: "tape chese", keys: ["tape"] },
    { label: "cheesecake slice", keys: ["cheese cake", "brunth"] },
    { label: "bolognese", keys: ["bolognese"] },
    { label: "Pain au Chocola", keys: ["pain au"] },
    { label: "Portugis egg", keys: ["tart", "portugis"] },
    { label: "almond croissant", keys: ["almond"] },
    { label: "martabak croissant", keys: ["martabak"] },
  ],
  display: [
    { label: "butter croissant", keys: ["butter croissant"] },
    { label: "gourmandise", keys: ["gourmandise"] },
    { label: "mushroom croissant", keys: ["mushroom"] },
    { label: "pistachio matcha croissant", keys: ["pistachio"] },
    { label: "egg & cornet croissant", keys: ["corn", "egg &"] },
    { label: "bolognese croissant", keys: ["bolognese"] },
    { label: "tape cheese", keys: ["tape"] },
    { label: "cheese cake croissant", keys: ["cheese cake", "brunth"] },
    { label: "pain au chocolate", keys: ["pain au"] },
    { label: "bloeder original", keys: ["bloeder original"] },
    { label: "bloeder chocolate", keys: ["bloeder choco"] },
    { label: "bloeder cheese", keys: ["bloeder cheese"] },
    { label: "bloeder chococheese", keys: ["chococheese"] },
    { label: "croissant cereal original", keys: ["cereal"] },
    { label: "croissant bagelan", keys: ["bagel"] },
    { label: "almond croissant", keys: ["almond"] },
    { label: "martabak croissant", keys: ["martabak"] },
    { label: "matcha kouign amann", keys: ["kouign"] },
    { label: "portuguese puff egg tart", keys: ["tart"] },
    { label: "portuguese quiche", keys: ["quiche"] },
    { label: "croissant ice cream vanilla", keys: ["ice cream vanilla"] },
    { label: "croissant ice cream choco", keys: ["ice cream choco"] },
    {
      label: "sable cookies vanila",
      keys: ["sable cookies vanilla", "sable van"],
    },
    {
      label: "sable cookies coklat",
      keys: ["sable cookies chocolate", "sable cho"],
    },
  ],
};

const cinereLists = {
  salesKeys: [
    "Pastry",
    "Bread",
    "Daily",
    "Drink",
    "Snack",
    "Coffee Spoke",
    "packaging",
    "promo bundling",
    "Eid serenity",
    "Nusantara",
    "The opulent",
    "Ongkir",
    "PB1",
  ],
  groups: [
    {
      name: "DAILY",
      items: [
        { l: "Nasi bali", k: ["nasi bali"] },
        { l: "Nasi krawu", k: ["nasi krawu"] },
        { l: "Nasi teri", k: ["nasi teri"] },
        { l: "Penne", k: ["penne"] },
        { l: "Fussili", k: ["fussili"] },
        { l: "Mac&cheese", k: ["mac"] },
        { l: "Salmon", k: ["salmon"] },
        { l: "Salad", k: ["salad"] },
        { l: "Siomay", k: ["siomay"] },
        { l: "Dimsum", k: ["dimsum"] },
        { l: "Risol rogut", k: ["rogut"] },
        { l: "Sosis solo", k: ["sosis"] },
        { l: "Lemper", k: ["lemper"] },
        { l: "Pastel puff", k: ["pastel"] },
        { l: "Risol beef", k: ["risol beef"] },
        { l: "Royal Donut cho", k: ["donut cho"] },
        { l: "Don vanilla cheese", k: ["don vanila"] },
        { l: "Pista", k: ["pista"] },
        { l: "Puding choc", k: ["puding choc"] },
        { l: "Vanila puding", k: ["vanila puding"] },
        { l: "klappertaart", k: ["klapper"] },
      ],
    },
    {
      name: "FRESH JUICE",
      items: [
        { l: "Daily reset", k: ["reset"] },
        { l: "Dragon sunset", k: ["dragon"] },
        { l: "Mango", k: ["mango"] },
        { l: "Sunrise", k: ["sunrise"] },
        { l: "Tropical", k: ["tropical"] },
        { l: "Lemon sereh", k: ["lemon"] },
        { l: "Susu kurma", k: ["kurma"] },
      ],
    },
    {
      name: "Drink",
      items: [
        { l: "Susu oatside choco", k: ["oatside choco"] },
        { l: "Susu oatside vanila", k: ["oatside vanila"] },
        { l: "Ice chocolate", k: ["ice choc"] },
        { l: "Mineral water", k: ["mineral"] },
      ],
    },
    {
      name: "PASTRY",
      items: [
        { l: "Butter", k: ["butter"] },
        { l: "Martabak", k: ["martabak"] },
        { l: "Tape cheese", k: ["tape"] },
        { l: "Mushroom", k: ["mushroom"] },
        { l: "Eeg cornet", k: ["corn"] },
        { l: "Almond", k: ["almond"] },
        { l: "Pain au choco", k: ["pain au"] },
        { l: "Burnt cheese", k: ["burnt"] },
        { l: "Matcha koign", k: ["koign"] },
        { l: "Gourmandise", k: ["gourmandise"] },
        { l: "Royal eggtart", k: ["tart"] },
        { l: "Quiche", k: ["quiche"] },
        { l: "Bolognese", k: ["bolognese"] },
        { l: "Pistachio matcha", k: ["pistachio"] },
        { l: "Rendang croissant", k: ["rendang"] },
        { l: "Tuna sandwich", k: ["tuna"] },
        { l: "Beef ham", k: ["beef ham"] },
      ],
    },
    {
      name: "*SNACK*",
      items: [
        { l: "Sable cookies choco", k: ["sable choco"] },
        { l: "Sable cookies vanilla", k: ["sable van"] },
      ],
    },
    {
      name: "BAKERY",
      items: [
        { l: "Bloeder ori", k: ["bloeder ori"] },
        { l: "Bloder choco", k: ["bloeder choco"] },
        { l: "Bloeder cheese", k: ["bloeder cheese"] },
        { l: "Bloder chococheese", k: ["chococheese"] },
        { l: "Shiopan", k: ["shiopan"] },
        { l: "Cereal", k: ["cereal"] },
        { l: "Bagelen", k: ["bagel"] },
      ],
    },
    {
      name: "MINI PASTRY",
      items: [
        { l: "Mini butter", k: ["mini butter"] },
        { l: "Mini garlic cheese", k: ["mini garlic"] },
        { l: "Mini tape cheese", k: ["mini tape"] },
        { l: "Mini mushroom", k: ["mini mush"] },
        { l: "Mini bolognese", k: ["mini bol"] },
        { l: "Mini pain au", k: ["mini pain"] },
        { l: "Mini gourmandise", k: ["mini gourm"] },
        { l: "Mini triple cheese", k: ["mini triple"] },
        { l: "Mini tuna puff", k: ["mini tuna"] },
        { l: "Mini martabak", k: ["mini mar"] },
        { l: "Mini ayam bakso", k: ["ayam bakso"] },
        { l: "Mini ayam suwir", k: ["ayam suwir"] },
        { l: "Mini cakalang", k: ["cakalang"] },
      ],
    },
  ],
};

/**
 * Generates the Sales Report based on Outlet Name
 */
export const generateSalesReport = (
  reportDate,
  sales,
  categorySales,
  totalRevenue,
  outletName,
) => {
  const today = getDateString(reportDate);
  const nameL = outletName.toLowerCase();

  let text = `*Sales Report closing Outlet ${outletName.toUpperCase()} ${today}*\n\n`;
  text += `1. Cash\t: ${formatIDR(sales.cash)}\n`;
  text += `2. Qris\t: ${formatIDR(sales.qris)} /  trx\n`;
  text += `3. Grabfood\t: ${formatIDR(sales.grabfood)} /  trx\n`;
  text += `4. Gofood\t: ${formatIDR(sales.gofood)} /  trx\n`;
  text += `5. Shopeefood\t: ${formatIDR(sales.shopeefood)} /  trx\n`;
  text += `6. Debit card\t: ${formatIDR(sales.debit)} /  trx\n`;
  text += `7. Credit card\t: ${formatIDR(sales.credit)} /  trx\n`;
  text += `8. Transfer\t: ${formatIDR(sales.transfer)} /  trx\n`;
  text += `9. Voucher\t: ${formatIDR(sales.voucher)} /  trx\n`;
  text += `10. Transfer outstanding\t: ${formatIDR(sales.transfer_outstanding)} /  trx\n\n`;
  text += `*TOTAL*\t: ${formatIDR(totalRevenue)} /  trx\n\n\n`;

  text += `*Sales Report Produk ${outletName} ${today}*\n\n`;

  if (nameL.includes("fresh market")) {
    freshMarketLists.salesKeys.forEach((k) => (text += `${k} : Rp.\n`));
  } else if (nameL.includes("cinere")) {
    cinereLists.salesKeys.forEach((k) => (text += `${k} : Rp.\n`));
  } else {
    text += `Croissant & Viennoiserie : Rp.\nBread : Rp.\nPromo Bundling : Rp.\nSnack : Rp.\nSpoke coffee : Rp.\nBeverage : Rp.\nHampers : Rp.\nPB1 : Rp.\n`;
  }

  text += `\nTerimakasih 🙏`;
  return text;
};

/**
 * Generates Product Sales Report based on Outlet Name
 */
export const generateProductSales = (
  reportDate,
  products,
  inventory,
  outletName,
) => {
  const today = getDateString(reportDate);
  const nameL = outletName.toLowerCase();
  if (nameL.includes("cinere"))
    return "N/A - Cinere only uses SISA PRODUK template.";

  let text = `*PENJUALAN PRODUK ${today}*\n\n`;
  const list = nameL.includes("fresh market")
    ? freshMarketLists.display
    : cibuburLists.display;

  list.forEach((item) => {
    const p = findProduct(products, item.keys);
    const data = p
      ? inventory[p.id] || { display_sold: 0 }
      : { display_sold: 0 };
    text += `* ${item.label.toLowerCase()} : ${data.display_sold || 0}\n`;
  });
  return text;
};

/**
 * Generates Frozen & Display Leftovers based on Outlet Name
 */
export const generateFrozenDisplay = (
  reportDate,
  products,
  inventory,
  ingredients,
  usedIngredients,
  outletName,
) => {
  const today = getDateString(reportDate);
  const nameL = outletName.toLowerCase();
  let text = "";

  if (nameL.includes("cinere")) {
    text += `*SISA PRODUK ${outletName.toUpperCase()}, ${today}*\n\n`;
    cinereLists.groups.forEach((group) => {
      text += `**${group.name}**\n`;
      group.items.forEach((item) => {
        const p = findProduct(products, item.k);
        const data = p ? inventory[p.id] || {} : {};
        const sisa = getDisplaySisa(data, 0);
        text += `${item.l} : ${sisa}\n`;
      });
      text += `\n`;
    });
  } else {
    const isFreshMarket = nameL.includes("fresh market");
    const frozen = isFreshMarket
      ? freshMarketLists.frozen
      : cibuburLists.frozen;
    const display = isFreshMarket
      ? freshMarketLists.display
      : cibuburLists.display;

    text += `*Produk frozen dough ${outletName.toLowerCase()} ${today}*\n`;
    frozen.forEach((item) => {
      const p = findProduct(products, item.keys);
      const data = p
        ? inventory[p.id] || { frozen_start: 0 }
        : { frozen_start: 0 };
      text += `- ${item.label} = ${data.frozen_start || 0}\n`;
    });
    text += `\n\n`;

    text += `*produk jadi/display ${outletName.toLowerCase()}*\n`;
    display.forEach((item) => {
      const p = findProduct(products, item.keys);
      const data = p ? inventory[p.id] || {} : {};
      const sisa = getDisplaySisa(data, 0);
      text += `- ${item.label} = ${sisa}\n`;
    });
  }

  const usedIngKeys = Object.keys(usedIngredients || {});
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
