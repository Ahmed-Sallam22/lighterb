import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";
import { HiBriefcase, HiClock, HiSearch, HiPlus, HiEye } from "react-icons/hi";

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
	fetchPosition,
	createPosition,
	updatePosition,
	deletePosition,
	fetchPositionHistory,
	fetchPositionTitles,
	fetchPositionTypes,
	fetchPositionStatuses,
	fetchPayrolls,
	fetchSalaryBases,
	fetchCompetencies,
	fetchProficiencyLevels,
	fetchQualificationTypes,
	fetchQualificationTitles,
	setPage,
	clearCurrentPosition,
} from "../store/positionsSlice";
import { fetchDepartmentsFromOrganizations } from "../store/organizationsSlice";
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
	position_sync: false,
	reports_to_id: "",
	payroll_id: "",
	salary_basis_id: "",
	competency_requirements: [],
	qualification_requirements: [],
	effective_start_date: "",
	effective_end_date: "",
	new_start_date: "",
};

const INITIAL_FILTERS = {
	search: "",
	organization: "",
	job: "",
	location: "",
};

const PositionsPage = () => {
	const { t } = useTranslation();
	usePageTitle(t("positions.title"));
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
		payrolls,
		salaryBases,
		currentPosition,
		detailLoading,
		competencies,
		proficiencyLevels,
		qualificationTypes,
		qualificationTitles,
	} = useSelector(state => state.positions);

	const { departments: organizations } = useSelector(state => state.organizations);
	const { jobs } = useSelector(state => state.jobs);
	const { locations } = useSelector(state => state.locations);
	const { grades } = useSelector(state => state.grades);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);
	const [formData, setFormData] = useState(INITIAL_FORM_DATA);
	const [formErrors, setFormErrors] = useState({});
	const [localPageSize, setLocalPageSize] = useState(25);
	const [filters, setFilters] = useState(INITIAL_FILTERS);

	// Competency requirement form state
	const [newCompetencyId, setNewCompetencyId] = useState("");
	const [newProficiencyLevelId, setNewProficiencyLevelId] = useState("");

	// Qualification requirement form state
	const [newQualificationTypeId, setNewQualificationTypeId] = useState("");
	const [newQualificationTitleId, setNewQualificationTitleId] = useState("");

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
		// dispatch(fetchOrganizations({ page_size: 100, is_business_group: false }));
		dispatch(fetchDepartmentsFromOrganizations({ page_size: 100 }));
		// dispatch(fetchGrades({ page_size: 100 }));
		// Fetch position lookups
		dispatch(fetchPositionTitles());
		dispatch(fetchPositionTypes());
		dispatch(fetchPositionStatuses());
		dispatch(fetchPayrolls());
		dispatch(fetchSalaryBases());
		// Fetch competency and qualification lookups
		dispatch(fetchCompetencies());
		dispatch(fetchProficiencyLevels());
		dispatch(fetchQualificationTypes());
		dispatch(fetchQualificationTitles());
	}, [dispatch]);

	// fetch locations based on the organization selected in filters
	useEffect(() => {
		if (filters.organization) {
			dispatch(fetchLocations({ page_size: 100, organization: filters.organization, status: "active" }));
		}
	}, [dispatch, filters.organization]);

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

	// fetch jobs based on the organization selected in filters
	useEffect(() => {
		if (filters.organization) {
			dispatch(fetchJobs({ page_size: 100, organization: filters.organization }));
		}
	}, [dispatch, filters.organization]);

	// fetch jobs based on the organization selected in form create edit
	useEffect(() => {
		if (formData.organization_id) {
			dispatch(
				fetchJobs({
					page_size: 100,
					business_group: organizations.find(org => org.id === parseInt(formData.organization_id))
						?.business_group_id,
				})
			);
		}
	}, [dispatch, formData.organization_id, organizations]);

	useEffect(() => {
		if (formData.organization_id) {
			dispatch(
				fetchGrades({
					page_size: 100,
					business_group: organizations.find(org => org.id === parseInt(formData.organization_id))
						?.business_group_id,
				})
			);
		}
	}, [dispatch, formData.organization_id, organizations]);

	useEffect(() => {
		if (formData.organization_id) {
			dispatch(
				fetchLocations({
					page_size: 100,
					business_group: organizations.find(org => org.id === parseInt(formData.organization_id))
						?.business_group_id,

					status: "active",
				})
			);
		}
	}, [dispatch, formData.organization_id, organizations]);

	const handleFilterChange = e => {
		const { name, value } = e.target;
		setFilters(prev => ({ ...prev, [name]: value }));
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
			accessor: "grade_name",
			render: value => value || "-",
		},
		{
			header: t("positions.table.positionSync"),
			accessor: "position_sync",
			render: value => (value ? t("common.yes") : t("common.no")),
		},
	];

	// Dropdown options
	const organizationOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectOrganization") },
			...organizations.map(org => ({
				value: org.id,
				label: org.organization_name,
			})),
		],
		[organizations, t]
	);

	const jobOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectJob") },
			...jobs.map(job => ({
				value: job.id,
				label: job.job_title_name + " - " + job.job_category_name,
			})),
		],
		[jobs, t]
	);

	const locationOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectLocation") },
			...locations.map(loc => ({
				value: loc.id,
				label: loc.location_name,
			})),
		],
		[locations, t]
	);

	const gradeOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectGrade") },
			...grades.map(grade => ({
				value: grade.id,
				label: grade.grade_name,
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

	const competencyOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectCompetency") },
			...competencies.map(item => ({
				value: item.id,
				label: item.name || item.organization_name,
			})),
		],
		[competencies, t]
	);

	const proficiencyLevelOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectProficiencyLevel") },
			...proficiencyLevels.map(item => ({
				value: item.id,
				label: item.name,
			})),
		],
		[proficiencyLevels, t]
	);

	const qualificationTypeOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectQualificationType") },
			...qualificationTypes.map(item => ({
				value: item.id,
				label: item.name,
			})),
		],
		[qualificationTypes, t]
	);

	const qualificationTitleOptions = useMemo(
		() => [
			{ value: "", label: t("positions.form.selectQualificationTitle") },
			...qualificationTitles.map(item => ({
				value: item.id,
				label: item.name,
			})),
		],
		[qualificationTitles, t]
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
				label: org.organization_name || org.code,
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
				label: loc.location_name,
			})),
		],
		[locations, t]
	);

	const handleCreate = () => {
		setEditingItem(null);
		setFormData(INITIAL_FORM_DATA);
		setFormErrors({});
		setNewCompetencyId("");
		setNewProficiencyLevelId("");
		setNewQualificationTypeId("");
		setNewQualificationTitleId("");
		setIsModalOpen(true);
	};

	const handleEdit = async item => {
		try {
			const positionData = await dispatch(fetchPosition(item.id)).unwrap();
			setEditingItem(item);
			setFormData({
				code: positionData.code || "",
				organization_id: positionData.organization_id || "",
				job_id: positionData.job_id || "",
				position_title_id: positionData.position_title_id || "",
				position_type_id: positionData.position_type_id || "",
				position_status_id: positionData.position_status_id || "",
				location_id: positionData.location_id || "",
				grade_id: positionData.grade_id || "",
				full_time_equivalent: positionData.full_time_equivalent || "1.00",
				head_count: positionData.head_count?.toString() || "1",
				reports_to_id: positionData.reports_to_id || "",
				position_sync: positionData.position_sync || false,
				payroll_id: positionData.payroll_id || "",
				salary_basis_id: positionData.salary_basis_id || "",
				new_start_date: positionData.effective_start_date || "",
				effective_end_date: positionData.effective_end_date || "",
				competency_requirements: positionData.competency_requiremnets || [],
				qualification_requirements: positionData.qualification_requirements || [],
			});
			setFormErrors({});
			setNewCompetencyId("");
			setNewProficiencyLevelId("");
			setNewQualificationTypeId("");
			setNewQualificationTitleId("");
			setIsModalOpen(true);
		} catch (error) {
			toast.error(parseApiError(error, t, "positions.messages.fetchError"));
		}
	};

	const handleView = async item => {
		await dispatch(fetchPosition(item.id));
		setIsViewModalOpen(true);
	};

	const handleCloseViewModal = () => {
		setIsViewModalOpen(false);
		dispatch(clearCurrentPosition());
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingItem(null);
		setFormData(INITIAL_FORM_DATA);
		setFormErrors({});
		setNewCompetencyId("");
		setNewProficiencyLevelId("");
		setNewQualificationTypeId("");
		setNewQualificationTitleId("");
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

	// Competency requirement handlers
	const handleAddCompetencyRequirement = () => {
		if (newCompetencyId && newProficiencyLevelId) {
			const competency = competencies.find(c => c.id === parseInt(newCompetencyId));
			const proficiencyLevel = proficiencyLevels.find(p => p.id === parseInt(newProficiencyLevelId));

			setFormData(prev => ({
				...prev,
				competency_requirements: [
					...prev.competency_requirements,
					{
						competency_id: parseInt(newCompetencyId),
						competency_name: competency?.name || competency?.organization_name || "",
						proficiency_level_id: parseInt(newProficiencyLevelId),
						proficiency_level_name: proficiencyLevel?.name || proficiencyLevel?.organization_name || "",
					},
				],
			}));
			setNewCompetencyId("");
			setNewProficiencyLevelId("");
		}
	};

	const handleRemoveCompetencyRequirement = index => {
		setFormData(prev => ({
			...prev,
			competency_requirements: prev.competency_requirements.filter((_, i) => i !== index),
		}));
	};

	// Qualification requirement handlers
	const handleAddQualificationRequirement = () => {
		if (newQualificationTypeId && newQualificationTitleId) {
			const qualType = qualificationTypes.find(t => t.id === parseInt(newQualificationTypeId));
			const qualTitle = qualificationTitles.find(t => t.id === parseInt(newQualificationTitleId));

			setFormData(prev => ({
				...prev,
				qualification_requirements: [
					...prev.qualification_requirements,
					{
						qualification_type_id: parseInt(newQualificationTypeId),
						qualification_type_name: qualType?.name || qualType?.organization_name || "",
						qualification_title_id: parseInt(newQualificationTitleId),
						qualification_title_name: qualTitle?.name || qualTitle?.organization_name || "",
					},
				],
			}));
			setNewQualificationTypeId("");
			setNewQualificationTitleId("");
		}
	};

	const handleRemoveQualificationRequirement = index => {
		setFormData(prev => ({
			...prev,
			qualification_requirements: prev.qualification_requirements.filter((_, i) => i !== index),
		}));
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			if (editingItem) {
				// PATCH request - use new_start_date if provided
				const updateData = {
					organization_id: parseInt(formData.organization_id),
					job_id: parseInt(formData.job_id),
					position_title_id: parseInt(formData.position_title_id),
					position_type_id: parseInt(formData.position_type_id),
					position_status_id: parseInt(formData.position_status_id),
					location_id: parseInt(formData.location_id),
					grade_id: parseInt(formData.grade_id),
					full_time_equivalent: parseFloat(formData.full_time_equivalent) || 1.0,
					head_count: parseInt(formData.head_count) || 1,
					position_sync: formData.position_sync,
				};

				if (formData.new_start_date) {
					updateData.new_start_date = formData.new_start_date;
				}
				if (formData.effective_end_date) {
					updateData.effective_end_date = formData.effective_end_date;
				}
				if (formData.reports_to_id) {
					updateData.reports_to_id = parseInt(formData.reports_to_id);
				}
				if (formData.payroll_id) {
					updateData.payroll_id = parseInt(formData.payroll_id);
				}
				if (formData.salary_basis_id) {
					updateData.salary_basis_id = parseInt(formData.salary_basis_id);
				}
				if (formData.competency_requirements && formData.competency_requirements.length > 0) {
					updateData.competency_requirements = formData.competency_requirements.map(req => ({
						competency_id: req.competency_id,
						proficiency_level_id: req.proficiency_level_id,
					}));
				}
				if (formData.qualification_requirements && formData.qualification_requirements.length > 0) {
					updateData.qualification_requirements = formData.qualification_requirements.map(req => ({
						qualification_type_id: req.qualification_type_id,
						qualification_title_id: req.qualification_title_id,
					}));
				}

				await dispatch(updatePosition({ id: editingItem.id, data: updateData })).unwrap();
				toast.success(t("positions.messages.updateSuccess"));
			} else {
				// POST request
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
					position_sync: formData.position_sync,
				};

				if (formData.reports_to_id) {
					payload.reports_to_id = parseInt(formData.reports_to_id);
				}
				if (formData.payroll_id) {
					payload.payroll_id = parseInt(formData.payroll_id);
				}
				if (formData.salary_basis_id) {
					payload.salary_basis_id = parseInt(formData.salary_basis_id);
				}
				if (formData.effective_start_date) {
					payload.effective_start_date = formData.effective_start_date;
				}
				if (formData.effective_end_date) {
					payload.effective_end_date = formData.effective_end_date;
				}
				if (formData.competency_requirements && formData.competency_requirements.length > 0) {
					payload.competency_requirements = formData.competency_requirements.map(req => ({
						competency_id: req.competency_id,
						proficiency_level_id: req.proficiency_level_id,
					}));
				}
				if (formData.qualification_requirements && formData.qualification_requirements.length > 0) {
					payload.qualification_requirements = formData.qualification_requirements.map(req => ({
						qualification_type_id: req.qualification_type_id,
						qualification_title_id: req.qualification_title_id,
					}));
				}

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
			title: t("common.view"),
			icon: <HiEye className="w-5 h-5 text-[#1D7A8C]" />,
			onClick: handleView,
		},
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

					{/* Row 6: Reports To & Position Sync */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<CustomDropdown
							label={t("positions.form.reportsTo")}
							name="reports_to_id"
							value={formData.reports_to_id}
							onChange={handleInputChange}
							options={reportsToOptions}
							bgColor="bg-[#fff]"
							showBorder={true}
						/>
						<div className="flex items-center gap-2 pt-6">
							<input
								type="checkbox"
								id="position_sync"
								name="position_sync"
								checked={formData.position_sync}
								onChange={e => setFormData(prev => ({ ...prev, position_sync: e.target.checked }))}
								className="w-4 h-4 text-[#1D7A8C] border-gray-300 rounded focus:ring-[#1D7A8C]"
							/>
							<label htmlFor="position_sync" className="text-sm font-medium text-gray-700">
								{t("positions.form.positionSync")}
							</label>
						</div>
					</div>

					{/* Row 7: Payroll & Salary Basis */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

					{/* Row 8: Start Date (create) / New Start Date (edit) */}
					{editingItem ? (
						<CustomInput
							label={t("positions.form.newStartDate")}
							name="new_start_date"
							type="date"
							value={formData.new_start_date}
							onChange={handleInputChange}
							bgColor="bg-[#fff]"
						/>
					) : (
						<CustomInput
							label={t("positions.form.startDate")}
							name="effective_start_date"
							type="date"
							value={formData.effective_start_date}
							onChange={handleInputChange}
							bgColor="bg-[#fff]"
						/>
					)}
					{/* End Date */}
					<CustomInput
						label={t("positions.form.endDate")}
						name="effective_end_date"
						type="date"
						value={formData.effective_end_date}
						onChange={handleInputChange}
						bgColor="bg-[#fff]"
					/>

					{/* Competency Requirements Section */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							{t("positions.form.competencyRequirements")}
						</label>
						<div className="space-y-2">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
								<CustomDropdown
									name="newCompetencyId"
									value={newCompetencyId}
									onChange={e => setNewCompetencyId(e.target.value)}
									options={competencyOptions}
									bgColor="bg-[#fff]"
									showBorder={true}
								/>
								<CustomDropdown
									name="newProficiencyLevelId"
									value={newProficiencyLevelId}
									onChange={e => setNewProficiencyLevelId(e.target.value)}
									options={proficiencyLevelOptions}
									bgColor="bg-[#fff]"
									showBorder={true}
								/>
								<button
									type="button"
									onClick={handleAddCompetencyRequirement}
									disabled={!newCompetencyId || !newProficiencyLevelId}
									className="px-4 py-2 bg-[#1D7A8C] text-white rounded-lg hover:bg-[#156576] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
								>
									<HiPlus className="w-4 h-4" />
									{t("common.add")}
								</button>
							</div>
							{formData.competency_requirements.length > 0 && (
								<ul className="space-y-2 mt-2">
									{formData.competency_requirements.map((req, index) => (
										<li
											key={index}
											className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
										>
											<span className="text-gray-700">
												{req.competency_name} - {req.proficiency_level_name}
											</span>
											<button
												type="button"
												onClick={() => handleRemoveCompetencyRequirement(index)}
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

					{/* Qualification Requirements Section */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							{t("positions.form.qualificationRequirements")}
						</label>
						<div className="space-y-2">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
								<CustomDropdown
									name="newQualificationTypeId"
									value={newQualificationTypeId}
									onChange={e => setNewQualificationTypeId(e.target.value)}
									options={qualificationTypeOptions}
									bgColor="bg-[#fff]"
									showBorder={true}
								/>
								<CustomDropdown
									name="newQualificationTitleId"
									value={newQualificationTitleId}
									onChange={e => setNewQualificationTitleId(e.target.value)}
									options={qualificationTitleOptions}
									bgColor="bg-[#fff]"
									showBorder={true}
								/>
								<button
									type="button"
									onClick={handleAddQualificationRequirement}
									disabled={!newQualificationTypeId || !newQualificationTitleId}
									className="px-4 py-2 bg-[#1D7A8C] text-white rounded-lg hover:bg-[#156576] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
								>
									<HiPlus className="w-4 h-4" />
									{t("common.add")}
								</button>
							</div>
							{formData.qualification_requirements.length > 0 && (
								<ul className="space-y-2 mt-2">
									{formData.qualification_requirements.map((req, index) => (
										<li
											key={index}
											className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
										>
											<span className="text-gray-700">
												{req.qualification_type_name} - {req.qualification_title_name}
											</span>
											<button
												type="button"
												onClick={() => handleRemoveQualificationRequirement(index)}
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
			<SlideUpModal
				isOpen={isViewModalOpen}
				onClose={handleCloseViewModal}
				title={t("positions.modal.viewTitle")}
				maxWidth="800px"
			>
				<div className="p-4 space-y-4">
					{detailLoading ? (
						<div className="flex justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D7A8C]"></div>
						</div>
					) : currentPosition ? (
						<>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.code")}
									</label>
									<p className="text-gray-900">{currentPosition.code || "-"}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.organization")}
									</label>
									<p className="text-gray-900">{currentPosition.organization_name || "-"}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.businessGroup")}
									</label>
									<p className="text-gray-900">{currentPosition.business_group_name || "-"}</p>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.job")}
									</label>
									<p className="text-gray-900">{currentPosition.job_title_name || "-"}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.positionTitle")}
									</label>
									<p className="text-gray-900">{currentPosition.position_title_name || "-"}</p>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.positionType")}
									</label>
									<p className="text-gray-900">{currentPosition.position_type_name || "-"}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.positionStatus")}
									</label>
									<p className="text-gray-900">{currentPosition.position_status_name || "-"}</p>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.location")}
									</label>
									<p className="text-gray-900">{currentPosition.location_name || "-"}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.grade")}
									</label>
									<p className="text-gray-900">{currentPosition.grade_name || "-"}</p>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.fte")}
									</label>
									<p className="text-gray-900">{currentPosition.full_time_equivalent || "-"}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.headCount")}
									</label>
									<p className="text-gray-900">{currentPosition.head_count || "-"}</p>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.endDate")}
									</label>
									<p className="text-gray-900">{formatDate(currentPosition.effective_end_date)}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.startDate")}
									</label>
									<p className="text-gray-900">{formatDate(currentPosition.effective_end_date)}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.endDate")}
									</label>
									<p className="text-gray-900">{formatDate(currentPosition.effective_end_date)}</p>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.positionSync")}
									</label>
									<p className="text-gray-900">
										{currentPosition.position_sync ? t("common.yes") : t("common.no")}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.reportsTo")}
									</label>
									<p className="text-gray-900">{currentPosition.reports_to_position_name || "-"}</p>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.payroll")}
									</label>
									<p className="text-gray-900">{currentPosition.payroll_name || "-"}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.salaryBasis")}
									</label>
									<p className="text-gray-900">{currentPosition.salary_basis_name || "-"}</p>
								</div>
							</div>
							{currentPosition.competency_requirements?.length > 0 && (
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.competencyRequirements")}
									</label>
									<ul className="list-disc list-inside text-gray-900 mt-1">
										{currentPosition.competency_requirements.map((req, idx) => (
											<li key={idx}>
												{req.competency_name} - {req.proficiency_level_name}
											</li>
										))}
									</ul>
								</div>
							)}
							{currentPosition.qualification_requirements?.length > 0 && (
								<div>
									<label className="text-sm font-medium text-gray-500">
										{t("positions.form.qualificationRequirements")}
									</label>
									<ul className="list-disc list-inside text-gray-900 mt-1">
										{currentPosition.qualification_requirements.map((req, idx) => (
											<li key={idx}>
												{req.qualification_type_name} - {req.qualification_title_name}
											</li>
										))}
									</ul>
								</div>
							)}
						</>
					) : (
						<p className="text-gray-500 text-center py-8">{t("positions.noData")}</p>
					)}
				</div>
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
											<span className="font-medium">{t("positions.versionsModal.grade")}:</span>
											{version.grade_organization_name || "-"}
										</div>
										<div>
											<span className="font-medium">
												{t("positions.versionsModal.startDate")}:
											</span>
											{formatDate(version.effective_start_date)}
										</div>
										<div>
											<span className="font-medium">{t("positions.versionsModal.endDate")}:</span>
											{formatDate(version.effective_end_date)}
										</div>
										<div>
											<span className="font-medium">{t("positions.versionsModal.endDate")}:</span>
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
