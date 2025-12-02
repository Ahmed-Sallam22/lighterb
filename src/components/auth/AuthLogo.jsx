import React from "react";
import logoImage from "../../assets/Logo.png";

const AuthLogo = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-6">
      <div className="flex justify-center mb-3">
        <img src={logoImage} alt="LightERP Logo" className="h-10" />
      </div>
      {title && <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>}
      {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
    </div>
  );
};

export default AuthLogo;
