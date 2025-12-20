import React from "react";
import FloatingLabelInput from "../shared/FloatingLabelInput";
import FloatingLabelSelect from "../shared/FloatingLabelSelect";
import Button from "../shared/Button";

const UserForm = ({
	t,
	formData,
	errors = {},
	onChange,
	onCancel,
	onSubmit,
	isEditing,
	userTypeOptions,
	jobRoleOptions = [],
	loading,
}) => {
	return (
		<div className="flex flex-col gap-6 py-2">
			{/* Show user info (read-only) when editing */}
			{isEditing && (
				<>
					{/* Name - Read Only */}
					<FloatingLabelInput label={t("users.form.name")} name="name" value={formData.name} disabled />

					{/* Email - Read Only */}
					<FloatingLabelInput
						label={t("users.form.email")}
						name="email"
						type="email"
						value={formData.email}
						disabled
					/>

					{/* Phone Number - Read Only */}
					<FloatingLabelInput
						label={t("users.form.phone")}
						name="phone_number"
						value={formData.phone_number}
						disabled
					/>
				</>
			)}

			{/* Create mode - editable fields */}
			{!isEditing && (
				<>
					{/* Name */}
					<FloatingLabelInput
						label={t("users.form.name")}
						name="name"
						value={formData.name}
						onChange={e => onChange("name", e.target.value)}
						error={errors.name}
						required
					/>

					{/* Email */}
					<FloatingLabelInput
						label={t("users.form.email")}
						name="email"
						type="email"
						value={formData.email}
						onChange={e => onChange("email", e.target.value)}
						error={errors.email}
						required
					/>

					{/* Phone Number */}
					<FloatingLabelInput
						label={t("users.form.phone")}
						name="phone_number"
						value={formData.phone_number}
						onChange={e => onChange("phone_number", e.target.value)}
						error={errors.phone_number}
					/>
				</>
			)}

			{/* User Type - Always editable (with permission-based options) */}
			<FloatingLabelSelect
				label={t("users.form.userType")}
				name="user_type"
				value={formData.user_type}
				onChange={e => onChange("user_type", e.target.value)}
				options={userTypeOptions}
				error={errors.user_type}
			/>

			{/* Job Role - Editable */}
			{jobRoleOptions.length > 0 && (
				<FloatingLabelSelect
					label={t("users.form.jobRole")}
					name="job_role"
					value={formData.job_role || ""}
					onChange={e => onChange("job_role", e.target.value)}
					options={jobRoleOptions}
					error={errors.job_role}
				/>
			)}

			{/* Password fields - only for new users */}
			{!isEditing && (
				<>
					<FloatingLabelInput
						label={t("users.form.password")}
						name="password"
						type="password"
						value={formData.password}
						onChange={e => onChange("password", e.target.value)}
						error={errors.password}
						required
					/>
					<FloatingLabelInput
						label={t("users.form.confirmPassword")}
						name="confirm_password"
						type="password"
						value={formData.confirm_password}
						onChange={e => onChange("confirm_password", e.target.value)}
						error={errors.confirm_password}
						required
					/>
				</>
			)}

			{/* Action Buttons */}
			<div className="flex gap-3 pt-4">
				<Button
					onClick={onCancel}
					title={t("users.modal.cancel")}
					className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 flex-1"
					disabled={loading}
				/>
				<Button
					onClick={onSubmit}
					title={isEditing ? t("users.modal.update") : t("users.modal.create")}
					className="flex-1"
					disabled={loading}
				/>
			</div>
		</div>
	);
};

export default UserForm;
