import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageHeader from "../../components/shared/PageHeader";
import APInvoiceIcon from "../../ui/icons/APInvoiceIcon";
import { useAPInvoices } from "./hooks/useAPInvoices";
import { buildTableColumns } from "./utils/buildTableColumns";
import { buildTableData } from "./utils/buildTableData";
import InvoiceTable from "./components/InvoiceTable";
import InvoiceModal from "./components/InvoiceModal";
import ToolbarFilters from "./components/ToolbarFilters";
import { PAGE_CONFIG } from "./constants/pageConfig";
import { useInvoiceHandlers } from "./handlers/useInvoiceHandlers";

const APInvoicesPage = () => {
	const navigate = useNavigate();

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
	} = useAPInvoices();

	// Component state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedInvoice, setSelectedInvoice] = useState(null);
	const [actionType, setActionType] = useState(null); // 'delete', 'reverse', 'post'

	// Page configuration

	// Show error toast when error occurs
	useEffect(() => {
		if (error) {
			toast.error(error, { autoClose: 5000 });
		}
	}, [error]);

	// Update browser title
	useEffect(() => {
		document.title = `${PAGE_CONFIG.title} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, []);

	// Prepare table data and columns
	const tableData = buildTableData(invoices);
	const tableColumns = buildTableColumns();

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

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Page Header */}
			<PageHeader icon={PAGE_CONFIG.icon} title={PAGE_CONFIG.title} subtitle={PAGE_CONFIG.subtitle} />

			{/* Toolbar */}
			<div className="px-6 mt-6">
				<ToolbarFilters onSearch={handleSearch} onFilter={handleFilter} onCreateClick={handleCreate} />
			</div>

			{/* Table */}
			<div className="px-6 mt-6 pb-6">
				<InvoiceTable
					columns={tableColumns}
					data={tableData}
					loading={loading}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onThreeWayMatch={handleThreeWayMatch}
					onSubmitForApproval={handleSubmitForApproval}
					onPostToGL={handlePostToGL}
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
