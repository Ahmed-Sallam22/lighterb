import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useLocale } from "../hooks/useLocale";
import Sidebar from "./Sidebar";
import NavbarLeft from "./navbar/NavbarLeft";
import NavbarRight from "./navbar/NavbarRight";

const Navbar = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const { locale, setLocale } = useLocale();
	const navigate = useNavigate();

	const handleLocaleToggle = () => {
		setLocale(locale === "EN" ? "AR" : "EN");
	};

	const handleNavigateHome = () => {
		navigate("/");
	};

	return (
		<nav className="bg-[#08252F] px-6 py-3 relative z-30">
			<Sidebar key={locale} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
			<div className="flex justify-between items-center">
				<NavbarLeft onMenuClick={() => setIsSidebarOpen(true)} />
				<NavbarRight locale={locale} onLocaleToggle={handleLocaleToggle} onNavigateHome={handleNavigateHome} />
			</div>
		</nav>
	);
};

export default Navbar;
