import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import SlideUpModal from "../components/shared/SlideUpModal";
import ConfirmModal from "../components/shared/ConfirmModal";
import Button from "../components/shared/Button";
import SearchInput from "../components/shared/SearchInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import FloatingLabelTextarea from "../components/shared/FloatingLabelTextarea";

import {
	fetchPOs,
	fetchPODetails,
	deletePO,
	submitPOForApproval,
	confirmPO,
	cancelPO,
	setPage,
	clearCurrentPO,
} from "../store/poSlice";
import { BiPlus } from "react-icons/bi";

// PO Icon
const POIcon = () => (
	<svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g opacity="0.5">
			<path
				d="M4 4C4 2.89543 4.89543 2 6 2H18L24 8V23C24 24.1046 23.1046 25 22 25H6C4.89543 25 4 24.1046 4 23V4Z"
				fill="#D3D3D3"
			/>
			<path d="M18 2V8H24" fill="#A0A0A0" />
			<path d="M8 12H20M8 16H16M8 20H12" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
		</g>
	</svg>
);

// Status options
const STATUS_OPTIONS = [
	{ value: "", label: "poPage.filters.allStatuses" },
	{ value: "DRAFT", label: "poPage.statuses.draft" },
	{ value: "SUBMITTED", label: "poPage.statuses.submitted" },
	{ value: "APPROVED", label: "poPage.statuses.approved" },
	{ value: "REJECTED", label: "poPage.statuses.rejected" },
	{ value: "CONFIRMED", label: "poPage.statuses.confirmed" },
	{ value: "PARTIALLY_RECEIVED", label: "poPage.statuses.partiallyReceived" },
	{ value: "RECEIVED", label: "poPage.statuses.received" },
	{ value: "CANCELLED", label: "poPage.statuses.cancelled" },
];

