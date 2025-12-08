import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiSearch } from "react-icons/fi";
import { IoClose, IoSearchOutline } from "react-icons/io5";

// Custom Catalog Item Card Component
function CatalogItemCard({ item, onSelect }) {
	const { t } = useTranslation();

	return (
		<div className="rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
			<div className="flex justify-between items-start mb-3">
				<div className="flex-1">
					<h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
					<p className="text-sm text-gray-600 mb-2">
						{t("requisitions.browseCatalog.code")}: {item.code}
					</p>
				</div>
				<div className="text-right">
					<p className="font-bold text-lg text-gray-900">${item.price}</p>
				</div>
			</div>

			<p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description}</p>

			<button
				onClick={() => onSelect(item)}
				className="w-full bg-[#28819C] text-white py-3 rounded-lg hover:bg-[#206b82] transition-colors font-medium text-base shadow-md hover:shadow-lg justify-center flex items-center gap-2"
			>
				<span className="text-center">{t("requisitions.browseCatalog.selectThisItem")}</span>
			</button>
		</div>
	);
}

function BrowseCatalog({ onClose, onSelectItem }) {
	const { t } = useTranslation();
	const [searchTerm, setSearchTerm] = useState("");

	// Sample catalog data - replace with actual data from Redux store
	const catalogItems = [
		{
			id: 1,
			name: "HP Laptop",
			code: "LAPTOP-HP",
			price: 1200.0,
			description: "Default catalog item for receipts without catalog reference",
		},
		{
			id: 2,
			name: "HP Laptop",
			code: "LAPTOP-HP",
			price: 1200.0,
			description: "Default catalog item for receipts without catalog reference",
		},
		{
			id: 3,
			name: "HP Laptop",
			code: "LAPTOP-HP",
			price: 1200.0,
			description: "Default catalog item for receipts without catalog reference",
		},
		{
			id: 4,
			name: "HP Laptop",
			code: "LAPTOP-HP",
			price: 1200.0,
			description: "Default catalog item for receipts without catalog reference",
		},
		{
			id: 5,
			name: "HP Laptop",
			code: "LAPTOP-HP",
			price: 1200.0,
			description: "Default catalog item for receipts without catalog reference",
		},
		{
			id: 6,
			name: "HP Laptop",
			code: "LAPTOP-HP",
			price: 1200.0,
			description: "Default catalog item for receipts without catalog reference",
		},
		{
			id: 7,
			name: "HP Laptop",
			code: "LAPTOP-HP",
			price: 1200.0,
			description: "Default catalog item for receipts without catalog reference",
		},
		{
			id: 8,
			name: "HP Laptop",
			code: "LAPTOP-HP",
			price: 1200.0,
			description: "Default catalog item for receipts without catalog reference",
		},
	];

	const filteredItems = catalogItems.filter(
		item =>
			item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.code.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleSelectItem = item => {
		if (onSelectItem) {
			onSelectItem(item);
		}
		if (onClose) {
			onClose();
		}
	};

	return (
		<>
			<div className=" rounded-lg w-full flex flex-col">
				<div className="relative flex-1">
					<FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
					<input
						type="text"
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						placeholder={t("requisitions.browseCatalog.searchPlaceholder")}
						className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28819C] focus:border-transparent text-sm"
					/>
				</div>

				{/* Catalog Items Grid */}
				<div className="flex-1 overflow-y-auto py-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{filteredItems.map(item => (
							<CatalogItemCard key={item.id} item={item} onSelect={handleSelectItem} />
						))}
					</div>

					{filteredItems.length === 0 && (
						<div className="text-center py-12 text-gray-500">
							<p>{t("requisitions.browseCatalog.noItemsFound")}</p>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

export default BrowseCatalog;
