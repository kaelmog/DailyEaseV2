"use client";
import React from "react";

export const UniversalInput = ({
  type = "text",
  label,
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  className = "",
  ...props
}) => {
  const baseClass = `w-full p-2 border rounded-md font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
    disabled
      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
      : "bg-white text-gray-900"
  } ${className}`;

  // IDR Currency Formatter
  const handleCurrencyChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    onChange(rawValue === "" ? "" : parseInt(rawValue, 10));
  };

  const formatIDR = (val) => {
    if (val === null || val === undefined || val === "") return "";
    return new Intl.NumberFormat("id-ID").format(val);
  };

  const renderInput = () => {
    switch (type) {
      case "currency":
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={formatIDR(value)}
              onChange={handleCurrencyChange}
              placeholder={placeholder || "0"}
              disabled={disabled}
              className={`${baseClass} pl-10 text-right`}
              {...props}
            />
          </div>
        );

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={baseClass}
            {...props}
          >
            <option value="">{placeholder || "Select..."}</option>
            {options.map((opt) => (
              <option key={opt.id || opt.value} value={opt.id || opt.value}>
                {opt.name || opt.label}
              </option>
            ))}
          </select>
        );

      case "number":
        return (
          <input
            type="number"
            inputMode="numeric"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "0"}
            disabled={disabled}
            className={`${baseClass} text-center`}
            {...props}
          />
        );

      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={baseClass}
            rows={3}
            {...props}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={baseClass}
            {...props}
          />
        );
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-semibold text-gray-700">{label}</label>
      )}
      {renderInput()}
    </div>
  );
};
