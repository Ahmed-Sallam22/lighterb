import React, { useState } from "react";
import PropTypes from "prop-types";
import FloatingLabelInput from "./FloatingLabelInput";
import FloatingLabelSelect from "./FloatingLabelSelect";
import SearchInput from "./SearchInput";
import Button from "./Button";
import { BiPlus } from "react-icons/bi";

const CreateButtonIcon = () => (
	<svg width="130" height="50" viewBox="0 0 130 50" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g opacity="0.7">
			<path d="M113.69 33.6725L102.14 37.2933L125.227 45.2998L113.69 33.6725Z" stroke="white" strokeWidth="2" />
			<path d="M124.501 11.6014L111.849 9.15316L129.6 26.2567L124.501 11.6014Z" stroke="white" strokeWidth="2" />
			<path
				d="M78.8866 7.29192L77.7761 18.8568L94.8408 1.83813L78.8866 7.29192Z"
				stroke="white"
				strokeWidth="2"
			/>
			<path d="M6.91343 35.9458L5.803 47.5107L22.8677 30.4921L6.91343 35.9458Z" stroke="white" strokeWidth="2" />
			<path
				d="M106.924 22.0198L100.389 15.4319L100.325 31.1329L112.256 27.3922L106.924 22.0198Z"
				stroke="white"
				strokeWidth="2"
			/>
			<path
				d="M110.354 -9.55946L110.354 -9.55854L101.853 -5.80948L117.525 -0.834936L117.541 -12.7311L110.354 -9.55946Z"
				stroke="white"
				strokeWidth="2"
			/>
			<path
				d="M39.1788 38.0838L39.1784 38.0848L30.6779 41.8338L46.349 46.8084L46.3654 34.9122L39.1788 38.0838Z"
				stroke="white"
				strokeWidth="2"
			/>
			<path
				d="M68.466 29.0169L59.3843 26.3741L67.5225 40.0364L75.9454 31.1912L68.466 29.0169Z"
				stroke="white"
				strokeWidth="2"
			/>
			<path
				d="M85.3786 52.9784L93.5529 38.4879L80.9992 37.8448L85.3786 52.9784Z"
				stroke="white"
				strokeWidth="2"
			/>
		</g>
	</svg>
);

const SearchIcon = () => (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
			stroke="#7A9098"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path d="M19 19L14.65 14.65" stroke="#7A9098" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

const Toolbar = ({
	searchPlaceholder = "Search...",
	onSearchChange,
	filterOptions = [],
	filterLabel = "Filter by",
	filterIcon,
	onFilterChange,
	createButtonText = "Create",
	onCreateClick,
	className = "",
}) => {
	const [searchValue, setSearchValue] = useState("");
	const [filterValue, setFilterValue] = useState("");

	const handleSearchChange = e => {
		const value = e.target.value;
		setSearchValue(value);
		if (onSearchChange) {
			onSearchChange(value);
		}
	};

	const handleFilterChange = e => {
		const value = e.target.value;
		setFilterValue(value);
		if (onFilterChange) {
			onFilterChange(value);
		}
	};

	return (
		<div className={`bg-transparent ${className}`}>
			<div className="flex items-center justify-between  ">
				{/* Left Side - Search and Filter */}
				<div className="flex gap-4 items-center flex-1">
					<SearchInput
						className="w-full max-w-xs"
						value={searchValue}
						onChange={handleSearchChange}
						placeholder={searchPlaceholder}
					/>

					{/* Filter Select */}
					{filterOptions.length > 0 && (
						<div className="relative w-full max-w-xs">
							<FloatingLabelSelect
								label={filterLabel}
								value={filterValue}
								onChange={handleFilterChange}
								options={filterOptions}
								className={filterIcon ? "pl-12" : ""}
							/>
						</div>
					)}
				</div>

				{/* Right Side - Create Button */}
				{/* <button
					onClick={onCreateClick}
					className="flex items-center relative gap-3 bg-[#28819C] hover:bg-[#1f6478] text-white px-10 py-3 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
				>
					<svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M7.06749 0C7.33526 0 7.59207 0.0983829 7.78141 0.273505C7.97076 0.448628 8.07713 0.686145 8.07713 0.933805V5.60283H13.1253C13.3931 5.60283 13.6499 5.70121 13.8393 5.87634C14.0286 6.05146 14.135 6.28898 14.135 6.53664C14.135 6.7843 14.0286 7.02181 13.8393 7.19694C13.6499 7.37206 13.3931 7.47044 13.1253 7.47044H8.07713V12.1395C8.07713 12.3871 7.97076 12.6246 7.78141 12.7998C7.59207 12.9749 7.33526 13.0733 7.06749 13.0733C6.79972 13.0733 6.54291 12.9749 6.35357 12.7998C6.16422 12.6246 6.05785 12.3871 6.05785 12.1395V7.47044H1.00964C0.741868 7.47044 0.485062 7.37206 0.295717 7.19694C0.106373 7.02181 0 6.7843 0 6.53664C0 6.28898 0.106373 6.05146 0.295717 5.87634C0.485062 5.70121 0.741868 5.60283 1.00964 5.60283H6.05785V0.933805C6.05785 0.686145 6.16422 0.448628 6.35357 0.273505C6.54291 0.0983829 6.79972 0 7.06749 0Z"
							fill="white"
						/>
					</svg>

					<div className="absolute z-0 right-0 opacity-30 flex items-center justify-center">
						<CreateButtonIcon />
					</div>
					<span className="font-semibold z-20">{createButtonText}</span>
				</button> */}
				<Button onClick={onCreateClick} title={createButtonText} icon={<BiPlus size={24} />} />
			</div>
		</div>
	);
};

Toolbar.propTypes = {
	searchPlaceholder: PropTypes.string,
	onSearchChange: PropTypes.func,
	filterOptions: PropTypes.arrayOf(
		PropTypes.shape({
			value: PropTypes.string.isRequired,
			label: PropTypes.string.isRequired,
		})
	),
	filterLabel: PropTypes.string,
	filterIcon: PropTypes.node,
	onFilterChange: PropTypes.func,
	createButtonText: PropTypes.string,
	onCreateClick: PropTypes.func,
	className: PropTypes.string,
};

export default Toolbar;
