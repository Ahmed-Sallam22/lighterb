import EditIcon from "../../assets/icons/EditIcon";
import DeleteIcon from "../../assets/icons/DeleteIcon";
import CheckmarkIcon from "../../assets/icons/CheckmarkIcon";
import { useTranslation } from "react-i18next";
import Button from "../shared/Button";

const SegmentTypeCard = ({ segment, onEdit, onDelete, onToggleRequired, onToggleHierarchy, isRtl }) => {
	const { t } = useTranslation();

	return (
		<div
			key={segment.segment_id}
			className="bg-white rounded-3xl shadow-[0_10px_35px_rgba(15,55,80,0.08)] border border-gray-100 p-6 transition-all duration-300 hover:shadow-[0_18px_45px_rgba(15,55,80,0.12)]"
		>
			<div className="flex items-start justify-between gap-4">
				<div>
					<h3 className="text-xl font-semibold text-gray-900">{segment.segment_name}</h3>
					<p className="text-sm text-gray-500 mt-1">{segment.segment_type}</p>
				</div>

				<div className="flex items-center gap-1 text-[#1A7A99]">
					{/* <button
						type="button"
						onClick={() => onEdit(segment)}
						className="rounded-full hover:bg-[#E7F3F6] transition-colors"
						title={t("segments.actions.edit")}
					>
						<EditIcon width={32} height={32} />
					</button> */}
					<Button
						onClick={() => onEdit(segment)}
						className="bg-white hover:bg-[#E7F3F6] transition-colors"
						title={t("segments.actions.edit")}
						icon={<EditIcon width={24} height={24} />}
					/>

					<Button
						onClick={() => onDelete(segment)}
						className="bg-white hover:bg-red-50 transition-colors"
						title={t("segments.actions.delete")}
						icon={<DeleteIcon width={24} height={24} />}
					/>
				</div>
			</div>

			<div className="mt-3 flex flex-wrap gap-4">
				<button
					type="button"
					onClick={() => onToggleRequired(segment)}
					className="inline-flex items-center gap-2 rounded-2xl py-2 text-sm font-semibold text-[#1F809F]"
				>
					<span
						className={`h-4 w-4 rounded-md border flex items-center justify-center ${
							segment.is_required ? "bg-[#1F809F] border-[#1F809F]" : "border-gray-300 bg-white"
						}`}
					>
						{segment.is_required && <CheckmarkIcon />}
					</span>
					{t("segments.types.required")}
				</button>

				<button
					type="button"
					onClick={() => onToggleHierarchy(segment)}
					className="inline-flex items-center gap-2 rounded-2xl py-2 text-sm font-semibold text-[#1F809F]"
				>
					<span
						className={`h-4 w-4 rounded-md border flex items-center justify-center ${
							segment.has_hierarchy ? "bg-[#1F809F] border-[#1F809F]" : "border-gray-300 bg-white"
						}`}
					>
						{segment.has_hierarchy && <CheckmarkIcon />}
					</span>
					{t("segments.types.hasHierarchy")}
				</button>
			</div>

			<p className="mt-3 text-[15px] leading-relaxed text-gray-600">
				{segment.description || t("segments.types.noDescription")}
			</p>

			<div className="mt-3 flex items-center justify-between border-gray-100 pt-4">
				<span
					className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold ${
						segment.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
					}`}
				>
					{segment.is_active ? t("segments.status.active") : t("segments.status.inactive")}
				</span>

				<div className={`text-xs text-gray-500 ${isRtl ? "text-left" : "text-right"}`}>
					<div>
						{t("segments.types.length")}: {segment.length}
					</div>
					<div>
						{t("segments.types.order")}: {segment.display_order}
					</div>
				</div>
			</div>
		</div>
	);
};

export default SegmentTypeCard;
