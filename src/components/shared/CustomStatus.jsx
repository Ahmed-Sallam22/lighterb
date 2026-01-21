import React, { memo } from "react";
import PropTypes from "prop-types";
import { twMerge } from "tailwind-merge";

const CustomStatus = memo(
	({
		label,
		checked,
		onChange,
		disabled = false,
		className = "",
		marginTop = "mt-5",

		bgColor = "bg-[#F5F7F8]",
	}) => {
		return (
			<div className={twMerge("flex flex-col gap-1.5", className)}>
				<label className={`text-sm font-medium text-[#5A6872] ${marginTop}`}></label>
				<div className={`flex items-center justify-between px-4 py-2 ${bgColor} rounded-lg`}>
					<span className="text-sm font-medium text-[#7A8895]">{label}</span>
					<button
						type="button"
						onClick={() => !disabled && onChange(!checked)}
						disabled={disabled}
						aria-pressed={checked}
						className={twMerge(
							"relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
							checked ? "bg-[#28819C]" : "bg-gray-300",
							disabled && "opacity-50 cursor-not-allowed"
						)}
					>
						<span
							className={twMerge(
								"inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
								checked ? "translate-x-6" : "translate-x-1"
							)}
						/>
					</button>
				</div>
			</div>
		);
	}
);

CustomStatus.displayName = "CustomStatus";

CustomStatus.propTypes = {
	label: PropTypes.string.isRequired,
	checked: PropTypes.bool.isRequired,
	onChange: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
	className: PropTypes.string,
};

export default CustomStatus;
