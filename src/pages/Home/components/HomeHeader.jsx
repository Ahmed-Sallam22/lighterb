import React from "react";
import MiniLogo from "../../../assets/miniLogo.svg?react";
const HomeHeader = ({ title }) => {
	return (
		<div className="text-left mb-8 flex items-center gap-2">
			<h1 className="text-[32px] font-bold text-[#D3D3D3] flex items-center gap-2">{title}</h1>
			<MiniLogo />
		</div>
	);
};

export default HomeHeader;
