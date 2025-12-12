/**
 * Transforms invoice data for table display
 * @param {Array} invoices - Array of invoice objects
 * @param {string} type - 'AR', 'AP', or 'ONE_TIME_SUPPLIER' to determine customer/supplier field
 * @returns {Array} Transformed data for table
 */
export const buildInvoiceTableData = (invoices, type = "AP") => {
	const isAR = type === "AR";
	const isOneTimeSupplier = type === "ONE_TIME_SUPPLIER";
	const partyField = isAR ? "customer_name" : "supplier_name";
	const partyIdField = isAR ? "customer_id" : isOneTimeSupplier ? null : "supplier_id";

	const formatStatus = value => {
		if (!value) return "-";
		const normalized = value.toString().trim().toLowerCase();
		if (["paid", "paid_in_full"].includes(normalized)) return "Paid";
		if (["partially_paid", "partial"].includes(normalized)) return "Partial";
		if (["unpaid", "open"].includes(normalized)) return "Unpaid";
		if (["approved"].includes(normalized)) return "Approved";
		if (["pending", "pending_approval"].includes(normalized)) return "Pending";
		if (["rejected"].includes(normalized)) return "Rejected";
		return value;
	};

	return invoices.map(invoice => ({
		id: invoice.invoice_id || invoice.id || invoice.number,
		invoice: invoice.invoice_id || invoice.id || invoice.number || "-",
		entityId: partyIdField ? invoice[partyIdField] || null : null,
		customer: invoice[partyField] || "-",
		date: invoice.date || invoice.invoice_date || "-",
		currency: invoice.currency_code || invoice.currency || "-",
		total: invoice.total ?? invoice.total_amount ?? "0.00",
		approvalStatus: formatStatus(invoice.approval_status),
		paymentStatus: formatStatus(invoice.payment_status),
		rawData: invoice,
	}));
};
