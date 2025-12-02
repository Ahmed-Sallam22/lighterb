import React from "react";

const SocialLogin = () => {
  return (
    <>
      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-gray-500">or</span>
        </div>
      </div>

      {/* Microsoft Login Button */}
      <button
        type="button"
        className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
        <svg className="w-5 h-5 mr-2" viewBox="0 0 23 23">
          <rect x="1" y="1" width="10" height="10" fill="#f25022" />
          <rect x="12" y="1" width="10" height="10" fill="#00a4ef" />
          <rect x="1" y="12" width="10" height="10" fill="#7fba00" />
          <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
        </svg>
        <span className="text-sm font-medium text-gray-700">Sign in with Microsoft</span>
      </button>
    </>
  );
};

export default SocialLogin;
