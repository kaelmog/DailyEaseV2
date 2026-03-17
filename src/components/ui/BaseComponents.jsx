/**
 * @file BaseComponents.jsx
 * @description Premium, tactile base UI elements.
 */
import React from "react";

export const Button = ({
  children,
  variant = "primary",
  isLoading,
  className = "",
  ...props
}) => {
  // Smooth transitions and a tactile "press" effect
  const baseStyle =
    "relative flex items-center justify-center font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-400";

  const variants = {
    // Rich espresso dark for primary actions
    primary:
      "bg-stone-900 text-stone-50 rounded-xl hover:bg-stone-800 shadow-[0_2px_10px_-3px_rgba(28,25,23,0.3)]",
    // Clean, crisp white for secondary
    secondary:
      "bg-white text-stone-800 border border-stone-200 rounded-xl hover:bg-stone-50 hover:border-stone-300 shadow-sm",
    // Warm amber/green for positive actions (like submitting to DB)
    success: "bg-amber-600 text-white rounded-xl hover:bg-amber-700 shadow-sm",
    // Subtle ghost buttons
    ghost:
      "bg-transparent text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl",
    danger:
      "bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};
