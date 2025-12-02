import React, { useEffect } from 'react';
import { Link } from 'react-router';

const iconBase = 'text-[#a7e3f6]';

const DashboardIcon = () => (
  <svg className={`w-6 h-6 ${iconBase}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const AccountsIcon = () => (
  <svg className={`w-6 h-6 ${iconBase}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.3137 3.134-6 7-6s7 2.6863 7 6" strokeLinecap="round" />
    <path d="M17.5 4l1.5 1.5L17.5 7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 5.5h-3" strokeLinecap="round" />
  </svg>
);

const JournalIcon = () => (
  <svg className={`w-6 h-6 ${iconBase}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M8 4v16" />
    <path d="M12 8h4" strokeLinecap="round" />
    <path d="M12 12h4" strokeLinecap="round" />
    <path d="M12 16h3" strokeLinecap="round" />
  </svg>
);

const CustomersIcon = () => (
  <svg className={`w-6 h-6 ${iconBase}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8.5 13a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
    <path d="M17 11a3 3 0 10-3-3" strokeLinecap="round" />
    <path d="M3.5 20.5c0-3.033 2.91-5.5 6.5-5.5 1.838 0 3.49.695 4.66 1.813" strokeLinecap="round" />
    <path d="M17 13c2.209 0 4 1.567 4 3.5" strokeLinecap="round" />
  </svg>
);

const SuppliersIcon = () => (
  <svg className={`w-6 h-6 ${iconBase}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 16h4l2 4h8l2-6H8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="5" r="2.5" />
    <path d="M6.5 10v3.5" strokeLinecap="round" />
    <path d="M11.5 10v3.5" strokeLinecap="round" />
  </svg>
);

const InvoiceIcon = () => (
  <svg className={`w-6 h-6 ${iconBase}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 3h9l3 3v15H6z" strokeLinejoin="round" />
    <path d="M9 9h6" strokeLinecap="round" />
    <path d="M9 13h6" strokeLinecap="round" />
    <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const PaymentsIcon = () => (
  <svg className={`w-6 h-6 ${iconBase}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M3 10h18" />
    <path d="M7 14h2" strokeLinecap="round" />
    <path d="M15 14h2" strokeLinecap="round" />
  </svg>
);

const ReportsIcon = () => (
  <svg className={`w-6 h-6 ${iconBase}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 7h12" strokeLinecap="round" />
    <path d="M6 12h9" strokeLinecap="round" />
    <path d="M6 17h6" strokeLinecap="round" />
    <path d="M16 4l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 7h-4" strokeLinecap="round" />
  </svg>
);

const sidebarLinks = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Accounts', icon: <AccountsIcon /> },
  { label: 'Journal Entries', icon: <JournalIcon /> },
  { label: 'Customers', icon: <CustomersIcon /> },
  { label: 'Suppliers', icon: <SuppliersIcon /> },
  { label: 'AR Invoices',path:"/ar-invoices" ,icon: <InvoiceIcon /> },
  { label: 'AR Payments', path: '/payments/ar', icon: <PaymentsIcon /> },
  { label: 'AP Invoices',path:"/ap-invoices" , icon: <InvoiceIcon /> },
  { label: 'AP Payments', path: '/payments/ap', icon: <PaymentsIcon /> },
  { label: 'Reports', path: '/reports', icon: <ReportsIcon /> },
];

const Sidebar = ({ isOpen, onClose }) => {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 transform overflow-y-auto bg-gradient-to-b from-[#1f9ec0] via-[#167398] to-[#0c3b4c] shadow-2xl transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar navigation"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/15">
          <div className="text-2xl font-semibold tracking-wide">
            <span className="text-white">Light</span>
            <span className="text-[#48c1f0]">ERP</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/30 p-1 text-white transition hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="px-4 py-1 ">
          {sidebarLinks.map((link) => {
            const content = (
              <span className="flex items-center gap-2 rounded-lg px-3 py-3 text-white transition-all duration-200 hover:bg-white/10">
                <span className="flex items-center justify-center rounded-full bg-white/5 p-2">{link.icon}</span>
                <span className="text-lg font-medium">{link.label}</span>
              </span>
            );

            return link.path ? (
              <Link key={link.label} to={link.path} onClick={onClose} className="block">
                {content}
              </Link>
            ) : (
              <button key={link.label} type="button" className="w-full text-left" onClick={onClose}>
                {content}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
