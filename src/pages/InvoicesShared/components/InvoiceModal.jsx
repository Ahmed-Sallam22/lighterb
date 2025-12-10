import React from "react";
import { useTranslation } from "react-i18next";
import ConfirmModal from "../../../components/shared/ConfirmModal";

const InvoiceModal = ({ isOpen, actionType, invoice, onClose, onConfirm }) => {
	const { t } = useTranslation();

	if (!isOpen || !actionType || !invoice) return null;

	const MODAL_CONFIGS = {
		delete: {
			title: t("apInvoices.modals.deleteTitle"),
			confirmText: t("apInvoices.modals.confirmText.delete"),
			message: t("apInvoices.modals.deleteMessage", { invoiceNumber: invoice?.invoice_number }),
		},
		reverse: {
			title: t("apInvoices.modals.reverseTitle"),
			confirmText: t("apInvoices.modals.confirmText.reverse"),
			message: t("apInvoices.modals.reverseMessage", { invoiceNumber: invoice?.invoice_number }),
		},
		post: {
			title: t("apInvoices.modals.postTitle"),
			confirmText: t("apInvoices.modals.confirmText.post"),
			message: t("apInvoices.modals.postMessage", { invoiceNumber: invoice?.invoice_number }),
		},
	};

	const config = MODAL_CONFIGS[actionType];
	if (!config) return null;

	return (
		<ConfirmModal
			isOpen={isOpen}
			title={config.title}
			message={config.message}
			confirmText={config.confirmText}
			onClose={onClose}
			onConfirm={onConfirm}
		/>
	);
};

export default InvoiceModal;
