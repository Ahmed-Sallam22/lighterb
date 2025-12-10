import { useTranslation } from "react-i18next";
import Button from "./shared/Button";
import BackArrowIcon from "../assets/icons/BackArrowIcon";

const statusStyles = {
	PENDING: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
	APPROVED: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
	REJECTED: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
	IN_PROGRESS: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
};

const ApprovalDetailHeader = ({ instanceId, overallStatus, approvedCount, totalSteps, onBack }) => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const statusStyle = statusStyles[overallStatus] || statusStyles.PENDING;

	return (
		<>
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
				<div className="flex items-center gap-3">
					<Button
						onClick={onBack}
						icon={<BackArrowIcon className={isRtl ? "rotate-180" : ""} />}
						title={t("procurementApprovalDetail.backToApprovals")}
						className="bg-white border border-[#28819C] text-[#28819C] hover:bg-[#e5f2f7]"
					/>
					<h2 className="text-2xl font-semibold text-[#1f4560]">
						{t("procurementApprovalDetail.title", { id: instanceId })}
					</h2>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-3 mb-6">
				<span
					className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
				>
					{t(`procurementApprovalDetail.status.${overallStatus}`)}
				</span>
				<span className="text-sm text-gray-500">
					{t("procurementApprovalDetail.progress", { approved: approvedCount, total: totalSteps })}
				</span>
			</div>
		</>
	);
};

export default ApprovalDetailHeader;
