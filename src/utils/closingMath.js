/**
 * @file closingMath.js
 * @description Core mathematical formulas for the DailyEase POS closing.
 */

export const formatIDR = (num) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num || 0);
};

export const calculateTotalRevenue = (sales) => {
  return (
    (sales.cash || 0) +
    (sales.qris || 0) +
    (sales.debit || 0) +
    (sales.credit || 0) +
    (sales.transfer || 0) +
    (sales.transfer_outstanding || 0) +
    (sales.grabfood || 0) +
    (sales.gofood || 0) +
    (sales.shopeefood || 0) +
    (sales.voucher || 0)
  );
};

export const getFrozenSisa = (inv) => {
  return (
    (inv.frozen_start || 0) +
    (inv.frozen_in || 0) -
    (inv.frozen_out || 0) -
    (inv.frozen_waste || 0)
  );
};

export const getDisplaySisa = (inv, shapingDeduction = 0) => {
  return (
    (inv.display_start || 0) +
    (inv.display_in || 0) -
    (inv.display_sold || 0) -
    (inv.display_waste || 0) -
    shapingDeduction
  );
};

export const calculateShapingDeduction = (
  baseProductId,
  activeProducts,
  inventory,
) => {
  let deduction = 0;
  activeProducts.forEach((p) => {
    if (p.base_product_id === baseProductId) {
      const inv = inventory[p.id] || {};
      deduction += inv.display_shaping || 0;
    }
  });
  return deduction;
};

export const calculateUsedIngredients = (
  activeProducts,
  inventory,
  recipes,
  ingredients,
) => {
  const usage = {};
  if (!ingredients || ingredients.length === 0) return usage;

  activeProducts.forEach((prod) => {
    const inv = inventory[prod.id] || {};
    const shapingQty = inv.display_shaping || 0; // Trigger for normal ingredients
    const soldQty = inv.display_sold || 0; // Trigger for dusting ingredients

    const prodRecipes = recipes.filter((r) => r.product_id === prod.id);

    prodRecipes.forEach((recipe) => {
      const ing = ingredients.find((i) => i.id === recipe.ingredient_id);
      if (!ing) return;

      const name = ing.name.toLowerCase();
      // Exceptions: Dextros and Matcha Powder are used upon reheating/selling
      const isDusting =
        name.includes("dextros") || name.includes("matcha powder");

      const multiplier = isDusting ? soldQty : shapingQty;

      if (multiplier > 0) {
        if (!usage[ing.id]) usage[ing.id] = 0;
        usage[ing.id] += recipe.amount_per_unit * multiplier;
      }
    });
  });
  return usage;
};
