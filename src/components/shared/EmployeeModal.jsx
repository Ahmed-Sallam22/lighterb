import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import SlideUpModal from "./SlideUpModal";
import CustomInput from "./CustomInput";
import CustomDropdown from "./CustomDropdown";
import Button from "./Button";
import { fetchOrganizations } from "../../store/organizationsSlice";
import { fetchPositions } from "../../store/positionsSlice";
import { fetchPersonTypes } from "../../store/personTypesSlice";

const GENDER_OPTIONS = [
	{ value: "Male", label: "Male" },
	{ value: "Female", label: "Female" },
];

const MARITAL_STATUS_OPTIONS = [
	{ value: "Single", label: "Single" },
	{ value: "Married", label: "Married" },
	{ value: "Divorced", label: "Divorced" },
	{ value: "Widowed", label: "Widowed" },
];

const EmployeeModal = ({ isOpen, onClose, mode = "create", employee = null, onSubmit, loading = false }) => {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const { organizations = [] } = useSelector(state => state.organizations || {});
	const { positions = [] } = useSelector(state => state.positions || {});
	const { personTypes = [] } = useSelector(state => state.personTypes || {});

	const initialFormData = {
		first_name: "",
		last_name: "",
		email_address: "",
		date_of_birth: "",
		gender: "",
		nationality: "",
		marital_status: "",
		employee_type_id: "",
		start_date: "",
		employee_number: "",
		organization_id: "",
		position_id: "",
	};

	const [formData, setFormData] = useState(initialFormData);
	const [errors, setErrors] = useState({});

	useEffect(() => {
		if (isOpen) {
			dispatch(fetchOrganizations({ page_size: 100 }));
			dispatch(fetchPositions({ page_size: 100 }));
			dispatch(
				fetchPersonTypes({
					is_active: true,
					base_type: "EMP",
				})
			);
		}
	}, [dispatch, isOpen]);

	useEffect(() => {
		if (isOpen) {
			if (mode === "edit" && employee) {
				setFormData({
					first_name: employee.first_name || "",
					last_name: employee.last_name || "",
					email_address: employee.email_address || "",
					date_of_birth: employee.date_of_birth || "",
					gender: employee.gender || "",
					nationality: employee.nationality || "",
					marital_status: employee.marital_status || "",
					employee_type_id: employee.employee_type_id || "",
					start_date: employee.start_date || "",
					employee_number: employee.employee_number || "",
					organization_id: employee.organization_id || "",
					position_id: employee.position_id || "",
				});
			} else {
				setFormData(initialFormData);
			}
			setErrors({});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, mode, employee]);

	const organizationOptions = useMemo(() => {
		return organizations.map(org => ({
			value: org.id,
			label: org.name_display || org.code || "Unnamed Organization",
		}));
	}, [organizations]);

	const positionOptions = useMemo(() => {
		return positions.map(pos => ({
			value: pos.id,
			label: pos.name || pos.code || "Unnamed Position",
		}));
	}, [positions]);

	const personTypeOptions = useMemo(() => {
		return personTypes.map(type => ({
			value: type.id,
			label: type.name || type.code || "Unnamed Type",
		}));
	}, [personTypes]);

	const handleChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		if (errors[name]) {
			setErrors(prev => ({ ...prev, [name]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors = {};
		if (!formData.first_name.trim()) {
			newErrors.first_name = t("employeeSearch.modal.errors.firstNameRequired");
		}
		if (!formData.last_name.trim()) {
			newErrors.last_name = t("employeeSearch.modal.errors.lastNameRequired");
		}
		if (!formData.email_address.trim()) {
			newErrors.email_address = t("employeeSearch.modal.errors.emailRequired");
		}
		if (!formData.employee_number.trim()) {
			newErrors.employee_number = t("employeeSearch.modal.errors.employeeNumberRequired");
		}
		if (!formData.start_date) {
			newErrors.start_date = t("employeeSearch.modal.errors.startDateRequired");
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = () => {
		if (validateForm()) {
			const payload = {
				first_name: formData.first_name.trim(),
				last_name: formData.last_name.trim(),
				email_address: formData.email_address.trim(),
				date_of_birth: formData.date_of_birth || null,
				gender: formData.gender || null,
				nationality: formData.nationality.trim() || null,
				marital_status: formData.marital_status || null,
				employee_type_id: formData.employee_type_id ? Number(formData.employee_type_id) : null,
				start_date: formData.start_date,
				employee_number: formData.employee_number.trim(),
				organization_id: formData.organization_id ? Number(formData.organization_id) : null,
				position_id: formData.position_id ? Number(formData.position_id) : null,
			};

			// Remove null values
			Object.keys(payload).forEach(key => {
				if (payload[key] === null) {
					delete payload[key];
				}
			});

			onSubmit?.(payload);
		}
	};

	const modalTitle = mode === "edit" ? t("employeeSearch.modal.editTitle") : t("employeeSearch.modal.createTitle");
	const submitButtonText = mode === "edit" ? t("employeeSearch.modal.edit") : t("employeeSearch.modal.create");

	return (
		<SlideUpModal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="700px">
			<div className="space-y-4 py-4">
				{/* Row 1: First Name & Last Name */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<CustomInput
						label={t("employeeSearch.modal.fields.firstName")}
						name="first_name"
						value={formData.first_name}
						onChange={handleChange}
						placeholder={t("employeeSearch.modal.fields.firstName")}
						error={errors.first_name}
						bgColor="bg-[#fff]"
						required
					/>
					<CustomInput
						label={t("employeeSearch.modal.fields.lastName")}
						name="last_name"
						value={formData.last_name}
						onChange={handleChange}
						placeholder={t("employeeSearch.modal.fields.lastName")}
						error={errors.last_name}
						bgColor="bg-[#fff]"
						required
					/>
				</div>

				{/* Row 2: Email & Employee Number */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<CustomInput
						label={t("employeeSearch.modal.fields.email")}
						name="email_address"
						type="email"
						value={formData.email_address}
						onChange={handleChange}
						placeholder={t("employeeSearch.modal.fields.email")}
						error={errors.email_address}
						bgColor="bg-[#fff]"
						required
					/>
					<CustomInput
						label={t("employeeSearch.modal.fields.employeeNumber")}
						name="employee_number"
						value={formData.employee_number}
						onChange={handleChange}
						placeholder={t("employeeSearch.modal.fields.employeeNumber")}
						error={errors.employee_number}
						disabled={mode === "edit"}
						bgColor="bg-[#fff]"
						required
					/>
				</div>

				{/* Row 3: Date of Birth & Start Date */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<CustomInput
						label={t("employeeSearch.modal.fields.dateOfBirth")}
						name="date_of_birth"
						type="date"
						value={formData.date_of_birth}
						onChange={handleChange}
						bgColor="bg-[#fff]"
					/>
					<CustomInput
						label={t("employeeSearch.modal.fields.startDate")}
						name="start_date"
						type="date"
						value={formData.start_date}
						onChange={handleChange}
						error={errors.start_date}
						bgColor="bg-[#fff]"
						required
					/>
				</div>

				{/* Row 4: Gender & Marital Status */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<CustomDropdown
						label={t("employeeSearch.modal.fields.gender")}
						name="gender"
						value={formData.gender}
						onChange={handleChange}
						options={GENDER_OPTIONS}
						placeholder={t("employeeSearch.modal.fields.gender")}
						bgColor="bg-[#fff]"
					/>
					<CustomDropdown
						label={t("employeeSearch.modal.fields.maritalStatus")}
						name="marital_status"
						value={formData.marital_status}
						onChange={handleChange}
						options={MARITAL_STATUS_OPTIONS}
						placeholder={t("employeeSearch.modal.fields.maritalStatus")}
						bgColor="bg-[#fff]"
					/>
				</div>

				{/* Row 5: Nationality & Employee Type */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<CustomInput
						label={t("employeeSearch.modal.fields.nationality")}
						name="nationality"
						value={formData.nationality}
						onChange={handleChange}
						placeholder={t("employeeSearch.modal.fields.nationality")}
						bgColor="bg-[#fff]"
					/>
					<CustomDropdown
						label={t("employeeSearch.modal.fields.employeeType")}
						name="employee_type_id"
						value={formData.employee_type_id}
						onChange={handleChange}
						options={personTypeOptions}
						placeholder={t("employeeSearch.modal.fields.employeeType")}
						bgColor="bg-[#fff]"
					/>
				</div>

				{/* Row 6: Organization & Position */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<CustomDropdown
						label={t("employeeSearch.modal.fields.organization")}
						name="organization_id"
						value={formData.organization_id}
						onChange={handleChange}
						options={organizationOptions}
						placeholder={t("employeeSearch.modal.fields.organization")}
						bgColor="bg-[#fff]"
					/>
					<CustomDropdown
						label={t("employeeSearch.modal.fields.position")}
						name="position_id"
						value={formData.position_id}
						onChange={handleChange}
						options={positionOptions}
						placeholder={t("employeeSearch.modal.fields.position")}
						bgColor="bg-[#fff]"
					/>
				</div>

				{/* Action Buttons */}
				<div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
					<Button
						onClick={onClose}
						title={t("common.cancel")}
						className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-none"
						disabled={loading}
					/>
					<Button
						onClick={handleSubmit}
						title={submitButtonText}
						className="shadow-none"
						disabled={loading}
					/>
				</div>
			</div>
		</SlideUpModal>
	);
};

EmployeeModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	mode: PropTypes.oneOf(["create", "edit"]),
	employee: PropTypes.object,
	onSubmit: PropTypes.func,
	loading: PropTypes.bool,
};

export default EmployeeModal;
