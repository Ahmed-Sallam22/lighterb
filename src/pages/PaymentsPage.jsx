import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/shared/PageHeader";
import Toolbar from "../components/shared/Toolbar";
import Table from "../components/shared/Table";
import ConfirmModal from "../components/shared/ConfirmModal";
import { fetchARPayments, deleteARPayment } from "../store/arPaymentsSlice";
import { fetchAPPayments, deleteAPPayment } from "../store/apPaymentsSlice";
import LoadingSpan from "../components/shared/LoadingSpan";
import ARPaymentIcon from "../assets/icons/ARPaymentIcon";
import APPaymentIcon from "../assets/icons/APPaymentIcon";

const PaymentsPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const { type } = useParams(); // 'ar' or 'ap'
	const navigate = useNavigate();
	const dispatch = useDispatch();

	// Determine content based on type
	const isAR = type?.toLowerCase() === "ar";

	// Get data from Redux based on type
	const { payments: arPayments, loading: arLoading } = useSelector(state => state.arPayments);
	const { payments: apPayments, loading: apLoading } = useSelector(state => state.apPayments);

	const payments = isAR ? arPayments : apPayments;
	const loading = isAR ? arLoading : apLoading;

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [paymentToDelete, setPaymentToDelete] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("");

	// Localized Text
	const title = t(isAR ? "payments.ar.title" : "payments.ap.title");
	const subtitle = t(isAR ? "payments.ar.subtitle" : "payments.ap.subtitle");
	const icon = isAR ? <ARPaymentIcon /> : <APPaymentIcon />;
	const buttonText = t("payments.common.newPayment");
	const quickActionPath = isAR ? "/quick-actions/receive-payment" : "/quick-actions/make-payment";

	// Fetch payments on mount
	useEffect(() => {
		if (isAR) {
			dispatch(fetchARPayments());
		} else {
			dispatch(fetchAPPayments());
		}
	}, [dispatch, isAR]);

	// Update browser title
	useEffect(() => {
		document.title = `${title} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [title]);

	// Filter and search payments
	const filteredPayments = payments.filter(payment => {
		const matchesSearch =
			payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			payment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			payment.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			payment.memo?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesStatus = !filterStatus || payment.status?.toLowerCase() === filterStatus.toLowerCase();

		return matchesSearch && matchesStatus;
	});

	// Table columns configuration
	const columns = [
		{
			header: t("payments.common.paymentDate"),
			accessor: "date",
			sortable: true,
			render: value => value || "-",
		},
		{
			header: t(isAR ? "payments.ar.customer" : "payments.ap.supplier"),
			accessor: isAR ? "customer_name" : "supplier_name",
			sortable: true,
			render: value => value || "-",
		},
		{
			header: t("payments.common.reference"),
			accessor: "reference",
			sortable: true,
			render: value => value || "-",
		},
		{
			header: t("payments.common.amount"),
			accessor: isAR ? "total_amount" : "amount",
			sortable: true,
			render: value => <span className="font-semibold">{parseFloat(value || 0).toFixed(2)}</span>,
		},
		{
			header: t("payments.common.currency"),
			accessor: "currency_code",
			render: value => value || "-",
		},
		{
			header: t("payments.common.paymentMethod"),
			accessor: "payment_method",
			render: value => {
				if (!value) return "-";
				// You might want to add specific translations for payment methods in the JSON
				return value.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
			},
		},
		{
			header: t("payments.common.status"),
			accessor: "status",
			render: value => {
				const statusColors = {
					COMPLETED: "bg-green-100 text-green-800",
					PENDING: "bg-yellow-100 text-yellow-800",
					FAILED: "bg-red-100 text-red-800",
					CANCELLED: "bg-gray-100 text-gray-800",
				};
				return (
					<span
						className={`px-3 py-1 rounded-full text-xs font-semibold ${
							statusColors[value] || "bg-gray-100 text-gray-800"
						}`}
					>
						{/* Translate status, fallback to uppercase English */}
						{t(`payments.status.${value?.toLowerCase()}`, value || "PENDING")}
					</span>
				);
			},
		},
	];

	// Filter options for toolbar
	const filterOptions = [
		{ value: "", label: t("payments.status.all") },
		{ value: "completed", label: t("payments.status.completed") },
		{ value: "pending", label: t("payments.status.pending") },
		{ value: "failed", label: t("payments.status.failed") },
		{ value: "cancelled", label: t("payments.status.cancelled") },
	];

	// Handlers
	const handleSearch = searchValue => {
		setSearchTerm(searchValue);
	};

	const handleFilter = filterValue => {
		setFilterStatus(filterValue);
	};

	const handleCreate = () => {
		navigate(quickActionPath);
	};

	const handleEdit = payment => {
		// Navigate to edit form with payment ID
		navigate(quickActionPath, { state: { paymentId: payment.id, payment } });
	};

	const handleDeleteClick = payment => {
		setPaymentToDelete(payment);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!paymentToDelete) return;

		try {
			if (isAR) {
				await dispatch(deleteARPayment(paymentToDelete.id)).unwrap();
				toast.success(t("payments.ar.deleteSuccess"));
			} else {
				await dispatch(deleteAPPayment(paymentToDelete.id)).unwrap();
				toast.success(t("payments.ap.deleteSuccess"));
			}
			setIsDeleteModalOpen(false);
			setPaymentToDelete(null);
		} catch (error) {
			toast.error(error || t("payments.common.deleteError"));
		}
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
		setPaymentToDelete(null);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Page Header */}
			<PageHeader icon={icon} title={title} subtitle={subtitle} />

			{/* Toolbar */}
			<div className="px-6 mt-6">
				<Toolbar
					searchPlaceholder={t("payments.common.searchPlaceholder")}
					onSearchChange={handleSearch}
					filterOptions={filterOptions}
					filterLabel={t("payments.common.filterStatus")}
					onFilterChange={handleFilter}
					createButtonText={buttonText}
					onCreateClick={handleCreate}
				/>
			</div>

			{/* Table */}
			<div className="px-6 mt-6 pb-6">
				{loading ? (
					<LoadingSpan />
				) : (
					<Table
						columns={columns}
						data={filteredPayments}
						onEdit={handleEdit}
						onDelete={handleDeleteClick}
						emptyMessage={t(isAR ? "payments.ar.emptyMessage" : "payments.ap.emptyMessage")}
					/>
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
		</div>
	);
};

export default PaymentsPage;
