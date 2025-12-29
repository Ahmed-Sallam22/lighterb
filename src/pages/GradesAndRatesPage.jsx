import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { HiTrendingUp, HiArrowLeft, HiPlus, HiClock } from "react-icons/hi";

import { parseApiError } from "../utils/errorHandler";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import ConfirmModal from "../components/shared/ConfirmModal";
import SlideUpModal from "../components/shared/SlideUpModal";
import HistoryModal from "../components/shared/HistoryModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import Button from "../components/shared/Button";

import {
	fetchGrades,
	fetchGradeById,
	createGrade,
	updateGrade,
	deleteGrade,
	createGradeRate,
	updateGradeRate,
	deleteGradeRate,
	fetchGradeHistory,
	setPage as setGradePage,
	setSelectedGrade,
	clearSelectedGrade,
} from "../store/gradesSlice";
import { fetchBusinessGroups } from "../store/businessGroupsSlice";
import { fetchCurrencies } from "../store/currenciesSlice";

const GRADE_FORM_INITIAL = {
	name: "",
	code: "",
	business_group: "",
	effective_start_date: "",
	effective_end_date: "",
};

const RATE_FORM_INITIAL = {
	rate_type: "",
	rate_type_code: "",
	currency: "",
	min_amount: "",
	max_amount: "",
	fixed_amount: "",
	effective_start_date: "",
	effective_end_date: "",
};

const GradesAndRatesPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	// Redux state
	const {
		grades,
		selectedGrade,
		gradeRates,
		loading: gradeLoading,
		ratesLoading,
		count: gradeCount,
		page: gradePage,
		hasNext: gradeHasNext,
		hasPrevious: gradeHasPrevious,
		creating: gradeCreating,
		updating: gradeUpdating,
		rateCreating,
		rateUpdating,
	} = useSelector(state => state.grades);

	const { businessGroups } = useSelector(state => state.businessGroups);
	const { currencies } = useSelector(state => state.currencies);

	// Local state
	const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
	const [isRateModalOpen, setIsRateModalOpen] = useState(false);
	const [editingGrade, setEditingGrade] = useState(null);
	const [editingRate, setEditingRate] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);
	const [deleteType, setDeleteType] = useState("grade"); // "grade" or "rate"
	const [gradeFormData, setGradeFormData] = useState(GRADE_FORM_INITIAL);
	const [rateFormData, setRateFormData] = useState(RATE_FORM_INITIAL);
	const [formErrors, setFormErrors] = useState({});
	const [localPageSize, setLocalPageSize] = useState(25);
	const [isRangeBasedRate, setIsRangeBasedRate] = useState(false);
	const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
	const [historyData, setHistoryData] = useState([]);
	const [historyLoading, setHistoryLoading] = useState(false);
	const [historyItem, setHistoryItem] = useState(null);

	// Fetch initial data
	useEffect(() => {
		dispatch(fetchBusinessGroups());
		dispatch(fetchCurrencies());
		dispatch(fetchGrades({ page: gradePage, page_size: localPageSize }));
	}, [dispatch, gradePage, localPageSize]);

	useEffect(() => {
		document.title = `${t("gradesAndRates.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	const handlePageChange = useCallback(
		newPage => {
			dispatch(setGradePage(newPage));
		},
		[dispatch]
	);

	const handlePageSizeChange = useCallback(
		newPageSize => {
			setLocalPageSize(newPageSize);
			dispatch(setGradePage(1));
		},
		[dispatch]
	);

	const formatDate = dateString => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
	};

	const renderStatus = value => (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
				value === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
			}`}
		>
			<span
				className={`w-2 h-2 rounded-full mr-1.5 ${value === "active" ? "bg-green-500" : "bg-gray-400"}`}
			></span>
			{value === "active" ? t("common.active") : t("common.inactive")}
		</span>
	);

	// Grades columns
	const gradeColumns = [
		{
			header: t("gradesAndRates.grades.table.name"),
			accessor: "name",
			render: value => value || "-",
		},
		{
			header: t("gradesAndRates.grades.table.code"),
			accessor: "code",
			render: value => value || "-",
		},
		{
			header: t("gradesAndRates.grades.table.businessGroup"),
			accessor: "business_group_name",
			render: value => value || "-",
		},
		{
			header: t("gradesAndRates.grades.table.startDate"),
			accessor: "effective_start_date",
			render: value => formatDate(value),
		},
		{
			header: t("gradesAndRates.grades.table.endDate"),
			accessor: "effective_end_date",
			render: value => formatDate(value),
		},
		{
			header: t("gradesAndRates.grades.table.ratesCount"),
			accessor: "rates",
			render: value => (Array.isArray(value) ? value.length : 0),
		},
		{
			header: t("gradesAndRates.grades.table.status"),
			accessor: "status",
			render: renderStatus,
		},
	];

	// Rate columns
	const rateColumns = [
		{
			header: t("gradesAndRates.gradeRates.table.rateType"),
			accessor: "rate_type_name",
			render: value => value || "-",
		},
		{
			header: t("gradesAndRates.gradeRates.table.rateCode"),
			accessor: "rate_type_code",
			render: value => value || "-",
		},
		{
			header: t("gradesAndRates.gradeRates.table.currency"),
			accessor: "currency",
			render: value => value || "-",
		},
		{
			header: t("gradesAndRates.gradeRates.table.amount"),
			accessor: "fixed_amount",
			render: (value, row) => {
				if (row.rate_type_has_range) {
					return `${parseFloat(row.min_amount || 0).toLocaleString()} - ${parseFloat(
						row.max_amount || 0
					).toLocaleString()}`;
				}
				return value ? parseFloat(value).toLocaleString() : "-";
			},
		},
		{
			header: t("gradesAndRates.gradeRates.table.startDate"),
			accessor: "effective_start_date",
			render: value => formatDate(value),
		},
		{
			header: t("gradesAndRates.gradeRates.table.endDate"),
			accessor: "effective_end_date",
			render: value => formatDate(value),
		},
		{
			header: t("gradesAndRates.gradeRates.table.status"),
			accessor: "status",
			render: renderStatus,
		},
	];

	const businessGroupOptions = [
		{ value: "", label: t("gradesAndRates.grades.form.selectBusinessGroup") },
		...businessGroups.map(bg => ({
			value: bg.id,
			label: bg.name,
		})),
	];

	const currencyOptions = [
		{ value: "", label: t("gradesAndRates.gradeRates.form.selectCurrency") },
		...currencies.map(currency => ({
			value: currency.code,
			label: `${currency.code} - ${currency.name}`,
		})),
	];

	// Grade modal handlers
	const handleCreateGrade = () => {
		setEditingGrade(null);
		setGradeFormData(GRADE_FORM_INITIAL);
		setFormErrors({});
		setIsGradeModalOpen(true);
	};

	const handleEditGrade = item => {
		setEditingGrade(item);
		setGradeFormData({
			name: item.name || "",
			code: item.code || "",
			business_group: item.business_group || "",
			effective_start_date: item.effective_start_date || "",
			effective_end_date: item.effective_end_date || "",
		});
		setFormErrors({});
		setIsGradeModalOpen(true);
	};

	const handleViewGradeRates = item => {
		dispatch(setSelectedGrade(item));
	};

	const handleBackToGrades = () => {
		dispatch(clearSelectedGrade());
	};

	const handleCloseGradeModal = () => {
		setIsGradeModalOpen(false);
		setEditingGrade(null);
		setGradeFormData(GRADE_FORM_INITIAL);
		setFormErrors({});
	};

	// Rate modal handlers
	const handleCreateRate = () => {
		setEditingRate(null);
		setRateFormData(RATE_FORM_INITIAL);
		setIsRangeBasedRate(false);
		setFormErrors({});
		setIsRateModalOpen(true);
	};

	const handleEditRate = item => {
		setEditingRate(item);
		setIsRangeBasedRate(item.rate_type_has_range);
		setRateFormData({
			rate_type: item.rate_type || "",
			rate_type_code: item.rate_type_code || "",
			currency: item.currency || "",
			min_amount: item.min_amount || "",
			max_amount: item.max_amount || "",
			fixed_amount: item.fixed_amount || "",
			effective_start_date: item.effective_start_date || "",
			effective_end_date: item.effective_end_date || "",
		});
		setFormErrors({});
		setIsRateModalOpen(true);
	};

	const handleCloseRateModal = () => {
		setIsRateModalOpen(false);
		setEditingRate(null);
		setRateFormData(RATE_FORM_INITIAL);
		setIsRangeBasedRate(false);
		setFormErrors({});
	};

	const handleGradeInputChange = e => {
		const { name, value } = e.target;
		setGradeFormData(prev => ({ ...prev, [name]: value }));
		if (formErrors[name]) {
			setFormErrors(prev => ({ ...prev, [name]: "" }));
		}
	};

	const handleRateInputChange = e => {
		const { name, value } = e.target;
		setRateFormData(prev => ({ ...prev, [name]: value }));
		if (formErrors[name]) {
			setFormErrors(prev => ({ ...prev, [name]: "" }));
		}
	};

	const validateGradeForm = () => {
		const errors = {};
		if (!gradeFormData.name.trim()) {
			errors.name = t("gradesAndRates.grades.form.nameRequired");
		}
		if (!editingGrade && !gradeFormData.business_group) {
			errors.business_group = t("gradesAndRates.grades.form.businessGroupRequired");
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const validateRateForm = () => {
		const errors = {};
		if (!rateFormData.rate_type_code.trim()) {
			errors.rate_type_code = t("gradesAndRates.gradeRates.form.rateTypeRequired");
		}
		if (!rateFormData.currency) {
			errors.currency = t("gradesAndRates.gradeRates.form.currencyRequired");
		}
		if (isRangeBasedRate) {
			if (!rateFormData.min_amount) {
				errors.min_amount = t("gradesAndRates.gradeRates.form.minAmountRequired");
			}
			if (!rateFormData.max_amount) {
				errors.max_amount = t("gradesAndRates.gradeRates.form.maxAmountRequired");
			}
		} else {
			if (!rateFormData.fixed_amount) {
				errors.fixed_amount = t("gradesAndRates.gradeRates.form.fixedAmountRequired");
			}
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleGradeSubmit = async e => {
		e.preventDefault();
		if (!validateGradeForm()) return;

		try {
			const payload = {
				name: gradeFormData.name,
				effective_start_date: gradeFormData.effective_start_date || undefined,
				effective_end_date: gradeFormData.effective_end_date || undefined,
			};

			if (editingGrade) {
				// code and business_group are read-only on update
				await dispatch(updateGrade({ id: editingGrade.id, data: payload })).unwrap();
				toast.success(t("gradesAndRates.grades.messages.updated"));
			} else {
				payload.business_group = gradeFormData.business_group;
				if (gradeFormData.code) {
					payload.code = gradeFormData.code;
				}
				await dispatch(createGrade(payload)).unwrap();
				toast.success(t("gradesAndRates.grades.messages.created"));
			}
			dispatch(fetchGrades({ page: gradePage, page_size: localPageSize }));
			handleCloseGradeModal();
		} catch (error) {
			toast.error(parseApiError(error, t, "gradesAndRates.messages.saveError"));
		}
	};

	const handleRateSubmit = async e => {
		e.preventDefault();
		if (!validateRateForm()) return;

		try {
			const payload = {
				rate_type_code: rateFormData.rate_type_code,
				currency: rateFormData.currency,
				effective_start_date: rateFormData.effective_start_date || undefined,
				effective_end_date: rateFormData.effective_end_date || undefined,
			};

			if (isRangeBasedRate) {
				payload.min_amount = rateFormData.min_amount;
				payload.max_amount = rateFormData.max_amount;
			} else {
				payload.fixed_amount = rateFormData.fixed_amount;
			}

			if (editingRate) {
				await dispatch(
					updateGradeRate({
						gradeId: selectedGrade.id,
						rateId: editingRate.id,
						data: payload,
					})
				).unwrap();
				toast.success(t("gradesAndRates.gradeRates.messages.updated"));
			} else {
				await dispatch(
					createGradeRate({
						gradeId: selectedGrade.id,
						data: payload,
					})
				).unwrap();
				toast.success(t("gradesAndRates.gradeRates.messages.created"));
			}
			// Refresh the grade to get updated rates
			dispatch(fetchGradeById(selectedGrade.id));
			handleCloseRateModal();
		} catch (error) {
			toast.error(parseApiError(error, t, "gradesAndRates.messages.saveError"));
		}
	};

	const handleDeleteGradeClick = item => {
		setItemToDelete(item);
		setDeleteType("grade");
		setIsDeleteModalOpen(true);
	};

	const handleDeleteRateClick = item => {
		setItemToDelete(item);
		setDeleteType("rate");
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!itemToDelete) return;
		try {
			if (deleteType === "grade") {
				await dispatch(deleteGrade(itemToDelete.id)).unwrap();
				toast.success(t("gradesAndRates.grades.messages.deleted"));
				dispatch(fetchGrades({ page: gradePage, page_size: localPageSize }));
			} else {
				await dispatch(
					deleteGradeRate({
						gradeId: selectedGrade.id,
						rateId: itemToDelete.id,
					})
				).unwrap();
				toast.success(t("gradesAndRates.gradeRates.messages.deleted"));
				dispatch(fetchGradeById(selectedGrade.id));
			}
			setIsDeleteModalOpen(false);
			setItemToDelete(null);
		} catch (error) {
			toast.error(parseApiError(error, t, "gradesAndRates.messages.deleteError"));
		}
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
		setItemToDelete(null);
	};

	const handleViewHistory = async item => {
		setHistoryItem(item);
		setIsHistoryModalOpen(true);
		setHistoryLoading(true);
		try {
			const result = await dispatch(fetchGradeHistory(item.id)).unwrap();
			setHistoryData(result.results || []);
		} catch (error) {
			toast.error(parseApiError(error, t, "history.fetchError"));
			setHistoryData([]);
		} finally {
			setHistoryLoading(false);
		}
	};

	const handleCloseHistoryModal = () => {
		setIsHistoryModalOpen(false);
		setHistoryData([]);
		setHistoryItem(null);
	};

	const historyColumns = [
		{ header: t("gradesAndRates.grades.table.name"), accessor: "name" },
		{ header: t("gradesAndRates.grades.table.code"), accessor: "code" },
		{ header: t("gradesAndRates.grades.table.businessGroup"), accessor: "business_group_name" },
		{ header: t("gradesAndRates.grades.table.status"), accessor: "status" },
	];

	const renderHistoryRates = rates => (
		<div className="space-y-2">
			{rates.map((rate, idx) => (
				<div
					key={rate.id || idx}
					className="flex flex-wrap items-center gap-4 p-2 bg-gray-50 rounded-lg text-sm"
				>
					<span className="font-medium text-gray-700">{rate.rate_type_name || rate.rate_type_code}</span>
					<span className="text-gray-500">{rate.currency}</span>
					<span className="text-gray-900">
						{rate.rate_type_has_range
							? `${parseFloat(rate.min_amount || 0).toLocaleString()} - ${parseFloat(
									rate.max_amount || 0
							  ).toLocaleString()}`
							: parseFloat(rate.fixed_amount || 0).toLocaleString()}
					</span>
					<span
						className={`px-2 py-0.5 rounded-full text-xs ${
							rate.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
						}`}
					>
						{rate.status === "active" ? t("common.active") : t("common.inactive")}
					</span>
				</div>
			))}
		</div>
	);

	const historyCustomActions = [
		{
			title: t("history.viewHistory"),
			icon: <HiClock className="w-5 h-5 text-[#1D7A8C]" />,
			onClick: handleViewHistory,
		},
	];

	// If a grade is selected, show its rates
	if (selectedGrade) {
		return (
			<div className="min-h-screen bg-gray-50">
				<ToastContainer position="top-right" autoClose={3000} />

				<PageHeader
					icon={<HiTrendingUp className="w-8 h-8 text-white mr-3" />}
					title={t("gradesAndRates.title")}
					subtitle={t("gradesAndRates.subtitle")}
				/>

				<div className="p-6">
					<div className="bg-white rounded-2xl shadow-lg p-6">
						{/* Back button and Grade info */}
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-4">
								<button
									onClick={handleBackToGrades}
									className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
								>
									<HiArrowLeft className={`w-5 h-5 text-gray-600 ${isRtl ? "rotate-180" : ""}`} />
								</button>
								<div>
									<h2 className="text-2xl font-bold text-[#1D7A8C]">
										{selectedGrade.name} ({selectedGrade.code})
									</h2>
									<p className="text-sm text-gray-500">
										{t("gradesAndRates.gradeRates.title")} - {selectedGrade.business_group_name}
									</p>
								</div>
							</div>
							<Button
								onClick={handleCreateRate}
								icon={<HiPlus className="w-5 h-5" />}
								title={t("gradesAndRates.gradeRates.createGradeRate")}
								className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
							/>
						</div>

						{/* Rates Table */}
						<Table
							columns={rateColumns}
							data={gradeRates}
							onEdit={handleEditRate}
							onDelete={handleDeleteRateClick}
							emptyMessage={t("gradesAndRates.gradeRates.table.emptyMessage")}
							loading={ratesLoading}
						/>
					</div>
				</div>

				{/* Rate Modal */}
				<SlideUpModal
					isOpen={isRateModalOpen}
					onClose={handleCloseRateModal}
					title={
						editingRate
							? t("gradesAndRates.gradeRates.modal.editTitle")
							: t("gradesAndRates.gradeRates.modal.createTitle")
					}
				>
					<form onSubmit={handleRateSubmit} className="space-y-4 p-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("gradesAndRates.gradeRates.form.rateTypeCode")}
								name="rate_type_code"
								value={rateFormData.rate_type_code}
								onChange={handleRateInputChange}
								error={formErrors.rate_type_code}
								required
								disabled={!!editingRate}
							/>
							<FloatingLabelSelect
								label={t("gradesAndRates.gradeRates.form.currency")}
								name="currency"
								value={rateFormData.currency}
								onChange={handleRateInputChange}
								options={currencyOptions}
								error={formErrors.currency}
								required
							/>
						</div>

						{/* Range type toggle */}
						<div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
							<label className="text-sm font-medium text-gray-700">
								{t("gradesAndRates.gradeRates.form.rateTypeLabel")}:
							</label>
							<div className="flex gap-4">
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="radio"
										name="rateType"
										checked={!isRangeBasedRate}
										onChange={() => setIsRangeBasedRate(false)}
										className="w-4 h-4 text-[#1D7A8C]"
									/>
									<span className="text-sm">{t("gradesAndRates.gradeRates.form.fixedAmount")}</span>
								</label>
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="radio"
										name="rateType"
										checked={isRangeBasedRate}
										onChange={() => setIsRangeBasedRate(true)}
										className="w-4 h-4 text-[#1D7A8C]"
									/>
									<span className="text-sm">{t("gradesAndRates.gradeRates.form.rangeAmount")}</span>
								</label>
							</div>
						</div>

						{isRangeBasedRate ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FloatingLabelInput
									label={t("gradesAndRates.gradeRates.form.minAmount")}
									name="min_amount"
									type="number"
									step="0.01"
									value={rateFormData.min_amount}
									onChange={handleRateInputChange}
									error={formErrors.min_amount}
									required
								/>
								<FloatingLabelInput
									label={t("gradesAndRates.gradeRates.form.maxAmount")}
									name="max_amount"
									type="number"
									step="0.01"
									value={rateFormData.max_amount}
									onChange={handleRateInputChange}
									error={formErrors.max_amount}
									required
								/>
							</div>
						) : (
							<FloatingLabelInput
								label={t("gradesAndRates.gradeRates.form.fixedAmount")}
								name="fixed_amount"
								type="number"
								step="0.01"
								value={rateFormData.fixed_amount}
								onChange={handleRateInputChange}
								error={formErrors.fixed_amount}
								required
							/>
						)}

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("gradesAndRates.form.startDate")}
								name="effective_start_date"
								type="date"
								value={rateFormData.effective_start_date}
								onChange={handleRateInputChange}
							/>
							<FloatingLabelInput
								label={t("gradesAndRates.form.endDate")}
								name="effective_end_date"
								type="date"
								value={rateFormData.effective_end_date}
								onChange={handleRateInputChange}
							/>
						</div>

						<div className="flex justify-end gap-3 pt-4">
							<Button
								type="button"
								onClick={handleCloseRateModal}
								title={t("common.cancel")}
								className="bg-gray-200 hover:bg-gray-300 text-gray-800"
							/>
							<Button
								type="submit"
								disabled={rateCreating || rateUpdating}
								title={
									rateCreating || rateUpdating
										? t("common.saving")
										: editingRate
										? t("gradesAndRates.modal.update")
										: t("gradesAndRates.gradeRates.modal.create")
								}
								className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
							/>
						</div>
					</form>
				</SlideUpModal>

				{/* Delete Confirmation Modal */}
				<ConfirmModal
					isOpen={isDeleteModalOpen}
					onClose={handleCancelDelete}
					onConfirm={handleConfirmDelete}
					title={t("gradesAndRates.deleteModal.title")}
					message={t("gradesAndRates.deleteModal.message", {
						name: itemToDelete?.rate_type_name || itemToDelete?.name,
					})}
					confirmText={t("gradesAndRates.deleteModal.confirm")}
					cancelText={t("gradesAndRates.deleteModal.cancel")}
					variant="danger"
				/>
			</div>
		);
	}

	// Main grades list view
	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer position="top-right" autoClose={3000} />

			<PageHeader
				icon={<HiTrendingUp className="w-8 h-8 text-white mr-3" />}
				title={t("gradesAndRates.title")}
				subtitle={t("gradesAndRates.subtitle")}
			/>

			<div className="p-6">
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold text-[#1D7A8C]">{t("gradesAndRates.grades.title")}</h2>
						<Button
							onClick={handleCreateGrade}
							icon={<HiPlus className="w-5 h-5" />}
							title={t("gradesAndRates.grades.createGrade")}
							className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
						/>
					</div>

					<Table
						columns={gradeColumns}
						data={grades}
						onView={handleViewGradeRates}
						onEdit={handleEditGrade}
						onDelete={handleDeleteGradeClick}
						customActions={historyCustomActions}
						emptyMessage={t("gradesAndRates.grades.table.emptyMessage")}
						loading={gradeLoading}
					/>

					<div className="mt-6">
						<Pagination
							currentPage={gradePage}
							totalCount={gradeCount}
							pageSize={localPageSize}
							onPageChange={handlePageChange}
							onPageSizeChange={handlePageSizeChange}
							hasNext={gradeHasNext}
							hasPrevious={gradeHasPrevious}
						/>
					</div>
				</div>
			</div>

			{/* Grade Modal */}
			<SlideUpModal
				isOpen={isGradeModalOpen}
				onClose={handleCloseGradeModal}
				title={
					editingGrade
						? t("gradesAndRates.grades.modal.editTitle")
						: t("gradesAndRates.grades.modal.createTitle")
				}
			>
				<form onSubmit={handleGradeSubmit} className="space-y-4 p-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("gradesAndRates.grades.form.name")}
							name="name"
							value={gradeFormData.name}
							onChange={handleGradeInputChange}
							error={formErrors.name}
							required
						/>
						<FloatingLabelInput
							label={t("gradesAndRates.grades.form.code")}
							name="code"
							value={gradeFormData.code}
							onChange={handleGradeInputChange}
							disabled={!!editingGrade}
							placeholder={editingGrade ? "" : t("gradesAndRates.grades.form.codeAutoGenerated")}
						/>
					</div>

					<FloatingLabelSelect
						label={t("gradesAndRates.grades.form.businessGroup")}
						name="business_group"
						value={gradeFormData.business_group}
						onChange={handleGradeInputChange}
						options={businessGroupOptions}
						error={formErrors.business_group}
						required={!editingGrade}
						disabled={!!editingGrade}
					/>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("gradesAndRates.form.startDate")}
							name="effective_start_date"
							type="date"
							value={gradeFormData.effective_start_date}
							onChange={handleGradeInputChange}
						/>
						<FloatingLabelInput
							label={t("gradesAndRates.form.endDate")}
							name="effective_end_date"
							type="date"
							value={gradeFormData.effective_end_date}
							onChange={handleGradeInputChange}
						/>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							onClick={handleCloseGradeModal}
							title={t("common.cancel")}
							className="bg-gray-200 hover:bg-gray-300 text-gray-800"
						/>
						<Button
							type="submit"
							disabled={gradeCreating || gradeUpdating}
							title={
								gradeCreating || gradeUpdating
									? t("common.saving")
									: editingGrade
									? t("gradesAndRates.modal.update")
									: t("gradesAndRates.grades.modal.create")
							}
							className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
						/>
					</div>
				</form>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title={t("gradesAndRates.deleteModal.title")}
				message={t("gradesAndRates.deleteModal.message", {
					name: itemToDelete?.name,
				})}
				confirmText={t("gradesAndRates.deleteModal.confirm")}
				cancelText={t("gradesAndRates.deleteModal.cancel")}
				variant="danger"
			/>

			{/* History Modal */}
			<HistoryModal
				isOpen={isHistoryModalOpen}
				onClose={handleCloseHistoryModal}
				title={t("history.title", { name: historyItem?.name || "" })}
				loading={historyLoading}
				data={historyData}
				columns={historyColumns}
				renderRates={renderHistoryRates}
			/>
		</div>
	);
};

export default GradesAndRatesPage;
