import React from "react";
import Table from "../../../components/shared/Table";

const InvoiceTable = ({
	columns,
	data,
	loading,
	onEdit,
	onDelete,
	onThreeWayMatch, // Optional - only for AP
	onSubmitForApproval,
	onPostToGL,
	emptyMessage = "No invoices found",
	showActionsCondition,
	showDeleteCondition,
}) => {
	if (loading) {
		return (
			<div className="flex justify-center items-center py-12">
				<div className="text-gray-500">Loading invoices...</div>
			</div>
		);
	}

	const actions = [
		// Three-Way Match (AP only)
		onThreeWayMatch && {
			label: "Three-Way Match",
			onClick: onThreeWayMatch,
			condition: row =>
				row.rawData?.po_header_id &&
				row.rawData?.goods_receipt_id &&
				row.rawData?.three_way_match_status !== "MATCHED" &&
				!row.rawData?.is_posted,
		},
		{
			label: "Submit for Approval",
			onClick: onSubmitForApproval,
			condition: row => row.rawData?.approval_status === "DRAFT" && !row.rawData?.is_posted,
		},
		{
			label: "Post to GL",
			onClick: onPostToGL,
			condition: row => row.rawData?.approval_status === "APPROVED" && !row.rawData?.is_posted,
		},
	].filter(Boolean); // Remove undefined actions

	return (
		<Table
			columns={columns}
			data={data}
			onEdit={onEdit}
			onDelete={onDelete}
			emptyMessage={emptyMessage}
			showActions={showActionsCondition}
			showDeleteButton={showDeleteCondition}
			actions={actions}
		/>
	);
};

export default InvoiceTable;
