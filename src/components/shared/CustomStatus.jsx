import React, { memo } from "react";
import PropTypes from "prop-types";
import { twMerge } from "tailwind-merge";
import { useLocale } from "../../hooks/useLocale";

const CustomStatus = memo(
	({
		label,
		checked,
		onChange,
		disabled = false,
		className = "",
		marginTop = "mt-5",
		bgColor = "bg-[#F5F7F8]",
		direction,
	}) => {
		// Auto detect locale (AR / EN)
		const { locale } = useLocale();
		const isRTL = direction ? direction === "rtl" : locale === "AR";

		return (
			<div className={twMerge("flex flex-col gap-1.5", className)}>
				<label className={`text-sm font-medium text-[#5A6872] ${marginTop}`}>{label}</label>

				<div className={twMerge("flex items-center justify-between px-4 py-2 rounded-lg", bgColor)}>
					<span className="text-sm font-medium text-[#7A8895]">{label}</span>

					<button
						type="button"
						onClick={() => !disabled && onChange(!checked)}
						disabled={disabled}
						dir={isRTL ? "rtl" : "ltr"}
						aria-pressed={checked}
						className={twMerge(
							"relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
							checked ? "bg-[#28819C]" : "bg-gray-300",
							disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
						)}
					>
						<span
							className={twMerge(
								"inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
								isRTL
									? checked
										? "translate-x-0"
										: "-translate-x-5"
									: checked
										? "translate-x-6"
										: "translate-x-1"
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
	marginTop: PropTypes.string,
	bgColor: PropTypes.string,
	direction: PropTypes.oneOf(["ltr", "rtl"]),
};

export default CustomStatus;
