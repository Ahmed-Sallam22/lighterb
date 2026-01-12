import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import Button from "../components/shared/Button";
import LoadingSpan from "../components/shared/LoadingSpan";

import {
	fetchBankStatements,
	createBankStatement,
	updateBankStatement,
	deleteBankStatement,
	downloadStatementTemplate,
	importStatementPreview,
	importStatement,
	clearImportPreview,
	setPage,
	RECONCILIATION_STATUS_OPTIONS,
} from "../store/bankStatementsSlice";
import { fetchBankAccounts } from "../store/bankAccountsSlice";

import { BiPlus } from "react-icons/bi";
import { BsFileEarmarkSpreadsheet, BsDownload, BsUpload, BsListUl } from "react-icons/bs";
import { FiFile } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

// Statement Header Icon
const StatementHeaderIcon = () => <BsFileEarmarkSpreadsheet className="w-8 h-8 text-white" />;

const INITIAL_FORM_STATE = {
	bank_account: "",
	statement_number: "",
	statement_date: "",
	from_date: "",
	to_date: "",
	opening_balance: "0.00",
	closing_balance: "0.00",
	transaction_count: 0,
	total_debits: "0.00",
	total_credits: "0.00",
	import_file_name: "",
};

const BankStatementsPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const fileInputRef = useRef(null);

	// Redux state
	const { statements, loading, count, page, hasNext, hasPrevious, actionLoading, importLoading, importPreviewData } =
		useSelector(state => state.bankStatements);
	const { accounts = [] } = useSelector(state => state.bankAccounts);

	// Local state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingStatement, setEditingStatement] = useState(null);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [statementToDelete, setStatementToDelete] = useState(null);
	const [localPageSize, setLocalPageSize] = useState(20);
	const [formData, setFormData] = useState(INITIAL_FORM_STATE);
	const [errors, setErrors] = useState({});

	// Manage Files Modal state
	const [isManageFilesModalOpen, setIsManageFilesModalOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [importBankAccount, setImportBankAccount] = useState("");
	const [importStep, setImportStep] = useState("upload"); // 'upload' | 'preview' | 'importing'

	// Filters
	const [filters, setFilters] = useState({
		bank_account: "",
		reconciliation_status: "",
		date_from: "",
		date_to: "",
	});

	// Fetch data on mount and when filters/pagination change
	useEffect(() => {
		dispatch(fetchBankAccounts({ page_size: 100 }));
	}, [dispatch]);

	useEffect(() => {
		dispatch(
			fetchBankStatements({
				page,
				page_size: localPageSize,
				bank_account: filters.bank_account || undefined,
				reconciliation_status: filters.reconciliation_status || undefined,
				date_from: filters.date_from || undefined,
				date_to: filters.date_to || undefined,
			})
		);
	}, [dispatch, page, localPageSize, filters]);

	// Bank account options for select
	const bankAccountOptions = useMemo(() => {
		return [
			{ value: "", label: t("bankStatements.filters.allAccounts") },
			...accounts.map(acc => ({
				value: acc.id,
				label: `${acc.account_number} - ${acc.account_name}`,
			})),
		];
	}, [accounts, t]);

	// Reconciliation status options
	const reconciliationOptions = useMemo(
		() =>
			RECONCILIATION_STATUS_OPTIONS.map(opt => ({
				value: opt.value,
				label: t(`bankStatements.reconciliationStatus.${opt.value.toLowerCase()}`) || opt.label,
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
				header: t("bankStatements.table.statementNumber"),
				accessor: "statement_number",
				render: value => <span className="font-semibold text-gray-900">{value}</span>,
			},
			{
				header: t("bankStatements.table.bankAccount"),
				accessor: "bank_account_number",
				render: (value, row) => (
					<div className="flex flex-col">
						<span className="text-gray-900">{value}</span>
						<span className="text-xs text-gray-500">{row.bank_name}</span>
					</div>
				),
			},
			{
				header: t("bankStatements.table.statementDate"),
				accessor: "statement_date",
				width: "120px",
				render: value => <span className="text-gray-700">{value || "-"}</span>,
			},
			{
				header: t("bankStatements.table.period"),
				accessor: "from_date",
				width: "180px",
				render: (value, row) => (
					<span className="text-gray-700">
						{value} - {row.to_date}
					</span>
				),
			},
			{
				header: t("bankStatements.table.openingBalance"),
				accessor: "opening_balance",
				width: "130px",
				render: value => <span className="font-mono text-gray-700">{parseFloat(value).toLocaleString()}</span>,
			},
			{
				header: t("bankStatements.table.closingBalance"),
				accessor: "closing_balance",
				width: "130px",
				render: value => <span className="font-mono text-gray-700">{parseFloat(value).toLocaleString()}</span>,
			},
			{
				header: t("bankStatements.table.lines"),
				accessor: "line_count",
				width: "80px",
				render: value => (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
						{value || 0}
					</span>
				),
			},
			{
				header: t("bankStatements.table.reconciliationStatus"),
				accessor: "reconciliation_status",
				width: "150px",
				render: (value, row) => {
					let bgColor = "bg-yellow-100 text-yellow-800";
					if (value === "RECONCILED") bgColor = "bg-green-100 text-green-800";
					else if (value === "PARTIALLY_RECONCILED") bgColor = "bg-blue-100 text-blue-800";
					return (
						<div className="flex flex-col items-center">
							<span
								className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}
							>
								{t(`bankStatements.reconciliationStatus.${value?.toLowerCase()}`) || value}
							</span>
							<span className="text-xs text-gray-500 mt-1">{row.reconciliation_percentage}%</span>
						</div>
					);
				},
			},
		],
		[t]
	);

	// Form validation
	const validateForm = () => {
		const newErrors = {};

		if (!formData.bank_account) {
			newErrors.bank_account = t("bankStatements.validation.bankAccountRequired");
		}
		if (!formData.statement_number.trim()) {
			newErrors.statement_number = t("bankStatements.validation.statementNumberRequired");
		}
		if (!formData.statement_date) {
			newErrors.statement_date = t("bankStatements.validation.statementDateRequired");
		}
		if (!formData.from_date) {
			newErrors.from_date = t("bankStatements.validation.fromDateRequired");
		}
		if (!formData.to_date) {
			newErrors.to_date = t("bankStatements.validation.toDateRequired");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle form input change
	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	// Open create modal
	const handleCreate = () => {
		setEditingStatement(null);
		setFormData(INITIAL_FORM_STATE);
		setErrors({});
		setIsModalOpen(true);
	};

	// Open edit modal
	const handleEdit = row => {
		const statement = row.rawData || row;
		setEditingStatement(statement);
		setFormData({
			bank_account: statement.bank_account || "",
			statement_number: statement.statement_number || "",
			statement_date: statement.statement_date || "",
			from_date: statement.from_date || "",
			to_date: statement.to_date || "",
			opening_balance: statement.opening_balance || "0.00",
			closing_balance: statement.closing_balance || "0.00",
			transaction_count: statement.transaction_count || 0,
			total_debits: statement.total_debits || "0.00",
			total_credits: statement.total_credits || "0.00",
			import_file_name: statement.import_file_name || "",
		});
		setErrors({});
		setIsModalOpen(true);
	};

	// Handle view lines (navigate to lines page)
	const handleViewLines = row => {
		const statement = row.rawData || row;
		navigate(`/bank-statements/${statement.id}/lines`);
	};

	// Handle form submit
	const handleSubmit = async () => {
		if (!validateForm()) return;

		const statementData = {
			bank_account: parseInt(formData.bank_account),
			statement_number: formData.statement_number.trim(),
			statement_date: formData.statement_date,
			from_date: formData.from_date,
			to_date: formData.to_date,
			opening_balance: formData.opening_balance,
			closing_balance: formData.closing_balance,
			transaction_count: parseInt(formData.transaction_count) || 0,
			total_debits: formData.total_debits,
			total_credits: formData.total_credits,
			import_file_name: formData.import_file_name.trim() || null,
		};

		try {
			if (editingStatement) {
				await dispatch(updateBankStatement({ id: editingStatement.id, data: statementData })).unwrap();
				toast.success(t("bankStatements.messages.updateSuccess"));
			} else {
				await dispatch(createBankStatement(statementData)).unwrap();
				toast.success(t("bankStatements.messages.createSuccess"));
			}
			handleCloseModal();
			dispatch(fetchBankStatements({ page, page_size: localPageSize, ...filters }));
		} catch (err) {
			const errorMessage = err?.message || err?.error || t("bankStatements.messages.saveError");
			if (err && typeof err === "object" && !err.message && !err.error) {
				const errorMessages = [];
				Object.keys(err).forEach(key => {
					if (Array.isArray(err[key])) {
						errorMessages.push(`${key}: ${err[key].join(", ")}`);
					} else if (typeof err[key] === "string") {
						errorMessages.push(`${key}: ${err[key]}`);
					}
				});
				if (errorMessages.length > 0) {
					toast.error(errorMessages.join(" | "));
					return;
				}
			}
			toast.error(errorMessage);
		}
	};

	// Close modal
	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingStatement(null);
		setFormData(INITIAL_FORM_STATE);
		setErrors({});
	};

	// Handle delete click
	const handleDelete = row => {
		const statement = row.rawData || row;
		setStatementToDelete(statement);
		setConfirmDelete(true);
	};

	// Confirm delete
	const handleConfirmDelete = async () => {
		try {
			await dispatch(deleteBankStatement(statementToDelete.id)).unwrap();
			toast.success(t("bankStatements.messages.deleteSuccess"));
			setConfirmDelete(false);
			setStatementToDelete(null);
		} catch (err) {
			const errorMessage = err?.message || t("bankStatements.messages.deleteError");
			toast.error(errorMessage);
		}
	};

	// ======== Manage Files Modal Handlers ========

	const handleOpenManageFiles = () => {
		setIsManageFilesModalOpen(true);
		setSelectedFile(null);
		setImportBankAccount("");
		setImportStep("upload");
		dispatch(clearImportPreview());
	};

	const handleCloseManageFiles = () => {
		setIsManageFilesModalOpen(false);
		setSelectedFile(null);
		setImportBankAccount("");
		setImportStep("upload");
		dispatch(clearImportPreview());
	};

	const handleDownloadTemplate = async () => {
		try {
			await dispatch(downloadStatementTemplate()).unwrap();
			toast.success(t("bankStatements.messages.templateDownloaded"));
		} catch (err) {
			toast.error(err?.message || t("bankStatements.messages.templateDownloadError"));
		}
	};

	const handleFileSelect = e => {
		const file = e.target.files[0];
		if (file) {
			const validTypes = [
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"application/vnd.ms-excel",
				"text/csv",
			];
			if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
				toast.error(t("bankStatements.messages.invalidFileType"));
				return;
			}
			setSelectedFile(file);
		}
	};

	const handleImportPreview = async () => {
		if (!selectedFile) {
			toast.error(t("bankStatements.messages.selectFile"));
			return;
		}
		if (!importBankAccount) {
			toast.error(t("bankStatements.messages.selectBankAccount"));
			return;
		}

		try {
			await dispatch(importStatementPreview({ file: selectedFile, bank_account_id: importBankAccount })).unwrap();
			setImportStep("preview");
		} catch (err) {
			toast.error(err?.message || t("bankStatements.messages.previewError"));
		}
	};

	const handleConfirmImport = async () => {
		if (!selectedFile || !importBankAccount) return;

		setImportStep("importing");
		try {
			await dispatch(importStatement({ file: selectedFile, bank_account_id: importBankAccount })).unwrap();
			toast.success(t("bankStatements.messages.importSuccess"));
			handleCloseManageFiles();
			dispatch(fetchBankStatements({ page: 1, page_size: localPageSize }));
		} catch (err) {
			toast.error(err?.message || t("bankStatements.messages.importError"));
			setImportStep("preview");
		}
	};

	// Custom actions for table
	const customActions = [
		{
			title: t("bankStatements.actions.viewLines"),
			icon: <BsListUl className="w-5 h-5 text-[#28819C]" />,
			onClick: handleViewLines,
		},
	];

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
				title={t("bankStatements.title")}
				subtitle={t("bankStatements.subtitle")}
				icon={<StatementHeaderIcon />}
			/>

			<div className="w-[95%] mx-auto px-6 py-8">
				{/* Header with Title, Filters, and Buttons */}
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
					<h2 className="text-2xl font-bold text-gray-900">{t("bankStatements.pageTitle")}</h2>

					<div className="flex flex-wrap items-center gap-4">
						{/* Bank Account Filter */}
						<div className="w-56">
							<FloatingLabelSelect
								label={t("bankStatements.filters.bankAccount")}
								value={filters.bank_account}
								onChange={e => handleFilterChange("bank_account", e.target.value)}
								options={bankAccountOptions}
							/>
						</div>

						{/* Reconciliation Status Filter */}
						<div className="w-48">
							<FloatingLabelSelect
								label={t("bankStatements.filters.reconciliationStatus")}
								value={filters.reconciliation_status}
								onChange={e => handleFilterChange("reconciliation_status", e.target.value)}
								options={reconciliationOptions}
							/>
						</div>

						{/* Date From */}
						<div className="w-40">
							<FloatingLabelInput
								label={t("bankStatements.filters.dateFrom")}
								type="date"
								value={filters.date_from}
								onChange={e => handleFilterChange("date_from", e.target.value)}
							/>
						</div>

						{/* Date To */}
						<div className="w-40">
							<FloatingLabelInput
								label={t("bankStatements.filters.dateTo")}
								type="date"
								value={filters.date_to}
								onChange={e => handleFilterChange("date_to", e.target.value)}
							/>
						</div>

						{/* Manage Files Button */}
						<Button
							onClick={handleOpenManageFiles}
							title={t("bankStatements.manageFiles")}
							className="bg-gray-600 hover:bg-gray-700 text-white"
							icon={<FiFile className="text-xl" />}
						/>

						{/* Add Statement Button */}
						<Button
							onClick={handleCreate}
							title={t("bankStatements.addStatement")}
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
							data={statements.map(s => ({ ...s, rawData: s }))}
							onEdit={handleEdit}
							onDelete={handleDelete}
							customActions={customActions}
							emptyMessage={t("bankStatements.emptyMessage")}
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

			{/* Add/Edit Statement Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={editingStatement ? t("bankStatements.modal.titleEdit") : t("bankStatements.modal.titleAdd")}
				maxWidth="700px"
			>
				<div className="space-y-6 p-2">
					{/* Bank Account */}
					<FloatingLabelSelect
						label={t("bankStatements.form.bankAccount")}
						name="bank_account"
						value={formData.bank_account}
						onChange={e => handleInputChange("bank_account", e.target.value)}
						options={accounts.map(acc => ({
							value: acc.id,
							label: `${acc.account_number} - ${acc.account_name}`,
						}))}
						error={errors.bank_account}
						required
					/>

					{/* Statement Number & Statement Date */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("bankStatements.form.statementNumber")}
							name="statement_number"
							value={formData.statement_number}
							onChange={e => handleInputChange("statement_number", e.target.value)}
							error={errors.statement_number}
							required
						/>
						<FloatingLabelInput
							label={t("bankStatements.form.statementDate")}
							name="statement_date"
							type="date"
							value={formData.statement_date}
							onChange={e => handleInputChange("statement_date", e.target.value)}
							error={errors.statement_date}
							required
						/>
					</div>

					{/* Period Dates */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("bankStatements.form.fromDate")}
							name="from_date"
							type="date"
							value={formData.from_date}
							onChange={e => handleInputChange("from_date", e.target.value)}
							error={errors.from_date}
							required
						/>
						<FloatingLabelInput
							label={t("bankStatements.form.toDate")}
							name="to_date"
							type="date"
							value={formData.to_date}
							onChange={e => handleInputChange("to_date", e.target.value)}
							error={errors.to_date}
							required
						/>
					</div>

					{/* Balances */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("bankStatements.form.openingBalance")}
							name="opening_balance"
							type="number"
							step="0.01"
							value={formData.opening_balance}
							onChange={e => handleInputChange("opening_balance", e.target.value)}
						/>
						<FloatingLabelInput
							label={t("bankStatements.form.closingBalance")}
							name="closing_balance"
							type="number"
							step="0.01"
							value={formData.closing_balance}
							onChange={e => handleInputChange("closing_balance", e.target.value)}
						/>
					</div>

					{/* Transaction Info */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<FloatingLabelInput
							label={t("bankStatements.form.transactionCount")}
							name="transaction_count"
							type="number"
							value={formData.transaction_count}
							onChange={e => handleInputChange("transaction_count", e.target.value)}
						/>
						<FloatingLabelInput
							label={t("bankStatements.form.totalDebits")}
							name="total_debits"
							type="number"
							step="0.01"
							value={formData.total_debits}
							onChange={e => handleInputChange("total_debits", e.target.value)}
						/>
						<FloatingLabelInput
							label={t("bankStatements.form.totalCredits")}
							name="total_credits"
							type="number"
							step="0.01"
							value={formData.total_credits}
							onChange={e => handleInputChange("total_credits", e.target.value)}
						/>
					</div>

					{/* Import File Name */}
					<FloatingLabelInput
						label={t("bankStatements.form.importFileName")}
						name="import_file_name"
						value={formData.import_file_name}
						onChange={e => handleInputChange("import_file_name", e.target.value)}
						placeholder="statement_jan_2026.csv"
					/>

					{/* Action Buttons */}
					<div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
						<Button
							onClick={handleCloseModal}
							title={t("bankStatements.modal.cancel")}
							className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
						/>
						<Button
							onClick={handleSubmit}
							disabled={actionLoading}
							title={actionLoading ? t("bankStatements.modal.saving") : t("bankStatements.modal.save")}
							className="bg-[#28819C] hover:bg-[#206b85] text-white"
						/>
					</div>
				</div>
			</SlideUpModal>

			{/* Manage Files Modal */}
			<SlideUpModal
				isOpen={isManageFilesModalOpen}
				onClose={handleCloseManageFiles}
				title={t("bankStatements.manageFilesModal.title")}
				maxWidth="600px"
			>
				<div className="space-y-6 p-2">
					{importStep === "upload" && (
						<>
							{/* Download Template Section */}
							<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									{t("bankStatements.manageFilesModal.downloadTemplate")}
								</h3>
								<p className="text-sm text-gray-600 mb-4">
									{t("bankStatements.manageFilesModal.downloadTemplateDesc")}
								</p>
								<Button
									onClick={handleDownloadTemplate}
									disabled={actionLoading}
									title={
										actionLoading
											? t("bankStatements.manageFilesModal.downloading")
											: t("bankStatements.manageFilesModal.downloadBtn")
									}
									className="bg-green-600 hover:bg-green-700 text-white"
									icon={<BsDownload className="text-lg" />}
								/>
							</div>

							{/* Divider */}
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-2 bg-white text-gray-500">
										{t("bankStatements.manageFilesModal.or")}
									</span>
								</div>
							</div>

							{/* Import Section */}
							<div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									{t("bankStatements.manageFilesModal.importFile")}
								</h3>
								<p className="text-sm text-gray-600 mb-4">
									{t("bankStatements.manageFilesModal.importFileDesc")}
								</p>

								{/* Bank Account Select */}
								<div className="mb-4">
									<FloatingLabelSelect
										label={t("bankStatements.manageFilesModal.selectBankAccount")}
										value={importBankAccount}
										onChange={e => setImportBankAccount(e.target.value)}
										options={accounts.map(acc => ({
											value: acc.id,
											label: `${acc.account_number} - ${acc.account_name}`,
										}))}
										required
									/>
								</div>

								{/* File Input */}
								<div className="mb-4">
									<input
										type="file"
										ref={fileInputRef}
										onChange={handleFileSelect}
										accept=".xlsx,.xls,.csv"
										className="hidden"
									/>
									<div
										onClick={() => fileInputRef.current?.click()}
										className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
									>
										{selectedFile ? (
											<div className="flex items-center justify-center gap-2">
												<BsFileEarmarkSpreadsheet className="w-6 h-6 text-green-600" />
												<span className="text-gray-900 font-medium">{selectedFile.name}</span>
											</div>
										) : (
											<>
												<BsUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
												<p className="text-gray-600">
													{t("bankStatements.manageFilesModal.clickToUpload")}
												</p>
												<p className="text-xs text-gray-400 mt-1">
													{t("bankStatements.manageFilesModal.acceptedFormats")}
												</p>
											</>
										)}
									</div>
								</div>

								<Button
									onClick={handleImportPreview}
									disabled={!selectedFile || !importBankAccount || importLoading}
									title={
										importLoading
											? t("bankStatements.manageFilesModal.validating")
											: t("bankStatements.manageFilesModal.validateAndPreview")
									}
									className="bg-blue-600 hover:bg-blue-700 text-white w-full"
									icon={
										importLoading ? (
											<AiOutlineLoading3Quarters className="text-lg animate-spin" />
										) : (
											<BsUpload className="text-lg" />
										)
									}
								/>
							</div>
						</>
					)}

					{importStep === "preview" && importPreviewData && (
						<>
							{/* Preview Data */}
							<div className="bg-green-50 rounded-lg p-4 border border-green-200">
								<h3 className="text-lg font-semibold text-green-800 mb-4">
									{t("bankStatements.manageFilesModal.previewTitle")}
								</h3>

								<div className="grid grid-cols-2 gap-4 mb-4">
									<div>
										<span className="text-sm text-gray-600">
											{t("bankStatements.manageFilesModal.fromDate")}:
										</span>
										<p className="font-medium">{importPreviewData.statement_info?.from_date}</p>
									</div>
									<div>
										<span className="text-sm text-gray-600">
											{t("bankStatements.manageFilesModal.toDate")}:
										</span>
										<p className="font-medium">{importPreviewData.statement_info?.to_date}</p>
									</div>
									<div>
										<span className="text-sm text-gray-600">
											{t("bankStatements.manageFilesModal.transactionCount")}:
										</span>
										<p className="font-medium">
											{importPreviewData.statement_info?.transaction_count}
										</p>
									</div>
									<div>
										<span className="text-sm text-gray-600">
											{t("bankStatements.manageFilesModal.totalDebits")}:
										</span>
										<p className="font-medium text-red-600">
											{parseFloat(
												importPreviewData.statement_info?.total_debits || 0
											).toLocaleString()}
										</p>
									</div>
									<div>
										<span className="text-sm text-gray-600">
											{t("bankStatements.manageFilesModal.totalCredits")}:
										</span>
										<p className="font-medium text-green-600">
											{parseFloat(
												importPreviewData.statement_info?.total_credits || 0
											).toLocaleString()}
										</p>
									</div>
								</div>

								{/* Lines Preview */}
								{importPreviewData.lines_preview && importPreviewData.lines_preview.length > 0 && (
									<div className="mt-4">
										<h4 className="text-sm font-semibold text-gray-700 mb-2">
											{t("bankStatements.manageFilesModal.linesPreview")}:
										</h4>
										<div className="max-h-48 overflow-y-auto">
											<table className="w-full text-sm">
												<thead className="bg-gray-100">
													<tr>
														<th className="px-2 py-1 text-left">
															{t("bankStatements.manageFilesModal.date")}
														</th>
														<th className="px-2 py-1 text-left">
															{t("bankStatements.manageFilesModal.description")}
														</th>
														<th className="px-2 py-1 text-right">
															{t("bankStatements.manageFilesModal.amount")}
														</th>
													</tr>
												</thead>
												<tbody>
													{importPreviewData.lines_preview.slice(0, 5).map((line, idx) => (
														<tr key={idx} className="border-b">
															<td className="px-2 py-1">{line.transaction_date}</td>
															<td className="px-2 py-1">{line.description}</td>
															<td
																className={`px-2 py-1 text-right ${
																	line.transaction_type === "CREDIT"
																		? "text-green-600"
																		: "text-red-600"
																}`}
															>
																{line.transaction_type === "CREDIT" ? "+" : "-"}
																{parseFloat(line.amount).toLocaleString()}
															</td>
														</tr>
													))}
												</tbody>
											</table>
											{importPreviewData.lines_preview.length > 5 && (
												<p className="text-xs text-gray-500 mt-2 text-center">
													{t("bankStatements.manageFilesModal.andMore", {
														count: importPreviewData.lines_preview.length - 5,
													})}
												</p>
											)}
										</div>
									</div>
								)}
							</div>

							{/* Action Buttons */}
							<div className="flex justify-end gap-3">
								<Button
									onClick={() => setImportStep("upload")}
									title={t("bankStatements.manageFilesModal.back")}
									className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
								/>
								<Button
									onClick={handleConfirmImport}
									disabled={importLoading}
									title={
										importLoading
											? t("bankStatements.manageFilesModal.importing")
											: t("bankStatements.manageFilesModal.confirmImport")
									}
									className="bg-green-600 hover:bg-green-700 text-white"
									icon={
										importLoading ? (
											<AiOutlineLoading3Quarters className="text-lg animate-spin" />
										) : (
											<BsUpload className="text-lg" />
										)
									}
								/>
							</div>
						</>
					)}

					{importStep === "importing" && (
						<div className="flex flex-col items-center justify-center py-8">
							<AiOutlineLoading3Quarters className="w-12 h-12 text-blue-600 animate-spin mb-4" />
							<p className="text-gray-600">{t("bankStatements.manageFilesModal.importingStatement")}</p>
						</div>
					)}
				</div>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={confirmDelete}
				onClose={() => {
					setConfirmDelete(false);
					setStatementToDelete(null);
				}}
				onConfirm={handleConfirmDelete}
				title={t("bankStatements.deleteConfirm.title")}
				message={t("bankStatements.deleteConfirm.message", {
					number: statementToDelete?.statement_number,
				})}
				confirmText={t("bankStatements.deleteConfirm.confirm")}
				cancelText={t("bankStatements.deleteConfirm.cancel")}
			/>
		</div>
	);
};

export default BankStatementsPage;
