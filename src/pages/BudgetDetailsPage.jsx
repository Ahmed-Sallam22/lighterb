import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";

import PageHeader from "../components/shared/PageHeader";
import Card from "../components/shared/Card";
import Tabs from "../components/shared/Tabs";
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

import { BiPlus, BiArrowBack, BiTrash, BiDownload, BiUpload, BiEdit } from "react-icons/bi";
import { HiOutlineCurrencyDollar, HiOutlineDocumentText, HiOutlineCollection } from "react-icons/hi";
import { BsFileEarmarkSpreadsheet, BsUpload, BsCalendar, BsCurrencyDollar, BsCheckCircle } from "react-icons/bs";
import { FiInfo, FiLayers, FiPercent } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

// Control level options
const CONTROL_LEVEL_OPTIONS = [
	{ value: "NONE", label: "No Control" },
	{ value: "TRACK_ONLY", label: "Track Only" },
	{ value: "ADVISORY", label: "Advisory" },
	{ value: "ABSOLUTE", label: "Absolute Control" },
];

// Add Segment form initial state
const SEGMENT_FORM_INITIAL = {
	segment_type_id: "",
	segment_value_id: "",
	control_level: "ABSOLUTE",
	notes: "",
};

const BudgetDetailsPage = () => {
	const { t, i18n } = useTranslation();
	usePageTitle(t("budgetDetails.title"));
	const isRtl = i18n.dir() === "rtl";
	const navigate = useNavigate();
	const { budgetId } = useParams();
	const fileInputRef = useRef(null);
	const dispatch = useDispatch();

	// Redux state
	const { types: segmentTypes, values: segmentValues } = useSelector(state => state.segments);

	// Budget data state
	const [budget, setBudget] = useState(null);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);

	// Segments state
	const [segments, setSegments] = useState([]);
	const [segmentsLoading, setSegmentsLoading] = useState(false);
	const [segmentsCount, setSegmentsCount] = useState(0);
	const [segmentsPage, setSegmentsPage] = useState(1);
	const [segmentsPageSize, setSegmentsPageSize] = useState(10);
	const [segmentsHasNext, setSegmentsHasNext] = useState(false);
	const [segmentsHasPrevious, setSegmentsHasPrevious] = useState(false);

	// Tab state
	const [activeTab, setActiveTab] = useState("info");

	// Add segment modal
	const [isAddSegmentModalOpen, setIsAddSegmentModalOpen] = useState(false);
	const [segmentFormData, setSegmentFormData] = useState(SEGMENT_FORM_INITIAL);
	const [segmentFormErrors, setSegmentFormErrors] = useState({});

	// Edit segment modal
	const [isEditSegmentModalOpen, setIsEditSegmentModalOpen] = useState(false);
	const [segmentToEdit, setSegmentToEdit] = useState(null);
	const [editSegmentFormData, setEditSegmentFormData] = useState({});

	// Delete segment modal
	const [confirmDeleteSegmentOpen, setConfirmDeleteSegmentOpen] = useState(false);
	const [segmentToDelete, setSegmentToDelete] = useState(null);

	// Edit budget modal
	const [isEditBudgetModalOpen, setIsEditBudgetModalOpen] = useState(false);
	const [editBudgetFormData, setEditBudgetFormData] = useState({});
	const [editBudgetFormErrors, setEditBudgetFormErrors] = useState({});

	// Activate budget confirmation
	const [confirmActivateOpen, setConfirmActivateOpen] = useState(false);

	// Import modal
	const [isImportModalOpen, setIsImportModalOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [importLoading, setImportLoading] = useState(false);

	// Download template loading
	const [downloadLoading, setDownloadLoading] = useState(false);

	// Remove local state - now using Redux
	// Dropdown data is managed by Redux store

	// Fetch budget details
	const fetchBudget = useCallback(async () => {
		setLoading(true);
		try {
			const response = await api.get(`/finance/budget/budget-headers/${budgetId}/`);
			setBudget(response.data.data);
		} catch (error) {
			toast.error(parseApiError(error, t) || t("budgetDetails.messages.fetchError"));
		} finally {
			setLoading(false);
		}
	}, [budgetId, t]);

	// Fetch budget segments
	const fetchSegments = useCallback(async () => {
		setSegmentsLoading(true);
		try {
			const params = new URLSearchParams();
			params.append("page", segmentsPage);
			params.append("page_size", segmentsPageSize);

			const response = await api.get(`/finance/budget/budget-headers/${budgetId}/segments/?${params.toString()}`);
			const data = response.data.data;
			setSegments(data.results || []);
			setSegmentsCount(data.count || 0);
			setSegmentsHasNext(!!data.next);
			setSegmentsHasPrevious(!!data.previous);
		} catch (error) {
			toast.error(parseApiError(error, t) || t("budgetDetails.messages.fetchSegmentsError"));
		} finally {
			setSegmentsLoading(false);
		}
	}, [budgetId, segmentsPage, segmentsPageSize, t]);

	// Fetch dropdown data from Redux
	const fetchDropdownData = useCallback(() => {
		dispatch(fetchSegmentTypes());
		dispatch(fetchSegmentValues({ page_size: 1000 }));
	}, [dispatch]);

	useEffect(() => {
		if (budgetId) {
			fetchBudget();
			fetchDropdownData();
		}
	}, [budgetId, fetchBudget, fetchDropdownData]);

	useEffect(() => {
		if (budgetId && activeTab === "segments") {
			fetchSegments();
		}
	}, [budgetId, activeTab, fetchSegments]);

	// Tabs configuration
	const tabs = useMemo(
		() => [
			{
				id: "info",
				label: t("budgetDetails.tabs.info"),
				count: null,
			},
			{
				id: "segments",
				label: t("budgetDetails.tabs.segments"),
				count: segmentsCount || budget?.segment_values?.length || 0,
			},
		],
		[t, segmentsCount, budget]
	);

	// Segment type options
	const segmentTypeOptions = useMemo(
		() => [
			{ value: "", label: t("budgetDetails.form.selectSegmentType") },
			...segmentTypes.map(type => ({
				value: type.id,
				label: type.segment_name || type.name || "",
			})),
		],
		[segmentTypes, t]
	);

	// Filtered segment value options based on selected type
	const filteredSegmentValueOptions = useMemo(() => {
		if (!segmentFormData.segment_type_id) {
			return [{ value: "", label: t("budgetDetails.form.selectSegmentTypeFirst") }];
		}
		const filtered = segmentValues.filter(sv => sv.segment_type === parseInt(segmentFormData.segment_type_id));
		return [
			{ value: "", label: t("budgetDetails.form.selectSegmentValue") },
			...filtered.map(sv => ({
				value: sv.id,
				label: `${sv.code} - ${sv.alias || sv.name || ""}`,
			})),
		];
	}, [segmentFormData.segment_type_id, segmentValues, t]);

	// Control level options
	const controlLevelOptions = useMemo(
		() =>
			CONTROL_LEVEL_OPTIONS.map(opt => ({
				value: opt.value,
				label: t(`budgets.controlLevels.${opt.value.toLowerCase()}`) || opt.label,
			})),
		[t]
	);

	// Segments table columns
	const segmentColumns = useMemo(
		() => [
			{
				header: t("budgetDetails.segmentsTable.segmentCode"),
				accessor: "segment_value_code",
				render: value => <span className="font-mono font-semibold text-gray-900">{value}</span>,
			},
			{
				header: t("budgetDetails.segmentsTable.segmentName"),
				accessor: "segment_value_name",
				render: value => <span className="text-gray-900">{value}</span>,
			},
			{
				header: t("budgetDetails.segmentsTable.segmentType"),
				accessor: "segment_type_name",
				render: value => (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
						{value}
					</span>
				),
			},
			{
				header: t("budgetDetails.segmentsTable.controlLevel"),
				accessor: "control_level",
				render: value => {
					const colors = {
						NONE: "bg-gray-100 text-gray-800",
						TRACK_ONLY: "bg-blue-100 text-blue-800",
						ADVISORY: "bg-yellow-100 text-yellow-800",
						ABSOLUTE: "bg-red-100 text-red-800",
					};
					return (
						<span
							className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[value] || "bg-gray-100 text-gray-800"}`}
						>
							{t(`budgets.controlLevels.${value?.toLowerCase()}`) || value}
						</span>
					);
				},
			},
			{
				header: t("budgetDetails.segmentsTable.hasBudgetAmount"),
				accessor: "has_budget_amount",
				width: "120px",
				render: value => (
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
					>
						{value ? t("common.yes") : t("common.no")}
					</span>
				),
			},
			{
				header: t("budgetDetails.segmentsTable.budgetAmount"),
				accessor: "budget_amount_details",
				render: value => (
					<span className="font-semibold text-green-600">
						{value?.total_budget
							? parseFloat(value.total_budget).toLocaleString(undefined, { minimumFractionDigits: 2 })
							: "-"}
					</span>
				),
			},
			{
				header: t("budgetDetails.segmentsTable.available"),
				accessor: "budget_amount_details",
				render: value => (
					<span className="font-semibold text-blue-600">
						{value?.available
							? parseFloat(value.available).toLocaleString(undefined, { minimumFractionDigits: 2 })
							: "-"}
					</span>
				),
			},
			{
				header: t("budgetDetails.segmentsTable.utilization"),
				accessor: "budget_amount_details",
				width: "100px",
				render: value => {
					if (!value?.utilization_percentage) return <span className="text-gray-400">-</span>;
					const percentage = parseFloat(value.utilization_percentage);
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
		],
		[t]
	);

	// Handlers
	const handleGoBack = () => {
		navigate("/budgets");
	};

	const handleSegmentsPageChange = useCallback(newPage => {
		setSegmentsPage(newPage);
	}, []);

	const handleSegmentsPageSizeChange = useCallback(newPageSize => {
		setSegmentsPageSize(newPageSize);
		setSegmentsPage(1);
	}, []);

	// Add segment handlers
	const handleOpenAddSegmentModal = () => {
		setSegmentFormData(SEGMENT_FORM_INITIAL);
		setSegmentFormErrors({});
		setIsAddSegmentModalOpen(true);
	};

	const handleCloseAddSegmentModal = () => {
		setIsAddSegmentModalOpen(false);
		setSegmentFormData(SEGMENT_FORM_INITIAL);
		setSegmentFormErrors({});
	};

	const handleSegmentFormChange = (field, value) => {
		setSegmentFormData(prev => ({ ...prev, [field]: value }));
		if (segmentFormErrors[field]) {
			setSegmentFormErrors(prev => ({ ...prev, [field]: "" }));
		}
		// Reset segment_value_id when segment_type_id changes
		if (field === "segment_type_id") {
			setSegmentFormData(prev => ({ ...prev, segment_value_id: "" }));
		}
	};

	const validateSegmentForm = () => {
		const errors = {};
		if (!segmentFormData.segment_value_id) {
			errors.segment_value_id = t("budgetDetails.validation.segmentValueRequired");
		}
		setSegmentFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmitSegment = async () => {
		if (!validateSegmentForm()) return;

		setActionLoading(true);
		try {
			const submitData = {
				segment_value_id: parseInt(segmentFormData.segment_value_id),
				control_level: segmentFormData.control_level,
				notes: segmentFormData.notes || null,
			};

			await api.post(`/finance/budget/budget-headers/${budgetId}/segments/`, submitData);
			toast.success(t("budgetDetails.messages.addSegmentSuccess"));
			handleCloseAddSegmentModal();
			fetchSegments();
			fetchBudget(); // Refresh budget data to update counts
		} catch (error) {
			toast.error(parseApiError(error, t) || t("budgetDetails.messages.addSegmentError"));
		} finally {
			setActionLoading(false);
		}
	};

	// Delete segment handlers
	const handleDeleteSegmentClick = row => {
		const segment = row.rawData || row;
		setSegmentToDelete(segment);
		setConfirmDeleteSegmentOpen(true);
	};

	const handleConfirmDeleteSegment = async () => {
		if (!segmentToDelete) return;
		setActionLoading(true);
		try {
			await api.delete(`/finance/budget/budget-headers/${budgetId}/segments/${segmentToDelete.id}/`);
			toast.success(t("budgetDetails.messages.deleteSegmentSuccess"));
			setConfirmDeleteSegmentOpen(false);
			setSegmentToDelete(null);
			fetchSegments();
			fetchBudget();
		} catch (error) {
			toast.error(parseApiError(error, t) || t("budgetDetails.messages.deleteSegmentError"));
		} finally {
			setActionLoading(false);
		}
	};

	// Edit budget modal handlers
	const handleOpenEditBudgetModal = () => {
		if (budget?.status !== "DRAFT") {
			toast.warning(t("budgetDetails.messages.cannotEditNonDraft"));
			return;
		}
		setEditBudgetFormData({
			budget_name: budget.budget_name || "",
			description: budget.description || "",
			start_date: budget.start_date || "",
			end_date: budget.end_date || "",
			default_control_level: budget.default_control_level || "ABSOLUTE",
			notes: budget.notes || "",
		});
		setEditBudgetFormErrors({});
		setIsEditBudgetModalOpen(true);
	};

	const handleCloseEditBudgetModal = () => {
		setIsEditBudgetModalOpen(false);
		setEditBudgetFormData({});
		setEditBudgetFormErrors({});
	};

	const handleEditBudgetFormChange = (field, value) => {
		setEditBudgetFormData(prev => ({ ...prev, [field]: value }));
		if (editBudgetFormErrors[field]) {
			setEditBudgetFormErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const validateEditBudgetForm = () => {
		const errors = {};
		if (!editBudgetFormData.budget_name?.trim()) {
			errors.budget_name = t("budgets.validation.budgetNameRequired");
		}
		if (!editBudgetFormData.start_date) {
			errors.start_date = t("budgets.validation.startDateRequired");
		}
		if (!editBudgetFormData.end_date) {
			errors.end_date = t("budgets.validation.endDateRequired");
		}
		if (editBudgetFormData.start_date && editBudgetFormData.end_date) {
			if (new Date(editBudgetFormData.end_date) <= new Date(editBudgetFormData.start_date)) {
				errors.end_date = t("budgets.validation.endDateAfterStart");
			}
		}
		setEditBudgetFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmitEditBudget = async () => {
		if (!validateEditBudgetForm()) return;

		setActionLoading(true);
		try {
			const submitData = {
				budget_name: editBudgetFormData.budget_name,
				description: editBudgetFormData.description || null,
				start_date: editBudgetFormData.start_date,
				end_date: editBudgetFormData.end_date,
				default_control_level: editBudgetFormData.default_control_level,
				notes: editBudgetFormData.notes || null,
			};

			await api.patch(`/finance/budget/budget-headers/${budgetId}/`, submitData);
			toast.success(t("budgetDetails.messages.updateBudgetSuccess"));
			handleCloseEditBudgetModal();
			fetchBudget();
		} catch (error) {
			toast.error(parseApiError(error, t) || t("budgetDetails.messages.updateBudgetError"));
		} finally {
			setActionLoading(false);
		}
	};

	// Edit segment modal handlers
	const handleOpenEditSegmentModal = row => {
		const segment = row.rawData || row;
		if (budget?.status === "CLOSED") {
			toast.warning(t("budgetDetails.messages.cannotEditClosedBudget"));
			return;
		}
		setSegmentToEdit(segment);
		setEditSegmentFormData({
			control_level: segment.control_level || "ABSOLUTE",
			notes: segment.notes || "",
			is_active: segment.is_active !== false,
		});
		setIsEditSegmentModalOpen(true);
	};

	const handleCloseEditSegmentModal = () => {
		setIsEditSegmentModalOpen(false);
		setSegmentToEdit(null);
		setEditSegmentFormData({});
	};

	const handleEditSegmentFormChange = (field, value) => {
		setEditSegmentFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSubmitEditSegment = async () => {
		if (!segmentToEdit) return;

		setActionLoading(true);
		try {
			const submitData = {
				control_level: editSegmentFormData.control_level,
				notes: editSegmentFormData.notes || null,
				is_active: editSegmentFormData.is_active,
			};

			await api.patch(`/finance/budget/budget-headers/${budgetId}/segments/${segmentToEdit.id}/`, submitData);
			toast.success(t("budgetDetails.messages.updateSegmentSuccess"));
			handleCloseEditSegmentModal();
			fetchSegments();
			fetchBudget();
		} catch (error) {
			toast.error(parseApiError(error, t) || t("budgetDetails.messages.updateSegmentError"));
		} finally {
			setActionLoading(false);
		}
	};

	// Activate budget handlers
	const handleOpenActivateConfirm = () => {
		if (budget?.status !== "DRAFT") {
			toast.warning(t("budgetDetails.messages.cannotActivateNonDraft"));
			return;
		}
		setConfirmActivateOpen(true);
	};

	const handleConfirmActivate = async () => {
		setActionLoading(true);
		try {
			// You can get the user ID from auth context if available
			// For now, using a placeholder - adjust based on your auth implementation
			const submitData = {
				activated_by: 1, // Replace with actual user ID from auth context
			};

			await api.post(`/finance/budget/budget-headers/${budgetId}/activate/`, submitData);
			toast.success(t("budgetDetails.messages.activateSuccess"));
			setConfirmActivateOpen(false);
			fetchBudget();
		} catch (error) {
			toast.error(parseApiError(error, t) || t("budgetDetails.messages.activateError"));
		} finally {
			setActionLoading(false);
		}
	};

	// Download template handler
	const handleDownloadTemplate = async () => {
		setDownloadLoading(true);
		try {
			const response = await api.get(`/finance/budget/budget-headers/${budgetId}/template/`, {
				responseType: "blob",
			});

			// Create download link
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", `budget_template_${budget?.budget_code || budgetId}.xlsx`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);

			toast.success(t("budgetDetails.messages.downloadSuccess"));
		} catch (error) {
			toast.error(parseApiError(error, t) || t("budgetDetails.messages.downloadError"));
		} finally {
			setDownloadLoading(false);
		}
	};

	// Import handlers
	const handleOpenImportModal = () => {
		setSelectedFile(null);
		setIsImportModalOpen(true);
	};

	const handleCloseImportModal = () => {
		setIsImportModalOpen(false);
		setSelectedFile(null);
	};

	const handleFileSelect = e => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file type
			const validTypes = [
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"application/vnd.ms-excel",
			];
			if (!validTypes.includes(file.type) && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
				toast.error(t("budgetDetails.messages.invalidFileType"));
				return;
			}
			setSelectedFile(file);
		}
	};

	const handleImport = async () => {
		if (!selectedFile) return;

		setImportLoading(true);
		try {
			const formData = new FormData();
			formData.append("file", selectedFile);

			await api.post(`/finance/budget/budget-headers/${budgetId}/import/`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			toast.success(t("budgetDetails.messages.importSuccess"));
			handleCloseImportModal();
			fetchBudget();
			fetchSegments();
		} catch (error) {
			toast.error(parseApiError(error, t) || t("budgetDetails.messages.importError"));
		} finally {
			setImportLoading(false);
		}
	};

	// Format date helper
	const formatDate = dateString => {
		if (!dateString) return "-";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Format currency helper
	const formatCurrency = (value, currencyCode) => {
		const num = parseFloat(value || 0);
		return `${num.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currencyCode || ""}`;
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<LoadingSpan />
			</div>
		);
	}

	if (!budget) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<p className="text-gray-500 text-lg">{t("budgetDetails.notFound")}</p>
					<Button
						onClick={handleGoBack}
						title={t("budgetDetails.backToBudgets")}
						icon={<BiArrowBack className="text-lg" />}
						className="mt-4 bg-[#28819C] hover:bg-[#206b85] text-white"
					/>
				</div>
			</div>
		);
	}

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
				title={budget.budget_name || t("budgetDetails.title")}
				subtitle={budget.budget_code}
				icon={<HiOutlineCurrencyDollar className="w-8 h-8 text-white" />}
			/>

			<div className="w-[95%] mx-auto px-6 py-8">
				{/* Back Button & Actions */}
				<div className="flex flex-wrap justify-between items-center gap-4 mb-6">
					<Button
						onClick={handleGoBack}
						title={t("budgetDetails.backToBudgets")}
						icon={<BiArrowBack className="text-lg" />}
						className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
					/>

					<div className="flex gap-3">
						{budget.status === "DRAFT" && (
							<>
								<Button
									onClick={handleOpenEditBudgetModal}
									title={t("budgetDetails.editBudget")}
									icon={<BiEdit className="text-lg" />}
									className="bg-gray-600 hover:bg-gray-700 text-white"
								/>
								<Button
									onClick={handleOpenActivateConfirm}
									title={t("budgetDetails.activateBudget")}
									icon={<BsCheckCircle className="text-lg" />}
									className="bg-purple-600 hover:bg-purple-700 text-white"
								/>
							</>
						)}
						<Button
							onClick={handleDownloadTemplate}
							disabled={downloadLoading}
							title={
								downloadLoading ? t("budgetDetails.downloading") : t("budgetDetails.downloadTemplate")
							}
							icon={
								downloadLoading ? (
									<AiOutlineLoading3Quarters className="text-lg animate-spin" />
								) : (
									<BiDownload className="text-lg" />
								)
							}
							className="bg-green-600 hover:bg-green-700 text-white"
						/>
						<Button
							onClick={handleOpenImportModal}
							title={t("budgetDetails.importFromExcel")}
							icon={<BiUpload className="text-lg" />}
							className="bg-blue-600 hover:bg-blue-700 text-white"
						/>
					</div>
				</div>

				{/* Budget Summary Card */}
				<Card className="mb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
						{/* Period */}
						<div className="flex items-start gap-3">
							<div className="p-2 bg-[#28819C]/10 rounded-lg">
								<BsCalendar className="w-6 h-6 text-[#28819C]" />
							</div>
							<div>
								<p className="text-sm text-gray-500">{t("budgetDetails.info.period")}</p>
								<p className="font-semibold text-gray-900">
									{formatDate(budget.start_date)} - {formatDate(budget.end_date)}
								</p>
							</div>
						</div>

						{/* Currency */}
						<div className="flex items-start gap-3">
							<div className="p-2 bg-green-100 rounded-lg">
								<BsCurrencyDollar className="w-6 h-6 text-green-600" />
							</div>
							<div>
								<p className="text-sm text-gray-500">{t("budgetDetails.info.currency")}</p>
								<p className="font-semibold text-gray-900">{budget.currency_code}</p>
							</div>
						</div>

						{/* Total Budget */}
						<div className="flex items-start gap-3">
							<div className="p-2 bg-purple-100 rounded-lg">
								<HiOutlineCurrencyDollar className="w-6 h-6 text-purple-600" />
							</div>
							<div>
								<p className="text-sm text-gray-500">{t("budgetDetails.info.totalBudget")}</p>
								<p className="font-semibold text-green-600">
									{formatCurrency(budget.total_budget, budget.currency_code)}
								</p>
							</div>
						</div>

						{/* Available */}
						<div className="flex items-start gap-3">
							<div className="p-2 bg-blue-100 rounded-lg">
								<FiInfo className="w-6 h-6 text-blue-600" />
							</div>
							<div>
								<p className="text-sm text-gray-500">{t("budgetDetails.info.available")}</p>
								<p className="font-semibold text-blue-600">
									{formatCurrency(budget.total_available, budget.currency_code)}
								</p>
							</div>
						</div>

						{/* Utilization */}
						<div className="flex items-start gap-3">
							<div className="p-2 bg-orange-100 rounded-lg">
								<FiPercent className="w-6 h-6 text-orange-600" />
							</div>
							<div>
								<p className="text-sm text-gray-500">{t("budgetDetails.info.utilization")}</p>
								<p className="font-semibold text-orange-600">
									{parseFloat(budget.utilization_percentage || 0).toFixed(1)}%
								</p>
							</div>
						</div>
					</div>

					{/* Status Badge */}
					<div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-4">
						<div>
							<span className="text-sm text-gray-500 mr-2">{t("budgetDetails.info.status")}:</span>
							<span
								className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
									budget.status === "ACTIVE"
										? "bg-green-100 text-green-800"
										: budget.status === "CLOSED"
											? "bg-red-100 text-red-800"
											: "bg-gray-100 text-gray-800"
								}`}
							>
								{t(`budgets.statuses.${budget.status?.toLowerCase()}`) || budget.status}
							</span>
						</div>
						<div>
							<span className="text-sm text-gray-500 mr-2">{t("budgetDetails.info.controlLevel")}:</span>
							<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
								{t(`budgets.controlLevels.${budget.default_control_level?.toLowerCase()}`) ||
									budget.default_control_level}
							</span>
						</div>
						<div>
							<span className="text-sm text-gray-500 mr-2">{t("budgetDetails.info.isActive")}:</span>
							<span
								className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
									budget.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
								}`}
							>
								{budget.is_active ? t("common.yes") : t("common.no")}
							</span>
						</div>
					</div>
				</Card>

				{/* Tabs */}
				<div className="mb-6">
					<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
				</div>

				{/* Info Tab */}
				{activeTab === "info" && (
					<Card>
						<h3 className="text-xl font-bold text-gray-900 mb-6">{t("budgetDetails.info.title")}</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Description */}
							<div className="md:col-span-2">
								<label className="text-sm font-medium text-gray-500">
									{t("budgetDetails.info.description")}
								</label>
								<p className="text-gray-900 mt-1">{budget.description || "-"}</p>
							</div>

							{/* Notes */}
							<div className="md:col-span-2">
								<label className="text-sm font-medium text-gray-500">
									{t("budgetDetails.info.notes")}
								</label>
								<p className="text-gray-900 mt-1">{budget.notes || "-"}</p>
							</div>

							{/* Budget Amounts Summary */}
							<div className="md:col-span-2 border-t pt-6 mt-2">
								<h4 className="text-lg font-semibold text-gray-900 mb-4">
									{t("budgetDetails.info.amountsSummary")}
								</h4>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<div className="bg-gray-50 p-4 rounded-lg">
										<p className="text-sm text-gray-500">{t("budgetDetails.info.totalBudget")}</p>
										<p className="text-xl font-bold text-green-600">
											{formatCurrency(budget.total_budget, budget.currency_code)}
										</p>
									</div>
									<div className="bg-gray-50 p-4 rounded-lg">
										<p className="text-sm text-gray-500">
											{t("budgetDetails.info.totalEncumbered")}
										</p>
										<p className="text-xl font-bold text-yellow-600">
											{formatCurrency(budget.total_encumbered, budget.currency_code)}
										</p>
									</div>
									<div className="bg-gray-50 p-4 rounded-lg">
										<p className="text-sm text-gray-500">{t("budgetDetails.info.totalActual")}</p>
										<p className="text-xl font-bold text-red-600">
											{formatCurrency(budget.total_actual, budget.currency_code)}
										</p>
									</div>
									<div className="bg-gray-50 p-4 rounded-lg">
										<p className="text-sm text-gray-500">{t("budgetDetails.info.available")}</p>
										<p className="text-xl font-bold text-blue-600">
											{formatCurrency(budget.total_available, budget.currency_code)}
										</p>
									</div>
								</div>
							</div>

							{/* Timestamps */}
							<div className="md:col-span-2 border-t pt-6 mt-2">
								<h4 className="text-lg font-semibold text-gray-900 mb-4">
									{t("budgetDetails.info.timestamps")}
								</h4>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<div>
										<p className="text-sm text-gray-500">{t("budgetDetails.info.createdAt")}</p>
										<p className="text-gray-900">{formatDate(budget.created_at)}</p>
									</div>
									<div>
										<p className="text-sm text-gray-500">{t("budgetDetails.info.createdBy")}</p>
										<p className="text-gray-900">{budget.created_by || "-"}</p>
									</div>
									<div>
										<p className="text-sm text-gray-500">{t("budgetDetails.info.activatedAt")}</p>
										<p className="text-gray-900">{formatDate(budget.activated_at)}</p>
									</div>
									<div>
										<p className="text-sm text-gray-500">{t("budgetDetails.info.activatedBy")}</p>
										<p className="text-gray-900">{budget.activated_by || "-"}</p>
									</div>
								</div>
							</div>

							{/* Segment Values Preview */}
							{budget.segment_values && budget.segment_values.length > 0 && (
								<div className="md:col-span-2 border-t pt-6 mt-2">
									<h4 className="text-lg font-semibold text-gray-900 mb-4">
										{t("budgetDetails.info.segmentValuesPreview")}
									</h4>
									<div className="overflow-x-auto">
										<table className="min-w-full divide-y divide-gray-200">
											<thead className="bg-gray-50">
												<tr>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
														{t("budgetDetails.segmentsTable.segmentCode")}
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
														{t("budgetDetails.segmentsTable.segmentName")}
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
														{t("budgetDetails.segmentsTable.segmentType")}
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
														{t("budgetDetails.segmentsTable.controlLevel")}
													</th>
													<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
														{t("budgetDetails.segmentsTable.budgetAmount")}
													</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{budget.segment_values.slice(0, 5).map(sv => (
													<tr key={sv.id} className="hover:bg-gray-50">
														<td className="px-4 py-3 whitespace-nowrap font-mono text-sm text-gray-900">
															{sv.segment_value_code}
														</td>
														<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
															{sv.segment_value_name}
														</td>
														<td className="px-4 py-3 whitespace-nowrap">
															<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
																{sv.segment_type_name}
															</span>
														</td>
														<td className="px-4 py-3 whitespace-nowrap">
															<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
																{t(
																	`budgets.controlLevels.${sv.control_level?.toLowerCase()}`
																) || sv.control_level}
															</span>
														</td>
														<td className="px-4 py-3 whitespace-nowrap text-right text-sm font-semibold text-green-600">
															{sv.budget_amount_details?.total_budget
																? formatCurrency(
																		sv.budget_amount_details.total_budget,
																		budget.currency_code
																	)
																: "-"}
														</td>
													</tr>
												))}
											</tbody>
										</table>
										{budget.segment_values.length > 5 && (
											<p className="text-sm text-gray-500 mt-2 text-center">
												{t("budgetDetails.info.andMore", {
													count: budget.segment_values.length - 5,
												})}
											</p>
										)}
									</div>
								</div>
							)}
						</div>
					</Card>
				)}

				{/* Segments Tab */}
				{activeTab === "segments" && (
					<Card>
						<div className="flex justify-between items-center mb-6">
							<h3 className="text-xl font-bold text-gray-900">{t("budgetDetails.segments.title")}</h3>
							<Button
								onClick={handleOpenAddSegmentModal}
								title={t("budgetDetails.segments.addSegment")}
								icon={<BiPlus className="text-xl" />}
								className="bg-[#28819C] hover:bg-[#206b85] text-white"
							/>
						</div>

						{segmentsLoading ? (
							<LoadingSpan />
						) : (
							<>
								<Table
									columns={segmentColumns}
									data={segments}
									onEdit={budget?.status !== "CLOSED" ? handleOpenEditSegmentModal : undefined}
									onDelete={handleDeleteSegmentClick}
									emptyMessage={t("budgetDetails.segments.emptyMessage")}
								/>
								<Pagination
									currentPage={segmentsPage}
									totalCount={segmentsCount}
									pageSize={segmentsPageSize}
									onPageChange={handleSegmentsPageChange}
									onPageSizeChange={handleSegmentsPageSizeChange}
									hasNext={segmentsHasNext}
									hasPrevious={segmentsHasPrevious}
								/>
							</>
						)}
					</Card>
				)}
			</div>

			{/* Add Segment Modal */}
			<SlideUpModal
				isOpen={isAddSegmentModalOpen}
				onClose={handleCloseAddSegmentModal}
				title={t("budgetDetails.segments.addSegmentTitle")}
				maxWidth="500px"
			>
				<div className="p-6 space-y-4">
					<FloatingLabelSelect
						label={t("budgetDetails.form.segmentType")}
						value={segmentFormData.segment_type_id}
						onChange={e => handleSegmentFormChange("segment_type_id", e.target.value)}
						options={segmentTypeOptions}
					/>

					<FloatingLabelSelect
						label={t("budgetDetails.form.segmentValue")}
						value={segmentFormData.segment_value_id}
						onChange={e => handleSegmentFormChange("segment_value_id", e.target.value)}
						options={filteredSegmentValueOptions}
						disabled={!segmentFormData.segment_type_id}
						error={segmentFormErrors.segment_value_id}
						required
					/>

					<FloatingLabelSelect
						label={t("budgetDetails.form.controlLevel")}
						value={segmentFormData.control_level}
						onChange={e => handleSegmentFormChange("control_level", e.target.value)}
						options={controlLevelOptions}
					/>

					<FloatingLabelInput
						label={t("budgetDetails.form.notes")}
						value={segmentFormData.notes}
						onChange={e => handleSegmentFormChange("notes", e.target.value)}
					/>

					<div className="flex justify-end gap-3 pt-4 border-t">
						<Button
							onClick={handleCloseAddSegmentModal}
							title={t("common.cancel")}
							className="bg-gray-200 hover:bg-gray-300 text-gray-800"
						/>
						<Button
							onClick={handleSubmitSegment}
							disabled={actionLoading}
							title={actionLoading ? t("common.saving") : t("common.add")}
							className="bg-[#28819C] hover:bg-[#206b85] text-white"
						/>
					</div>
				</div>
			</SlideUpModal>

			{/* Delete Segment Confirmation Modal */}
			<ConfirmModal
				isOpen={confirmDeleteSegmentOpen}
				onClose={() => {
					setConfirmDeleteSegmentOpen(false);
					setSegmentToDelete(null);
				}}
				onConfirm={handleConfirmDeleteSegment}
				title={t("budgetDetails.deleteSegmentModal.title")}
				message={t("budgetDetails.deleteSegmentModal.message", {
					code: segmentToDelete?.segment_value_code,
				})}
				confirmText={actionLoading ? t("common.deleting") : t("common.delete")}
				cancelText={t("common.cancel")}
				variant="danger"
				loading={actionLoading}
			/>

			{/* Edit Budget Modal */}
			<SlideUpModal
				isOpen={isEditBudgetModalOpen}
				onClose={handleCloseEditBudgetModal}
				title={t("budgetDetails.editBudgetTitle")}
				maxWidth="600px"
			>
				<div className="p-6 space-y-4">
					<FloatingLabelInput
						label={t("budgets.form.budgetName")}
						value={editBudgetFormData.budget_name || ""}
						onChange={e => handleEditBudgetFormChange("budget_name", e.target.value)}
						error={editBudgetFormErrors.budget_name}
						required
					/>

					<FloatingLabelTextarea
						label={t("budgets.form.description")}
						value={editBudgetFormData.description || ""}
						onChange={e => handleEditBudgetFormChange("description", e.target.value)}
						rows={3}
					/>

					<div className="grid grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("budgets.form.startDate")}
							type="date"
							value={editBudgetFormData.start_date || ""}
							onChange={e => handleEditBudgetFormChange("start_date", e.target.value)}
							error={editBudgetFormErrors.start_date}
							required
						/>

						<FloatingLabelInput
							label={t("budgets.form.endDate")}
							type="date"
							value={editBudgetFormData.end_date || ""}
							onChange={e => handleEditBudgetFormChange("end_date", e.target.value)}
							error={editBudgetFormErrors.end_date}
							required
						/>
					</div>

					<FloatingLabelSelect
						label={t("budgets.form.defaultControlLevel")}
						value={editBudgetFormData.default_control_level || "ABSOLUTE"}
						onChange={e => handleEditBudgetFormChange("default_control_level", e.target.value)}
						options={controlLevelOptions}
					/>

					<FloatingLabelTextarea
						label={t("budgets.form.notes")}
						value={editBudgetFormData.notes || ""}
						onChange={e => handleEditBudgetFormChange("notes", e.target.value)}
						rows={3}
					/>

					<div className="flex justify-end gap-3 pt-4 border-t">
						<Button
							onClick={handleCloseEditBudgetModal}
							title={t("common.cancel")}
							className="bg-gray-200 hover:bg-gray-300 text-gray-800"
						/>
						<Button
							onClick={handleSubmitEditBudget}
							disabled={actionLoading}
							title={actionLoading ? t("common.saving") : t("common.update")}
							className="bg-[#28819C] hover:bg-[#206b85] text-white"
						/>
					</div>
				</div>
			</SlideUpModal>

			{/* Edit Segment Modal */}
			<SlideUpModal
				isOpen={isEditSegmentModalOpen}
				onClose={handleCloseEditSegmentModal}
				title={t("budgetDetails.editSegmentTitle")}
				maxWidth="500px"
			>
				<div className="p-6 space-y-4">
					<div className="bg-gray-50 rounded-lg p-4 mb-4">
						<p className="text-sm text-gray-600 mb-2">
							<span className="font-medium">{t("budgetDetails.segmentsTable.segmentCode")}:</span>{" "}
							{segmentToEdit?.segment_value_code}
						</p>
						<p className="text-sm text-gray-600">
							<span className="font-medium">{t("budgetDetails.segmentsTable.segmentName")}:</span>{" "}
							{segmentToEdit?.segment_value_name}
						</p>
					</div>

					<FloatingLabelSelect
						label={t("budgetDetails.form.controlLevel")}
						value={editSegmentFormData.control_level || "ABSOLUTE"}
						onChange={e => handleEditSegmentFormChange("control_level", e.target.value)}
						options={controlLevelOptions}
					/>

					<FloatingLabelTextarea
						label={t("budgetDetails.form.notes")}
						value={editSegmentFormData.notes || ""}
						onChange={e => handleEditSegmentFormChange("notes", e.target.value)}
						rows={3}
					/>

					<div className="flex items-center gap-3">
						<input
							type="checkbox"
							id="is_active"
							checked={editSegmentFormData.is_active !== false}
							onChange={e => handleEditSegmentFormChange("is_active", e.target.checked)}
							className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
						/>
						<label htmlFor="is_active" className="text-sm font-medium text-gray-700">
							{t("budgetDetails.form.isActive")}
						</label>
					</div>

					<div className="flex justify-end gap-3 pt-4 border-t">
						<Button
							onClick={handleCloseEditSegmentModal}
							title={t("common.cancel")}
							className="bg-gray-200 hover:bg-gray-300 text-gray-800"
						/>
						<Button
							onClick={handleSubmitEditSegment}
							disabled={actionLoading}
							title={actionLoading ? t("common.saving") : t("common.update")}
							className="bg-[#28819C] hover:bg-[#206b85] text-white"
						/>
					</div>
				</div>
			</SlideUpModal>

			{/* Activate Budget Confirmation Modal */}
			<ConfirmModal
				isOpen={confirmActivateOpen}
				onClose={() => setConfirmActivateOpen(false)}
				onConfirm={handleConfirmActivate}
				title={t("budgetDetails.activateModal.title")}
				message={t("budgetDetails.activateModal.message")}
				confirmText={actionLoading ? t("common.activating") : t("budgetDetails.activateModal.confirm")}
				cancelText={t("common.cancel")}
				variant="success"
				loading={actionLoading}
			/>

			{/* Import Modal */}
			<SlideUpModal
				isOpen={isImportModalOpen}
				onClose={handleCloseImportModal}
				title={t("budgetDetails.import.title")}
				maxWidth="500px"
			>
				<div className="p-6 space-y-6">
					<div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
						<h4 className="text-lg font-semibold text-gray-900 mb-2">
							{t("budgetDetails.import.instructions")}
						</h4>
						<p className="text-sm text-gray-600">{t("budgetDetails.import.instructionsDesc")}</p>
					</div>

					{/* File Input */}
					<div>
						<input
							type="file"
							ref={fileInputRef}
							onChange={handleFileSelect}
							accept=".xlsx,.xls"
							className="hidden"
						/>
						<div
							onClick={() => fileInputRef.current?.click()}
							className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
						>
							{selectedFile ? (
								<div className="flex items-center justify-center gap-2">
									<BsFileEarmarkSpreadsheet className="w-8 h-8 text-green-600" />
									<span className="text-gray-900 font-medium">{selectedFile.name}</span>
								</div>
							) : (
								<>
									<BsUpload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
									<p className="text-gray-600 font-medium">
										{t("budgetDetails.import.clickToUpload")}
									</p>
									<p className="text-xs text-gray-400 mt-1">
										{t("budgetDetails.import.acceptedFormats")}
									</p>
								</>
							)}
						</div>
					</div>

					<div className="flex justify-end gap-3 pt-4 border-t">
						<Button
							onClick={handleCloseImportModal}
							title={t("common.cancel")}
							className="bg-gray-200 hover:bg-gray-300 text-gray-800"
						/>
						<Button
							onClick={handleImport}
							disabled={!selectedFile || importLoading}
							title={
								importLoading
									? t("budgetDetails.import.importing")
									: t("budgetDetails.import.importButton")
							}
							icon={
								importLoading ? (
									<AiOutlineLoading3Quarters className="text-lg animate-spin" />
								) : (
									<BiUpload className="text-lg" />
								)
							}
							className="bg-blue-600 hover:bg-blue-700 text-white"
						/>
					</div>
				</div>
			</SlideUpModal>
		</div>
	);
};

export default BudgetDetailsPage;
