import React from "react";
import { Link } from "react-router";
import { IoMenuOutline } from "react-icons/io5";
import logo from "../../constants";

const NavbarLeft = ({ onMenuClick }) => {
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
				<img src={logo} className="w-[75%]" alt="Light ERP logo" />
			</Link>
		</div>
	);
};

export default NavbarLeft;
