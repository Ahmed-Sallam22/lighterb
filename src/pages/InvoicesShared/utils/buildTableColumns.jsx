import React from "react";
import InvoiceStatusBadge from "../components/InvoiceStatusBadge";

export const buildInvoiceTableColumns = (customerLabel = "Customer", t) => [
	{
		header: t("apInvoices.table.invoice"),
		accessor: "invoice",
		render: value => <span className="font-semibold text-blue-600">{value}</span>,
	},
	{
		header: customerLabel,
		accessor: "customer",
	},
	{
		header: t("apInvoices.table.date"),
		accessor: "date",
	},
	{
		header: t("apInvoices.table.currency"),
		accessor: "currency",
	},
	{
		header: t("apInvoices.table.total"),
		accessor: "total",
		render: value => <span className="font-semibold">{value}</span>,
	},
	{
		header: t("apInvoices.table.approvalStatus"),
		accessor: "approvalStatus",
		render: value => <InvoiceStatusBadge type="approval" value={value} />,
	},
	{
		header: t("apInvoices.table.paymentStatus"),
		accessor: "paymentStatus",
		width: "150px",
		render: value => <InvoiceStatusBadge type="payment" value={value} />,
	},
];
