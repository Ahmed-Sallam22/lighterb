import React from 'react';

function CatalogItemCard({ item, onSelect, t }) {

	return (
		<div className="rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
			<div className="flex justify-between items-start mb-3">
				<div className="flex-1">
					<h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
					<p className="text-sm text-gray-600 mb-2">
						{t('requisitions.browseCatalog.code')}: {item.code}
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
				<span className="text-center">{t('requisitions.browseCatalog.selectThisItem')}</span>
			</button>
		</div>
	);
}

export default CatalogItemCard;
