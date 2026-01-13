import React, { useId, useState, memo } from "react";
import PropTypes from "prop-types";

const FloatingLabelInput = memo(({
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
}) => {
	const [isFocused, setIsFocused] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const inputRef = React.useRef(null);
	const inputId = useId();

	const isDateField = type === "date";
	const hasValue = value && value.toString().length > 0;
	const isFloating = isFocused || hasValue || isDateField;
	const hasError = Boolean(error);
	const errorId = hasError ? `${inputId}-error` : undefined;

	// Handle number input to prevent +, -, e, E
	const handleNumberKeyDown = e => {
		if (type === "number") {
			// Prevent +, -, e, E keys
			if (["+", "-", "e", "E"].includes(e.key)) {
				e.preventDefault();
			}
		}
	};

	// Handle paste event for number input
	const handleNumberPaste = e => {
		if (type === "number") {
			const pastedText = e.clipboardData.getData("text");
			// Check if pasted text contains invalid characters
			if (/[+\-eE]/.test(pastedText)) {
				e.preventDefault();
			}
		}
	};

	const getInputType = () => {
		if (type === "password" && showPassword) {
			return "text";
		}
		return type;
	};

	const CalendarIcon = () => (
		<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
			<g clipPath="url(#clip0_52_2116)">
				<path
					d="M19.6875 1.96633L14.4329 1.96635V0.658447C14.4329 0.295869 14.1392 0.00219727 13.7767 0.00219727C13.4141 0.00219727 13.1204 0.295869 13.1204 0.658447V1.96603H7.87041V0.658447C7.87041 0.295869 7.57673 0.00219727 7.21416 0.00219727C6.85158 0.00219727 6.55791 0.295869 6.55791 0.658447V1.96603H1.3125C0.587672 1.96603 0 2.5537 0 3.27853V19.6848C0 20.4096 0.587672 20.9973 1.3125 20.9973H19.6875C20.4123 20.9973 21 20.4096 21 19.6848V3.27853C21 2.554 20.4123 1.96633 19.6875 1.96633ZM19.6875 19.6848H1.3125V3.27853H6.55791V3.9397C6.55791 4.30225 6.85158 4.59595 7.21416 4.59595C7.57673 4.59595 7.87041 4.30225 7.87041 3.9397V3.27885H13.1204V3.94003C13.1204 4.3026 13.4141 4.59628 13.7767 4.59628C14.1392 4.59628 14.4329 4.3026 14.4329 3.94003V3.27885H19.6875V19.6848ZM15.0938 10.4976H16.4062C16.7685 10.4976 17.0625 10.2036 17.0625 9.84133V8.52883C17.0625 8.16658 16.7685 7.87258 16.4062 7.87258H15.0938C14.7315 7.87258 14.4375 8.16658 14.4375 8.52883V9.84133C14.4375 10.2036 14.7315 10.4976 15.0938 10.4976ZM15.0938 15.7473H16.4062C16.7685 15.7473 17.0625 15.4536 17.0625 15.091V13.7785C17.0625 13.4163 16.7685 13.1223 16.4062 13.1223H15.0938C14.7315 13.1223 14.4375 13.4163 14.4375 13.7785V15.091C14.4375 15.4539 14.7315 15.7473 15.0938 15.7473ZM11.1562 13.1223H9.84375C9.4815 13.1223 9.1875 13.4163 9.1875 13.7785V15.091C9.1875 15.4536 9.4815 15.7473 9.84375 15.7473H11.1562C11.5185 15.7473 11.8125 15.4536 11.8125 15.091V13.7785C11.8125 13.4166 11.5185 13.1223 11.1562 13.1223ZM11.1562 7.87258H9.84375C9.4815 7.87258 9.1875 8.16658 9.1875 8.52883V9.84133C9.1875 10.2036 9.4815 10.4976 9.84375 10.4976H11.1562C11.5185 10.4976 11.8125 10.2036 11.8125 9.84133V8.52883C11.8125 8.16625 11.5185 7.87258 11.1562 7.87258ZM5.90625 7.87258H4.59375C4.2315 7.87258 3.9375 8.16658 3.9375 8.52883V9.84133C3.9375 10.2036 4.2315 10.4976 4.59375 10.4976H5.90625C6.2685 10.4976 6.5625 10.2036 6.5625 9.84133V8.52883C6.5625 8.16625 6.2685 7.87258 5.90625 7.87258ZM5.90625 13.1223H4.59375C4.2315 13.1223 3.9375 13.4163 3.9375 13.7785V15.091C3.9375 15.4536 4.2315 15.7473 4.59375 15.7473H5.90625C6.2685 15.7473 6.5625 15.4536 6.5625 15.091V13.7785C6.5625 13.4166 6.2685 13.1223 5.90625 13.1223Z"
					fill="#7A9098"
				/>
			</g>
			<defs>
				<clipPath id="clip0_52_2116">
					<rect width="21" height="21" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);

	const EyeIcon = ({ isVisible }) => (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			{isVisible ? (
				<>
					<path
						d="M12 5C7 5 2.73 8.11 1 12.5C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12.5C21.27 8.11 17 5 12 5ZM12 17.5C9.24 17.5 7 15.26 7 12.5C7 9.74 9.24 7.5 12 7.5C14.76 7.5 17 9.74 17 12.5C17 15.26 14.76 17.5 12 17.5ZM12 9.5C10.34 9.5 9 10.84 9 12.5C9 14.16 10.34 15.5 12 15.5C13.66 15.5 15 14.16 15 12.5C15 10.84 13.66 9.5 12 9.5Z"
						fill="#7A9098"
					/>
				</>
			) : (
				<>
					<path
						d="M12 7C14.76 7 17 9.24 17 12C17 12.65 16.87 13.26 16.64 13.83L19.56 16.75C21.07 15.49 22.26 13.86 23 12C21.27 7.61 17 4.5 12 4.5C10.6 4.5 9.26 4.75 8 5.2L10.17 7.37C10.74 7.13 11.35 7 12 7ZM2 4.27L4.28 6.55L4.73 7C3.08 8.3 1.78 10 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.8 19.08L19.73 22L21 20.73L3.27 3M7.53 9.8L9.08 11.35C9.03 11.56 9 11.78 9 12C9 13.66 10.34 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8ZM11.84 9.02L14.99 12.17L15.01 11.99C15.01 10.33 13.67 8.99 12.01 8.99L11.84 9.02Z"
						fill="#7A9098"
					/>
				</>
			)}
		</svg>
	);

	const wrapperGlow = hasError
		? "from-red-500 via-red-400 to-red-500 "
		: isFocused
		? "from-[#1da8d8] via-[#48C1F0] to-[#1da8d8] "
		: "from-white/15 via-white/10 to-white/5 shadow-md";

	const showPlaceholder = isFloating;

	return (
		<div className={`relative ${className}`}>
			<div
				className={`
          relative rounded-[20px] transition-all duration-300
          bg-linear-to-r ${wrapperGlow}
          ${disabled ? "opacity-70" : ""}
        `}
			>
				<div className="relative rounded-[18px] bg-white ">
					<input
						ref={inputRef}
						type={getInputType()}
						id={inputId}
						name={name}
						value={value}
						onChange={onChange}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						onKeyDown={handleNumberKeyDown}
						onPaste={handleNumberPaste}
						placeholder={showPlaceholder ? placeholder || (isDateField ? "dd/mm/yyyy" : "") : ""}
						required={required}
						disabled={disabled}
						aria-required={required}
						aria-invalid={hasError}
						aria-describedby={errorId}
						className={`
            w-full text-sm rounded-[18px] 
            px-5 py-4  text-[#031b28]
            
            ${
				isDateField
					? "placeholder:text-[#4b6472] placeholder:tracking-[0.15em]"
					: showPlaceholder
					? "placeholder:text-[#7A9098]"
					: "placeholder-transparent"
			}
            focus:outline-none
            disabled:cursor-not-allowed
            ${isDateField || type === "password" ? "pe-12" : ""}
            ${
				isDateField
					? "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
					: ""
			}
            
            ${inputClassName}
          `}
					/>

					{/* Floating Label */}
					<label
						htmlFor={inputId}
						className={`
            absolute start-4 font-semibold pointer-events-none
            transition-all duration-200
            ${
				isFloating
					? "-top-4 text-sm px-2 rounded-full  text-[#28819C]"
					: "top-1/2 -translate-y-1/2 text-sm text-[#7A9098]"
			}
            ${hasError ? "text-red-400 bg-[#40171d]" : ""}
            ${labelClassName}
            `}
					>
						{label} {required && <span className="text-red-400">*</span>}
					</label>

					{/* Calendar Icon for Date Input */}
					{type === "date" && (
						<button
							type="button"
							onClick={() => inputRef.current?.showPicker?.()}
							className="absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform duration-200"
							disabled={disabled}
						>
							<CalendarIcon />
						</button>
					)}

					{/* Eye Icon for Password Input */}
					{type === "password" && (
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute end-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
						>
							<EyeIcon isVisible={showPassword} />
						</button>
					)}
					{/* Error Message */}
					{hasError && (
						<p
							id={errorId}
							className="absolute -bottom-6 start-1 text-sm text-red-400 flex items-center gap-1"
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
									fill="currentColor"
								/>
							</svg>
							{error}
						</p>
					)}
				</div>
			</div>
		</div>
	);
});

FloatingLabelInput.displayName = 'FloatingLabelInput';

FloatingLabelInput.propTypes = {
	label: PropTypes.string.isRequired,
	type: PropTypes.oneOf(["text", "email", "password", "number", "date", "tel", "url"]),
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	onChange: PropTypes.func.isRequired,
	name: PropTypes.string,
	placeholder: PropTypes.string,
	required: PropTypes.bool,
	disabled: PropTypes.bool,
	error: PropTypes.string,
	className: PropTypes.string,
	inputClassName: PropTypes.string,
};

export default FloatingLabelInput;
