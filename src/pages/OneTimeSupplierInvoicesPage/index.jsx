import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/shared/PageHeader";
import { useOneTimeSupplierInvoices } from "./hooks/useOneTimeSupplierInvoices";
import { buildInvoiceTableColumns } from "../InvoicesShared/utils/buildTableColumns";
import { buildInvoiceTableData } from "../InvoicesShared/utils/buildTableData";
import InvoiceTable from "../InvoicesShared/components/InvoiceTable";
import InvoiceModal from "../InvoicesShared/components/InvoiceModal";
import OneTimeSupplierInvoiceDetailsModal from "./components/OneTimeSupplierInvoiceDetailsModal";
import InvoiceToolbarFilters from "../InvoicesShared/components/InvoiceToolbarFilters";
import { PAGE_CONFIG } from "./constants/pageConfig";

const OneTimeSupplierInvoicesPage = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	// Custom hook for invoice data and operations
	const {
		invoices,
		loading,
		error,
		deleteInvoice,
		submitForApproval,
		// Pagination
		count,
		page,
		pageSize,
		hasNext,
		hasPrevious,
		onPageChange,
		onPageSizeChange,
	} = useOneTimeSupplierInvoices();

	// Component state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedInvoice, setSelectedInvoice] = useState(null);
	const [actionType, setActionType] = useState(null); // 'delete'
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
		document.title = `${t("oneTimeSupplierInvoices.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	// Prepare table data and columns
	const tableData = buildInvoiceTableData(invoices, "ONE_TIME_SUPPLIER");
	const tableColumns = buildInvoiceTableColumns(t("oneTimeSupplierInvoices.table.supplier"), t);

	// Event handlers
	const handleSearch = query => {
		console.log("Search:", query);
		// TODO: Implement search
	};

	const handleFilter = filters => {
		console.log("Filter:", filters);
		// TODO: Implement filtering
	};

	const handleCreate = () => {
		navigate(PAGE_CONFIG.quickActionPath);
	};

	const handleDelete = row => {
		const invoice = row.rawData || row;
		setSelectedInvoice(invoice);
		setActionType("delete");
		setIsModalOpen(true);
	};

	const handleConfirmAction = async (action, invoice) => {
		const id = invoice?.invoice_id || invoice?.id;
		if (!id) return;

		try {
			if (action === "delete") {
				await deleteInvoice(id);
				toast.success(t("oneTimeSupplierInvoices.messages.deleteSuccess"));
			}
		} catch (err) {
			toast.error(err?.message || t("oneTimeSupplierInvoices.messages.actionFailed"));
		} finally {
			setIsModalOpen(false);
			setSelectedInvoice(null);
			setActionType(null);
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedInvoice(null);
		setActionType(null);
	};

	const handleView = row => {
		const invoice = row.rawData || row;
		const id = invoice.invoice_id || invoice.id;
		console.log("Viewing one-time supplier invoice:", { row, invoice, id });
		if (!id) return;
		setDetailInvoiceId(id);
		setIsDetailOpen(true);
	};

	const handleSubmitForApproval = async row => {
		const invoice = row.rawData || row;
		const id = invoice.invoice_id || invoice.id;
		if (!id) return;

		try {
			await submitForApproval(id);
			toast.success(t("oneTimeSupplierInvoices.messages.submitSuccess"));
		} catch (err) {
			toast.error(err?.message || err || t("oneTimeSupplierInvoices.messages.submitFailed"));
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Page Header */}
			<PageHeader
				icon={PAGE_CONFIG.icon}
				title={t("oneTimeSupplierInvoices.title")}
				subtitle={t("oneTimeSupplierInvoices.subtitle")}
			/>

			{/* Toolbar */}
			<div className="px-6 mt-6">
				<InvoiceToolbarFilters
					onSearch={handleSearch}
					onFilter={handleFilter}
					onCreateClick={handleCreate}
					createButtonText={t("oneTimeSupplierInvoices.toolbar.newInvoice")}
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
					onThreeWayMatch={null}
					onSubmitForApproval={handleSubmitForApproval}
					onPostToGL={null}
					emptyMessage={t("oneTimeSupplierInvoices.table.emptyMessage")}
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

			<OneTimeSupplierInvoiceDetailsModal
				isOpen={isDetailOpen}
				invoiceId={detailInvoiceId}
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

export default OneTimeSupplierInvoicesPage;
