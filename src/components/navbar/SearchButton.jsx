import React, { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";

const SearchButton = () => {
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	return (
		<div className="relative">
			<button
				onClick={() => setIsSearchOpen(!isSearchOpen)}
				className="focus:outline-none hover:opacity-80 transition-opacity"
				aria-label="Search"
				aria-expanded={isSearchOpen}
			>
				<IoSearchOutline className="text-white w-6 h-6" aria-hidden="true" />
			</button>

			{isSearchOpen && (
				<div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-4 w-64 z-50">
					<input
						type="text"
						placeholder="Search..."
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
						autoFocus
					/>
				</div>
			)}
		</div>
	);
};

export default SearchButton;
