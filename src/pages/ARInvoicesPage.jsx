import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import PageHeader from "../components/shared/PageHeader";
import Toolbar from "../components/shared/Toolbar";
import Table from "../components/shared/Table";
import ConfirmModal from "../components/shared/ConfirmModal";
import {
	fetchARInvoices,
	deleteARInvoice,
	submitARInvoiceForApproval,
	reverseARInvoice,
	postARInvoiceToGL,
} from "../store/arInvoicesSlice";

const ARInvoiceIcon = () => (
	<svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g opacity="0.5">
			<path
				d="M0.02 11.24C0.02 8.24 0.02 5.31999 0.02 2.35999C0.02 0.719994 0.61 -0.0600522 2.33 -5.2179e-05C4.95 0.0999478 7.7 -1.3113e-05 10.14 0.289987C11.5808 0.438995 12.9961 0.77516 14.35 1.28999C15.8111 0.836921 17.3108 0.518908 18.83 0.339975C21.46 0.0899747 24.48 0.0399869 27.35 0.0399869C28.44 0.0399869 28.96 0.659967 28.96 1.76997C28.96 8.08997 28.96 14.4233 28.96 20.77C28.96 22.37 28.02 22.65 26.72 22.64C24.18 22.64 21.63 22.64 19.09 22.64C17.46 22.64 16.15 23.1 15.98 25.03C15.9 25.97 15.44 26.62 14.44 26.59C14.2531 26.5863 14.0688 26.5449 13.8983 26.4683C13.7277 26.3917 13.5744 26.2815 13.4474 26.1442C13.3204 26.007 13.2224 25.8455 13.1593 25.6695C13.0962 25.4935 13.0692 25.3066 13.08 25.1199C12.93 23.0399 11.52 22.64 9.81 22.64C7.34 22.64 4.88 22.59 2.42 22.64C0.78 22.64 0.01 22.12 0.06 20.36C0.15 17.36 0.06 14.2799 0.06 11.2499L0.02 11.24ZM26.35 11.46V8.99C26.35 2.24 26.35 2.23995 19.57 2.87995C19.3246 2.88957 19.0804 2.9197 18.84 2.96998C17.32 3.42998 16.07 4.34998 16.03 5.96998C15.91 10.33 15.98 14.69 16.03 19.04C16.03 19.6 15.95 20.29 16.89 20.04C19.57 19.42 22.29 19.8199 24.99 19.7499C26.05 19.7499 26.43 19.38 26.41 18.32C26.31 16.06 26.35 13.76 26.35 11.46ZM2.68 11.26C2.68 13.48 2.78 15.71 2.68 17.92C2.58 19.52 3.22 19.82 4.68 19.82C7.13 19.82 9.61 19.4799 12.04 20.0599C13.34 20.3699 13.1 19.45 13.1 18.77C13.1 14.66 13.16 10.55 13.1 6.43995C13.1189 5.98491 13.0454 5.53076 12.8839 5.10493C12.7224 4.67909 12.4763 4.29041 12.1604 3.96235C11.8445 3.63429 11.4654 3.37368 11.0459 3.19624C10.6265 3.01879 10.1754 2.92826 9.72 2.93C8 2.77 6.27 2.92996 4.55 2.82996C3.18 2.73996 2.65 3.17999 2.72 4.60999C2.76 6.81999 2.69 9.03996 2.69 11.26H2.68Z"
				fill="#D3D3D3"
			/>
		</g>
	</svg>
);

