import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";
import SlideUpModal from "./SlideUpModal";

const InfoRow = ({ label, value, className = "" }) => (
	<div className={`flex justify-between text-sm text-gray-700 py-1 ${className}`}>
		<span className="font-medium text-gray-600">{label}</span>
		<span>{value ?? "-"}</span>
	</div>
);

const StatusBadge = ({ value }) => {
	const colors = {
		DRAFT: "bg-gray-100 text-gray-800",
		PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
		APPROVED: "bg-green-100 text-green-800",
		REJECTED: "bg-red-100 text-red-800",
	};

	return (
		<span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${colors[value] || colors.DRAFT}`}>
			{value || "DRAFT"}
		</span>
	);
};

const PriorityBadge = ({ value }) => {
	const colors = {
		LOW: "bg-blue-100 text-blue-800",
		MEDIUM: "bg-yellow-100 text-yellow-800",
		HIGH: "bg-orange-100 text-orange-800",
		URGENT: "bg-red-100 text-red-800",
	};

	return (
		<span
			className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
				colors[value] || "bg-gray-100 text-gray-800"
			}`}
		>
			{value || "-"}
		</span>
	);
};

const PrTypeBadge = ({ value }) => {
	const colors = {
		Catalog: "bg-blue-100 text-blue-800",
		"Non-Catalog": "bg-purple-100 text-purple-800",
		Service: "bg-green-100 text-green-800",
	};

	return (
		<span
			className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
				colors[value] || "bg-gray-100 text-gray-800"
			}`}
		>
			{value || "-"}
		</span>
	);
};

// PR Type endpoints mapping
const PR_TYPE_ENDPOINTS = {
	Catalog: "/procurement/pr/catalog/",
	"Non-Catalog": "/procurement/pr/non-catalog/",
	Service: "/procurement/pr/service/",
};

const RequisitionDetailsModal = ({ isOpen, requisitionId, prType, onClose }) => {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [requisition, setRequisition] = useState(null);

	useEffect(() => {
		if (!isOpen || !requisitionId || !prType) return;

		const fetchRequisition = async () => {
			setLoading(true);
			setError(null);
			try {
				const endpoint = PR_TYPE_ENDPOINTS[prType];
				if (!endpoint) {
					throw new Error("Invalid PR type");
				}
				const { data } = await api.get(`${endpoint}${requisitionId}/`);
				const payload = data?.data ?? data;
				setRequisition({ ...payload, pr_type: prType });
			} catch (err) {
				const message =
					err.response?.data?.message ||
					err.response?.data?.error ||
					err.response?.data?.detail ||
					err.message ||
					t("requisitions.errors.loadFailed");
				setError(message);
			} finally {
				setLoading(false);
			}
		};

		fetchRequisition();
	}, [requisitionId, prType, isOpen, t]);

	// Reset state when modal closes
	useEffect(() => {
		if (!isOpen) {
			setRequisition(null);
			setError(null);
		}
	}, [isOpen]);

	const formatCurrency = value => {
		if (value === null || value === undefined) return "-";
		return `$${parseFloat(value).toLocaleString()}`;
	};

	const formatDateTime = dateString => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatDate = dateString => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<SlideUpModal
			isOpen={isOpen}
			onClose={onClose}
			title={`${t("requisitions.details.title")} ${requisition?.pr_number || `#${requisitionId}` || ""}`}
			maxWidth="1100px"
		>
			<div className="space-y-6 pb-6">
				{loading && (
					<div className="flex items-center justify-center py-12">
						<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#28819C]"></div>
						<span className="ml-3 text-gray-500">{t("common.loading")}</span>
					</div>
				)}

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
						<p className="text-red-600 text-sm">{error}</p>
					</div>
				)}

				{!loading && !error && requisition && (
					<>
						{/* Summary Cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{/* PR Info Card */}
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-[#28819C] mb-3 flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
									{t("requisitions.details.prInfo")}
								</h3>
								<InfoRow
									label={t("requisitions.details.prNumber")}
									value={requisition.pr_number || `PR-${requisition.pr_id}`}
								/>
								<InfoRow label={t("requisitions.details.date")} value={formatDate(requisition.date)} />
								<InfoRow
									label={t("requisitions.details.requiredDate")}
									value={formatDate(requisition.required_date)}
								/>
								<div className="flex justify-between items-center py-1">
									<span className="text-sm font-medium text-gray-600">
										{t("requisitions.details.prType")}
									</span>
									<PrTypeBadge value={requisition.pr_type} />
								</div>
							</div>

							{/* Requester Info Card */}
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-[#28819C] mb-3 flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
									{t("requisitions.details.requesterInfo")}
								</h3>
								<InfoRow
									label={t("requisitions.details.requesterName")}
									value={requisition.requester_name}
								/>
								<InfoRow
									label={t("requisitions.details.department")}
									value={requisition.requester_department}
								/>
								<InfoRow label={t("requisitions.details.email")} value={requisition.requester_email} />
							</div>

							{/* Status Card */}
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-[#28819C] mb-3 flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									{t("requisitions.details.statusInfo")}
								</h3>
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">
											{t("requisitions.details.status")}
										</span>
										<StatusBadge value={requisition.status} />
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">
											{t("requisitions.details.priority")}
										</span>
										<PriorityBadge value={requisition.priority} />
									</div>
									<div className="border-t border-gray-200 mt-2 pt-2">
										<InfoRow
											label={t("requisitions.details.total")}
											value={formatCurrency(requisition.total)}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Description & Notes */}
						{(requisition.description || requisition.notes) && (
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-[#28819C] mb-3 flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 6h16M4 12h16M4 18h7"
										/>
									</svg>
									{t("requisitions.details.descriptionNotes")}
								</h3>
								{requisition.description && (
									<div className="mb-3">
										<p className="text-xs font-medium text-gray-500 mb-1">
											{t("requisitions.details.description")}
										</p>
										<p className="text-sm text-gray-700">{requisition.description}</p>
									</div>
								)}
								{requisition.notes && (
									<div>
										<p className="text-xs font-medium text-gray-500 mb-1">
											{t("requisitions.details.notes")}
										</p>
										<p className="text-sm text-gray-700">{requisition.notes}</p>
									</div>
								)}
							</div>
						)}

						{/* Line Items */}
						{requisition.items && requisition.items.length > 0 && (
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-[#28819C] mb-4 flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
										/>
									</svg>
									{t("requisitions.details.lineItems")} ({requisition.items.length})
								</h3>
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													#
												</th>
												<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													{t("requisitions.details.itemName")}
												</th>
												<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													{t("requisitions.details.itemDescription")}
												</th>
												<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
													{t("requisitions.details.quantity")}
												</th>
												<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
													{t("requisitions.details.uom")}
												</th>
												<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
													{t("requisitions.details.unitPrice")}
												</th>
												<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
													{t("requisitions.details.totalPrice")}
												</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-200">
											{requisition.items.map((item, index) => (
												<tr key={item.id || index} className="hover:bg-gray-50">
													<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
														{item.line_number || index + 1}
													</td>
													<td className="px-4 py-3 text-sm font-medium text-gray-900">
														{item.item_name || "-"}
													</td>
													<td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
														{item.item_description || "-"}
													</td>
													<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
														{parseFloat(item.quantity || 0).toLocaleString()}
													</td>
													<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
														{item.unit_of_measure_code || "-"}
													</td>
													<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
														{formatCurrency(item.estimated_unit_price)}
													</td>
													<td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
														{formatCurrency(item.total_price_per_item)}
													</td>
												</tr>
											))}
										</tbody>
										<tfoot className="bg-gray-50">
											<tr>
												<td
													colSpan="6"
													className="px-4 py-3 text-sm font-semibold text-gray-900 text-right"
												>
													{t("requisitions.details.grandTotal")}:
												</td>
												<td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-[#28819C] text-right">
													{formatCurrency(requisition.total)}
												</td>
											</tr>
										</tfoot>
									</table>
								</div>
							</div>
						)}

						{/* Empty Items Message */}
						{(!requisition.items || requisition.items.length === 0) && (
							<div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
								<svg
									className="w-12 h-12 text-gray-400 mx-auto mb-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
									/>
								</svg>
								<p className="text-gray-500">{t("requisitions.details.noItems")}</p>
							</div>
						)}

						{/* Approval History */}
						{(requisition.submitted_for_approval_at ||
							requisition.approved_at ||
							requisition.rejected_at) && (
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-[#28819C] mb-3 flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									{t("requisitions.details.approvalHistory")}
								</h3>
								<div className="space-y-2">
									{requisition.submitted_for_approval_at && (
										<InfoRow
											label={t("requisitions.details.submittedAt")}
											value={formatDateTime(requisition.submitted_for_approval_at)}
										/>
									)}
									{requisition.approved_at && (
										<>
											<InfoRow
												label={t("requisitions.details.approvedAt")}
												value={formatDateTime(requisition.approved_at)}
											/>
											{requisition.approved_by && (
												<InfoRow
													label={t("requisitions.details.approvedBy")}
													value={requisition.approved_by}
												/>
											)}
										</>
									)}
									{requisition.rejected_at && (
										<>
											<InfoRow
												label={t("requisitions.details.rejectedAt")}
												value={formatDateTime(requisition.rejected_at)}
											/>
											{requisition.rejected_by && (
												<InfoRow
													label={t("requisitions.details.rejectedBy")}
													value={requisition.rejected_by}
												/>
											)}
											{requisition.rejection_reason && (
												<div className="mt-2 p-3 bg-red-50 rounded-lg">
													<p className="text-xs font-medium text-red-600 mb-1">
														{t("requisitions.details.rejectionReason")}
													</p>
													<p className="text-sm text-red-700">
														{requisition.rejection_reason}
													</p>
												</div>
											)}
										</>
									)}
								</div>
							</div>
						)}

						{/* Timestamps */}
						<div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
							<div className="flex flex-wrap gap-6 justify-between text-xs text-gray-500">
								<div>
									<span className="font-medium">{t("requisitions.details.createdAt")}:</span>{" "}
									{formatDateTime(requisition.created_at)}
								</div>
								<div>
									<span className="font-medium">{t("requisitions.details.updatedAt")}:</span>{" "}
									{formatDateTime(requisition.updated_at)}
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		</SlideUpModal>
	);
};

export default RequisitionDetailsModal;
