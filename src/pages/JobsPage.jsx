import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";
import { HiBriefcase, HiPlus, HiClock, HiSearch } from "react-icons/hi";

import { parseApiError } from "../utils/errorHandler";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import ConfirmModal from "../components/shared/ConfirmModal";
import SlideUpModal from "../components/shared/SlideUpModal";
import CustomInput from "../components/shared/CustomInput";
import CustomDropdown from "../components/shared/CustomDropdown";
import MultiSelectDropdown from "../components/shared/MultiSelectDropdown";
import Button from "../components/shared/Button";

import {
	fetchJobs,
	fetchJob,
	createJob,
	updateJob,
	deleteJob,
	fetchJobCategories,
	fetchJobTitles,
	fetchJobFamilies,
	fetchFunctionalAreas,
	fetchCompetencies,
	fetchProficiencyLevels,
	fetchQualificationTypes,
	fetchQualificationTitles,
	fetchJobVersions,
	setPage,
	clearError,
} from "../store/jobsSlice";
import { fetchBusinessGroupsFromOrganizations } from "../store/organizationsSlice";
import { fetchGrades } from "../store/gradesSlice";

const FORM_INITIAL_STATE = {
	code: "",
	business_group_id: "",
	job_category_id: "",
	job_title_id: "",
	job_family_id: "",
	job_description: "",
	responsibilities: [],
	functional_area_id: "",
	competency_requirements: [],
	qualification_requirements: [],
	grade_ids: [],
	effective_start_date: "",
};

const INITIAL_FILTERS = {
	search: "",
	business_group: "",
	category: "",
	family: "",
};

