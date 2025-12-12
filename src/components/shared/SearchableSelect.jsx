import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const SearchableSelect = ({
	label,
	name,
	value,
	onChange,
	options = [],
	placeholder,
	required = false,
	error,
	disabled = false,
	isMulti = false,
	isClearable = true,
	isLoading = false,
	menuPlacement = 'auto',
	className = '',
}) => {
	const { i18n } = useTranslation();
	const isRtl = i18n.dir() === 'rtl';

	// Convert value to react-select format
	const selectedValue = isMulti
		? options.filter(opt => (Array.isArray(value) ? value.includes(opt.value) : false))
		: options.find(opt => opt.value === value || opt.value === parseInt(value)) || null;

	// Handle change
	const handleChange = selectedOption => {
		if (isMulti) {
			const values = selectedOption ? selectedOption.map(opt => opt.value) : [];
			onChange({ target: { name, value: values } });
		} else {
			const newValue = selectedOption ? selectedOption.value : '';
			onChange({ target: { name, value: newValue } });
		}
	};

	// Custom styles matching the app theme
	const customStyles = {
		control: (base, state) => ({
			...base,
			minHeight: '44px',
			borderRadius: '0.5rem',
			borderColor: error ? '#ef4444' : state.isFocused ? '#48C1F0' : '#d7e3ec',
			boxShadow: state.isFocused ? '0 0 0 2px rgba(72, 193, 240, 0.2)' : 'none',
			backgroundColor: disabled ? '#f5f8fb' : '#fff',
			'&:hover': {
				borderColor: error ? '#ef4444' : '#48C1F0',
			},
			cursor: disabled ? 'not-allowed' : 'pointer',
		}),
		valueContainer: base => ({
			...base,
			padding: '2px 12px',
		}),
		placeholder: base => ({
			...base,
			color: '#9ca3af',
			fontSize: '0.875rem',
		}),
		singleValue: base => ({
			...base,
			color: '#1e3a4f',
			fontSize: '0.875rem',
		}),
		input: base => ({
			...base,
			color: '#1e3a4f',
			fontSize: '0.875rem',
		}),
		menu: base => ({
			...base,
			borderRadius: '0.5rem',
			boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
			border: '1px solid #e1edf5',
			zIndex: 9999,
		}),
		menuList: base => ({
			...base,
			padding: '4px',
			maxHeight: '200px',
		}),
		option: (base, state) => ({
			...base,
			backgroundColor: state.isSelected
				? '#28819C'
				: state.isFocused
				? '#e1f5fb'
				: '#fff',
			color: state.isSelected ? '#fff' : '#1e3a4f',
			fontSize: '0.875rem',
			padding: '10px 12px',
			borderRadius: '0.375rem',
			cursor: 'pointer',
			'&:active': {
				backgroundColor: '#28819C',
				color: '#fff',
			},
		}),
		indicatorSeparator: () => ({
			display: 'none',
		}),
		dropdownIndicator: (base, state) => ({
			...base,
			color: '#567086',
			padding: '8px',
			transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : null,
			transition: 'transform 0.2s ease',
			'&:hover': {
				color: '#28819C',
			},
		}),
		clearIndicator: base => ({
			...base,
			color: '#9ca3af',
			padding: '8px',
			'&:hover': {
				color: '#ef4444',
			},
		}),
		loadingIndicator: base => ({
			...base,
			color: '#48C1F0',
		}),
		noOptionsMessage: base => ({
			...base,
			color: '#567086',
			fontSize: '0.875rem',
		}),
		multiValue: base => ({
			...base,
			backgroundColor: '#e1f5fb',
			borderRadius: '0.375rem',
		}),
		multiValueLabel: base => ({
			...base,
			color: '#28819C',
			fontSize: '0.75rem',
			padding: '2px 6px',
		}),
		multiValueRemove: base => ({
			...base,
			color: '#28819C',
			'&:hover': {
				backgroundColor: '#28819C',
				color: '#fff',
			},
		}),
	};

	return (
		<div className={`relative ${className}`}>
			{label && (
				<label
					className={`block text-sm font-medium mb-1 ${
						error ? 'text-red-500' : 'text-[#567086]'
					}`}
				>
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}
			<Select
				name={name}
				value={selectedValue}
				onChange={handleChange}
				options={options}
				placeholder={placeholder || 'Select...'}
				isDisabled={disabled}
				isMulti={isMulti}
				isClearable={isClearable}
				isLoading={isLoading}
				isSearchable={true}
				menuPlacement={menuPlacement}
				styles={customStyles}
				isRtl={isRtl}
				noOptionsMessage={() => 'No options found'}
				loadingMessage={() => 'Loading...'}
				classNamePrefix="searchable-select"
			/>
			{error && (
				<p className="mt-1 text-xs text-red-500">{error}</p>
			)}
		</div>
	);
};

SearchableSelect.propTypes = {
	label: PropTypes.string,
	name: PropTypes.string.isRequired,
	value: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number,
		PropTypes.array,
	]),
	onChange: PropTypes.func.isRequired,
	options: PropTypes.arrayOf(
		PropTypes.shape({
			value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
			label: PropTypes.string.isRequired,
		})
	),
	placeholder: PropTypes.string,
	required: PropTypes.bool,
	error: PropTypes.string,
	disabled: PropTypes.bool,
	isMulti: PropTypes.bool,
	isClearable: PropTypes.bool,
	isLoading: PropTypes.bool,
	menuPlacement: PropTypes.oneOf(['auto', 'top', 'bottom']),
	className: PropTypes.string,
};

export default SearchableSelect;
