import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router";
import { usePageTitle } from "../hooks/usePageTitle";
import {
	HiOutlineUser,
	HiOutlineEye,
	HiOutlinePencilAlt,
	HiOutlineChevronDown,
	HiOutlineCheck,
	HiOutlineBookmark,
} from "react-icons/hi";
import ProfileIcon from "../assets/profile.svg?react";
import CustomTable from "../components/shared/CustomTable";
import PageHeader from "../components/shared/PageHeader";
import Button from "../components/shared/Button";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import SlideUpModal from "../components/shared/SlideUpModal";
import Toggle from "../components/shared/Toggle";
import Table from "../components/shared/Table";
import userImage from "../assets/userimage.png";

// Slices
import { fetchAddresses, createAddress, updateAddress } from "../store/addressesSlice";
import { fetchLookupValues } from "../store/lookupsSlice";
import { fetchEmployeeById, clearSelectedEmployee, fetchEmployees } from "../store/employeesSlice";
import {
	fetchAssignments,
	fetchPrimaryAssignment,
	clearPrimaryAssignment,
	createAssignment,
	updateAssignment,
	deleteAssignment,
	fetchAssignmentStatuses,
	fetchAssignmentActionReasons,
} from "../store/assignmentsSlice";
import { fetchJobs } from "../store/jobsSlice";
import { fetchPositions } from "../store/positionsSlice";
import { fetchGrades } from "../store/gradesSlice";
import { fetchBusinessGroupsFromOrganizations, fetchDepartmentsFromOrganizations } from "../store/organizationsSlice";
import {
	fetchContracts,
	fetchContractById,
	createContract,
	updateContract,
	deleteContract,
	clearSelectedContract,
} from "../store/contractsSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { parseApiError } from "../utils/errorHandler";

const QUALIFICATION_DATA = [
	{ id: 1, type: "Certificate", qualification: "PMP", issuer: "PMI", year: "2022", status: "valid" },
	{ id: 2, type: "Course", qualification: "Leadership Skills", issuer: "AUC", year: "2021", status: "completed" },
];

const COMPETENCIES_LIST = [
	{ id: 1, name: "Negotiation", selected: true, level: "beginner" },
	{ id: 2, name: "Leadership", selected: false, level: "" },
	{ id: 3, name: "Time Management", selected: false, level: "" },
	{ id: 4, name: "Customer Service", selected: false, level: "" },
	{ id: 5, name: "Data Analysis", selected: false, level: "" },
	{ id: 6, name: "Teamwork", selected: true, level: "intermediate" },
	{ id: 7, name: "Communication", selected: true, level: "advanced" },
];

const CONTACTS_DATA = [
	{
		id: 1,
		email: "ahmed@company.com",
		phone: "01012345678",
		address: "25 Abbas El Akkad St., Nasr city, Cairo, Egypt",
		addressType: "Home",
		lastUpdate: "2025-03-01",
	},
	{
		id: 2,
		email: "ahmed.old@mail.com",
		phone: "01198765432",
		address: "12 El Tayaran St., Heliopolis Cairo, Egypt",
		addressType: "Home",
		lastUpdate: "2022-01-15",
	},
];

const QUALIFICATION_INITIAL_STATE = {
	qualificationTitle: "",
	qualificationType: "",
	status: true,
	titleOther: "",
	gradeScore: "",
	awardingEntity: "",
	studyStartDate: "",
	studyEndDate: "",
	awardedDate: "",
	projectedCompletion: "",
	completionPercentage: 0,
};

