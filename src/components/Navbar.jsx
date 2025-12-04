import React, { useState } from "react";
import { Link, useNavigate } from "react-router";

import { IoHomeOutline, IoMenuOutline, IoSearchOutline, IoPersonCircleOutline } from "react-icons/io5";
import { useLocale } from "../hooks/useLocale";

import logo from "../assets/Logo.png";
import Sidebar from "./Sidebar";
const Navbar = () => {
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const { locale, setLocale } = useLocale();
	const navigate = useNavigate();

	return (
		<nav className="bg-[#08252F] px-6 py-3 relative z-30">
			<Sidebar key={locale} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-4">
					{/* Menu Icon */}
					<button
						className="focus:outline-none hover:opacity-80 transition-opacity"
						onClick={() => setIsSidebarOpen(true)}
						aria-label="Open sidebar navigation"
					>
						<IoMenuOutline className="text-gray-300 w-7 h-7" />
					</button>

					<Link to="/" className="text-white font-bold text-xl hover:opacity-80 transition-opacity">
						<img src={logo} className="w-[25%]" alt="Light ERP logo" />
					</Link>
				</div>

				<div className="flex items-center gap-6 justify-center">
					<div className="relative">
						<button
							onClick={() => setIsSearchOpen(!isSearchOpen)}
							className="focus:outline-none hover:opacity-80 transition-opacity"
						>
							<IoSearchOutline className="text-white w-6 h-6" />
						</button>

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

					{/* Language Toggler */}
					<button
						onClick={() => setLocale(locale === "EN" ? "AR" : "EN")}
						className="focus:outline-none hover:opacity-80 transition-opacity px-3 py-1 bg-white/10 rounded-md text-white text-sm font-medium"
					>
						{locale === "EN" ? "AR" : "EN"}
					</button>

					<button
						onClick={() => navigate("/")}
						className="focus:outline-none hover:opacity-80 transition-opacity"
					>
						<IoHomeOutline className="text-white w-6 h-6" />
					</button>

					<div className="flex items-center gap-3">
						<IoPersonCircleOutline className="text-white w-7 h-7" />
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
