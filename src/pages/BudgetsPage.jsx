import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";

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

import api from "../api/axios";
import { parseApiError } from "../utils/errorHandler";
import { fetchSegmentTypes, fetchSegmentValues } from "../store/segmentsSlice";
import { fetchCurrencies } from "../store/currenciesSlice";

import { BiPlus, BiTrash } from "react-icons/bi";
import { HiOutlineCurrencyDollar, HiOutlineEye, HiOutlineBan, HiOutlineCheckCircle } from "react-icons/hi";
import { BsFileEarmarkSpreadsheet } from "react-icons/bs";

// Control level options
const CONTROL_LEVEL_OPTIONS = [
	{ value: "NONE", label: "No Control" },
	{ value: "TRACK_ONLY", label: "Track Only" },
	{ value: "ADVISORY", label: "Advisory" },
	{ value: "ABSOLUTE", label: "Absolute Control" },
];

// Status options for filtering
const STATUS_OPTIONS = [
	{ value: "", label: "All Statuses" },
	{ value: "DRAFT", label: "Draft" },
	{ value: "ACTIVE", label: "Active" },
	{ value: "CLOSED", label: "Closed" },
];

// Initial form state
const FORM_INITIAL_STATE = {
	budget_code: "",
	budget_name: "",
	description: "",
	start_date: "",
	end_date: "",
	currency_id: "",
	default_control_level: "ABSOLUTE",
	notes: "",
	segment_values: [],
};

// Segment Value Row Component
const SegmentValueRow = ({
	index,
	segmentValue,
	segmentTypes,
	segmentValues,
	onUpdate,
	onRemove,
	onSegmentTypeChange,
	t,
}) => {
	const controlLevelOptions = useMemo(
		() =>
			CONTROL_LEVEL_OPTIONS.map(opt => ({
				value: opt.value,
				label: t(`budgets.controlLevels.${opt.value.toLowerCase()}`) || opt.label,
			})),
		[t]
	);

	const segmentTypeOptions = useMemo(
		() => [
			{ value: "", label: t("budgets.form.selectSegmentType") },
			...segmentTypes.map(type => ({
				value: type.id,
				label: type.segment_name,
			})),
		],
		[segmentTypes, t]
	);

	const filteredSegmentValueOptions = useMemo(() => {
		if (!segmentValue.segment_type_id) {
			return [{ value: "", label: t("budgets.form.selectSegmentTypeFirst") }];
		}
		const filtered = segmentValues.filter(sv => sv.segment_type === parseInt(segmentValue.segment_type_id));
		return [
			{ value: "", label: t("budgets.form.selectSegmentValue") },
			...filtered.map(sv => ({
				value: sv.id,
				label: `${sv.code} - ${sv.alias || sv.name || ""}`,
			})),
		];
	}, [segmentValue.segment_type_id, segmentValues, t]);

	return (
		<div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
			<div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
				<FloatingLabelSelect
					label={t("budgets.form.segmentType")}
					value={segmentValue.segment_type_id || ""}
					onChange={e => onSegmentTypeChange(index, e.target.value)}
					options={segmentTypeOptions}
				/>
				<FloatingLabelSelect
					label={t("budgets.form.segmentValue")}
					value={segmentValue.segment_value_id || ""}
					onChange={e => onUpdate(index, "segment_value_id", e.target.value)}
					options={filteredSegmentValueOptions}
					disabled={!segmentValue.segment_type_id}
				/>
				<FloatingLabelSelect
					label={t("budgets.form.controlLevel")}
					value={segmentValue.control_level || "ABSOLUTE"}
					onChange={e => onUpdate(index, "control_level", e.target.value)}
					options={controlLevelOptions}
				/>
				<FloatingLabelInput
					label={t("budgets.form.notes")}
					value={segmentValue.notes || ""}
					onChange={e => onUpdate(index, "notes", e.target.value)}
				/>
			</div>
			<button
				type="button"
				onClick={() => onRemove(index)}
				className="mt-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
			>
				<BiTrash className="w-5 h-5" />
			</button>
		</div>
	);
};

