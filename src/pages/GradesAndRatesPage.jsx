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
	createGrade,
	updateGrade,
	deleteGrade,
	fetchGradeRates,
	fetchGradeNames,
	fetchGradeRateTypes,
	setPage as setGradePage,
	setRatesPage,
} from "../store/gradesSlice";
import { fetchOrganizations } from "../store/organizationsSlice";

const GRADE_FORM_INITIAL = {
	grade_name_id: "",
	organization_id: "",
	sequence: "",
	effective_from: "",
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
	const [localRatesPageSize, setLocalRatesPageSize] = useState(25);
	const [filters, setFilters] = useState(INITIAL_FILTERS);
	const [ratesFilters, setRatesFilters] = useState(INITIAL_RATES_FILTERS);

	// Fetch initial data
	useEffect(() => {
		dispatch(fetchOrganizations({ is_business_group: true }));
		dispatch(fetchGradeNames());
		dispatch(fetchGradeRateTypes());
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
		},
		[dispatch]
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
		},
		[dispatch]
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

	const handleSearch = () => {
		dispatch(setGradePage(1));
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
			header: t("gradesAndRates.grades.table.organization"),
			accessor: "organization_name",
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
			header: t("gradesAndRates.gradeRates.table.hasRange"),
			accessor: "has_range",
			render: renderBoolean,
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
			header: t("gradesAndRates.gradeRateTypes.table.name"),
			accessor: "name",
			render: value => value || "-",
		},
		{
			header: t("gradesAndRates.gradeRateTypes.table.hasRange"),
			accessor: "has_range",
			render: renderBoolean,
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
				value: org.id,
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
				label: `${g.grade_name} (${g.code})`,
			})),
		],
		[grades, t]
	);

	const filterRateTypeOptions = useMemo(
		() => [
			{ value: "", label: t("gradesAndRates.filters.allRateTypes") },
			...gradeRateTypes.map(rt => ({
				value: rt.id,
				label: rt.name,
			})),
		],
		[gradeRateTypes, t]
	);

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
			grade_name_id: item.grade_name || "",
			organization_id: item.organization || "",
			sequence: item.sequence || "",
			effective_from: item.effective_from || "",
		});
		setFormErrors({});
		setIsGradeModalOpen(true);
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
		if (!editingGrade && !gradeFormData.organization_id) {
			errors.organization_id = t("gradesAndRates.grades.form.organizationRequired");
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
			const payload = {
				grade_name_id: parseInt(gradeFormData.grade_name_id),
				sequence: parseInt(gradeFormData.sequence),
				effective_from: gradeFormData.effective_from,
			};

			if (editingGrade) {
				// organization_id is read-only on update
				await dispatch(updateGrade({ id: editingGrade.id, data: payload })).unwrap();
				toast.success(t("gradesAndRates.grades.messages.updated"));
			} else {
				payload.organization_id = parseInt(gradeFormData.organization_id);
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
								<div className="flex items-end">
									<Button
										onClick={handleSearch}
										icon={<HiSearch className="w-5 h-5" />}
										title={t("common.search")}
										className="bg-[#1D7A8C] hover:bg-[#156576] text-white w-full"
									/>
								</div>
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
								<div className="flex items-end">
									<Button
										onClick={handleRatesSearch}
										icon={<HiSearch className="w-5 h-5" />}
										title={t("common.search")}
										className="bg-[#1D7A8C] hover:bg-[#156576] text-white w-full"
									/>
								</div>
							</div>
						</div>

						{/* Table Section */}
						<div className="bg-white rounded-2xl shadow-lg p-6">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-2xl font-bold text-[#1D7A8C]">
									{t("gradesAndRates.gradeRates.title")}
								</h2>
							</div>

							<Table
								columns={gradeRatesColumns}
								data={gradeRates}
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
						</div>

						<Table
							columns={gradeRateTypesColumns}
							data={gradeRateTypes}
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
						name="organization_id"
						value={gradeFormData.organization_id}
						onChange={handleGradeInputChange}
						options={organizationOptions}
						error={formErrors.organization_id}
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
		</div>
	);
};

export default GradesAndRatesPage;