const POPage = () => {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	// Get data from Redux
	const { poList, loading, count, page, hasNext, hasPrevious, currentPO, detailsLoading } = useSelector(
		state => state.po
	);

	// Local state
	const [localPageSize, setLocalPageSize] = useState(20);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");

	// Modal state
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
	const [poToDelete, setPoToDelete] = useState(null);
	const [poToCancel, setPoToCancel] = useState(null);
	const [cancellationReason, setCancellationReason] = useState("");

	// Update page title
	useEffect(() => {
		document.title = `${t("poPage.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	// Fetch PO list
	useEffect(() => {
		const params = {
			page,
			page_size: localPageSize,
		};
		if (searchTerm) params.search = searchTerm;
		if (statusFilter) params.status = statusFilter;

		dispatch(fetchPOs(params));
	}, [dispatch, page, localPageSize, searchTerm, statusFilter]);

	// Status options with translations
	const statusOptions = useMemo(
		() =>
			STATUS_OPTIONS.map(opt => ({
				value: opt.value,
				label: t(opt.label),
			})),
		[t]
	);

	// Get status badge styling
	const getStatusBadge = status => {
		const statusStyles = {
			DRAFT: "bg-gray-100 text-gray-800",
			SUBMITTED: "bg-blue-100 text-blue-800",
			APPROVED: "bg-green-100 text-green-800",
			REJECTED: "bg-red-100 text-red-800",
			CONFIRMED: "bg-purple-100 text-purple-800",
			PARTIALLY_RECEIVED: "bg-yellow-100 text-yellow-800",
			RECEIVED: "bg-teal-100 text-teal-800",
			CANCELLED: "bg-red-100 text-red-600",
		};
		return statusStyles[status] || "bg-gray-100 text-gray-800";
	};

	// Get PO type badge styling
	const getTypeBadge = type => {
		const typeStyles = {
			Catalog: "bg-blue-50 text-blue-700",
			"Non-Catalog": "bg-orange-50 text-orange-700",
			Service: "bg-green-50 text-green-700",
		};
		return typeStyles[type] || "bg-gray-50 text-gray-700";
	};

	// Table columns
	const columns = useMemo(
		() => [
			{
				header: t("poPage.table.poNumber"),
				accessor: "po_number",
				render: value => <span className="font-semibold text-[#28819C]">{value}</span>,
			},
			{
				header: t("poPage.table.poDate"),
				accessor: "po_date",
				render: value => <span className="text-gray-600">{value || "-"}</span>,
			},
			{
				header: t("poPage.table.poType"),
				accessor: "po_type",
				render: value => (
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(
							value
						)}`}
					>
						{value}
					</span>
				),
			},
			{
				header: t("poPage.table.supplier"),
				accessor: "supplier_name",
				render: value => <span className="text-gray-900">{value || "-"}</span>,
			},
			{
				header: t("poPage.table.currency"),
				accessor: "currency_code",
				width: "100px",
				render: value => <span className="font-medium text-gray-700">{value || "-"}</span>,
			},
			{
				header: t("poPage.table.totalAmount"),
				accessor: "total_amount",
				render: value => (
					<span className="font-semibold text-gray-900">
						{parseFloat(value || 0).toLocaleString(undefined, {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}
					</span>
				),
			},
			{
				header: t("poPage.table.itemCount"),
				accessor: "item_count",
				width: "100px",
				render: value => (
					<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
						{value}
					</span>
				),
			},
			{
				header: t("poPage.table.status"),
				accessor: "status",
				render: value => (
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(
							value
						)}`}
					>
						{t(`poPage.statuses.${value.toLowerCase().replace("_", "")}`)}
					</span>
				),
			},
		],
		[t]
	);

	// Pagination handlers
	const handlePageChange = useCallback(
		newPage => {
			dispatch(setPage(newPage));
		},
		[dispatch]
	);

	const handlePageSizeChange = useCallback(
		newPageSize => {
			setLocalPageSize(newPageSize);
			dispatch(setPage(1));
		},
		[dispatch]
	);

	// Handlers
	const handleCreatePO = () => {
		navigate("/procurement/po/create");
	};

	const handleViewPO = async po => {
		setIsViewModalOpen(true);
		dispatch(fetchPODetails(po.id));
	};

	const handleCloseViewModal = () => {
		setIsViewModalOpen(false);
		dispatch(clearCurrentPO());
	};

	const handleDeleteClick = po => {
		setPoToDelete(po);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!poToDelete) return;

		try {
			await dispatch(deletePO(poToDelete.id)).unwrap();
			toast.success(t("poPage.messages.deleted"));
			setIsDeleteModalOpen(false);
			setPoToDelete(null);
		} catch (error) {
			toast.error(error || t("poPage.messages.deleteError"));
		}
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
		setPoToDelete(null);
	};

	// Submit for Approval handler - like AP Payments (no modal)
	const handleSubmitForApproval = async po => {
		try {
			await dispatch(submitPOForApproval(po.id)).unwrap();
			toast.success(t("poPage.messages.submitted"));
			// Refresh list
			dispatch(fetchPOs({ page, page_size: localPageSize, search: searchTerm, status: statusFilter }));
		} catch (error) {
			toast.error(error || t("poPage.messages.submitError"));
		}
	};

	// Confirm PO handler - like AP Payments (no modal)
	const handleConfirmPO = async po => {
		try {
			await dispatch(confirmPO(po.id)).unwrap();
			toast.success(t("poPage.messages.confirmed"));
			// Refresh list
			dispatch(fetchPOs({ page, page_size: localPageSize, search: searchTerm, status: statusFilter }));
		} catch (error) {
			toast.error(error || t("poPage.messages.confirmError"));
		}
	};

	// Cancel PO handlers
	const handleCancelPOClick = po => {
		setPoToCancel(po);
		setCancellationReason("");
		setIsCancelModalOpen(true);
	};

	const handleConfirmCancelPO = async () => {
		if (!poToCancel) return;

		if (!cancellationReason.trim()) {
			toast.error(t("poPage.validation.reasonRequired"));
			return;
		}

		try {
			await dispatch(cancelPO({ id: poToCancel.id, reason: cancellationReason })).unwrap();
			toast.success(t("poPage.messages.cancelled"));
			setIsCancelModalOpen(false);
			setPoToCancel(null);
			setCancellationReason("");
		} catch (error) {
			toast.error(error || t("poPage.messages.cancelError"));
		}
	};

	const handleDismissCancelPO = () => {
		setIsCancelModalOpen(false);
		setPoToCancel(null);
		setCancellationReason("");
	};

	const handleSearchChange = e => {
		setSearchTerm(e.target.value);
		dispatch(setPage(1));
	};

	const handleStatusFilterChange = e => {
		setStatusFilter(e.target.value);
		dispatch(setPage(1));
	};

	// Show edit/delete only for DRAFT
	const showEditButton = row => row.status === "DRAFT";
	const showDeleteButton = row => row.status === "DRAFT";

	// Custom actions for table - similar to AP Payments
	const customActions = [
		{
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			),
			title: t("poPage.actions.submitForApproval"),
			onClick: handleSubmitForApproval,
			showWhen: row => row.status === "DRAFT",
		},
		{
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
				</svg>
			),
			title: t("poPage.actions.confirm"),
			onClick: handleConfirmPO,
			showWhen: row => row.status === "APPROVED",
		},
		{
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
				</svg>
			),
			title: t("poPage.actions.cancelPO"),
			onClick: handleCancelPOClick,
			showWhen: row => row.status === "APPROVED",
		},
	];

	return (
		<div className="min-h-screen bg-[#EEEEEE]">
			<ToastContainer position="top-right" />

			{/* Header */}
			<PageHeader title={t("poPage.title")} subtitle={t("poPage.subtitle")} icon={<POIcon />} />

			<div className="w-[95%] mx-auto px-6 py-8">
				{/* Title and Create Button */}
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-[#28819C]">{t("poPage.title")}</h2>

					<Button
						onClick={handleCreatePO}
						title={t("poPage.actions.create")}
						icon={<BiPlus className="text-xl" />}
						className="bg-[#28819C] hover:bg-[#1d6a80] text-white"
					/>
				</div>

				{/* Filters Section */}
				<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Search */}
						<div>
							<SearchInput
								value={searchTerm}
								onChange={handleSearchChange}
								placeholder={t("poPage.filters.searchPlaceholder")}
								className="max-w-full"
							/>
						</div>

						{/* Status Filter */}
						<div>
							<FloatingLabelSelect
								label={t("poPage.filters.status")}
								name="status"
								value={statusFilter}
								onChange={handleStatusFilterChange}
								options={statusOptions}
							/>
						</div>
					</div>
				</div>

				{/* Table */}
				<Table
					columns={columns}
					data={poList}
					onView={handleViewPO}
					onDelete={handleDeleteClick}
					showEditButton={showEditButton}
					showDeleteButton={showDeleteButton}
					customActions={customActions}
					emptyMessage={loading ? t("poPage.table.loading") : t("poPage.table.emptyMessage")}
				/>

				{/* Pagination */}
				<Pagination
					currentPage={page}
					totalCount={count}
					pageSize={localPageSize}
					hasNext={hasNext}
					hasPrevious={hasPrevious}
					onPageChange={handlePageChange}
					onPageSizeChange={handlePageSizeChange}
				/>
			</div>

			{/* View PO Modal */}
			<SlideUpModal
				isOpen={isViewModalOpen}
				onClose={handleCloseViewModal}
				title={t("poPage.modal.viewTitle")}
				maxWidth="800px"
			>
				{detailsLoading ? (
					<div className="flex items-center justify-center py-12">
						<div className="w-8 h-8 border-4 border-[#28819C] border-t-transparent rounded-full animate-spin"></div>
					</div>
				) : currentPO ? (
					<div className="space-y-6 p-4">
						{/* PO Header Info */}
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">{t("poPage.modal.poNumber")}</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 font-semibold">
									{currentPO.po_number}
								</div>
							</div>
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">{t("poPage.modal.poDate")}</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
									{currentPO.po_date}
								</div>
							</div>
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">{t("poPage.modal.status")}</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(
											currentPO.status
										)}`}
									>
										{t(`poPage.statuses.${currentPO.status.toLowerCase().replace("_", "")}`)}
									</span>
								</div>
							</div>
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">{t("poPage.modal.poType")}</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(
											currentPO.po_type
										)}`}
									>
										{currentPO.po_type}
									</span>
								</div>
							</div>
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">{t("poPage.modal.supplier")}</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
									{currentPO.supplier_name}
								</div>
							</div>
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">{t("poPage.modal.currency")}</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
									{currentPO.currency_code}
								</div>
							</div>
						</div>

						{/* Source PR Numbers */}
						{currentPO.source_pr_numbers && currentPO.source_pr_numbers.length > 0 && (
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-2">{t("poPage.modal.sourcePRs")}</p>
								<div className="flex flex-wrap gap-2">
									{currentPO.source_pr_numbers.map((prNumber, index) => (
										<span
											key={index}
											className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
										>
											{prNumber}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Description */}
						{currentPO.description && (
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">
									{t("poPage.modal.description")}
								</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
									{currentPO.description}
								</div>
							</div>
						)}

						{/* Items */}
						<div>
							<p className="text-sm font-medium text-[#28819C] mb-3">{t("poPage.modal.items")}</p>
							<div className="border rounded-xl overflow-hidden">
								<table className="w-full">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
												{t("poPage.modal.itemName")}
											</th>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
												{t("poPage.modal.quantity")}
											</th>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
												{t("poPage.modal.unitPrice")}
											</th>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
												{t("poPage.modal.lineTotal")}
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-200">
										{currentPO.items?.map((item, index) => (
											<tr key={item.id || index}>
												<td className="px-4 py-3">
													<div>
														<p className="font-medium text-gray-900">{item.item_name}</p>
														<p className="text-sm text-gray-500">{item.item_description}</p>
													</div>
												</td>
												<td className="px-4 py-3 text-gray-700">
													{parseFloat(item.quantity).toLocaleString()}{" "}
													{item.unit_of_measure_code}
												</td>
												<td className="px-4 py-3 text-gray-700">
													{parseFloat(item.unit_price).toLocaleString(undefined, {
														minimumFractionDigits: 2,
													})}
												</td>
												<td className="px-4 py-3 font-semibold text-gray-900">
													{parseFloat(item.line_total).toLocaleString(undefined, {
														minimumFractionDigits: 2,
													})}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>

						{/* Totals */}
						<div className="bg-gray-50 rounded-xl p-4">
							<div className="flex justify-between items-center mb-2">
								<span className="text-gray-600">{t("poPage.modal.subtotal")}</span>
								<span className="font-medium text-gray-900">
									{parseFloat(currentPO.subtotal || 0).toLocaleString(undefined, {
										minimumFractionDigits: 2,
									})}
								</span>
							</div>
							<div className="flex justify-between items-center mb-2">
								<span className="text-gray-600">{t("poPage.modal.tax")}</span>
								<span className="font-medium text-gray-900">
									{parseFloat(currentPO.tax_amount || 0).toLocaleString(undefined, {
										minimumFractionDigits: 2,
									})}
								</span>
							</div>
							<div className="flex justify-between items-center pt-2 border-t border-gray-200">
								<span className="text-lg font-semibold text-gray-900">{t("poPage.modal.total")}</span>
								<span className="text-lg font-bold text-[#28819C]">
									{currentPO.currency_code}{" "}
									{parseFloat(currentPO.total_amount || 0).toLocaleString(undefined, {
										minimumFractionDigits: 2,
									})}
								</span>
							</div>
						</div>

						{/* Timestamps */}
						<div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
							<div>
								<span className="font-medium">{t("poPage.modal.createdAt")}:</span>{" "}
								{new Date(currentPO.created_at).toLocaleString()}
							</div>
							<div>
								<span className="font-medium">{t("poPage.modal.updatedAt")}:</span>{" "}
								{new Date(currentPO.updated_at).toLocaleString()}
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3 pt-2 flex-wrap">
							<Button
								onClick={handleCloseViewModal}
								title={t("poPage.actions.close")}
								className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
							/>
							{/* Submit for Approval - only for DRAFT */}
							{currentPO.status === "DRAFT" && (
								<Button
									onClick={() => {
										handleCloseViewModal();
										handleSubmitForApproval(currentPO);
									}}
									title={t("poPage.actions.submitForApproval")}
									icon={
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									}
									className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
								/>
							)}
							{/* Confirm - only for APPROVED */}
							{currentPO.status === "APPROVED" && (
								<Button
									onClick={() => {
										handleCloseViewModal();
										handleConfirmPO(currentPO);
									}}
									title={t("poPage.actions.confirm")}
									icon={
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
									}
									className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
								/>
							)}
							{/* Cancel - only for APPROVED */}
							{currentPO.status === "APPROVED" && (
								<Button
									onClick={() => {
										handleCloseViewModal();
										handleCancelPOClick(currentPO);
									}}
									title={t("poPage.actions.cancelPO")}
									icon={
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									}
									className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
								/>
							)}
							{/* Delete - only for DRAFT */}
							{currentPO.status === "DRAFT" && (
								<Button
									onClick={() => {
										handleCloseViewModal();
										handleDeleteClick(currentPO);
									}}
									title={t("poPage.actions.delete")}
									className="shadow-none hover:shadow-none flex-1 py-3 bg-white text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors font-medium"
								/>
							)}
						</div>
					</div>
				) : null}
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title={t("poPage.modal.deleteTitle")}
				message={t("poPage.modal.deleteMessage", { poNumber: poToDelete?.po_number })}
				confirmText={loading ? t("poPage.actions.deleting") : t("poPage.actions.delete")}
				cancelText={t("poPage.actions.cancel")}
				loading={loading}
				confirmColor="red"
			/>

			{/* Cancel PO Modal */}
			<SlideUpModal
				isOpen={isCancelModalOpen}
				onClose={handleDismissCancelPO}
				title={t("poPage.modal.cancelTitle")}
				maxWidth="600px"
			>
				<div className="p-4 space-y-6">
					<div>
						<p className="text-gray-700 mb-4">
							{t("poPage.modal.cancelMessage", { poNumber: poToCancel?.po_number })}
						</p>
						<FloatingLabelTextarea
							label={t("poPage.modal.cancellationReason")}
							name="cancellation_reason"
							value={cancellationReason}
							onChange={e => setCancellationReason(e.target.value)}
							rows={4}
							required
							placeholder={t("poPage.modal.cancellationReasonPlaceholder")}
						/>
					</div>

					<div className="flex gap-3">
						<Button
							onClick={handleDismissCancelPO}
							title={t("poPage.actions.close")}
							className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
						/>
						<Button
							onClick={handleConfirmCancelPO}
							disabled={loading}
							title={loading ? t("poPage.actions.cancelling") : t("poPage.actions.cancelPO")}
							className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
						/>
					</div>
				</div>
			</SlideUpModal>
		</div>
	);
};

export default POPage;
