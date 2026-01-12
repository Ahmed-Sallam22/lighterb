import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import SlideUpModal from "../components/shared/SlideUpModal";
import ConfirmModal from "../components/shared/ConfirmModal";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import Button from "../components/shared/Button";
import LoadingSpan from "../components/shared/LoadingSpan";

import {
	fetchStatementLines,
	fetchStatementLineById,
	deleteStatementLine,
	clearSelectedLine,
	setPage,
	TRANSACTION_TYPE_OPTIONS,
	LINE_RECONCILIATION_STATUS_OPTIONS,
} from "../store/statementLinesSlice";
import { fetchBankStatementById, clearSelectedStatement } from "../store/bankStatementsSlice";

import { BiArrowBack } from "react-icons/bi";
import { BsListUl, BsFileEarmarkText } from "react-icons/bs";

// Lines Header Icon
const LinesHeaderIcon = () => <BsListUl className="w-8 h-8 text-white" />;

const BankStatementLinesPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { statementId } = useParams();

	// Redux state
	const { lines, selectedLine, loading, actionLoading, count, page, hasNext, hasPrevious } = useSelector(
		state => state.statementLines
	);
	const { selectedStatement } = useSelector(state => state.bankStatements);

	// Local state
	const [localPageSize, setLocalPageSize] = useState(20);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [lineToDelete, setLineToDelete] = useState(null);

	// Filters
	const [filters, setFilters] = useState({
		transaction_type: "",
		reconciliation_status: "",
	});

	// Fetch statement details and lines on mount
	useEffect(() => {
		if (statementId) {
			dispatch(fetchBankStatementById(statementId));
		}
		return () => {
			dispatch(clearSelectedStatement());
		};
	}, [dispatch, statementId]);

	useEffect(() => {
		if (statementId) {
			dispatch(
				fetchStatementLines({
					page,
					page_size: localPageSize,
					bank_statement: statementId,
					transaction_type: filters.transaction_type || undefined,
					reconciliation_status: filters.reconciliation_status || undefined,
				})
			);
		}
	}, [dispatch, statementId, page, localPageSize, filters]);

	// Transaction type options
	const transactionTypeOptions = useMemo(
		() =>
			TRANSACTION_TYPE_OPTIONS.map(opt => ({
				value: opt.value,
				label: opt.value
					? t(`statementLines.transactionType.${opt.value.toLowerCase()}`) || opt.label
					: opt.label,
			})),
		[t]
	);

	// Reconciliation status options
	const reconciliationOptions = useMemo(
		() =>
			LINE_RECONCILIATION_STATUS_OPTIONS.map(opt => ({
				value: opt.value,
				label: opt.value
					? t(`statementLines.reconciliationStatus.${opt.value.toLowerCase()}`) || opt.label
					: opt.label,
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
				header: t("statementLines.table.lineNumber"),
				accessor: "line_number",
				width: "80px",
				render: value => <span className="font-mono text-gray-700">#{value}</span>,
			},
			{
				header: t("statementLines.table.transactionDate"),
				accessor: "transaction_date",
				width: "120px",
				render: value => <span className="text-gray-700">{value}</span>,
			},
			{
				header: t("statementLines.table.valueDate"),
				accessor: "value_date",
				width: "120px",
				render: value => <span className="text-gray-700">{value || "-"}</span>,
			},
			{
				header: t("statementLines.table.transactionType"),
				accessor: "transaction_type",
				width: "100px",
				render: value => {
					const bgColor = value === "CREDIT" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
					return (
						<span
							className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}
						>
							{t(`statementLines.transactionType.${value?.toLowerCase()}`) || value}
						</span>
					);
				},
			},
			{
				header: t("statementLines.table.amount"),
				accessor: "display_amount",
				width: "130px",
				render: (value, row) => {
					const isCredit = row.transaction_type === "CREDIT";
					return (
						<span className={`font-mono font-semibold ${isCredit ? "text-green-600" : "text-red-600"}`}>
							{value}
						</span>
					);
				},
			},
			{
				header: t("statementLines.table.referenceNumber"),
				accessor: "reference_number",
				width: "150px",
				render: value => <span className="font-mono text-gray-700">{value || "-"}</span>,
			},
			{
				header: t("statementLines.table.description"),
				accessor: "description",
				render: value => (
					<span className="text-gray-700 truncate max-w-xs block" title={value}>
						{value || "-"}
					</span>
				),
			},
			{
				header: t("statementLines.table.reconciliationStatus"),
				accessor: "reconciliation_status",
				width: "140px",
				render: value => {
					let bgColor = "bg-yellow-100 text-yellow-800";
					if (value === "RECONCILED") bgColor = "bg-green-100 text-green-800";
					return (
						<span
							className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}
						>
							{t(`statementLines.reconciliationStatus.${value?.toLowerCase()}`) || value}
						</span>
					);
				},
			},
		],
		[t]
	);

	// Handle view line details
	const handleView = async row => {
		const line = row.rawData || row;
		try {
			await dispatch(fetchStatementLineById(line.id)).unwrap();
			setIsViewModalOpen(true);
		} catch (err) {
			toast.error(err?.message || t("statementLines.messages.fetchError"));
		}
	};

	// Close view modal
	const handleCloseViewModal = () => {
		setIsViewModalOpen(false);
		dispatch(clearSelectedLine());
	};

	// Handle delete click
	const handleDelete = row => {
		const line = row.rawData || row;
		setLineToDelete(line);
		setConfirmDelete(true);
	};

	// Confirm delete
	const handleConfirmDelete = async () => {
		try {
			await dispatch(deleteStatementLine(lineToDelete.id)).unwrap();
			toast.success(t("statementLines.messages.deleteSuccess"));
			setConfirmDelete(false);
			setLineToDelete(null);
		} catch (err) {
			const errorMessage = err?.message || t("statementLines.messages.deleteError");
			toast.error(errorMessage);
		}
	};

	// Navigate back
	const handleBack = () => {
		navigate("/bank-statements");
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

			<PageHeader
				title={t("statementLines.title")}
				subtitle={t("statementLines.subtitle")}
				icon={<LinesHeaderIcon />}
			/>

			<div className="w-[95%] mx-auto px-6 py-8">
				{/* Back Button and Statement Info */}
				<div className="mb-6">
					<Button
						onClick={handleBack}
						title={t("statementLines.backToStatements")}
						className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 mb-4"
						icon={<BiArrowBack className="text-xl" />}
					/>

					{/* Statement Info Card */}
					{selectedStatement && (
						<div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
							<div className="flex items-center gap-3 mb-3">
								<BsFileEarmarkText className="w-6 h-6 text-[#28819C]" />
								<h3 className="text-lg font-semibold text-gray-900">
									{t("statementLines.statementInfo.title")}
								</h3>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
								<div>
									<span className="text-xs text-gray-500">
										{t("statementLines.statementInfo.statementNumber")}
									</span>
									<p className="font-medium text-gray-900">{selectedStatement.statement_number}</p>
								</div>
								<div>
									<span className="text-xs text-gray-500">
										{t("statementLines.statementInfo.bankAccount")}
									</span>
									<p className="font-medium text-gray-900">{selectedStatement.bank_account_number}</p>
								</div>
								<div>
									<span className="text-xs text-gray-500">
										{t("statementLines.statementInfo.period")}
									</span>
									<p className="font-medium text-gray-900">
										{selectedStatement.from_date} - {selectedStatement.to_date}
									</p>
								</div>
								<div>
									<span className="text-xs text-gray-500">
										{t("statementLines.statementInfo.openingBalance")}
									</span>
									<p className="font-medium text-gray-900">
										{parseFloat(selectedStatement.opening_balance).toLocaleString()}
									</p>
								</div>
								<div>
									<span className="text-xs text-gray-500">
										{t("statementLines.statementInfo.closingBalance")}
									</span>
									<p className="font-medium text-gray-900">
										{parseFloat(selectedStatement.closing_balance).toLocaleString()}
									</p>
								</div>
								<div>
									<span className="text-xs text-gray-500">
										{t("statementLines.statementInfo.lineCount")}
									</span>
									<p className="font-medium text-gray-900">{selectedStatement.line_count}</p>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Filters */}
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
					<h2 className="text-2xl font-bold text-gray-900">{t("statementLines.pageTitle")}</h2>

					<div className="flex flex-wrap items-center gap-4">
						{/* Transaction Type Filter */}
						<div className="w-40">
							<FloatingLabelSelect
								label={t("statementLines.filters.transactionType")}
								value={filters.transaction_type}
								onChange={e => handleFilterChange("transaction_type", e.target.value)}
								options={transactionTypeOptions}
							/>
						</div>

						{/* Reconciliation Status Filter */}
						<div className="w-48">
							<FloatingLabelSelect
								label={t("statementLines.filters.reconciliationStatus")}
								value={filters.reconciliation_status}
								onChange={e => handleFilterChange("reconciliation_status", e.target.value)}
								options={reconciliationOptions}
							/>
						</div>
					</div>
				</div>

				{/* Table */}
				{loading ? (
					<LoadingSpan />
				) : (
					<>
						<Table
							columns={columns}
							data={lines.map(l => ({ ...l, rawData: l }))}
							onView={handleView}
							onDelete={handleDelete}
							emptyMessage={t("statementLines.emptyMessage")}
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

			{/* View Line Details Modal */}
			<SlideUpModal
				isOpen={isViewModalOpen}
				onClose={handleCloseViewModal}
				title={t("statementLines.viewModal.title")}
				maxWidth="700px"
			>
				{actionLoading ? (
					<div className="flex items-center justify-center py-8">
						<LoadingSpan />
					</div>
				) : selectedLine ? (
					<div className="space-y-6 p-2">
						{/* Statement Info */}
						{selectedLine.bank_statement_details && (
							<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
								<h4 className="text-sm font-semibold text-gray-700 mb-2">
									{t("statementLines.viewModal.statementInfo")}
								</h4>
								<div className="grid grid-cols-3 gap-4">
									<div>
										<span className="text-xs text-gray-500">
											{t("statementLines.viewModal.statementNumber")}
										</span>
										<p className="font-medium">
											{selectedLine.bank_statement_details.statement_number}
										</p>
									</div>
									<div>
										<span className="text-xs text-gray-500">
											{t("statementLines.viewModal.statementDate")}
										</span>
										<p className="font-medium">
											{selectedLine.bank_statement_details.statement_date}
										</p>
									</div>
									<div>
										<span className="text-xs text-gray-500">
											{t("statementLines.viewModal.bankAccount")}
										</span>
										<p className="font-medium">
											{selectedLine.bank_statement_details.bank_account}
										</p>
									</div>
								</div>
							</div>
						)}

						{/* Line Details */}
						<div className="grid grid-cols-2 gap-4">
							<div>
								<span className="text-xs text-gray-500">
									{t("statementLines.viewModal.lineNumber")}
								</span>
								<p className="font-medium">#{selectedLine.line_number}</p>
							</div>
							<div>
								<span className="text-xs text-gray-500">
									{t("statementLines.viewModal.transactionType")}
								</span>
								<p className="font-medium">
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
											selectedLine.transaction_type === "CREDIT"
												? "bg-green-100 text-green-800"
												: "bg-red-100 text-red-800"
										}`}
									>
										{t(
											`statementLines.transactionType.${selectedLine.transaction_type?.toLowerCase()}`
										) || selectedLine.transaction_type}
									</span>
								</p>
							</div>
							<div>
								<span className="text-xs text-gray-500">
									{t("statementLines.viewModal.transactionDate")}
								</span>
								<p className="font-medium">{selectedLine.transaction_date}</p>
							</div>
							<div>
								<span className="text-xs text-gray-500">{t("statementLines.viewModal.valueDate")}</span>
								<p className="font-medium">{selectedLine.value_date || "-"}</p>
							</div>
							<div>
								<span className="text-xs text-gray-500">{t("statementLines.viewModal.amount")}</span>
								<p
									className={`font-mono font-semibold text-lg ${
										selectedLine.transaction_type === "CREDIT" ? "text-green-600" : "text-red-600"
									}`}
								>
									{selectedLine.display_amount}
								</p>
							</div>
							<div>
								<span className="text-xs text-gray-500">
									{t("statementLines.viewModal.balanceAfter")}
								</span>
								<p className="font-mono font-medium">
									{selectedLine.balance_after_transaction
										? parseFloat(selectedLine.balance_after_transaction).toLocaleString()
										: "-"}
								</p>
							</div>
							<div>
								<span className="text-xs text-gray-500">
									{t("statementLines.viewModal.referenceNumber")}
								</span>
								<p className="font-mono font-medium">{selectedLine.reference_number || "-"}</p>
							</div>
							<div>
								<span className="text-xs text-gray-500">
									{t("statementLines.viewModal.reconciliationStatus")}
								</span>
								<p className="font-medium">
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
											selectedLine.reconciliation_status === "RECONCILED"
												? "bg-green-100 text-green-800"
												: "bg-yellow-100 text-yellow-800"
										}`}
									>
										{t(
											`statementLines.reconciliationStatus.${selectedLine.reconciliation_status?.toLowerCase()}`
										) || selectedLine.reconciliation_status}
									</span>
								</p>
							</div>
						</div>

						{/* Description */}
						<div>
							<span className="text-xs text-gray-500">{t("statementLines.viewModal.description")}</span>
							<p className="font-medium text-gray-900">{selectedLine.description || "-"}</p>
						</div>

						{/* Matched Payment */}
						{selectedLine.matched_payment_details && (
							<div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
								<h4 className="text-sm font-semibold text-blue-800 mb-2">
									{t("statementLines.viewModal.matchedPayment")}
								</h4>
								<pre className="text-xs text-gray-700 overflow-auto">
									{JSON.stringify(selectedLine.matched_payment_details, null, 2)}
								</pre>
							</div>
						)}

						{/* Reconciliation Info */}
						{selectedLine.reconciled_date && (
							<div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
								<div>
									<span className="text-xs text-gray-500">
										{t("statementLines.viewModal.reconciledDate")}
									</span>
									<p className="font-medium">{selectedLine.reconciled_date}</p>
								</div>
								<div>
									<span className="text-xs text-gray-500">
										{t("statementLines.viewModal.reconciledBy")}
									</span>
									<p className="font-medium">{selectedLine.reconciled_by || "-"}</p>
								</div>
							</div>
						)}

						{/* Notes */}
						{selectedLine.notes && (
							<div>
								<span className="text-xs text-gray-500">{t("statementLines.viewModal.notes")}</span>
								<p className="font-medium text-gray-700">{selectedLine.notes}</p>
							</div>
						)}

						{/* Timestamps */}
						<div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
							<div>
								<span>{t("statementLines.viewModal.createdAt")}:</span>
								<span className="ml-2">{new Date(selectedLine.created_at).toLocaleString()}</span>
							</div>
							<div>
								<span>{t("statementLines.viewModal.updatedAt")}:</span>
								<span className="ml-2">{new Date(selectedLine.updated_at).toLocaleString()}</span>
							</div>
						</div>

						{/* Close Button */}
						<div className="flex justify-end pt-4 border-t border-gray-200">
							<Button
								onClick={handleCloseViewModal}
								title={t("statementLines.viewModal.close")}
								className="bg-gray-600 hover:bg-gray-700 text-white"
							/>
						</div>
					</div>
				) : null}
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={confirmDelete}
				onClose={() => {
					setConfirmDelete(false);
					setLineToDelete(null);
				}}
				onConfirm={handleConfirmDelete}
				title={t("statementLines.deleteConfirm.title")}
				message={t("statementLines.deleteConfirm.message", {
					lineNumber: lineToDelete?.line_number,
				})}
				confirmText={t("statementLines.deleteConfirm.confirm")}
				cancelText={t("statementLines.deleteConfirm.cancel")}
			/>
		</div>
	);
};

export default BankStatementLinesPage;
