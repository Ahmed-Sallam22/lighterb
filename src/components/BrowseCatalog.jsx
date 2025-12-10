import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch } from 'react-icons/fi';
import CatalogItemCard from './CatalogItemCard';
import { catalogItems } from '../dummyData/requisitionsData';
// Custom Catalog Item Card Component

function BrowseCatalog({ onClose, onSelectItem }) {
	const { t } = useTranslation();
	const [searchTerm, setSearchTerm] = useState('');

	// Sample catalog data - replace with actual data from Redux store

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
						placeholder={t('requisitions.browseCatalog.searchPlaceholder')}
						className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28819C] focus:border-transparent text-sm"
					/>
				</div>

				{/* Catalog Items Grid */}
				<div className="flex-1 overflow-y-auto py-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{filteredItems.map(item => (
							<CatalogItemCard key={item.id} item={item} onSelect={handleSelectItem} t={t} />
						))}
					</div>

					{filteredItems.length === 0 && (
						<div className="text-center py-12 text-gray-500">
							<p>{t('requisitions.browseCatalog.noItemsFound')}</p>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

export default BrowseCatalog;
