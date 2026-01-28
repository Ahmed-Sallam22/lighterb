import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";
import { HiTrendingUp, HiPlus, HiSearch } from "react-icons/hi";

import { parseApiError } from "../utils/errorHandler";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import ConfirmModal from "../components/shared/ConfirmModal";
import SlideUpModal from "../components/shared/SlideUpModal";
import CustomInput from "../components/shared/CustomInput";
import CustomDropdown from "../components/shared/CustomDropdown";
import Button from "../components/shared/Button";
import Tabs from "../components/shared/Tabs";

import {
	fetchGrades,
	fetchGradeById,
	createGrade,
	updateGrade,
	deleteGrade,
	fetchGradeRates,
	fetchGradeRateById,
	createGradeRate,
	updateGradeRate,
	deleteGradeRate,
	fetchGradeNames,
	fetchGradeRateTypes,
	fetchGradeRateTypeById,
	createGradeRateType,
	updateGradeRateType,
	deleteGradeRateType,
	fetchCurrencies,
	setPage as setGradePage,
	setRatesPage,
} from "../store/gradesSlice";
import { fetchOrganizations } from "../store/organizationsSlice";

const GRADE_FORM_INITIAL = {
	grade_name_id: "",
	business_group_id: "",
	sequence: "",
	effective_from: "",
};

const RATE_TYPE_FORM_INITIAL = {
	code: "",
	description: "",
};

const RATE_FORM_INITIAL = {
	grade_id: "",
	rate_type_id: "",
	min_amount: "",
	max_amount: "",
	fixed_amount: "",
	currency_id: "",
	effective_start_date: "",
	effective_end_date: "",
};

const INITIAL_FILTERS = {
	search: "",
	organization: "",
};

const INITIAL_RATES_FILTERS = {
	grade: "",
	rate_type: "",
};

