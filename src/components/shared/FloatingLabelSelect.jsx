import React, { useState, useRef, useEffect, useId, memo } from "react";
import PropTypes from "prop-types";
import { PiCirclesFourFill } from "react-icons/pi";

const FloatingLabelSelect = memo(({
	label,
	value,
	onChange,
	options = [],
	name,
	placeholder = "Select an option",
	required = false,
	disabled = false,
	error = "",
	className = "",
	searchable = true,
	icon = false,
	buttonClassName = "",
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	const selectRef = useRef(null);
	const searchInputRef = useRef(null);
	const selectId = useId();

	const hasValue = value !== "" && value !== null && value !== undefined;
	const isFloating = isFocused || hasValue || isOpen;
	const hasError = Boolean(error);
	const errorId = hasError ? `${selectId}-error` : undefined;

	// Get selected option label
	const selectedOption = options.find(opt => opt.value === value);
	const selectedLabel = selectedOption ? selectedOption.label : "";

	// Filter options based on search term
	const filteredOptions = searchable
		? options.filter(option => option.label.toString().toLowerCase().includes(searchTerm.toLowerCase()))
		: options;

	// Handle click outside to close dropdown
	useEffect(() => {
		const handleClickOutside = event => {
			if (selectRef.current && !selectRef.current.contains(event.target)) {
				setIsOpen(false);
				setSearchTerm("");
				setIsFocused(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Focus search input when dropdown opens
	useEffect(() => {
		if (isOpen && searchable && searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, [isOpen, searchable]);

	const handleToggle = () => {
		if (!disabled) {
			setIsOpen(!isOpen);
			setIsFocused(true);
		}
	};

	const handleSelect = optionValue => {
		onChange({
			target: {
				name,
				value: optionValue,
			},
		});
		setIsOpen(false);
		setSearchTerm("");
		setIsFocused(false);
	};

	const handleKeyDown = e => {
		if (e.key === "Escape") {
			setIsOpen(false);
			setSearchTerm("");
			setIsFocused(false);
		}
	};

	const ArrowIcon = () => (
		<svg
			width="20"
			height="12"
			viewBox="0 0 23 12"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={`transition-all duration-300 ${isOpen ? "rotate-180" : ""}`}
		>
			<path
				d="M0.185965 1.10744L11.0266 11.8081C11.0872 11.8682 11.1593 11.9158 11.2386 11.9484C11.3179 11.9809 11.403 11.9976 11.4888 11.9976C11.5747 11.9976 11.6598 11.9809 11.7391 11.9484C11.8184 11.9158 11.8904 11.8682 11.9511 11.8081L22.7917 1.10744C22.9071 0.994976 22.9762 0.844266 22.9856 0.684443C22.995 0.52462 22.944 0.367035 22.8425 0.242155C22.7411 0.117275 22.5963 0.0339723 22.4363 0.00834515C22.2762 -0.017282 22.1122 0.0165894 21.976 0.103413L11.8314 6.37724C11.7271 6.44179 11.6065 6.47603 11.4834 6.47603C11.3603 6.47603 11.2397 6.44179 11.1354 6.37724L0.996225 0.103413C0.85995 0.0214346 0.698058 -0.00862965 0.540929 0.0188645C0.3838 0.0463587 0.242235 0.129516 0.142792 0.25274C0.0433493 0.375963 -0.0071348 0.530785 0.000813974 0.688146C0.00876274 0.845507 0.0745979 0.994594 0.185965 1.10744Z"
				fill={isOpen || hasValue ? "#0d5f7a" : "#7A9098"}
			/>
		</svg>
	);

	const wrapperGlow = hasError
		? "from-red-500 via-red-400 to-red-500 "
		: isFocused
		? "from-[#1da8d8] via-[#48C1F0] to-[#1da8d8] "
		: "from-white/15 via-white/10 to-white/5 shadow-md";

	const buttonTextClasses = hasValue
		? "text-[#0f3143] font-medium"
		: isFloating
		? "text-[#7A9098]"
		: "text-transparent";

	const displayText = hasValue ? selectedLabel : isFloating ? placeholder : "";

	return (
		<div className={`relative overflow-visible ${className}`} ref={selectRef}>
			<div
				className={`
          relative rounded-[20px] p-0.5 transition-all duration-300 overflow-visible
          bg-gradient-to-r ${wrapperGlow}
          ${disabled ? "opacity-70" : ""}
        `}
			>
				<div className="relative rounded-[18px] bg-white">
					{/* Select Button */}
					<button
						type="button"
						id={selectId}
						onClick={handleToggle}
						onKeyDown={handleKeyDown}
						disabled={disabled}
						aria-expanded={isOpen}
						aria-haspopup="listbox"
						aria-required={required}
						aria-invalid={hasError}
						aria-describedby={errorId}
						className={`
              w-full bg-transparent rounded-[18px] border-none
              px-5 py-4 min-h-10 text-sm text-[#031b28] text-start
              focus:outline-none
              disabled:cursor-not-allowed
              flex items-center justify-between
			  ${buttonClassName}
            `}
					>
						{icon && <span>{icon}</span>}
						<span className={`transition-colors duration-200 ${buttonTextClasses}`}>{displayText}</span>
						<ArrowIcon />
					</button>
					<label
						htmlFor={selectId}
						className={`
              absolute start-4 font-semibold pointer-events-none
              transition-all duration-200
              ${isFloating ? "-top-3 text-xs px-3 text-gray-500" : "top-1/2 -translate-y-1/2 text-sm text-[#7A9098]"}
              ${hasError ? "text-red-400 bg-[#40171d]" : ""}
            `}
					>
						{label} {required && <span className="text-red-400">*</span>}
					</label>

					{/* Dropdown Menu */}
					{isOpen && (
						<div
							className="absolute top-full start-0 end-0 mt-2 bg-white rounded-[18px] shadow-2xl border border-[#48C1F0]/30 z-9999 max-h-64 overflow-hidden"
							role="listbox"
						>
							{searchable && (
								<div className="p-3 border-b border-gray-200">
									<input
										ref={searchInputRef}
										type="text"
										value={searchTerm}
										onChange={e => setSearchTerm(e.target.value)}
										placeholder="Search..."
										className="w-full px-4 py-2 text-sm text-[#031b28] bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#48C1F0]/50 focus:border-[#48C1F0]"
										onClick={e => e.stopPropagation()}
									/>
								</div>
							)}

							{/* Options List */}
							<div className="overflow-y-auto max-h-48 custom-scrollbar">
								{filteredOptions.length > 0 ? (
									filteredOptions.map((option, index) => (
										<button
											key={`${option.value}-${index}`}
											type="button"
											role="option"
											aria-selected={option.value === value}
											onClick={() => handleSelect(option.value)}
											className={`
                        w-full px-5 py-3 text-start text-base transition-colors duration-150
                        hover:bg-[#48C1F0]/10 focus:bg-[#48C1F0]/10 focus:outline-none
                        ${option.value === value ? "bg-[#48C1F0]/20 text-[#031b28] font-semibold" : "text-[#031b28]"}
                      `}
										>
											{option.label}
											{option.value === value && (
												<svg
													className="inline-block ms-2"
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
														fill="#48C1F0"
													/>
												</svg>
											)}
										</button>
									))
								) : (
									<div className="px-5 py-3 text-center text-[#7A9098]">No options found</div>
								)}
							</div>
						</div>
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

			{/* Custom Scrollbar Styles */}
			<style jsx>{`
				.custom-scrollbar::-webkit-scrollbar {
					width: 6px;
				}
				.custom-scrollbar::-webkit-scrollbar-track {
					background: #f1f1f1;
					border-radius: 10px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: #48c1f0;
					border-radius: 10px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: #3ba8d4;
				}
			`}</style>
		</div>
	);
});

FloatingLabelSelect.displayName = 'FloatingLabelSelect';

FloatingLabelSelect.propTypes = {
	label: PropTypes.string.isRequired,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	onChange: PropTypes.func.isRequired,
	options: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
			value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
		})
	).isRequired,
	name: PropTypes.string,
	placeholder: PropTypes.string,
	required: PropTypes.bool,
	disabled: PropTypes.bool,
	error: PropTypes.string,
	className: PropTypes.string,
	searchable: PropTypes.bool,
};

export default FloatingLabelSelect;
