import React from 'react';

const Card = ({ title, subtitle, actionSlot, children }) => (
  <section className="rounded-4xl bg-[#ffffff] shadow-xl border border-white/60 p-8 relative overflow-visible">
    {(title || actionSlot) && (
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          {title && <h2 className="text-2xl font-bold text-[#28819C]">{title}</h2>}
          {subtitle && <p className="text-xs text-[#28819C] mb-1">{subtitle}</p>}
        </div>
        {actionSlot}
      </header>
    )}
    {children}
  </section>
);

export default Card;
