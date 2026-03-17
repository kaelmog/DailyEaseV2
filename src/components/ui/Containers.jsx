/**
 * @file Containers.jsx
 * @description Clean, low-shadow structural components.
 */
import React, { useState } from "react";

export const Card = ({ title, subtitle, children, className = "" }) => (
  <div
    className={`bg-white p-6 rounded-2xl border border-stone-200 shadow-sm ${className}`}
  >
    {(title || subtitle) && (
      <div className="mb-5 border-b border-stone-100 pb-4">
        {title && (
          <h2 className="text-xl font-extrabold text-stone-800 tracking-tight">
            {title}
          </h2>
        )}
        {subtitle && <p className="text-sm text-stone-500 mt-1">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

export const AccordionSection = ({ title, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-4 transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex justify-between items-center bg-white hover:bg-stone-50 transition-colors focus:outline-none"
      >
        <h2 className="text-lg font-bold text-stone-800">{title}</h2>
        <span
          className={`text-stone-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>
      <div
        // FIX: Increased max-h from 5000px to 30000px so massive categories never get chopped off!
        className={`transition-all duration-500 ease-in-out ${isOpen ? "max-h-[30000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
      >
        <div className="p-6 border-t border-stone-100 bg-white">{children}</div>
      </div>
    </div>
  );
};
