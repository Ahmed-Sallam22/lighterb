import { useTranslation } from "react-i18next";
import FloatingLabelInput from "../shared/FloatingLabelInput";
import Toggle from "../shared/Toggle";
import Button from "../shared/Button";
import FloatingLabelTextarea from "../shared/FloatingLabelTextarea";

const SegmentTypeForm = ({ formData, errors, loading, isEditMode, onInputChange, onSubmit, onCancel }) => {
	const { t } = useTranslation();

	return (
		<div className="relative overflow-hidden py-2">
			<div className="flex flex-col gap-6">
				<FloatingLabelInput
					label={t("segments.form.segmentName")}
					value={formData.segment_name}
					onChange={e => onInputChange("segment_name", e.target.value)}
					required
					error={errors.segment_name}
					className="bg-white rounded-2xl"
				/>

				<FloatingLabelInput
					label={t("segments.form.technicalType")}
					value={formData.segment_type}
					onChange={e => onInputChange("segment_type", e.target.value)}
					required
					error={errors.segment_type}
					className="bg-white rounded-2xl"
				/>

				<FloatingLabelInput
					label={t("segments.form.fixedLength")}
					type="number"
					value={formData.length}
					onChange={e => onInputChange("length", e.target.value)}
					required
					error={errors.length}
					className="bg-white rounded-2xl"
				/>

				<FloatingLabelInput
					label={t("segments.form.displayOrder")}
					type="number"
					value={formData.display_order}
					onChange={e => onInputChange("display_order", e.target.value)}
					required
					error={errors.display_order}
					className="bg-white rounded-2xl"
				/>

				<div className="relative rounded-2xl bg-white border border-[#E0EAED] shadow-sm">
					{/* <textarea
						value={formData.description}
						onChange={e => onInputChange("description", e.target.value)}
						placeholder={t("segments.form.placeholders.description")}
						rows="4"
						className="w-full bg-transparent px-5 pt-5 pb-3 text-gray-900 focus:outline-none"
					/> */}
					<FloatingLabelTextarea
						label={t("segments.form.description")}
						value={formData.description}
						onChange={e => onInputChange("description", e.target.value)}
						placeholder={t("segments.form.placeholders.description")}
						rows={4}
						className="bg-white rounded-2xl"
					/>
					{errors.description && (
						<p className="absolute text-red-400 text-xs mt-1 px-5">{errors.description}</p>
					)}
				</div>

				<Toggle
					label={t("segments.form.mandatory")}
					checked={formData.is_required}
					onChange={() => onInputChange("is_required", !formData.is_required)}
				/>
				<Toggle
					label={t("segments.form.hierarchy")}
					checked={formData.has_hierarchy}
					onChange={() => onInputChange("has_hierarchy", !formData.has_hierarchy)}
				/>
				<Toggle
					label={t("segments.form.status")}
					checked={formData.is_active}
					onChange={() => onInputChange("is_active", !formData.is_active)}
				/>
			</div>

			<div className="mt-6 flex justify-end gap-4">
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
							: t("segments.modals.addType")
					}
				/>
			</div>
		</div>
	);
};

export default SegmentTypeForm;
