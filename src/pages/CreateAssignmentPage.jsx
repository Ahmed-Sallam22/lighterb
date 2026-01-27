import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PageHeader from "../components/shared/PageHeader";
import Card from "../components/shared/Card";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import Button from "../components/shared/Button";
import Toggle from "../components/shared/Toggle";
import { FiArrowLeft, FiArrowRight, FiCheck, FiBriefcase } from "react-icons/fi";

import { createAssignment, clearError } from "../store/assignmentsSlice";
import { fetchOrganizations, fetchDepartmentsFromOrganizations } from "../store/organizationsSlice";
import { fetchJobs } from "../store/jobsSlice";
import { fetchPositions } from "../store/positionsSlice";
import { fetchGrades } from "../store/gradesSlice";
import { fetchLookupValues } from "../store/lookupsSlice";
import { fetchEmployees } from "../store/employeesSlice";
import { fetchContracts } from "../store/contractsSlice";
import { parseApiError } from "../utils/errorHandler";

// Initial form state
const INITIAL_FORM_STATE = {
	// Step 1: Basic Assignment Info
	assignment_no: "",
	effective_start_date: "",
	effective_end_date: "",
	primary_assignment: true,
	title: "",

	// Step 2: Organization Details
	business_group_id: "",
	department_id: "",
	job_id: "",
	position_id: "",
	grade_id: "",

	// Step 3: Status & Managers
	assignment_status_id: "",
	assignment_action_reason_id: "",
	line_manager_id: "",
	project_manager_id: "",
	is_manager: false,

	// Step 4: Compensation & Schedule
	payroll_id: "",
	salary_basis_id: "",
	contract_id: "",
	hourly_salaried: "",
	working_frequency: "",
	work_start_time: "",
	work_end_time: "",
	work_from_home: false,

	// Step 5: Probation & Dates
	probation_period_start: "",
	probation_period_id: "",
	termination_notice_period_id: "",
	employment_confirmation_date: "",
};

