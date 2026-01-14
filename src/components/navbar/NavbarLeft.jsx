import React from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { IoMenuOutline } from "react-icons/io5";
import logo from "../../constants";
import Icon from "../../assets/back.svg?react";

const NavbarLeft = ({ onMenuClick }) => {
	const navigate = useNavigate();
	const location = useLocation();

	// Check if we're at home or base route
	const isHomeOrBase = location.pathname === "/" || location.pathname === "/home";

	const handleBackClick = () => {
		navigate(-1);
	};

	return (
		<div className="flex items-center gap-4">
			<button
				className="focus:outline-none hover:opacity-80 transition-opacity"
				onClick={onMenuClick}
				aria-label="Open sidebar navigation"
			>
				<IoMenuOutline className="text-gray-300 w-7 h-7" />
			</button>

			<Link to="/" className="text-white font-bold text-xl hover:opacity-80 transition-opacity">
				<img src={logo} alt="Light ERP logo" />
			</Link>

			{!isHomeOrBase && (
				<button
					className="focus:outline-none hover:opacity-80 transition-opacity"
					onClick={handleBackClick}
					aria-label="Go back"
				>
					<Icon className="w-4 h-4 text-white" />
				</button>
			)}
		</div>
	);
};

export default NavbarLeft;