const JobsPage = () => {
	const { t } = useTranslation();
	usePageTitle(t("jobs.title"));
	const dispatch = useDispatch();

	const {
		jobs,
		currentJob,
		jobCategories,
		jobTitles,
		jobFamilies,
		functionalAreas,
		// competencies, proficiencyLevels, qualificationTypes, qualificationTitles - available for complex array inputs
		loading,
		detailLoading,
		creating,
		updating,
		deleting,
		error,
		actionError,
		count,
		page,
		hasNext,
		hasPrevious,
	} = useSelector(state => state.jobs);

	const { businessGroups } = useSelector(state => state.organizations);
	const { grades } = useSelector(state => state.grades);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);
	const [formData, setFormData] = useState(FORM_INITIAL_STATE);
	const [formErrors, setFormErrors] = useState({});
	const [localPageSize, setLocalPageSize] = useState(25);
	const [filters, setFilters] = useState(INITIAL_FILTERS);
	const [newResponsibility, setNewResponsibility] = useState("");

	// Versions modal state
	const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
	const [versionsData, setVersionsData] = useState([]);
	const [versionsLoading, setVersionsLoading] = useState(false);
	const [versionsItem, setVersionsItem] = useState(null);

	// Fetch dropdown data on mount
	useEffect(() => {
		dispatch(fetchBusinessGroupsFromOrganizations({ page_size: 100 }));
		dispatch(fetchJobCategories());
		dispatch(fetchJobTitles());
		dispatch(fetchJobFamilies());
		dispatch(fetchFunctionalAreas());
		dispatch(fetchCompetencies());
		dispatch(fetchProficiencyLevels());
		dispatch(fetchQualificationTypes());
		dispatch(fetchQualificationTitles());
		dispatch(fetchGrades({ page_size: 1000 }));
	}, [dispatch]);

	// Fetch jobs with filters
	useEffect(() => {
		const params = {
			page,
			page_size: localPageSize,
		};
		if (filters.search) params.search = filters.search;
		if (filters.business_group) params.business_group = filters.business_group;
		if (filters.category) params.category = filters.category;
		if (filters.family) params.family = filters.family;

		dispatch(fetchJobs(params));
	}, [dispatch, page, localPageSize, filters]);

	// fetch grades of the selected business group when business_group_id changes in formData
	useEffect(() => {
		if (formData.business_group_id) {
			dispatch(fetchGrades({ organization: formData.business_group_id, page_size: 1000 }));
		}
	}, [dispatch, formData.business_group_id]);

	// Show error toast
	useEffect(() => {
		if (error || actionError) {
			toast.error(error || actionError, { autoClose: 5000 });
			dispatch(clearError());
		}
	}, [error, actionError, dispatch]);

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

	const renderStatus = (startDate, endDate) => {
		const isActive = !endDate;
		return (
			<span
				className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
					isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
				}`}
			>
				<span className={`w-2 h-2 rounded-full mr-1.5 ${isActive ? "bg-green-500" : "bg-gray-400"}`}></span>
				{isActive ? t("common.active") : t("common.inactive")}
			</span>
		);
	};

	const columns = [
		{
			header: t("jobs.table.code"),
			accessor: "code",
			render: value => <span className="font-medium text-gray-900">{value || "-"}</span>,
		},
		{
			header: t("jobs.table.jobTitle"),
			accessor: "job_title_name",
			render: value => value || "-",
		},
		{
			header: t("jobs.table.businessGroup"),
			accessor: "business_group_name",
			render: value => value || "-",
		},
		{
			header: t("jobs.table.category"),
			accessor: "job_category_name",
			render: value => value || "-",
		},
		{
			header: t("jobs.table.family"),
			accessor: "job_family_name",
			render: value => value || "-",
		},
		{
			header: t("jobs.table.startDate"),
			accessor: "effective_start_date",
			render: value => formatDate(value),
		},
		{
			header: t("jobs.table.status"),
			accessor: "effective_end_date",
			render: (value, row) => renderStatus(row.effective_start_date, value),
		},
	];

	// Dropdown options for form
	const businessGroupOptions = useMemo(
		() => [
			{ value: "", label: t("jobs.form.selectBusinessGroup") },
			...businessGroups.map(bg => ({ value: bg.id, label: `${bg.name_display} - ${bg.code}` })),
		],
		[businessGroups, t]
	);

	const categoryOptions = useMemo(
		() => [
			{ value: "", label: t("jobs.form.selectCategory") },
			...jobCategories.map(cat => ({ value: cat.id, label: cat.name || cat.name_display })),
		],
		[jobCategories, t]
	);

	const titleOptions = useMemo(
		() => [
			{ value: "", label: t("jobs.form.selectTitle") },
			...jobTitles.map(title => ({ value: title.id, label: title.name || title.name_display })),
		],
		[jobTitles, t]
	);

	const familyOptions = useMemo(
		() => [
			{ value: "", label: t("jobs.form.selectFamily") },
			...jobFamilies.map(fam => ({ value: fam.id, label: fam.name || fam.name_display })),
		],
		[jobFamilies, t]
	);

	const functionalAreaOptions = useMemo(
		() => [
			{ value: "", label: t("jobs.form.selectFunctionalArea") },
			...functionalAreas.map(fa => ({ value: fa.id, label: fa.name || fa.name_display })),
		],
		[functionalAreas, t]
	);

	const gradeOptions = useMemo(
		() =>
			grades.map(grade => ({
				value: grade.id,
				label: `${grade.code} - ${grade.grade_name_display || grade.code}`,
			})),
		[grades]
	);

	// Filter dropdown options
	const filterBusinessGroupOptions = useMemo(
		() => [
			{ value: "", label: t("jobs.filters.allBusinessGroups") },
			...businessGroups.map(bg => ({ value: bg.id, label: bg.name_display || bg.name })),
		],
		[businessGroups, t]
	);

	const filterCategoryOptions = useMemo(
		() => [
			{ value: "", label: t("jobs.filters.allCategories") },
			...jobCategories.map(cat => ({ value: cat.id, label: cat.name || cat.name_display })),
		],
		[jobCategories, t]
	);

	const filterFamilyOptions = useMemo(
		() => [
			{ value: "", label: t("jobs.filters.allFamilies") },
			...jobFamilies.map(fam => ({ value: fam.id, label: fam.name || fam.name_display })),
		],
		[jobFamilies, t]
	);

	const handleCreate = () => {
		setEditingItem(null);
		setFormData(FORM_INITIAL_STATE);
		setFormErrors({});
		setIsModalOpen(true);
	};

	const handleEdit = async item => {
		setEditingItem(item);
		setFormErrors({});
		setIsModalOpen(true);

		// Fetch full job data from API
		try {
			const jobData = await dispatch(fetchJob(item.id)).unwrap();
			setFormData({
				code: jobData.code || "",
				business_group_id: jobData.business_group || "",
				job_category_id: jobData.job_category || "",
				job_title_id: jobData.job_title || "",
				job_family_id: jobData.job_family || "",
				job_description: jobData.job_description || "",
				responsibilities: jobData.responsibilities || [],
				functional_area_id: jobData.functional_area || "",
				competency_requirements: jobData.competency_requirements || [],
				qualification_requirements: jobData.qualification_requirements || [],
				grade_ids: jobData.grades || [],
				effective_start_date: jobData.effective_start_date || "",
			});
		} catch (error) {
			toast.error(parseApiError(error) || t("jobs.messages.fetchError"));
			// Fallback to item data if fetch fails
			setFormData({
				code: item.code || "",
				business_group_id: item.business_group || "",
				job_category_id: item.job_category || "",
				job_title_id: item.job_title || "",
				job_family_id: item.job_family || "",
				job_description: item.job_description || "",
				responsibilities: [],
				functional_area_id: "",
				competency_requirements: [],
				qualification_requirements: [],
				grade_ids: [],
				effective_start_date: item.effective_start_date || "",
			});
		}
	};

	const handleView = async item => {
		await dispatch(fetchJob(item.id));
		setIsViewModalOpen(true);
	};

	const handleDeleteClick = item => {
		setItemToDelete(item);
		setIsDeleteModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingItem(null);
		setFormData(FORM_INITIAL_STATE);
		setFormErrors({});
		setNewResponsibility("");
	};

	const handleCloseViewModal = () => {
		setIsViewModalOpen(false);
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
		setItemToDelete(null);
	};

	const handleInputChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		if (formErrors[name]) {
			setFormErrors(prev => ({ ...prev, [name]: null }));
		}
	};

	const handleAddResponsibility = () => {
		if (newResponsibility.trim()) {
			setFormData(prev => ({
				...prev,
				responsibilities: [...prev.responsibilities, newResponsibility.trim()],
			}));
			setNewResponsibility("");
		}
	};

	const handleRemoveResponsibility = index => {
		setFormData(prev => ({
			...prev,
			responsibilities: prev.responsibilities.filter((_, i) => i !== index),
		}));
	};

	const validateForm = () => {
		const errors = {};
		if (!editingItem && !formData.code?.trim()) {
			errors.code = t("jobs.form.codeRequired");
		}
		if (!formData.business_group_id) {
			errors.business_group_id = t("jobs.form.businessGroupRequired");
		}
		if (!formData.job_title_id) {
			errors.job_title_id = t("jobs.form.titleRequired");
		}
		if (!formData.effective_start_date) {
			errors.effective_start_date = t("jobs.form.startDateRequired");
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			const submitData = {
				business_group_id: formData.business_group_id,
				job_title_id: formData.job_title_id,
				job_description: formData.job_description,
				effective_start_date: formData.effective_start_date,
			};

			if (formData.job_category_id) {
				submitData.job_category_id = formData.job_category_id;
			}
			if (formData.job_family_id) {
				submitData.job_family_id = formData.job_family_id;
			}
			if (formData.functional_area_id) {
				submitData.functional_area_id = formData.functional_area_id;
			}
			if (formData.responsibilities && formData.responsibilities.length > 0) {
				submitData.responsibilities = formData.responsibilities;
			}
			if (formData.competency_requirements && formData.competency_requirements.length > 0) {
				submitData.competency_requirements = formData.competency_requirements;
			}
			if (formData.qualification_requirements && formData.qualification_requirements.length > 0) {
				submitData.qualification_requirements = formData.qualification_requirements;
			}
			if (formData.grade_ids && formData.grade_ids.length > 0) {
				submitData.grade_ids = formData.grade_ids.map(id => parseInt(id));
			}

			if (editingItem) {
				await dispatch(updateJob({ id: editingItem.id, data: submitData })).unwrap();
				toast.success(t("jobs.messages.updateSuccess"));
			} else {
				submitData.code = formData.code;
				await dispatch(createJob(submitData)).unwrap();
				toast.success(t("jobs.messages.createSuccess"));
			}
			handleCloseModal();
		} catch (err) {
			toast.error(parseApiError(err) || t("jobs.messages.saveError"));
		}
	};

	const handleConfirmDelete = async () => {
		if (!itemToDelete) return;
		try {
			await dispatch(deleteJob(itemToDelete.id)).unwrap();
			toast.success(t("jobs.messages.deleteSuccess"));
			handleCancelDelete();
		} catch (err) {
			toast.error(parseApiError(err) || t("jobs.messages.deleteError"));
		}
	};

	// Versions modal handlers
	const handleViewVersions = async item => {
		setVersionsItem(item);
		setIsVersionsModalOpen(true);
		setVersionsLoading(true);
		try {
			const result = await dispatch(fetchJobVersions(item.id)).unwrap();
			setVersionsData(result || []);
		} catch (error) {
			toast.error(parseApiError(error) || t("jobs.messages.versionsError"));
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
			title: t("jobs.viewVersions"),
			icon: <HiClock className="w-5 h-5 text-[#1D7A8C]" />,
			onClick: handleViewVersions,
		},
	];

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer position="top-right" autoClose={3000} />

			<PageHeader icon={<HiBriefcase className="w-8 h-8 text-white mr-3" />} title={t("jobs.title")} />

			<div className="p-6">
				{/* Filters Section */}
				<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
						<CustomInput
							label={t("jobs.filters.search")}
							name="search"
							value={filters.search}
							onChange={handleFilterChange}
							placeholder={t("jobs.searchPlaceholder")}
						/>
						<CustomDropdown
							label={t("jobs.filters.businessGroup")}
							name="business_group"
							value={filters.business_group}
							onChange={handleFilterChange}
							options={filterBusinessGroupOptions}
							showBorder={true}
						/>
						<CustomDropdown
							label={t("jobs.filters.category")}
							name="category"
							value={filters.category}
							onChange={handleFilterChange}
							options={filterCategoryOptions}
							showBorder={true}
						/>
						<CustomDropdown
							label={t("jobs.filters.family")}
							name="family"
							value={filters.family}
							onChange={handleFilterChange}
							options={filterFamilyOptions}
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
						<h2 className="text-2xl font-bold text-[#1D7A8C]">{t("jobs.title")}</h2>
						<Button
							onClick={handleCreate}
							icon={<HiPlus className="w-5 h-5" />}
							title={t("jobs.createJob")}
							className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
						/>
					</div>

					<Table
						columns={columns}
						data={jobs}
						onView={handleView}
						onEdit={handleEdit}
						onDelete={handleDeleteClick}
						customActions={customActions}
						emptyMessage={t("jobs.table.emptyMessage")}
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
				title={editingItem ? t("jobs.modal.editTitle") : t("jobs.modal.createTitle")}
				maxWidth="600px"
			>
				<form onSubmit={handleSubmit} className="space-y-4 p-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<CustomInput
							label={t("jobs.form.code")}
							name="code"
							value={formData.code}
							onChange={handleInputChange}
							error={formErrors.code}
							disabled={!!editingItem}
							required={!editingItem}
							bgColor="bg-[#fff]"
						/>
						<CustomDropdown
							label={t("jobs.form.businessGroup")}
							name="business_group_id"
							value={formData.business_group_id}
							onChange={handleInputChange}
							options={businessGroupOptions}
							error={formErrors.business_group_id}
							required
							bgColor="bg-[#fff]"
							showBorder={true}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<CustomDropdown
							label={t("jobs.form.jobTitle")}
							name="job_title_id"
							value={formData.job_title_id}
							onChange={handleInputChange}
							options={titleOptions}
							error={formErrors.job_title_id}
							required
							bgColor="bg-[#fff]"
							showBorder={true}
						/>
						<CustomDropdown
							label={t("jobs.form.jobCategory")}
							name="job_category_id"
							value={formData.job_category_id}
							onChange={handleInputChange}
							options={categoryOptions}
							bgColor="bg-[#fff]"
							showBorder={true}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<CustomDropdown
							label={t("jobs.form.jobFamily")}
							name="job_family_id"
							value={formData.job_family_id}
							onChange={handleInputChange}
							options={familyOptions}
							bgColor="bg-[#fff]"
							showBorder={true}
						/>
						<CustomDropdown
							label={t("jobs.form.functionalArea")}
							name="functional_area_id"
							value={formData.functional_area_id}
							onChange={handleInputChange}
							options={functionalAreaOptions}
							bgColor="bg-[#fff]"
							showBorder={true}
						/>
					</div>

					<CustomInput
						label={t("jobs.form.startDate")}
						name="effective_start_date"
						type="date"
						value={formData.effective_start_date}
						onChange={handleInputChange}
						error={formErrors.effective_start_date}
						required
						bgColor="bg-[#fff]"
					/>

					<MultiSelectDropdown
						label={t("jobs.form.grades")}
						name="grade_ids"
						value={formData.grade_ids}
						onChange={handleInputChange}
						options={gradeOptions}
						bgColor="bg-[#fff]"
						showBorder={true}
					/>

					{/* Responsibilities List */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							{t("jobs.form.responsibilities")}
						</label>
						<div className="space-y-2">
							<div className="flex gap-2">
								<input
									type="text"
									value={newResponsibility}
									onChange={e => setNewResponsibility(e.target.value)}
									onKeyPress={e => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleAddResponsibility();
										}
									}}
									placeholder="Add a responsibility..."
									className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D7A8C] focus:border-transparent bg-white"
								/>
								<button
									type="button"
									onClick={handleAddResponsibility}
									className="px-4 py-2 bg-[#1D7A8C] text-white rounded-lg hover:bg-[#156576] transition-colors"
								>
									{t("common.add")}
								</button>
							</div>
							{formData.responsibilities.length > 0 && (
								<ul className="space-y-2 mt-2">
									{formData.responsibilities.map((responsibility, index) => (
										<li
											key={index}
											className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
										>
											<span className="text-gray-700">{responsibility}</span>
											<button
												type="button"
												onClick={() => handleRemoveResponsibility(index)}
												className="text-red-500 hover:text-red-700 font-medium"
											>
												×
											</button>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>

					<CustomInput
						label={t("jobs.form.description")}
						name="job_description"
						value={formData.job_description}
						onChange={handleInputChange}
						multiline
						rows={3}
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

			{/* View Modal */}
			<SlideUpModal isOpen={isViewModalOpen} onClose={handleCloseViewModal} title={t("jobs.modal.viewTitle")}>
				<div className="p-4 space-y-4">
					{detailLoading ? (
						<div className="flex justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D7A8C]"></div>
						</div>
					) : currentJob ? (
						<>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">{t("jobs.form.code")}</label>
									<p className="text-gray-900">{currentJob.code || "-"}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("jobs.form.jobTitle")}
									</label>
									<p className="text-gray-900">{currentJob.job_title_name || "-"}</p>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("jobs.form.businessGroup")}
									</label>
									<p className="text-gray-900">{currentJob.business_group_name || "-"}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("jobs.form.jobCategory")}
									</label>
									<p className="text-gray-900">{currentJob.job_category_name || "-"}</p>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("jobs.form.jobFamily")}
									</label>
									<p className="text-gray-900">{currentJob.job_family_name || "-"}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("jobs.form.startDate")}
									</label>
									<p className="text-gray-900">{formatDate(currentJob.effective_start_date)}</p>
								</div>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-500">
									{t("jobs.form.description")}
								</label>
								<p className="text-gray-900">{currentJob.job_description || "-"}</p>
							</div>
							{currentJob.competency_requirements?.length > 0 && (
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("jobs.competencyRequirements")}
									</label>
									<ul className="list-disc list-inside text-gray-900">
										{currentJob.competency_requirements.map((req, idx) => (
											<li key={idx}>{req.name || req}</li>
										))}
									</ul>
								</div>
							)}
							{currentJob.qualification_requirements?.length > 0 && (
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("jobs.qualificationRequirements")}
									</label>
									<ul className="list-disc list-inside text-gray-900">
										{currentJob.qualification_requirements.map((req, idx) => (
											<li key={idx}>{req.name || req}</li>
										))}
									</ul>
								</div>
							)}
							{currentJob.grade_details?.length > 0 && (
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("jobs.gradeDetails")}
									</label>
									<ul className="list-disc list-inside text-gray-900">
										{currentJob.grade_details.map((grade, idx) => (
											<li key={idx}>{grade.name || grade}</li>
										))}
									</ul>
								</div>
							)}
						</>
					) : (
						<p className="text-gray-500 text-center py-8">{t("jobs.noData")}</p>
					)}
				</div>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title={t("jobs.deleteModal.title")}
				message={t("jobs.deleteModal.message", { code: itemToDelete?.code })}
				confirmText={deleting ? t("common.deleting") : t("common.delete")}
				cancelText={t("common.cancel")}
				variant="danger"
				loading={deleting}
			/>

			{/* Versions Modal */}
			<SlideUpModal
				isOpen={isVersionsModalOpen}
				onClose={handleCloseVersionsModal}
				title={t("jobs.versionsModal.title", { code: versionsItem?.code || "" })}
				maxWidth="800px"
			>
				<div className="p-4">
					{versionsLoading ? (
						<div className="flex justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D7A8C]"></div>
						</div>
					) : versionsData.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											{t("jobs.versionsModal.code")}
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											{t("jobs.versionsModal.jobTitle")}
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											{t("jobs.versionsModal.startDate")}
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											{t("jobs.versionsModal.endDate")}
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											{t("jobs.versionsModal.status")}
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{versionsData.map((version, idx) => (
										<tr key={version.id || idx} className="hover:bg-gray-50">
											<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
												{version.code}
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
												{version.job_title_name || "-"}
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
												{formatDate(version.effective_start_date)}
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
												{formatDate(version.effective_end_date)}
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-sm">
												{renderStatus(version.effective_start_date, version.effective_end_date)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<p className="text-gray-500 text-center py-8">{t("jobs.versionsModal.noVersions")}</p>
					)}
				</div>
			</SlideUpModal>
		</div>
	);
};

export default JobsPage;
