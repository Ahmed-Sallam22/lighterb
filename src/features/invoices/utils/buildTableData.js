/**
 * Transforms invoice data for table display
 * @param {Array} invoices - Array of invoice objects
 * @param {string} type - 'AR' or 'AP' to determine customer/supplier field
 * @returns {Array} Transformed data for table
 */
export const buildInvoiceTableData = (invoices, type = "AP") => {
	const customerField = type === "AR" ? "customer_name" : "supplier_name";

	return invoices.map(invoice => ({
		invoice: invoice.invoice_number || invoice.number || "-",
		customer: invoice[customerField] || "-",
		date: invoice.date || invoice.invoice_date || "-",
		dueDate: invoice.due_date || "-",
		currency: invoice.currency_code || "-",
		total: invoice.total || "0.00",
		rate: invoice.exchange_rate || "1.00",
		baseTotal: invoice.base_currency_total || invoice.total || "0.00",
		balance: invoice.balance || "0.00",
		postingStatus: invoice.is_posted ? "Posted" : "Draft",
		paymentStatus:
			invoice.payment_status === "PAID"
				? "Paid"
				: invoice.payment_status === "PARTIALLY_PAID"
				? "Partial"
				: "Unpaid",
		approvalStatus:
			invoice.approval_status === "APPROVED"
				? "Approved"
				: invoice.approval_status === "PENDING_APPROVAL" || invoice.approval_status === "PENDING"
				? "Pending"
				: invoice.approval_status === "REJECTED"
				? "Rejected"
				: "Draft",
		rawData: invoice,
	}));
};
