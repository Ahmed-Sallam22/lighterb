import React from "react";

const LanguageToggle = ({ locale, onToggle }) => {
	return (
		<button
			onClick={onToggle}
			className="focus:outline-none hover:opacity-80 transition-opacity px-3 py-1 bg-white/10 rounded-md text-white text-sm font-medium"
		>
			{locale === "EN" ? "AR" : "EN"}
		</button>
	);
};

export default LanguageToggle;
