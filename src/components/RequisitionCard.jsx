import React from "react";
import { FiEye, FiEdit2, FiTrash2, FiSend } from "react-icons/fi";
import Button from "./shared/Button";

const RequisitionCard = ({ requisition, onView, onEdit, onSubmit, onDelete, t, submitting }) => {
	const getStatusColor = status => {
		const colors = {
			APPROVED: "bg-[#C9FFD7] text-[#34C759]",
			PENDING_APPROVAL: "bg-yellow-100 text-yellow-700",
			REJECTED: "bg-red-100 text-red-700",
			DRAFT: "bg-gray-100 text-gray-700",
		};
		return colors[status] || "bg-gray-100 text-gray-700";
	};

	const getStatusLabel = status => {
		const labels = {
			APPROVED: t("requisitions.status.approved"),
			PENDING_APPROVAL: t("requisitions.status.pending"),
			REJECTED: t("requisitions.status.rejected"),
			DRAFT: t("requisitions.status.draft"),
		};
		return labels[status] || status;
	};

	const getPriorityColor = priority => {
		const colors = {
			URGENT: "bg-red-100 text-red-700",
			HIGH: "bg-orange-100 text-orange-700",
			MEDIUM: "bg-yellow-100 text-yellow-700",
			LOW: "bg-[#DDF9FF] text-[#006F86]",
		};
		return colors[priority] || "bg-gray-100 text-gray-700";
	};

	const getPrTypeColor = prType => {
		const colors = {
			Catalog: "bg-blue-50 text-blue-700",
			"Non-Catalog": "bg-purple-50 text-purple-700",
			Service: "bg-green-50 text-green-700",
		};
		return colors[prType] || "bg-gray-100 text-gray-700";
	};

	const getPrTypeLabel = prType => {
		const labels = {
			Catalog: t("requisitions.prTypes.catalog"),
			"Non-Catalog": t("requisitions.prTypes.nonCatalog"),
			Service: t("requisitions.prTypes.service"),
		};
		return labels[prType] || prType;
	};

	const formatDate = dateStr => {
		if (!dateStr) return "-";
		return new Date(dateStr).toLocaleDateString();
	};

	const formatCurrency = amount => {
		const num = parseFloat(amount) || 0;
		return `$${num.toFixed(2)}`;
	};

	// Check if requisition can be submitted for approval
	const canSubmit = requisition.status === "DRAFT";
	// Check if requisition can be edited/deleted
	const canModify = requisition.status === "DRAFT";

	return (
		<div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow space-y-4">
			{/* Card Header */}
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-3 flex-wrap">
					<h3 className="text-lg font-semibold text-gray-900">
						{requisition.pr_number || `PR-${requisition.pr_id}`}
					</h3>
					<div className="flex items-center gap-2 flex-wrap">
						<span
							className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
								requisition.status
							)}`}
						>
							{getStatusLabel(requisition.status)}
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
						{requisition.pr_type && (
							<span
								className={`px-3 py-1 rounded-full text-xs font-medium ${getPrTypeColor(
									requisition.pr_type
								)}`}
							>
								{getPrTypeLabel(requisition.pr_type)}
							</span>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					<div className="flex flex-wrap justify-end gap-2">
						<Button
							onClick={() => onView(requisition)}
							className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
							icon={<FiEye size={16} />}
							title={t("requisitions.view")}
						/>

						{canModify && (
							<>
								<Button
									onClick={() => onEdit(requisition)}
									className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
									icon={<FiEdit2 size={16} />}
									title={t("requisitions.edit")}
								/>
								<Button
									onClick={() => onDelete(requisition)}
									className="bg-white hover:bg-red-50 text-red-600 border border-red-300"
									icon={<FiTrash2 size={16} />}
									title={t("requisitions.delete")}
								/>
							</>
						)}

						{canSubmit && (
							<Button
								onClick={() => onSubmit(requisition)}
								className="bg-[#3d5d67] hover:bg-[#206b82] text-white border border-transparent"
								icon={<FiSend size={16} />}
								title={submitting ? t("requisitions.submitting") : t("requisitions.submitForApproval")}
								disabled={submitting}
							/>
						)}
					</div>
				</div>
			</div>

			{/* Card Content */}
			<div className="mb-4">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
					<div>
						<p className="text-gray-500 mb-1">{t("requisitions.requester")}:</p>
						<p className="text-gray-900 font-medium">{requisition.requester_name}</p>
					</div>
					<div>
						<p className="text-gray-500 mb-1">{t("requisitions.department")}:</p>
						<p className="text-gray-900 font-medium">{requisition.requester_department}</p>
					</div>
					<div>
						<p className="text-gray-500 mb-1">{t("requisitions.requiredDate")}:</p>
						<p className="text-gray-900 font-medium">{formatDate(requisition.required_date)}</p>
					</div>
					<div>
						<p className="text-gray-500 mb-1">{t("requisitions.totalAmount")}:</p>
						<p className="text-gray-900 font-semibold">{formatCurrency(requisition.total)}</p>
					</div>
				</div>
			</div>

			{/* Card Footer */}
			<div className="pt-3 border-t border-gray-200 flex justify-between items-center">
				<div className="text-sm text-gray-500">
					<span>{t("requisitions.createdDate")}:</span>
					<span className="ml-2 text-gray-900">{formatDate(requisition.date)}</span>
				</div>
				<div className="text-sm text-gray-500">
					<span>{t("requisitions.items")}:</span>
					<span className="ml-2 text-gray-900 font-medium">
						{requisition.item_count ?? requisition.service_count ?? 0}
					</span>
				</div>
			</div>
		</div>
	);
};

export default RequisitionCard;
