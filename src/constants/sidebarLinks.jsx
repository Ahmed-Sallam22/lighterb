const iconBase = "w-6 h-6 text-[#a7e3f6]";
import { MdDashboard, MdPeople, MdShoppingCart, MdWork } from "react-icons/md";
import { HiDocumentText, HiUsers } from "react-icons/hi";
import { FaFileInvoiceDollar, FaCreditCard, FaFileAlt, FaUserTie } from "react-icons/fa";

export const getSidebarLinks = (t, user) => {
	const links = [
		{ label: t("sidebar.dashboard"), path: "/dashboard", icon: <MdDashboard className={iconBase} /> },
		// { label: t("sidebar.accounts"), icon: <HiUsers className={iconBase} /> },
		{ label: t("sidebar.journalEntries"), path: "/journal-entries", icon: <HiDocumentText className={iconBase} /> },
		{ label: t("sidebar.customers"), path: "/customers", icon: <MdPeople className={iconBase} /> },
		{ label: t("sidebar.suppliers"), path: "/suppliers", icon: <MdShoppingCart className={iconBase} /> },
		{ label: t("sidebar.arInvoices"), path: "/ar-invoices", icon: <FaCreditCard className={iconBase} /> },
		{ label: t("sidebar.arReceipts"), path: "/ar-receipts", icon: <FaFileInvoiceDollar className={iconBase} /> },
		{ label: t("sidebar.apInvoices"), path: "/ap-invoices", icon: <FaFileAlt className={iconBase} /> },
		{ label: t("sidebar.apPayments"), path: "/ap-payments", icon: <FaCreditCard className={iconBase} /> },
		{
			label: t("sidebar.oneTimeSupplierInvoices"),
			path: "/one-time-supplier-invoices",
			icon: <FaUserTie className={iconBase} />,
		},
		{ label: t("sidebar.reports"), path: "/reports", icon: <FaFileAlt className={iconBase} /> },
		{ label: t("sidebar.jobRoles", "Job Roles"), path: "/job-roles", icon: <MdWork className={iconBase} /> },
	];

	// Add Users link only for super_admin and admin
	if (user?.user_type === "super_admin" || user?.user_type === "admin") {
		links.push({
			label: t("sidebar.users", "Users"),
			path: "/users",
			icon: <HiUsers className={iconBase} />,
		});
	}

	return links;
};