const ProfilePage = () => {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { employeeId } = useParams();
	usePageTitle(t("profile.title"));

	// State for profile data
	const [activeTab, setActiveTab] = useState("general");
	const [isViewProfileModalOpen, setIsViewProfileModalOpen] = useState(false);
	const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

	// Selectors - Addresses
	const { addresses, loading: loadingAddresses } = useSelector(state => state.addresses);
	const { lookupValues } = useSelector(state => state.lookups);

	// Selectors - Employee
	const { selectedEmployee, loadingEmployee, employees = [] } = useSelector(state => state.employees);

	// Selectors - Assignments
	const {
		assignments,
		primaryAssignment,
		loading: loadingAssignments,
		creating: creatingAssignment,
		updating: updatingAssignment,
		deleting: deletingAssignment,
		assignmentStatuses,
		actionReasons,
	} = useSelector(state => state.assignments);

	// Selectors - Contracts
	const {
		contracts = [],
		loading: loadingContracts,
		creating: creatingContract,
		updating: updatingContract,
		deleting: deletingContract,
	} = useSelector(state => state.contracts);

	// Selectors - Jobs, Positions, Grades, Organizations (Business Groups)
	const { jobs = [] } = useSelector(state => state.jobs || {});
	const { positions = [] } = useSelector(state => state.positions || {});
	const { grades = [] } = useSelector(state => state.grades || {});
	const { businessGroups = [] } = useSelector(state => state.organizations || {});
	const { departments = [] } = useSelector(state => state.organizations || {});

	// Get person_id from selectedEmployee (for API calls that need person_id)
	const personId = selectedEmployee?.person?.id || selectedEmployee?.person_id;

	// Local lookups state derived from Redux
	const [localLookups, setLocalLookups] = useState({
		addressTypes: [],
		countries: [],
		cities: [],
	});

	// build addresstypes options to use it at its floating select
	const addressTypeOptions = useMemo(() => {
		return (lookupValues?.ADDRESS_TYPE || []).map(item => ({
			value: item.id,
			label: item.name,
		}));
	}, [lookupValues]);

	const countriesTypeOptions = useMemo(() => {
		console.log("test here", lookupValues);
		return (lookupValues?.COUNTRY || []).map(item => ({
			value: item.id,
			label: item.name,
		}));
	}, [lookupValues]);

	const citiesTypeOptions = useMemo(() => {
		return (lookupValues?.CITY || []).map(item => ({
			value: item.id,
			label: item.name,
		}));
	}, [lookupValues]);

	// Assignment dropdown options
	const businessGroupOptions = useMemo(() => {
		return [
			{ value: "", label: t("profile.assignment.placeholders.businessGroupId") },
			...businessGroups.map(bg => ({
				value: bg.id,
				label: bg.organization_name,
			})),
		];
	}, [businessGroups, t]);

	const jobOptions = useMemo(() => {
		return [
			{ value: "", label: t("profile.assignment.placeholders.jobId") },
			...(jobs?.data || jobs || []).map(job => ({
				value: job.id,
				label: job.job_title_name || job.name || `Job ${job.id}`,
			})),
		];
	}, [jobs, t]);

	const positionOptions = useMemo(() => {
		return [
			{ value: "", label: t("profile.assignment.placeholders.positionId") },
			...(positions?.data || positions || []).map(pos => ({
				value: pos.id,
				label: pos.position_title_name || pos.name || `Position ${pos.id}`,
			})),
		];
	}, [positions, t]);

	const gradeOptions = useMemo(() => {
		return [
			{ value: "", label: t("profile.assignment.placeholders.gradeId") },
			...(grades?.data || grades || []).map(grade => ({
				value: grade.id,
				label: grade.code
					? `${grade.code} - ${grade.grade_name || grade.name || ""}`
					: grade.grade_name || grade.name || `Grade ${grade.id}`,
			})),
		];
	}, [grades, t]);

	const assignmentStatusOptions = useMemo(() => {
		return [
			{ value: "", label: t("common.select") },
			...(assignmentStatuses || []).map(status => ({
				value: status.id,
				label: status.meaning || status.name || `Status ${status.id}`,
			})),
		];
	}, [assignmentStatuses, t]);

	const actionReasonOptions = useMemo(() => {
		return [
			{ value: "", label: t("common.select") },
			...(actionReasons || []).map(reason => ({
				value: reason.id,
				label: reason.meaning || reason.name || `Reason ${reason.id}`,
			})),
		];
	}, [actionReasons, t]);

	// Employee options for line_manager and project_manager
	const employeeOptions = useMemo(() => {
		return [
			{ value: "", label: t("common.select") },
			...employees
				.filter(emp => emp.person?.id !== personId) // Exclude current person
				.map(emp => ({
					value: emp.person?.id || emp.id,
					label: emp.person
						? `${emp.person.first_name || ""} ${emp.person.last_name || ""}`.trim() || `Employee ${emp.id}`
						: emp.full_name || `Employee ${emp.id}`,
				})),
		];
	}, [employees, personId, t]);

	// Contract options from contracts slice
	const contractOptions = useMemo(() => {
		return [
			{ value: "", label: t("profile.assignment.fields.selectContract") || "Select Contract" },
			...contracts.map(contract => ({
				value: contract.id,
				label: contract.contract_reference || `Contract ${contract.id}`,
			})),
		];
	}, [contracts, t]);

	// Payroll options from lookups
	const payrollOptions = useMemo(() => {
		const payrollLookups = lookupValues["Payroll"] || [];
		return [
			{ value: "", label: t("profile.assignment.fields.selectPayroll") || "Select Payroll" },
			...payrollLookups
				.filter(item => item && (item.meaning || item.lookup_code))
				.map(item => ({
					value: item.id,
					label: item.meaning || item.lookup_code || `Payroll ${item.id}`,
				})),
		];
	}, [lookupValues, t]);

	// Salary Basis options from lookups
	const salaryBasisOptions = useMemo(() => {
		const salaryBasisLookups = lookupValues["Salary Basis"] || [];
		return [
			{ value: "", label: t("profile.assignment.fields.selectSalaryBasis") || "Select Salary Basis" },
			...salaryBasisLookups
				.filter(item => item && (item.meaning || item.lookup_code))
				.map(item => ({
					value: item.id,
					label: item.meaning || item.lookup_code || `Salary Basis ${item.id}`,
				})),
		];
	}, [lookupValues, t]);

	// Probation Period options from lookups
	const probationPeriodOptions = useMemo(() => {
		const probationLookups = lookupValues["Probation Period"] || [];
		return [
			{ value: "", label: t("profile.assignment.fields.selectProbationPeriod") || "Select Probation Period" },
			...probationLookups
				.filter(item => item && (item.meaning || item.lookup_code))
				.map(item => ({
					value: item.id,
					label: item.meaning || item.lookup_code || `Period ${item.id}`,
				})),
		];
	}, [lookupValues, t]);

	// Termination Notice Period options from lookups
	const terminationNoticePeriodOptions = useMemo(() => {
		const terminationLookups = lookupValues["Termination Notice Period"] || [];
		return [
			{
				value: "",
				label: t("profile.assignment.fields.selectTerminationNoticePeriod") || "Select Notice Period",
			},
			...terminationLookups
				.filter(item => item && (item.meaning || item.lookup_code))
				.map(item => ({
					value: item.id,
					label: item.meaning || item.lookup_code || `Period ${item.id}`,
				})),
		];
	}, [lookupValues, t]);

	// Hourly/Salaried options
	const hourlySalariedOptions = useMemo(
		() => [
			{ value: "", label: t("profile.assignment.fields.selectHourlySalaried") || "Select Type" },
			{ value: "Salaried", label: t("profile.assignment.options.salaried") || "Salaried" },
			{ value: "Hourly", label: t("profile.assignment.options.hourly") || "Hourly" },
		],
		[t]
	);

	// Working Frequency options
	const workingFrequencyOptions = useMemo(
		() => [
			{ value: "", label: t("profile.assignment.fields.selectWorkingFrequency") || "Select Frequency" },
			{ value: "Day", label: t("profile.assignment.options.day") || "Day" },
			{ value: "Week", label: t("profile.assignment.options.week") || "Week" },
			{ value: "Month", label: t("profile.assignment.options.month") || "Month" },
			{ value: "Year", label: t("profile.assignment.options.year") || "Year" },
		],
		[t]
	);

	// Profile form - populated from selectedEmployee
	const [profileForm, setProfileForm] = useState({
		firstNameEn: "",
		middleNameEn: "",
		lastNameEn: "",
		gender: "",
		maritalStatus: "",
		firstNameAr: "",
		middleNameAr: "",
		lastNameAr: "",
		address: "",
		addressType: "",
	});

	// Populate profile form when selectedEmployee is loaded
	useEffect(() => {
		if (selectedEmployee?.person) {
			const person = selectedEmployee.person;
			setProfileForm({
				firstNameEn: person.first_name || "",
				middleNameEn: person.middle_name || "",
				lastNameEn: person.last_name || "",
				title: person.title || "",
				gender: person.gender || "",
				maritalStatus: person.marital_status || "",
				dateOfBirth: person.date_of_birth || "",
				nationality: person.nationality || "",
				nationalId: person.national_id || "",
				religion: person.religion || "",
				bloodType: person.blood_type || "",
				email: person.email_address || "",
				firstNameAr: person.first_name_arabic || "",
				middleNameAr: person.middle_name_arabic || "",
				lastNameAr: person.last_name_arabic || "",
				address: "",
				addressType: "",
			});
		}
	}, [selectedEmployee]);

	// Assignment modals
	const [isViewAssignmentModalOpen, setIsViewAssignmentModalOpen] = useState(false);
	const [isEditAssignmentModalOpen, setIsEditAssignmentModalOpen] = useState(false);
	const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] = useState(false);
	const [selectedAssignment, setSelectedAssignment] = useState(null);

	// Create assignment form - includes all required and optional fields
	const [createAssignmentForm, setCreateAssignmentForm] = useState({
		// Required fields
		assignment_no: "",
		business_group_id: "",
		department_id: "",
		job_id: "",
		position_id: "",
		grade_id: "",
		assignment_action_reason_id: "",
		assignment_status_id: "",
		effective_start_date: "",
		// Optional fields
		primary_assignment: true,
		line_manager_id: "",
		project_manager_id: "",
		payroll_id: "",
		salary_basis_id: "",
		contract_id: "",
		probation_period_start: "",
		probation_period_id: "",
		termination_notice_period_id: "",
		hourly_salaried: "",
		working_frequency: "",
		work_start_time: "",
		work_end_time: "",
		work_from_home: false,
		is_manager: false,
		title: "",
		employment_confirmation_date: "",
		effective_end_date: "",
	});

	// Edit assignment form - same structure as create
	const [editAssignmentFormData, setEditAssignmentFormData] = useState({
		assignment_no: "",
		business_group_id: "",
		department_id: "",
		job_id: "",
		position_id: "",
		grade_id: "",
		assignment_action_reason_id: "",
		assignment_status_id: "",
		effective_start_date: "",
		primary_assignment: true,
		line_manager_id: "",
		project_manager_id: "",
		payroll_id: "",
		salary_basis_id: "",
		contract_id: "",
		probation_period_start: "",
		probation_period_id: "",
		termination_notice_period_id: "",
		hourly_salaried: "",
		working_frequency: "",
		work_start_time: "",
		work_end_time: "",
		work_from_home: false,
		is_manager: false,
		title: "",
		employment_confirmation_date: "",
		effective_end_date: "",
	});

	// Qualification modals
	const [isQualificationModalOpen, setIsQualificationModalOpen] = useState(false);
	const [isViewQualificationModalOpen, setIsViewQualificationModalOpen] = useState(false);
	const [isEditQualificationModalOpen, setIsEditQualificationModalOpen] = useState(false);
	const [selectedQualification, setSelectedQualification] = useState(null);
	const [qualificationForm, setQualificationForm] = useState(QUALIFICATION_INITIAL_STATE);
	const [competencies, setCompetencies] = useState(COMPETENCIES_LIST);
	const [isCompetenciesOpen, setIsCompetenciesOpen] = useState(false);

	// Address Modals
	const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
	const [isEditAddressModalOpen, setIsEditAddressModalOpen] = useState(false);
	const [selectedAddress, setSelectedAddress] = useState(null);
	const [addressForm, setAddressForm] = useState({
		addressId: null,
		email: "",
		isEmailMain: false,
		phone: "",
		isPhoneMain: false,
		address: "",
		isAddressMain: false,
		addressType: "",
		isAddressTypeMain: false,
		countryId: "",
		cityId: "",
		lastUpdate: "",
		isLastUpdateMain: false,
	});

	// Emergency Modals
	const [isAddEmergencyModalOpen, setIsAddEmergencyModalOpen] = useState(false);
	const [isEditEmergencyModalOpen, setIsEditEmergencyModalOpen] = useState(false);
	const [selectedEmergency, setSelectedEmergency] = useState(null);
	const [emergencyForm, setEmergencyForm] = useState({
		name: "",
		phone: "",
		relationship: "",
		contactType: "",
	});

	// Contract Modals
	const [isViewContractModalOpen, setIsViewContractModalOpen] = useState(false);
	const [isEditContractModalOpen, setIsEditContractModalOpen] = useState(false);
	const [isCreateContractModalOpen, setIsCreateContractModalOpen] = useState(false);
	const [selectedContract, setSelectedContract] = useState(null);
	const [contractForm, setContractForm] = useState({
		contract_reference: "",
		contract_status_id: "",
		contract_end_reason_id: "",
		description: "",
		contract_duration: "",
		contract_period: "Years",
		contract_start_date: "",
		contract_end_date: "",
		contractual_job_position: "",
		extension_duration: "",
		extension_period: "",
		extension_start_date: "",
		extension_end_date: "",
		basic_salary: "",
		effective_start_date: "",
		effective_end_date: "",
	});

	const [activeLevelDropdown, setActiveLevelDropdown] = useState(null);
	const levelDropdownRef = React.useRef(null);

	const departmentOptions = useMemo(() => {
		return [
			{ value: "", label: t("profile.assignment.placeholders.departmentId") },
			...departments
				.filter(dep => dep.business_group_id === parseInt(createAssignmentForm.business_group_id))
				.map(dept => ({
					value: dept.id,
					label: dept.organization_name,
				})),
		];
	}, [departments, t, createAssignmentForm.business_group_id]);

	// Close level dropdown when clicking outside
	useEffect(() => {
		if (activeLevelDropdown === null) return;

		const handleClickOutside = event => {
			if (levelDropdownRef.current && !levelDropdownRef.current.contains(event.target)) {
				setActiveLevelDropdown(null);
			}
		};

		// Use a small delay to avoid immediate closure
		const timeoutId = setTimeout(() => {
			document.addEventListener("mousedown", handleClickOutside);
		}, 0);

		return () => {
			clearTimeout(timeoutId);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [activeLevelDropdown]);

	const tabItems = [
		{ id: "general", label: t("profile.tabs.general") },
		{ id: "assignment", label: t("profile.tabs.assignment") },
		{ id: "contracts", label: t("profile.tabs.contracts") },
		{ id: "contacts", label: t("profile.tabs.contacts") },
		{ id: "qualifications", label: t("profile.tabs.qualifications") },
		{ id: "organization", label: t("profile.tabs.organization") },
	];

	const assignmentTypeOptions = useMemo(
		() => [
			{ value: "", label: t("profile.modals.fields.assignmentType") },
			{ value: "full_time", label: t("profile.modals.options.assignmentTypes.fullTime") },
			{ value: "part_time", label: t("profile.modals.options.assignmentTypes.partTime") },
			{ value: "contract", label: t("profile.modals.options.assignmentTypes.contract") },
		],
		[t]
	);

	const qualificationTypeOptions = useMemo(
		() => [
			{ value: "", label: t("profile.modals.fields.qualificationType") },
			{ value: "certificate", label: t("profile.modals.options.qualificationTypes.certificate") },
			{ value: "course", label: t("profile.modals.options.qualificationTypes.course") },
			{ value: "degree", label: t("profile.modals.options.qualificationTypes.degree") },
		],
		[t]
	);

	const handleViewAssignment = assignment => {
		setSelectedAssignment(assignment);
		setIsViewAssignmentModalOpen(true);
	};

	const handleEditAssignment = assignment => {
		setSelectedAssignment(assignment);
		setEditAssignmentFormData({
			assignment_no: assignment.assignment_no || "",
			business_group_id: assignment.business_group_id || assignment.business_group || "",
			department_id: assignment.department_id || assignment.department || "",
			job_id: assignment.job_id || assignment.job || "",
			position_id: assignment.position_id || assignment.position || "",
			grade_id: assignment.grade_id || assignment.grade || "",
			assignment_action_reason_id:
				assignment.assignment_action_reason_id || assignment.assignment_action_reason || "",
			assignment_status_id: assignment.assignment_status_id || assignment.assignment_status || "",
			effective_start_date: assignment.effective_start_date || "",
			primary_assignment: assignment.primary_assignment ?? true,
			line_manager_id: assignment.line_manager_id || assignment.line_manager || "",
			project_manager_id: assignment.project_manager_id || assignment.project_manager || "",
			payroll_id: assignment.payroll_id || assignment.payroll || "",
			salary_basis_id: assignment.salary_basis_id || assignment.salary_basis || "",
			contract_id: assignment.contract_id || assignment.contract || "",
			probation_period_start: assignment.probation_period_start || "",
			probation_period_id: assignment.probation_period_id || assignment.probation_period || "",
			termination_notice_period_id:
				assignment.termination_notice_period_id || assignment.termination_notice_period || "",
			hourly_salaried: assignment.hourly_salaried || "",
			working_frequency: assignment.working_frequency || "",
			work_start_time: assignment.work_start_time || "",
			work_end_time: assignment.work_end_time || "",
			work_from_home: assignment.work_from_home ?? false,
			is_manager: assignment.is_manager ?? false,
			title: assignment.title || "",
			employment_confirmation_date: assignment.employment_confirmation_date || "",
			effective_end_date: assignment.effective_end_date || "",
		});
		setIsEditAssignmentModalOpen(true);
	};

	// Create assignment handlers
	const handleOpenCreateAssignment = () => {
		// Navigate to the create assignment page with personId
		navigate(`/create-assignment?personId=${personId}`);
	};

	const handleCreateAssignmentChange = e => {
		const { name, value, type, checked } = e.target;
		setCreateAssignmentForm(prev => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleEditAssignmentChange = e => {
		const { name, value, type, checked } = e.target;
		setEditAssignmentFormData(prev => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleCreateAssignmentSubmit = async () => {
		if (!personId) {
			toast.error(t("profile.assignment.errors.noEmployee"));
			return;
		}

		const payload = {
			// Required fields
			person_id: personId,
			business_group_id: parseInt(createAssignmentForm.business_group_id) || null,
			assignment_no: createAssignmentForm.assignment_no,
			department_id:
				parseInt(createAssignmentForm.department_id) ||
				parseInt(createAssignmentForm.business_group_id) ||
				null,
			job_id: parseInt(createAssignmentForm.job_id) || null,
			position_id: parseInt(createAssignmentForm.position_id) || null,
			grade_id: parseInt(createAssignmentForm.grade_id) || null,
			assignment_action_reason_id: parseInt(createAssignmentForm.assignment_action_reason_id) || null,
			assignment_status_id: parseInt(createAssignmentForm.assignment_status_id) || null,
			effective_start_date: createAssignmentForm.effective_start_date,
		};

		// Optional fields - only add if they have values
		if (createAssignmentForm.primary_assignment !== undefined)
			payload.primary_assignment = createAssignmentForm.primary_assignment;
		if (createAssignmentForm.line_manager_id)
			payload.line_manager_id = parseInt(createAssignmentForm.line_manager_id);
		if (createAssignmentForm.project_manager_id)
			payload.project_manager_id = parseInt(createAssignmentForm.project_manager_id);
		if (createAssignmentForm.payroll_id) payload.payroll_id = parseInt(createAssignmentForm.payroll_id);
		if (createAssignmentForm.salary_basis_id)
			payload.salary_basis_id = parseInt(createAssignmentForm.salary_basis_id);
		if (createAssignmentForm.contract_id) payload.contract_id = parseInt(createAssignmentForm.contract_id);
		if (createAssignmentForm.probation_period_start)
			payload.probation_period_start = createAssignmentForm.probation_period_start;
		if (createAssignmentForm.probation_period_id)
			payload.probation_period_id = parseInt(createAssignmentForm.probation_period_id);
		if (createAssignmentForm.termination_notice_period_id)
			payload.termination_notice_period_id = parseInt(createAssignmentForm.termination_notice_period_id);
		if (createAssignmentForm.hourly_salaried) payload.hourly_salaried = createAssignmentForm.hourly_salaried;
		if (createAssignmentForm.working_frequency) payload.working_frequency = createAssignmentForm.working_frequency;
		if (createAssignmentForm.work_start_time) payload.work_start_time = createAssignmentForm.work_start_time;
		if (createAssignmentForm.work_end_time) payload.work_end_time = createAssignmentForm.work_end_time;
		if (createAssignmentForm.work_from_home !== undefined)
			payload.work_from_home = createAssignmentForm.work_from_home;
		if (createAssignmentForm.is_manager !== undefined) payload.is_manager = createAssignmentForm.is_manager;
		if (createAssignmentForm.title) payload.title = createAssignmentForm.title;
		if (createAssignmentForm.employment_confirmation_date)
			payload.employment_confirmation_date = createAssignmentForm.employment_confirmation_date;
		if (createAssignmentForm.effective_end_date)
			payload.effective_end_date = createAssignmentForm.effective_end_date;

		try {
			await dispatch(createAssignment(payload)).unwrap();
			toast.success(t("profile.assignment.messages.createSuccess"));
			setIsCreateAssignmentModalOpen(false);
			// Refresh assignments
			dispatch(fetchAssignments({ person: personId }));
			dispatch(fetchPrimaryAssignment(personId));
		} catch (error) {
			toast.error(parseApiError(error, t, "profile.assignment.messages.createError"));
		}
	};

	const handleEditAssignmentSubmit = async () => {
		if (!selectedAssignment?.id) {
			toast.error(t("profile.assignment.errors.noAssignment"));
			return;
		}

		const payload = {};

		// Add fields that have values
		if (editAssignmentFormData.effective_start_date)
			payload.effective_start_date = editAssignmentFormData.effective_start_date;
		if (editAssignmentFormData.assignment_no) payload.assignment_no = editAssignmentFormData.assignment_no;
		if (editAssignmentFormData.business_group_id)
			payload.business_group_id = parseInt(editAssignmentFormData.business_group_id);
		if (editAssignmentFormData.department_id)
			payload.department_id = parseInt(editAssignmentFormData.department_id);
		if (editAssignmentFormData.job_id) payload.job_id = parseInt(editAssignmentFormData.job_id);
		if (editAssignmentFormData.position_id) payload.position_id = parseInt(editAssignmentFormData.position_id);
		if (editAssignmentFormData.grade_id) payload.grade_id = parseInt(editAssignmentFormData.grade_id);
		if (editAssignmentFormData.assignment_status_id)
			payload.assignment_status_id = parseInt(editAssignmentFormData.assignment_status_id);
		if (editAssignmentFormData.assignment_action_reason_id)
			payload.assignment_action_reason_id = parseInt(editAssignmentFormData.assignment_action_reason_id);
		if (editAssignmentFormData.line_manager_id)
			payload.line_manager_id = parseInt(editAssignmentFormData.line_manager_id);
		if (editAssignmentFormData.project_manager_id)
			payload.project_manager_id = parseInt(editAssignmentFormData.project_manager_id);
		payload.primary_assignment = editAssignmentFormData.primary_assignment;
		if (editAssignmentFormData.hourly_salaried) payload.hourly_salaried = editAssignmentFormData.hourly_salaried;
		if (editAssignmentFormData.working_frequency)
			payload.working_frequency = editAssignmentFormData.working_frequency;
		if (editAssignmentFormData.work_start_time) payload.work_start_time = editAssignmentFormData.work_start_time;
		if (editAssignmentFormData.work_end_time) payload.work_end_time = editAssignmentFormData.work_end_time;
		payload.is_manager = editAssignmentFormData.is_manager;
		payload.work_from_home = editAssignmentFormData.work_from_home;
		if (editAssignmentFormData.title) payload.title = editAssignmentFormData.title;

		try {
			await dispatch(updateAssignment({ id: selectedAssignment.id, data: payload })).unwrap();
			toast.success(t("profile.assignment.messages.updateSuccess"));
			setIsEditAssignmentModalOpen(false);
			// Refresh assignments
			dispatch(fetchAssignments({ person: personId }));
			dispatch(fetchPrimaryAssignment(personId));
		} catch (error) {
			toast.error(parseApiError(error, t, "profile.assignment.messages.updateError"));
		}
	};

	const handleDeleteAssignment = async assignment => {
		if (window.confirm(t("profile.assignment.messages.confirmDelete"))) {
			try {
				await dispatch(deleteAssignment(assignment.id)).unwrap();
				toast.success(t("profile.assignment.messages.deleteSuccess"));
				dispatch(fetchAssignments({ person: personId }));
				dispatch(fetchPrimaryAssignment(personId));
			} catch (error) {
				toast.error(parseApiError(error, t, "profile.assignment.messages.deleteError"));
			}
		}
	};

	const handleQualificationChange = e => {
		const { name, value } = e.target;
		setQualificationForm(prev => ({ ...prev, [name]: value }));
	};

	const handleCompetencyToggle = id => {
		setCompetencies(prev =>
			prev.map(comp =>
				comp.id === id ? { ...comp, selected: !comp.selected, level: !comp.selected ? "" : comp.level } : comp
			)
		);
	};

	const handleCompetencyLevelChange = (id, level) => {
		setCompetencies(prev => prev.map(comp => (comp.id === id ? { ...comp, level, selected: true } : comp)));
		// Keep dropdown open to allow changing level
	};

	const handleQualificationSubmit = () => {
		setIsQualificationModalOpen(false);
		setQualificationForm(QUALIFICATION_INITIAL_STATE);
		setCompetencies(COMPETENCIES_LIST);
	};

	const handleViewQualification = qualification => {
		setSelectedQualification(qualification);
		setIsViewQualificationModalOpen(true);
	};

	const handleEditQualification = qualification => {
		setSelectedQualification(qualification);
		setQualificationForm(prev => ({
			...prev,
			qualificationTitle: qualification.qualification,
			qualificationType: qualification.type.toLowerCase(),
			status: qualification.status === "valid" || qualification.status === "active",
			gradeScore: "",
			awardingEntity: qualification.issuer,
		}));
		setIsEditQualificationModalOpen(true);
	};

	const handleAddAddress = () => {
		setAddressForm({
			email: "",
			isEmailMain: false,
			phone: "",
			isPhoneMain: false,
			address: "",
			isAddressMain: false,
			addressType: "",
			isAddressTypeMain: false,
			lastUpdate: "",
			isLastUpdateMain: false,
		});
		setIsAddAddressModalOpen(true);
	};

	const handleAddEmergency = () => {
		setEmergencyForm({
			name: "",
			phone: "",
			relationship: "",
			contactType: "",
		});
		setIsAddEmergencyModalOpen(true);
	};

	const handleEditEmergency = contact => {
		setSelectedEmergency(contact);
		// Note: The hardcoded data 'CONTACTS_DATA' has structure issues (layout in original code vs simple array).
		// Assuming we map correctly in render.
		// For now simple mapping:
		setEmergencyForm({
			name: contact.name || "Mona Ahmed", // fallback as data might be mocked/hardcoded in render
			phone: contact.phone || "01055544321",
			relationship: contact.relationship || "Wife",
			contactType: contact.contactType || "Family",
		});
		setIsEditEmergencyModalOpen(true);
	};

	const renderStatusBadge = status => {
		const isActive = status === "active";
		return (
			<span
				className={`px-3 py-1 rounded-full text-xs font-semibold ${
					isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
				}`}
			>
				{isActive ? t("common.active") : t("common.inactive")}
			</span>
		);
	};

	const renderQualificationStatus = status => {
		const statusMap = {
			valid: { className: "bg-gray-100 text-gray-600", label: t("profile.qualifications.statuses.valid") },
			completed: {
				className: "bg-green-100 text-green-700",
				label: t("profile.qualifications.statuses.completed"),
			},
		};
		const statusInfo = statusMap[status] || statusMap.valid;
		return (
			<span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
				{statusInfo.label}
			</span>
		);
	};

	const getLevelBadgeColor = level => {
		switch (level.toLowerCase()) {
			case "beginner":
				return "bg-orange-100 text-orange-600";
			case "intermediate":
				return "bg-blue-100 text-blue-600";
			case "advanced":
				return "bg-green-100 text-green-700";
			default:
				return "bg-gray-100 text-gray-600";
		}
	};

	const latestContactId = useMemo(() => {
		if (!CONTACTS_DATA.length) return null;

		return CONTACTS_DATA.reduce((latest, contact) => {
			const currentTime = new Date(contact.lastUpdate).getTime();

			if (!latest) {
				return contact;
			}

			const latestTime = new Date(latest.lastUpdate).getTime();
			return currentTime > latestTime ? contact : latest;
		}, null)?.id;
	}, []);

	// Fetch employee data when employeeId is available
	useEffect(() => {
		if (employeeId) {
			dispatch(fetchEmployeeById(employeeId));
		}

		// Cleanup on unmount
		return () => {
			dispatch(clearSelectedEmployee());
			dispatch(clearPrimaryAssignment());
		};
	}, [dispatch, employeeId]);

	// Fetch addresses and assignments when personId is available
	useEffect(() => {
		if (personId) {
			dispatch(fetchAddresses(personId));
			dispatch(fetchPrimaryAssignment(personId));
			dispatch(fetchAssignments({ person: personId }));
			dispatch(fetchContracts({ person: personId }));
		}
	}, [dispatch, personId]);

	// Fetch initial Lookups
	useEffect(() => {
		dispatch(fetchLookupValues({ lookupType: "Address Type" }));
		dispatch(fetchLookupValues({ lookupType: "Country" }));
		dispatch(fetchLookupValues({ lookupType: "Contract Status" }));
		dispatch(fetchLookupValues({ lookupType: "Contract End Reason" }));
		// Assignment optional field lookups
		dispatch(fetchLookupValues({ lookupType: "Payroll" }));
		dispatch(fetchLookupValues({ lookupType: "Salary Basis" }));
		dispatch(fetchLookupValues({ lookupType: "Probation Period" }));
		dispatch(fetchLookupValues({ lookupType: "Termination Notice Period" }));
		// Fetch assignment lookups (from core/lookups/values)
		dispatch(fetchAssignmentStatuses());
		dispatch(fetchAssignmentActionReasons());
		// Fetch Jobs, Positions, Grades, Business Groups
		dispatch(fetchJobs({ page_size: 100 }));
		dispatch(fetchPositions({ page_size: 100 }));
		dispatch(fetchGrades({ page_size: 100 }));
		dispatch(fetchBusinessGroupsFromOrganizations({ page_size: 100, status: "active" }));
		dispatch(fetchDepartmentsFromOrganizations({ page_size: 100, status: "active" }));
		// Fetch employees for manager selections
		dispatch(fetchEmployees({ page_size: 200 }));
	}, [dispatch]);

	// Sync Redux lookup values to local state for easier usage (optional, but requested in plan)
	useEffect(() => {
		if (lookupValues) {
			setLocalLookups(prev => ({
				...prev,
				addressTypes: lookupValues["Address Type"] || [],
				countries: lookupValues["Country"] || [],
				cities: lookupValues["City"] || [],
			}));
		}
	}, [lookupValues]);

	useEffect(() => {
		console.log(localLookups);
	}, [localLookups]);

	// Fetch Cities when Country changes
	// Fetch Cities when Country changes
	const handleCountryChange = countryId => {
		setAddressForm(prev => ({ ...prev, countryId, cityId: "" })); // Reset city when country changes
		if (countryId) {
			dispatch(fetchLookupValues({ lookupType: "CITY", parent: countryId }));
		} else {
			setLocalLookups(prev => ({ ...prev, cities: [] }));
		}
	};

	const handleAddAddressSubmit = async () => {
		const payload = {
			person: personId,
			address_type: addressForm.addressType,
			country: addressForm.countryId,
			city: addressForm.cityId,
			street: addressForm.address,
			email: addressForm.email,
			phone: addressForm.phone,
			is_primary: addressForm.isAddressMain,
			// Add other fields as needed by backend
		};
		const result = await dispatch(createAddress(payload));
		if (createAddress.fulfilled.match(result)) {
			setIsAddAddressModalOpen(false);
			// Reset form handled by opening
		}
	};

	const handleEditAddressSubmit = async () => {
		const payload = {
			person: personId, // Might be needed for validation
			address_type: addressForm.addressType,
			country: addressForm.countryId,
			city: addressForm.cityId,
			street: addressForm.address,
			email: addressForm.email,
			phone: addressForm.phone,
			is_primary: addressForm.isAddressMain,
		};
		const result = await dispatch(updateAddress({ id: addressForm.addressId, data: payload }));
		if (updateAddress.fulfilled.match(result)) {
			setIsEditAddressModalOpen(false);
		}
	};

	const openAddAddressModal = () => {
		setAddressForm({
			addressId: null,
			email: "",
			isEmailMain: false,
			phone: "",
			isPhoneMain: false,
			address: "",
			isAddressMain: false,
			addressType: "",
			isAddressTypeMain: false,
			countryId: "",
			cityId: "",
			lastUpdate: "",
			isLastUpdateMain: false,
		});
		setIsAddAddressModalOpen(true);
	};

	const handleEditAddress = row => {
		setAddressForm({
			addressId: row.id,
			email: row.email || "",
			isEmailMain: row.is_primary || false, // Assuming mapping
			phone: row.phone || "",
			address: row.street || "",
			addressType: row.address_type?.id || row.address_type, // Handle object or ID
			countryId: row.country?.id || row.country,
			cityId: row.city?.id || row.city,
			lastUpdate: row.updated_at ? row.updated_at.split("T")[0] : "",
		});
		if (row.country?.id || row.country) {
			dispatch(fetchLookupValues({ lookupType: "CITY", parent: row.country?.id || row.country }));
		}
		setIsEditAddressModalOpen(true);
	};

	const formatContactDate = dateString => {
		if (!dateString) return "";
		const date = new Date(dateString);
		if (Number.isNaN(date.getTime())) return dateString;

		return date
			.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			})
			.replace(/ /g, "-");
	};

	// Contract period options
	const contractPeriodOptions = useMemo(
		() => [
			{ value: "Days", label: t("profile.modals.options.periods.days") || "Days" },
			{ value: "Weeks", label: t("profile.modals.options.periods.weeks") || "Weeks" },
			{ value: "Months", label: t("profile.modals.options.periods.months") || "Months" },
			{ value: "Years", label: t("profile.modals.options.periods.years") || "Years" },
		],
		[t]
	);

	// Contract status options (from lookups)
	const contractStatusOptions = useMemo(() => {
		const statusLookups = lookupValues["Contract Status"] || [];
		return [
			{ value: "", label: t("profile.modals.fields.contractStatus") || "Contract Status" },
			...statusLookups
				.filter(status => status.is_active)
				.map(status => ({
					value: status.id,
					label: status.name,
				})),
		];
	}, [lookupValues, t]);

	// Contract end reason options (from lookups)
	const contractEndReasonOptions = useMemo(() => {
		const reasonLookups = lookupValues["Contract End Reason"] || [];
		return [
			{ value: "", label: t("profile.modals.fields.contractEndReason") || "Contract End Reason" },
			...reasonLookups
				.filter(reason => reason.is_active)
				.map(reason => ({
					value: reason.id,
					label: reason.name,
				})),
		];
	}, [lookupValues, t]);

	// Contract handlers
	const handleViewContract = contract => {
		setSelectedContract(contract);
		setIsViewContractModalOpen(true);
	};

	const handleEditContract = async contract => {
		// Fetch full contract details
		const result = await dispatch(fetchContractById(contract.id));
		if (fetchContractById.fulfilled.match(result)) {
			const contractData = result.payload;
			setContractForm({
				contract_reference: contractData.contract_reference || "",
				contract_status_id: contractData.contract_status || "",
				contract_end_reason_id: contractData.contract_end_reason || "",
				description: contractData.description || "",
				contract_duration: contractData.contract_duration || "",
				contract_period: contractData.contract_period || "Years",
				contract_start_date: contractData.contract_start_date || "",
				contract_end_date: contractData.contract_end_date || "",
				contractual_job_position: contractData.contractual_job_position || "",
				extension_duration: contractData.extension_duration || "",
				extension_period: contractData.extension_period || "",
				extension_start_date: contractData.extension_start_date || "",
				extension_end_date: contractData.extension_end_date || "",
				basic_salary: contractData.basic_salary || "",
				effective_start_date: contractData.effective_start_date || "",
				effective_end_date: contractData.effective_end_date || "",
			});
			setSelectedContract(contractData);
			setIsEditContractModalOpen(true);
		}
	};

	const handleOpenCreateContract = () => {
		setContractForm({
			contract_reference: "",
			contract_status_id: "",
			contract_end_reason_id: "",
			description: "",
			contract_duration: "",
			contract_period: "Years",
			contract_start_date: "",
			contract_end_date: "",
			contractual_job_position: "",
			extension_duration: "",
			extension_period: "",
			extension_start_date: "",
			extension_end_date: "",
			basic_salary: "",
			effective_start_date: "",
			effective_end_date: "",
		});
		setIsCreateContractModalOpen(true);
	};

	const handleContractFormChange = e => {
		const { name, value } = e.target;
		setContractForm(prev => ({ ...prev, [name]: value }));
	};

	const handleCreateContractSubmit = async () => {
		const payload = {
			person_id: personId,
			contract_reference: contractForm.contract_reference,
			contract_status_id: contractForm.contract_status_id,
			contract_duration: contractForm.contract_duration,
			contract_period: contractForm.contract_period,
			contract_start_date: contractForm.contract_start_date,
			contract_end_date: contractForm.contract_end_date,
			contractual_job_position: contractForm.contractual_job_position,
			basic_salary: contractForm.basic_salary,
			effective_start_date: contractForm.effective_start_date,
		};

		// Add optional fields only if they have values
		if (contractForm.contract_end_reason_id) payload.contract_end_reason_id = contractForm.contract_end_reason_id;
		if (contractForm.description) payload.description = contractForm.description;
		if (contractForm.extension_duration) payload.extension_duration = contractForm.extension_duration;
		if (contractForm.extension_period) payload.extension_period = contractForm.extension_period;
		if (contractForm.extension_start_date) payload.extension_start_date = contractForm.extension_start_date;
		if (contractForm.extension_end_date) payload.extension_end_date = contractForm.extension_end_date;
		if (contractForm.effective_end_date) payload.effective_end_date = contractForm.effective_end_date;

		try {
			await dispatch(createContract(payload)).unwrap();
			toast.success(t("profile.contracts.messages.contractCreated"));
			setIsCreateContractModalOpen(false);
			dispatch(fetchContracts({ person: personId }));
		} catch (error) {
			toast.error(parseApiError(error, t, "profile.contracts.messages.contractCreateFailed"));
		}
	};

	const handleEditContractSubmit = async () => {
		const payload = {
			contract_reference: contractForm.contract_reference,
			contract_status_id: contractForm.contract_status_id,
			contract_duration: contractForm.contract_duration,
			contract_period: contractForm.contract_period,
			contract_start_date: contractForm.contract_start_date,
			contract_end_date: contractForm.contract_end_date,
			contractual_job_position: contractForm.contractual_job_position,
			basic_salary: contractForm.basic_salary,
			effective_start_date: contractForm.effective_start_date,
		};

		// Add optional fields
		if (contractForm.contract_end_reason_id) payload.contract_end_reason_id = contractForm.contract_end_reason_id;
		if (contractForm.description) payload.description = contractForm.description;
		if (contractForm.extension_duration) payload.extension_duration = contractForm.extension_duration;
		if (contractForm.extension_period) payload.extension_period = contractForm.extension_period;
		if (contractForm.extension_start_date) payload.extension_start_date = contractForm.extension_start_date;
		if (contractForm.extension_end_date) payload.extension_end_date = contractForm.extension_end_date;
		if (contractForm.effective_end_date) payload.effective_end_date = contractForm.effective_end_date;

		try {
			await dispatch(updateContract({ id: selectedContract.id, data: payload })).unwrap();
			toast.success(t("profile.contracts.messages.contractUpdated"));
			setIsEditContractModalOpen(false);
			dispatch(fetchContracts({ person: personId }));
		} catch (error) {
			toast.error(parseApiError(error, t, "profile.contracts.messages.contractUpdateFailed"));
		}
	};

	const handleDeleteContract = async contractId => {
		if (window.confirm(t("profile.contracts.messages.confirmDeleteContract"))) {
			try {
				await dispatch(deleteContract(contractId)).unwrap();
				toast.success(t("profile.contracts.messages.contractDeleted"));
				dispatch(fetchContracts({ person: personId }));
			} catch (error) {
				toast.error(parseApiError(error, t, "profile.contracts.messages.contractDeleteFailed"));
			}
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<PageHeader
				icon={<ProfileIcon className="w-8 h-8 text-[#D3D3D3]" />}
				title={t("profile.title")}
				subtitle={t("profile.subtitle")}
			/>

			<div className="px-6 py-8">
				{loadingEmployee ? (
					<div className="flex items-center justify-center py-12">
						<div className="w-8 h-8 border-4 border-[#1D7A8C] border-t-transparent rounded-full animate-spin"></div>
						<span className="ml-3 text-gray-500">{t("common.loading")}</span>
					</div>
				) : !selectedEmployee && employeeId ? (
					<div className="flex flex-col items-center justify-center py-12">
						<p className="text-gray-500">{t("profile.employeeNotFound")}</p>
						<Button
							onClick={() => navigate("/employee-search")}
							title={t("common.back")}
							className="mt-4"
						/>
					</div>
				) : (
					<div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-6">
						{/* Personal Information Sidebar */}
						<aside className="bg-white rounded-2xl shadow-lg p-4">
							<h3 className="text-lg font-semibold text-[#1D7A8C]">{t("profile.personalInformation")}</h3>
							<div className="mt-4 flex items-center justify-center">
								<img
									src={userImage}
									alt={
										selectedEmployee?.person?.full_name ||
										selectedEmployee?.person_name ||
										"Employee"
									}
									className="w-60 h-50  rounded-lg object-cover"
								/>
							</div>
							<div className="mt-4 border-t border-gray-200 pt-4">
								<h2 className="text-xl font-bold text-gray-900">
									{selectedEmployee?.person?.full_name || selectedEmployee?.person_name || "-"}
								</h2>
								<div className="mt-3 text-sm text-gray-500 space-y-2">
									<div className="flex items-center justify-between">
										<span>{t("profile.employeeNo")}</span>
										<span className="text-gray-800">
											{selectedEmployee?.employee_number || "-"}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span>{t("profile.hireDate")}</span>
										<span className="text-gray-800">
											{formatContactDate(selectedEmployee?.hire_date) || "-"}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span>{t("profile.status")}</span>
										<span
											className={`px-3 py-1 rounded-full text-xs font-semibold ${
												selectedEmployee?.status === "active"
													? "bg-green-100 text-green-700"
													: "bg-gray-100 text-gray-600"
											}`}
										>
											{selectedEmployee?.status === "active"
												? t("common.active")
												: t("common.inactive")}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span>{t("profile.primaryAssignment")}</span>
									</div>
								</div>
								{primaryAssignment && (
									<div className="mt-4 border-t border-gray-200 pt-4">
										<p className="text-base font-semibold text-gray-900">
											{primaryAssignment.position_name || primaryAssignment.job_name || "-"}
										</p>
										<div className="mt-2 flex items-center gap-3">
											<span className="text-sm text-gray-600">
												{primaryAssignment.grade_name || "-"}
											</span>
											<span
												className={`px-3 py-1 rounded-full text-xs font-semibold ${
													primaryAssignment.assignment_status_name?.toLowerCase() === "active"
														? "bg-green-100 text-green-700"
														: "bg-gray-100 text-gray-600"
												}`}
											>
												{primaryAssignment.assignment_status_name || t("common.inactive")}
											</span>
										</div>
									</div>
								)}
								<div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-500 space-y-1">
									<p>
										{primaryAssignment?.job_name || selectedEmployee?.current_position_name || "-"}
									</p>
									<p>
										{primaryAssignment?.department_name ||
											selectedEmployee?.current_organization_name ||
											"-"}
									</p>
									<p>{primaryAssignment?.business_group_name || "-"}</p>
								</div>
							</div>
						</aside>

						<section className="space-y-6">
							<div className="bg-white rounded-2xl shadow-lg px-6 py-4">
								<div className="flex flex-wrap items-center gap-4">
									{tabItems.map((tab, index) => {
										const isActive = activeTab === tab.id;
										return (
											<React.Fragment key={tab.id}>
												<button
													type="button"
													onClick={() => setActiveTab(tab.id)}
													className={`flex items-center gap-3 pb-2 border-b-2 transition-colors whitespace-nowrap ${
														isActive
															? "border-[#1D7A8C] text-[#1D7A8C]"
															: "border-transparent text-gray-500 hover:text-gray-700"
													}`}
												>
													<span
														className={`w-2 h-2 rounded-full ${
															isActive ? "bg-[#1D7A8C]" : "bg-gray-300"
														}`}
													/>
													<span className="text-sm font-medium">{tab.label}</span>
												</button>
												{index < tabItems.length - 1 && (
													<div className="hidden lg:block flex-1 h-px bg-gray-200" />
												)}
											</React.Fragment>
										);
									})}
								</div>
							</div>

							{activeTab === "general" && (
								<div className="space-y-6">
									{/* Basic Information Card */}
									<div className="bg-white rounded-2xl shadow-lg p-6">
										<h4 className="text-lg font-semibold text-[#1D7A8C] mb-4 flex items-center gap-2">
											<HiOutlineUser className="w-5 h-5" />
											{t("profile.general.basicInfo")}
										</h4>
										<div className="h-px bg-gray-200 mb-6"></div>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
											<div className="space-y-1">
												<label className="text-xs text-gray-500 uppercase tracking-wide">
													{t("profile.general.fields.title")}
												</label>
												<p className="text-sm font-medium text-gray-800">
													{profileForm.title || "-"}
												</p>
											</div>
											<div className="space-y-1">
												<label className="text-xs text-gray-500 uppercase tracking-wide">
													{t("profile.general.fields.email")}
												</label>
												<p className="text-sm font-medium text-gray-800">
													{profileForm.email || "-"}
												</p>
											</div>
											<div className="space-y-1">
												<label className="text-xs text-gray-500 uppercase tracking-wide">
													{t("profile.general.fields.dateOfBirth")}
												</label>
												<p className="text-sm font-medium text-gray-800">
													{formatContactDate(profileForm.dateOfBirth) || "-"}
												</p>
											</div>
											<div className="space-y-1">
												<label className="text-xs text-gray-500 uppercase tracking-wide">
													{t("profile.general.fields.gender")}
												</label>
												<span
													className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
														profileForm.gender?.toLowerCase() === "male"
															? "bg-blue-100 text-blue-700"
															: "bg-pink-100 text-pink-700"
													}`}
												>
													{profileForm.gender || "-"}
												</span>
											</div>
											<div className="space-y-1">
												<label className="text-xs text-gray-500 uppercase tracking-wide">
													{t("profile.general.fields.maritalStatus")}
												</label>
												<p className="text-sm font-medium text-gray-800">
													{profileForm.maritalStatus || "-"}
												</p>
											</div>
											<div className="space-y-1">
												<label className="text-xs text-gray-500 uppercase tracking-wide">
													{t("profile.general.fields.nationality")}
												</label>
												<p className="text-sm font-medium text-gray-800">
													{profileForm.nationality || "-"}
												</p>
											</div>
											<div className="space-y-1">
												<label className="text-xs text-gray-500 uppercase tracking-wide">
													{t("profile.general.fields.nationalId")}
												</label>
												<p className="text-sm font-medium text-gray-800">
													{profileForm.nationalId || "-"}
												</p>
											</div>
											<div className="space-y-1">
												<label className="text-xs text-gray-500 uppercase tracking-wide">
													{t("profile.general.fields.religion")}
												</label>
												<p className="text-sm font-medium text-gray-800">
													{profileForm.religion || "-"}
												</p>
											</div>
											<div className="space-y-1">
												<label className="text-xs text-gray-500 uppercase tracking-wide">
													{t("profile.general.fields.bloodType")}
												</label>
												<span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
													{profileForm.bloodType || "-"}
												</span>
											</div>
										</div>
									</div>

									{/* Personal Information (English) */}
									<div className="bg-white rounded-2xl shadow-lg p-6">
										<h4 className="text-lg font-semibold text-[#1D7A8C] mb-4">
											{t("profile.general.personalInfoEn")}
										</h4>
										<div className="h-px bg-gray-200 mb-6"></div>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
											<div className="space-y-1">
												<label className="text-xs text-gray-500 uppercase tracking-wide">
													{t("profile.general.labels.firstNameEn")}
												</label>
												<p className="text-sm font-medium text-gray-800">
													{profileForm.firstNameEn || "-"}
												</p>
											</div>
											<div className="space-y-1">
												<label className="text-xs text-gray-500 uppercase tracking-wide">
													{t("profile.general.labels.middleNameEn")}
												</label>
												<p className="text-sm font-medium text-gray-800">
													{profileForm.middleNameEn || "-"}
												</p>
											</div>
											<div className="space-y-1">
												<label className="text-xs text-gray-500 uppercase tracking-wide">
													{t("profile.general.labels.lastNameEn")}
												</label>
												<p className="text-sm font-medium text-gray-800">
													{profileForm.lastNameEn || "-"}
												</p>
											</div>
										</div>
									</div>

									{/* Personal Information (Arabic) */}
									<div className="bg-white rounded-2xl shadow-lg p-6">
										<h4 className="text-lg font-semibold text-[#1D7A8C] mb-4" dir="rtl">
											{t("profile.general.personalInfoAr")}
										</h4>
										<div className="h-px bg-gray-200 mb-6"></div>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-6" dir="rtl">
											<div className="space-y-1">
												<label className="text-xs text-gray-500 uppercase tracking-wide">
													{t("profile.general.labels.firstNameAr")}
												</label>
												<p className="text-sm font-medium text-gray-800">
													{profileForm.firstNameAr || "-"}
												</p>
											</div>
											<div className="space-y-1">
												<label className="text-xs text-gray-500 uppercase tracking-wide">
													{t("profile.general.labels.middleNameAr")}
												</label>
												<p className="text-sm font-medium text-gray-800">
													{profileForm.middleNameAr || "-"}
												</p>
											</div>
											<div className="space-y-1">
												<label className="text-xs text-gray-500 uppercase tracking-wide">
													{t("profile.general.labels.lastNameAr")}
												</label>
												<p className="text-sm font-medium text-gray-800">
													{profileForm.lastNameAr || "-"}
												</p>
											</div>
										</div>
									</div>

									<div className="flex justify-end gap-3 mt-6">
										<Button
											onClick={() => setIsViewProfileModalOpen(true)}
											title={t("common.view")}
											className="bg-white text-[#1D7A8C] border border-[#1D7A8C] hover:bg-gray-50"
										/>
										<Button
											onClick={() => setIsEditProfileModalOpen(true)}
											title={t("profile.modals.editAssignment").replace("Assignment", "Profile")}
										/>
									</div>
								</div>
							)}

							{activeTab === "assignment" && (
								<div className="space-y-6">
									<div className="bg-white rounded-2xl shadow-lg p-6">
										<div className="flex items-center justify-between mb-4">
											<h4 className="text-lg font-semibold text-[#1D7A8C]">
												{t("profile.assignment.detailsTitle")}
											</h4>
											<Button
												onClick={handleOpenCreateAssignment}
												title={t("profile.assignment.actions.create")}
												className="bg-[#1D7A8C] text-white hover:bg-[#166070]"
											/>
										</div>
										<div className="h-px bg-gray-200 mb-6"></div>
										{loadingAssignments ? (
											<div className="flex items-center justify-center py-8">
												<div className="w-6 h-6 border-4 border-[#1D7A8C] border-t-transparent rounded-full animate-spin"></div>
												<span className="ml-3 text-gray-500">{t("common.loading")}</span>
											</div>
										) : assignments.length === 0 ? (
											<div className="text-center py-12">
												<HiOutlineBookmark className="w-12 h-12 mx-auto text-gray-300 mb-4" />
												<p className="text-gray-500 mb-4">
													{t("profile.assignment.noAssignments")}
												</p>
												<Button
													onClick={handleOpenCreateAssignment}
													title={t("profile.assignment.actions.createFirst")}
													className="bg-[#1D7A8C] text-white hover:bg-[#166070]"
												/>
											</div>
										) : (
											<CustomTable
												className="shadow-none"
												columns={[
													{
														header: t("profile.assignment.fields.assignmentNo"),
														accessor: "assignment_no",
														render: value => (
															<span className="text-gray-700 font-medium">
																{value || "-"}
															</span>
														),
													},
													{
														header: t("profile.assignment.fields.position"),
														accessor: "position_name",
														render: value => (
															<span className="text-gray-700">{value || "-"}</span>
														),
													},
													{
														header: t("profile.assignment.fields.job"),
														accessor: "job_name",
														render: value => (
															<span className="text-gray-700">{value || "-"}</span>
														),
													},
													{
														header: t("profile.assignment.fields.department"),
														accessor: "department_name",
														render: value => (
															<span className="text-gray-700">{value || "-"}</span>
														),
													},
													{
														header: t("profile.assignment.fields.grade"),
														accessor: "grade_name",
														render: value => (
															<span className="text-gray-700">{value || "-"}</span>
														),
													},
													{
														header: t("profile.assignment.fields.effectiveFrom"),
														accessor: "effective_start_date",
														render: value => (
															<span className="text-gray-700">
																{formatContactDate(value) || "-"}
															</span>
														),
													},
													{
														header: t("profile.status"),
														accessor: "status",
														render: value =>
															renderStatusBadge(
																value?.toLowerCase() === "active"
																	? "active"
																	: "inactive"
															),
													},
													{
														header: t("profile.assignment.fields.primary"),
														accessor: "primary_assignment",
														render: value =>
															value ? (
																<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
																	<HiOutlineCheck className="w-3 h-3 mr-1" />
																	{t("profile.primary")}
																</span>
															) : (
																<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-#8e6204-100 text-#fefef5a-700">
																	<HiOutlineCheck className="w-3 h-3 mr-1" />
																	{t("profile.notPrimary")}
																</span>
															),
													},
												]}
												data={assignments}
												onView={handleViewAssignment}
												onEdit={handleEditAssignment}
												onDelete={handleDeleteAssignment}
												emptyMessage={t("profile.assignment.noAssignments")}
											/>
										)}
									</div>
								</div>
							)}

							{activeTab === "contacts" && (
								<div className="space-y-6">
									{/* Address & Communication */}
									<div className="bg-transparent rounded-2xl shadow-sm pb-6">
										<div className="overflow-x-auto">
											<CustomTable
												title={t("profile.contacts.addressTitle")}
												className="shadow-none rounded-none"
												hasLatestVersion={true}
												isClosed={false}
												columns={[
													{
														header: t("profile.contacts.table.email"),
														accessor: "email", // Use "email" if available, dynamically fetched data doesn't seem to have email in the example?
														render: value => <span>{value || "N/A"}</span>,
													},
													{
														header: t("profile.contacts.table.phone"),
														accessor: "phone", // Same for phone
														render: value => <span>{value || "N/A"}</span>,
													},
													{
														header: t("profile.contacts.table.address"),
														accessor: "street", // Mapped from "street"
														render: (_, row) => (
															<span className="text-gray-700">
																{row.street}
																{row.city_name && `, ${row.city_name}`}
																{row.country_name && `, ${row.country_name}`}
															</span>
														),
													},
													{
														header: t("profile.contacts.table.addressType"),
														accessor: "address_type_name",
														render: value => <span>{value}</span>,
													},
													{
														header: t("profile.contacts.table.lastUpdate"),
														accessor: "updated_at",
														render: value => (
															<span className="text-gray-700">
																{formatContactDate(value)}
															</span>
														),
													},
													{
														header: t("profile.contacts.table.action"),
														accessor: "action",
														render: (_, row) => (
															<button
																onClick={() => handleEditAddress(row)}
																className="text-gray-400 hover:text-gray-600 p-1"
															>
																<HiOutlinePencilAlt className="w-5 h-5" />
															</button>
														),
													},
												]}
												data={addresses}
												emptyMessage={loadingAddresses ? "Loading..." : "No addresses found"}
											/>
										</div>
										<div className="flex justify-end pr-6 mt-4">
											<Button
												onClick={openAddAddressModal}
												title={t("common.add")}
												className="bg-white text-[#1D7A8C] border border-[#1D7A8C] hover:bg-gray-50 px-6"
											/>
										</div>
									</div>

									{/* Emergency / Family Contacts */}
									<div className="bg-transparent rounded-2xl pb-6 shadow-lg">
										<CustomTable
											title={t("profile.contacts.familyTitle")}
											className="shadow-none rounded-none"
											hasLatestVersion={false}
											isClosed={false}
											columns={[
												{
													header: t("profile.contacts.table.name"),
													accessor: "name",
													render: value => <span className="text-gray-700">{value}</span>,
												},
												{
													header: t("profile.contacts.table.phone"),
													accessor: "phone",
													render: value => <span className="text-gray-700">{value}</span>,
												},
												{
													header: t("profile.contacts.table.relationship"),
													accessor: "relationship",
													render: value => <span className="text-gray-700">{value}</span>,
												},
												{
													header: t("profile.contacts.table.contactType"),
													accessor: "contactType",
													render: value => <span className="text-gray-700">{value}</span>,
												},
												{
													header: t("profile.contacts.table.action"),
													accessor: "action",
													render: (_, row) => (
														<button
															onClick={() => handleEditEmergency(row)}
															className="text-gray-400 hover:text-gray-600 p-1"
														>
															<HiOutlinePencilAlt className="w-5 h-5" />
														</button>
													),
												},
											]}
											data={[
												{
													id: 1,
													name: "Mona Ahmed",
													phone: "01055544321",
													relationship: "Wife",
													contactType: "Family",
												},
												{
													id: 2,
													name: "Ali Ahmed",
													phone: "01233322111",
													relationship: "Brother",
													contactType: "Emergency",
												},
											]}
										/>
										<div className="flex justify-end pr-6 mt-4">
											<Button
												onClick={handleAddEmergency}
												title={t("common.add")}
												className="bg-white text-[#1D7A8C] border border-[#1D7A8C] hover:bg-gray-50 px-6"
											/>
										</div>
									</div>
								</div>
							)}

							{activeTab === "contracts" && (
								<div className="space-y-6">
									<div className="bg-white rounded-2xl shadow-lg p-6">
										<div className="flex items-center justify-between mb-4">
											<h4 className="text-lg font-semibold text-[#1D7A8C]">
												{t("profile.contracts.detailsTitle") || "Contract Details"}
											</h4>
											<Button
												onClick={handleOpenCreateContract}
												title={t("profile.contracts.actions.create") || "Create Contract"}
												className="bg-[#1D7A8C] text-white hover:bg-[#166070]"
											/>
										</div>
										<div className="h-px bg-gray-200 mb-6"></div>
										{loadingContracts ? (
											<div className="flex items-center justify-center py-8">
												<div className="w-6 h-6 border-4 border-[#1D7A8C] border-t-transparent rounded-full animate-spin"></div>
												<span className="ml-3 text-gray-500">
													{t("common.loading") || "Loading..."}
												</span>
											</div>
										) : contracts.length === 0 ? (
											<div className="text-center py-12">
												<HiOutlineBookmark className="w-12 h-12 mx-auto text-gray-300 mb-4" />
												<p className="text-gray-500 mb-4">
													{t("profile.contracts.noContracts") || "No contracts found"}
												</p>
												<Button
													onClick={handleOpenCreateContract}
													title={
														t("profile.contracts.actions.createFirst") ||
														"Create First Contract"
													}
													className="bg-[#1D7A8C] text-white hover:bg-[#166070]"
												/>
											</div>
										) : (
											<CustomTable
												className="shadow-none"
												columns={[
													{
														header: t("profile.contracts.fields.reference") || "Reference",
														accessor: "contract_reference",
														render: value => (
															<span className="text-gray-700 font-medium">
																{value || "-"}
															</span>
														),
													},
													{
														header: t("profile.contracts.fields.position") || "Position",
														accessor: "contractual_job_position",
														render: value => (
															<span className="text-gray-700">{value || "-"}</span>
														),
													},
													{
														header: t("profile.contracts.fields.startDate") || "Start Date",
														accessor: "contract_start_date",
														render: value => (
															<span className="text-gray-700">
																{formatContactDate(value) || "-"}
															</span>
														),
													},
													{
														header: t("profile.contracts.fields.endDate") || "End Date",
														accessor: "contract_end_date",
														render: value => (
															<span className="text-gray-700">
																{formatContactDate(value) || "-"}
															</span>
														),
													},
													{
														header: t("profile.contracts.fields.duration") || "Duration",
														accessor: "contract_duration",
														render: (value, row) => (
															<span className="text-gray-700">
																{value} {row.contract_period || ""}
															</span>
														),
													},
													{
														header: t("profile.contracts.fields.salary") || "Salary",
														accessor: "basic_salary",
														render: value => (
															<span className="text-gray-700">
																{value ? `${parseFloat(value).toLocaleString()}` : "-"}
															</span>
														),
													},
													{
														header: t("profile.contracts.fields.status") || "Status",
														accessor: "contract_status_name",
														render: value => (
															<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
																{value || "-"}
															</span>
														),
													},
												]}
												data={contracts}
												onView={handleViewContract}
												onEdit={handleEditContract}
												onDelete={handleDeleteContract}
												emptyMessage={
													t("profile.contracts.noContracts") || "No contracts found"
												}
											/>
										)}
									</div>
								</div>
							)}

							{activeTab === "qualifications" && (
								<div className="space-y-4">
									<div className="bg-white rounded-2xl shadow-lg p-6">
										<CustomTable
											className="shadow-none"
											title={t("profile.qualifications.title")}
											columns={[
												{
													header: t("profile.qualifications.table.type"),
													accessor: "type",
													render: value => (
														<span className="text-sm text-gray-700">{value}</span>
													),
												},
												{
													header: t("profile.qualifications.table.qualification"),
													accessor: "qualification",
													render: value => (
														<span className="text-sm text-gray-700">{value}</span>
													),
												},
												{
													header: t("profile.qualifications.table.issuer"),
													accessor: "issuer",
													render: value => (
														<span className="text-sm text-gray-700">{value}</span>
													),
												},
												{
													header: t("profile.qualifications.table.year"),
													accessor: "year",
													render: value => (
														<span className="text-sm text-gray-700">{value}</span>
													),
												},
												{
													header: t("profile.qualifications.table.status"),
													accessor: "status",
													render: value => renderQualificationStatus(value),
												},
											]}
											data={QUALIFICATION_DATA}
											onView={handleViewQualification}
											onEdit={handleEditQualification}
										/>
									</div>

									<div className="bg-white rounded-2xl shadow-lg p-4 flex items-center justify-end">
										<Button
											onClick={() => setIsQualificationModalOpen(true)}
											title={t("profile.qualifications.actions.add")}
										/>
									</div>
								</div>
							)}

							{activeTab === "organization" && (
								<div className="space-y-6">
									<div className="bg-white rounded-2xl shadow-lg p-6">
										<h4 className="text-lg font-semibold text-[#1D7A8C] mb-3">
											{t("profile.organization.title")}
										</h4>
										<div className="h-px bg-gray-200 mb-6"></div>
										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<label className="text-sm text-gray-500 font-normal">
													{t("profile.organization.fields.title")}
												</label>
												<p className="text-gray-800 font-bold">
													{primaryAssignment?.business_group_name ||
														selectedEmployee?.current_organization_name ||
														"-"}
												</p>
											</div>
											<div className="flex items-center justify-between">
												<label className="text-sm text-gray-500 font-normal">
													{t("profile.organization.fields.businessGroup")}
												</label>
												<p className="text-gray-800 font-bold">
													{primaryAssignment?.business_group_name || "-"}
												</p>
											</div>
											<div className="flex items-center justify-between">
												<label className="text-sm text-gray-500 font-normal">
													{t("profile.organization.fields.department")}
												</label>
												<p className="text-gray-800 font-bold">
													{primaryAssignment?.department_name || "-"}
												</p>
											</div>
											<div className="flex items-center justify-between">
												<label className="text-sm text-gray-500 font-normal">
													{t("profile.organization.fields.location")}
												</label>
												<p className="text-gray-800 font-bold">
													{primaryAssignment?.location_name || "-"}
												</p>
											</div>
											<div className="flex items-center justify-between">
												<label className="text-sm text-gray-500 font-normal">
													{t("profile.organization.fields.manager")}
												</label>
												<p className="text-gray-800 font-bold">
													{primaryAssignment?.line_manager_name || "-"}
												</p>
											</div>
										</div>
									</div>
								</div>
							)}
						</section>
					</div>
				)}
			</div>

			{/* View Profile Modal */}
			<SlideUpModal
				isOpen={isViewProfileModalOpen}
				onClose={() => setIsViewProfileModalOpen(false)}
				title={t("common.view") + " Profile"}
				maxWidth="760px"
			>
				<div className="py-6 space-y-6">
					<div>
						<h4 className="text-base font-semibold text-[#1D7A8C] mb-4">
							{t("profile.general.personalInfoEn")}
						</h4>
						<div className="border-t border-gray-200 pt-4 space-y-3">
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">{t("profile.general.fields.firstName")}</span>
								<span className="text-sm font-medium text-gray-900">{profileForm.firstNameEn}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">{t("profile.general.fields.middleName")}</span>
								<span className="text-sm font-medium text-gray-900">{profileForm.middleNameEn}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">{t("profile.general.fields.lastName")}</span>
								<span className="text-sm font-medium text-gray-900">{profileForm.lastNameEn}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">{t("profile.general.fields.gender")}</span>
								<span className="text-sm font-medium text-[#1D7A8C] uppercase">
									{profileForm.gender}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">
									{t("profile.general.fields.maritalStatus")}
								</span>
								<span className="text-sm font-medium text-[#1D7A8C]">
									{profileForm.maritalStatus.charAt(0).toUpperCase() +
										profileForm.maritalStatus.slice(1)}
								</span>
							</div>
						</div>
					</div>

					<div>
						<h4 className="text-base font-semibold text-[#1D7A8C] mb-4">
							{t("profile.general.personalInfoAr")}
						</h4>
						<div className="border-t border-gray-200 pt-4 space-y-3" dir="rtl">
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">{t("profile.general.labels.firstNameAr")}</span>
								<span className="text-sm font-medium text-gray-900">{profileForm.firstNameAr}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">
									{t("profile.general.labels.middleNameAr")}
								</span>
								<span className="text-sm font-medium text-gray-900">{profileForm.middleNameAr}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">{t("profile.general.labels.lastNameAr")}</span>
								<span className="text-sm font-medium text-gray-900">{profileForm.lastNameAr}</span>
							</div>
						</div>
					</div>

					<div>
						<h4 className="text-base font-semibold text-[#1D7A8C] mb-4">{t("profile.general.address")}</h4>
						<div className="border-t border-gray-200 pt-4 space-y-3">
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">{t("profile.general.fields.address")}</span>
								<span className="text-sm font-medium text-gray-900">{profileForm.address}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">{t("profile.general.fields.addressType")}</span>
								<span className="text-sm font-medium text-gray-900">{profileForm.addressType}</span>
							</div>
						</div>
					</div>
				</div>
				<div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
					<Button
						onClick={() => setIsViewProfileModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
				</div>
			</SlideUpModal>

			{/* Edit Profile Modal */}
			<SlideUpModal
				isOpen={isEditProfileModalOpen}
				onClose={() => setIsEditProfileModalOpen(false)}
				title="Edit Profile"
				maxWidth="760px"
			>
				<div className="py-6 space-y-6">
					<div>
						<h4 className="text-sm font-bold text-gray-700 uppercase mb-4">
							{t("profile.general.personalInfoEn").toUpperCase()}
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("profile.general.fields.firstName")}
								value={profileForm.firstNameEn}
								onChange={e => setProfileForm(prev => ({ ...prev, firstNameEn: e.target.value }))}
							/>
							<FloatingLabelInput
								label={t("profile.general.fields.middleName")}
								value={profileForm.middleNameEn}
								onChange={e => setProfileForm(prev => ({ ...prev, middleNameEn: e.target.value }))}
							/>
							<FloatingLabelInput
								label={t("profile.general.fields.lastName")}
								className="md:col-span-2"
								value={profileForm.lastNameEn}
								onChange={e => setProfileForm(prev => ({ ...prev, lastNameEn: e.target.value }))}
							/>
							<FloatingLabelSelect
								label={t("profile.general.fields.gender")}
								value={profileForm.gender}
								onChange={e => setProfileForm(prev => ({ ...prev, gender: e.target.value }))}
								options={[
									{ value: "male", label: "Male" },
									{ value: "female", label: "Female" },
								]}
							/>
							<FloatingLabelSelect
								label={t("profile.general.fields.maritalStatus")}
								value={profileForm.maritalStatus}
								onChange={e => setProfileForm(prev => ({ ...prev, maritalStatus: e.target.value }))}
								options={[
									{ value: "single", label: "Single" },
									{ value: "married", label: "Married" },
								]}
							/>
						</div>
					</div>

					<div>
						<h4 className="text-sm font-bold text-gray-700 uppercase mb-4">
							{t("profile.general.personalInfoAr").toUpperCase()}
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
							<FloatingLabelInput
								label={t("profile.general.labels.firstNameAr")}
								value={profileForm.firstNameAr}
								onChange={e => setProfileForm(prev => ({ ...prev, firstNameAr: e.target.value }))}
							/>
							<FloatingLabelInput
								label={t("profile.general.labels.middleNameAr")}
								value={profileForm.middleNameAr}
								onChange={e => setProfileForm(prev => ({ ...prev, middleNameAr: e.target.value }))}
							/>
							<FloatingLabelInput
								label={t("profile.general.labels.lastNameAr")}
								className="md:col-span-2"
								value={profileForm.lastNameAr}
								onChange={e => setProfileForm(prev => ({ ...prev, lastNameAr: e.target.value }))}
							/>
						</div>
					</div>

					<div>
						<h4 className="text-sm font-bold text-gray-700 uppercase mb-4">
							{t("profile.general.address").toUpperCase()}
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("profile.general.fields.address")}
								value={profileForm.address}
								onChange={e => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
							/>
							<FloatingLabelSelect
								label={t("profile.general.fields.addressType")}
								value={profileForm.addressType}
								onChange={e => setProfileForm(prev => ({ ...prev, addressType: e.target.value }))}
								options={[
									{ value: "Home", label: "Home" },
									{ value: "Office", label: "Office" },
								]}
							/>
						</div>
					</div>
				</div>
				<div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
					<Button
						onClick={() => setIsEditProfileModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
					<Button onClick={() => setIsEditProfileModalOpen(false)} title={t("common.edit")} />
				</div>
			</SlideUpModal>

			{/* View Assignment Modal */}
			<SlideUpModal
				isOpen={isViewAssignmentModalOpen}
				onClose={() => setIsViewAssignmentModalOpen(false)}
				title={t("profile.modals.viewAssignment")}
				maxWidth="560px"
			>
				{selectedAssignment && (
					<div className="py-6">
						<h4 className="text-base font-semibold text-[#1D7A8C] mb-4">
							{t("profile.modals.assignmentDetails")}
						</h4>
						<div className="border-t border-gray-200 pt-4 space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">{t("profile.assignment.fields.title")}</span>
								<span className="text-sm font-medium text-gray-900">{selectedAssignment.title}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">
									{t("profile.assignment.fields.assignmentType")}
								</span>
								<span className="text-sm font-medium text-gray-900">{selectedAssignment.type}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">
									{t("profile.assignment.fields.effectiveFrom")}
								</span>
								<span className="text-sm font-medium text-gray-900">
									{selectedAssignment.effectiveFrom}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">
									{t("profile.assignment.fields.assignmentStatus")}
								</span>
								{renderStatusBadge(selectedAssignment.status)}
							</div>
						</div>
					</div>
				)}
				<div className="flex items-center justify-end gap-3 py-4 border-t border-gray-200 mt-4">
					<Button
						onClick={() => setIsViewAssignmentModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none"
					/>
				</div>
			</SlideUpModal>

			{/* Edit Assignment Modal */}
			<SlideUpModal
				isOpen={isEditAssignmentModalOpen}
				onClose={() => setIsEditAssignmentModalOpen(false)}
				title={t("profile.modals.editAssignment")}
				maxWidth="900px"
			>
				<div className="py-6 space-y-6 max-h-[70vh] overflow-y-auto">
					{/* Required Fields Section */}
					<div className="space-y-4">
						<h4 className="text-sm font-semibold text-gray-700 border-b pb-2">
							{t("profile.assignment.fields.requiredFields")}
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("profile.assignment.fields.assignmentNo")}
								name="assignment_no"
								value={editAssignmentFormData.assignment_no}
								onChange={handleEditAssignmentChange}
								required
							/>
							<FloatingLabelInput
								label={t("profile.assignment.fields.effectiveFrom")}
								name="effective_start_date"
								type="date"
								value={editAssignmentFormData.effective_start_date}
								onChange={handleEditAssignmentChange}
								required
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("profile.assignment.fields.businessGroup")}
								name="business_group_id"
								value={editAssignmentFormData.business_group_id}
								onChange={handleEditAssignmentChange}
								options={businessGroupOptions}
								required
							/>
							<FloatingLabelSelect
								label={t("profile.assignment.fields.department")}
								name="department_id"
								value={editAssignmentFormData.department_id}
								onChange={handleEditAssignmentChange}
								options={departmentOptions}
								required
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("profile.assignment.fields.job")}
								name="job_id"
								value={editAssignmentFormData.job_id}
								onChange={handleEditAssignmentChange}
								options={jobOptions}
								required
							/>
							<FloatingLabelSelect
								label={t("profile.assignment.fields.position")}
								name="position_id"
								value={editAssignmentFormData.position_id}
								onChange={handleEditAssignmentChange}
								options={positionOptions}
								required
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("profile.assignment.fields.grade")}
								name="grade_id"
								value={editAssignmentFormData.grade_id}
								onChange={handleEditAssignmentChange}
								options={gradeOptions}
								required
							/>
							<FloatingLabelSelect
								label={t("profile.assignment.fields.assignmentStatus")}
								name="assignment_status_id"
								value={editAssignmentFormData.assignment_status_id}
								onChange={handleEditAssignmentChange}
								options={assignmentStatusOptions}
								required
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("profile.assignment.fields.actionReason")}
								name="assignment_action_reason_id"
								value={editAssignmentFormData.assignment_action_reason_id}
								onChange={handleEditAssignmentChange}
								options={actionReasonOptions}
								required
							/>
							<div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
								<label className="text-sm text-gray-600">
									{t("profile.assignment.fields.isPrimary")}
								</label>
								<Toggle
									checked={editAssignmentFormData.primary_assignment}
									onChange={checked =>
										setEditAssignmentFormData(prev => ({ ...prev, primary_assignment: checked }))
									}
								/>
							</div>
						</div>
					</div>

					{/* Optional Fields Section */}
					<div className="space-y-4">
						<h4 className="text-sm font-semibold text-gray-700 border-b pb-2">
							{t("profile.assignment.fields.optionalFields")}
						</h4>

						{/* Managers */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("profile.assignment.fields.lineManager")}
								name="line_manager_id"
								value={editAssignmentFormData.line_manager_id}
								onChange={handleEditAssignmentChange}
								options={employeeOptions}
							/>
							<FloatingLabelSelect
								label={t("profile.assignment.fields.projectManager")}
								name="project_manager_id"
								value={editAssignmentFormData.project_manager_id}
								onChange={handleEditAssignmentChange}
								options={employeeOptions}
							/>
						</div>

						{/* Payroll & Salary */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("profile.assignment.fields.payroll")}
								name="payroll_id"
								value={editAssignmentFormData.payroll_id}
								onChange={handleEditAssignmentChange}
								options={payrollOptions}
							/>
							<FloatingLabelSelect
								label={t("profile.assignment.fields.salaryBasis")}
								name="salary_basis_id"
								value={editAssignmentFormData.salary_basis_id}
								onChange={handleEditAssignmentChange}
								options={salaryBasisOptions}
							/>
						</div>

						{/* Contract & Title */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("profile.assignment.fields.contract")}
								name="contract_id"
								value={editAssignmentFormData.contract_id}
								onChange={handleEditAssignmentChange}
								options={contractOptions}
							/>
							<FloatingLabelInput
								label={t("profile.assignment.fields.title")}
								name="title"
								value={editAssignmentFormData.title}
								onChange={handleEditAssignmentChange}
							/>
						</div>

						{/* Hourly/Salaried & Working Frequency */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("profile.assignment.fields.hourlySalaried")}
								name="hourly_salaried"
								value={editAssignmentFormData.hourly_salaried}
								onChange={handleEditAssignmentChange}
								options={hourlySalariedOptions}
							/>
							<FloatingLabelSelect
								label={t("profile.assignment.fields.workingFrequency")}
								name="working_frequency"
								value={editAssignmentFormData.working_frequency}
								onChange={handleEditAssignmentChange}
								options={workingFrequencyOptions}
							/>
						</div>

						{/* Work Times */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("profile.assignment.fields.workStartTime")}
								name="work_start_time"
								type="time"
								value={editAssignmentFormData.work_start_time}
								onChange={handleEditAssignmentChange}
							/>
							<FloatingLabelInput
								label={t("profile.assignment.fields.workEndTime")}
								name="work_end_time"
								type="time"
								value={editAssignmentFormData.work_end_time}
								onChange={handleEditAssignmentChange}
							/>
						</div>

						{/* Boolean Options */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
								<label className="text-sm text-gray-600">
									{t("profile.assignment.fields.isManager")}
								</label>
								<Toggle
									checked={editAssignmentFormData.is_manager}
									onChange={checked =>
										setEditAssignmentFormData(prev => ({ ...prev, is_manager: checked }))
									}
								/>
							</div>
							<div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
								<label className="text-sm text-gray-600">
									{t("profile.assignment.fields.workFromHome")}
								</label>
								<Toggle
									checked={editAssignmentFormData.work_from_home}
									onChange={checked =>
										setEditAssignmentFormData(prev => ({ ...prev, work_from_home: checked }))
									}
								/>
							</div>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-end gap-3 py-4 border-t border-gray-200 mt-2">
					<Button
						onClick={() => setIsEditAssignmentModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
					<Button
						onClick={handleEditAssignmentSubmit}
						title={updatingAssignment ? t("common.saving") : t("common.save")}
						className="shadow-none px-8"
						disabled={updatingAssignment}
					/>
				</div>
			</SlideUpModal>

			{/* Create Assignment Modal */}
			<SlideUpModal
				isOpen={isCreateAssignmentModalOpen}
				onClose={() => setIsCreateAssignmentModalOpen(false)}
				title={t("profile.assignment.modals.createTitle")}
				maxWidth="900px"
			>
				<div className="py-6 space-y-6 max-h-[70vh] overflow-y-auto">
					{/* Required Fields Section */}
					<div className="space-y-4">
						<h4 className="text-sm font-semibold text-gray-700 border-b pb-2">
							{t("profile.assignment.fields.requiredFields")}
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("profile.assignment.fields.assignmentNo")}
								name="assignment_no"
								value={createAssignmentForm.assignment_no}
								onChange={handleCreateAssignmentChange}
								required
							/>
							<FloatingLabelInput
								label={t("profile.assignment.fields.effectiveFrom")}
								name="effective_start_date"
								type="date"
								value={createAssignmentForm.effective_start_date}
								onChange={handleCreateAssignmentChange}
								required
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("profile.assignment.fields.businessGroup")}
								name="business_group_id"
								value={createAssignmentForm.business_group_id}
								onChange={handleCreateAssignmentChange}
								options={businessGroupOptions}
								required
							/>
							<FloatingLabelSelect
								label={t("profile.assignment.fields.department")}
								name="department_id"
								value={createAssignmentForm.department_id}
								onChange={handleCreateAssignmentChange}
								options={departmentOptions}
								required
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("profile.assignment.fields.job")}
								name="job_id"
								value={createAssignmentForm.job_id}
								onChange={handleCreateAssignmentChange}
								options={jobOptions}
								required
							/>
							<FloatingLabelSelect
								label={t("profile.assignment.fields.position")}
								name="position_id"
								value={createAssignmentForm.position_id}
								onChange={handleCreateAssignmentChange}
								options={positionOptions}
								required
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("profile.assignment.fields.grade")}
								name="grade_id"
								value={createAssignmentForm.grade_id}
								onChange={handleCreateAssignmentChange}
								options={gradeOptions}
								required
							/>
							<FloatingLabelSelect
								label={t("profile.assignment.fields.assignmentStatus")}
								name="assignment_status_id"
								value={createAssignmentForm.assignment_status_id}
								onChange={handleCreateAssignmentChange}
								options={assignmentStatusOptions}
								required
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("profile.assignment.fields.actionReason")}
								name="assignment_action_reason_id"
								value={createAssignmentForm.assignment_action_reason_id}
								onChange={handleCreateAssignmentChange}
								options={actionReasonOptions}
								required
							/>
							<div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
								<label className="text-sm text-gray-600">
									{t("profile.assignment.fields.isPrimary")}
								</label>
								<Toggle
									checked={createAssignmentForm.primary_assignment}
									onChange={checked =>
										setCreateAssignmentForm(prev => ({ ...prev, primary_assignment: checked }))
									}
								/>
							</div>
						</div>
					</div>

					{/* Optional Fields Section */}
					<div className="space-y-4">
						<h4 className="text-sm font-semibold text-gray-700 border-b pb-2">
							{t("profile.assignment.fields.optionalFields")}
						</h4>

						{/* Managers */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("profile.assignment.fields.lineManager")}
								name="line_manager_id"
								value={createAssignmentForm.line_manager_id}
								onChange={handleCreateAssignmentChange}
								options={employeeOptions}
							/>
							<FloatingLabelSelect
								label={t("profile.assignment.fields.projectManager")}
								name="project_manager_id"
								value={createAssignmentForm.project_manager_id}
								onChange={handleCreateAssignmentChange}
								options={employeeOptions}
							/>
						</div>

						{/* Payroll & Salary */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("profile.assignment.fields.payroll")}
								name="payroll_id"
								value={createAssignmentForm.payroll_id}
								onChange={handleCreateAssignmentChange}
								options={payrollOptions}
							/>
							<FloatingLabelSelect
								label={t("profile.assignment.fields.salaryBasis")}
								name="salary_basis_id"
								value={createAssignmentForm.salary_basis_id}
								onChange={handleCreateAssignmentChange}
								options={salaryBasisOptions}
							/>
						</div>

						{/* Contract & Title */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("profile.assignment.fields.contract")}
								name="contract_id"
								value={createAssignmentForm.contract_id}
								onChange={handleCreateAssignmentChange}
								options={contractOptions}
							/>
							<FloatingLabelInput
								label={t("profile.assignment.fields.title")}
								name="title"
								value={createAssignmentForm.title}
								onChange={handleCreateAssignmentChange}
							/>
						</div>

						{/* Probation Period */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("profile.assignment.fields.probationPeriodStart")}
								name="probation_period_start"
								type="date"
								value={createAssignmentForm.probation_period_start}
								onChange={handleCreateAssignmentChange}
							/>
							<FloatingLabelSelect
								label={t("profile.assignment.fields.probationPeriod")}
								name="probation_period_id"
								value={createAssignmentForm.probation_period_id}
								onChange={handleCreateAssignmentChange}
								options={probationPeriodOptions}
							/>
						</div>

						{/* Termination & Employment Dates */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("profile.assignment.fields.terminationNoticePeriod")}
								name="termination_notice_period_id"
								value={createAssignmentForm.termination_notice_period_id}
								onChange={handleCreateAssignmentChange}
								options={terminationNoticePeriodOptions}
							/>
							<FloatingLabelInput
								label={t("profile.assignment.fields.employmentConfirmationDate")}
								name="employment_confirmation_date"
								type="date"
								value={createAssignmentForm.employment_confirmation_date}
								onChange={handleCreateAssignmentChange}
							/>
						</div>

						{/* Effective End Date */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("profile.assignment.fields.effectiveTo")}
								name="effective_end_date"
								type="date"
								value={createAssignmentForm.effective_end_date}
								onChange={handleCreateAssignmentChange}
							/>
							<div></div>
						</div>

						{/* Hourly/Salaried & Working Frequency */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("profile.assignment.fields.hourlySalaried")}
								name="hourly_salaried"
								value={createAssignmentForm.hourly_salaried}
								onChange={handleCreateAssignmentChange}
								options={hourlySalariedOptions}
							/>
							<FloatingLabelSelect
								label={t("profile.assignment.fields.workingFrequency")}
								name="working_frequency"
								value={createAssignmentForm.working_frequency}
								onChange={handleCreateAssignmentChange}
								options={workingFrequencyOptions}
							/>
						</div>

						{/* Work Times */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("profile.assignment.fields.workStartTime")}
								name="work_start_time"
								type="time"
								value={createAssignmentForm.work_start_time}
								onChange={handleCreateAssignmentChange}
							/>
							<FloatingLabelInput
								label={t("profile.assignment.fields.workEndTime")}
								name="work_end_time"
								type="time"
								value={createAssignmentForm.work_end_time}
								onChange={handleCreateAssignmentChange}
							/>
						</div>

						{/* Boolean Options */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
								<label className="text-sm text-gray-600">
									{t("profile.assignment.fields.isManager")}
								</label>
								<Toggle
									checked={createAssignmentForm.is_manager}
									onChange={checked =>
										setCreateAssignmentForm(prev => ({ ...prev, is_manager: checked }))
									}
								/>
							</div>
							<div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
								<label className="text-sm text-gray-600">
									{t("profile.assignment.fields.workFromHome")}
								</label>
								<Toggle
									checked={createAssignmentForm.work_from_home}
									onChange={checked =>
										setCreateAssignmentForm(prev => ({ ...prev, work_from_home: checked }))
									}
								/>
							</div>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-end gap-3 py-4 border-t border-gray-200 mt-2">
					<Button
						onClick={() => setIsCreateAssignmentModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
					<Button
						onClick={handleCreateAssignmentSubmit}
						title={creatingAssignment ? t("common.creating") : t("common.create")}
						className="shadow-none px-8"
						disabled={creatingAssignment}
					/>
				</div>
			</SlideUpModal>

			{/* View Qualification Modal */}
			<SlideUpModal
				isOpen={isViewQualificationModalOpen}
				onClose={() => setIsViewQualificationModalOpen(false)}
				title="View Qualification"
				maxWidth="760px"
			>
				{selectedQualification && (
					<div className="py-6">
						<h4 className="text-base font-semibold text-[#1D7A8C] mb-4">Qualification Details</h4>
						<div className="border-t border-gray-200 pt-4 space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">{t("profile.qualifications.table.type")}</span>
								<span className="text-sm font-medium text-gray-900">{selectedQualification.type}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">
									{t("profile.qualifications.table.qualification")}
								</span>
								<span className="text-sm font-medium text-gray-900">
									{selectedQualification.qualification}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">
									{t("profile.qualifications.table.issuer")}
								</span>
								<span className="text-sm font-medium text-gray-900">
									{selectedQualification.issuer}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">{t("profile.qualifications.table.year")}</span>
								<span className="text-sm font-medium text-[#1D7A8C]">{selectedQualification.year}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">
									{t("profile.qualifications.fields.status")}
								</span>
								{renderQualificationStatus(selectedQualification.status)}
							</div>
						</div>
					</div>
				)}
				<div className="flex items-center justify-end gap-3 py-4 border-t border-gray-200 mt-4">
					<Button
						onClick={() => setIsViewQualificationModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
				</div>
			</SlideUpModal>

			{/* Edit Qualification Modal (compact, like design) */}
			<SlideUpModal
				isOpen={isEditQualificationModalOpen}
				onClose={() => setIsEditQualificationModalOpen(false)}
				title="Edit Qualification"
				maxWidth="760px"
			>
				<div className="py-6 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelSelect
							label={t("profile.qualifications.table.type")}
							name="qualificationType"
							value={qualificationForm.qualificationType}
							onChange={handleQualificationChange}
							options={qualificationTypeOptions}
						/>
						<FloatingLabelInput
							label={t("profile.qualifications.table.qualification")}
							name="qualificationTitle"
							value={qualificationForm.qualificationTitle}
							onChange={handleQualificationChange}
						/>
						<FloatingLabelInput
							label={t("profile.qualifications.table.year")}
							name="year"
							value={selectedQualification?.year || ""}
							onChange={() => {}}
							disabled
						/>
						<FloatingLabelInput
							label={t("profile.qualifications.table.issuer")}
							name="awardingEntity"
							value={qualificationForm.awardingEntity}
							onChange={handleQualificationChange}
						/>
					</div>
					<div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
						<label className="text-sm text-gray-600">{t("profile.qualifications.fields.status")}</label>
						<Toggle
							checked={qualificationForm.status === true}
							onChange={checked => setQualificationForm(prev => ({ ...prev, status: checked }))}
							className="py-1"
						/>
					</div>
				</div>
				<div className="flex items-center justify-end gap-3 py-4 border-t border-gray-200 mt-2">
					<Button
						onClick={() => setIsEditQualificationModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
					<Button
						onClick={() => setIsEditQualificationModalOpen(false)}
						title={t("common.edit")}
						className="shadow-none px-8"
					/>
				</div>
			</SlideUpModal>

			<SlideUpModal
				isOpen={isQualificationModalOpen}
				onClose={() => setIsQualificationModalOpen(false)}
				title={t("profile.modals.addQualification")}
				maxWidth="760px"
			>
				<div className="py-4 space-y-6">
					{/* Basic Information Section */}
					<div>
						<h4 className="text-base font-bold text-black mb-6  pl-3 flex items-center gap-2 uppercase">
							<HiOutlineBookmark className="w-5 h-5 text-[#1D7A8C]" />
							{t("profile.qualifications.sections.basicInfo")}
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={`${t("profile.qualifications.fields.qualificationTitle")} *`}
								name="qualificationTitle"
								value={qualificationForm.qualificationTitle}
								onChange={handleQualificationChange}
								options={[
									{ value: "", label: `${t("profile.qualifications.fields.qualificationTitle")} *` },
								]}
								required
							/>
							<FloatingLabelSelect
								label={`${t("profile.qualifications.fields.qualificationType")}`}
								name="qualificationType"
								value={qualificationForm.qualificationType}
								onChange={handleQualificationChange}
								options={qualificationTypeOptions}
								required
							/>
							<div className="flex items-center justify-between bg-gray-50 rounded-xl px-2 border border-gray-200">
								<label className="text-sm text-gray-600 font-medium">
									{t("profile.qualifications.fields.status")} <span className="text-red-400">*</span>
								</label>
								<Toggle
									checked={qualificationForm.status === true}
									onChange={checked => setQualificationForm(prev => ({ ...prev, status: checked }))}
									className="py-2"
								/>
							</div>
							<FloatingLabelInput
								label={t("profile.qualifications.fields.titleIfOthers")}
								name="titleOther"
								value={qualificationForm.titleOther || ""}
								onChange={handleQualificationChange}
							/>
							<FloatingLabelInput
								label={t("profile.qualifications.fields.gradeScore")}
								name="gradeScore"
								value={qualificationForm.gradeScore || ""}
								onChange={handleQualificationChange}
							/>
							<FloatingLabelInput
								label={t("profile.qualifications.fields.awardingEntity")}
								name="awardingEntity"
								value={qualificationForm.awardingEntity}
								onChange={handleQualificationChange}
							/>
						</div>
					</div>

					{/* Timeline & Progress Section */}
					<div>
						<h4 className="text-base font-bold text-black mb-6  pl-3 flex items-center gap-2 uppercase ">
							<HiOutlineBookmark className="w-5 h-5 text-[#1D7A8C]" />
							{t("profile.qualifications.sections.timeline")}
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FloatingLabelInput
								label={t("profile.qualifications.fields.studyStartDate")}
								name="studyStartDate"
								type="date"
								value={qualificationForm.studyStartDate || ""}
								onChange={handleQualificationChange}
							/>
							<FloatingLabelInput
								label={t("profile.qualifications.fields.studyEndDate")}
								name="studyEndDate"
								type="date"
								value={qualificationForm.studyEndDate || ""}
								onChange={handleQualificationChange}
							/>
							<FloatingLabelInput
								label={t("profile.qualifications.fields.awardedDate")}
								name="awardedDate"
								type="date"
								value={qualificationForm.awardedDate || ""}
								onChange={handleQualificationChange}
							/>
							<FloatingLabelInput
								label={t("profile.qualifications.fields.projectedCompletion")}
								name="projectedCompletion"
								type="date"
								value={qualificationForm.projectedCompletion || ""}
								onChange={handleQualificationChange}
							/>
						</div>
					</div>

					{/* Competencies Section */}
					<div>
						<button
							type="button"
							onClick={() => setIsCompetenciesOpen(!isCompetenciesOpen)}
							className="w-full flex items-center justify-between text-lg font-semibold text-[#1D7A8C] mb-6  pl-3 pr-2"
						>
							<span className="flex items-center gap-2">
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
									/>
								</svg>
								{t("profile.qualifications.sections.competencies")}
							</span>
							<HiOutlineChevronDown
								className={`w-5 h-5 transition-transform ${isCompetenciesOpen ? "rotate-180" : ""}`}
							/>
						</button>
						{isCompetenciesOpen && (
							<div className="relative" ref={levelDropdownRef}>
								{/* Competencies List */}
								<div className="space-y-2 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg p-4">
									{competencies.map(comp => (
										<div key={comp.id} className="flex items-center justify-between p-2 relative">
											<div className="flex items-center gap-2 flex-1">
												<span className="w-2 h-2 rounded-full bg-green-500"></span>
												<span className="text-sm text-gray-700">{comp.name}</span>
											</div>
											<div className="flex items-center gap-1 relative">
												<button
													type="button"
													onClick={e => {
														e.stopPropagation();
														if (comp.selected) {
															setActiveLevelDropdown(
																activeLevelDropdown === comp.id ? null : comp.id
															);
														}
													}}
													className={`w-6 h-6 flex items-center justify-center rounded-md border transition-colors ${
														comp.selected
															? "border-[#1D7A8C] bg-white text-[#1D7A8C]"
															: "border-gray-300 bg-white text-gray-300 cursor-not-allowed"
													}`}
													disabled={!comp.selected}
												>
													<HiOutlineChevronDown className="w-3.5 h-3.5" />
												</button>
												<button
													type="button"
													onClick={e => {
														e.stopPropagation();
														const newSelected = !comp.selected;
														setCompetencies(prev =>
															prev.map(c =>
																c.id === comp.id
																	? {
																			...c,
																			selected: newSelected,
																			level: newSelected ? c.level || "" : "",
																		}
																	: c
															)
														);
														if (!newSelected && activeLevelDropdown === comp.id) {
															setActiveLevelDropdown(null);
														}
													}}
													className={`w-6 h-6 flex items-center justify-center rounded-md border transition-colors ${
														comp.selected
															? "border-[#1D7A8C] bg-[#1D7A8C] text-white"
															: "border-[#1D7A8C] bg-white text-[#1D7A8C]"
													}`}
												>
													<HiOutlineCheck className="w-4 h-4" />
												</button>

												{/* Level Selection Popover */}
												{activeLevelDropdown === comp.id && comp.selected && (
													<div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[140px]">
														<div className="space-y-1">
															{["Beginner", "Intermediate", "Advanced"].map(level => {
																const levelLower = level.toLowerCase();
																const isSelected = comp.level === levelLower;
																return (
																	<button
																		key={level}
																		type="button"
																		onClick={e => {
																			e.stopPropagation();
																			handleCompetencyLevelChange(
																				comp.id,
																				levelLower
																			);
																			setActiveLevelDropdown(null);
																		}}
																		className={`w-full text-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
																			isSelected
																				? levelLower === "beginner"
																					? "bg-orange-100 text-orange-600"
																					: levelLower === "intermediate"
																						? "bg-blue-100 text-blue-600"
																						: "bg-green-100 text-green-700"
																				: levelLower === "beginner"
																					? "bg-orange-100 text-orange-600 hover:bg-orange-200"
																					: levelLower === "intermediate"
																						? "bg-blue-100 text-blue-600 hover:bg-blue-200"
																						: "bg-green-100 text-green-700 hover:bg-green-200"
																		}`}
																	>
																		{level}
																	</button>
																);
															})}
														</div>
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Completion Percentage Section */}
					<div>
						<h4 className="text-lg font-semibold text-[#1D7A8C] mb-6  pl-3">
							{t("profile.qualifications.sections.completion")}
						</h4>
						<div className="flex items-center gap-4">
							<input
								type="range"
								min="0"
								max="100"
								value={qualificationForm.completionPercentage || 0}
								onChange={e =>
									setQualificationForm(prev => ({
										...prev,
										completionPercentage: parseInt(e.target.value),
									}))
								}
								className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1D7A8C]"
							/>
							<span className="text-lg font-semibold text-[#1D7A8C] min-w-[60px] text-right">
								{qualificationForm.completionPercentage || 0}%
							</span>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-end gap-3 py-4">
					<Button onClick={() => setIsQualificationModalOpen(false)} title={t("common.cancel")} />
					<Button onClick={handleQualificationSubmit} title={t("common.add")} className="shadow-none" />
				</div>
			</SlideUpModal>

			{/* Add Address Modal */}
			<SlideUpModal
				isOpen={isAddAddressModalOpen}
				onClose={() => setIsAddAddressModalOpen(false)}
				title={t("profile.contacts.modals.addAddress")}
				maxWidth="760px"
			>
				<div className="py-6 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("profile.contacts.table.email")}
							name="email"
							value={addressForm.email}
							onChange={e => setAddressForm(prev => ({ ...prev, email: e.target.value }))}
						/>
						<FloatingLabelInput
							label={t("profile.contacts.table.phone")}
							name="phone"
							value={addressForm.phone}
							onChange={e => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.addressType")}
							name="addressType"
							value={addressForm.addressType}
							onChange={e => setAddressForm(prev => ({ ...prev, addressType: e.target.value }))}
							options={addressTypeOptions}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.country")}
							name="country"
							value={addressForm.countryId}
							onChange={e => handleCountryChange(e.target.value)}
							options={countriesTypeOptions}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.city")}
							name="city"
							value={addressForm.cityId}
							onChange={e => setAddressForm(prev => ({ ...prev, cityId: e.target.value }))}
							options={citiesTypeOptions}
						/>
						<FloatingLabelInput
							label={t("profile.contacts.table.address")}
							name="address"
							value={addressForm.address}
							onChange={e => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
						/>
					</div>
				</div>
				<div className="flex justify-end pt-4 border-t border-gray-200 mt-2 gap-3">
					<Button
						onClick={() => setIsAddAddressModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
					<Button onClick={handleAddAddressSubmit} title={t("common.add")} className="shadow-none px-8" />
				</div>
			</SlideUpModal>

			{/* Edit Address Modal */}
			<SlideUpModal
				isOpen={isEditAddressModalOpen}
				onClose={() => setIsEditAddressModalOpen(false)}
				title={t("profile.contacts.modals.editAddress")}
				maxWidth="760px"
			>
				<div className="py-6 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("profile.contacts.table.email")}
							name="email"
							value={addressForm.email}
							onChange={e => setAddressForm(prev => ({ ...prev, email: e.target.value }))}
						/>
						<FloatingLabelInput
							label={t("profile.contacts.table.phone")}
							name="phone"
							value={addressForm.phone}
							onChange={e => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.addressType")}
							name="addressType"
							value={addressForm.addressType}
							onChange={e => setAddressForm(prev => ({ ...prev, addressType: e.target.value }))}
							options={localLookups.addressTypes.map(t => ({ value: t.id, label: t.nameEn }))}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.country")}
							name="country"
							value={addressForm.countryId}
							onChange={e => handleCountryChange(e.target.value)}
							options={localLookups.countries.map(c => ({ value: c.id, label: c.nameEn }))}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.city")}
							name="city"
							value={addressForm.cityId}
							onChange={e => setAddressForm(prev => ({ ...prev, cityId: e.target.value }))}
							options={localLookups.cities.map(c => ({ value: c.id, label: c.nameEn }))}
						/>
						<FloatingLabelInput
							label={t("profile.contacts.table.address")}
							name="address"
							value={addressForm.address}
							onChange={e => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
						/>
					</div>
				</div>
				<div className="flex justify-end pt-4 border-t border-gray-200 mt-2 gap-3">
					<Button
						onClick={() => setIsEditAddressModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
					<Button onClick={handleEditAddressSubmit} title={t("common.edit")} className="shadow-none px-8" />
				</div>
			</SlideUpModal>

			{/* Add Emergency Modal */}
			<SlideUpModal
				isOpen={isAddEmergencyModalOpen}
				onClose={() => setIsAddEmergencyModalOpen(false)}
				title={t("profile.contacts.modals.addEmergency")}
				maxWidth="760px"
			>
				<div className="py-6 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("profile.contacts.table.name")}
							value={emergencyForm.name}
							onChange={e => setEmergencyForm(prev => ({ ...prev, name: e.target.value }))}
						/>
						<FloatingLabelInput
							label={t("profile.contacts.table.phone")}
							value={emergencyForm.phone}
							onChange={e => setEmergencyForm(prev => ({ ...prev, phone: e.target.value }))}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.relationship")}
							value={emergencyForm.relationship}
							onChange={e => setEmergencyForm(prev => ({ ...prev, relationship: e.target.value }))}
							options={[
								{ value: "Wife", label: "Wife" },
								{ value: "Brother", label: "Brother" },
								{ value: "Father", label: "Father" },
							]}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.contactType")}
							value={emergencyForm.contactType}
							onChange={e => setEmergencyForm(prev => ({ ...prev, contactType: e.target.value }))}
							options={[
								{ value: "Family", label: "Family" },
								{ value: "Emergency", label: "Emergency" },
							]}
						/>
					</div>
				</div>
				<div className="flex justify-end pt-4 border-t border-gray-200 mt-2 gap-3">
					<Button
						onClick={() => setIsAddEmergencyModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
					<Button
						onClick={() => setIsAddEmergencyModalOpen(false)}
						title={t("common.add")}
						className="shadow-none px-8"
					/>
				</div>
			</SlideUpModal>

			{/* Edit Emergency Modal */}
			<SlideUpModal
				isOpen={isEditEmergencyModalOpen}
				onClose={() => setIsEditEmergencyModalOpen(false)}
				title={t("profile.contacts.modals.editEmergency")}
				maxWidth="760px"
			>
				<div className="py-6 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("profile.contacts.table.name")}
							value={emergencyForm.name}
							onChange={e => setEmergencyForm(prev => ({ ...prev, name: e.target.value }))}
						/>
						<FloatingLabelInput
							label={t("profile.contacts.table.phone")}
							value={emergencyForm.phone}
							onChange={e => setEmergencyForm(prev => ({ ...prev, phone: e.target.value }))}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.relationship")}
							value={emergencyForm.relationship}
							onChange={e => setEmergencyForm(prev => ({ ...prev, relationship: e.target.value }))}
							options={[
								{ value: "Wife", label: "Wife" },
								{ value: "Brother", label: "Brother" },
								{ value: "Father", label: "Father" },
							]}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.contactType")}
							value={emergencyForm.contactType}
							onChange={e => setEmergencyForm(prev => ({ ...prev, contactType: e.target.value }))}
							options={[
								{ value: "Family", label: "Family" },
								{ value: "Emergency", label: "Emergency" },
							]}
						/>
					</div>
				</div>
				<div className="flex justify-end pt-4 border-t border-gray-200 mt-2 gap-3">
					<Button
						onClick={() => setIsEditEmergencyModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
					<Button
						onClick={() => setIsEditEmergencyModalOpen(false)}
						title={t("common.edit")}
						className="shadow-none px-8"
					/>
				</div>
			</SlideUpModal>

			{/* View Contract Modal */}
			<SlideUpModal
				isOpen={isViewContractModalOpen}
				onClose={() => setIsViewContractModalOpen(false)}
				title={t("profile.modals.viewContract") || "View Contract"}
				maxWidth="760px"
			>
				{selectedContract && (
					<div className="py-6">
						<h4 className="text-base font-semibold text-[#1D7A8C] mb-4">
							{t("profile.modals.contractDetails") || "Contract Details"}
						</h4>
						<div className="border-t border-gray-200 pt-4 space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<span className="text-sm text-gray-500">
										{t("profile.contracts.fields.reference") || "Reference"}
									</span>
									<p className="text-sm font-medium text-gray-900">
										{selectedContract.contract_reference}
									</p>
								</div>
								<div>
									<span className="text-sm text-gray-500">
										{t("profile.contracts.fields.status") || "Status"}
									</span>
									<p className="text-sm font-medium text-gray-900">
										{selectedContract.contract_status_name}
									</p>
								</div>
								<div>
									<span className="text-sm text-gray-500">
										{t("profile.contracts.fields.position") || "Position"}
									</span>
									<p className="text-sm font-medium text-gray-900">
										{selectedContract.contractual_job_position}
									</p>
								</div>
								<div>
									<span className="text-sm text-gray-500">
										{t("profile.contracts.fields.salary") || "Salary"}
									</span>
									<p className="text-sm font-medium text-gray-900">{selectedContract.basic_salary}</p>
								</div>
								<div>
									<span className="text-sm text-gray-500">
										{t("profile.contracts.fields.startDate") || "Start Date"}
									</span>
									<p className="text-sm font-medium text-gray-900">
										{selectedContract.contract_start_date}
									</p>
								</div>
								<div>
									<span className="text-sm text-gray-500">
										{t("profile.contracts.fields.endDate") || "End Date"}
									</span>
									<p className="text-sm font-medium text-gray-900">
										{selectedContract.contract_end_date}
									</p>
								</div>
								<div>
									<span className="text-sm text-gray-500">
										{t("profile.contracts.fields.duration") || "Duration"}
									</span>
									<p className="text-sm font-medium text-gray-900">
										{selectedContract.contract_duration} {selectedContract.contract_period}
									</p>
								</div>
								{selectedContract.extension_duration && (
									<div>
										<span className="text-sm text-gray-500">
											{t("profile.contracts.fields.extension") || "Extension"}
										</span>
										<p className="text-sm font-medium text-gray-900">
											{selectedContract.extension_duration} {selectedContract.extension_period}
										</p>
									</div>
								)}
							</div>
							{selectedContract.description && (
								<div>
									<span className="text-sm text-gray-500">
										{t("profile.contracts.fields.description") || "Description"}
									</span>
									<p className="text-sm font-medium text-gray-900 mt-1">
										{selectedContract.description}
									</p>
								</div>
							)}
						</div>
					</div>
				)}
				<div className="flex items-center justify-end gap-3 py-4 border-t border-gray-200 mt-4">
					<Button
						onClick={() => setIsViewContractModalOpen(false)}
						title={t("common.close") || "Close"}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none"
					/>
				</div>
			</SlideUpModal>

			{/* Edit Contract Modal */}
			<SlideUpModal
				isOpen={isEditContractModalOpen}
				onClose={() => setIsEditContractModalOpen(false)}
				title={t("profile.modals.editContract") || "Edit Contract"}
				maxWidth="760px"
			>
				<div className="py-6 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("profile.contracts.fields.reference") || "Contract Reference"}
							name="contract_reference"
							value={contractForm.contract_reference}
							onChange={handleContractFormChange}
							required
						/>
						<FloatingLabelSelect
							label={t("profile.contracts.fields.status") || "Contract Status"}
							name="contract_status_id"
							value={contractForm.contract_status_id}
							onChange={handleContractFormChange}
							options={contractStatusOptions}
							required
						/>
						<FloatingLabelInput
							label={t("profile.contracts.fields.position") || "Job Position"}
							name="contractual_job_position"
							value={contractForm.contractual_job_position}
							onChange={handleContractFormChange}
							required
						/>
						<FloatingLabelInput
							label={t("profile.contracts.fields.salary") || "Basic Salary"}
							name="basic_salary"
							type="number"
							step="0.01"
							value={contractForm.basic_salary}
							onChange={handleContractFormChange}
							required
						/>
						<FloatingLabelInput
							label={t("profile.contracts.fields.startDate") || "Start Date"}
							name="contract_start_date"
							type="date"
							value={contractForm.contract_start_date}
							onChange={handleContractFormChange}
							required
						/>
						<FloatingLabelInput
							label={t("profile.contracts.fields.endDate") || "End Date"}
							name="contract_end_date"
							type="date"
							value={contractForm.contract_end_date}
							onChange={handleContractFormChange}
							required
						/>
						<FloatingLabelInput
							label={t("profile.contracts.fields.duration") || "Duration"}
							name="contract_duration"
							type="number"
							step="0.01"
							value={contractForm.contract_duration}
							onChange={handleContractFormChange}
							required
						/>
						<FloatingLabelSelect
							label={t("profile.contracts.fields.period") || "Period"}
							name="contract_period"
							value={contractForm.contract_period}
							onChange={handleContractFormChange}
							options={contractPeriodOptions}
							required
						/>
						<FloatingLabelInput
							label={t("profile.contracts.fields.effectiveStartDate") || "Effective Start Date"}
							name="effective_start_date"
							type="date"
							value={contractForm.effective_start_date}
							onChange={handleContractFormChange}
							required
						/>
						<FloatingLabelInput
							label={t("profile.contracts.fields.effectiveEndDate") || "Effective End Date"}
							name="effective_end_date"
							type="date"
							value={contractForm.effective_end_date}
							onChange={handleContractFormChange}
						/>
						<FloatingLabelSelect
							label={t("profile.contracts.fields.endReason") || "End Reason"}
							name="contract_end_reason_id"
							value={contractForm.contract_end_reason_id}
							onChange={handleContractFormChange}
							options={contractEndReasonOptions}
						/>
					</div>
					<FloatingLabelInput
						label={t("profile.contracts.fields.description") || "Description"}
						name="description"
						value={contractForm.description}
						onChange={handleContractFormChange}
					/>
					<div className="border-t border-gray-200 pt-4 mt-4">
						<h5 className="text-sm font-semibold text-gray-700 mb-3">
							{t("profile.contracts.fields.extension") || "Extension Details"} (
							{t("common.optional") || "Optional"})
						</h5>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("profile.contracts.fields.extensionDuration") || "Extension Duration"}
								name="extension_duration"
								type="number"
								step="0.01"
								value={contractForm.extension_duration}
								onChange={handleContractFormChange}
							/>
							<FloatingLabelSelect
								label={t("profile.contracts.fields.extensionPeriod") || "Extension Period"}
								name="extension_period"
								value={contractForm.extension_period}
								onChange={handleContractFormChange}
								options={contractPeriodOptions}
							/>
							<FloatingLabelInput
								label={t("profile.contracts.fields.extensionStartDate") || "Extension Start Date"}
								name="extension_start_date"
								type="date"
								value={contractForm.extension_start_date}
								onChange={handleContractFormChange}
							/>
							<FloatingLabelInput
								label={t("profile.contracts.fields.extensionEndDate") || "Extension End Date"}
								name="extension_end_date"
								type="date"
								value={contractForm.extension_end_date}
								onChange={handleContractFormChange}
							/>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-end gap-3 py-4 border-t border-gray-200 mt-2">
					<Button
						onClick={() => setIsEditContractModalOpen(false)}
						title={t("common.cancel") || "Cancel"}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
					<Button
						onClick={handleEditContractSubmit}
						title={t("common.save") || "Save"}
						className="shadow-none px-8"
						disabled={updatingContract}
					/>
				</div>
			</SlideUpModal>

			{/* Create Contract Modal */}
			<SlideUpModal
				isOpen={isCreateContractModalOpen}
				onClose={() => setIsCreateContractModalOpen(false)}
				title={t("profile.contracts.modals.createTitle") || "Create Contract"}
				maxWidth="760px"
			>
				<div className="py-6 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("profile.contracts.fields.reference") || "Contract Reference"}
							name="contract_reference"
							value={contractForm.contract_reference}
							onChange={handleContractFormChange}
							required
						/>
						<FloatingLabelSelect
							label={t("profile.contracts.fields.status") || "Contract Status"}
							name="contract_status_id"
							value={contractForm.contract_status_id}
							onChange={handleContractFormChange}
							options={contractStatusOptions}
							required
						/>
						<FloatingLabelInput
							label={t("profile.contracts.fields.position") || "Job Position"}
							name="contractual_job_position"
							value={contractForm.contractual_job_position}
							onChange={handleContractFormChange}
							required
						/>
						<FloatingLabelInput
							label={t("profile.contracts.fields.salary") || "Basic Salary"}
							name="basic_salary"
							type="number"
							step="0.01"
							value={contractForm.basic_salary}
							onChange={handleContractFormChange}
							required
						/>
						<FloatingLabelInput
							label={t("profile.contracts.fields.startDate") || "Start Date"}
							name="contract_start_date"
							type="date"
							value={contractForm.contract_start_date}
							onChange={handleContractFormChange}
							required
						/>
						<FloatingLabelInput
							label={t("profile.contracts.fields.endDate") || "End Date"}
							name="contract_end_date"
							type="date"
							value={contractForm.contract_end_date}
							onChange={handleContractFormChange}
							required
						/>
						<FloatingLabelInput
							label={t("profile.contracts.fields.duration") || "Duration"}
							name="contract_duration"
							type="number"
							step="0.01"
							value={contractForm.contract_duration}
							onChange={handleContractFormChange}
							required
						/>
						<FloatingLabelSelect
							label={t("profile.contracts.fields.period") || "Period"}
							name="contract_period"
							value={contractForm.contract_period}
							onChange={handleContractFormChange}
							options={contractPeriodOptions}
							required
						/>
						<FloatingLabelInput
							label={t("profile.contracts.fields.effectiveStartDate") || "Effective Start Date"}
							name="effective_start_date"
							type="date"
							value={contractForm.effective_start_date}
							onChange={handleContractFormChange}
							required
						/>
						<FloatingLabelInput
							label={t("profile.contracts.fields.effectiveEndDate") || "Effective End Date"}
							name="effective_end_date"
							type="date"
							value={contractForm.effective_end_date}
							onChange={handleContractFormChange}
						/>
						<FloatingLabelSelect
							label={t("profile.contracts.fields.endReason") || "End Reason"}
							name="contract_end_reason_id"
							value={contractForm.contract_end_reason_id}
							onChange={handleContractFormChange}
							options={contractEndReasonOptions}
						/>
					</div>
					<FloatingLabelInput
						label={t("profile.contracts.fields.description") || "Description"}
						name="description"
						value={contractForm.description}
						onChange={handleContractFormChange}
					/>
					<div className="border-t border-gray-200 pt-4 mt-4">
						<h5 className="text-sm font-semibold text-gray-700 mb-3">
							{t("profile.contracts.fields.extension") || "Extension Details"} (
							{t("common.optional") || "Optional"})
						</h5>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("profile.contracts.fields.extensionDuration") || "Extension Duration"}
								name="extension_duration"
								type="number"
								step="0.01"
								value={contractForm.extension_duration}
								onChange={handleContractFormChange}
							/>
							<FloatingLabelSelect
								label={t("profile.contracts.fields.extensionPeriod") || "Extension Period"}
								name="extension_period"
								value={contractForm.extension_period}
								onChange={handleContractFormChange}
								options={contractPeriodOptions}
							/>
							<FloatingLabelInput
								label={t("profile.contracts.fields.extensionStartDate") || "Extension Start Date"}
								name="extension_start_date"
								type="date"
								value={contractForm.extension_start_date}
								onChange={handleContractFormChange}
							/>
							<FloatingLabelInput
								label={t("profile.contracts.fields.extensionEndDate") || "Extension End Date"}
								name="extension_end_date"
								type="date"
								value={contractForm.extension_end_date}
								onChange={handleContractFormChange}
							/>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-end gap-3 py-4 border-t border-gray-200 mt-2">
					<Button
						onClick={() => setIsCreateContractModalOpen(false)}
						title={t("common.cancel") || "Cancel"}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
					<Button
						onClick={handleCreateContractSubmit}
						title={t("common.create") || "Create"}
						className="shadow-none px-8"
						disabled={creatingContract}
					/>
				</div>
			</SlideUpModal>
			<ToastContainer position="top-right" autoClose={3000} />
		</div>
	);
};

export default ProfilePage;
