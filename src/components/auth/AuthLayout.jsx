import React from "react";
import AuthFooter from "./AuthFooter";

const AuthLayout = ({ children, footerText, footerLinkText, footerLinkTo }) => {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(180deg, #11576C 0%, #0F1B1F 100%)",
        }}
      />

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 flex items-end md:items-center justify-center min-h-screen">
        <div className="w-full md:max-w-md">
          <div className="bg-white rounded-t-3xl md:rounded-xl shadow-xl p-8 md:p-8 min-h-[80vh] md:min-h-0 md:max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex-1">{children}</div>
            <AuthFooter text={footerText} linkText={footerLinkText} linkTo={footerLinkTo} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
