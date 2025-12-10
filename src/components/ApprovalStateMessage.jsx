import { useTranslation } from "react-i18next";
import PageHeader from "./shared/PageHeader";
import Button from "./shared/Button";
import ProcurementApprovalHeaderIcon from "../assets/icons/ProcurementApprovalHeaderIcon";
import BackArrowIcon from "../assets/icons/BackArrowIcon";

const ApprovalStateMessage = ({ type, instanceId, message, onBack }) => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";

	let title = t("procurementApprovalDetail.title", { id: instanceId });
	let content = null;

	switch (type) {
		case "loading":
			content = <p className="text-gray-600">{t("procurementApprovalDetail.loading")}</p>;
			break;
		case "error":
			title = t("procurementApprovalDetail.errorTitle");
			content = (
				<>
					<p className="text-red-600 mb-4">{message}</p>
					<Button
						onClick={onBack}
						icon={<BackArrowIcon className={isRtl ? "rotate-180" : ""} />}
						title={t("procurementApprovalDetail.backToApprovals")}
						className="bg-white border border-[#28819C] text-[#28819C] hover:bg-[#e5f2f7]"
					/>
				</>
			);
			break;
		case "empty":
			content = (
				<>
					<p className="text-gray-600 mb-4">{t("procurementApprovalDetail.noStepsFound")}</p>
					<Button
						onClick={onBack}
						icon={<BackArrowIcon className={isRtl ? "rotate-180" : ""} />}
						title={t("procurementApprovalDetail.backToApprovals")}
						className="bg-white border border-[#28819C] text-[#28819C] hover:bg-[#e5f2f7]"
					/>
				</>
			);
			break;
		default:
			return null;
	}

	return (
		<section className="min-h-screen bg-[#f2f3f5] pb-12">
			<PageHeader
				icon={<ProcurementApprovalHeaderIcon />}
				title={title}
				subtitle={t("procurementApprovalDetail.subtitle")}
			/>
			<div className="max-w-6xl mx-auto px-6 mt-6">
				<div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8 text-center">{content}</div>
			</div>
		</section>
	);
};

export default ApprovalStateMessage;
