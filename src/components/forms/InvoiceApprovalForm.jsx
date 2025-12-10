import React from "react";
import FloatingLabelInput from "../shared/FloatingLabelInput";
import FloatingLabelSelect from "../shared/FloatingLabelSelect";
import LoadingSpan from "../shared/LoadingSpan";

const InvoiceApprovalForm = ({
	t,
	formData,
	onChange,
	onCancel,
	onSubmit,
	loading = false,
	editingApproval = null,
	availableInvoices = [],
}) => {
	return (
		<div className="space-y-4">
			{/* Invoice Type */}
			<FloatingLabelSelect
				label={t("invoiceApprovals.form.invoiceType")}
				value={formData.invoice_type}
				onChange={e => onChange("invoice_type", e.target.value)}
				options={[
					{ value: "AP", label: t("invoiceApprovals.actions.apInvoice") },
					{ value: "AR", label: t("invoiceApprovals.actions.arInvoice") },
				]}
				required
			/>

			{/* Invoice */}
			<FloatingLabelSelect
				label={t("invoiceApprovals.form.invoice")}
				value={formData.invoice_id}
				onChange={e => onChange("invoice_id", e.target.value)}
				options={availableInvoices.map(invoice => ({
					value: invoice.id.toString(),
					label: `#${invoice.id} - ${
						invoice.customer?.name ||
						invoice.supplier?.name ||
						invoice.vendor?.name ||
						t("invoiceApprovals.form.na")
					} - ${invoice.total || invoice.amount || 0}`,
				}))}
				disabled={!formData.invoice_type}
				required
			/>

			{/* Submitted By */}
			<FloatingLabelInput
				label={t("invoiceApprovals.form.submittedBy")}
				value={formData.submitted_by}
				onChange={e => onChange("submitted_by", e.target.value)}
				required
			/>

			{/* Action Buttons */}
			<div className="border-t border-gray-200 mt-6 pt-4 flex gap-3">
				<button
					onClick={onCancel}
					className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
					disabled={loading}
				>
					{t("invoiceApprovals.actions.cancel")}
				</button>

				<button
					onClick={onSubmit}
					disabled={loading}
					className="flex-1 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#1f6477] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? (
						<LoadingSpan
							text={
								editingApproval
									? t("invoiceApprovals.actions.updating")
									: t("invoiceApprovals.actions.creating")
							}
						/>
					) : editingApproval ? (
						t("invoiceApprovals.actions.update")
					) : (
						t("invoiceApprovals.actions.create")
					)}
				</button>
			</div>
		</div>
	);
};

export default InvoiceApprovalForm;
