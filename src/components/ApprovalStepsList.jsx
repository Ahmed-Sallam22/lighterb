import { useTranslation } from "react-i18next";
import ApprovalStepCard from "./ApprovalStepCard";

const ApprovalStepsList = ({ steps, actionLoading, onApprove, onReject }) => {
	const { t } = useTranslation();

	return (
		<div className="space-y-5">
			<div className="bg-[#f7f8fa] rounded-2xl border border-gray-200 p-6">
				<h3 className="text-xl font-semibold text-[#2b3a49] mb-4">
					{t("procurementApprovalDetail.stepsSectionTitle")}
				</h3>
				<div className="space-y-3">
					{steps.map(step => (
						<ApprovalStepCard
							key={step.id}
							step={step}
							actionLoading={actionLoading}
							onApprove={onApprove}
							onReject={onReject}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default ApprovalStepsList;
