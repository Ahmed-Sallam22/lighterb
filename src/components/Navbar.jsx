import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/Logo.png';
import Sidebar from './Sidebar';
const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-[#08252F] px-6 py-3 relative z-30">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex justify-between items-center">
        {/* Left Section - Menu Icon & Logo */}
        <div className="flex items-center gap-4">
          {/* Menu Icon */}
          <button 
            className="focus:outline-none hover:opacity-80 transition-opacity"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar navigation"
          >
            <svg width="27" height="19" viewBox="0 0 27 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_8_9174)">
                <path d="M16.3801 2.83002H8.75009C7.75009 2.83002 6.62009 2.68998 6.66009 1.34998C6.66009 0.189979 7.66009 3.8147e-06 8.66009 3.8147e-06H24.4101C25.4101 3.8147e-06 26.3501 0.209989 26.4101 1.35999C26.4101 2.68999 25.4101 2.84002 24.3201 2.83002H16.3801Z" fill="#D3D3D3"/>
                <path d="M16.49 7.90998H24.12C25.12 7.90998 26.28 7.91001 26.35 9.26001C26.42 10.61 25.35 10.75 24.28 10.75H8.77004C7.77004 10.75 6.62003 10.63 6.67003 9.28998C6.72003 7.94998 7.83003 7.90999 8.86003 7.91999L16.49 7.90998Z" fill="#D3D3D3"/>
                <path d="M16.5101 18.65H8.88006C7.88006 18.65 6.72005 18.65 6.67005 17.29C6.62005 15.93 7.67005 15.81 8.75005 15.81H24.2701C25.3301 15.81 26.4101 15.96 26.3601 17.29C26.3101 18.62 25.1801 18.65 24.1501 18.65H16.5101Z" fill="#D3D3D3"/>
                <path d="M2.74005 1.43001C2.60005 2.27001 2.14004 2.82003 1.28004 2.76003C0.922002 2.76003 0.578629 2.61775 0.325455 2.36458C0.0722806 2.1114 -0.0699463 1.76803 -0.0699463 1.40999C-0.0699463 1.05195 0.0722806 0.708573 0.325455 0.455399C0.578629 0.202225 0.922002 0.0600134 1.28004 0.0600134C2.18004 0.0500134 2.62005 0.600009 2.74005 1.43001Z" fill="#D3D3D3"/>
                <path d="M2.74008 9.17001C2.75649 9.35692 2.73462 9.54524 2.67579 9.72341C2.61696 9.90159 2.52241 10.0659 2.39793 10.2063C2.27344 10.3467 2.12164 10.4602 1.95179 10.5399C1.78194 10.6197 1.59761 10.6639 1.41007 10.67C1.24553 10.6894 1.07878 10.6756 0.919656 10.6295C0.760536 10.5833 0.612277 10.5057 0.483636 10.4013C0.354995 10.2969 0.248581 10.1678 0.170678 10.0216C0.0927755 9.87535 0.0449648 9.71502 0.0300685 9.55001C-0.0161208 9.36896 -0.0214597 9.17991 0.0144283 8.99654C0.0503163 8.81317 0.126538 8.64005 0.237573 8.48977C0.348608 8.33949 0.491672 8.21582 0.656411 8.12765C0.821151 8.03948 1.00344 7.98903 1.19007 7.98C2.04007 7.84 2.52008 8.37001 2.74008 9.17001Z" fill="#D3D3D3"/>
                <path d="M2.74001 17.21C2.74149 17.3938 2.70571 17.5759 2.63486 17.7454C2.56401 17.9149 2.45955 18.0683 2.32778 18.1963C2.19601 18.3243 2.03966 18.4244 1.86817 18.4903C1.69668 18.5563 1.51361 18.5868 1.33001 18.58C1.1645 18.5881 0.999022 18.5634 0.843055 18.5075C0.687088 18.4515 0.543701 18.3653 0.421088 18.2538C0.298476 18.1423 0.199054 18.0078 0.128516 17.8579C0.0579784 17.7079 0.0177109 17.5455 0.0100167 17.38C-0.0220614 17.1962 -0.0135499 17.0075 0.0349648 16.8273C0.0834795 16.6471 0.170812 16.4797 0.290855 16.3367C0.410897 16.1938 0.56074 16.0789 0.729881 16C0.899022 15.9211 1.08338 15.8802 1.27001 15.88C2.13001 15.82 2.60001 16.37 2.74001 17.21Z" fill="#D3D3D3"/>
              </g>
              <defs>
                <clipPath id="clip0_8_9174">
                  <rect width="26.35" height="18.65" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </button>

          {/* Logo */}
          <Link to="/" className="text-white font-bold text-xl hover:opacity-80 transition-opacity">
            <img src={logo} className='w-[25%]' alt="Light ERP logo" />
          </Link>
        </div>

        {/* Right Section - Icons & User */}
        <div className="flex items-center gap-6">
          {/* Search Icon */}
          <div className="relative">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="focus:outline-none hover:opacity-80 transition-opacity"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {/* Search Dropdown */}
            {isSearchOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-4 w-64 z-50">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Home Icon */}
          <button 
            onClick={() => navigate('/')}
            className="focus:outline-none hover:opacity-80 transition-opacity"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1.9455L11.46 2.46075L1.70996 12.2107L2.78996 13.2907L3.74996 12.3277V21H10.5V13.5H13.5V21H20.25V12.3277L21.21 13.2892L22.29 12.2092L12.54 2.45925L12 1.9455ZM12 4.0785L18.75 10.8285V19.5H15V12H8.99996V19.5H5.24996V10.8277L12 4.07775V4.0785Z" fill="white"/>
            </svg>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.5002 12.525C16.0775 12.525 18.1668 10.4356 18.1668 7.85832C18.1668 5.28099 16.0775 3.19165 13.5002 3.19165C10.9228 3.19165 8.8335 5.28099 8.8335 7.85832C8.8335 10.4356 10.9228 12.525 13.5002 12.525Z" stroke="white" strokeWidth="1.5"/>
              <path opacity="0.5" d="M22.8334 21.0175C22.8334 23.9167 22.8334 26.2675 13.5001 26.2675C4.16675 26.2675 4.16675 23.9167 4.16675 21.0175C4.16675 18.1183 8.34575 15.7675 13.5001 15.7675C18.6544 15.7675 22.8334 18.1183 22.8334 21.0175Z" stroke="white" strokeWidth="1.5"/>
            </svg>
            <div className="text-white">
              <div className="font-medium text-sm">John Doe</div>
              <div className="text-xs text-gray-300">Administrator</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