const ARInvoicesPage = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { invoices, loading, error } = useSelector(state => state.arInvoices);

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedInvoice, setSelectedInvoice] = useState(null);
	const [actionType, setActionType] = useState(null); // 'delete', 'submit', 'reverse', 'post'

	const title = "AR Invoices";
	const subtitle = "Accounts Receivable Invoices - Customer Invoices";
	const icon = <ARInvoiceIcon />;
	const buttonText = "New AR Invoice";
	const quickActionPath = "/quick-actions/create-ar-invoice";

	// Fetch invoices on mount
	useEffect(() => {
		dispatch(fetchARInvoices());
	}, [dispatch]);

	// Update browser title
	useEffect(() => {
		document.title = `${title} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [title]);

	// Display error toast
	useEffect(() => {
		if (error) {
			toast.error(error, { autoClose: 5000 });
		}
	}, [error]);

	// Transform API data for table display
	const sampleData = invoices.map(invoice => ({
		id: invoice.id,
		invoice: invoice.invoice_number || invoice.number || "-",
		customer: invoice.customer_name || "-",
		date: invoice.date || "-",
		dueDate: invoice.due_date || "-",
		currency: invoice.currency_code || "-",
		total: invoice.total || "-",
		rate: invoice.exchange_rate || "-",
		baseTotal: invoice.base_currency_total || "-",
		balance: invoice.balance || "-",
		postingStatus: invoice.is_posted ? "Posted" : "Draft",
		paymentStatus:
			invoice.payment_status === "PAID"
				? "Paid"
				: invoice.payment_status === "PARTIALLY_PAID"
				? "Partial"
				: "Unpaid",
		approvalStatus:
			invoice.approval_status === "APPROVED"
				? "Approved"
				: invoice.approval_status === "PENDING"
				? "Pending"
				: invoice.approval_status === "REJECTED"
				? "Rejected"
				: "Draft",
		rawData: invoice,
	}));

	// Table columns configuration
	const columns = [
		{
			header: "Invoice",
			accessor: "invoice",
			render: value => <span className="font-semibold text-blue-600">{value}</span>,
		},
		{
			header: "Customer",
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
			render: value => {
				const statusColors = {
					Posted: "bg-green-100 text-green-800",
					Draft: "bg-gray-100 text-gray-800",
				};
				return (
					<span
						className={`px-3 py-1 rounded-full text-xs font-semibold ${
							statusColors[value] || "bg-gray-100 text-gray-800"
						}`}
					>
						{value}
					</span>
				);
			},
		},
		{
			header: "Payment Status",
			accessor: "paymentStatus",
			//   width: '150px',
			render: value => {
				const statusColors = {
					Paid: "bg-green-100 text-green-800",
					Unpaid: "bg-red-100 text-red-800",
					Partial: "bg-yellow-100 text-yellow-800",
				};
				return (
					<span
						className={`px-3 py-1 rounded-full text-xs font-semibold ${
							statusColors[value] || "bg-gray-100 text-gray-800"
						}`}
					>
						{value}
					</span>
				);
			},
		},
		{
			header: "Approval Status",
			accessor: "approvalStatus",
			render: value => {
				const statusColors = {
					Approved: "bg-green-100 text-green-800",
					Pending: "bg-yellow-100 text-yellow-800",
					Rejected: "bg-red-100 text-red-800",
				};
				return (
					<span
						className={`px-3 py-1 rounded-full text-xs font-semibold ${
							statusColors[value] || "bg-gray-100 text-gray-800"
						}`}
					>
						{value}
					</span>
				);
			},
		},
	];

	// Filter options for toolbar
	const filterOptions = [
		{ value: "", label: "All Status" },
		{ value: "paid", label: "Paid" },
		{ value: "unpaid", label: "Unpaid" },
		{ value: "partial", label: "Partial" },
	];

	// Handlers
	const handleSearch = searchValue => {
		console.log("Search:", searchValue);
		// Implement search logic here
	};

	const handleFilter = filterValue => {
		console.log("Filter:", filterValue);
		// Implement filter logic here
	};

	const handleCreate = () => {
		navigate(quickActionPath);
	};

	const handleEdit = row => {
		const invoice = row.rawData || row;
		navigate(quickActionPath, { state: { invoice, mode: "edit" } });
	};

	const handleDelete = row => {
		const invoice = row.rawData || row;
		setSelectedInvoice(invoice);

		// If invoice is posted, use reverse action instead of delete
		if (invoice.is_posted) {
			setActionType("reverse");
		} else {
			setActionType("delete");
		}

		setIsDeleteModalOpen(true);
	};

	const handleSubmitForApproval = async row => {
		const invoice = row.rawData || row;
		try {
			await dispatch(submitARInvoiceForApproval(invoice.id)).unwrap();
			toast.success("Invoice submitted for approval successfully");
			dispatch(fetchARInvoices());
		} catch (error) {
			console.error("Failed to submit invoice for approval:", error);
		}
	};

	const handlePostToGL = async row => {
		const invoice = row.rawData || row;
		setSelectedInvoice(invoice);
		setActionType("post");
		setIsDeleteModalOpen(true);
	};

	const handleConfirmAction = async () => {
		try {
			if (actionType === "delete") {
				await dispatch(deleteARInvoice(selectedInvoice.id)).unwrap();
				toast.success("Invoice deleted successfully");
			} else if (actionType === "reverse") {
				await dispatch(reverseARInvoice(selectedInvoice.id)).unwrap();
				toast.success("Invoice reversed successfully");
			} else if (actionType === "post") {
				await dispatch(postARInvoiceToGL(selectedInvoice.id)).unwrap();
				toast.success("Invoice posted to GL successfully");
			}

			setIsDeleteModalOpen(false);
			setSelectedInvoice(null);
			setActionType(null);
			dispatch(fetchARInvoices());
		} catch (error) {
			console.error(`Failed to ${actionType} invoice:`, error);
		}
	};

	const getModalConfig = () => {
		switch (actionType) {
			case "delete":
				return {
					title: "Delete Invoice",
					message: `Are you sure you want to delete invoice ${selectedInvoice?.invoice_number}? This action cannot be undone.`,
					confirmText: "Delete",
				};
			case "reverse":
				return {
					title: "Reverse Invoice",
					message: `Are you sure you want to reverse invoice ${selectedInvoice?.invoice_number}? This will create a reversal entry.`,
					confirmText: "Reverse",
				};
			case "post":
				return {
					title: "Post Invoice to GL",
					message: `Are you sure you want to post invoice ${selectedInvoice?.invoice_number} to the General Ledger?`,
					confirmText: "Post",
				};
			default:
				return {
					title: "Confirm Action",
					message: "Are you sure you want to proceed?",
					confirmText: "Confirm",
				};
		}
	};

	const modalConfig = getModalConfig();

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Page Header */}
			<PageHeader icon={icon} title={title} subtitle={subtitle} />

			{/* Toolbar */}
			<div className="px-6 mt-6">
				<Toolbar
					searchPlaceholder="Search invoices..."
					onSearchChange={handleSearch}
					filterOptions={filterOptions}
					filterLabel="Filter by Payment Status"
					onFilterChange={handleFilter}
					createButtonText={buttonText}
					onCreateClick={handleCreate}
				/>
			</div>

			{/* Table */}
			<div className="px-6 mt-6 pb-6">
				{loading ? (
					<div className="flex justify-center items-center py-12">
						<div className="text-gray-500">Loading invoices...</div>
					</div>
				) : (
					<Table
						columns={columns}
						data={sampleData}
						onEdit={handleEdit}
						onDelete={handleDelete}
						emptyMessage="No AR invoices found"
						showActions={row => {
							// Show edit/delete actions only if approval status is NOT approved
							const approvalStatus = row.rawData?.approval_status;
							return approvalStatus !== "APPROVED";
						}}
						showDeleteButton={row => {
							// Can delete if approval status is NOT approved
							const approvalStatus = row.rawData?.approval_status;
							return approvalStatus !== "APPROVED";
						}}
						actions={[
							{
								label: "Submit for Approval",
								onClick: handleSubmitForApproval,
								condition: row => row.rawData?.approval_status === "DRAFT" && !row.rawData?.is_posted,
							},
							{
								label: "Post to GL",
								onClick: handlePostToGL,
								condition: row =>
									row.rawData?.approval_status === "APPROVED" && !row.rawData?.is_posted,
							},
						]}
					/>
				)}
			</div>

			{/* Confirmation Modal */}
			{isDeleteModalOpen && selectedInvoice && (
				<ConfirmModal
					isOpen={isDeleteModalOpen}
					onClose={() => {
						setIsDeleteModalOpen(false);
						setSelectedInvoice(null);
						setActionType(null);
					}}
					onConfirm={handleConfirmAction}
					title={modalConfig.title}
					message={modalConfig.message}
					confirmText={modalConfig.confirmText}
				/>
			)}

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
