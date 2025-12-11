import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/shared/PageHeader";
import { useARInvoices } from "./hooks/useARInvoices";
import { buildInvoiceTableColumns } from "../InvoicesShared/utils/buildTableColumns";
import { buildInvoiceTableData } from "../InvoicesShared/utils/buildTableData";
import InvoiceTable from "../InvoicesShared/components/InvoiceTable";
import InvoiceModal from "../InvoicesShared/components/InvoiceModal";
import InvoiceDetailsModal from "../InvoicesShared/components/InvoiceDetailsModal";
import InvoiceToolbarFilters from "../InvoicesShared/components/InvoiceToolbarFilters";
import { PAGE_CONFIG } from "./constants/pageConfig";
import { useInvoiceHandlers } from "../InvoicesShared/handlers/useInvoiceHandlers";

const ARInvoicesPage = () => {
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
	} = useARInvoices();

	// Component state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedInvoice, setSelectedInvoice] = useState(null);
	const [actionType, setActionType] = useState(null); // 'delete', 'reverse', 'post'
	const [isDetailOpen, setIsDetailOpen] = useState(false);
	const [detailInvoiceId, setDetailInvoiceId] = useState(null);

	// Show error toast when error occurs
	useEffect(() => {
		if (error) {
			toast.error(error, { autoClose: 5000 });
		}
	}, [error]);

	// Update browser title
	useEffect(() => {
		document.title = `${t("arInvoices.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	// Prepare table data and columns
	const tableData = buildInvoiceTableData(invoices, "AR");
	const tableColumns = buildInvoiceTableColumns(t("arInvoices.table.customer"), t);

	// Event handlers
	const {
		handleSearch,
		handleFilter,
		handleCreate,
		handleEdit,
		handleDelete,
		handleSubmitForApproval,
		handlePostToGL,
		handleConfirmAction,
		handleCloseModal,
	} = useInvoiceHandlers({
		navigate,
		quickActionPath: PAGE_CONFIG.quickActionPath,
		setSelectedInvoice,
		setActionType,
		setIsModalOpen,
		submitForApproval,
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
			<PageHeader icon={PAGE_CONFIG.icon} title={t("arInvoices.title")} subtitle={t("arInvoices.subtitle")} />

			{/* Toolbar */}
			<div className="px-6 mt-6">
				<InvoiceToolbarFilters
					onSearch={handleSearch}
					onFilter={handleFilter}
					onCreateClick={handleCreate}
					createButtonText={t("arInvoices.toolbar.newInvoice")}
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
					onSubmitForApproval={handleSubmitForApproval}
					onPostToGL={handlePostToGL}
					emptyMessage={t("arInvoices.table.emptyMessage")}
					showActionsCondition={row => {
						const approvalStatus = row.rawData?.approval_status;
						return approvalStatus !== "APPROVED";
					}}
					showDeleteCondition={row => {
						const approvalStatus = row.rawData?.approval_status;
						return approvalStatus !== "APPROVED";
					}}
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
				type="AR"
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

export default ARInvoicesPage;
