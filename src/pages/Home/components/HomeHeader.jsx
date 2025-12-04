import React from "react";
import logo from "../../../assets/logo.png";

const HomeHeader = ({ title }) => {
	return (
		<div className="text-left">
			<h1 className="text-[32px] font-bold text-[#D3D3D3] flex items-center gap-2">
				{title}
				<img src={logo} alt="Light ERP Logo" className="w-28 h-auto inline-block ml-2" />
			</h1>
		</div>
	);
};

export default HomeHeader;
