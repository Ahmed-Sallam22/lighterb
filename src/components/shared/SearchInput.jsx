import React from 'react';
import { twMerge } from 'tailwind-merge';
import { FiSearch } from 'react-icons/fi';

function SearchInput({
	value,
	onChange,
	placeholder = 'Search...',
	className = '',
	searchClassName = '',
	inputClassName = '',
}) {
	return (
		<div className={twMerge('relative flex-1', className)}>
			<FiSearch
				className={twMerge(
					'absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none',
					searchClassName
				)}
			/>

			<input
				type="text"
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				className={twMerge(
					`
					w-full pl-12 pr-4 py-3
					bg-white border border-gray-200 rounded-lg
					focus:outline-none focus:ring-2 focus:ring-[#28819C] focus:border-transparent
					text-sm
				`,
					inputClassName
				)}
			/>
		</div>
	);
}

export default SearchInput;
