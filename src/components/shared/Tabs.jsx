import React from "react";
import Button from "./Button";

/**
 * Reusable Tabs Component
 * @param {Array} tabs - Array of tab objects with { id, label, count?, disabled? }
 * @param {string} activeTab - Currently active tab id
 * @param {function} onTabChange - Callback when tab changes
 * @param {string} className - Additional classes for container
 */
const Tabs = ({ tabs, activeTab, onTabChange, className = "" }) => {
	return (
		<div className={`flex items-center gap-0 bg-white rounded-full p-1 w-fit ${className}`}>
			{tabs.map(tab => (
				<Button
					key={tab.id}
					onClick={() => !tab.disabled && onTabChange(tab.id)}
					disabled={tab.disabled}
					title={
						<span className="flex items-center gap-2">
							{tab.label}
							{tab.count !== undefined && (
								<span
									className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors duration-300 ${
										activeTab === tab.id ? "bg-[#28819C] text-white" : "bg-gray-200 text-gray-600"
									}`}
								>
									{tab.count}
								</span>
							)}
						</span>
					}
					className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
						tab.disabled
							? "bg-transparent text-gray-300 cursor-not-allowed opacity-50"
							: activeTab === tab.id
							? "bg-[#EEEEEE] shadow-sm text-black"
							: "bg-transparent text-gray-600 hover:text-[#28819C] shadow-none"
					}`}
				/>
			))}
		</div>
	);
};

export default Tabs;
