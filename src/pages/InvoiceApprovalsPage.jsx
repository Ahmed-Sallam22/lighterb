import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import SlideUpModal from "../components/shared/SlideUpModal";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import ConfirmModal from "../components/shared/ConfirmModal";
import {
	fetchInvoiceApprovals,
	createInvoiceApproval,
	updateInvoiceApproval,
	deleteInvoiceApproval,
	approveInvoice,
	rejectInvoice,
} from "../store/invoiceApprovalsSlice";
import { fetchARInvoices } from "../store/arInvoicesSlice";
import { fetchAPInvoices } from "../store/apInvoicesSlice";
import StatisticsCard from "../components/shared/StatisticsCard";
import InvoiceApprovalsHeaderIcon from "../assets/icons/InvoiceApprovalsHeaderIcon";
import Button from "../components/shared/Button";
import { BiPlus } from "react-icons/bi";
import SearchInput from "../components/shared/SearchInput";
import Tabs from "../components/shared/Tabs";
import InvoiceIcon from "../assets/icons/InvoiceIcon";
import { IoIosCheckmarkCircleOutline, IoMdCloseCircleOutline } from "react-icons/io";
import { MdAccessTime } from "react-icons/md";
import InvoiceApprovalForm from "../components/forms/InvoiceApprovalForm";

const InvoiceApprovalsPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	const { approvals, loading } = useSelector(state => state.invoiceApprovals);
	const { invoices: arInvoices } = useSelector(state => state.arInvoices);
	const { invoices: apInvoices } = useSelector(state => state.apInvoices);

	const [activeTab, setActiveTab] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedType, setSelectedType] = useState("all");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
	const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
	const [editingApproval, setEditingApproval] = useState(null);
	const [deleteId, setDeleteId] = useState(null);
	const [actionId, setActionId] = useState(null);
	const [formData, setFormData] = useState({
		invoice_type: "",
		invoice_id: "",
		submitted_by: "",
	});
	const [actionComments, setActionComments] = useState("");
	const [availableInvoices, setAvailableInvoices] = useState([]);

	useEffect(() => {
		dispatch(fetchInvoiceApprovals());
		dispatch(fetchARInvoices());
		dispatch(fetchAPInvoices());
	}, [dispatch]);

	// Update available invoices when invoice type changes
	useEffect(() => {
		if (formData.invoice_type === "AR") {
			setAvailableInvoices(arInvoices || []);
		} else if (formData.invoice_type === "AP") {
			setAvailableInvoices(apInvoices || []);
		} else {
			setAvailableInvoices([]);
		}
		// Reset invoice_id when invoice type changes
		setFormData(prev => ({ ...prev, invoice_id: "" }));
	}, [formData.invoice_type, arInvoices, apInvoices]);

	const handleCreate = () => {
		setEditingApproval(null);
		setFormData({
			invoice_type: "",
			invoice_id: "",
			submitted_by: "",
		});
		setIsModalOpen(true);
	};

	const handleEdit = approval => {
		setEditingApproval(approval);
		setFormData({
			invoice_type: approval.invoice_type,
			invoice_id: approval.invoice_id.toString(),
			submitted_by: approval.submitted_by,
		});
		setIsModalOpen(true);
	};

	const handleDelete = id => {
		setDeleteId(id?.id);
		setIsDeleteModalOpen(true);
	};

	const confirmDelete = async () => {
		try {
			await dispatch(deleteInvoiceApproval(deleteId)).unwrap();
			toast.success(t("invoiceApprovals.messages.deleteSuccess"));
			setIsDeleteModalOpen(false);
			setDeleteId(null);
		} catch (error) {
			toast.error(error || t("invoiceApprovals.messages.deleteError"));
		}
	};

	const handleApprove = id => {
		setActionId(id);
		setActionComments("");
		setIsApproveModalOpen(true);
	};

	const handleReject = id => {
		setActionId(id);
		setActionComments("");
		setIsRejectModalOpen(true);
	};

	const confirmApprove = async () => {
		try {
			await dispatch(
				approveInvoice({
					id: actionId,
					approvalData: {
						approver: "Current User", // Replace with actual user
						comments: actionComments,
					},
				})
			).unwrap();
			toast.success(t("invoiceApprovals.messages.approveSuccess"));
			setIsApproveModalOpen(false);
			setActionId(null);
			setActionComments("");
		} catch (error) {
			toast.error(error || t("invoiceApprovals.messages.approveError"));
		}
	};

	const confirmReject = async () => {
		try {
			await dispatch(
				rejectInvoice({
					id: actionId,
					approvalData: {
						approver: "Current User", // Replace with actual user
						comments: actionComments,
					},
				})
			).unwrap();
			toast.success(t("invoiceApprovals.messages.rejectSuccess"));
			setIsRejectModalOpen(false);
			setActionId(null);
			setActionComments("");
		} catch (error) {
			toast.error(error || t("invoiceApprovals.messages.rejectError"));
		}
	};

	const handleSubmit = async () => {
		// Validation
		if (!formData.invoice_type || !formData.invoice_id || !formData.submitted_by) {
			toast.error(t("invoiceApprovals.messages.fillRequired"));
			return;
		}

		const approvalData = {
			invoice_type: formData.invoice_type,
			invoice_id: parseInt(formData.invoice_id),
			submitted_by: formData.submitted_by,
		};

		try {
			if (editingApproval) {
				await dispatch(
					updateInvoiceApproval({
						id: editingApproval.id,
						approvalData,
					})
				).unwrap();
				toast.success(t("invoiceApprovals.messages.updateSuccess"));
			} else {
				await dispatch(createInvoiceApproval(approvalData)).unwrap();
				toast.success(t("invoiceApprovals.messages.createSuccess"));
			}
			setIsModalOpen(false);
			setFormData({
				invoice_type: "",
				invoice_id: "",
				submitted_by: "",
			});
		} catch (error) {
			toast.error(error || t("invoiceApprovals.messages.saveError"));
		}
	};

	const handleChange = (field, value) => {
		setFormData(prev => ({
			...prev,
			[field]: value,
		}));
	};

	const mappedApprovals = approvals.map(approval => ({
		id: approval.id,
		type:
			approval.invoice_type === "AP"
				? t("invoiceApprovals.actions.apInvoice")
				: t("invoiceApprovals.actions.arInvoice"),
		invoiceNumber: `INV-${approval.invoice_id}`,
		submittedBy: approval.submitted_by,
		approver: approval.approver || t("invoiceApprovals.form.na"),
		// Keep internal status for logic, translate in render
		status:
			approval.status === "PENDING_APPROVAL"
				? "Pending"
				: approval.status === "APPROVED"
				? "Approved"
				: "Rejected",
		submittedDate: new Date(approval.submitted_at).toLocaleDateString(),
		rawStatus: approval.status,
		rawType: approval.invoice_type === "AP" ? "AP Invoice" : "AR Invoice", // Used for filtering
	}));

	// Use real data if available, otherwise use sample data
	const displayApprovals = approvals.length > 0 ? mappedApprovals : [];

	// Calculate counts for tabs
	const getCounts = () => {
		return {
			all: displayApprovals.length,
			approved: displayApprovals.filter(a => a.status === "Approved").length,
			pending: displayApprovals.filter(a => a.status === "Pending").length,
			rejected: displayApprovals.filter(a => a.status === "Rejected").length,
		};
	};

	const counts = getCounts();

	// Statistics cards data
	const statsCards = [
		{
			title: t("invoiceApprovals.stats.totals"),
			count: counts.all,
			icon: <InvoiceIcon />,
		},
		{
			title: t("invoiceApprovals.stats.approved"),
			count: counts.approved,
			icon: <IoIosCheckmarkCircleOutline color="green" size={35} />,
		},
		{
			title: t("invoiceApprovals.stats.pending"),
			count: counts.pending,
			icon: <MdAccessTime color="#FFC043" size={35} />,
		},
		{
			title: t("invoiceApprovals.stats.rejected"),
			count: counts.rejected,
			icon: <IoMdCloseCircleOutline color="red" size={35} />,
		},
	];

	// Table columns
	const columns = [
		{
			header: t("invoiceApprovals.table.type"),
			accessor: "type",
			width: "140px",
			render: value => <span className="font-semibold text-gray-900">{value}</span>,
		},
		{
			header: t("invoiceApprovals.table.invoiceNumber"),
			accessor: "invoiceNumber",
			width: "150px",
			render: value => <span className="font-semibold text-[#28819C]">{value}</span>,
		},
		{
			header: t("invoiceApprovals.table.submittedBy"),
			accessor: "submittedBy",
			render: value => <span className="text-gray-900">{value}</span>,
		},
		{
			header: t("invoiceApprovals.table.approver"),
			accessor: "approver",
			render: value => <span className="text-gray-900">{value}</span>,
		},
		{
			header: t("invoiceApprovals.table.status"),
			accessor: "status",
			width: "120px",
			render: value => (
				<span
					className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
						value === "Approved"
							? "bg-green-100 text-green-800"
							: value === "Pending"
							? "bg-yellow-100 text-yellow-800"
							: value === "Rejected"
							? "bg-red-100 text-red-800"
							: "bg-gray-100 text-gray-800"
					}`}
				>
					{t(`invoiceApprovals.table.statusValues.${value.toLowerCase()}`)}
				</span>
			),
		},
		{
			header: t("invoiceApprovals.table.submittedDate"),
			accessor: "submittedDate",
			width: "150px",
			render: value => <span className="text-gray-700">{value}</span>,
		},
		{
			header: t("invoiceApprovals.table.actions"),
			accessor: "id",
			width: "200px",
			render: (value, row) => (
				<div className="flex gap-2">
					{row.status === "Pending" && (
						<>
							<Button
								onClick={() => handleApprove(value)}
								title={t("invoiceApprovals.actions.approve")}
								className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium bg-transparent shadow-none hover:shadow-none"
							/>
							<Button
								onClick={() => handleReject(value)}
								title={t("invoiceApprovals.actions.reject")}
								className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium bg-transparent shadow-none hover:shadow-none"
							/>
						</>
					)}
				</div>
			),
		},
	];

	// Filter data based on active tab
	const getFilteredData = () => {
		let filtered = displayApprovals;

		// Filter by tab
		if (activeTab !== "all") {
			filtered = filtered.filter(item => item.status.toLowerCase() === activeTab.toLowerCase());
		}

		// Filter by type
		if (selectedType !== "all") {
			filtered = filtered.filter(item => item.rawType === selectedType);
		}

		// Filter by search
		if (searchQuery) {
			filtered = filtered.filter(
				item =>
					item.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.approver.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		return filtered;
	};

	const tabs = [
		{ id: "all", label: t("invoiceApprovals.tabs.all"), count: counts.all },
		{ id: "approved", label: t("invoiceApprovals.tabs.approved"), count: counts.approved },
		{ id: "pending", label: t("invoiceApprovals.tabs.pending"), count: counts.pending },
		{ id: "rejected", label: t("invoiceApprovals.tabs.rejected"), count: counts.rejected },
	];

	const filterOptions = useMemo(
		() => [
			{ value: "all", label: t("invoiceApprovals.actions.filterAllTypes") },
			{ value: "AP Invoice", label: t("invoiceApprovals.actions.apInvoice") },
			{ value: "AR Invoice", label: t("invoiceApprovals.actions.arInvoice") },
		],
		[t]
	);

	return (
		<div className="min-h-screen bg-gray-50">
			<PageHeader
				title={t("invoiceApprovals.title")}
				subtitle={t("invoiceApprovals.subtitle")}
				icon={<InvoiceApprovalsHeaderIcon />}
			/>

			<div className="w-[95%] mx-auto px-6 py-8">
				{/* Header with Title and Buttons */}
				<div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
					<h2 className="text-2xl font-bold text-gray-900">{t("invoiceApprovals.title")}</h2>
					<div className="flex gap-3 items-center w-full md:w-auto">
						<Button
							onClick={handleCreate}
							className="bg-[#28819C] hover:bg-[#1f6477]"
							icon={<BiPlus size={20} color="white" />}
							title={t("invoiceApprovals.actions.createApproval")}
						/>
						<div className="relative">
							<SearchInput
								placeholder={t("invoiceApprovals.actions.searchPlaceholder")}
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
							/>
						</div>
						{/* Type Filter */}

						<FloatingLabelSelect
							label={t("invoiceApprovals.actions.filterByType")}
							value={selectedType}
							onChange={e => setSelectedType(e.target.value)}
							options={filterOptions}
							className="w-48"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					{statsCards.map((card, index) => (
						<StatisticsCard value={card.count} title={card.title} icon={card.icon} key={index} />
					))}
				</div>

				{/* Reusable Tabs Component */}
				<div className="mb-6">
					<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
				</div>

				{/* Table */}
				<Table
					columns={columns}
					data={getFilteredData()}
					onEdit={row => (row.status === "Pending" ? handleEdit(row) : null)}
					onDelete={row => (row.status === "Pending" ? handleDelete(row) : null)}
					showActions={row => row.status === "Pending"}
				/>
			</div>

			{/* Create/Edit Modal */}

			<SlideUpModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setFormData({
						invoice_type: "",
						invoice_id: "",
						submitted_by: "",
					});
				}}
				title={
					editingApproval ? t("invoiceApprovals.modals.editTitle") : t("invoiceApprovals.modals.createTitle")
				}
			>
				<InvoiceApprovalForm
					t={t}
					formData={formData}
					onChange={handleChange}
					onCancel={() => {
						setIsModalOpen(false);
						setFormData({
							invoice_type: "",
							invoice_id: "",
							submitted_by: "",
						});
					}}
					onSubmit={handleSubmit}
					loading={loading}
					editingApproval={editingApproval}
					availableInvoices={availableInvoices}
				/>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setDeleteId(null);
				}}
				onConfirm={confirmDelete}
				title={t("invoiceApprovals.modals.deleteTitle")}
				message={t("invoiceApprovals.modals.deleteMessage")}
				confirmText={t("invoiceApprovals.actions.delete")}
				cancelText={t("invoiceApprovals.actions.cancel")}
				confirmButtonClass="bg-red-600 hover:bg-red-700"
			/>

			{/* Approve Confirmation Modal */}
			<ConfirmModal
				isOpen={isApproveModalOpen}
				onClose={() => {
					setIsApproveModalOpen(false);
					setActionId(null);
					setActionComments("");
				}}
				onConfirm={confirmApprove}
				title={t("invoiceApprovals.modals.approveTitle")}
				message={t("invoiceApprovals.modals.approveMessage")}
				confirmText={t("invoiceApprovals.actions.approve")}
				confirmColor="green"
				showTextarea
				textareaLabel={t("invoiceApprovals.modals.commentsLabel")}
				textareaValue={actionComments}
				onTextareaChange={e => setActionComments(e.target.value)}
				loading={loading}
			/>

			{/* Reject Confirmation Modal */}
			<ConfirmModal
				isOpen={isRejectModalOpen}
				onClose={() => {
					setIsRejectModalOpen(false);
					setActionId(null);
					setActionComments("");
				}}
				onConfirm={confirmReject}
				title={t("invoiceApprovals.modals.rejectTitle")}
				message={t("invoiceApprovals.modals.rejectMessage")}
				confirmText={t("invoiceApprovals.actions.reject")}
				confirmColor="red"
				showTextarea
				textareaLabel={t("invoiceApprovals.modals.rejectionReasonLabel")}
				textareaValue={actionComments}
				onTextareaChange={e => setActionComments(e.target.value)}
				loading={loading}
			/>

			{/* Toast Container */}
			<ToastContainer
				position={isRtl ? "top-left" : "top-right"}
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={isRtl}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="light"
			/>
		</div>
	);
};

export default InvoiceApprovalsPage;
