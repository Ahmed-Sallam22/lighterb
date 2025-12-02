import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

const AuthInput = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder,
  autoComplete,
  error,
  showPasswordToggle = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle ? (showPassword ? "text" : "password") : type;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-900 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          className={`w-full px-3.5 py-2.5 border rounded-md focus:ring-2 focus:ring-[#11576C] focus:border-[#11576C] outline-none transition-all text-sm ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          placeholder={placeholder}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
            {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default AuthInput;
