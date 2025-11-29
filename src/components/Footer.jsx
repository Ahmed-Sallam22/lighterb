import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#08252F] px-6 py-3">
      <div className="flex  items-center">
        <div className="text-gray-400 text-sm">
          © 2025 Light Idea Company. All rights reserved.
        </div>
        
        <div>
          <svg width="106" height="46" viewBox="0 0 176 46" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_8_9175)">
              <path d="M74.4242 1.97461L82.1765 23.3842H82.2842L85.8287 12.7797L74.4242 1.97461Z" fill="#47C4ED"/>
              <path d="M85.8287 12.7797L82.2842 23.3841H97.0227L90.7611 17.4531L85.8287 12.7797Z" fill="#2299BF"/>
              <path d="M74.4242 44.7937L82.1765 23.3842H82.2842L85.8287 33.9911L74.4242 44.7937Z" fill="white"/>
              <path d="M85.8287 33.9911L82.2842 23.3842H97.0227L85.8287 33.9911Z" fill="#0D7CA0"/>
            </g>
            <defs>
              <clipPath id="clip0_8_9175">
                <rect width="176" height="46" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
