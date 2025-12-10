import React from "react";
import { IoHomeOutline } from "react-icons/io5";

const HomeButton = ({ onNavigateHome }) => {
	return (
		<button 
			onClick={onNavigateHome} 
			className="focus:outline-none hover:opacity-80 transition-opacity"
			aria-label="Go to home page"
		>
			<IoHomeOutline className="text-white w-6 h-6" aria-hidden="true" />
		</button>
	);
};

export default HomeButton;
