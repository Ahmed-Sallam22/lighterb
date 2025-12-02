import React from "react";
import { Link } from "react-router-dom";

const AuthFooter = ({ text, linkText, linkTo }) => {
  if (!text || !linkText || !linkTo) return null;

  return (
    <div className="mt-auto pt-6 border-t border-gray-100">
      <p className="text-center text-sm text-gray-700">
        {text}{" "}
        <Link to={linkTo} className="text-[#11576C] hover:text-[#0d4557] font-semibold transition-colors">
          {linkText}
        </Link>
      </p>
    </div>
  );
};

export default AuthFooter;