const BudgetsPage = () => {
	const { t, i18n } = useTranslation();
	usePageTitle(t("budgets.title"));
	const isRtl = i18n.dir() === "rtl";
	const navigate = useNavigate();
	const dispatch = useDispatch();

	// Redux state
	const { types: segmentTypes, values: segmentValues } = useSelector(state => state.segments);
	const { currencies } = useSelector(state => state.currencies);

	// State
	const [budgets, setBudgets] = useState([]);
	const [loading, setLoading] = useState(false);
	const [actionLoading, setActionLoading] = useState(false);
	const [count, setCount] = useState(0);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [hasNext, setHasNext] = useState(false);
	const [hasPrevious, setHasPrevious] = useState(false);

	// Filter state
	const [statusFilter, setStatusFilter] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	// Modal state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [formData, setFormData] = useState(FORM_INITIAL_STATE);
	const [formErrors, setFormErrors] = useState({});

	// Delete/Action modals
	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
	const [budgetToDelete, setBudgetToDelete] = useState(null);
	const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
	const [budgetToClose, setBudgetToClose] = useState(null);
	const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);
	const [budgetToDeactivate, setBudgetToDeactivate] = useState(null);

	// Remove local state - now using Redux
	// Dropdown data is managed by Redux store

	// Fetch budgets
	const fetchBudgets = useCallback(async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", pageSize);
			if (statusFilter) params.append("status", statusFilter);
			if (searchTerm) params.append("search", searchTerm);

			const response = await api.get(`/finance/budget/budget-headers/?${params.toString()}`);
			const data = response.data.data;
			setBudgets(data.results || []);
			setCount(data.count || 0);
			setHasNext(!!data.next);
			setHasPrevious(!!data.previous);
		} catch (error) {
			toast.error(parseApiError(error) || t("budgets.messages.fetchError"));
		} finally {
			setLoading(false);
		}
	}, [page, pageSize, statusFilter, searchTerm, t]);

	// Fetch dropdown data from Redux
	const fetchDropdownData = useCallback(() => {
		dispatch(fetchCurrencies({ page_size: 100, is_active: true }));
		dispatch(fetchSegmentTypes());
		dispatch(fetchSegmentValues({ page_size: 1000 }));
	}, [dispatch]);

	useEffect(() => {
		fetchBudgets();
	}, [fetchBudgets]);

	useEffect(() => {
		fetchDropdownData();
	}, [fetchDropdownData]);

	// Currency options
	const currencyOptions = useMemo(
		() => [
			{ value: "", label: t("budgets.form.selectCurrency") },
			...currencies.map(c => ({
				value: c.id,
				label: `${c.code} - ${c.name}`,
			})),
		],
		[currencies, t]
	);

	// Control level options for default
	const defaultControlLevelOptions = useMemo(
		() =>
			CONTROL_LEVEL_OPTIONS.map(opt => ({
				value: opt.value,
				label: t(`budgets.controlLevels.${opt.value.toLowerCase()}`) || opt.label,
			})),
		[t]
	);

	// Table columns
	const columns = useMemo(
		() => [
			{
				header: t("budgets.table.budgetCode"),
				accessor: "budget_code",
				render: value => <span className="font-mono font-semibold text-gray-900">{value}</span>,
			},
			{
				header: t("budgets.table.budgetName"),
				accessor: "budget_name",
				render: value => <span className="text-gray-900">{value}</span>,
			},
			{
				header: t("budgets.table.period"),
				accessor: "start_date",
				render: (value, row) => (
					<span className="text-gray-700 text-sm">
						{value} → {row.end_date}
					</span>
				),
			},
			{
				header: t("budgets.table.currency"),
				accessor: "currency_code",
				width: "100px",
				render: value => <span className="font-mono text-gray-700">{value}</span>,
			},
			{
				header: t("budgets.table.totalBudget"),
				accessor: "total_budget",
				render: value => (
					<span className="font-semibold text-green-600">
						{parseFloat(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
					</span>
				),
			},
			{
				header: t("budgets.table.utilization"),
				accessor: "utilization_percentage",
				width: "120px",
				render: value => {
					const percentage = parseFloat(value || 0);
					const color =
						percentage > 90
							? "text-red-600 bg-red-100"
							: percentage > 70
								? "text-yellow-600 bg-yellow-100"
								: "text-green-600 bg-green-100";
					return (
						<span
							className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
						>
							{percentage.toFixed(1)}%
						</span>
					);
				},
			},
			{
				header: t("budgets.table.status"),
				accessor: "status",
				width: "120px",
				render: value => {
					const statusColors = {
						DRAFT: "bg-gray-100 text-gray-800",
						ACTIVE: "bg-green-100 text-green-800",
						CLOSED: "bg-red-100 text-red-800",
					};
					return (
						<span
							className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[value] || "bg-gray-100 text-gray-800"}`}
						>
							{t(`budgets.statuses.${value?.toLowerCase()}`) || value}
						</span>
					);
				},
			},
			{
				header: t("budgets.table.segments"),
				accessor: "segment_count",
				width: "100px",
				render: value => (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
						{value || 0}
					</span>
				),
			},
		],
		[t]
	);

	// Handlers
	const handlePageChange = useCallback(newPage => {
		setPage(newPage);
	}, []);

	const handlePageSizeChange = useCallback(newPageSize => {
		setPageSize(newPageSize);
		setPage(1);
	}, []);

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (formErrors[field]) {
			setFormErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const handleAddSegmentValue = () => {
		setFormData(prev => ({
			...prev,
			segment_values: [
				...prev.segment_values,
				{
					segment_type_id: "",
					segment_value_id: "",
					control_level: "ABSOLUTE",
					notes: "",
				},
			],
		}));
	};

	const handleUpdateSegmentValue = (index, field, value) => {
		setFormData(prev => {
			const newSegments = [...prev.segment_values];
			newSegments[index] = { ...newSegments[index], [field]: value };
			return { ...prev, segment_values: newSegments };
		});
	};

	const handleSegmentTypeChange = (index, typeId) => {
		setFormData(prev => {
			const newSegments = [...prev.segment_values];
			newSegments[index] = {
				...newSegments[index],
				segment_type_id: typeId,
				segment_value_id: "", // Reset segment value when type changes
			};
			return { ...prev, segment_values: newSegments };
		});
	};

	const handleRemoveSegmentValue = index => {
		setFormData(prev => ({
			...prev,
			segment_values: prev.segment_values.filter((_, i) => i !== index),
		}));
	};

	const validateForm = () => {
		const errors = {};
		if (!formData.budget_code?.trim()) {
			errors.budget_code = t("budgets.validation.codeRequired");
		}
		if (!formData.budget_name?.trim()) {
			errors.budget_name = t("budgets.validation.nameRequired");
		}
		if (!formData.start_date) {
			errors.start_date = t("budgets.validation.startDateRequired");
		}
		if (!formData.end_date) {
			errors.end_date = t("budgets.validation.endDateRequired");
		}
		if (!formData.currency_id) {
			errors.currency_id = t("budgets.validation.currencyRequired");
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleOpenModal = () => {
		setFormData(FORM_INITIAL_STATE);
		setFormErrors({});
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setFormData(FORM_INITIAL_STATE);
		setFormErrors({});
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		setActionLoading(true);
		try {
			const submitData = {
				budget_code: formData.budget_code.trim(),
				budget_name: formData.budget_name.trim(),
				description: formData.description.trim() || null,
				start_date: formData.start_date,
				end_date: formData.end_date,
				currency_id: parseInt(formData.currency_id),
				default_control_level: formData.default_control_level,
				notes: formData.notes.trim() || null,
				segment_values: formData.segment_values
					.filter(sv => sv.segment_value_id)
					.map(sv => ({
						segment_value_id: parseInt(sv.segment_value_id),
						control_level: sv.control_level,
						notes: sv.notes || null,
					})),
			};

			await api.post("/finance/budget/budget-headers/", submitData);
			toast.success(t("budgets.messages.createSuccess"));
			handleCloseModal();
			fetchBudgets();
		} catch (error) {
			toast.error(parseApiError(error) || t("budgets.messages.createError"));
		} finally {
			setActionLoading(false);
		}
	};

	const handleView = row => {
		const budget = row.rawData || row;
		navigate(`/budgets/${budget.id}`);
	};

	const handleDeleteClick = row => {
		const budget = row.rawData || row;
		setBudgetToDelete(budget);
		setConfirmDeleteOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!budgetToDelete) return;
		setActionLoading(true);
		try {
			await api.delete(`/finance/budget/budget-headers/${budgetToDelete.id}/`);
			toast.success(t("budgets.messages.deleteSuccess"));
			setConfirmDeleteOpen(false);
			setBudgetToDelete(null);
			fetchBudgets();
		} catch (error) {
			toast.error(parseApiError(error) || t("budgets.messages.deleteError"));
		} finally {
			setActionLoading(false);
		}
	};

	const handleCloseClick = row => {
		const budget = row.rawData || row;
		setBudgetToClose(budget);
		setConfirmCloseOpen(true);
	};

	const handleConfirmClose = async () => {
		if (!budgetToClose) return;
		setActionLoading(true);
		try {
			await api.post(`/finance/budget/budget-headers/${budgetToClose.id}/close/`);
			toast.success(t("budgets.messages.closeSuccess"));
			setConfirmCloseOpen(false);
			setBudgetToClose(null);
			fetchBudgets();
		} catch (error) {
			toast.error(parseApiError(error) || t("budgets.messages.closeError"));
		} finally {
			setActionLoading(false);
		}
	};

	const handleDeactivateClick = row => {
		const budget = row.rawData || row;
		setBudgetToDeactivate(budget);
		setConfirmDeactivateOpen(true);
	};

	const handleConfirmDeactivate = async () => {
		if (!budgetToDeactivate) return;
		setActionLoading(true);
		try {
			await api.post(`/finance/budget/budget-headers/${budgetToDeactivate.id}/deactivate/`);
			toast.success(t("budgets.messages.deactivateSuccess"));
			setConfirmDeactivateOpen(false);
			setBudgetToDeactivate(null);
			fetchBudgets();
		} catch (error) {
			toast.error(parseApiError(error) || t("budgets.messages.deactivateError"));
		} finally {
			setActionLoading(false);
		}
	};

	// Custom actions for table
	const customActions = [
		{
			title: t("budgets.actions.close"),
			icon: <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />,
			onClick: handleCloseClick,
		},
		{
			title: t("budgets.actions.deactivate"),
			icon: <HiOutlineBan className="w-5 h-5 text-yellow-600" />,
			onClick: handleDeactivateClick,
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
				title={t("budgets.title")}
				subtitle={t("budgets.subtitle")}
				icon={<HiOutlineCurrencyDollar className="w-8 h-8 text-white" />}
			/>

			<div className="w-[95%] mx-auto px-6 py-8">
				{/* Filters */}
				<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<FloatingLabelInput
							label={t("budgets.filters.search")}
							value={searchTerm}
							onChange={e => {
								setSearchTerm(e.target.value);
								setPage(1);
							}}
							placeholder={t("budgets.filters.searchPlaceholder")}
						/>
						<FloatingLabelSelect
							label={t("budgets.filters.status")}
							value={statusFilter}
							onChange={e => {
								setStatusFilter(e.target.value);
								setPage(1);
							}}
							options={[
								{ value: "", label: t("budgets.filters.allStatuses") },
								...STATUS_OPTIONS.slice(1).map(opt => ({
									value: opt.value,
									label: t(`budgets.statuses.${opt.value.toLowerCase()}`) || opt.label,
								})),
							]}
						/>
						<div className="flex items-center">
							<Button
								onClick={handleOpenModal}
								title={t("budgets.createBudget")}
								icon={<BiPlus className="text-xl" />}
								className="bg-[#28819C] hover:bg-[#206b85] text-white w-full"
							/>
						</div>
					</div>
				</div>

				{/* Table */}
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold text-[#28819C]">{t("budgets.listTitle")}</h2>
					</div>

					{loading ? (
						<LoadingSpan />
					) : (
						<>
							<Table
								columns={columns}
								data={budgets}
								onView={handleView}
								onDelete={handleDeleteClick}
								customActions={customActions}
								emptyMessage={t("budgets.table.emptyMessage")}
							/>
							<Pagination
								currentPage={page}
								totalCount={count}
								pageSize={pageSize}
								onPageChange={handlePageChange}
								onPageSizeChange={handlePageSizeChange}
								hasNext={hasNext}
								hasPrevious={hasPrevious}
							/>
						</>
					)}
				</div>
			</div>

			{/* Create Budget Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={t("budgets.modal.createTitle")}
				maxWidth="800px"
			>
				<div className="p-6 space-y-6">
					{/* Basic Info */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("budgets.form.budgetCode")}
							value={formData.budget_code}
							onChange={e => handleInputChange("budget_code", e.target.value)}
							error={formErrors.budget_code}
							required
						/>
						<FloatingLabelInput
							label={t("budgets.form.budgetName")}
							value={formData.budget_name}
							onChange={e => handleInputChange("budget_name", e.target.value)}
							error={formErrors.budget_name}
							required
						/>
					</div>

					<FloatingLabelTextarea
						label={t("budgets.form.description")}
						value={formData.description}
						onChange={e => handleInputChange("description", e.target.value)}
						rows={2}
					/>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<FloatingLabelInput
							label={t("budgets.form.startDate")}
							type="date"
							value={formData.start_date}
							onChange={e => handleInputChange("start_date", e.target.value)}
							error={formErrors.start_date}
							required
						/>
						<FloatingLabelInput
							label={t("budgets.form.endDate")}
							type="date"
							value={formData.end_date}
							onChange={e => handleInputChange("end_date", e.target.value)}
							error={formErrors.end_date}
							required
						/>
						<FloatingLabelSelect
							label={t("budgets.form.currency")}
							value={formData.currency_id}
							onChange={e => handleInputChange("currency_id", e.target.value)}
							options={currencyOptions}
							error={formErrors.currency_id}
							required
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelSelect
							label={t("budgets.form.defaultControlLevel")}
							value={formData.default_control_level}
							onChange={e => handleInputChange("default_control_level", e.target.value)}
							options={defaultControlLevelOptions}
						/>
						<FloatingLabelInput
							label={t("budgets.form.notes")}
							value={formData.notes}
							onChange={e => handleInputChange("notes", e.target.value)}
						/>
					</div>

					{/* Segment Values Section */}
					<div className="border-t pt-6">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold text-gray-900">{t("budgets.form.segmentValues")}</h3>
							<Button
								onClick={handleAddSegmentValue}
								title={t("budgets.form.addSegment")}
								icon={<BiPlus className="text-lg" />}
								className="bg-[#28819C] hover:bg-[#206b85] text-white"
							/>
						</div>

						{formData.segment_values.length === 0 ? (
							<p className="text-gray-500 text-center py-4">{t("budgets.form.noSegments")}</p>
						) : (
							<div className="space-y-3">
								{formData.segment_values.map((sv, index) => (
									<SegmentValueRow
										key={index}
										index={index}
										segmentValue={sv}
										segmentTypes={segmentTypes}
										segmentValues={segmentValues}
										onUpdate={handleUpdateSegmentValue}
										onRemove={handleRemoveSegmentValue}
										onSegmentTypeChange={handleSegmentTypeChange}
										t={t}
									/>
								))}
							</div>
						)}
					</div>

					{/* Actions */}
					<div className="flex justify-end gap-3 pt-4 border-t">
						<Button
							onClick={handleCloseModal}
							title={t("common.cancel")}
							className="bg-gray-200 hover:bg-gray-300 text-gray-800"
						/>
						<Button
							onClick={handleSubmit}
							disabled={actionLoading}
							title={actionLoading ? t("common.saving") : t("common.create")}
							className="bg-[#28819C] hover:bg-[#206b85] text-white"
						/>
					</div>
				</div>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={confirmDeleteOpen}
				onClose={() => {
					setConfirmDeleteOpen(false);
					setBudgetToDelete(null);
				}}
				onConfirm={handleConfirmDelete}
				title={t("budgets.deleteModal.title")}
				message={t("budgets.deleteModal.message", { code: budgetToDelete?.budget_code })}
				confirmText={actionLoading ? t("common.deleting") : t("common.delete")}
				cancelText={t("common.cancel")}
				variant="danger"
				loading={actionLoading}
			/>

			{/* Close Confirmation Modal */}
			<ConfirmModal
				isOpen={confirmCloseOpen}
				onClose={() => {
					setConfirmCloseOpen(false);
					setBudgetToClose(null);
				}}
				onConfirm={handleConfirmClose}
				title={t("budgets.closeModal.title")}
				message={t("budgets.closeModal.message", { code: budgetToClose?.budget_code })}
				confirmText={actionLoading ? t("common.processing") : t("budgets.actions.close")}
				cancelText={t("common.cancel")}
				variant="warning"
				loading={actionLoading}
			/>

			{/* Deactivate Confirmation Modal */}
			<ConfirmModal
				isOpen={confirmDeactivateOpen}
				onClose={() => {
					setConfirmDeactivateOpen(false);
					setBudgetToDeactivate(null);
				}}
				onConfirm={handleConfirmDeactivate}
				title={t("budgets.deactivateModal.title")}
				message={t("budgets.deactivateModal.message", { code: budgetToDeactivate?.budget_code })}
				confirmText={actionLoading ? t("common.processing") : t("budgets.actions.deactivate")}
				cancelText={t("common.cancel")}
				variant="warning"
				loading={actionLoading}
			/>
		</div>
	);
};

export default BudgetsPage;