const GradesAndRatesPage = () => {
	const { t } = useTranslation();
	usePageTitle(t("gradesAndRates.title"));
	const dispatch = useDispatch();

	// Tab state
	const [activeTab, setActiveTab] = useState("grades");

	// Redux state
	const {
		grades,
		gradeRates,
		gradeNames,
		gradeRateTypes,
		currencies,
		loading: gradeLoading,
		ratesLoading,
		count: gradeCount,
		page: gradePage,
		hasNext: gradeHasNext,
		hasPrevious: gradeHasPrevious,
		ratesCount,
		ratesPage,
		ratesHasNext,
		ratesHasPrevious,
		creating: gradeCreating,
		updating: gradeUpdating,
	} = useSelector(state => state.grades);

	const { organizations } = useSelector(state => state.organizations);

	// Local state
	const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
	const [editingGrade, setEditingGrade] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);
	const [gradeFormData, setGradeFormData] = useState(GRADE_FORM_INITIAL);
	const [formErrors, setFormErrors] = useState({});
	const [localPageSize, setLocalPageSize] = useState(25);
	const [localRatesPageSize, setLocalRatesPageSize] = useState(20);
	const [filters, setFilters] = useState(INITIAL_FILTERS);
	const [ratesFilters, setRatesFilters] = useState(INITIAL_RATES_FILTERS);

	// Rate Type modal state
	const [isRateTypeModalOpen, setIsRateTypeModalOpen] = useState(false);
	const [editingRateType, setEditingRateType] = useState(null);
	const [rateTypeFormData, setRateTypeFormData] = useState(RATE_TYPE_FORM_INITIAL);
	const [rateTypeFormErrors, setRateTypeFormErrors] = useState({});
	const [isDeleteRateTypeModalOpen, setIsDeleteRateTypeModalOpen] = useState(false);
	const [rateTypeToDelete, setRateTypeToDelete] = useState(null);

	// Rate modal state
	const [isRateModalOpen, setIsRateModalOpen] = useState(false);
	const [editingRate, setEditingRate] = useState(null);
	const [rateFormData, setRateFormData] = useState(RATE_FORM_INITIAL);
	const [rateFormErrors, setRateFormErrors] = useState({});
	const [isDeleteRateModalOpen, setIsDeleteRateModalOpen] = useState(false);
	const [rateToDelete, setRateToDelete] = useState(null);

	// Fetch initial data
	useEffect(() => {
		dispatch(fetchOrganizations({ is_business_group: true }));
		dispatch(fetchGradeNames());
		dispatch(fetchGradeRateTypes());
		dispatch(fetchCurrencies());
	}, [dispatch]);

	// Fetch grades when page or filters change
	useEffect(() => {
		if (activeTab === "grades") {
			const params = { page: gradePage, page_size: localPageSize };
			if (filters.search) params.search = filters.search;
			if (filters.organization) params.organization = filters.organization;
			dispatch(fetchGrades(params));
		}
	}, [dispatch, activeTab, gradePage, localPageSize, filters]);

	// Fetch grade rates when on rates tab
	useEffect(() => {
		if (activeTab === "gradeRates") {
			const params = { page: ratesPage, page_size: localRatesPageSize };
			if (ratesFilters.grade) params.grade = ratesFilters.grade;
			if (ratesFilters.rate_type) params.rate_type = ratesFilters.rate_type;
			dispatch(fetchGradeRates(params));
		}
	}, [dispatch, activeTab, ratesPage, localRatesPageSize, ratesFilters]);

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
			const params = { page: 1, page_size: newPageSize };
			if (filters.search) params.search = filters.search;
			if (filters.organization) params.organization = filters.organization;
			dispatch(fetchGrades(params));
		},
		[dispatch, filters]
	);

	const handleRatesPageChange = useCallback(
		newPage => {
			dispatch(setRatesPage(newPage));
		},
		[dispatch]
	);

	const handleRatesPageSizeChange = useCallback(
		newPageSize => {
			setLocalRatesPageSize(newPageSize);
			dispatch(setRatesPage(1));
			const params = { page: 1, page_size: newPageSize };
			if (ratesFilters.grade) params.grade = ratesFilters.grade;
			if (ratesFilters.rate_type) params.rate_type = ratesFilters.rate_type;
			dispatch(fetchGradeRates(params));
		},
		[dispatch, ratesFilters]
	);

	const handleFilterChange = e => {
		const { name, value } = e.target;
		setFilters(prev => ({ ...prev, [name]: value }));
		dispatch(setGradePage(1));
	};

	const handleRatesFilterChange = e => {
		const { name, value } = e.target;
		setRatesFilters(prev => ({ ...prev, [name]: value }));
		dispatch(setRatesPage(1));
	};

	

	const handleRatesSearch = () => {
		dispatch(setRatesPage(1));
	};

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

	const renderBoolean = value => (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
				value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
			}`}
		>
			{value ? t("common.yes") : t("common.no")}
		</span>
	);

	// Grades columns
	const gradeColumns = [
		{
			header: t("gradesAndRates.grades.table.gradeName"),
			accessor: "grade_name",
			render: value => value || "-",
		},
		{
			header: t("gradesAndRates.grades.table.businessGroup"),
			accessor: "business_group_name",
			render: value => value || "-",
		},
		{
			header: t("gradesAndRates.grades.table.sequence"),
			accessor: "sequence",
			render: value => value || "-",
		},
		{
			header: t("gradesAndRates.grades.table.status"),
			accessor: "status",
			render: renderStatus,
		},
	];

	// Grade Rates columns (read-only table)
	const gradeRatesColumns = [
		{
			header: t("gradesAndRates.gradeRates.table.rateCode"),
			accessor: "rate_type_code",
			render: value => value || "-",
		},
		{
			header: t("gradesAndRates.gradeRates.table.minAmount"),
			accessor: "min_amount",
			render: value => (value ? parseFloat(value).toLocaleString() : "-"),
		},
		{
			header: t("gradesAndRates.gradeRates.table.maxAmount"),
			accessor: "max_amount",
			render: value => (value ? parseFloat(value).toLocaleString() : "-"),
		},
		{
			header: t("gradesAndRates.gradeRates.table.fixedAmount"),
			accessor: "fixed_amount",
			render: value => (value ? parseFloat(value).toLocaleString() : "-"),
		},
		{
			header: t("gradesAndRates.gradeRates.table.currency"),
			accessor: "currency",
			render: value => value || "-",
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
	];

	// Grade Rate Types columns (read-only table)
	const gradeRateTypesColumns = [
		{
			header: t("gradesAndRates.gradeRateTypes.table.code"),
			accessor: "code",
			render: value => value || "-",
		},
		{
			header: t("gradesAndRates.gradeRateTypes.table.description"),
			accessor: "description",
			render: value => value || "-",
		},
	];

	// Business groups for filtering (organizations with is_business_group=true)
	const businessGroups = organizations.filter(org => org.is_business_group);

	const filterOrganizationOptions = useMemo(
		() => [
			{ value: "", label: t("gradesAndRates.filters.allOrganizations") },
			...businessGroups.map(org => ({
				value: org.business_group_id,
				label: org.organization_name,
			})),
		],
		[businessGroups, t]
	);

	const organizationOptions = useMemo(
		() => [
			{ value: "", label: t("gradesAndRates.grades.form.selectOrganization") },
			...businessGroups.map(org => ({
				value: org.id,
				label: org.organization_name,
			})),
		],
		[businessGroups, t]
	);

	const gradeNameOptions = useMemo(
		() => [
			{ value: "", label: t("gradesAndRates.grades.form.selectGradeName") },
			...gradeNames.map(gn => ({
				value: gn.id,
				label: gn.name,
			})),
		],
		[gradeNames, t]
	);

	const filterGradeOptions = useMemo(
		() => [
			{ value: "", label: t("gradesAndRates.filters.allGrades") },
			...grades.map(g => ({
				value: g.id,
				label: `${g.grade_name} - ${g.business_group_name}`,
			})),
		],
		[grades, t]
	);

	const filterRateTypeOptions = useMemo(
		() => [
			{ value: "", label: t("gradesAndRates.filters.allRateTypes") },
			...gradeRateTypes.map(rt => ({
				value: rt.id,
				label: rt.code,
			})),
		],
		[gradeRateTypes, t]
	);

	const currencyOptions = useMemo(
		() => [
			{ value: "", label: t("gradesAndRates.gradeRates.form.selectCurrency") },
			...(currencies || []).map(curr => ({
				value: curr.id,
				label: `${curr.name} - ${curr.description}`,
			})),
		],
		[currencies, t]
	);

	// Grade modal handlers
	const handleCreateGrade = () => {
		setEditingGrade(null);
		setGradeFormData(GRADE_FORM_INITIAL);
		setFormErrors({});
		setIsGradeModalOpen(true);
	};

	const handleEditGrade = async item => {
		try {
			setEditingGrade(item);
			// Fetch the full grade data from API
			const gradeData = await dispatch(fetchGradeById(item.id)).unwrap();

			setGradeFormData({
				grade_name_id: gradeData.grade_name_id ? gradeData.grade_name_id : "",
				business_group_id: gradeData.organization ? gradeData.organization : "",
				sequence: gradeData.sequence ? gradeData.sequence.toString() : "",
				effective_from: gradeData.effective_from || "",
			});
			setFormErrors({});
			setIsGradeModalOpen(true);
		} catch (error) {
			toast.error(parseApiError(error, t, "errors.generic"));
		}
	};

	const handleCloseGradeModal = () => {
		setIsGradeModalOpen(false);
		setEditingGrade(null);
		setGradeFormData(GRADE_FORM_INITIAL);
		setFormErrors({});
	};

	const handleGradeInputChange = e => {
		const { name, value } = e.target;
		setGradeFormData(prev => ({ ...prev, [name]: value }));
		if (formErrors[name]) {
			setFormErrors(prev => ({ ...prev, [name]: "" }));
		}
	};

	const validateGradeForm = () => {
		const errors = {};
		if (!gradeFormData.grade_name_id) {
			errors.grade_name_id = t("gradesAndRates.grades.form.gradeNameRequired");
		}
		if (!editingGrade && !gradeFormData.business_group_id) {
			errors.business_group_id = t("gradesAndRates.grades.form.organizationRequired");
		}
		if (!gradeFormData.sequence || parseInt(gradeFormData.sequence) < 1) {
			errors.sequence = t("gradesAndRates.grades.form.sequenceRequired");
		}

		if (!gradeFormData.effective_from) {
			errors.effective_from = t("gradesAndRates.grades.form.effectiveFromRequired");
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleGradeSubmit = async e => {
		e.preventDefault();
		if (!validateGradeForm()) return;

		try {
			if (editingGrade) {
				// For PATCH: only send updatable fields (grade_name_id and sequence)
				const payload = {
					grade_name_id: parseInt(gradeFormData.grade_name_id),
					sequence: parseInt(gradeFormData.sequence),
				};
				await dispatch(updateGrade({ id: editingGrade.id, data: payload })).unwrap();
				toast.success(t("gradesAndRates.grades.messages.updated"));
			} else {
				// For POST: send all required fields
				const payload = {
					grade_name_id: parseInt(gradeFormData.grade_name_id),
					business_group_id: parseInt(gradeFormData.business_group_id),
					sequence: parseInt(gradeFormData.sequence),
					effective_from: gradeFormData.effective_from,
				};
				await dispatch(createGrade(payload)).unwrap();
				toast.success(t("gradesAndRates.grades.messages.created"));
			}
			const params = { page: gradePage, page_size: localPageSize };
			if (filters.search) params.search = filters.search;
			if (filters.organization) params.organization = filters.organization;
			dispatch(fetchGrades(params));
			handleCloseGradeModal();
		} catch (error) {
			toast.error(parseApiError(error, t, "gradesAndRates.messages.saveError"));
		}
	};

	const handleDeleteGradeClick = item => {
		setItemToDelete(item);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!itemToDelete) return;
		try {
			await dispatch(deleteGrade(itemToDelete.id)).unwrap();
			toast.success(t("gradesAndRates.grades.messages.deleted"));
			const params = { page: gradePage, page_size: localPageSize };
			if (filters.search) params.search = filters.search;
			if (filters.organization) params.organization = filters.organization;
			dispatch(fetchGrades(params));
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

	// Rate Type handlers
	const handleCreateRateType = () => {
		setEditingRateType(null);
		setRateTypeFormData(RATE_TYPE_FORM_INITIAL);
		setRateTypeFormErrors({});
		setIsRateTypeModalOpen(true);
	};

	const handleEditRateType = async item => {
		try {
			setEditingRateType(item);
			const rateTypeData = await dispatch(fetchGradeRateTypeById(item.id)).unwrap();
			setRateTypeFormData({
				code: rateTypeData.code || "",
				description: rateTypeData.description || "",
			});
			setRateTypeFormErrors({});
			setIsRateTypeModalOpen(true);
		} catch (error) {
			toast.error(parseApiError(error, t, "errors.generic"));
		}
	};

	const handleCloseRateTypeModal = () => {
		setIsRateTypeModalOpen(false);
		setEditingRateType(null);
		setRateTypeFormData(RATE_TYPE_FORM_INITIAL);
		setRateTypeFormErrors({});
	};

	const handleRateTypeInputChange = e => {
		const { name, value } = e.target;
		setRateTypeFormData(prev => ({ ...prev, [name]: value }));
		if (rateTypeFormErrors[name]) {
			setRateTypeFormErrors(prev => ({ ...prev, [name]: "" }));
		}
	};

	const validateRateTypeForm = () => {
		const errors = {};
		if (!rateTypeFormData.code?.trim()) {
			errors.code = t("gradesAndRates.gradeRateTypes.form.codeRequired");
		}
		if (!rateTypeFormData.description?.trim()) {
			errors.description = t("gradesAndRates.gradeRateTypes.form.descriptionRequired");
		}
		setRateTypeFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleRateTypeSubmit = async e => {
		e.preventDefault();
		if (!validateRateTypeForm()) return;

		try {
			const payload = {
				code: rateTypeFormData.code.trim(),
				description: rateTypeFormData.description.trim(),
			};

			if (editingRateType) {
				await dispatch(updateGradeRateType({ id: editingRateType.id, data: payload })).unwrap();
				toast.success(t("gradesAndRates.gradeRateTypes.messages.updated"));
			} else {
				await dispatch(createGradeRateType(payload)).unwrap();
				toast.success(t("gradesAndRates.gradeRateTypes.messages.created"));
			}
			dispatch(fetchGradeRateTypes());
			handleCloseRateTypeModal();
		} catch (error) {
			toast.error(parseApiError(error, t, "gradesAndRates.messages.saveError"));
		}
	};

	const handleDeleteRateTypeClick = item => {
		setRateTypeToDelete(item);
		setIsDeleteRateTypeModalOpen(true);
	};

	const handleConfirmDeleteRateType = async () => {
		if (!rateTypeToDelete) return;
		try {
			await dispatch(deleteGradeRateType(rateTypeToDelete.id)).unwrap();
			toast.success(t("gradesAndRates.gradeRateTypes.messages.deleted"));
			dispatch(fetchGradeRateTypes());
			setIsDeleteRateTypeModalOpen(false);
			setRateTypeToDelete(null);
		} catch (error) {
			toast.error(parseApiError(error, t, "gradesAndRates.messages.deleteError"));
		}
	};

	const handleCancelDeleteRateType = () => {
		setIsDeleteRateTypeModalOpen(false);
		setRateTypeToDelete(null);
	};

	// Rate handlers
	const handleCreateRate = () => {
		setEditingRate(null);
		setRateFormData(RATE_FORM_INITIAL);
		setRateFormErrors({});
		setIsRateModalOpen(true);
	};

	const handleEditRate = async item => {
		try {
			setEditingRate(item);
			const rateData = await dispatch(fetchGradeRateById(item.id)).unwrap();
			setRateFormData({
				grade_id: rateData.grade || "",
				rate_type_id: rateData.rate_type || "",
				min_amount: rateData.min_amount || "",
				max_amount: rateData.max_amount || "",
				fixed_amount: rateData.fixed_amount || "",
				currency_id: rateData.currency_id || "",
				effective_start_date: rateData.effective_start_date || "",
				effective_end_date: rateData.effective_end_date || "",
			});
			setRateFormErrors({});
			setIsRateModalOpen(true);
		} catch (error) {
			toast.error(parseApiError(error, t, "errors.generic"));
		}
	};

	const handleCloseRateModal = () => {
		setIsRateModalOpen(false);
		setEditingRate(null);
		setRateFormData(RATE_FORM_INITIAL);
		setRateFormErrors({});
	};

	const handleRateInputChange = e => {
		const { name, value } = e.target;
		setRateFormData(prev => ({ ...prev, [name]: value }));
		if (rateFormErrors[name]) {
			setRateFormErrors(prev => ({ ...prev, [name]: "" }));
		}
	};

	const validateRateForm = () => {
		const errors = {};
		if (!rateFormData.grade_id) {
			errors.grade_id = t("gradesAndRates.gradeRates.form.gradeRequired");
		}
		if (!rateFormData.rate_type_id) {
			errors.rate_type_id = t("gradesAndRates.gradeRates.form.rateTypeRequired");
		}
		if (!rateFormData.currency_id) {
			errors.currency_id = t("gradesAndRates.gradeRates.form.currencyRequired");
		}

		// Validate that either fixed amount or min/max is provided
		const hasFixed = rateFormData.fixed_amount && parseFloat(rateFormData.fixed_amount) > 0;
		const hasRange =
			rateFormData.min_amount &&
			rateFormData.max_amount &&
			parseFloat(rateFormData.min_amount) > 0 &&
			parseFloat(rateFormData.max_amount) > 0;

		if (!hasFixed && !hasRange) {
			errors.fixed_amount = t("gradesAndRates.gradeRates.form.amountRequired");
		}

		if (hasRange && parseFloat(rateFormData.min_amount) >= parseFloat(rateFormData.max_amount)) {
			errors.max_amount = t("gradesAndRates.gradeRates.form.maxGreaterThanMin");
		}

		setRateFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleRateSubmit = async e => {
		e.preventDefault();
		if (!validateRateForm()) return;

		try {
			const payload = {
				grade_id: parseInt(rateFormData.grade_id),
				currency_id: parseInt(rateFormData.currency_id),
			};

			// Only include rate_type_id for POST (not updatable in PATCH)
			if (!editingRate) {
				payload.rate_type_id = parseInt(rateFormData.rate_type_id);
			}

			// Add amounts
			if (rateFormData.fixed_amount && parseFloat(rateFormData.fixed_amount) > 0) {
				payload.fixed_amount = parseFloat(rateFormData.fixed_amount);
			} else {
				payload.min_amount = parseFloat(rateFormData.min_amount);
				payload.max_amount = parseFloat(rateFormData.max_amount);
			}

			// Add optional dates
			if (rateFormData.effective_start_date) {
				payload.effective_start_date = rateFormData.effective_start_date;
			}
			if (rateFormData.effective_end_date) {
				payload.effective_end_date = rateFormData.effective_end_date;
			}

			if (editingRate) {
				await dispatch(updateGradeRate({ id: editingRate.id, data: payload })).unwrap();
				toast.success(t("gradesAndRates.gradeRates.messages.updated"));
			} else {
				await dispatch(createGradeRate(payload)).unwrap();
				toast.success(t("gradesAndRates.gradeRates.messages.created"));
			}

			const params = { page: ratesPage, page_size: localRatesPageSize };
			if (ratesFilters.grade) params.grade = ratesFilters.grade;
			if (ratesFilters.rate_type) params.rate_type = ratesFilters.rate_type;
			dispatch(fetchGradeRates(params));
			handleCloseRateModal();
		} catch (error) {
			toast.error(parseApiError(error, t, "gradesAndRates.messages.saveError"));
		}
	};

	const handleDeleteRateClick = item => {
		setRateToDelete(item);
		setIsDeleteRateModalOpen(true);
	};

	const handleConfirmDeleteRate = async () => {
		if (!rateToDelete) return;
		try {
			await dispatch(deleteGradeRate(rateToDelete.id)).unwrap();
			toast.success(t("gradesAndRates.gradeRates.messages.deleted"));
			const params = { page: ratesPage, page_size: localRatesPageSize };
			if (ratesFilters.grade) params.grade = ratesFilters.grade;
			if (ratesFilters.rate_type) params.rate_type = ratesFilters.rate_type;
			dispatch(fetchGradeRates(params));
			setIsDeleteRateModalOpen(false);
			setRateToDelete(null);
		} catch (error) {
			toast.error(parseApiError(error, t, "gradesAndRates.messages.deleteError"));
		}
	};

	const handleCancelDeleteRate = () => {
		setIsDeleteRateModalOpen(false);
		setRateToDelete(null);
	};

	// Tab definitions
	const tabs = [
		{ id: "grades", label: t("gradesAndRates.tabs.grades") },
		{ id: "gradeRates", label: t("gradesAndRates.tabs.gradeRates") },
		{ id: "gradeRateTypes", label: t("gradesAndRates.tabs.gradeRateTypes") },
	];

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer position="top-right" autoClose={3000} />

			<PageHeader icon={<HiTrendingUp className="w-8 h-8 text-white mr-3" />} title={t("gradesAndRates.title")} />

			<div className="p-6">
				{/* Tabs */}
				<div className="mb-6">
					<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
				</div>

				{/* Grades Tab */}
				{activeTab === "grades" && (
					<>
						{/* Filters Section */}
						<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								<CustomInput
									label={t("gradesAndRates.filters.search")}
									name="search"
									value={filters.search}
									onChange={handleFilterChange}
									placeholder={t("gradesAndRates.searchPlaceholder")}
								/>
								<CustomDropdown
									label={t("gradesAndRates.filters.organization")}
									name="organization"
									value={filters.organization}
									onChange={handleFilterChange}
									options={filterOrganizationOptions}
									showBorder={true}
								/>
								
							</div>
						</div>

						{/* Table Section */}
						<div className="bg-white rounded-2xl shadow-lg p-6">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-2xl font-bold text-[#1D7A8C]">
									{t("gradesAndRates.grades.title")}
								</h2>
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
								onEdit={handleEditGrade}
								onDelete={handleDeleteGradeClick}
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
					</>
				)}

				{/* Grade Rates Tab */}
				{activeTab === "gradeRates" && (
					<>
						{/* Filters Section */}
						<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								<CustomDropdown
									label={t("gradesAndRates.filters.grade")}
									name="grade"
									value={ratesFilters.grade}
									onChange={handleRatesFilterChange}
									options={filterGradeOptions}
									showBorder={true}
								/>
								<CustomDropdown
									label={t("gradesAndRates.filters.rateType")}
									name="rate_type"
									value={ratesFilters.rate_type}
									onChange={handleRatesFilterChange}
									options={filterRateTypeOptions}
									showBorder={true}
								/>
								
							</div>
						</div>

						{/* Table Section */}
						<div className="bg-white rounded-2xl shadow-lg p-6">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-2xl font-bold text-[#1D7A8C]">
									{t("gradesAndRates.gradeRates.title")}
								</h2>
								<Button
									onClick={handleCreateRate}
									icon={<HiPlus className="w-5 h-5" />}
									title={t("gradesAndRates.gradeRates.createRate")}
									className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
								/>
							</div>

							<Table
								columns={gradeRatesColumns}
								data={gradeRates}
								onEdit={handleEditRate}
								onDelete={handleDeleteRateClick}
								emptyMessage={t("gradesAndRates.gradeRates.table.emptyMessage")}
								loading={ratesLoading}
							/>

							<div className="mt-6">
								<Pagination
									currentPage={ratesPage}
									totalCount={ratesCount}
									pageSize={localRatesPageSize}
									onPageChange={handleRatesPageChange}
									onPageSizeChange={handleRatesPageSizeChange}
									hasNext={ratesHasNext}
									hasPrevious={ratesHasPrevious}
								/>
							</div>
						</div>
					</>
				)}

				{/* Grade Rate Types Tab */}
				{activeTab === "gradeRateTypes" && (
					<div className="bg-white rounded-2xl shadow-lg p-6">
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-2xl font-bold text-[#1D7A8C]">
								{t("gradesAndRates.gradeRateTypes.title")}
							</h2>
							<Button
								onClick={handleCreateRateType}
								icon={<HiPlus className="w-5 h-5" />}
								title={t("gradesAndRates.gradeRateTypes.createRateType")}
								className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
							/>
						</div>

						<Table
							columns={gradeRateTypesColumns}
							data={gradeRateTypes}
							onEdit={handleEditRateType}
							onDelete={handleDeleteRateTypeClick}
							emptyMessage={t("gradesAndRates.gradeRateTypes.table.emptyMessage")}
							loading={gradeLoading}
						/>
					</div>
				)}
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
				maxWidth="600px"
			>
				<form onSubmit={handleGradeSubmit} className="space-y-4 p-4">
					<CustomDropdown
						label={t("gradesAndRates.grades.form.organization")}
						name="business_group_id"
						value={gradeFormData.business_group_id}
						onChange={handleGradeInputChange}
						options={organizationOptions}
						error={formErrors.business_group_id}
						required={!editingGrade}
						disabled={!!editingGrade}
						bgColor="bg-[#fff]"
					/>

					<CustomDropdown
						label={t("gradesAndRates.grades.form.gradeName")}
						name="grade_name_id"
						value={gradeFormData.grade_name_id}
						onChange={handleGradeInputChange}
						options={gradeNameOptions}
						error={formErrors.grade_name_id}
						required
						bgColor="bg-[#fff]"
						showBorder={true}
					/>

					<CustomInput
						label={t("gradesAndRates.grades.form.sequence")}
						name="sequence"
						type="number"
						min="1"
						value={gradeFormData.sequence}
						onChange={handleGradeInputChange}
						error={formErrors.sequence}
						required
						bgColor="bg-[#fff]"
					/>
					<CustomInput
						label={t("locations.form.effectiveFrom")}
						name="effective_from"
						type="date"
						value={gradeFormData.effective_from}
						onChange={handleGradeInputChange}
						error={formErrors.effective_from}
						required
						disabled={!!editingGrade}
						bgColor="bg-[#fff]"
					/>

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
										? t("common.update")
										: t("common.create")
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
					name: itemToDelete?.grade_name,
				})}
				confirmText={t("common.delete")}
				cancelText={t("common.cancel")}
				variant="danger"
			/>

			{/* Rate Type Modal */}
			<SlideUpModal
				isOpen={isRateTypeModalOpen}
				onClose={handleCloseRateTypeModal}
				title={
					editingRateType
						? t("gradesAndRates.gradeRateTypes.modal.editTitle")
						: t("gradesAndRates.gradeRateTypes.modal.createTitle")
				}
				maxWidth="600px"
			>
				<form onSubmit={handleRateTypeSubmit} className="space-y-4 p-4">
					<CustomInput
						label={t("gradesAndRates.gradeRateTypes.form.code")}
						name="code"
						value={rateTypeFormData.code}
						onChange={handleRateTypeInputChange}
						error={rateTypeFormErrors.code}
						required
						bgColor="bg-[#fff]"
					/>

					<CustomInput
						label={t("gradesAndRates.gradeRateTypes.form.description")}
						name="description"
						value={rateTypeFormData.description}
						onChange={handleRateTypeInputChange}
						error={rateTypeFormErrors.description}
						required
						bgColor="bg-[#fff]"
					/>

					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							onClick={handleCloseRateTypeModal}
							title={t("common.cancel")}
							className="bg-gray-200 hover:bg-gray-300 text-gray-800"
						/>
						<Button
							type="submit"
							title={editingRateType ? t("common.update") : t("common.create")}
							className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
						/>
					</div>
				</form>
			</SlideUpModal>

			{/* Delete Rate Type Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteRateTypeModalOpen}
				onClose={handleCancelDeleteRateType}
				onConfirm={handleConfirmDeleteRateType}
				title={t("gradesAndRates.gradeRateTypes.deleteModal.title")}
				message={t("gradesAndRates.gradeRateTypes.deleteModal.message", {
					name: rateTypeToDelete?.name,
				})}
				confirmText={t("common.delete")}
				cancelText={t("common.cancel")}
				variant="danger"
			/>

			{/* Rate Modal */}
			<SlideUpModal
				isOpen={isRateModalOpen}
				onClose={handleCloseRateModal}
				title={
					editingRate
						? t("gradesAndRates.gradeRates.modal.editTitle")
						: t("gradesAndRates.gradeRates.modal.createTitle")
				}
				maxWidth="700px"
			>
				<form onSubmit={handleRateSubmit} className="space-y-4 p-4">
					<CustomDropdown
						label={t("gradesAndRates.gradeRates.form.grade")}
						name="grade_id"
						value={rateFormData.grade_id}
						onChange={handleRateInputChange}
						options={filterGradeOptions}
						error={rateFormErrors.grade_id}
						required
						bgColor="bg-[#fff]"
						showBorder={true}
					/>

					<CustomDropdown
						label={t("gradesAndRates.gradeRates.form.rateType")}
						name="rate_type_id"
						value={rateFormData.rate_type_id}
						onChange={handleRateInputChange}
						options={filterRateTypeOptions}
						error={rateFormErrors.rate_type_id}
						required
						disabled={!!editingRate}
						bgColor="bg-[#fff]"
						showBorder={true}
					/>

					<CustomDropdown
						label={t("gradesAndRates.gradeRates.form.currency")}
						name="currency_id"
						value={rateFormData.currency_id}
						onChange={handleRateInputChange}
						options={currencyOptions}
						error={rateFormErrors.currency_id}
						required
						bgColor="bg-[#fff]"
						showBorder={true}
					/>

					<div className="grid grid-cols-2 gap-4">
						<CustomInput
							label={t("gradesAndRates.gradeRates.form.minAmount")}
							name="min_amount"
							type="number"
							step="0.01"
							min="0"
							value={rateFormData.min_amount}
							onChange={handleRateInputChange}
							error={rateFormErrors.min_amount}
							bgColor="bg-[#fff]"
						/>

						<CustomInput
							label={t("gradesAndRates.gradeRates.form.maxAmount")}
							name="max_amount"
							type="number"
							step="0.01"
							min="0"
							value={rateFormData.max_amount}
							onChange={handleRateInputChange}
							error={rateFormErrors.max_amount}
							bgColor="bg-[#fff]"
						/>
					</div>

					<CustomInput
						label={t("gradesAndRates.gradeRates.form.fixedAmount")}
						name="fixed_amount"
						type="number"
						step="0.01"
						min="0"
						value={rateFormData.fixed_amount}
						onChange={handleRateInputChange}
						error={rateFormErrors.fixed_amount}
						bgColor="bg-[#fff]"
					/>

					<div className="grid grid-cols-2 gap-4">
						<CustomInput
							label={t("gradesAndRates.gradeRates.form.effectiveStartDate")}
							name="effective_start_date"
							type="date"
							value={rateFormData.effective_start_date}
							onChange={handleRateInputChange}
							bgColor="bg-[#fff]"
						/>

						<CustomInput
							label={t("gradesAndRates.gradeRates.form.effectiveEndDate")}
							name="effective_end_date"
							type="date"
							value={rateFormData.effective_end_date}
							onChange={handleRateInputChange}
							bgColor="bg-[#fff]"
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
							title={editingRate ? t("common.update") : t("common.create")}
							className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
						/>
					</div>
				</form>
			</SlideUpModal>

			{/* Delete Rate Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteRateModalOpen}
				onClose={handleCancelDeleteRate}
				onConfirm={handleConfirmDeleteRate}
				title={t("gradesAndRates.gradeRates.deleteModal.title")}
				message={t("gradesAndRates.gradeRates.deleteModal.message", {
					name: rateToDelete?.rate_type_name,
				})}
				confirmText={t("common.delete")}
				cancelText={t("common.cancel")}
				variant="danger"
			/>
		</div>
	);
};

export default GradesAndRatesPage;
