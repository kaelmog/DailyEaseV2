// src/utils/formatters.js

/** Formats number to IDR currency style (e.g. 1.500.000) */
export const formatIDR = (val) => {
  if (!val && val !== 0) return "-";
  return new Intl.NumberFormat("id-ID").format(val);
};

/** Standardizes date to "Kamis, 12 Maret 2026" */
export const formatDateIndo = (date) => {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};
