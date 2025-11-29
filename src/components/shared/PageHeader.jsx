import React from 'react';
import PropTypes from 'prop-types';

const HeroPattern = () => (
  <svg
    width="1439"
    height="9"
    viewBox="0 0 1439 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <mask id="mask0" maskUnits="userSpaceOnUse" x="-1" y="0" width="1440" height="9">
      <path d="M1438.82 0H-0.154663V8.99957H1438.82V0Z" fill="white" />
    </mask>
    <g mask="url(#mask0)">
      <path d="M-0.0140934 -8.54761L-20.6785 23.0765H20.6679L-0.0140934 -8.54761Z" fill="#006F86" />
      <path d="M23.4891 19.6261L44.1711 -12.0139H2.82471L23.4891 19.6261Z" fill="#A50026" />
      <path d="M161.21 19.8478L181.892 -11.7764H140.564L161.21 19.8478Z" fill="#006F86" />
      <path d="M396.347 -3.90991L375.665 27.7142H417.011L396.347 -3.90991Z" fill="#006F86" />
      <path d="M373.091 24.7384L393.773 -6.90161H352.409L373.091 24.7384Z" fill="#F41A1A" />
      <path d="M231.843 56.6317L275.623 -13.2168H188.046L231.843 56.6317Z" fill="#C14E00" />
      <path d="M582.82 -5.00195L562.156 26.638H603.484L582.82 -5.00195Z" fill="#005762" />
      <path d="M787.983 -22.9036L744.168 46.9766H831.745L787.983 -22.9036Z" fill="#C14E00" />
      <path d="M936.51 -8.54761L915.846 23.0765H957.192L936.51 -8.54761Z" fill="#006F86" />
      <path d="M1215.37 -11.1909L1194.67 20.4649H1236.04L1215.37 -11.1909Z" fill="#A50026" />
      <path d="M1402.11 -41.1848L1358.33 28.6954H1445.89L1402.11 -41.1848Z" fill="#C14E00" />
    </g>
  </svg>
);

const PageHeader = ({ icon, title, subtitle, className = '' }) => {
  return (
    <header className={`relative bg-gradient-to-r from-[#031b28] via-[#0a5b79] to-[#031b28] text-white overflow-hidden py-6 ${className}`}>
      <div className="px-10 gap-6">
        <div className="flex items-center gap-4">
          {/* Icon */}
          {icon && (
            <div className="">
              {icon}
            </div>
          )}
          
          {/* Title and Subtitle */}
          <div className="flex items-center gap-3">
            <p className="text-3xl sm:text-4xl text-[#D3D3D3] font-semibold">
              {title}
            </p>
            {subtitle && (
              <h1 className="text-[#48C1F0] mt-2 text-sm">
                {subtitle}
              </h1>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Pattern */}
      <div className="absolute inset-x-0 bottom-0">
        <HeroPattern />
      </div>
    </header>
  );
};

PageHeader.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  className: PropTypes.string,
};

export default PageHeader;
