import React from "react";
import InvoiceStatusBadge from "../components/InvoiceStatusBadge";

export const buildTableColumns = () => [
	{
		header: "Invoice",
		accessor: "invoice",
		render: value => <span className="font-semibold text-blue-600">{value}</span>,
	},
	{
		header: "Supplier",
		accessor: "customer",
	},
	{
		header: "Date",
		accessor: "date",
	},
	{
		header: "Due Date",
		accessor: "dueDate",
	},
	{
		header: "Currency",
		accessor: "currency",
	},
	{
		header: "Total",
		accessor: "total",
		render: value => <span className="font-semibold">{value}</span>,
	},
	{
		header: "Rate",
		accessor: "rate",
	},
	{
		header: "Base Total",
		accessor: "baseTotal",
		render: value => <span className="font-semibold">{value}</span>,
	},
	{
		header: "Balance",
		accessor: "balance",
		render: value => <span className="font-semibold text-orange-600">{value}</span>,
	},
	{
		header: "Posting Status",
		accessor: "postingStatus",
		render: value => <InvoiceStatusBadge type="posting" value={value} />,
	},
	{
		header: "Payment Status",
		accessor: "paymentStatus",
		width: "150px",
		render: value => <InvoiceStatusBadge type="payment" value={value} />,
	},
	{
		header: "Approval Status",
		accessor: "approvalStatus",
		render: value => <InvoiceStatusBadge type="approval" value={value} />,
	},
];
