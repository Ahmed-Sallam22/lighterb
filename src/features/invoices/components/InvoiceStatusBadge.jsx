import React from "react";

const STATUS_COLORS = {
	posting: {
		Posted: "bg-green-100 text-green-800",
		Draft: "bg-gray-100 text-gray-800",
	},
	payment: {
		Paid: "bg-green-100 text-green-800",
		Unpaid: "bg-red-100 text-red-800",
		Partial: "bg-yellow-100 text-yellow-800",
	},
	approval: {
		Approved: "bg-green-100 text-green-800",
		Pending: "bg-yellow-100 text-yellow-800",
		Rejected: "bg-red-100 text-red-800",
		Draft: "bg-gray-100 text-gray-800",
	},
};

const InvoiceStatusBadge = ({ type, value }) => {
	const colorClass = STATUS_COLORS[type]?.[value] || "bg-gray-100 text-gray-800";

	return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>{value}</span>;
};

export default InvoiceStatusBadge;
