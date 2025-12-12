const iconBase = "w-6 h-6 text-[#a7e3f6]";
import { MdDashboard, MdPeople, MdShoppingCart, MdWork } from "react-icons/md";
import { HiDocumentText, HiUsers } from "react-icons/hi";
import { FaFileInvoiceDollar, FaCreditCard, FaFileAlt } from "react-icons/fa";
export const getSidebarLinks = t => [
	{ label: t("sidebar.dashboard"), path: "/dashboard", icon: <MdDashboard className={iconBase} /> },
	{ label: t("sidebar.accounts"), icon: <HiUsers className={iconBase} /> },
	{ label: t("sidebar.journalEntries"), icon: <HiDocumentText className={iconBase} /> },
	{ label: t("sidebar.customers"), icon: <MdPeople className={iconBase} /> },
	{ label: t("sidebar.suppliers"), icon: <MdShoppingCart className={iconBase} /> },
	{ label: t("sidebar.arInvoices"), path: "/ar-invoices", icon: <FaCreditCard className={iconBase} /> },
	{ label: t("sidebar.arPayments"), path: "/ar-payments", icon: <FaFileInvoiceDollar className={iconBase} /> },
	{ label: t("sidebar.apInvoices"), path: "/ap-invoices", icon: <FaFileAlt className={iconBase} /> },
	{ label: t("sidebar.apPayments"), path: "/ap-payments", icon: <FaCreditCard className={iconBase} /> },
	{ label: t("sidebar.reports"), path: "/reports", icon: <FaFileAlt className={iconBase} /> },
	{ label: t("sidebar.jobRoles", "Job Roles"), path: "/job-roles", icon: <MdWork className={iconBase} /> },
];
