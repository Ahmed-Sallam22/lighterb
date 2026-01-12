import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import ConfirmModal from "../components/shared/ConfirmModal";
import PaymentDetailsModal from "../components/shared/PaymentDetailsModal";
import SlideUpModal from "../components/shared/SlideUpModal";
import MakePaymentForm from "../components/forms/MakePaymentForm";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import Button from "../components/shared/Button";
import {
	fetchAPPayments,
	fetchAPPaymentDetails,
	deleteAPPayment,
	submitAPPaymentForApproval,
	postAPPaymentToGL,
	setPage,
	clearCurrentPayment,
} from "../store/apPaymentsSlice";
import { fetchSuppliers } from "../store/suppliersSlice";
import { fetchCurrencies } from "../store/currenciesSlice";
import LoadingSpan from "../components/shared/LoadingSpan";
import APPaymentIcon from "../assets/icons/APPaymentIcon";

const APPaymentsPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	// Get data from Redux
	const { payments, loading, count, page, hasNext, hasPrevious, currentPayment, detailsLoading } = useSelector(
		state => state.apPayments
	);
	const { suppliers } = useSelector(state => state.suppliers);
	const { currencies } = useSelector(state => state.currencies);

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [paymentToDelete, setPaymentToDelete] = useState(null);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [selectedPaymentId, setSelectedPaymentId] = useState(null);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [localPageSize, setLocalPageSize] = useState(20);

	// Filter states
	const [filters, setFilters] = useState({
		approval_status: "",
		business_partner_id: "",
		currency_id: "",
		date_from: "",
		date_to: "",
		has_allocations: "",
	});

	// Fetch suppliers and currencies on mount
	useEffect(() => {
		dispatch(fetchSuppliers());
		dispatch(fetchCurrencies());
	}, [dispatch]);

	// Fetch payments on mount and when pagination/filter changes
	useEffect(() => {
		const params = {
			page,
			page_size: localPageSize,
		};
		// Add filters to params
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== "" && value !== undefined && value !== null) {
				params[key] = value;
			}
		});
		dispatch(fetchAPPayments(params));
	}, [dispatch, page, localPageSize, filters]);

	// Update browser title
	useEffect(() => {
		document.title = `${t("payments.ap.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	// Pagination handlers
	const handlePageChange = useCallback(
		newPage => {
			dispatch(setPage(newPage));
		},
		[dispatch]
	);

	const handlePageSizeChange = useCallback(
		newPageSize => {
			setLocalPageSize(newPageSize);
			dispatch(setPage(1));
		},
		[dispatch]
	);

	// Table columns configuration
	const columns = [
		{
			header: t("payments.table.id"),
			accessor: "id",
			sortable: true,
			render: value => <span className="text-gray-600">#{value}</span>,
		},
		{
			header: t("payments.table.date"),
			accessor: "date",
			sortable: true,
			render: value => value || "-",
		},
		{
			header: t("payments.ap.supplier"),
			accessor: "business_partner_name",
			sortable: true,
			render: value => value || "-",
		},
		{
			header: t("payments.common.currency"),
			accessor: "currency_code",
			render: value => value || "-",
		},
		{
			header: t("payments.table.exchangeRate"),
			accessor: "exchange_rate",
			render: value => value || "-",
		},
		{
			header: t("payments.table.approvalStatus"),
			accessor: "approval_status",
			render: value => {
				const statusColors = {
					DRAFT: "bg-gray-100 text-gray-800",
					PENDING: "bg-yellow-100 text-yellow-800",
					APPROVED: "bg-green-100 text-green-800",
					REJECTED: "bg-red-100 text-red-800",
				};
				return (
					<span
						className={`px-3 py-1 rounded-full text-xs font-semibold ${
							statusColors[value] || "bg-gray-100 text-gray-800"
						}`}
					>
						{value || "DRAFT"}
					</span>
				);
			},
		},
		{
			header: t("payments.table.allocations"),
			accessor: "allocation_count",
			render: value => value ?? 0,
		},
		{
			header: t("payments.table.totalAllocated"),
			accessor: "total_allocated",
			render: value => <span className="font-semibold">${parseFloat(value || 0).toLocaleString()}</span>,
		},
		{
			header: t("payments.table.posted"),
			accessor: "gl_entry_posted",
			render: value => (
				<span className={`flex items-center justify-center ${value ? "text-green-600" : "text-gray-400"}`}>
					{value ? (
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clipRule="evenodd"
							/>
						</svg>
					) : (
						t("common.no")
					)}
				</span>
			),
		},
		{
			header: t("payments.table.createdAt"),
			accessor: "created_at",
			render: value => {
				if (!value) return "-";
				const date = new Date(value);
				return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
			},
		},
		{
			header: t("payments.table.glEntry"),
			accessor: "has_gl_entry",
			render: value => (
				<span className={`flex items-center gap-1 ${value ? "text-green-600" : "text-gray-400"}`}>
					{value ? (
						<>
							<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clipRule="evenodd"
								/>
							</svg>
							{t("common.yes")}
						</>
					) : (
						t("common.no")
					)}
				</span>
			),
		},
	];

	// Filter options
	const statusOptions = [
		{ value: "", label: t("payments.status.all") },
		{ value: "DRAFT", label: t("payments.status.draft") },
		{ value: "PENDING_APPROVAL", label: t("payments.status.pending") },
		{ value: "APPROVED", label: t("payments.status.approved") },
		{ value: "REJECTED", label: t("payments.status.rejected") },
	];

	const supplierOptions = [
		{ value: "", label: t("payments.filters.allSuppliers") },
		...suppliers.map(supplier => ({
			value: supplier.id,
			label: supplier.name || supplier.company_name || `Supplier #${supplier.id}`,
		})),
	];

	const currencyOptions = [
		{ value: "", label: t("payments.filters.allCurrencies") },
		...currencies.map(currency => ({
			value: currency.id,
			label: `${currency.code} - ${currency.name}`,
		})),
	];

	const hasAllocationsOptions = [
		{ value: "", label: t("payments.filters.selectAllocations") },
		{ value: "true", label: t("common.yes") },
		{ value: "false", label: t("common.no") },
	];

	// Filter handlers
	const handleFilterChange = e => {
		const { name, value } = e.target;
		setFilters(prev => ({ ...prev, [name]: value }));
		dispatch(setPage(1)); // Reset to first page when filter changes
	};

	const handleClearFilters = () => {
		setFilters({
			approval_status: "",
			business_partner_id: "",
			currency_id: "",
			date_from: "",
			date_to: "",
			has_allocations: "",
		});
		dispatch(setPage(1));
	};

	const handleCreate = () => {
		dispatch(clearCurrentPayment());
		setIsCreateModalOpen(true);
	};

	const handleCloseCreateModal = () => {
		setIsCreateModalOpen(false);
		dispatch(clearCurrentPayment());
	};

	const handlePaymentSuccess = () => {
		setIsCreateModalOpen(false);
		dispatch(clearCurrentPayment());
		// Refresh payments list
		dispatch(fetchAPPayments({ page, page_size: localPageSize }));
	};

	const handleView = payment => {
		setSelectedPaymentId(payment.id);
		setIsViewModalOpen(true);
	};

	const handleCloseViewModal = () => {
		setIsViewModalOpen(false);
		setSelectedPaymentId(null);
	};

	const handleEdit = async payment => {
		try {
			// Fetch full payment details from Redux action
			await dispatch(fetchAPPaymentDetails(payment.id)).unwrap();
			setIsCreateModalOpen(true);
		} catch (error) {
			toast.error(error || "Failed to load payment details");
		}
	};

	const handleDeleteClick = payment => {
		setPaymentToDelete(payment);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!paymentToDelete) return;

		try {
			await dispatch(deleteAPPayment(paymentToDelete.id)).unwrap();
			toast.success(t("payments.ap.deleteSuccess"));
			setIsDeleteModalOpen(false);
			setPaymentToDelete(null);
			// Refresh after delete
			dispatch(fetchAPPayments({ page, page_size: localPageSize }));
		} catch (error) {
			toast.error(error || t("payments.common.deleteError"));
		}
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
		setPaymentToDelete(null);
	};

	// Submit for approval handler
	const handleSubmitForApproval = async payment => {
		try {
			await dispatch(submitAPPaymentForApproval(payment.id)).unwrap();
			toast.success(t("payments.messages.submitSuccess"));
			// Refresh payments list
			dispatch(fetchAPPayments({ page, page_size: localPageSize }));
		} catch (error) {
			toast.error(error || t("payments.messages.submitError"));
		}
	};

	// Post to GL handler
	const handlePostToGL = async payment => {
		try {
			await dispatch(postAPPaymentToGL(payment.id)).unwrap();
			toast.success(t("payments.messages.postToGLSuccess"));
			// Refresh payments list
			dispatch(fetchAPPayments({ page, page_size: localPageSize }));
		} catch (error) {
			toast.error(error || t("payments.messages.postToGLError"));
		}
	};

	// Conditional show functions for edit/delete buttons
	// Show edit/delete when: DRAFT or (SUBMITTED/PENDING and not posted)
	const showEditButton = row => {
		if (row.approval_status === "APPROVED" && row.gl_entry_posted) return false;
		if (row.approval_status === "APPROVED") return false;
		return true;
	};

	const showDeleteButton = row => {
		if (row.approval_status === "APPROVED" && row.gl_entry_posted) return false;
		if (row.approval_status === "APPROVED") return false;
		return true;
	};

	// Custom actions for table
	const customActions = [
		{
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			),
			title: t("payments.actions.submitForApproval"),
			onClick: handleSubmitForApproval,
			showWhen: row => row.approval_status === "DRAFT" && !row.gl_entry_posted,
		},
		{
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
			),
			title: t("payments.actions.postToGL"),
			onClick: handlePostToGL,
			showWhen: row => row.approval_status === "APPROVED" && !row.gl_entry_posted,
		},
	];

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Page Header */}
			<PageHeader icon={<APPaymentIcon />} title={t("payments.ap.title")} subtitle={t("payments.ap.subtitle")} />

			{/* Action Bar with Create Button */}
			<div className="px-6 mt-6">
				<div className="flex justify-end">
					<Button variant="primary" onClick={handleCreate}>
						<span className="flex items-center gap-2">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
							{t("payments.ap.createPayment") || "Make Payment"}
						</span>
					</Button>
				</div>
			</div>

			{/* Filters Section */}
			<div className="px-6 mt-6">
				<div className="bg-white rounded-2xl shadow-lg p-6 border border-dashed border-gray-300">
					{/* Row 1: Date From, Date To, Business Partner, Approval Status */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
						<FloatingLabelInput
							label={t("payments.filters.dateFrom")}
							type="date"
							name="date_from"
							value={filters.date_from}
							onChange={handleFilterChange}
						/>
						<FloatingLabelInput
							label={t("payments.filters.dateTo")}
							type="date"
							name="date_to"
							value={filters.date_to}
							onChange={handleFilterChange}
						/>
						<FloatingLabelSelect
							label={t("payments.filters.businessPartner")}
							name="business_partner_id"
							value={filters.business_partner_id}
							onChange={handleFilterChange}
							options={supplierOptions}
						/>
						<FloatingLabelSelect
							label={t("payments.filters.status")}
							name="approval_status"
							value={filters.approval_status}
							onChange={handleFilterChange}
							options={statusOptions}
							searchable={false}
						/>
					</div>
					{/* Row 2: Currency, Has Allocations, buttons */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
						<FloatingLabelSelect
							label={t("payments.filters.currency")}
							name="currency_id"
							value={filters.currency_id}
							onChange={handleFilterChange}
							options={currencyOptions}
						/>
						<FloatingLabelSelect
							label={t("payments.filters.hasAllocations")}
							name="has_allocations"
							value={filters.has_allocations}
							onChange={handleFilterChange}
							options={hasAllocationsOptions}
							searchable={false}
						/>
						{/* Empty spacer */}
						<div className="hidden lg:block"></div>
						{/* Buttons */}
						<div className="flex gap-3 justify-end">
							<Button variant="outline" onClick={handleClearFilters}>
								{t("payments.filters.reset")}
							</Button>
							<Button variant="primary" onClick={() => dispatch(setPage(1))}>
								{t("payments.filters.applyFilters")}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="px-6 mt-6 pb-6">
				{loading ? (
					<LoadingSpan />
				) : (
					<>
						<Table
							columns={columns}
							data={payments}
							onView={handleView}
							onEdit={handleEdit}
							onDelete={handleDeleteClick}
							customActions={customActions}
							showEditButton={showEditButton}
							showDeleteButton={showDeleteButton}
							emptyMessage={t("payments.ap.emptyMessage")}
						/>

						{/* Pagination */}
						<Pagination
							currentPage={page}
							totalCount={count}
							pageSize={localPageSize}
							hasNext={hasNext}
							hasPrevious={hasPrevious}
							onPageChange={handlePageChange}
							onPageSizeChange={handlePageSizeChange}
						/>
					</>
				)}
			</div>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title={t("payments.modals.deleteTitle")}
				message={t("payments.modals.deleteMessage", {
					reference: paymentToDelete?.reference || (isRtl ? "هذه الدفعة" : "this payment"),
				})}
				confirmText={t("payments.modals.delete")}
				cancelText={t("payments.modals.cancel")}
			/>

			{/* Payment Details Modal */}
			<PaymentDetailsModal
				isOpen={isViewModalOpen}
				paymentId={selectedPaymentId}
				type="AP"
				onClose={handleCloseViewModal}
			/>

			{/* Create/Edit Payment Modal */}
			<SlideUpModal
				isOpen={isCreateModalOpen}
				onClose={handleCloseCreateModal}
				title={
					currentPayment
						? t("payments.ap.editPayment") || "Edit Payment"
						: t("payments.ap.createPayment") || "Make Payment"
				}
				maxWidth="900px"
			>
				<MakePaymentForm
					onCancel={handleCloseCreateModal}
					onSuccess={handlePaymentSuccess}
					editPaymentData={currentPayment}
				/>
			</SlideUpModal>

			{/* Toast Container */}
			<ToastContainer
				position={isRtl ? "top-left" : "top-right"}
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				rtl={isRtl}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>
		</div>
	);
};

export default APPaymentsPage;
