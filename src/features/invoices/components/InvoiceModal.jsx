import React from "react";
import ConfirmModal from "../../../components/shared/ConfirmModal";

const MODAL_CONFIGS = {
	delete: {
		title: "Delete Invoice",
		confirmText: "Delete",
		message: invoice =>
			`Are you sure you want to delete invoice ${invoice?.invoice_number}? This action cannot be undone.`,
	},
	reverse: {
		title: "Reverse Invoice",
		confirmText: "Reverse",
		message: invoice =>
			`Are you sure you want to reverse invoice ${invoice?.invoice_number}? This will create a reversal entry.`,
	},
	post: {
		title: "Post Invoice to GL",
		confirmText: "Post",
		message: invoice => `Are you sure you want to post invoice ${invoice?.invoice_number} to the General Ledger?`,
	},
};

const InvoiceModal = ({ isOpen, actionType, invoice, onClose, onConfirm }) => {
	if (!isOpen || !actionType || !invoice) return null;

	const config = MODAL_CONFIGS[actionType];
	if (!config) return null;

	return (
		<ConfirmModal
			isOpen={isOpen}
			title={config.title}
			message={config.message(invoice)}
			confirmText={config.confirmText}
			onClose={onClose}
			onConfirm={onConfirm}
		/>
	);
};

export default InvoiceModal;
