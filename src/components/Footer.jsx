import React from 'react';
import logo from "../constants";

const Footer = () => {
  return (
    <footer className="bg-[#08252F] px-6 py-3">
      <div className="flex  items-center">
        <div className="text-gray-400 text-sm">
          © 2025 Light Idea Company. All rights reserved.
        </div>
        
        <div>
        <img src={logo} alt="Light ERP Logo" className="w-28 h-auto inline-block ml-2" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