const CreateAssignmentPage = () => {
	const { t, i18n } = useTranslation();
	usePageTitle(t("createAssignment.title"));
	const isRtl = i18n.dir() === "rtl";
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [searchParams] = useSearchParams();

	// Get personId from query params
	const personId = searchParams.get("personId");

	// Redux state
	const { creating, actionError } = useSelector(state => state.assignments || {});
	const { organizations = [] } = useSelector(state => state.organizations || {});
	const { departments = [] } = useSelector(state => state.organizations || {});
	const { jobs = [] } = useSelector(state => state.jobs || {});
	const { positions = [] } = useSelector(state => state.positions || {});
	const { grades = [] } = useSelector(state => state.grades || {});
	const { employees = [] } = useSelector(state => state.employees || {});
	const { contracts = [] } = useSelector(state => state.contracts || {});
	const { lookupValues = {} } = useSelector(state => state.lookups || {});

	// Local state
	const [currentStep, setCurrentStep] = useState(0);
	const [formData, setFormData] = useState(INITIAL_FORM_STATE);
	const [formErrors, setFormErrors] = useState({});
	const [completedSteps, setCompletedSteps] = useState([]);

	// Steps configuration
	const steps = useMemo(
		() => [
			{ id: "basic", label: t("createAssignment.steps.basic"), icon: "1" },
			{ id: "organization", label: t("createAssignment.steps.organization"), icon: "2" },
			{ id: "status", label: t("createAssignment.steps.status"), icon: "3" },
			{ id: "compensation", label: t("createAssignment.steps.compensation"), icon: "4" },
			{ id: "probation", label: t("createAssignment.steps.probation"), icon: "5" },
		],
		[t]
	);

	// Fetch required data on mount
	useEffect(() => {
		dispatch(fetchOrganizations({ page_size: 100 }));
		dispatch(fetchDepartmentsFromOrganizations({ page_size: 100, status: "active" }));
		dispatch(fetchJobs({ page_size: 100 }));
		dispatch(fetchPositions({ page_size: 100 }));
		dispatch(fetchGrades({ page_size: 100 }));
		dispatch(fetchEmployees({ page_size: 100 }));
		dispatch(fetchLookupValues({ lookupType: "Assignment Status" }));
		dispatch(fetchLookupValues({ lookupType: "Assignment Action Reason" }));
		dispatch(fetchLookupValues({ lookupType: "Payroll" }));
		dispatch(fetchLookupValues({ lookupType: "Salary Basis" }));
		dispatch(fetchLookupValues({ lookupType: "Probation Period" }));
		dispatch(fetchLookupValues({ lookupType: "Termination Notice Period" }));
		dispatch(fetchLookupValues({ lookupType: "Working Frequency" }));

		if (personId) {
			dispatch(fetchContracts({ person: personId }));
		}
	}, [dispatch, personId]);

	// Show error toast
	useEffect(() => {
		if (actionError) {
			const errorMsg =
				typeof actionError === "object" ? Object.values(actionError).flat().join(", ") : actionError;
			toast.error(errorMsg, { autoClose: 5000 });
			dispatch(clearError());
		}
	}, [actionError, dispatch]);

	// Options
	const businessGroupOptions = useMemo(() => {
		return [
			{ value: "", label: t("createAssignment.placeholders.businessGroup") },
			...organizations.map(org => ({
				value: org.id,
				label: org.organization_name || org.code || "Unnamed",
			})),
		];
	}, [organizations, t]);

	const departmentOptions = useMemo(() => {
		return [
			{ value: "", label: t("createAssignment.placeholders.department") },
			...departments
				.filter(dept => dept.business_group_id === parseInt(formData.business_group_id))
				.map(dept => ({
					value: dept.id,
					label: dept.organization_name,
				})),
		];
	}, [departments, t, formData.business_group_id]);

	const jobOptions = useMemo(() => {
		return [
			{ value: "", label: t("createAssignment.placeholders.job") },
			...jobs.map(job => ({
				value: job.id,
				label: job.job_name || job.name || job.code || "Unnamed",
			})),
		];
	}, [jobs, t]);

	const positionOptions = useMemo(() => {
		return [
			{ value: "", label: t("createAssignment.placeholders.position") },
			...positions.map(pos => ({
				value: pos.id,
				label: pos.name || pos.code || "Unnamed",
			})),
		];
	}, [positions, t]);

	const gradeOptions = useMemo(() => {
		return [
			{ value: "", label: t("createAssignment.placeholders.grade") },
			...grades.map(grade => ({
				value: grade.id,
				label: grade.grade_name,
			})),
		];
	}, [grades, t]);

	const employeeOptions = useMemo(() => {
		return [
			{ value: "", label: t("createAssignment.placeholders.selectManager") },
			...employees.map(emp => ({
				value: emp.id,
				label: emp.person_name || `${emp.first_name} ${emp.last_name}` || emp.employee_number,
			})),
		];
	}, [employees, t]);

	const contractOptions = useMemo(() => {
		return [
			{ value: "", label: t("createAssignment.placeholders.contract") },
			...contracts.map(contract => ({
				value: contract.id,
				label: contract.reference || `Contract #${contract.id}`,
			})),
		];
	}, [contracts, t]);

	const createLookupOptions = useCallback(
		(lookupType, placeholder) => {
			const values = lookupValues[lookupType] || [];
			console.log("Lookup values for", lookupType, values);
			return [
				{ value: "", label: placeholder },
				...values.map(val => ({
					value: val.id,
					label: val.name,
				})),
			];
		},
		[lookupValues]
	);

	const assignmentStatusOptions = useMemo(
		() => createLookupOptions("Assignment Status", t("createAssignment.placeholders.assignmentStatus")),
		[createLookupOptions, t]
	);

	const actionReasonOptions = useMemo(
		() => createLookupOptions("Assignment Action Reason", t("createAssignment.placeholders.actionReason")),
		[createLookupOptions, t]
	);

	const payrollOptions = useMemo(
		() => createLookupOptions("Payroll", t("createAssignment.placeholders.payroll")),
		[createLookupOptions, t]
	);

	const salaryBasisOptions = useMemo(
		() => createLookupOptions("Salary Basis", t("createAssignment.placeholders.salaryBasis")),
		[createLookupOptions, t]
	);

	const probationPeriodOptions = useMemo(
		() => createLookupOptions("Probation Period", t("createAssignment.placeholders.probationPeriod")),
		[createLookupOptions, t]
	);

	const terminationNoticePeriodOptions = useMemo(
		() =>
			createLookupOptions(
				"Termination Notice Period",
				t("createAssignment.placeholders.terminationNoticePeriod")
			),
		[createLookupOptions, t]
	);

	// const hourlySalariedOptions = useMemo(
	// 	//
	// ); hourly_salaried (string): Salaried or Hourly.
	const hourlySalariedOptions = useMemo(
		() => [
			{ value: "", label: t("createAssignment.placeholders.hourlySalaried") },
			{ value: "Salaried", label: t("createAssignment.options.salaried") },
			{ value: "Hourly", label: t("createAssignment.options.hourly") },
		],
		[t]
	);

	const workingFrequencyOptions = useMemo(
		// working_frequency (string): Day, Week, Month, Year.
		() => [
			{ value: "", label: t("createAssignment.placeholders.workingFrequency") },
			{ value: "Day", label: t("workingFrequencies.day") },
			{ value: "Week", label: t("workingFrequencies.week") },
			{ value: "Month", label: t("workingFrequencies.month") },
			{ value: "Year", label: t("workingFrequencies.year") },
		],
		[t]
	);

	// Handlers
	const handleInputChange = useCallback(
		(field, value) => {
			setFormData(prev => ({ ...prev, [field]: value }));
			if (formErrors[field]) {
				setFormErrors(prev => ({ ...prev, [field]: "" }));
			}
		},
		[formErrors]
	);

	// Validation per step
	const validateStep = useCallback(
		stepIndex => {
			const errors = {};

			if (stepIndex === 0) {
				// Basic Info
				if (!formData.assignment_no.trim()) {
					errors.assignment_no = t("createAssignment.errors.assignmentNoRequired");
				}
				if (!formData.effective_start_date) {
					errors.effective_start_date = t("createAssignment.errors.effectiveStartDateRequired");
				}
			} else if (stepIndex === 1) {
				// Organization
				if (!formData.business_group_id) {
					errors.business_group_id = t("createAssignment.errors.businessGroupRequired");
				}
				if (!formData.department_id) {
					errors.department_id = t("createAssignment.errors.departmentRequired");
				}
			}
			// Other steps have no required validation

			setFormErrors(errors);
			return Object.keys(errors).length === 0;
		},
		[formData, t]
	);

	const handleNext = useCallback(() => {
		if (validateStep(currentStep)) {
			if (!completedSteps.includes(currentStep)) {
				setCompletedSteps(prev => [...prev, currentStep]);
			}
			if (currentStep < steps.length - 1) {
				setCurrentStep(prev => prev + 1);
			}
		}
	}, [currentStep, validateStep, completedSteps, steps.length]);

	const handlePrevious = useCallback(() => {
		if (currentStep > 0) {
			setCurrentStep(prev => prev - 1);
		}
	}, [currentStep]);

	const handleStepClick = useCallback(
		index => {
			// Allow going to any previous step or completed step
			if (index <= currentStep || completedSteps.includes(index - 1) || index === 0) {
				setCurrentStep(index);
			} else {
				toast.warning(t("createAssignment.messages.completeCurrentStep"));
			}
		},
		[currentStep, completedSteps, t]
	);

	const handleSubmit = useCallback(async () => {
		if (!personId) {
			toast.error(t("createAssignment.errors.noEmployee"));
			return;
		}

		// Validate required steps
		for (let i = 0; i <= 1; i++) {
			if (!validateStep(i)) {
				setCurrentStep(i);
				toast.error(t("createAssignment.messages.checkAllSteps"));
				return;
			}
		}

		// Prepare payload
		const payload = {
			person_id: parseInt(personId),
			assignment_no: formData.assignment_no.trim(),
			effective_start_date: formData.effective_start_date,
			business_group_id: parseInt(formData.business_group_id),
			department_id: parseInt(formData.department_id) || parseInt(formData.business_group_id),
		};

		// Add optional fields
		if (formData.job_id) payload.job_id = parseInt(formData.job_id);
		if (formData.position_id) payload.position_id = parseInt(formData.position_id);
		if (formData.grade_id) payload.grade_id = parseInt(formData.grade_id);
		if (formData.assignment_status_id) payload.assignment_status_id = parseInt(formData.assignment_status_id);
		if (formData.assignment_action_reason_id)
			payload.assignment_action_reason_id = parseInt(formData.assignment_action_reason_id);
		if (formData.line_manager_id) payload.line_manager_id = parseInt(formData.line_manager_id);
		if (formData.project_manager_id) payload.project_manager_id = parseInt(formData.project_manager_id);
		if (formData.payroll_id) payload.payroll_id = parseInt(formData.payroll_id);
		if (formData.salary_basis_id) payload.salary_basis_id = parseInt(formData.salary_basis_id);
		if (formData.contract_id) payload.contract_id = parseInt(formData.contract_id);
		if (formData.probation_period_start) payload.probation_period_start = formData.probation_period_start;
		if (formData.probation_period_id) payload.probation_period_id = parseInt(formData.probation_period_id);
		if (formData.termination_notice_period_id)
			payload.termination_notice_period_id = parseInt(formData.termination_notice_period_id);
		if (formData.hourly_salaried) payload.hourly_salaried = formData.hourly_salaried;
		if (formData.working_frequency) payload.working_frequency = formData.working_frequency;
		if (formData.work_start_time) payload.work_start_time = formData.work_start_time;
		if (formData.work_end_time) payload.work_end_time = formData.work_end_time;
		if (formData.title?.trim()) payload.title = formData.title.trim();
		if (formData.employment_confirmation_date)
			payload.employment_confirmation_date = formData.employment_confirmation_date;
		if (formData.effective_end_date) payload.effective_end_date = formData.effective_end_date;

		payload.primary_assignment = formData.primary_assignment;
		payload.is_manager = formData.is_manager;
		payload.work_from_home = formData.work_from_home;

		try {
			await dispatch(createAssignment(payload)).unwrap();
			toast.success(t("createAssignment.messages.createSuccess"));

			setTimeout(() => {
				navigate(`/profile/${personId}`);
			}, 1500);
		} catch (error) {
			toast.error(parseApiError(error, t, "createAssignment.messages.createError"));
		}
	}, [formData, personId, validateStep, dispatch, navigate, t]);

	const handleCancel = useCallback(() => {
		if (personId) {
			navigate(`/profile/${personId}`);
		} else {
			navigate("/employee-search");
		}
	}, [navigate, personId]);

	// Render Step 1: Basic Assignment Info
	const renderBasicStep = () => (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
				{t("createAssignment.sections.basicInfo")}
			</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelInput
					label={t("createAssignment.fields.assignmentNo")}
					value={formData.assignment_no}
					onChange={e => handleInputChange("assignment_no", e.target.value)}
					error={formErrors.assignment_no}
					required
				/>
				<FloatingLabelInput
					label={t("createAssignment.fields.title")}
					value={formData.title}
					onChange={e => handleInputChange("title", e.target.value)}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelInput
					label={t("createAssignment.fields.effectiveStartDate")}
					type="date"
					value={formData.effective_start_date}
					onChange={e => handleInputChange("effective_start_date", e.target.value)}
					error={formErrors.effective_start_date}
					required
				/>
				<FloatingLabelInput
					label={t("createAssignment.fields.effectiveEndDate")}
					type="date"
					value={formData.effective_end_date}
					onChange={e => handleInputChange("effective_end_date", e.target.value)}
				/>
			</div>

			<div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
				<label className="text-sm text-gray-600">{t("createAssignment.fields.primaryAssignment")}</label>
				<Toggle
					checked={formData.primary_assignment}
					onChange={checked => handleInputChange("primary_assignment", checked)}
				/>
			</div>
		</div>
	);

	// Render Step 2: Organization Details
	const renderOrganizationStep = () => (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
				{t("createAssignment.sections.organization")}
			</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelSelect
					label={t("createAssignment.fields.businessGroup")}
					value={formData.business_group_id}
					onChange={e => handleInputChange("business_group_id", e.target.value)}
					options={businessGroupOptions}
					error={formErrors.business_group_id}
					required
				/>
				<FloatingLabelSelect
					label={t("createAssignment.fields.department")}
					value={formData.department_id}
					onChange={e => handleInputChange("department_id", e.target.value)}
					options={departmentOptions}
					error={formErrors.department_id}
					required
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelSelect
					label={t("createAssignment.fields.job")}
					value={formData.job_id}
					onChange={e => handleInputChange("job_id", e.target.value)}
					options={jobOptions}
				/>
				<FloatingLabelSelect
					label={t("createAssignment.fields.position")}
					value={formData.position_id}
					onChange={e => handleInputChange("position_id", e.target.value)}
					options={positionOptions}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelSelect
					label={t("createAssignment.fields.grade")}
					value={formData.grade_id}
					onChange={e => handleInputChange("grade_id", e.target.value)}
					options={gradeOptions}
				/>
			</div>
		</div>
	);

	// Render Step 3: Status & Managers
	const renderStatusStep = () => (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
				{t("createAssignment.sections.statusManagers")}
			</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelSelect
					label={t("createAssignment.fields.assignmentStatus")}
					value={formData.assignment_status_id}
					onChange={e => handleInputChange("assignment_status_id", e.target.value)}
					options={assignmentStatusOptions}
				/>
				<FloatingLabelSelect
					label={t("createAssignment.fields.actionReason")}
					value={formData.assignment_action_reason_id}
					onChange={e => handleInputChange("assignment_action_reason_id", e.target.value)}
					options={actionReasonOptions}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelSelect
					label={t("createAssignment.fields.lineManager")}
					value={formData.line_manager_id}
					onChange={e => handleInputChange("line_manager_id", e.target.value)}
					options={employeeOptions}
				/>
				<FloatingLabelSelect
					label={t("createAssignment.fields.projectManager")}
					value={formData.project_manager_id}
					onChange={e => handleInputChange("project_manager_id", e.target.value)}
					options={employeeOptions}
				/>
			</div>

			<div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
				<label className="text-sm text-gray-600">{t("createAssignment.fields.isManager")}</label>
				<Toggle checked={formData.is_manager} onChange={checked => handleInputChange("is_manager", checked)} />
			</div>
		</div>
	);

	// Render Step 4: Compensation & Schedule
	const renderCompensationStep = () => (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
				{t("createAssignment.sections.compensation")}
			</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelSelect
					label={t("createAssignment.fields.payroll")}
					value={formData.payroll_id}
					onChange={e => handleInputChange("payroll_id", e.target.value)}
					options={payrollOptions}
				/>
				<FloatingLabelSelect
					label={t("createAssignment.fields.salaryBasis")}
					value={formData.salary_basis_id}
					onChange={e => handleInputChange("salary_basis_id", e.target.value)}
					options={salaryBasisOptions}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelSelect
					label={t("createAssignment.fields.contract")}
					value={formData.contract_id}
					onChange={e => handleInputChange("contract_id", e.target.value)}
					options={contractOptions}
				/>
				<FloatingLabelSelect
					label={t("createAssignment.fields.hourlySalaried")}
					value={formData.hourly_salaried}
					onChange={e => handleInputChange("hourly_salaried", e.target.value)}
					options={hourlySalariedOptions}
				/>
			</div>

			<h4 className="text-md font-medium text-gray-700 mt-4">{t("createAssignment.sections.workSchedule")}</h4>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelSelect
					label={t("createAssignment.fields.workingFrequency")}
					value={formData.working_frequency}
					onChange={e => handleInputChange("working_frequency", e.target.value)}
					options={workingFrequencyOptions}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelInput
					label={t("createAssignment.fields.workStartTime")}
					type="time"
					value={formData.work_start_time}
					onChange={e => handleInputChange("work_start_time", e.target.value)}
				/>
				<FloatingLabelInput
					label={t("createAssignment.fields.workEndTime")}
					type="time"
					value={formData.work_end_time}
					onChange={e => handleInputChange("work_end_time", e.target.value)}
				/>
			</div>

			<div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
				<label className="text-sm text-gray-600">{t("createAssignment.fields.workFromHome")}</label>
				<Toggle
					checked={formData.work_from_home}
					onChange={checked => handleInputChange("work_from_home", checked)}
				/>
			</div>
		</div>
	);

	// Render Step 5: Probation & Dates
	const renderProbationStep = () => (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
				{t("createAssignment.sections.probation")}
			</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelInput
					label={t("createAssignment.fields.probationPeriodStart")}
					type="date"
					value={formData.probation_period_start}
					onChange={e => handleInputChange("probation_period_start", e.target.value)}
				/>
				<FloatingLabelSelect
					label={t("createAssignment.fields.probationPeriod")}
					value={formData.probation_period_id}
					onChange={e => handleInputChange("probation_period_id", e.target.value)}
					options={probationPeriodOptions}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelSelect
					label={t("createAssignment.fields.terminationNoticePeriod")}
					value={formData.termination_notice_period_id}
					onChange={e => handleInputChange("termination_notice_period_id", e.target.value)}
					options={terminationNoticePeriodOptions}
				/>
				<FloatingLabelInput
					label={t("createAssignment.fields.employmentConfirmationDate")}
					type="date"
					value={formData.employment_confirmation_date}
					onChange={e => handleInputChange("employment_confirmation_date", e.target.value)}
				/>
			</div>
		</div>
	);

	// Render current step content
	const renderStepContent = () => {
		switch (currentStep) {
			case 0:
				return renderBasicStep();
			case 1:
				return renderOrganizationStep();
			case 2:
				return renderStatusStep();
			case 3:
				return renderCompensationStep();
			case 4:
				return renderProbationStep();
			default:
				return null;
		}
	};

	// Show error if no personId
	if (!personId) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<Card className="p-8 text-center max-w-md">
					<FiBriefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
					<h2 className="text-xl font-semibold text-gray-800 mb-2">
						{t("createAssignment.errors.noEmployee")}
					</h2>
					<p className="text-gray-600 mb-4">{t("createAssignment.errors.selectEmployeeFirst")}</p>
					<Button
						onClick={() => navigate("/employee-search")}
						title={t("createAssignment.actions.goToEmployees")}
					/>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<PageHeader
				title={t("createAssignment.title")}
				subtitle={t("createAssignment.subtitle")}
				icon={<FiBriefcase className="w-8 h-8 text-[#28819C]" />}
			/>

			<div className="mx-auto px-6 py-8 max-w-5xl">
				{/* Progress Indicator */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-4">
						{steps.map((step, index) => (
							<React.Fragment key={step.id}>
								<div
									className={`flex flex-col items-center cursor-pointer ${
										index <= currentStep ? "text-[#28819C]" : "text-gray-400"
									}`}
									onClick={() => handleStepClick(index)}
								>
									<div
										className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
											completedSteps.includes(index)
												? "bg-green-500 text-white"
												: index === currentStep
													? "bg-[#28819C] text-white"
													: "bg-gray-200 text-gray-500"
										}`}
									>
										{completedSteps.includes(index) ? <FiCheck size={18} /> : index + 1}
									</div>
									<span className="text-xs mt-2 font-medium text-center max-w-20">{step.label}</span>
								</div>
								{index < steps.length - 1 && (
									<div
										className={`flex-1 h-1 mx-2 rounded ${
											completedSteps.includes(index) ? "bg-green-500" : "bg-gray-200"
										}`}
									/>
								)}
							</React.Fragment>
						))}
					</div>
				</div>

				{/* Form Content */}
				<Card className="p-6">
					{renderStepContent()}

					{/* Navigation Buttons */}
					<div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
						<div>
							{currentStep > 0 && (
								<Button
									onClick={handlePrevious}
									title={t("createAssignment.actions.previous")}
									icon={isRtl ? <FiArrowRight size={18} /> : <FiArrowLeft size={18} />}
									className="bg-gray-100 text-gray-700 hover:bg-gray-200"
								/>
							)}
						</div>
						<div className="flex gap-3">
							<Button
								onClick={handleCancel}
								title={t("createAssignment.actions.cancel")}
								className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-none"
								disabled={creating}
							/>
							{currentStep < steps.length - 1 ? (
								<Button
									onClick={handleNext}
									title={t("createAssignment.actions.next")}
									icon={isRtl ? <FiArrowLeft size={18} /> : <FiArrowRight size={18} />}
									iconPosition="right"
								/>
							) : (
								<Button
									onClick={handleSubmit}
									title={
										creating
											? t("createAssignment.actions.creating")
											: t("createAssignment.actions.create")
									}
									icon={<FiCheck size={18} />}
									disabled={creating}
								/>
							)}
						</div>
					</div>
				</Card>
			</div>

			{/* Toast Container */}
			<ToastContainer
				position={isRtl ? "top-left" : "top-right"}
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={isRtl}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="light"
			/>
		</div>
	);
};

export default CreateAssignmentPage;
