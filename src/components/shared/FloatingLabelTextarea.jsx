import React, { useId, useState, memo } from "react";
import PropTypes from "prop-types";

const FloatingLabelTextarea = memo(
	({
		label,
		value,
		onChange,
		name,
		placeholder = "",
		rows = 5,
		required = false,
		disabled = false,
		error = "",
		className = "",
		textareaClassName = "",
		labelClassName = "",
	}) => {
		const [isFocused, setIsFocused] = useState(false);
		const textareaId = useId();

		const hasValue = value && value.toString().length > 0;
		const isFloating = isFocused || hasValue;
		const hasError = Boolean(error);
		const errorId = hasError ? `${textareaId}-error` : undefined;

		const wrapperGlow = isFocused
			? "from-[#1da8d8] via-[#48C1F0] to-[#1da8d8]"
			: "from-white/15 via-white/10 to-white/5 shadow-md";

		const innerWrapperClasses = `relative rounded-[18px] ${
			hasError ? "bg-[#FFF5F2] border-l-4 border-orange-400" : "bg-white"
		}`;

		return (
			<div className={`relative my-6 ${className}`}>
				<div
					className={`
          relative rounded-[20px] transition-all duration-300
          bg-linear-to-r ${wrapperGlow}
          ${disabled ? "opacity-70" : ""}
        `}
				>
					<div className={innerWrapperClasses}>
						<textarea
							id={textareaId}
							name={name}
							value={value}
							onChange={onChange}
							rows={rows}
							onFocus={() => setIsFocused(true)}
							onBlur={() => setIsFocused(false)}
							placeholder={isFloating ? placeholder : ""}
							required={required}
							disabled={disabled}
							aria-required={required}
							aria-invalid={hasError}
							aria-describedby={errorId}
							className={`
              w-full text-sm rounded-[18px]
              px-5 py-4 text-[#031b28]
              resize-none
              ${isFloating ? "placeholder:text-[#7A9098]" : "placeholder-transparent"}
              focus:outline-none
              disabled:cursor-not-allowed
              ${textareaClassName}
            `}
						/>

						{/* Floating Label */}
						<label
							htmlFor={textareaId}
							className={`
              absolute start-4 font-semibold pointer-events-none
              transition-all duration-200
              ${isFloating ? "-top-4 text-xs px-0 text-gray-700" : "top-4 text-sm text-[#7A9098]"}
              ${hasError ? "text-gray-900" : ""}
              ${labelClassName}
            `}
						>
							{label} {required && <span className="text-red-400">*</span>}
						</label>

						{/* Error Message */}
						{hasError && (
							<p id={errorId} className="absolute -bottom-6 start-1 text-xs text-gray-500">
								{error}
							</p>
						)}
					</div>
				</div>
			</div>
		);
	}
);

FloatingLabelTextarea.displayName = "FloatingLabelTextarea";

FloatingLabelTextarea.propTypes = {
	label: PropTypes.string.isRequired,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	onChange: PropTypes.func.isRequired,
	name: PropTypes.string,
	placeholder: PropTypes.string,
	rows: PropTypes.number,
	required: PropTypes.bool,
	disabled: PropTypes.bool,
	error: PropTypes.string,
	className: PropTypes.string,
	textareaClassName: PropTypes.string,
	labelClassName: PropTypes.string,
};

export default FloatingLabelTextarea;
