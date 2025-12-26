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

import { fetchGRNs, fetchGRNDetails, deleteGRN, setPage, clearCurrentGRN } from "../store/grnSlice";
import { BiPlus } from "react-icons/bi";

// GRN Icon
const GRNIcon = () => (
	<svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g opacity="0.5">
			<path
				d="M4 4C4 2.89543 4.89543 2 6 2H18L24 8V23C24 24.1046 23.1046 25 22 25H6C4.89543 25 4 24.1046 4 23V4Z"
				fill="#D3D3D3"
			/>
			<path d="M18 2V8H24" fill="#A0A0A0" />
			<path d="M8 12H20M8 16H16M8 20H12" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
			<circle cx="20" cy="20" r="5" fill="#28819C" />
			<path
				d="M18 20L19.5 21.5L22.5 18.5"
				stroke="white"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</g>
	</svg>
);

const ReceivingPage = () => {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	// Get data from Redux
	const { grnList, loading, count, page, hasNext, hasPrevious, currentGRN, detailsLoading } = useSelector(
		state => state.grn
	);

	// Local state
	const [localPageSize, setLocalPageSize] = useState(20);
	const [searchTerm, setSearchTerm] = useState("");

	// Modal state
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [grnToDelete, setGrnToDelete] = useState(null);

	// Update page title
	useEffect(() => {
		document.title = `${t("receivingPage.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	// Fetch GRN list
	useEffect(() => {
		const params = {
			page,
			page_size: localPageSize,
		};
		if (searchTerm) params.search = searchTerm;

		dispatch(fetchGRNs(params));
	}, [dispatch, page, localPageSize, searchTerm]);

	// Receipt type options with translations

	// Get GRN type badge styling
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
				header: t("receivingPage.table.grnNumber"),
				accessor: "grn_number",
				render: value => <span className="font-semibold text-[#28819C]">{value}</span>,
			},
			{
				header: t("receivingPage.table.receiptDate"),
				accessor: "receipt_date",
				render: value => <span className="text-gray-600">{value || "-"}</span>,
			},
			{
				header: t("receivingPage.table.poNumber"),
				accessor: "po_number",
				render: value => <span className="font-medium text-gray-700">{value || "-"}</span>,
			},
			{
				header: t("receivingPage.table.grnType"),
				accessor: "grn_type",
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
				header: t("receivingPage.table.supplier"),
				accessor: "supplier_name",
				render: value => <span className="text-gray-900">{value || "-"}</span>,
			},
			{
				header: t("receivingPage.table.totalAmount"),
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
				header: t("receivingPage.table.lineCount"),
				accessor: "line_count",
				width: "100px",
				render: value => (
					<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
						{value}
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
	const handleCreateGRN = () => {
		navigate("/procurement/receiving-grn/create");
	};

	const handleViewGRN = async grn => {
		setIsViewModalOpen(true);
		dispatch(fetchGRNDetails(grn.id));
	};

	const handleCloseViewModal = () => {
		setIsViewModalOpen(false);
		dispatch(clearCurrentGRN());
	};

	const handleDeleteClick = grn => {
		setGrnToDelete(grn);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!grnToDelete) return;

		try {
			await dispatch(deleteGRN(grnToDelete.id)).unwrap();
			toast.success(t("receivingPage.messages.deleted"));
			setIsDeleteModalOpen(false);
			setGrnToDelete(null);
		} catch (error) {
			toast.error(error || t("receivingPage.messages.deleteError"));
		}
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
		setGrnToDelete(null);
	};

	const handleSearchChange = e => {
		setSearchTerm(e.target.value);
		dispatch(setPage(1));
	};

	return (
		<div className="min-h-screen bg-[#EEEEEE]">
			<ToastContainer position="top-right" />

			{/* Header */}
			<PageHeader title={t("receivingPage.title")} subtitle={t("receivingPage.subtitle")} icon={<GRNIcon />} />

			<div className="w-[95%] mx-auto px-6 py-8">
				{/* Title and Create Button */}
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-[#28819C]">{t("receivingPage.title")}</h2>

					<Button
						onClick={handleCreateGRN}
						title={t("receivingPage.actions.create")}
						icon={<BiPlus className="text-xl" />}
						className="bg-[#28819C] hover:bg-[#1d6a80] text-white"
					/>
				</div>

				{/* Filters Section */}
				<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<SearchInput
								value={searchTerm}
								onChange={handleSearchChange}
								placeholder={t("receivingPage.filters.searchPlaceholder")}
								className="max-w-full"
							/>
						</div>
					</div>
				</div>

				{/* Table */}
				<Table
					columns={columns}
					data={grnList}
					onView={handleViewGRN}
					onDelete={handleDeleteClick}
					showDeleteButton={() => true}
					emptyMessage={loading ? t("receivingPage.table.loading") : t("receivingPage.table.emptyMessage")}
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

			{/* View GRN Modal */}
			<SlideUpModal
				isOpen={isViewModalOpen}
				onClose={handleCloseViewModal}
				title={t("receivingPage.modal.viewTitle")}
				maxWidth="900px"
			>
				{detailsLoading ? (
					<div className="flex items-center justify-center py-12">
						<div className="w-8 h-8 border-4 border-[#28819C] border-t-transparent rounded-full animate-spin"></div>
					</div>
				) : currentGRN ? (
					<div className="space-y-6 p-4">
						{/* GRN Header Info */}
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">
									{t("receivingPage.modal.grnNumber")}
								</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 font-semibold">
									{currentGRN.grn_number}
								</div>
							</div>
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">
									{t("receivingPage.modal.receiptDate")}
								</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
									{currentGRN.receipt_date}
								</div>
							</div>
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">
									{t("receivingPage.modal.grnType")}
								</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(
											currentGRN.grn_type
										)}`}
									>
										{currentGRN.grn_type}
									</span>
								</div>
							</div>
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">
									{t("receivingPage.modal.poNumber")}
								</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 font-medium">
									{currentGRN.po_number}
								</div>
							</div>
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">
									{t("receivingPage.modal.supplier")}
								</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
									{currentGRN.supplier_name}
								</div>
							</div>
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">
									{t("receivingPage.modal.receivedBy")}
								</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
									{currentGRN.received_by_name}
								</div>
							</div>
						</div>

						{/* Notes */}
						{currentGRN.notes && (
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">
									{t("receivingPage.modal.notes")}
								</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
									{currentGRN.notes}
								</div>
							</div>
						)}

						{/* Lines */}
						<div>
							<p className="text-sm font-medium text-[#28819C] mb-3">{t("receivingPage.modal.lines")}</p>
							<div className="border rounded-xl overflow-hidden">
								<table className="w-full">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
												{t("receivingPage.modal.itemName")}
											</th>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
												{t("receivingPage.modal.quantityOrdered")}
											</th>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
												{t("receivingPage.modal.quantityReceived")}
											</th>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
												{t("receivingPage.modal.unitPrice")}
											</th>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
												{t("receivingPage.modal.lineTotal")}
											</th>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
												{t("receivingPage.modal.isGift")}
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-200">
										{currentGRN.lines?.map((line, index) => (
											<tr key={line.id || index}>
												<td className="px-4 py-3">
													<div>
														<p className="font-medium text-gray-900">{line.item_name}</p>
														<p className="text-sm text-gray-500">{line.item_description}</p>
													</div>
												</td>
												<td className="px-4 py-3 text-gray-700">
													{parseFloat(line.quantity_ordered).toLocaleString()}{" "}
													{line.unit_of_measure_code}
												</td>
												<td className="px-4 py-3">
													<span className="font-semibold text-green-600">
														{parseFloat(line.quantity_received).toLocaleString()}{" "}
														{line.unit_of_measure_code}
													</span>
													<span className="text-xs text-gray-500 ml-2">
														({line.receipt_percentage}%)
													</span>
												</td>
												<td className="px-4 py-3 text-gray-700">
													{parseFloat(line.unit_price).toLocaleString(undefined, {
														minimumFractionDigits: 2,
													})}
												</td>
												<td className="px-4 py-3 font-semibold text-gray-900">
													{parseFloat(line.line_total).toLocaleString(undefined, {
														minimumFractionDigits: 2,
													})}
												</td>
												<td className="px-4 py-3">
													{line.is_gift ? (
														<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
															{t("receivingPage.modal.gift")}
														</span>
													) : (
														<span className="text-gray-400">-</span>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>

						{/* Receipt Summary */}
						{currentGRN.receipt_summary && (
							<div className="bg-gray-50 rounded-xl p-4">
								<p className="text-sm font-medium text-[#28819C] mb-3">
									{t("receivingPage.modal.receiptSummary")}
								</p>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
									<div>
										<span className="text-gray-600">{t("receivingPage.modal.totalLines")}:</span>
										<span className="ml-2 font-medium text-gray-900">
											{currentGRN.receipt_summary.total_lines}
										</span>
									</div>
									<div>
										<span className="text-gray-600">{t("receivingPage.modal.regularLines")}:</span>
										<span className="ml-2 font-medium text-gray-900">
											{currentGRN.receipt_summary.regular_lines}
										</span>
									</div>
									<div>
										<span className="text-gray-600">{t("receivingPage.modal.giftLines")}:</span>
										<span className="ml-2 font-medium text-purple-700">
											{currentGRN.receipt_summary.gift_lines}
										</span>
									</div>
									<div>
										<span className="text-gray-600">
											{t("receivingPage.modal.totalItemsReceived")}:
										</span>
										<span className="ml-2 font-medium text-green-600">
											{currentGRN.receipt_summary.total_items_received}
										</span>
									</div>
								</div>
								<div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
									<span className="text-lg font-semibold text-gray-900">
										{t("receivingPage.modal.totalAmount")}
									</span>
									<span className="text-lg font-bold text-[#28819C]">
										{parseFloat(currentGRN.receipt_summary.total_amount || 0).toLocaleString(
											undefined,
											{
												minimumFractionDigits: 2,
											}
										)}
									</span>
								</div>
							</div>
						)}

						{/* PO Completion Status */}
						{currentGRN.po_completion_status && (
							<div className="bg-blue-50 rounded-xl p-4">
								<p className="text-sm font-medium text-blue-800 mb-3">
									{t("receivingPage.modal.poCompletionStatus")}
								</p>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
									<div>
										<span className="text-blue-700">{t("receivingPage.modal.totalPOLines")}:</span>
										<span className="ml-2 font-medium text-blue-900">
											{currentGRN.po_completion_status.total_po_lines}
										</span>
									</div>
									<div>
										<span className="text-blue-700">
											{t("receivingPage.modal.fullyReceivedLines")}:
										</span>
										<span className="ml-2 font-medium text-green-700">
											{currentGRN.po_completion_status.fully_received_lines}
										</span>
									</div>
									<div>
										<span className="text-blue-700">
											{t("receivingPage.modal.partiallyReceivedLines")}:
										</span>
										<span className="ml-2 font-medium text-yellow-700">
											{currentGRN.po_completion_status.partially_received_lines}
										</span>
									</div>
									<div>
										<span className="text-blue-700">{t("receivingPage.modal.pendingLines")}:</span>
										<span className="ml-2 font-medium text-red-700">
											{currentGRN.po_completion_status.pending_lines}
										</span>
									</div>
								</div>
								<div className="mt-3">
									<div className="flex justify-between text-sm mb-1">
										<span className="text-blue-700">
											{t("receivingPage.modal.completionPercentage")}
										</span>
										<span className="font-semibold text-blue-900">
											{currentGRN.po_completion_status.completion_percentage}%
										</span>
									</div>
									<div className="w-full bg-blue-200 rounded-full h-2">
										<div
											className="bg-blue-600 h-2 rounded-full transition-all"
											style={{
												width: `${currentGRN.po_completion_status.completion_percentage}%`,
											}}
										></div>
									</div>
								</div>
							</div>
						)}

						{/* Timestamps */}
						<div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
							<div>
								<span className="font-medium">{t("receivingPage.modal.createdAt")}:</span>{" "}
								{new Date(currentGRN.created_at).toLocaleString()}
							</div>
							<div>
								<span className="font-medium">{t("receivingPage.modal.createdBy")}:</span>{" "}
								{currentGRN.created_by_name}
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3 pt-2">
							<Button
								onClick={handleCloseViewModal}
								title={t("receivingPage.actions.close")}
								className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
							/>
							<Button
								onClick={() => {
									handleCloseViewModal();
									handleDeleteClick(currentGRN);
								}}
								title={t("receivingPage.actions.delete")}
								className="shadow-none hover:shadow-none flex-1 py-3 bg-white text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors font-medium"
							/>
						</div>
					</div>
				) : null}
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title={t("receivingPage.modal.deleteTitle")}
				message={t("receivingPage.modal.deleteMessage", { grnNumber: grnToDelete?.grn_number })}
				confirmText={loading ? t("receivingPage.actions.deleting") : t("receivingPage.actions.delete")}
				cancelText={t("receivingPage.actions.cancel")}
				loading={loading}
				confirmColor="red"
			/>
		</div>
	);
};

export default ReceivingPage;
