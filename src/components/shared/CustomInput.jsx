import React, { memo, useId } from "react";
import PropTypes from "prop-types";
import { twMerge } from "tailwind-merge";

const CustomInput = memo(
	({
		label,
		type = "text",
		value,
		onChange,
		name,
		placeholder = "",
		required = false,
		disabled = false,
		error = "",
		className = "",
		inputClassName = "",
		labelClassName = "",
		bgColor = "bg-[#F5F7F8]",
	}) => {
		const inputId = useId();
		const hasError = Boolean(error);
		const errorId = hasError ? `${inputId}-error` : undefined;

		const handleNumberKeyDown = e => {
			if (type === "number") {
				if (["+", "-", "e", "E"].includes(e.key)) {
					e.preventDefault();
				}
			}
		};

		const handleNumberPaste = e => {
			if (type === "number") {
				const pastedText = e.clipboardData.getData("text");
				if (/[+\-eE]/.test(pastedText)) {
					e.preventDefault();
				}
			}
		};

		return (
			<div className={twMerge("flex flex-col gap-1.5", className)}>
				{label && (
					<label
						htmlFor={inputId}
						className={twMerge(
							"text-sm font-medium text-[#5A6872]",
							required && "after:content-['*'] after:ml-0.5 after:text-red-500",
							labelClassName
						)}
					>
						{label}
					</label>
				)}
				<input
					id={inputId}
					type={type}
					name={name}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					required={required}
					disabled={disabled}
					onKeyDown={handleNumberKeyDown}
					onPaste={handleNumberPaste}
					aria-invalid={hasError}
					aria-describedby={errorId}
					className={twMerge(
						"w-full px-4 py-3 rounded-lg text-sm text-gray-700 " + bgColor + " border border-transparent",
						"placeholder:text-gray-400",
						"focus:outline-none focus:border-[#28819C]/30 focus:bg-white",
						"transition-all duration-200",
						disabled && "bg-gray-100 text-gray-400 cursor-not-allowed",
						hasError && "bg-[#FFF5F2] border-orange-400",
						inputClassName
					)}
				/>
				{hasError && (
					<span id={errorId} className="text-xs text-orange-500 mt-0.5">
						{error}
					</span>
				)}
			</div>
		);
	}
);

CustomInput.displayName = "CustomInput";

CustomInput.propTypes = {
	label: PropTypes.string,
	type: PropTypes.string,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	onChange: PropTypes.func.isRequired,
	name: PropTypes.string,
	placeholder: PropTypes.string,
	required: PropTypes.bool,
	disabled: PropTypes.bool,
	error: PropTypes.string,
	className: PropTypes.string,
	inputClassName: PropTypes.string,
	labelClassName: PropTypes.string,
};

export default CustomInput;
