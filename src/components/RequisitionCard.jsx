import React from 'react';
import { FiEye } from 'react-icons/fi';

const RequisitionCard = ({ requisition, onView, onEdit, onSubmit, t }) => {
	const getStatusColor = status => {
		const colors = {
			approved: 'bg-[#C9FFD7] text-[#34C759]',
			pending: 'bg-yellow-100 text-yellow-700',
			rejected: 'bg-red-100 text-red-700',
			draft: 'bg-gray-100 text-gray-700',
		};
		return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
	};

	const getPriorityColor = priority => {
		const colors = {
			high: 'bg-red-100 text-red-700',
			normal: 'bg-gray-100 text-gray-700',
			low: 'bg-[#DDF9FF] text-[#006F86]',
		};
		return colors[priority?.toLowerCase()] || 'bg-gray-100 text-gray-700';
	};

	return (
		<div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow space-y-4">
			{/* Card Header */}
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-3 flex-wrap">
					<h3 className="text-lg font-semibold text-gray-900">{requisition.prNumber}</h3>
					<div className="flex items-center gap-2 flex-wrap">
						<span
							className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
								requisition.status
							)}`}
						>
							{requisition.status}
						</span>
						{requisition.priority && (
							<span
								className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
									requisition.priority
								)}`}
							>
								{requisition.priority}
							</span>
						)}
						{requisition.cataloged && (
							<span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
								Cataloged
							</span>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					<div className="flex flex-wrap justify-end gap-2">
						<button
							onClick={() => onView(requisition)}
							className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
						>
							<FiEye size={16} />
							{t('requisitions.view')}
						</button>

						<button
							onClick={() => onEdit(requisition)}
							className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
						>
							{t('requisitions.edit')}
						</button>

						<button
							onClick={() => onSubmit(requisition)}
							className="px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b82] transition-colors text-sm font-medium"
						>
							{t('requisitions.submitForApproval')}
						</button>
					</div>
				</div>
			</div>

			{/* Card Content */}
			<div className="mb-4">
				<h4 className="text-base font-medium text-gray-900 mb-3">{requisition.title}</h4>
				<div className="grid grid-cols-3 gap-6 text-sm">
					<div>
						<p className="text-gray-500 mb-1">{t('requisitions.requiredDate')}:</p>
						<p className="text-gray-900 font-medium">{requisition.requiredDate}</p>
					</div>
					<div>
						<p className="text-gray-500 mb-1">{t('requisitions.costCenter')}</p>
						<p className="text-gray-900 font-medium">{requisition.costCenter}</p>
					</div>
					<div>
						<p className="text-gray-500 mb-1">{t('requisitions.totalAmount')}</p>
						<p className="text-gray-900 font-semibold">{requisition.totalAmount}</p>
					</div>
				</div>
			</div>

			{/* Card Footer */}
			<div className="pt-3 border-t border-gray-200">
				<div className="text-sm text-gray-500">
					<span>{t('requisitions.createdDate')}</span>
					<span className="ml-2 text-gray-900">{requisition.createdDate}</span>
				</div>
			</div>
		</div>
	);
};

export default RequisitionCard;
