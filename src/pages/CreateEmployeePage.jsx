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
import { FiArrowLeft, FiArrowRight, FiCheck, FiUser } from "react-icons/fi";

import { createEmployee, clearError } from "../store/employeesSlice";
import { fetchPersonTypes } from "../store/personTypesSlice";
import { parseApiError } from "../utils/errorHandler";

// Options based on API docs
const GENDER_OPTIONS = [
	{ value: "", label: "Select Gender" },
	{ value: "Male", label: "Male" },
	{ value: "Female", label: "Female" },
];

const MARITAL_STATUS_OPTIONS = [
	{ value: "", label: "Select Marital Status" },
	{ value: "Single", label: "Single" },
	{ value: "Married", label: "Married" },
	{ value: "Divorced", label: "Divorced" },
	{ value: "Widowed", label: "Widowed" },
];

const TITLE_OPTIONS = [
	{ value: "", label: "Select Title" },
	{ value: "Mr", label: "Mr" },
	{ value: "Mrs", label: "Mrs" },
	{ value: "Ms", label: "Ms" },
	{ value: "Dr", label: "Dr" },
	{ value: "Prof", label: "Prof" },
	{ value: "Eng", label: "Eng" },
];

const BLOOD_TYPE_OPTIONS = [
	{ value: "", label: "Select Blood Type" },
	{ value: "A+", label: "A+" },
	{ value: "A-", label: "A-" },
	{ value: "B+", label: "B+" },
	{ value: "B-", label: "B-" },
	{ value: "AB+", label: "AB+" },
	{ value: "AB-", label: "AB-" },
	{ value: "O+", label: "O+" },
	{ value: "O-", label: "O-" },
];

// Initial form state based on API docs
const INITIAL_FORM_STATE = {
	// Step 1: Personal Information (person_details - required fields)
	first_name: "",
	last_name: "",
	email_address: "",
	date_of_birth: "",
	gender: "",
	marital_status: "",
	nationality: "",

	// Step 2: Personal Details (person_details - optional fields)
	middle_name: "",
	title: "",
	national_id: "",
	first_name_arabic: "",
	middle_name_arabic: "",
	last_name_arabic: "",
	religion: "",
	blood_type: "",

	// Step 3: Employment Details (required + optional)
	employee_type_id: "", // required
	effective_start_date: "", // required
	hire_date: "", // optional, defaults to effective_start_date
	employee_number: "", // optional, auto-generated if not provided
};

