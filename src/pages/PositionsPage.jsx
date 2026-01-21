import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";
import { HiBriefcase, HiClock, HiSearch } from "react-icons/hi";

import { parseApiError } from "../utils/errorHandler";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import ConfirmModal from "../components/shared/ConfirmModal";
import SlideUpModal from "../components/shared/SlideUpModal";
import CustomInput from "../components/shared/CustomInput";
import CustomDropdown from "../components/shared/CustomDropdown";
import Button from "../components/shared/Button";

import {
	fetchPositions,
	createPosition,
	updatePosition,
	deletePosition,
	fetchPositionHistory,
	fetchPositionTitles,
	fetchPositionTypes,
	fetchPositionStatuses,
	fetchPositionCategories,
	fetchPositionFamilies,
	fetchPositionSyncs,
	fetchPayrolls,
	fetchSalaryBases,
	setPage,
} from "../store/positionsSlice";
import { fetchOrganizations } from "../store/organizationsSlice";
import { fetchJobs } from "../store/jobsSlice";
import { fetchLocations } from "../store/locationsSlice";
import { fetchGrades } from "../store/gradesSlice";

const INITIAL_FORM_DATA = {
	code: "",
	organization_id: "",
	job_id: "",
	position_title_id: "",
	position_type_id: "",
	position_status_id: "",
	location_id: "",
	grade_id: "",
	full_time_equivalent: "1.00",
	head_count: "1",
	position_family_id: "",
	position_category_id: "",
	reports_to_id: "",
	position_sync_id: "",
	payroll_id: "",
	salary_basis_id: "",
	effective_start_date: "",
};

const INITIAL_FILTERS = {
	search: "",
	organization: "",
	job: "",
	location: "",
};

