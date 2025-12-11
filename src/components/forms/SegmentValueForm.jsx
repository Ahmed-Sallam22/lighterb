import { useTranslation } from "react-i18next";
import FloatingLabelInput from "../shared/FloatingLabelInput";
import FloatingLabelSelect from "../shared/FloatingLabelSelect";
import Toggle from "../shared/Toggle";
import Button from "../shared/Button";

const SegmentValueForm = ({
	formData,
	errors,
	loading,
	isEditMode,
	selectedSegmentTypeLength,
	segmentTypeOptions,
	nodeTypeOptions,
	onInputChange,
	onSubmit,
	onCancel,
}) => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col gap-6 py-2">
			<FloatingLabelSelect
				label={t("segments.form.segmentType")}
				value={formData.segment_type}
				onChange={e => onInputChange("segment_type", e.target.value)}
				options={segmentTypeOptions}
				required
				error={errors.segment_type}
			/>
			{selectedSegmentTypeLength && (
				<p className="text-xs text-blue-600 font-medium mt-1 px-1">
					{t("segments.values.infoLength", { length: selectedSegmentTypeLength })}
				</p>
			)}

			<FloatingLabelInput
				label={t("segments.form.code")}
				value={formData.code}
				onChange={e => onInputChange("code", e.target.value)}
				required
				error={errors.code}
				maxLength={selectedSegmentTypeLength || undefined}
				placeholder={
					selectedSegmentTypeLength
						? t("segments.form.placeholders.codeWithLen", { length: selectedSegmentTypeLength })
						: t("segments.form.placeholders.code")
				}
			/>
			{selectedSegmentTypeLength && (
				<p className="text-xs text-gray-500 mt-1 px-1">
					{t("segments.values.requiredLength", { length: selectedSegmentTypeLength })}
					{formData.code && (
						<span
							className={`mx-1 ${
								formData.code.length === selectedSegmentTypeLength
									? "text-green-600 font-semibold"
									: "text-orange-600 font-semibold"
							}`}
						>
							{t("segments.values.currentLength", {
								current: formData.code.length,
								max: selectedSegmentTypeLength,
							})}
						</span>
					)}
				</p>
			)}

			<FloatingLabelInput
				label={t("segments.form.alias")}
				value={formData.alias}
				onChange={e => onInputChange("alias", e.target.value)}
				required
				error={errors.alias}
			/>

			<FloatingLabelInput
				label={t("segments.form.parentCode")}
				value={formData.parent_code || ""}
				onChange={e => onInputChange("parent_code", e.target.value || null)}
				placeholder={t("segments.form.placeholders.parent")}
			/>

			<FloatingLabelSelect
				label={t("segments.form.nodeType")}
				value={formData.node_type}
				onChange={e => onInputChange("node_type", e.target.value)}
				options={nodeTypeOptions}
			/>

			<Toggle
				label={t("segments.form.status")}
				checked={formData.is_active}
				onChange={() => onInputChange("is_active", !formData.is_active)}
			/>

			<div className="flex justify-end gap-4 pt-4">
				<Button
					onClick={onCancel}
					title={t("segments.actions.close")}
					className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
				/>

				<Button
					onClick={onSubmit}
					disabled={loading}
					title={
						loading
							? t("segments.actions.saving")
							: isEditMode
							? t("segments.actions.update")
							: t("segments.modals.addValue")
					}
				/>
			</div>
		</div>
	);
};

export default SegmentValueForm;
