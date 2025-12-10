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
		header: t("apInvoices.table.dueDate"),
		accessor: "dueDate",
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
		header: t("apInvoices.table.rate"),
		accessor: "rate",
	},
	{
		header: t("apInvoices.table.baseTotal"),
		accessor: "baseTotal",
		render: value => <span className="font-semibold">{value}</span>,
	},
	{
		header: t("apInvoices.table.balance"),
		accessor: "balance",
		render: value => <span className="font-semibold text-orange-600">{value}</span>,
	},
	{
		header: t("apInvoices.table.postingStatus"),
		accessor: "postingStatus",
		render: value => <InvoiceStatusBadge type="posting" value={value} />,
	},
	{
		header: t("apInvoices.table.paymentStatus"),
		accessor: "paymentStatus",
		width: "150px",
		render: value => <InvoiceStatusBadge type="payment" value={value} />,
	},
	{
		header: t("apInvoices.table.approvalStatus"),
		accessor: "approvalStatus",
		render: value => <InvoiceStatusBadge type="approval" value={value} />,
	},
];
