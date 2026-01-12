import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import SlideUpModal from "../components/shared/SlideUpModal";
import ConfirmModal from "../components/shared/ConfirmModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import FloatingLabelTextarea from "../components/shared/FloatingLabelTextarea";
import Button from "../components/shared/Button";
import LoadingSpan from "../components/shared/LoadingSpan";

import {
	fetchMatches,
	createMatch,
	updateMatch,
	deleteMatch,
	fetchMatchById,
	fetchUnreconciledPayments,
	fetchUnreconciledStatementLines,
	clearReconciliationData,
	clearSelectedMatch,
	setPage,
	MATCH_STATUS_OPTIONS,
	MATCH_TYPE_OPTIONS,
} from "../store/matchesSlice";

import { BiPlus } from "react-icons/bi";
import { BsLink45Deg, BsCheckCircle } from "react-icons/bs";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

// Header Icon
const MatchHeaderIcon = () => <BsLink45Deg className="w-8 h-8 text-white" />;

const MatchedStatementLinePage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	// Redux state
	const {
		matches,
		loading,
		count,
		page,
		hasNext,
		hasPrevious,
		actionLoading,
		selectedMatch,
		loadingDetails,
		unreconciledPayments,
		unreconciledStatementLines,
		loadingPayments,
		loadingStatementLines,
	} = useSelector(state => state.matches);

	// Local state
	const [localPageSize, setLocalPageSize] = useState(20);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [matchToDelete, setMatchToDelete] = useState(null);

	// Edit modal state
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingMatch, setEditingMatch] = useState(null);
	const [editFormData, setEditFormData] = useState({
		match_status: "",
		notes: "",
	});

	// View modal state
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);

	// Create Reconciliation modal state
	const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
	const [selectedPayment, setSelectedPayment] = useState(null);
	const [selectedStatementLine, setSelectedStatementLine] = useState(null);
	const [reconcileFormData, setReconcileFormData] = useState({
		confidence_score: "1.00",
		discrepancy_amount: "0.00",
		notes: "",
	});

	// Filters
	const [filters, setFilters] = useState({
		match_status: "",
		match_type: "",
	});

	// Fetch data on mount and when filters/pagination change
	useEffect(() => {
		dispatch(
			fetchMatches({
				page,
				page_size: localPageSize,
				match_status: filters.match_status || undefined,
				match_type: filters.match_type || undefined,
			})
		);
	}, [dispatch, page, localPageSize, filters]);

	// Match status options
	const matchStatusOptions = useMemo(
		() =>
			MATCH_STATUS_OPTIONS.map(opt => ({
				value: opt.value,
				label: opt.value
					? t(`matches.matchStatus.${opt.value.toLowerCase()}`) || opt.label
					: t("matches.filters.allStatuses"),
			})),
		[t]
	);

	// Match type options
	const matchTypeOptions = useMemo(
		() =>
			MATCH_TYPE_OPTIONS.map(opt => ({
				value: opt.value,
				label: opt.value
					? t(`matches.matchType.${opt.value.toLowerCase()}`) || opt.label
					: t("matches.filters.allTypes"),
			})),
		[t]
	);

	// Handle filter change
	const handleFilterChange = useCallback(
		(field, value) => {
			setFilters(prev => ({ ...prev, [field]: value }));
			dispatch(setPage(1));
		},
		[dispatch]
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

	// Table columns
	const columns = useMemo(
		() => [
			{
				header: t("matches.table.id"),
				accessor: "id",
				width: "60px",
				render: value => <span className="font-mono text-gray-700">#{value}</span>,
			},
			{
				header: t("matches.table.statementLine"),
				accessor: "statement_line_ref",
				render: (value, row) => (
					<div className="flex flex-col">
						<span className="font-medium text-gray-900">{value}</span>
						<span className="text-xs text-gray-500">Line #{row.statement_line_number}</span>
					</div>
				),
			},
			{
				header: t("matches.table.payment"),
				accessor: "payment_id",
				width: "100px",
				render: value => <span className="font-mono text-gray-700">#{value}</span>,
			},
			{
				header: t("matches.table.matchStatus"),
				accessor: "match_status",
				width: "120px",
				render: value => {
					let bgColor = "bg-yellow-100 text-yellow-800";
					if (value === "MATCHED") bgColor = "bg-green-100 text-green-800";
					else if (value === "PARTIAL") bgColor = "bg-blue-100 text-blue-800";
					else if (value === "UNMATCHED") bgColor = "bg-red-100 text-red-800";
					return (
						<span
							className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}
						>
							{t(`matches.matchStatus.${value?.toLowerCase()}`) || value}
						</span>
					);
				},
			},
			{
				header: t("matches.table.matchType"),
				accessor: "match_type",
				width: "120px",
				render: value => (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
						{t(`matches.matchType.${value?.toLowerCase()}`) || value}
					</span>
				),
			},
			{
				header: t("matches.table.confidenceScore"),
				accessor: "confidence_score",
				width: "100px",
				render: value => {
					const score = parseFloat(value) * 100;
					let bgColor = "bg-red-100 text-red-800";
					if (score >= 80) bgColor = "bg-green-100 text-green-800";
					else if (score >= 50) bgColor = "bg-yellow-100 text-yellow-800";
					return (
						<span
							className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}
						>
							{score.toFixed(0)}%
						</span>
					);
				},
			},
			{
				header: t("matches.table.discrepancy"),
				accessor: "discrepancy_amount",
				width: "120px",
				render: value => {
					const amount = parseFloat(value);
					return (
						<span className={`font-mono ${amount > 0 ? "text-red-600" : "text-green-600"}`}>
							{amount.toLocaleString()}
						</span>
					);
				},
			},
			{
				header: t("matches.table.matchedBy"),
				accessor: "matched_by_name",
				render: value => <span className="text-gray-700">{value || "-"}</span>,
			},
			{
				header: t("matches.table.matchedAt"),
				accessor: "matched_at",
				width: "150px",
				render: value => (
					<span className="text-gray-700 text-xs">{value ? new Date(value).toLocaleString() : "-"}</span>
				),
			},
		],
		[t]
	);

	// Handle view click
	const handleView = async row => {
		const match = row.rawData || row;
		setIsViewModalOpen(true);
		try {
			await dispatch(fetchMatchById(match.id)).unwrap();
		} catch (err) {
			toast.error(err?.message || t("matches.messages.fetchError"));
			setIsViewModalOpen(false);
		}
	};

	// Handle edit click
	const handleEdit = row => {
		const match = row.rawData || row;
		setEditingMatch(match);
		setEditFormData({
			match_status: match.match_status || "",
			notes: match.notes || "",
		});
		setIsEditModalOpen(true);
	};

	// Handle edit submit
	const handleEditSubmit = async () => {
		try {
			await dispatch(
				updateMatch({
					id: editingMatch.id,
					data: {
						match_status: editFormData.match_status,
						notes: editFormData.notes,
					},
				})
			).unwrap();
			toast.success(t("matches.messages.updateSuccess"));
			setIsEditModalOpen(false);
			setEditingMatch(null);
		} catch (err) {
			toast.error(err?.message || t("matches.messages.updateError"));
		}
	};

	// Handle delete click
	const handleDelete = row => {
		const match = row.rawData || row;
		setMatchToDelete(match);
		setConfirmDelete(true);
	};

	// Confirm delete
	const handleConfirmDelete = async () => {
		try {
			await dispatch(deleteMatch(matchToDelete.id)).unwrap();
			toast.success(t("matches.messages.deleteSuccess"));
			setConfirmDelete(false);
			setMatchToDelete(null);
		} catch (err) {
			toast.error(err?.message || t("matches.messages.deleteError"));
		}
	};

	// ======== Create Reconciliation Modal Handlers ========

	const handleOpenReconcileModal = () => {
		setIsReconcileModalOpen(true);
		setSelectedPayment(null);
		setSelectedStatementLine(null);
		setReconcileFormData({
			confidence_score: "1.00",
			discrepancy_amount: "0.00",
			notes: "",
		});
		// Fetch unreconciled data
		dispatch(fetchUnreconciledPayments());
		dispatch(fetchUnreconciledStatementLines());
	};

	const handleCloseReconcileModal = () => {
		setIsReconcileModalOpen(false);
		setSelectedPayment(null);
		setSelectedStatementLine(null);
		setReconcileFormData({
			confidence_score: "1.00",
			discrepancy_amount: "0.00",
			notes: "",
		});
		dispatch(clearReconciliationData());
	};

	const handleCreateReconciliation = async () => {
		if (!selectedPayment) {
			toast.error(t("matches.messages.selectPayment"));
			return;
		}
		if (!selectedStatementLine) {
			toast.error(t("matches.messages.selectStatementLine"));
			return;
		}

		const matchData = {
			statement_line: selectedStatementLine.id,
			payment: selectedPayment.id,
			match_status: "MATCHED", // const
			match_type: "MANUAL", // const
			confidence_score: parseFloat(reconcileFormData.confidence_score) || 1.0,
			discrepancy_amount: reconcileFormData.discrepancy_amount || "0.00",
			notes: reconcileFormData.notes || "",
		};

		try {
			await dispatch(createMatch(matchData)).unwrap();
			toast.success(t("matches.messages.createSuccess"));
			handleCloseReconcileModal();
			dispatch(fetchMatches({ page: 1, page_size: localPageSize }));
		} catch (err) {
			toast.error(err?.message || t("matches.messages.createError"));
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer
				position={isRtl ? "top-left" : "top-right"}
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				rtl={isRtl}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>

			<PageHeader title={t("matches.title")} subtitle={t("matches.subtitle")} icon={<MatchHeaderIcon />} />

			<div className="w-[95%] mx-auto px-6 py-8">
				{/* Header with Title, Filters, and Buttons */}
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
					<h2 className="text-2xl font-bold text-gray-900">{t("matches.pageTitle")}</h2>

					<div className="flex flex-wrap items-center gap-4">
						{/* Match Status Filter */}
						<div className="w-40">
							<FloatingLabelSelect
								label={t("matches.filters.matchStatus")}
								value={filters.match_status}
								onChange={e => handleFilterChange("match_status", e.target.value)}
								options={matchStatusOptions}
							/>
						</div>

						{/* Match Type Filter */}
						<div className="w-40">
							<FloatingLabelSelect
								label={t("matches.filters.matchType")}
								value={filters.match_type}
								onChange={e => handleFilterChange("match_type", e.target.value)}
								options={matchTypeOptions}
							/>
						</div>

						{/* Create Reconciliation Button */}
						<Button
							onClick={handleOpenReconcileModal}
							title={t("matches.createReconciliation")}
							className="bg-[#28819C] hover:bg-[#206b85] text-white"
							icon={<BiPlus className="text-xl" />}
						/>
					</div>
				</div>

				{/* Table */}
				{loading ? (
					<LoadingSpan />
				) : (
					<>
						<Table
							columns={columns}
							data={matches.map(m => ({ ...m, rawData: m }))}
							onView={handleView}
							onEdit={handleEdit}
							onDelete={handleDelete}
							emptyMessage={t("matches.emptyMessage")}
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
					</>
				)}
			</div>

			{/* View Match Modal */}
			<SlideUpModal
				isOpen={isViewModalOpen}
				onClose={() => {
					setIsViewModalOpen(false);
					dispatch(clearSelectedMatch());
				}}
				title={t("matches.viewModal.title")}
				maxWidth="700px"
			>
				{loadingDetails ? (
					<LoadingSpan />
				) : selectedMatch ? (
					<div className="space-y-6 p-2">
						{/* Match Information */}
						<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
							<h3 className="text-sm font-semibold text-gray-700 mb-3">
								{t("matches.viewModal.matchInfo")}
							</h3>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-xs text-gray-500">{t("matches.viewModal.id")}</p>
									<p className="font-mono text-gray-900">#{selectedMatch.id}</p>
								</div>
								<div>
									<p className="text-xs text-gray-500">{t("matches.viewModal.matchStatus")}</p>
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
											selectedMatch.match_status === "MATCHED"
												? "bg-green-100 text-green-800"
												: selectedMatch.match_status === "PARTIAL"
												? "bg-blue-100 text-blue-800"
												: selectedMatch.match_status === "UNMATCHED"
												? "bg-red-100 text-red-800"
												: "bg-yellow-100 text-yellow-800"
										}`}
									>
										{t(`matches.matchStatus.${selectedMatch.match_status?.toLowerCase()}`) ||
											selectedMatch.match_status}
									</span>
								</div>
								<div>
									<p className="text-xs text-gray-500">{t("matches.viewModal.matchType")}</p>
									<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
										{t(`matches.matchType.${selectedMatch.match_type?.toLowerCase()}`) ||
											selectedMatch.match_type}
									</span>
								</div>
								<div>
									<p className="text-xs text-gray-500">{t("matches.viewModal.confidenceScore")}</p>
									<p className="font-mono text-gray-900">
										{(parseFloat(selectedMatch.confidence_score) * 100).toFixed(0)}%
									</p>
								</div>
								<div>
									<p className="text-xs text-gray-500">{t("matches.viewModal.discrepancyAmount")}</p>
									<p
										className={`font-mono ${
											parseFloat(selectedMatch.discrepancy_amount) > 0
												? "text-red-600"
												: "text-green-600"
										}`}
									>
										{parseFloat(selectedMatch.discrepancy_amount).toLocaleString()}
									</p>
								</div>
								<div>
									<p className="text-xs text-gray-500">{t("matches.viewModal.matchedBy")}</p>
									<p className="text-gray-900">{selectedMatch.matched_by_name || "-"}</p>
								</div>
								<div className="col-span-2">
									<p className="text-xs text-gray-500">{t("matches.viewModal.matchedAt")}</p>
									<p className="text-gray-900">
										{selectedMatch.matched_at
											? new Date(selectedMatch.matched_at).toLocaleString()
											: "-"}
									</p>
								</div>
							</div>
						</div>

						{/* Statement Line Details */}
						{selectedMatch.statement_line_details && (
							<div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
								<h3 className="text-sm font-semibold text-blue-800 mb-3">
									{t("matches.viewModal.statementLineDetails")}
								</h3>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-xs text-blue-600">
											{t("matches.viewModal.statementNumber")}
										</p>
										<p className="font-mono text-blue-900">
											{selectedMatch.statement_line_details.bank_statement_number}
										</p>
									</div>
									<div>
										<p className="text-xs text-blue-600">{t("matches.viewModal.lineNumber")}</p>
										<p className="font-mono text-blue-900">
											#{selectedMatch.statement_line_details.line_number}
										</p>
									</div>
									<div>
										<p className="text-xs text-blue-600">
											{t("matches.viewModal.transactionType")}
										</p>
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												selectedMatch.statement_line_details.transaction_type === "CREDIT"
													? "bg-green-100 text-green-800"
													: "bg-red-100 text-red-800"
											}`}
										>
											{selectedMatch.statement_line_details.transaction_type}
										</span>
									</div>
									<div>
										<p className="text-xs text-blue-600">{t("matches.viewModal.amount")}</p>
										<p className="font-mono text-blue-900">
											{selectedMatch.statement_line_details.display_amount ||
												parseFloat(
													selectedMatch.statement_line_details.amount
												).toLocaleString()}
										</p>
									</div>
									<div>
										<p className="text-xs text-blue-600">
											{t("matches.viewModal.transactionDate")}
										</p>
										<p className="text-blue-900">
											{selectedMatch.statement_line_details.transaction_date}
										</p>
									</div>
									<div>
										<p className="text-xs text-blue-600">{t("matches.viewModal.valueDate")}</p>
										<p className="text-blue-900">
											{selectedMatch.statement_line_details.value_date}
										</p>
									</div>
									<div className="col-span-2">
										<p className="text-xs text-blue-600">
											{t("matches.viewModal.referenceNumber")}
										</p>
										<p className="text-blue-900">
											{selectedMatch.statement_line_details.reference_number || "-"}
										</p>
									</div>
									<div className="col-span-2">
										<p className="text-xs text-blue-600">{t("matches.viewModal.description")}</p>
										<p className="text-blue-900">
											{selectedMatch.statement_line_details.description || "-"}
										</p>
									</div>
									<div>
										<p className="text-xs text-blue-600">
											{t("matches.viewModal.reconciliationStatus")}
										</p>
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												selectedMatch.statement_line_details.reconciliation_status ===
												"RECONCILED"
													? "bg-green-100 text-green-800"
													: "bg-yellow-100 text-yellow-800"
											}`}
										>
											{selectedMatch.statement_line_details.reconciliation_status}
										</span>
									</div>
									{selectedMatch.statement_line_details.reconciled_date && (
										<div>
											<p className="text-xs text-blue-600">
												{t("matches.viewModal.reconciledDate")}
											</p>
											<p className="text-blue-900">
												{new Date(
													selectedMatch.statement_line_details.reconciled_date
												).toLocaleString()}
											</p>
										</div>
									)}
									{selectedMatch.statement_line_details.reconciled_by_name && (
										<div className="col-span-2">
											<p className="text-xs text-blue-600">
												{t("matches.viewModal.reconciledBy")}
											</p>
											<p className="text-blue-900">
												{selectedMatch.statement_line_details.reconciled_by_name}
											</p>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Payment Details */}
						{selectedMatch.payment_details && (
							<div className="bg-green-50 rounded-lg p-4 border border-green-200">
								<h3 className="text-sm font-semibold text-green-800 mb-3">
									{t("matches.viewModal.paymentDetails")}
								</h3>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-xs text-green-600">{t("matches.viewModal.paymentId")}</p>
										<p className="font-mono text-green-900">#{selectedMatch.payment_details.id}</p>
									</div>
									<div>
										<p className="text-xs text-green-600">{t("matches.viewModal.paymentDate")}</p>
										<p className="text-green-900">{selectedMatch.payment_details.date}</p>
									</div>
									<div>
										<p className="text-xs text-green-600">{t("matches.viewModal.paymentType")}</p>
										<p className="text-green-900">{selectedMatch.payment_details.payment_type}</p>
									</div>
									<div>
										<p className="text-xs text-green-600">
											{t("matches.viewModal.businessPartner")}
										</p>
										<p className="text-green-900">
											{selectedMatch.payment_details.business_partner || "-"}
										</p>
									</div>
									<div>
										<p className="text-xs text-green-600">{t("matches.viewModal.currency")}</p>
										<p className="text-green-900">{selectedMatch.payment_details.currency}</p>
									</div>
									<div>
										<p className="text-xs text-green-600">
											{t("matches.viewModal.approvalStatus")}
										</p>
										<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
											{selectedMatch.payment_details.approval_status}
										</span>
									</div>
									<div className="col-span-2">
										<p className="text-xs text-green-600">
											{t("matches.viewModal.paymentReconciliationStatus")}
										</p>
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												selectedMatch.payment_details.reconciliation_status === "RECONCILED"
													? "bg-green-100 text-green-800"
													: "bg-yellow-100 text-yellow-800"
											}`}
										>
											{selectedMatch.payment_details.reconciliation_status}
										</span>
									</div>
								</div>
							</div>
						)}

						{/* Notes */}
						{selectedMatch.notes && (
							<div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
								<h3 className="text-sm font-semibold text-yellow-800 mb-2">
									{t("matches.viewModal.notes")}
								</h3>
								<p className="text-gray-700 whitespace-pre-wrap">{selectedMatch.notes}</p>
							</div>
						)}

						{/* Close Button */}
						<div className="flex justify-end pt-4 border-t border-gray-200">
							<Button
								onClick={() => {
									setIsViewModalOpen(false);
									dispatch(clearSelectedMatch());
								}}
								title={t("matches.viewModal.close")}
								className="bg-gray-600 hover:bg-gray-700 text-white"
							/>
						</div>
					</div>
				) : (
					<div className="text-center py-8 text-gray-500">{t("matches.viewModal.noData")}</div>
				)}
			</SlideUpModal>

			{/* Edit Match Modal */}
			<SlideUpModal
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setEditingMatch(null);
				}}
				title={t("matches.editModal.title")}
				maxWidth="500px"
			>
				<div className="space-y-6 p-2">
					{/* Match Status */}
					<FloatingLabelSelect
						label={t("matches.editModal.matchStatus")}
						value={editFormData.match_status}
						onChange={e => setEditFormData(prev => ({ ...prev, match_status: e.target.value }))}
						options={MATCH_STATUS_OPTIONS.filter(opt => opt.value).map(opt => ({
							value: opt.value,
							label: t(`matches.matchStatus.${opt.value.toLowerCase()}`) || opt.label,
						}))}
					/>

					{/* Notes */}
					<FloatingLabelTextarea
						label={t("matches.editModal.notes")}
						value={editFormData.notes}
						onChange={e => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
						rows={3}
					/>

					{/* Action Buttons */}
					<div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
						<Button
							onClick={() => {
								setIsEditModalOpen(false);
								setEditingMatch(null);
							}}
							title={t("matches.editModal.cancel")}
							className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
						/>
						<Button
							onClick={handleEditSubmit}
							disabled={actionLoading}
							title={actionLoading ? t("matches.editModal.saving") : t("matches.editModal.save")}
							className="bg-[#28819C] hover:bg-[#206b85] text-white"
						/>
					</div>
				</div>
			</SlideUpModal>

			{/* Create Reconciliation Modal */}
			<SlideUpModal
				isOpen={isReconcileModalOpen}
				onClose={handleCloseReconcileModal}
				title={t("matches.reconcileModal.title")}
				maxWidth="900px"
			>
				<div className="space-y-6 p-2">
					{/* Two Column Layout */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Payments Column */}
						<div className="border border-gray-200 rounded-lg p-4">
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<span className="w-3 h-3 rounded-full bg-blue-500"></span>
								{t("matches.reconcileModal.payments")}
							</h3>
							<p className="text-xs text-gray-500 mb-3">{t("matches.reconcileModal.paymentsDesc")}</p>

							{loadingPayments ? (
								<div className="flex items-center justify-center py-8">
									<AiOutlineLoading3Quarters className="w-6 h-6 text-blue-600 animate-spin" />
								</div>
							) : unreconciledPayments.length === 0 ? (
								<div className="text-center py-8 text-gray-500">
									{t("matches.reconcileModal.noPayments")}
								</div>
							) : (
								<div className="max-h-64 overflow-y-auto space-y-2">
									{unreconciledPayments.map(payment => (
										<div
											key={payment.id}
											onClick={() => setSelectedPayment(payment)}
											className={`p-3 rounded-lg border cursor-pointer transition-all ${
												selectedPayment?.id === payment.id
													? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
													: "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
											}`}
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<div
														className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
															selectedPayment?.id === payment.id
																? "border-blue-500 bg-blue-500"
																: "border-gray-300"
														}`}
													>
														{selectedPayment?.id === payment.id && (
															<BsCheckCircle className="w-3 h-3 text-white" />
														)}
													</div>
													<span className="font-medium text-gray-900">#{payment.id}</span>
												</div>
												<span className="font-mono text-sm text-gray-700">
													{parseFloat(payment.amount || 0).toLocaleString()}
												</span>
											</div>
											{payment.date && (
												<p className="text-xs text-gray-500 mt-1 ml-6">
													<span className="font-medium">Date:</span> {payment.date}
												</p>
											)}
											{payment.total_allocated !== undefined && (
												<p className="text-xs text-gray-500 mt-1 ml-6">
													<span className="font-medium">Allocated:</span>{" "}
													{parseFloat(payment.total_allocated || 0).toLocaleString()}
												</p>
											)}
											{payment.reference && (
												<p className="text-xs text-gray-400 mt-1 ml-6">{payment.reference}</p>
											)}
										</div>
									))}
								</div>
							)}
						</div>

						{/* Statement Lines Column */}
						<div className="border border-gray-200 rounded-lg p-4">
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<span className="w-3 h-3 rounded-full bg-green-500"></span>
								{t("matches.reconcileModal.statementLines")}
							</h3>
							<p className="text-xs text-gray-500 mb-3">
								{t("matches.reconcileModal.statementLinesDesc")}
							</p>

							{loadingStatementLines ? (
								<div className="flex items-center justify-center py-8">
									<AiOutlineLoading3Quarters className="w-6 h-6 text-green-600 animate-spin" />
								</div>
							) : unreconciledStatementLines.length === 0 ? (
								<div className="text-center py-8 text-gray-500">
									{t("matches.reconcileModal.noStatementLines")}
								</div>
							) : (
								<div className="max-h-64 overflow-y-auto space-y-2">
									{unreconciledStatementLines.map(line => (
										<div
											key={line.id}
											onClick={() => setSelectedStatementLine(line)}
											className={`p-3 rounded-lg border cursor-pointer transition-all ${
												selectedStatementLine?.id === line.id
													? "border-green-500 bg-green-50 ring-2 ring-green-200"
													: "border-gray-200 hover:border-green-300 hover:bg-gray-50"
											}`}
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<div
														className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
															selectedStatementLine?.id === line.id
																? "border-green-500 bg-green-500"
																: "border-gray-300"
														}`}
													>
														{selectedStatementLine?.id === line.id && (
															<BsCheckCircle className="w-3 h-3 text-white" />
														)}
													</div>
													<span className="font-medium text-gray-900">
														#{line.line_number}
													</span>
												</div>
												<span
													className={`font-mono text-sm ${
														line.transaction_type === "CREDIT"
															? "text-green-600"
															: "text-red-600"
													}`}
												>
													{line.display_amount ||
														parseFloat(line.amount || 0).toLocaleString()}
												</span>
											</div>
											{line.reference_number && (
												<p className="text-xs text-gray-500 mt-1 ml-6">
													{line.reference_number}
												</p>
											)}
											{line.description && (
												<p className="text-xs text-gray-400 mt-1 ml-6 truncate">
													{line.description}
												</p>
											)}
											{line.transaction_date && (
												<p className="text-xs text-gray-400 mt-1 ml-6">
													{line.transaction_date}
												</p>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Match Details */}
					<div className="border-t border-gray-200 pt-4">
						<h4 className="text-sm font-semibold text-gray-700 mb-3">
							{t("matches.reconcileModal.matchDetails")}
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("matches.reconcileModal.confidenceScore")}
								type="number"
								step="0.01"
								min="0"
								max="1"
								value={reconcileFormData.confidence_score}
								onChange={e =>
									setReconcileFormData(prev => ({
										...prev,
										confidence_score: e.target.value,
									}))
								}
							/>
							<FloatingLabelInput
								label={t("matches.reconcileModal.discrepancyAmount")}
								type="number"
								step="0.01"
								value={reconcileFormData.discrepancy_amount}
								onChange={e =>
									setReconcileFormData(prev => ({
										...prev,
										discrepancy_amount: e.target.value,
									}))
								}
							/>
						</div>
						<div className="mt-4">
							<FloatingLabelTextarea
								label={t("matches.reconcileModal.notes")}
								value={reconcileFormData.notes}
								onChange={e =>
									setReconcileFormData(prev => ({
										...prev,
										notes: e.target.value,
									}))
								}
								rows={2}
								placeholder={t("matches.reconcileModal.notesPlaceholder")}
							/>
						</div>
					</div>

					{/* Selected Summary */}
					{(selectedPayment || selectedStatementLine) && (
						<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
							<h4 className="text-sm font-semibold text-gray-700 mb-2">
								{t("matches.reconcileModal.selectedSummary")}
							</h4>
							<div className="flex items-center gap-4">
								<div className="flex-1">
									<span className="text-xs text-gray-500">
										{t("matches.reconcileModal.payment")}:
									</span>
									<p className="font-medium">{selectedPayment ? `#${selectedPayment.id}` : "-"}</p>
								</div>
								<div className="text-2xl text-gray-400">↔</div>
								<div className="flex-1">
									<span className="text-xs text-gray-500">
										{t("matches.reconcileModal.statementLine")}:
									</span>
									<p className="font-medium">
										{selectedStatementLine ? `#${selectedStatementLine.line_number}` : "-"}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
						<Button
							onClick={handleCloseReconcileModal}
							title={t("matches.reconcileModal.cancel")}
							className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
						/>
						<Button
							onClick={handleCreateReconciliation}
							disabled={actionLoading || !selectedPayment || !selectedStatementLine}
							title={
								actionLoading ? t("matches.reconcileModal.matching") : t("matches.reconcileModal.match")
							}
							className="bg-green-600 hover:bg-green-700 text-white"
							icon={<BsLink45Deg className="text-xl" />}
						/>
					</div>
				</div>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={confirmDelete}
				onClose={() => {
					setConfirmDelete(false);
					setMatchToDelete(null);
				}}
				onConfirm={handleConfirmDelete}
				title={t("matches.deleteConfirm.title")}
				message={t("matches.deleteConfirm.message", {
					id: matchToDelete?.id,
				})}
				confirmText={t("matches.deleteConfirm.confirm")}
				cancelText={t("matches.deleteConfirm.cancel")}
			/>
		</div>
	);
};

export default MatchedStatementLinePage;
