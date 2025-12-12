import React from "react";
import { useTranslation } from "react-i18next";
import Table from "../../../components/shared/Table";
import Pagination from "../../../components/shared/Pagination";

const InvoiceTable = ({
	columns,
	data,
	loading,
	onView,
	onDelete,
	onThreeWayMatch, // Optional - only for AP
	onSubmitForApproval,
	onPostToGL,
	emptyMessage = "No invoices found",
	showActionsCondition,
	showDeleteCondition,
	// Pagination props
	currentPage,
	totalCount,
	pageSize,
	hasNext,
	hasPrevious,
	onPageChange,
	onPageSizeChange,
}) => {
	const { t } = useTranslation();

	if (loading) {
		return (
			<div className="flex justify-center items-center py-12">
				<div className="text-gray-500">{t("apInvoices.table.loading")}</div>
			</div>
		);
	}

	const actions = [
		// Three-Way Match (AP only)
		onThreeWayMatch && {
			label: t("apInvoices.actions.threeWayMatch"),
			onClick: onThreeWayMatch,
			condition: row =>
				row.rawData?.po_header_id &&
				row.rawData?.goods_receipt_id &&
				row.rawData?.three_way_match_status !== "MATCHED" &&
				!row.rawData?.is_posted,
		},
		{
			label: t("apInvoices.actions.submitForApproval"),
			onClick: onSubmitForApproval,
			condition: row => row.rawData?.approval_status === "DRAFT" && !row.rawData?.is_posted,
		},
		{
			label: t("apInvoices.actions.postToGL"),
			onClick: onPostToGL,
			condition: row => row.rawData?.approval_status === "APPROVED" && !row.rawData?.is_posted,
		},
	].filter(Boolean); // Remove undefined actions

	return (
		<>
			<Table
				columns={columns}
				data={data}
				onView={onView}
				onDelete={onDelete}
				emptyMessage={emptyMessage}
				showActions={showActionsCondition}
				showDeleteButton={showDeleteCondition}
				actions={actions}
			/>

			{/* Pagination */}
			{totalCount > 0 && (
				<Pagination
					currentPage={currentPage}
					totalCount={totalCount}
					pageSize={pageSize}
					hasNext={hasNext}
					hasPrevious={hasPrevious}
					onPageChange={onPageChange}
					onPageSizeChange={onPageSizeChange}
				/>
			)}
		</>
	);
};

export default InvoiceTable;
