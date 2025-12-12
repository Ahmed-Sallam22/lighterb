import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/shared/PageHeader";
import APInvoiceIcon from "../../ui/icons/APInvoiceIcon";
import { useAPInvoices } from "./hooks/useAPInvoices";
import { buildInvoiceTableColumns } from "../InvoicesShared/utils/buildTableColumns";
import { buildInvoiceTableData } from "../InvoicesShared/utils/buildTableData";
import InvoiceTable from "../InvoicesShared/components/InvoiceTable";
import InvoiceModal from "../InvoicesShared/components/InvoiceModal";
import InvoiceDetailsModal from "../InvoicesShared/components/InvoiceDetailsModal";
import InvoiceToolbarFilters from "../InvoicesShared/components/InvoiceToolbarFilters";
import { PAGE_CONFIG } from "./constants/pageConfig";
import { useInvoiceHandlers } from "../InvoicesShared/handlers/useInvoiceHandlers";

const APInvoicesPage = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	// Custom hook for invoice data and operations
	const {
		invoices,
		loading,
		error,
		refreshInvoices,
		deleteInvoice,
		reverseInvoice,
		postInvoiceToGL,
		submitForApproval,
		performThreeWayMatch,
		// Pagination
		count,
		page,
		pageSize,
		hasNext,
		hasPrevious,
		onPageChange,
		onPageSizeChange,
	} = useAPInvoices();

	// Component state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedInvoice, setSelectedInvoice] = useState(null);
	const [actionType, setActionType] = useState(null); // 'delete', 'reverse', 'post'
	const [isDetailOpen, setIsDetailOpen] = useState(false);
	const [detailInvoiceId, setDetailInvoiceId] = useState(null);

	// Page configuration

	// Show error toast when error occurs
	useEffect(() => {
		if (error) {
			toast.error(error, { autoClose: 5000 });
		}
	}, [error]);

	// Update browser title
	useEffect(() => {
		document.title = `${t("apInvoices.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	// Prepare table data and columns
	const tableData = buildInvoiceTableData(invoices, "AP");
	const tableColumns = buildInvoiceTableColumns(t("apInvoices.table.supplier"), t);

	// Event handlers
	const {
		handleSearch,
		handleFilter,
		handleCreate,
		handleEdit,
		handleDelete,
		handleSubmitForApproval,
		handlePostToGL,
		handleThreeWayMatch,
		handleConfirmAction,
		handleCloseModal,
	} = useInvoiceHandlers({
		navigate,
		quickActionPath: PAGE_CONFIG.quickActionPath,
		setSelectedInvoice,
		setActionType,
		setIsModalOpen,
		submitForApproval,
		performThreeWayMatch,
		refreshInvoices,
		deleteInvoice,
		reverseInvoice,
		postInvoiceToGL,
	});

	const handleView = row => {
		const invoice = row.rawData || row;
		const id = invoice.invoice_id || invoice.id;
		if (!id) return;
		setDetailInvoiceId(id);
		setIsDetailOpen(true);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Page Header */}
			<PageHeader icon={PAGE_CONFIG.icon} title={t("apInvoices.title")} subtitle={t("apInvoices.subtitle")} />

			{/* Toolbar */}
			<div className="px-6 mt-6">
				<InvoiceToolbarFilters
					onSearch={handleSearch}
					onFilter={handleFilter}
					onCreateClick={handleCreate}
					createButtonText={t("apInvoices.toolbar.newInvoice")}
				/>
			</div>

			{/* Table */}
			<div className="px-6 mt-6 pb-6">
				<InvoiceTable
					columns={tableColumns}
					data={tableData}
					loading={loading}
					onView={handleView}
					onEdit={null}
					onDelete={handleDelete}
					onThreeWayMatch={handleThreeWayMatch}
					onSubmitForApproval={handleSubmitForApproval}
					onPostToGL={handlePostToGL}
					emptyMessage={t("apInvoices.table.emptyMessage")}
					showActionsCondition={row => row.rawData?.approval_status === "DRAFT"}
					// Pagination props
					currentPage={page}
					totalCount={count}
					pageSize={pageSize}
					hasNext={hasNext}
					hasPrevious={hasPrevious}
					onPageChange={onPageChange}
					onPageSizeChange={onPageSizeChange}
				/>
			</div>

			{/* Confirmation Modal */}
			<InvoiceModal
				isOpen={isModalOpen}
				actionType={actionType}
				invoice={selectedInvoice}
				onClose={handleCloseModal}
				onConfirm={() => handleConfirmAction(actionType, selectedInvoice)}
			/>

			<InvoiceDetailsModal
				isOpen={isDetailOpen}
				invoiceId={detailInvoiceId}
				type="AP"
				onClose={() => {
					setIsDetailOpen(false);
					setDetailInvoiceId(null);
				}}
			/>

			{/* Toast Container */}
			<ToastContainer
				position="top-right"
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={true}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>
		</div>
	);
};

export default APInvoicesPage;
