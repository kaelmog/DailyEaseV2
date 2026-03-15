"use client";
import React, { useState } from "react";

export const Card = ({ title, subtitle, children, footer, className = "" }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
  >
    {(title || subtitle) && (
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        {title && <h3 className="font-bold text-gray-900">{title}</h3>}
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    )}
    <div className="p-4">{children}</div>
    {footer && (
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        {footer}
      </div>
    )}
  </div>
);

export const AccordionSection = ({
  title,
  children,
  defaultOpen = false,
  badgeCount = 0,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 text-lg">{title}</span>
          {badgeCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {badgeCount}
            </span>
          )}
        </div>
        <span
          className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-100 bg-white">{children}</div>
      )}
    </div>
  );
};
