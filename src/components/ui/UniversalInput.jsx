/**
 * @file UniversalInput.jsx
 * @description Sleek, modern input fields with visible borders and floating-style labels.
 */
import React from "react";

export const UniversalInput = ({
  label,
  type = "text",
  value,
  onChange,
  options = [],
  placeholder = "",
  className = "",
  required = false,
}) => {
  // FIX: Changed to bg-white and border-stone-200 so inputs are clearly visible before clicking.
  // Added an amber focus ring to match the new premium theme.
  const baseInputStyle =
    "w-full px-4 py-3 rounded-xl bg-white border border-stone-200 text-stone-900 font-semibold transition-all duration-200 hover:border-stone-300 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 outline-none placeholder:text-stone-400 placeholder:font-normal";

  const renderInput = () => {
    if (type === "select") {
      return (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseInputStyle} appearance-none cursor-pointer ${className}`}
            required={required}
          >
            <option value="" disabled>
              {placeholder || "Select an option"}
            </option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-400">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      );
    }

    if (type === "currency") {
      return (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-stone-400 font-medium">Rp</span>
          </div>
          <input
            type="number"
            value={value === 0 ? "" : value}
            onChange={(e) =>
              onChange(e.target.value === "" ? 0 : parseInt(e.target.value, 10))
            }
            placeholder="0"
            className={`${baseInputStyle} pl-11 ${className}`}
          />
        </div>
      );
    }

    return (
      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(
            type === "number"
              ? e.target.value === ""
                ? ""
                : parseInt(e.target.value, 10)
              : e.target.value,
          )
        }
        placeholder={placeholder}
        className={`${baseInputStyle} ${className}`}
        required={required}
      />
    );
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-bold text-stone-500 uppercase tracking-wide ml-1">
          {label}
        </label>
      )}
      {renderInput()}
    </div>
  );
};
