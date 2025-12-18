import React from "react";
import { useTranslation } from "react-i18next";
import Table from "../../../components/shared/Table";
import Pagination from "../../../components/shared/Pagination";

// Action icons
const SubmitApprovalIcon = () => (
	<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
		/>
	</svg>	
);

const PostGLIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15"
			stroke="#10B981"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5C15 5.53043 14.7893 6.03914 14.4142 6.41421C14.0391 6.78929 13.5304 7 13 7H11C10.4696 7 9.96086 6.78929 9.58579 6.41421C9.21071 6.03914 9 5.53043 9 5Z"
			stroke="#10B981"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path d="M12 12H15" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		<path d="M12 16H15" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		<path d="M9 12H9.01" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		<path d="M9 16H9.01" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

const ThreeWayMatchIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M9 12L11 14L15 10" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		<path
			d="M21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3C14.3869 3 16.6761 3.94821 18.364 5.63604C20.0518 7.32387 21 9.61305 21 12Z"
			stroke="#F59E0B"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

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

	const customActions = [
		// Three-Way Match (AP only)
		onThreeWayMatch && {
			icon: <ThreeWayMatchIcon />,
			title: t("apInvoices.actions.threeWayMatch"),
			onClick: onThreeWayMatch,
			showWhen: row =>
				row.rawData?.po_header_id &&
				row.rawData?.goods_receipt_id &&
				row.rawData?.three_way_match_status !== "MATCHED" &&
				!row.rawData?.is_posted,
		},
		{
			icon: <SubmitApprovalIcon />,
			title: t("apInvoices.actions.submitForApproval"),
			onClick: onSubmitForApproval,
			showWhen: row => row.rawData?.approval_status === "DRAFT" && !row.rawData?.is_posted,
		},
		{
			icon: <PostGLIcon />,
			title: t("apInvoices.actions.postToGL"),
			onClick: onPostToGL,
			showWhen: row => row.rawData?.approval_status === "APPROVED" && !row.rawData?.is_posted,
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
				customActions={customActions}
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
