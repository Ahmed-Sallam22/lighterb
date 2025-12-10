import { useTranslation } from "react-i18next";
import ConfirmModal from "./shared/ConfirmModal";

const ApprovalActionModals = ({ modalState, inputValue, setInputValue, onClose, onConfirm, actionLoading }) => {
	const { t } = useTranslation();
	const { type } = modalState;

	if (!type) return null;

	const isApprove = type === "APPROVE";

	const config = {
		title: isApprove
			? t("procurementApprovalDetail.modals.approveTitle")
			: t("procurementApprovalDetail.modals.rejectTitle"),
		message: isApprove
			? t("procurementApprovalDetail.modals.approveMessage")
			: t("procurementApprovalDetail.modals.rejectMessage"),
		label: isApprove
			? t("procurementApprovalDetail.modals.commentsLabel")
			: t("procurementApprovalDetail.modals.reasonLabel"),
		confirmText: isApprove
			? actionLoading
				? t("procurementApprovalDetail.actions.approving")
				: t("procurementApprovalDetail.actions.approve")
			: actionLoading
			? t("procurementApprovalDetail.actions.rejecting")
			: t("procurementApprovalDetail.actions.reject"),
		color: isApprove ? "green" : "red",
	};

	return (
		<ConfirmModal
			isOpen={true}
			onClose={onClose}
			onConfirm={onConfirm}
			title={config.title}
			message={config.message}
			showTextarea={true}
			textareaLabel={config.label}
			textareaValue={inputValue}
			onTextareaChange={e => setInputValue(e.target.value)}
			textareaId={isApprove ? "approve-comments" : "reject-reason"}
			textareaName={isApprove ? "approve-comments" : "reject-reason"}
			confirmText={config.confirmText}
			cancelText={t("common.cancel", "Cancel")}
			loading={actionLoading}
			confirmColor={config.color}
		/>
	);
};

export default ApprovalActionModals;
