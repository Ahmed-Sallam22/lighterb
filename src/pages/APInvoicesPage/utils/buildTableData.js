export const buildTableData = invoices =>
	invoices.map(invoice => ({
		invoice: invoice.invoice_number || invoice.number,
		customer: invoice.supplier_name,
		date: invoice.date || invoice.invoice_date,
		dueDate: invoice.due_date,
		currency: invoice.currency_code,
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
				: invoice.approval_status === "PENDING_APPROVAL"
				? "Pending"
				: invoice.approval_status === "REJECTED"
				? "Rejected"
				: "Draft",
		rawData: invoice,
	}));
