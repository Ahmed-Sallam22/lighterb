import React from "react";

const AuthButton = ({ children, type = "button", onClick, variant = "primary", disabled = false }) => {
  const baseClasses = "w-full font-semibold py-2.5 px-4 rounded-md transition-all duration-200 text-base";

  const variants = {
    primary: "bg-[#11576C] hover:bg-[#0d4557] text-white shadow-sm",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      {children}
    </button>
  );
};

export default AuthButton;
