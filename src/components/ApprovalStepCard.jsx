import { useTranslation } from "react-i18next";
import Button from "./shared/Button";
import StepCheckIcon from "../assets/icons/StepCheckIcon";

const statusStyles = {
	PENDING: {
		bg: "bg-amber-100",
		text: "text-amber-700",
		border: "border-amber-200",
	},
	APPROVED: {
		bg: "bg-emerald-100",
		text: "text-emerald-700",
		border: "border-emerald-200",
	},
	REJECTED: {
		bg: "bg-red-100",
		text: "text-red-700",
		border: "border-red-200",
	},
	IN_PROGRESS: {
		bg: "bg-blue-100",
		text: "text-blue-700",
		border: "border-blue-200",
	},
};

const ApprovalStepCard = ({ step, actionLoading, onApprove, onReject }) => {
	const { t } = useTranslation();
	const stepStyle = statusStyles[step.status] || statusStyles.PENDING;
	const workflowStep = step.workflow_step_details;
	const isPending = step.status === "PENDING";

	return (
		<div className={`rounded-2xl border ${stepStyle.border} bg-white p-5 shadow-sm`}>
			<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
				<div className="flex items-start gap-3">
					<div
						className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${stepStyle.bg} ${stepStyle.text}`}
					>
						<StepCheckIcon />
					</div>
					<div className="flex-1">
						<p className="text-base font-semibold text-[#1f4560]">
							{t("procurementApprovalDetail.step")} {workflowStep?.sequence}:{" "}
							{workflowStep?.name || t("procurementApprovalDetail.na")}
						</p>
						<p className="text-sm text-gray-500 mt-1">
							{workflowStep?.description || t("procurementApprovalDetail.noDescription")}
						</p>
						<div className="text-xs text-gray-500 mt-2 space-y-1">
							<p>
								{t("procurementApprovalDetail.approverType")}:
								<span className="font-medium mx-1">
									{workflowStep?.approver_type || t("procurementApprovalDetail.na")}
								</span>
							</p>
							{workflowStep?.role_name && (
								<p>
									{t("procurementApprovalDetail.role")}:
									<span className="font-medium mx-1">{workflowStep.role_name}</span>
								</p>
							)}
							{step.activated_at && (
								<p>
									{t("procurementApprovalDetail.activated")}:
									<span className="font-medium mx-1">
										{new Date(step.activated_at).toLocaleString()}
									</span>
								</p>
							)}
							{step.due_at && (
								<p>
									{t("procurementApprovalDetail.due")}:
									<span className="font-medium mx-1">{new Date(step.due_at).toLocaleString()}</span>
								</p>
							)}
							{step.completed_at && (
								<p>
									{t("procurementApprovalDetail.completed")}:
									<span className="font-medium mx-1">
										{new Date(step.completed_at).toLocaleString()}
									</span>
								</p>
							)}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<span
						className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${stepStyle.bg} ${stepStyle.text} ${stepStyle.border}`}
					>
						{t(`procurementApprovalDetail.status.${step.status}`)}
					</span>
				</div>
			</div>

			{/* Action Buttons for Pending Steps */}
			{isPending && (
				<div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
					<Button
						onClick={() => onApprove(step)}
						disabled={actionLoading}
						title={
							actionLoading
								? t("procurementApprovalDetail.actions.processing")
								: t("procurementApprovalDetail.actions.approve")
						}
						className="bg-emerald-500 hover:bg-emerald-600 text-sm"
					/>
					<Button
						onClick={() => onReject(step)}
						disabled={actionLoading}
						title={
							actionLoading
								? t("procurementApprovalDetail.actions.processing")
								: t("procurementApprovalDetail.actions.reject")
						}
						className="bg-red-500 hover:bg-red-600 text-sm"
					/>
				</div>
			)}

			{/* Actions History */}
			{step.actions && step.actions.length > 0 && (
				<div className="mt-4 pt-4 border-t border-gray-200">
					<h4 className="text-sm font-semibold text-[#2b3a49] mb-2">
						{t("procurementApprovalDetail.actionsHistory")}
					</h4>
					<div className="space-y-2">
						{step.actions.map(action => (
							<div key={action.id} className="text-xs bg-gray-50 rounded-lg p-3">
								<div className="flex items-center justify-between mb-1">
									<span className="font-semibold text-[#1f4560]">
										{action.user_details?.username ||
											`${t("procurementApprovalDetail.user")} #${action.user}`}
									</span>
									<span
										className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
											action.action === "APPROVED"
												? "bg-emerald-100 text-emerald-700"
												: "bg-red-100 text-red-700"
										}`}
									>
										{t(`procurementApprovalDetail.status.${action.action}`)}
									</span>
								</div>
								{action.comments && (
									<p className="text-gray-600 mt-1">
										{t("procurementApprovalDetail.comments")}: {action.comments}
									</p>
								)}
								<p className="text-gray-500 mt-1">{new Date(action.created_at).toLocaleString()}</p>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default ApprovalStepCard;
