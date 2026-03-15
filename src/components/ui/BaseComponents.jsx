"use client";
import React from "react";

export const Button = ({
  children,
  variant = "primary",
  isLoading,
  className = "",
  ...props
}) => {
  const baseStyle =
    "px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "bg-transparent text-blue-600 hover:bg-blue-50",
  };

  return (
    <button
      disabled={isLoading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="animate-pulse">Processing...</span>
      ) : (
        children
      )}
    </button>
  );
};

export const Badge = ({ children, type = "info" }) => {
  const types = {
    info: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${types[type]}`}
    >
      {children}
    </span>
  );
};
