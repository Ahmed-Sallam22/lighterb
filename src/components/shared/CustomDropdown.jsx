import React, { useState, useRef, useEffect, useId, memo } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { twMerge } from "tailwind-merge";

const CustomDropdown = memo(
	({
		label,
		value,
		onChange,
		options = [],
		name,
		placeholder = "Select...",
		required = false,
		disabled = false,
		error = "",
		className = "",
		searchable = false,
		bgColor = "bg-[#F5F7F8]",
		hasleftBorder = false,
		borderColor = "border-gray-300",
	}) => {
		const [isOpen, setIsOpen] = useState(false);
		const [searchTerm, setSearchTerm] = useState("");
		const [dropdownPosition, setDropdownPosition] = useState({
			top: 0,
			bottom: 0,
			left: 0,
			width: 0,
			openUpward: false,
		});
		const selectRef = useRef(null);
		const searchInputRef = useRef(null);
		const selectId = useId();

		const hasError = Boolean(error);
		const errorId = hasError ? `${selectId}-error` : undefined;

		const selectedOption = options.find(opt => opt.value === value);
		const selectedLabel = selectedOption ? selectedOption.label : "";

		const filteredOptions = searchable
			? options.filter(option => option.label.toString().toLowerCase().includes(searchTerm.toLowerCase()))
			: options;

		useEffect(() => {
			if (isOpen && selectRef.current) {
				const rect = selectRef.current.getBoundingClientRect();
				const viewportHeight = window.innerHeight;
				const spaceBelow = viewportHeight - rect.bottom;
				const spaceAbove = rect.top;
				const dropdownHeight = 280;

				const shouldOpenUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

				setDropdownPosition({
					top: rect.bottom + 4,
					bottom: window.innerHeight - rect.top + 4,
					left: rect.left,
					width: rect.width,
					openUpward: shouldOpenUpward,
				});
			}
		}, [isOpen]);

		useEffect(() => {
			const handleClickOutside = event => {
				if (selectRef.current && !selectRef.current.contains(event.target)) {
					const dropdownElement = document.querySelector('[data-custom-dropdown="true"]');
					if (dropdownElement && dropdownElement.contains(event.target)) {
						return;
					}
					setIsOpen(false);
					setSearchTerm("");
				}
			};

			if (isOpen) {
				document.addEventListener("mousedown", handleClickOutside);
				return () => document.removeEventListener("mousedown", handleClickOutside);
			}
		}, [isOpen]);

		useEffect(() => {
			if (isOpen && searchable && searchInputRef.current) {
				searchInputRef.current.focus();
			}
		}, [isOpen, searchable]);

		useEffect(() => {
			if (isOpen) {
				const handleScroll = () => {
					if (selectRef.current) {
						const rect = selectRef.current.getBoundingClientRect();
						const viewportHeight = window.innerHeight;
						const spaceBelow = viewportHeight - rect.bottom;
						const spaceAbove = rect.top;
						const dropdownHeight = 280;

						const shouldOpenUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

						setDropdownPosition({
							top: rect.bottom + 4,
							bottom: window.innerHeight - rect.top + 4,
							left: rect.left,
							width: rect.width,
							openUpward: shouldOpenUpward,
						});
					}
				};

				window.addEventListener("scroll", handleScroll, true);
				return () => window.removeEventListener("scroll", handleScroll, true);
			}
		}, [isOpen]);

		const handleToggle = () => {
			if (!disabled) {
				setIsOpen(!isOpen);
			}
		};

		const handleSelect = optionValue => {
			if (onChange) {
				onChange({
					target: {
						name,
						value: optionValue,
					},
				});
			}
			setIsOpen(false);
			setSearchTerm("");
		};

		const handleKeyDown = e => {
			if (e.key === "Escape") {
				setIsOpen(false);
				setSearchTerm("");
			}
		};

		const ChevronIcon = () => (
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				className={twMerge("transition-transform duration-200 text-gray-400", isOpen && "rotate-180")}
			>
				<path
					d="M6 9L12 15L18 9"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		);

		const dropdownContent = isOpen
			? createPortal(
					<div
						data-custom-dropdown="true"
						className="fixed z-[9999]"
						style={{
							top: dropdownPosition.openUpward ? "auto" : dropdownPosition.top,
							bottom: dropdownPosition.openUpward ? dropdownPosition.bottom : "auto",
							left: dropdownPosition.left,
							width: dropdownPosition.width,
						}}
					>
						<div
							className={twMerge(
								"bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden",
								"animate-fadeIn"
							)}
						>
							{searchable && (
								<div className="p-2 border-b border-gray-100">
									<input
										ref={searchInputRef}
										type="text"
										value={searchTerm}
										onChange={e => setSearchTerm(e.target.value)}
										placeholder="Search..."
										className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#28819C]/20"
									/>
								</div>
							)}
							<div className="max-h-60 overflow-y-auto">
								{filteredOptions.length === 0 ? (
									<div className="px-4 py-3 text-sm text-gray-500 text-center">No options found</div>
								) : (
									filteredOptions.map(option => (
										<button
											key={option.value}
											type="button"
											onClick={() => handleSelect(option.value)}
											className={twMerge(
												"w-full px-4 py-3 text-start text-sm transition-colors",
												"hover:bg-gray-50",
												option.value === value && "bg-[#E8F7FA] text-[#28819C] font-medium"
											)}
										>
											{option.label}
										</button>
									))
								)}
							</div>
						</div>
					</div>,
					document.body
				)
			: null;

		return (
			<div className={
				twMerge("flex flex-col gap-1.5", hasleftBorder ? `border-l-2 ${borderColor} pl-2` : "", className)
			} ref={selectRef}>
				{label && (
					<label
						htmlFor={selectId}
						className={twMerge(
							"text-sm font-medium text-[#5A6872]",
							required && "after:content-['*'] after:ml-0.5 after:text-red-500"
						)}
					>
						{label}
					</label>
				)}
				<button
					id={selectId}
					type="button"
					onClick={handleToggle}
					onKeyDown={handleKeyDown}
					disabled={disabled}
					aria-expanded={isOpen}
					aria-haspopup="listbox"
					aria-invalid={hasError}
					aria-describedby={errorId}
					className={twMerge(
						"flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm text-start",
						bgColor,
						"focus:outline-none focus:border-[#28819C]/30 focus:bg-white",
						"transition-all duration-200",
						disabled && "bg-gray-100 text-gray-400 cursor-not-allowed",
						hasError && "border-orange-400 bg-[#FFF5F2]",
						isOpen && "border-[#28819C]/30 bg-white"
					)}
				>
					<span className={selectedLabel ? "text-gray-700" : "text-gray-400"}>
						{selectedLabel || placeholder}
					</span>
					<ChevronIcon />
				</button>
				{hasError && (
					<span id={errorId} className="text-xs text-orange-500 mt-0.5">
						{error}
					</span>
				)}
				{dropdownContent}
			</div>
		);
	}
);

CustomDropdown.displayName = "CustomDropdown";

CustomDropdown.propTypes = {
	label: PropTypes.string,
	value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	onChange: PropTypes.func.isRequired,
	options: PropTypes.arrayOf(
		PropTypes.shape({
			value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
			label: PropTypes.string.isRequired,
		})
	),
	name: PropTypes.string,
	placeholder: PropTypes.string,
	required: PropTypes.bool,
	disabled: PropTypes.bool,
	error: PropTypes.string,
	className: PropTypes.string,
	searchable: PropTypes.bool,
};

export default CustomDropdown;