const CreateEmployeePage = () => {
	const { t, i18n } = useTranslation();
	usePageTitle(t("createEmployee.title"));
	const isRtl = i18n.dir() === "rtl";
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [searchParams] = useSearchParams();

	// Redux state
	const { creating, actionError } = useSelector(state => state.employees || {});
	const { personTypes = [] } = useSelector(state => state.personTypes || {});

	// Local state
	const [currentStep, setCurrentStep] = useState(0);
	const [formData, setFormData] = useState(INITIAL_FORM_STATE);
	const [formErrors, setFormErrors] = useState({});
	const [completedSteps, setCompletedSteps] = useState([]);

	// Steps configuration - 3 steps based on API docs
	const steps = useMemo(
		() => [
			{ id: "personal", label: t("createEmployee.steps.personal"), icon: "1" },
			{ id: "details", label: t("createEmployee.steps.details"), icon: "2" },
			{ id: "employment", label: t("createEmployee.steps.employment"), icon: "3" },
		],
		[t]
	);

	// Fetch required data on mount
	useEffect(() => {
		dispatch(fetchPersonTypes({ is_active: true, base_type: "EMP" }));
	}, [dispatch]);

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
	const personTypeOptions = useMemo(() => {
		return [
			{ value: "", label: t("createEmployee.placeholders.employeeType") },
			...personTypes.map(type => ({
				value: type.id,
				label: type.name || type.code || "Unnamed Type",
			})),
		];
	}, [personTypes, t]);

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

	// Validation per step - based on API required fields
	const validateStep = useCallback(
		stepIndex => {
			const errors = {};

			if (stepIndex === 0) {
				// Step 1: Personal Information (required person_details fields)
				if (!formData.first_name.trim()) {
					errors.first_name = t("createEmployee.errors.firstNameRequired");
				}
				if (!formData.last_name.trim()) {
					errors.last_name = t("createEmployee.errors.lastNameRequired");
				}
				if (!formData.email_address.trim()) {
					errors.email_address = t("createEmployee.errors.emailRequired");
				} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_address)) {
					errors.email_address = t("createEmployee.errors.invalidEmail");
				}
				if (!formData.date_of_birth) {
					errors.date_of_birth = t("createEmployee.errors.dateOfBirthRequired");
				}
				if (!formData.gender) {
					errors.gender = t("createEmployee.errors.genderRequired");
				}
				if (!formData.marital_status) {
					errors.marital_status = t("createEmployee.errors.maritalStatusRequired");
				}
				if (!formData.nationality.trim()) {
					errors.nationality = t("createEmployee.errors.nationalityRequired");
				}
			} else if (stepIndex === 1) {
				// Step 2: Personal Details - all optional, no validation needed
			} else if (stepIndex === 2) {
				// Step 3: Employment Details (required fields)
				if (!formData.employee_type_id) {
					errors.employee_type_id = t("createEmployee.errors.employeeTypeRequired");
				}
				if (!formData.effective_start_date) {
					errors.effective_start_date = t("createEmployee.errors.effectiveStartDateRequired");
				}
			}

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

	const handleTabChange = useCallback(
		tabId => {
			const tabIndex = steps.findIndex(s => s.id === tabId);
			// Allow going to any previous step or completed step
			if (tabIndex <= currentStep || completedSteps.includes(tabIndex - 1) || tabIndex === 0) {
				setCurrentStep(tabIndex);
			} else {
				toast.warning(t("createEmployee.messages.completeCurrentStep"));
			}
		},
		[steps, currentStep, completedSteps, t]
	);

	const handleSubmit = useCallback(async () => {
		// Validate all steps
		let allValid = true;
		for (let i = 0; i < steps.length; i++) {
			if (!validateStep(i)) {
				setCurrentStep(i);
				allValid = false;
				break;
			}
		}

		if (!allValid) {
			toast.error(t("createEmployee.messages.checkAllSteps"));
			return;
		}

		// Prepare data according to API docs
		// Build person_details object (required since person_id is not provided)
		const personDetails = {
			first_name: formData.first_name.trim(),
			last_name: formData.last_name.trim(),
			email_address: formData.email_address.trim(),
			date_of_birth: formData.date_of_birth,
			gender: formData.gender,
			marital_status: formData.marital_status,
			nationality: formData.nationality.trim(),
		};

		// Add optional person_details fields
		if (formData.middle_name?.trim()) personDetails.middle_name = formData.middle_name.trim();
		if (formData.title) personDetails.title = formData.title;
		if (formData.national_id?.trim()) personDetails.national_id = formData.national_id.trim();
		if (formData.first_name_arabic?.trim()) personDetails.first_name_arabic = formData.first_name_arabic.trim();
		if (formData.middle_name_arabic?.trim()) personDetails.middle_name_arabic = formData.middle_name_arabic.trim();
		if (formData.last_name_arabic?.trim()) personDetails.last_name_arabic = formData.last_name_arabic.trim();
		if (formData.religion?.trim()) personDetails.religion = formData.religion.trim();
		if (formData.blood_type) personDetails.blood_type = formData.blood_type;

		// Build main employee data
		const employeeData = {
			employee_type_id: Number(formData.employee_type_id),
			effective_start_date: formData.effective_start_date,
			person_details: personDetails,
		};

		// Add optional employee fields
		if (formData.hire_date) employeeData.hire_date = formData.hire_date;
		if (formData.employee_number?.trim()) employeeData.employee_number = formData.employee_number.trim();

		try {
			const result = await dispatch(createEmployee(employeeData)).unwrap();
			toast.success(t("createEmployee.messages.createSuccess"));

			// Check if we should redirect to create assignment
			const createAssignment = searchParams.get("createAssignment");
			if (createAssignment === "true" && result?.id) {
				setTimeout(() => {
					navigate(`/create-assignment?personId=${result.id}`);
				}, 1500);
			} else {
				setTimeout(() => {
					navigate("/employee-search");
				}, 1500);
			}
		} catch (error) {
			toast.error(parseApiError(error, t, "createEmployee.messages.createError"));
		}
	}, [formData, validateStep, steps.length, dispatch, navigate, t, searchParams]);

	const handleCancel = useCallback(() => {
		navigate("/employee-search");
	}, [navigate]);

	// Render Step 1: Personal Information (required person_details fields)
	const renderPersonalStep = () => (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
				{t("createEmployee.sections.personalInfo")}
			</h3>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<FloatingLabelInput
					label={t("createEmployee.fields.firstName")}
					value={formData.first_name}
					onChange={e => handleInputChange("first_name", e.target.value)}
					error={formErrors.first_name}
					required
				/>
				<FloatingLabelInput
					label={t("createEmployee.fields.lastName")}
					value={formData.last_name}
					onChange={e => handleInputChange("last_name", e.target.value)}
					error={formErrors.last_name}
					required
				/>
				<FloatingLabelInput
					label={t("createEmployee.fields.email")}
					type="email"
					value={formData.email_address}
					onChange={e => handleInputChange("email_address", e.target.value)}
					error={formErrors.email_address}
					required
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelInput
					label={t("createEmployee.fields.dateOfBirth")}
					type="date"
					value={formData.date_of_birth}
					onChange={e => handleInputChange("date_of_birth", e.target.value)}
					error={formErrors.date_of_birth}
					required
				/>
				<FloatingLabelSelect
					label={t("createEmployee.fields.gender")}
					value={formData.gender}
					onChange={e => handleInputChange("gender", e.target.value)}
					options={GENDER_OPTIONS}
					error={formErrors.gender}
					required
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelSelect
					label={t("createEmployee.fields.maritalStatus")}
					value={formData.marital_status}
					onChange={e => handleInputChange("marital_status", e.target.value)}
					options={MARITAL_STATUS_OPTIONS}
					error={formErrors.marital_status}
					required
				/>
				<FloatingLabelInput
					label={t("createEmployee.fields.nationality")}
					value={formData.nationality}
					onChange={e => handleInputChange("nationality", e.target.value)}
					error={formErrors.nationality}
					required
				/>
			</div>
		</div>
	);

	// Render Step 2: Personal Details (optional person_details fields)
	const renderDetailsStep = () => (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
				{t("createEmployee.sections.personalDetails")}
			</h3>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<FloatingLabelSelect
					label={t("createEmployee.fields.title")}
					value={formData.title}
					onChange={e => handleInputChange("title", e.target.value)}
					options={TITLE_OPTIONS}
				/>
				<FloatingLabelInput
					label={t("createEmployee.fields.middleName")}
					value={formData.middle_name}
					onChange={e => handleInputChange("middle_name", e.target.value)}
				/>
				<FloatingLabelInput
					label={t("createEmployee.fields.nationalId")}
					value={formData.national_id}
					onChange={e => handleInputChange("national_id", e.target.value)}
				/>
			</div>

			<h4 className="text-md font-medium text-gray-700 mt-4">{t("createEmployee.sections.arabicNames")}</h4>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<FloatingLabelInput
					label={t("createEmployee.fields.firstNameArabic")}
					value={formData.first_name_arabic}
					onChange={e => handleInputChange("first_name_arabic", e.target.value)}
					dir="rtl"
				/>
				<FloatingLabelInput
					label={t("createEmployee.fields.middleNameArabic")}
					value={formData.middle_name_arabic}
					onChange={e => handleInputChange("middle_name_arabic", e.target.value)}
					dir="rtl"
				/>
				<FloatingLabelInput
					label={t("createEmployee.fields.lastNameArabic")}
					value={formData.last_name_arabic}
					onChange={e => handleInputChange("last_name_arabic", e.target.value)}
					dir="rtl"
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelInput
					label={t("createEmployee.fields.religion")}
					value={formData.religion}
					onChange={e => handleInputChange("religion", e.target.value)}
				/>
				<FloatingLabelSelect
					label={t("createEmployee.fields.bloodType")}
					value={formData.blood_type}
					onChange={e => handleInputChange("blood_type", e.target.value)}
					options={BLOOD_TYPE_OPTIONS}
				/>
			</div>
		</div>
	);

	// Render Step 3: Employment Details
	const renderEmploymentStep = () => (
		<div className="space-y-6">
			<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
				{t("createEmployee.sections.employmentDetails")}
			</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelSelect
					label={t("createEmployee.fields.employeeType")}
					value={formData.employee_type_id}
					onChange={e => handleInputChange("employee_type_id", e.target.value)}
					options={personTypeOptions}
					error={formErrors.employee_type_id}
					required
				/>
				<FloatingLabelInput
					label={t("createEmployee.fields.effectiveStartDate")}
					type="date"
					value={formData.effective_start_date}
					onChange={e => handleInputChange("effective_start_date", e.target.value)}
					error={formErrors.effective_start_date}
					required
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelInput
					label={t("createEmployee.fields.hireDate")}
					type="date"
					value={formData.hire_date}
					onChange={e => handleInputChange("hire_date", e.target.value)}
					placeholder={t("createEmployee.placeholders.hireDateDefault")}
				/>
				<FloatingLabelInput
					label={t("createEmployee.fields.employeeNumber")}
					value={formData.employee_number}
					onChange={e => handleInputChange("employee_number", e.target.value)}
					placeholder={t("createEmployee.placeholders.employeeNumberAuto")}
				/>
			</div>

			<p className="text-sm text-gray-500 italic">
				{t("createEmployee.hints.employeeNumber")}
			</p>
		</div>
	);

	// Render current step content
	const renderStepContent = () => {
		switch (currentStep) {
			case 0:
				return renderPersonalStep();
			case 1:
				return renderDetailsStep();
			case 2:
				return renderEmploymentStep();
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<PageHeader
				title={t("createEmployee.title")}
				subtitle={t("createEmployee.subtitle")}
				icon={<FiUser className="w-8 h-8 text-[#28819C]" />}
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
									onClick={() => handleTabChange(step.id)}
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
									title={t("createEmployee.actions.previous")}
									icon={isRtl ? <FiArrowRight size={18} /> : <FiArrowLeft size={18} />}
									className="bg-gray-100 text-gray-700 hover:bg-gray-200"
								/>
							)}
						</div>
						<div className="flex gap-3">
							<Button
								onClick={handleCancel}
								title={t("createEmployee.actions.cancel")}
								className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-none"
								disabled={creating}
							/>
							{currentStep < steps.length - 1 ? (
								<Button
									onClick={handleNext}
									title={t("createEmployee.actions.next")}
									icon={isRtl ? <FiArrowLeft size={18} /> : <FiArrowRight size={18} />}
									iconPosition="right"
								/>
							) : (
								<Button
									onClick={handleSubmit}
									title={
										creating
											? t("createEmployee.actions.creating")
											: t("createEmployee.actions.create")
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

export default CreateEmployeePage;