const PositionsPage = () => {
	const { t, i18n } = useTranslation();
	usePageTitle(t("positions.title"));
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	const {
		positions,
		loading,
		count,
		page,
		hasNext,
		hasPrevious,
		creating,
		updating,
		positionTitles,
		positionTypes,
		positionStatuses,
		positionCategories,
		positionFamilies,
		positionSyncs,
		payrolls,
		salaryBases,
	} = useSelector(state => state.positions);
	const { organizations } = useSelector(state => state.organizations);
	const { jobs } = useSelector(state => state.jobs);
	const { locations } = useSelector(state => state.locations);
	const { grades } = useSelector(state => state.grades);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);
	const [formData, setFormData] = useState(INITIAL_FORM_DATA);
	const [formErrors, setFormErrors] = useState({});
	const [localPageSize, setLocalPageSize] = useState(25);
	const [filters, setFilters] = useState(INITIAL_FILTERS);

	// Versions modal state
	const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
	const [versionsData, setVersionsData] = useState([]);
	const [versionsLoading, setVersionsLoading] = useState(false);
	const [versionsItem, setVersionsItem] = useState(null);

	// Fetch data on mount
	useEffect(() => {
		const params = {
			page,
			page_size: localPageSize,
		};
		if (filters.search) params.search = filters.search;
		if (filters.organization) params.organization = filters.organization;
		if (filters.job) params.job = filters.job;
		if (filters.location) params.location = filters.location;

		dispatch(fetchPositions(params));
	}, [dispatch, page, localPageSize, filters]);

	useEffect(() => {
		dispatch(fetchOrganizations({ page_size: 100 }));
		dispatch(fetchJobs({ page_size: 100 }));
		dispatch(fetchLocations({ page_size: 100, status: "active" }));
		dispatch(fetchGrades({ page_size: 100 }));
		// Fetch position lookups
		dispatch(fetchPositionTitles());
		dispatch(fetchPositionTypes());
		dispatch(fetchPositionStatuses());
		dispatch(fetchPositionCategories());
		dispatch(fetchPositionFamilies());
		dispatch(fetchPositionSyncs());
		dispatch(fetchPayrolls());
		dispatch(fetchSalaryBases());
	}, [dispatch]);

	// fetch locations based on the organization selected
	useEffect(() => {
		if (formData.organization_id) {
			dispatch(fetchLocations({ page_size: 100, organization: formData.organization_id, status: "active" }));
		}
	}, [dispatch, formData.organization_id]);

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

	const handleFilterChange = e => {
		const { name, value } = e.target;
		setFilters(prev => ({ ...prev, [name]: value }));
		dispatch(setPage(1));
	};

	const handleSearch = () => {
		dispatch(setPage(1));
	};

	const formatDate = dateString => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
	};

	// Table columns based on API response
	const columns = [
		{
			header: t("positions.table.orgCode"),
			accessor: "organization_code",
			render: value => value || "-",
		},
		{
			header: t("positions.table.orgName"),
			accessor: "organization_name",
			render: value => value || "-",
		},
		{
			header: t("positions.table.jobCode"),
			accessor: "job_code",
			render: value => value || "-",
		},
		{
			header: t("positions.table.jobName"),
			accessor: "job_title_name",
			render: value => value || "-",
		},
		{
			header: t("positions.table.positionCode"),
			accessor: "code",
			render: value => value || "-",
		},
		{
			header: t("positions.table.positionName"),
			accessor: "position_title_name",
			render: value => value || "-",
		},
		{
			header: t("positions.table.gradeName"),
			accessor: "grade_name_display",
			render: value => value || "-",
		},
		{
			header: t("positions.table.positionFamily"),
			accessor: "position_family_name",
			render: value => value || "-",
		},
		{
			header: t("positions.table.positionCategory"),
			accessor: "position_category_name",
			render: value => value || "-",
		},
	];

	// Dropdown options
	const organizationOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectOrganization") },
			...organizations.map(org => ({
				value: org.id,
				label: org.name_display + " - " + org.code,
			})),
		],
		[organizations, t]
	);

	const jobOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectJob") },
			...jobs.map(job => ({
				value: job.id,
				label: job.job_title_name || job.code,
			})),
		],
		[jobs, t]
	);

	const locationOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectLocation") },
			...locations.map(loc => ({
				value: loc.id,
				label: loc.name,
			})),
		],
		[locations, t]
	);

	const gradeOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectGrade") },
			...grades.map(grade => ({
				value: grade.id,
				label: grade.name || grade.code,
			})),
		],
		[grades, t]
	);

	const positionTitleOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectPositionTitle") },
			...positionTitles.map(item => ({
				value: item.id,
				label: item.name,
			})),
		],
		[positionTitles, t]
	);

	const positionTypeOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectPositionType") },
			...positionTypes.map(item => ({
				value: item.id,
				label: item.name,
			})),
		],
		[positionTypes, t]
	);

	const positionStatusOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectPositionStatus") },
			...positionStatuses.map(item => ({
				value: item.id,
				label: item.name,
			})),
		],
		[positionStatuses, t]
	);

	const positionCategoryOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectPositionCategory") },
			...positionCategories.map(item => ({
				value: item.id,
				label: item.name,
			})),
		],
		[positionCategories, t]
	);

	const positionFamilyOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectPositionFamily") },
			...positionFamilies.map(item => ({
				value: item.id,
				label: item.name,
			})),
		],
		[positionFamilies, t]
	);

	const reportsToOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectReportsTo") },
			...positions
				.filter(pos => pos.id !== editingItem?.id)
				.map(pos => ({
					value: pos.id,
					label: `${pos.position_title_name || pos.code} (${pos.code})`,
				})),
		],
		[positions, editingItem, t]
	);

	const positionSyncOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectPositionSync") },
			...positionSyncs.map(item => ({
				value: item.id,
				label: item.name,
			})),
		],
		[positionSyncs, t]
	);

	const payrollOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectPayroll") },
			...payrolls.map(item => ({
				value: item.id,
				label: item.name,
			})),
		],
		[payrolls, t]
	);

	const salaryBasisOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectSalaryBasis") },
			...salaryBases.map(item => ({
				value: item.id,
				label: item.name,
			})),
		],
		[salaryBases, t]
	);

	// Filter dropdown options
	const filterOrganizationOptions = useMemo(
		() => [
			{ value: "", label: t("positions.filters.allOrganizations") },
			...organizations.map(org => ({
				value: org.id,
				label: org.name_display || org.code,
			})),
		],
		[organizations, t]
	);

	const filterJobOptions = useMemo(
		() => [
			{ value: "", label: t("positions.filters.allJobs") },
			...jobs.map(job => ({
				value: job.id,
				label: job.job_title_name || job.code,
			})),
		],
		[jobs, t]
	);

	const filterLocationOptions = useMemo(
		() => [
			{ value: "", label: t("positions.filters.allLocations") },
			...locations.map(loc => ({
				value: loc.id,
				label: loc.name,
			})),
		],
		[locations, t]
	);

	const handleCreate = () => {
		setEditingItem(null);
		setFormData(INITIAL_FORM_DATA);
		setFormErrors({});
		setIsModalOpen(true);
	};

	const handleEdit = item => {
		setEditingItem(item);
		setFormData({
			code: item.code || "",
			organization_id: item.organization || "",
			job_id: item.job || "",
			position_title_id: item.position_title || "",
			position_type_id: item.position_type || "",
			position_status_id: item.position_status || "",
			location_id: item.location || "",
			grade_id: item.grade || "",
			full_time_equivalent: item.full_time_equivalent || "1.00",
			head_count: item.head_count?.toString() || "1",
			position_family_id: item.position_family || "",
			position_category_id: item.position_category || "",
			reports_to_id: item.reports_to || "",
			position_sync_id: item.position_sync || "",
			payroll_id: item.payroll || "",
			salary_basis_id: item.salary_basis || "",
			effective_start_date: item.effective_start_date || "",
		});
		setFormErrors({});
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingItem(null);
		setFormData(INITIAL_FORM_DATA);
		setFormErrors({});
	};

	const handleInputChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		if (formErrors[name]) {
			setFormErrors(prev => ({ ...prev, [name]: "" }));
		}
	};

	const validateForm = () => {
		const errors = {};
		if (!formData.code.trim()) {
			errors.code = t("common.required");
		}
		if (!formData.organization_id) {
			errors.organization_id = t("common.required");
		}
		if (!formData.job_id) {
			errors.job_id = t("common.required");
		}
		if (!formData.position_title_id) {
			errors.position_title_id = t("common.required");
		}
		if (!formData.position_type_id) {
			errors.position_type_id = t("common.required");
		}
		if (!formData.position_status_id) {
			errors.position_status_id = t("common.required");
		}
		if (!formData.location_id) {
			errors.location_id = t("common.required");
		}
		if (!formData.grade_id) {
			errors.grade_id = t("common.required");
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			const payload = {
				code: formData.code,
				organization_id: parseInt(formData.organization_id),
				job_id: parseInt(formData.job_id),
				position_title_id: parseInt(formData.position_title_id),
				position_type_id: parseInt(formData.position_type_id),
				position_status_id: parseInt(formData.position_status_id),
				location_id: parseInt(formData.location_id),
				grade_id: parseInt(formData.grade_id),
				full_time_equivalent: parseFloat(formData.full_time_equivalent) || 1.0,
				head_count: parseInt(formData.head_count) || 1,
				...(formData.position_family_id && { position_family_id: parseInt(formData.position_family_id) }),
				...(formData.position_category_id && { position_category_id: parseInt(formData.position_category_id) }),
				...(formData.reports_to_id && { reports_to_id: parseInt(formData.reports_to_id) }),
				...(formData.position_sync_id && { position_sync_id: parseInt(formData.position_sync_id) }),
				...(formData.payroll_id && { payroll_id: parseInt(formData.payroll_id) }),
				...(formData.salary_basis_id && { salary_basis_id: parseInt(formData.salary_basis_id) }),
				...(formData.effective_start_date && { effective_start_date: formData.effective_start_date }),
			};

			if (editingItem) {
				await dispatch(updatePosition({ id: editingItem.id, data: payload })).unwrap();
				toast.success(t("positions.messages.updateSuccess"));
			} else {
				await dispatch(createPosition(payload)).unwrap();
				toast.success(t("positions.messages.createSuccess"));
			}
			handleCloseModal();
			// Refresh list
			const params = {
				page,
				page_size: localPageSize,
			};
			if (filters.search) params.search = filters.search;
			if (filters.organization) params.organization = filters.organization;
			if (filters.job) params.job = filters.job;
			if (filters.location) params.location = filters.location;
			dispatch(fetchPositions(params));
		} catch (error) {
			toast.error(parseApiError(error, t, "positions.messages.saveError"));
		}
	};

	const handleDeleteClick = item => {
		setItemToDelete(item);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!itemToDelete) return;
		try {
			await dispatch(deletePosition(itemToDelete.id)).unwrap();
			toast.success(t("positions.messages.deleted"));
			setIsDeleteModalOpen(false);
			setItemToDelete(null);
		} catch (error) {
			toast.error(parseApiError(error, t, "positions.messages.deleteError"));
		}
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
		setItemToDelete(null);
	};

	// Versions modal handlers
	const handleViewVersions = async item => {
		setVersionsItem(item);
		setIsVersionsModalOpen(true);
		setVersionsLoading(true);
		try {
			const result = await dispatch(fetchPositionHistory(item.id)).unwrap();
			setVersionsData(result.results || result || []);
		} catch (error) {
			toast.error(parseApiError(error, t, "positions.messages.versionsError"));
			setVersionsData([]);
		} finally {
			setVersionsLoading(false);
		}
	};

	const handleCloseVersionsModal = () => {
		setIsVersionsModalOpen(false);
		setVersionsData([]);
		setVersionsItem(null);
	};

	const customActions = [
		{
			title: t("positions.viewVersions"),
			icon: <HiClock className="w-5 h-5 text-[#1D7A8C]" />,
			onClick: handleViewVersions,
		},
	];

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer position="top-right" autoClose={3000} />

			<PageHeader icon={<HiBriefcase className="w-8 h-8 text-white mr-3" />} title={t("positions.title")} />

			<div className="p-6">
				{/* Filters Section */}
				<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<CustomInput
							label={t("positions.filters.search")}
							name="search"
							value={filters.search}
							onChange={handleFilterChange}
							placeholder={t("positions.searchPlaceholder")}
						/>
						<CustomDropdown
							label={t("positions.filters.organization")}
							name="organization"
							value={filters.organization}
							onChange={handleFilterChange}
							options={filterOrganizationOptions}
							showBorder={true}
						/>
						<CustomDropdown
							label={t("positions.filters.job")}
							name="job"
							value={filters.job}
							onChange={handleFilterChange}
							options={filterJobOptions}
							showBorder={true}
						/>
						<CustomDropdown
							label={t("positions.filters.location")}
							name="location"
							value={filters.location}
							onChange={handleFilterChange}
							options={filterLocationOptions}
							showBorder={true}
						/>
					</div>
					<div className="flex items-end md:justify-end mt-5">
						<Button
							onClick={handleSearch}
							icon={<HiSearch className="w-5 h-5" />}
							title={t("common.search")}
							className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
						/>
					</div>
				</div>

				{/* Table Section */}
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold text-[#1D7A8C]">{t("positions.title")}</h2>
						<Button
							onClick={handleCreate}
							icon={
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4v16m8-8H4"
									/>
								</svg>
							}
							title={t("positions.createPosition")}
							className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
						/>
					</div>

					<Table
						columns={columns}
						data={positions}
						onEdit={handleEdit}
						onDelete={handleDeleteClick}
						customActions={customActions}
						emptyMessage={t("positions.table.emptyMessage")}
						loading={loading}
					/>

					<div className="mt-6">
						<Pagination
							currentPage={page}
							totalCount={count}
							pageSize={localPageSize}
							onPageChange={handlePageChange}
							onPageSizeChange={handlePageSizeChange}
							hasNext={hasNext}
							hasPrevious={hasPrevious}
						/>
					</div>
				</div>
			</div>

			{/* Create/Edit Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={editingItem ? t("positions.modal.editTitle") : t("positions.modal.createTitle")}
				maxWidth="800px"
			>
				<form onSubmit={handleSubmit} className="space-y-4 p-4">
					{/* Row 1: Code & Organization */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<CustomInput
							label={t("positions.form.code")}
							name="code"
							value={formData.code}
							onChange={handleInputChange}
							error={formErrors.code}
							disabled={!!editingItem}
							required
							bgColor="bg-[#fff]"
						/>
						<CustomDropdown
							label={t("positions.form.organization")}
							name="organization_id"
							value={formData.organization_id}
							onChange={handleInputChange}
							options={organizationOptions}
							error={formErrors.organization_id}
							required
							bgColor="bg-[#fff]"
							showBorder={true}
						/>
					</div>

					{/* Row 2: Job & Position Title */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<CustomDropdown
							label={t("positions.form.job")}
							name="job_id"
							value={formData.job_id}
							onChange={handleInputChange}
							options={jobOptions}
							error={formErrors.job_id}
							required
							bgColor="bg-[#fff]"
							showBorder={true}
						/>
						<CustomDropdown
							label={t("positions.form.positionTitle")}
							name="position_title_id"
							value={formData.position_title_id}
							onChange={handleInputChange}
							options={positionTitleOptions}
							error={formErrors.position_title_id}
							required
							bgColor="bg-[#fff]"
							showBorder={true}
						/>
					</div>

					{/* Row 3: Position Type & Position Status */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<CustomDropdown
							label={t("positions.form.positionType")}
							name="position_type_id"
							value={formData.position_type_id}
							onChange={handleInputChange}
							options={positionTypeOptions}
							error={formErrors.position_type_id}
							required
							bgColor="bg-[#fff]"
							showBorder={true}
						/>
						<CustomDropdown
							label={t("positions.form.positionStatus")}
							name="position_status_id"
							value={formData.position_status_id}
							onChange={handleInputChange}
							options={positionStatusOptions}
							error={formErrors.position_status_id}
							required
							bgColor="bg-[#fff]"
							showBorder={true}
						/>
					</div>

					{/* Row 4: Location & Grade */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<CustomDropdown
							label={t("positions.form.location")}
							name="location_id"
							value={formData.location_id}
							onChange={handleInputChange}
							options={locationOptions}
							error={formErrors.location_id}
							required
							bgColor="bg-[#fff]"
							showBorder={true}
						/>
						<CustomDropdown
							label={t("positions.form.grade")}
							name="grade_id"
							value={formData.grade_id}
							onChange={handleInputChange}
							options={gradeOptions}
							error={formErrors.grade_id}
							required
							bgColor="bg-[#fff]"
							showBorder={true}
						/>
					</div>

					{/* Row 5: FTE & Head Count */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<CustomInput
							label={t("positions.form.fte")}
							name="full_time_equivalent"
							type="number"
							step="0.01"
							min="0"
							max="1"
							value={formData.full_time_equivalent}
							onChange={handleInputChange}
							bgColor="bg-[#fff]"
						/>
						<CustomInput
							label={t("positions.form.headCount")}
							name="head_count"
							type="number"
							min="1"
							value={formData.head_count}
							onChange={handleInputChange}
							bgColor="bg-[#fff]"
						/>
					</div>

					{/* Row 6: Position Category & Position Family */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<CustomDropdown
							label={t("positions.form.positionCategory")}
							name="position_category_id"
							value={formData.position_category_id}
							onChange={handleInputChange}
							options={positionCategoryOptions}
							bgColor="bg-[#fff]"
							showBorder={true}
						/>
						<CustomDropdown
							label={t("positions.form.positionFamily")}
							name="position_family_id"
							value={formData.position_family_id}
							onChange={handleInputChange}
							options={positionFamilyOptions}
							bgColor="bg-[#fff]"
							showBorder={true}
						/>
					</div>

					{/* Row 7: Reports To */}
					<CustomDropdown
						label={t("positions.form.reportsTo")}
						name="reports_to_id"
						value={formData.reports_to_id}
						onChange={handleInputChange}
						options={reportsToOptions}
						bgColor="bg-[#fff]"
						showBorder={true}
					/>

					{/* Row 8: Position Sync, Payroll, Salary Basis */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<CustomDropdown
							label={t("positions.form.positionSync")}
							name="position_sync_id"
							value={formData.position_sync_id}
							onChange={handleInputChange}
							options={positionSyncOptions}
							bgColor="bg-[#fff]"
							showBorder={true}
						/>
						<CustomDropdown
							label={t("positions.form.payroll")}
							name="payroll_id"
							value={formData.payroll_id}
							onChange={handleInputChange}
							options={payrollOptions}
							bgColor="bg-[#fff]"
							showBorder={true}
						/>
						<CustomDropdown
							label={t("positions.form.salaryBasis")}
							name="salary_basis_id"
							value={formData.salary_basis_id}
							onChange={handleInputChange}
							options={salaryBasisOptions}
							bgColor="bg-[#fff]"
							showBorder={true}
						/>
					</div>

					{/* Row 9: Start Date */}
					<CustomInput
						label={t("positions.form.startDate")}
						name="effective_start_date"
						type="date"
						value={formData.effective_start_date}
						onChange={handleInputChange}
						bgColor="bg-[#fff]"
					/>

					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							onClick={handleCloseModal}
							title={t("common.cancel")}
							className="bg-gray-200 hover:bg-gray-300 text-gray-800"
						/>
						<Button
							type="submit"
							disabled={creating || updating}
							title={
								creating || updating
									? t("common.saving")
									: editingItem
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
				title={t("positions.deleteModal.title")}
				message={t("positions.deleteModal.message", {
					name: itemToDelete?.position_title_name || itemToDelete?.code,
				})}
				confirmText={t("common.delete")}
				cancelText={t("common.cancel")}
				variant="danger"
			/>

			{/* Versions Modal */}
			<SlideUpModal
				isOpen={isVersionsModalOpen}
				onClose={handleCloseVersionsModal}
				title={t("positions.versionsModal.title", { code: versionsItem?.code || "" })}
				maxWidth="700px"
			>
				<div className="p-4">
					{versionsLoading ? (
						<div className="flex justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D7A8C]"></div>
						</div>
					) : versionsData.length > 0 ? (
						<div className="space-y-4">
							{versionsData.map((version, index) => (
								<div
									key={version.id || index}
									className={`p-4 rounded-lg border ${
										!version.effective_end_date
											? "border-[#1D7A8C] bg-[#E8F7FA]"
											: "border-gray-200 bg-white"
									}`}
								>
									<div className="flex justify-between items-start mb-2">
										<span className="font-medium text-gray-800">
											{version.position_title_name || version.code}
										</span>
										{!version.effective_end_date && (
											<span className="text-xs bg-[#1D7A8C] text-white px-2 py-1 rounded-full">
												{t("positions.versionsModal.current")}
											</span>
										)}
									</div>
									<div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
										<div>
											<span className="font-medium">{t("positions.versionsModal.grade")}:</span>{" "}
											{version.grade_name_display || "-"}
										</div>
										<div>
											<span className="font-medium">
												{t("positions.versionsModal.startDate")}:
											</span>{" "}
											{formatDate(version.effective_start_date)}
										</div>
										<div>
											<span className="font-medium">{t("positions.versionsModal.endDate")}:</span>{" "}
											{formatDate(version.effective_end_date)}
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-gray-500 text-center py-8">{t("positions.versionsModal.noData")}</p>
					)}
				</div>
			</SlideUpModal>
		</div>
	);
};

export default PositionsPage;
