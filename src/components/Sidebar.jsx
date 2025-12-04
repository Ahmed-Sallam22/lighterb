import React, { useEffect } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { MdDashboard, MdPeople, MdShoppingCart, MdClose } from "react-icons/md";
import { HiDocumentText, HiUsers } from "react-icons/hi";
import { FaFileInvoiceDollar, FaCreditCard, FaFileAlt } from "react-icons/fa";
import { useLocale } from "../hooks/useLocale";
import logo from "../assets/logo.png";

const iconBase = "w-6 h-6 text-[#a7e3f6]";

const DashboardIcon = () => <MdDashboard className={iconBase} />;

const AccountsIcon = () => <HiUsers className={iconBase} />;

const JournalIcon = () => <HiDocumentText className={iconBase} />;

const CustomersIcon = () => <MdPeople className={iconBase} />;

const SuppliersIcon = () => <MdShoppingCart className={iconBase} />;

const InvoiceIcon = () => <FaFileInvoiceDollar className={iconBase} />;

const PaymentsIcon = () => <FaCreditCard className={iconBase} />;

const ReportsIcon = () => <FaFileAlt className={iconBase} />;

const Sidebar = ({ isOpen, onClose }) => {
	const { t } = useTranslation();
	const { locale } = useLocale();
	const isRTL = locale === "AR";

	const sidebarLinks = [
		{ label: t("sidebar.dashboard"), path: "/dashboard", icon: <DashboardIcon /> },
		{ label: t("sidebar.accounts"), icon: <AccountsIcon /> },
		{ label: t("sidebar.journalEntries"), icon: <JournalIcon /> },
		{ label: t("sidebar.customers"), icon: <CustomersIcon /> },
		{ label: t("sidebar.suppliers"), icon: <SuppliersIcon /> },
		{ label: t("sidebar.arInvoices"), path: "/ar-invoices", icon: <InvoiceIcon /> },
		{ label: t("sidebar.arPayments"), path: "/payments/ar", icon: <PaymentsIcon /> },
		{ label: t("sidebar.apInvoices"), path: "/ap-invoices", icon: <InvoiceIcon /> },
		{ label: t("sidebar.apPayments"), path: "/payments/ap", icon: <PaymentsIcon /> },
		{ label: t("sidebar.reports"), path: "/reports", icon: <ReportsIcon /> },
	];

	console.log("is Rtl", locale);

	useEffect(() => {
		const originalOverflow = document.body.style.overflow;
		if (isOpen) {
			document.body.style.overflow = "hidden";
		}
		return () => {
			document.body.style.overflow = originalOverflow;
		};
	}, [isOpen]);

	return (
		<>
			<div
				className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
					isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
				}`}
				onClick={onClose}
				aria-hidden="true"
			/>
			<aside
				className={`fixed top-0 z-50 h-full w-72 transform overflow-y-auto bg-gradient-to-b from-[#1f9ec0] via-[#167398] to-[#0c3b4c] shadow-2xl transition-all duration-500 ease-in-out ${
					isRTL ? "right-0" : "left-0"
				} ${isOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"}`}
				aria-label="Sidebar navigation"
			>
				<div className="flex items-center justify-between px-6 py-4 border-b border-white/15">
					<img src={logo} alt="Light ERP Logo" className="w-32 h-auto" />
					<button
						onClick={onClose}
						className="rounded-full border border-white/30 p-1 text-white transition hover:bg-white/10"
						aria-label="Close sidebar"
					>
						<MdClose className="w-4 h-4" />
					</button>
				</div>
				<nav className="px-4 py-1 ">
					{sidebarLinks.map(link => {
						const content = (
							<span className="flex items-center gap-2 rounded-lg px-3 py-3 text-white transition-all duration-200 hover:bg-white/10">
								<span className="flex items-center justify-center rounded-full bg-white/5 p-2">
									{link.icon}
								</span>
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
