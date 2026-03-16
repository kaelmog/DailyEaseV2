/**
 * @file closingMath.js
 * @description Math utilities for inventory and sales calculations.
 */

/**
 * Formats a number to Indonesian Rupiah.
 * @param {number} num
 * @returns {string} Formatted string.
 */
export const formatIDR = (num) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
    num || 0,
  );

/**
 * Calculates total revenue from sales object.
 * @param {Object} sales
 * @returns {number}
 */
export const calculateTotalRevenue = (sales) => {
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
};

/**
 * Gets Sisa for Frozen Book
 * @param {Object} data Inventory data for a product
 * @returns {number}
 */
export const getFrozenSisa = (data) =>
  (data?.frozen_start || 0) +
  (data?.frozen_in || 0) -
  (data?.frozen_out || 0) -
  (data?.frozen_waste || 0);

/**
 * Calculates how many base products were deducted for shaping.
 * @param {string} baseProductId
 * @param {Array} products
 * @param {Object} inventory
 * @returns {number}
 */
export const calculateShapingDeduction = (
  baseProductId,
  products,
  inventory,
) => {
  let deduction = 0;
  products.forEach((p) => {
    if (
      p.base_product_id === baseProductId &&
      inventory[p.id]?.display_shaping
    ) {
      deduction += inventory[p.id].display_shaping;
    }
  });
  return deduction;
};

/**
 * Gets Sisa for Display Book
 * @param {Object} data
 * @param {number} shapingDeduction
 * @returns {number}
 */
export const getDisplaySisa = (data, shapingDeduction = 0) => {
  return (
    (data?.display_start || 0) +
    (data?.display_in || 0) -
    (data?.display_sold || 0) -
    (data?.display_waste || 0) -
    shapingDeduction
  );
};

/**
 * Calculates ingredient usage based on recipes and production.
 * @param {Array} products
 * @param {Object} inventory
 * @param {Array} recipes
 * @returns {Object} { ingredient_id: used_amount }
 */
export const calculateUsedIngredients = (products, inventory, recipes) => {
  const usage = {};
  products.forEach((p) => {
    const data = inventory[p.id];
    const totalProcessed =
      (data?.frozen_out || 0) +
      (data?.display_shaping || 0) +
      (data?.display_in || 0);
    if (totalProcessed > 0) {
      recipes
        .filter((r) => r.product_id === p.id)
        .forEach((r) => {
          usage[r.ingredient_id] =
            (usage[r.ingredient_id] || 0) + totalProcessed * r.amount_per_unit;
        });
    }
  });
  return usage;
};
