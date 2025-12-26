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
	fetchAllPendingApprovals,
	fetchAPPendingApprovals,
	fetchARPendingApprovals,
	fetchOTSPendingApprovals,
	fetchPaymentPendingApprovals,
	fetchAllProcurementPendingApprovals,
	fetchCatalogPRPendingApprovals,
	fetchNonCatalogPRPendingApprovals,
	fetchServicePRPendingApprovals,
	fetchPOPendingApprovals,
	createInvoiceApproval,
	updateInvoiceApproval,
	deleteInvoiceApproval,
	approveInvoice,
	rejectInvoice,
	delegateInvoice,
	approveProcurementPR,
	rejectProcurementPR,
	approvePO,
	rejectPO,
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
import { FiPackage } from "react-icons/fi";
import InvoiceApprovalForm from "../components/forms/InvoiceApprovalForm";
import { useNavigate } from "react-router";

const InvoiceApprovalsPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	const {
		pendingApprovals,
		apPendingApprovals,
		arPendingApprovals,
		otsPendingApprovals,
		paymentPendingApprovals,
		procurementPendingApprovals,
		catalogPRPendingApprovals,
		nonCatalogPRPendingApprovals,
		servicePRPendingApprovals,
		poPendingApprovals,
		loading,
	} = useSelector(state => state.invoiceApprovals);
	const { invoices: arInvoices } = useSelector(state => state.arInvoices);
	const { invoices: apInvoices } = useSelector(state => state.apInvoices);

	// Main tab to separate Invoices/Payments from Procurement
	const [mainTab, setMainTab] = useState("invoices");
	const [activeTab, setActiveTab] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedType, setSelectedType] = useState("all");
	const [selectedProcurementType, setSelectedProcurementType] = useState("all");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
	const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
	const [editingApproval, setEditingApproval] = useState(null);
	const [deleteId, setDeleteId] = useState(null);
	const [actionId, setActionId] = useState(null);
	const [actionInvoiceType, setActionInvoiceType] = useState(null);
	const [actionPRType, setActionPRType] = useState(null);
	const [actionPOId, setActionPOId] = useState(null);
	const [formData, setFormData] = useState({
		invoice_type: "",
		invoice_id: "",
		submitted_by: "",
	});
	const [actionComments, setActionComments] = useState("");
	const [availableInvoices, setAvailableInvoices] = useState([]);

	// Delegate modal state
	const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
	const [delegateTargetUserId, setDelegateTargetUserId] = useState("");

	useEffect(() => {
		dispatch(fetchARInvoices());
		dispatch(fetchAPInvoices());
		// Fetch pending approvals from all endpoints
		dispatch(fetchAllPendingApprovals());
		dispatch(fetchAllProcurementPendingApprovals());
		dispatch(fetchPOPendingApprovals());
	}, [dispatch]);

	// Refetch based on selected type filter
	useEffect(() => {
		if (selectedType === "all") {
			dispatch(fetchAllPendingApprovals());
		} else if (selectedType === "AP Invoice") {
			dispatch(fetchAPPendingApprovals());
		} else if (selectedType === "AR Invoice") {
			dispatch(fetchARPendingApprovals());
		} else if (selectedType === "OTS Invoice") {
			dispatch(fetchOTSPendingApprovals());
		} else if (selectedType === "Payment") {
			dispatch(fetchPaymentPendingApprovals());
		}
	}, [dispatch, selectedType]);

	// Refetch based on selected procurement type filter
	useEffect(() => {
		if (selectedProcurementType === "all") {
			dispatch(fetchAllProcurementPendingApprovals());
		} else if (selectedProcurementType === "Catalog") {
			dispatch(fetchCatalogPRPendingApprovals());
		} else if (selectedProcurementType === "NonCatalog") {
			dispatch(fetchNonCatalogPRPendingApprovals());
		} else if (selectedProcurementType === "Service") {
			dispatch(fetchServicePRPendingApprovals());
		}
	}, [dispatch, selectedProcurementType]);

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

	const handleApprove = (id, invoiceType) => {
		setActionId(id);
		setActionInvoiceType(invoiceType);
		setActionComments("");
		setIsApproveModalOpen(true);
	};

	const handleReject = (id, invoiceType) => {
		setActionId(id);
		setActionInvoiceType(invoiceType);
		setActionComments("");
		setIsRejectModalOpen(true);
	};

	const handleDelegate = (id, invoiceType) => {
		setActionId(id);
		setActionInvoiceType(invoiceType);
		setActionComments("");
		setDelegateTargetUserId("");
		setIsDelegateModalOpen(true);
	};

	// Procurement approval handlers
	const handleProcurementApprove = (prId, prType) => {
		setActionId(prId);
		setActionPRType(prType);
		setActionComments("");
		setIsApproveModalOpen(true);
	};

	const handleProcurementReject = (prId, prType) => {
		setActionId(prId);
		setActionPRType(prType);
		setActionComments("");
		setIsRejectModalOpen(true);
	};

	// PO approval handlers
	const handlePOApprove = poId => {
		setActionPOId(poId);
		setActionComments("");
		setIsApproveModalOpen(true);
	};

	const handlePOReject = poId => {
		setActionPOId(poId);
		setActionComments("");
		setIsRejectModalOpen(true);
	};

	const confirmApprove = async () => {
		try {
			// Check if this is a PO approval
			if (actionPOId) {
				await dispatch(
					approvePO({
						id: actionPOId,
						comments: actionComments,
					})
				).unwrap();
				toast.success(t("invoiceApprovals.messages.poApproveSuccess"));
				dispatch(fetchPOPendingApprovals());
				// Check if this is a procurement approval
			} else if (actionPRType) {
				await dispatch(
					approveProcurementPR({
						id: actionId,
						prType: actionPRType,
						comments: actionComments,
					})
				).unwrap();
				toast.success(t("invoiceApprovals.messages.procurementApproveSuccess"));
				// Refresh procurement list
				if (selectedProcurementType === "all") {
					dispatch(fetchAllProcurementPendingApprovals());
				} else if (selectedProcurementType === "Catalog") {
					dispatch(fetchCatalogPRPendingApprovals());
				} else if (selectedProcurementType === "NonCatalog") {
					dispatch(fetchNonCatalogPRPendingApprovals());
				} else if (selectedProcurementType === "Service") {
					dispatch(fetchServicePRPendingApprovals());
				}
			} else {
				await dispatch(
					approveInvoice({
						id: actionId,
						invoiceType: actionInvoiceType,
						comment: actionComments,
					})
				).unwrap();
				toast.success(t("invoiceApprovals.messages.approveSuccess"));
				// Refresh the invoice list
				if (selectedType === "all") {
					dispatch(fetchAllPendingApprovals());
				} else if (selectedType === "AP Invoice") {
					dispatch(fetchAPPendingApprovals());
				} else if (selectedType === "AR Invoice") {
					dispatch(fetchARPendingApprovals());
				} else if (selectedType === "OTS Invoice") {
					dispatch(fetchOTSPendingApprovals());
				} else if (selectedType === "Payment") {
					dispatch(fetchPaymentPendingApprovals());
				}
			}
			setIsApproveModalOpen(false);
			setActionId(null);
			setActionInvoiceType(null);
			setActionPRType(null);
			setActionPOId(null);
			setActionComments("");
		} catch (error) {
			toast.error(error || t("invoiceApprovals.messages.approveError"));
		}
	};

	const confirmReject = async () => {
		try {
			// Check if this is a PO rejection
			if (actionPOId) {
				await dispatch(
					rejectPO({
						id: actionPOId,
						comments: actionComments,
					})
				).unwrap();
				toast.success(t("invoiceApprovals.messages.poRejectSuccess"));
				dispatch(fetchPOPendingApprovals());
				// Check if this is a procurement rejection
			} else if (actionPRType) {
				await dispatch(
					rejectProcurementPR({
						id: actionId,
						prType: actionPRType,
						comments: actionComments,
					})
				).unwrap();
				toast.success(t("invoiceApprovals.messages.procurementRejectSuccess"));
				// Refresh procurement list
				if (selectedProcurementType === "all") {
					dispatch(fetchAllProcurementPendingApprovals());
				} else if (selectedProcurementType === "Catalog") {
					dispatch(fetchCatalogPRPendingApprovals());
				} else if (selectedProcurementType === "NonCatalog") {
					dispatch(fetchNonCatalogPRPendingApprovals());
				} else if (selectedProcurementType === "Service") {
					dispatch(fetchServicePRPendingApprovals());
				}
			} else {
				await dispatch(
					rejectInvoice({
						id: actionId,
						invoiceType: actionInvoiceType,
						comment: actionComments,
					})
				).unwrap();
				toast.success(t("invoiceApprovals.messages.rejectSuccess"));
				// Refresh the invoice list
				if (selectedType === "all") {
					dispatch(fetchAllPendingApprovals());
				} else if (selectedType === "AP Invoice") {
					dispatch(fetchAPPendingApprovals());
				} else if (selectedType === "AR Invoice") {
					dispatch(fetchARPendingApprovals());
				} else if (selectedType === "OTS Invoice") {
					dispatch(fetchOTSPendingApprovals());
				} else if (selectedType === "Payment") {
					dispatch(fetchPaymentPendingApprovals());
				}
			}
			setIsRejectModalOpen(false);
			setActionId(null);
			setActionInvoiceType(null);
			setActionPRType(null);
			setActionPOId(null);
			setActionComments("");
		} catch (error) {
			toast.error(error || t("invoiceApprovals.messages.rejectError"));
		}
	};

	const confirmDelegate = async () => {
		if (!delegateTargetUserId) {
			toast.error(t("invoiceApprovals.messages.selectUser"));
			return;
		}
		try {
			await dispatch(
				delegateInvoice({
					id: actionId,
					invoiceType: actionInvoiceType,
					targetUserId: parseInt(delegateTargetUserId),
					comment: actionComments,
				})
			).unwrap();
			toast.success(t("invoiceApprovals.messages.delegateSuccess"));
			setIsDelegateModalOpen(false);
			setActionId(null);
			setActionInvoiceType(null);
			setActionComments("");
			setDelegateTargetUserId("");
			// Refresh the list
			if (selectedType === "all") {
				dispatch(fetchAllPendingApprovals());
			} else if (selectedType === "AP Invoice") {
				dispatch(fetchAPPendingApprovals());
			} else if (selectedType === "AR Invoice") {
				dispatch(fetchARPendingApprovals());
			} else if (selectedType === "OTS Invoice") {
				dispatch(fetchOTSPendingApprovals());
			} else if (selectedType === "Payment") {
				dispatch(fetchPaymentPendingApprovals());
			}
		} catch (error) {
			toast.error(error || t("invoiceApprovals.messages.delegateError"));
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

	// Get pending approvals based on selected type
	const getPendingApprovalsData = () => {
		if (selectedType === "all") {
			return pendingApprovals || [];
		} else if (selectedType === "AP Invoice") {
			return apPendingApprovals || [];
		} else if (selectedType === "AR Invoice") {
			return arPendingApprovals || [];
		} else if (selectedType === "OTS Invoice") {
			return otsPendingApprovals || [];
		} else if (selectedType === "Payment") {
			return paymentPendingApprovals || [];
		}
		return pendingApprovals || [];
	};

	const mappedApprovals = getPendingApprovalsData().map(approval => ({
		id: approval.invoice_id || approval.payment_id || approval.id,
		invoiceId: approval.invoice_id || approval.payment_id,
		type:
			approval.invoice_type === "AP"
				? t("invoiceApprovals.actions.apInvoice")
				: approval.invoice_type === "AR"
				? t("invoiceApprovals.actions.arInvoice")
				: approval.invoice_type === "PAYMENT"
				? t("invoiceApprovals.actions.payment")
				: t("invoiceApprovals.actions.otsInvoice"),
		invoiceType: approval.invoice_type, // Raw invoice type for API calls
		invoiceNumber:
			approval.invoice_number ||
			approval.payment_number ||
			`INV-${approval.invoice_id || approval.payment_id || approval.id}`,
		customerName:
			approval.customer_name || approval.supplier_name || approval.payee_name || t("invoiceApprovals.form.na"),
		total:
			approval.total || approval.amount
				? `${approval.currency || ""} ${approval.total || approval.amount}`
				: t("invoiceApprovals.form.na"),
		currentStage: approval.current_stage || t("invoiceApprovals.form.na"),
		// Keep internal status for logic, translate in render
		status:
			approval.approval_status === "PENDING_APPROVAL"
				? "Pending"
				: approval.approval_status === "APPROVED"
				? "Approved"
				: approval.approval_status === "REJECTED"
				? "Rejected"
				: "Pending",
		submittedDate: approval.date
			? new Date(approval.date).toLocaleDateString()
			: approval.submitted_at
			? new Date(approval.submitted_at).toLocaleDateString()
			: t("invoiceApprovals.form.na"),
		rawStatus: approval.approval_status || approval.status,
		rawType:
			approval.invoice_type === "AP"
				? "AP Invoice"
				: approval.invoice_type === "AR"
				? "AR Invoice"
				: approval.invoice_type === "PAYMENT"
				? "Payment"
				: "OTS Invoice",
		// Permissions from API
		canApprove: approval.can_approve || false,
		canReject: approval.can_reject || false,
		canDelegate: approval.can_delegate || false,
		workflowId: approval.workflow_id,
		rawData: approval, // Keep raw data for actions
	}));

	// Use pending approvals data
	const displayApprovals = mappedApprovals;

	// Get procurement pending approvals based on selected type
	const getProcurementPendingApprovalsData = () => {
		if (selectedProcurementType === "all") {
			return procurementPendingApprovals || [];
		} else if (selectedProcurementType === "Catalog") {
			return catalogPRPendingApprovals || [];
		} else if (selectedProcurementType === "NonCatalog") {
			return nonCatalogPRPendingApprovals || [];
		} else if (selectedProcurementType === "Service") {
			return servicePRPendingApprovals || [];
		}
		return procurementPendingApprovals || [];
	};

	const mappedProcurementApprovals = getProcurementPendingApprovalsData().map(pr => ({
		id: pr.pr_id,
		prId: pr.pr_id,
		prNumber: pr.pr_number,
		type:
			pr.pr_type === "CATALOG"
				? t("invoiceApprovals.procurement.catalog")
				: pr.pr_type === "NON_CATALOG"
				? t("invoiceApprovals.procurement.nonCatalog")
				: t("invoiceApprovals.procurement.service"),
		prType: pr.pr_type, // Raw PR type for API calls
		date: pr.date ? new Date(pr.date).toLocaleDateString() : t("invoiceApprovals.form.na"),
		requiredDate: pr.required_date
			? new Date(pr.required_date).toLocaleDateString()
			: t("invoiceApprovals.form.na"),
		requesterName: pr.requester_name || t("invoiceApprovals.form.na"),
		requesterDepartment: pr.requester_department || t("invoiceApprovals.form.na"),
		status:
			pr.status === "PENDING_APPROVAL"
				? "Pending"
				: pr.status === "APPROVED"
				? "Approved"
				: pr.status === "REJECTED"
				? "Rejected"
				: "Pending",
		priority: pr.priority || t("invoiceApprovals.form.na"),
		total: pr.total ? `${pr.total}` : t("invoiceApprovals.form.na"),
		itemCount: pr.item_count || pr.service_count || 0,
		rawData: pr,
	}));

	const displayProcurementApprovals = mappedProcurementApprovals;

	// Map PO pending approvals
	const mappedPOApprovals = (poPendingApprovals || []).map(po => ({
		id: po.po_id,
		poId: po.po_id,
		poNumber: po.po_number,
		type: po.po_type,
		date: po.po_date ? new Date(po.po_date).toLocaleDateString() : t("invoiceApprovals.form.na"),
		supplierName: po.supplier_name || t("invoiceApprovals.form.na"),
		total: po.total ? `${po.currency || ""} ${po.total}` : t("invoiceApprovals.form.na"),
		currentStage: po.current_stage || t("invoiceApprovals.form.na"),
		status:
			po.status === "SUBMITTED" || po.workflow_status === "in_progress"
				? "Pending"
				: po.status === "APPROVED"
				? "Approved"
				: po.status === "REJECTED"
				? "Rejected"
				: "Pending",
		canApprove: po.can_approve || false,
		workflowId: po.workflow_id,
		assignmentId: po.assignment_id,
		rawData: po,
	}));

	const displayPOApprovals = mappedPOApprovals;

	// Calculate counts for invoice tabs
	const getCounts = () => {
		return {
			all: displayApprovals.length,
			approved: displayApprovals.filter(a => a.status === "Approved").length,
			pending: displayApprovals.filter(a => a.status === "Pending").length,
			rejected: displayApprovals.filter(a => a.status === "Rejected").length,
		};
	};

	// Calculate counts for procurement tabs
	const getProcurementCounts = () => {
		return {
			all: displayProcurementApprovals.length,
			approved: displayProcurementApprovals.filter(a => a.status === "Approved").length,
			pending: displayProcurementApprovals.filter(a => a.status === "Pending").length,
			rejected: displayProcurementApprovals.filter(a => a.status === "Rejected").length,
		};
	};

	// Calculate counts for PO tabs
	const getPOCounts = () => {
		return {
			all: displayPOApprovals.length,
			approved: displayPOApprovals.filter(a => a.status === "Approved").length,
			pending: displayPOApprovals.filter(a => a.status === "Pending").length,
			rejected: displayPOApprovals.filter(a => a.status === "Rejected").length,
		};
	};

	const counts = getCounts();
	const procurementCounts = getProcurementCounts();
	const poCounts = getPOCounts();

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
			header: t("invoiceApprovals.table.customerSupplier"),
			accessor: "customerName",
			render: value => <span className="text-gray-900">{value}</span>,
		},
		{
			header: t("invoiceApprovals.table.total"),
			accessor: "total",
			render: value => <span className="text-gray-900 font-semibold">{value}</span>,
		},
		{
			header: t("invoiceApprovals.table.currentStage"),
			accessor: "currentStage",
			render: value => <span className="text-gray-700">{value}</span>,
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
			header: t("invoiceApprovals.table.date"),
			accessor: "submittedDate",
			width: "120px",
			render: value => <span className="text-gray-700">{value}</span>,
		},
		{
			header: t("invoiceApprovals.table.actions"),
			accessor: "id",
			width: "250px",
			render: (value, row) => (
				<div className="flex gap-2 flex-wrap justify-center">
					{row.status === "Pending" && (
						<>
							{row.canApprove && (
								<Button
									onClick={() => handleApprove(row.invoiceId, row.invoiceType)}
									title={t("invoiceApprovals.actions.approve")}
									className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium shadow-none hover:shadow-none"
								/>
							)}
							{row.canReject && (
								<Button
									onClick={() => handleReject(row.invoiceId, row.invoiceType)}
									title={t("invoiceApprovals.actions.reject")}
									className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium shadow-none hover:shadow-none"
								/>
							)}
							{row.canDelegate && (
								<Button
									onClick={() => handleDelegate(row.invoiceId, row.invoiceType)}
									title={t("invoiceApprovals.actions.delegate")}
									className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium shadow-none hover:shadow-none"
								/>
							)}
						</>
					)}
				</div>
			),
		},
	];

	// Filter data based on active tab and search
	const getFilteredData = () => {
		let filtered = displayApprovals;

		// Filter by tab (status)
		if (activeTab !== "all") {
			filtered = filtered.filter(item => item.status.toLowerCase() === activeTab.toLowerCase());
		}

		// Note: Type filtering is now handled by fetching from different endpoints
		// No need to filter by type here since we already fetch the correct data

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

	// Procurement table columns
	const procurementColumns = [
		{
			header: t("invoiceApprovals.procurement.table.type"),
			accessor: "type",
			width: "140px",
			render: value => <span className="font-semibold text-gray-900">{value}</span>,
		},
		{
			header: t("invoiceApprovals.procurement.table.prNumber"),
			accessor: "prNumber",
			width: "150px",
			render: value => <span className="font-semibold text-[#28819C]">{value}</span>,
		},
		{
			header: t("invoiceApprovals.procurement.table.requester"),
			accessor: "requesterName",
			render: value => <span className="text-gray-900">{value}</span>,
		},
		{
			header: t("invoiceApprovals.procurement.table.department"),
			accessor: "requesterDepartment",
			render: value => <span className="text-gray-700">{value}</span>,
		},
		{
			header: t("invoiceApprovals.procurement.table.total"),
			accessor: "total",
			render: value => <span className="text-gray-900 font-semibold">{value}</span>,
		},
		{
			header: t("invoiceApprovals.procurement.table.priority"),
			accessor: "priority",
			width: "100px",
			render: value => (
				<span
					className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
						value === "URGENT"
							? "bg-red-100 text-red-800"
							: value === "HIGH"
							? "bg-orange-100 text-orange-800"
							: value === "MEDIUM"
							? "bg-yellow-100 text-yellow-800"
							: "bg-gray-100 text-gray-800"
					}`}
				>
					{t(`invoiceApprovals.procurement.priority.${value?.toLowerCase() || "low"}`)}
				</span>
			),
		},
		{
			header: t("invoiceApprovals.procurement.table.status"),
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
			header: t("invoiceApprovals.procurement.table.date"),
			accessor: "date",
			width: "120px",
			render: value => <span className="text-gray-700">{value}</span>,
		},
		{
			header: t("invoiceApprovals.table.actions"),
			accessor: "id",
			width: "200px",
			render: (value, row) => (
				<div className="flex gap-2 flex-wrap justify-center">
					{row.status === "Pending" && (
						<>
							<Button
								onClick={() => handleProcurementApprove(row.prId, row.prType)}
								title={t("invoiceApprovals.actions.approve")}
								className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium shadow-none hover:shadow-none"
							/>
							<Button
								onClick={() => handleProcurementReject(row.prId, row.prType)}
								title={t("invoiceApprovals.actions.reject")}
								className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium shadow-none hover:shadow-none"
							/>
						</>
					)}
				</div>
			),
		},
	];

	// Procurement tabs
	const procurementTabs = [
		{ id: "all", label: t("invoiceApprovals.tabs.all"), count: procurementCounts.all },
		{ id: "approved", label: t("invoiceApprovals.tabs.approved"), count: procurementCounts.approved },
		{ id: "pending", label: t("invoiceApprovals.tabs.pending"), count: procurementCounts.pending },
		{ id: "rejected", label: t("invoiceApprovals.tabs.rejected"), count: procurementCounts.rejected },
	];

	// PO tabs
	const poTabs = [
		{ id: "all", label: t("invoiceApprovals.tabs.all"), count: poCounts.all },
		{ id: "approved", label: t("invoiceApprovals.tabs.approved"), count: poCounts.approved },
		{ id: "pending", label: t("invoiceApprovals.tabs.pending"), count: poCounts.pending },
		{ id: "rejected", label: t("invoiceApprovals.tabs.rejected"), count: poCounts.rejected },
	];

	// PO table columns
	const poColumns = [
		{
			header: t("invoiceApprovals.po.table.poNumber"),
			accessor: "poNumber",
			width: "150px",
			render: value => <span className="font-semibold text-[#28819C]">{value}</span>,
		},
		{
			header: t("invoiceApprovals.po.table.type"),
			accessor: "type",
			width: "120px",
			render: value => <span className="font-medium text-gray-900">{value}</span>,
		},
		{
			header: t("invoiceApprovals.po.table.supplier"),
			accessor: "supplierName",
			render: value => <span className="text-gray-900">{value}</span>,
		},
		{
			header: t("invoiceApprovals.po.table.total"),
			accessor: "total",
			render: value => <span className="text-gray-900 font-semibold">{value}</span>,
		},
		{
			header: t("invoiceApprovals.po.table.currentStage"),
			accessor: "currentStage",
			render: value => <span className="text-gray-700">{value}</span>,
		},
		{
			header: t("invoiceApprovals.po.table.status"),
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
			header: t("invoiceApprovals.po.table.date"),
			accessor: "date",
			width: "120px",
			render: value => <span className="text-gray-700">{value}</span>,
		},
		{
			header: t("invoiceApprovals.table.actions"),
			accessor: "id",
			width: "200px",
			render: (value, row) => (
				<div className="flex gap-2 flex-wrap justify-center">
					{row.status === "Pending" && row.canApprove && (
						<>
							<Button
								onClick={() => handlePOApprove(row.poId)}
								title={t("invoiceApprovals.actions.approve")}
								className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium shadow-none hover:shadow-none"
							/>
							<Button
								onClick={() => handlePOReject(row.poId)}
								title={t("invoiceApprovals.actions.reject")}
								className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium shadow-none hover:shadow-none"
							/>
						</>
					)}
				</div>
			),
		},
	];

	// Filter PO data based on active tab and search
	const getFilteredPOData = () => {
		let filtered = displayPOApprovals;

		// Filter by tab (status)
		if (activeTab !== "all") {
			filtered = filtered.filter(item => item.status.toLowerCase() === activeTab.toLowerCase());
		}

		// Filter by search
		if (searchQuery) {
			filtered = filtered.filter(
				item =>
					item.poNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.supplierName?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		return filtered;
	};

	// Filter procurement data based on active tab and search
	const getFilteredProcurementData = () => {
		let filtered = displayProcurementApprovals;

		// Filter by tab (status)
		if (activeTab !== "all") {
			filtered = filtered.filter(item => item.status.toLowerCase() === activeTab.toLowerCase());
		}

		// Filter by search
		if (searchQuery) {
			filtered = filtered.filter(
				item =>
					item.prNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.requesterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.requesterDepartment?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		return filtered;
	};

	const filterOptions = useMemo(
		() => [
			{ value: "all", label: t("invoiceApprovals.actions.filterAllTypes") },
			{ value: "AP Invoice", label: t("invoiceApprovals.actions.apInvoice") },
			{ value: "AR Invoice", label: t("invoiceApprovals.actions.arInvoice") },
			{ value: "OTS Invoice", label: t("invoiceApprovals.actions.otsInvoice") },
			{ value: "Payment", label: t("invoiceApprovals.actions.payment") },
		],
		[t]
	);

	const procurementFilterOptions = useMemo(
		() => [
			{ value: "all", label: t("invoiceApprovals.actions.filterAllTypes") },
			{ value: "Catalog", label: t("invoiceApprovals.procurement.catalog") },
			{ value: "NonCatalog", label: t("invoiceApprovals.procurement.nonCatalog") },
			{ value: "Service", label: t("invoiceApprovals.procurement.service") },
		],
		[t]
	);

	// Main tabs to separate Invoices/Payments from Procurement and PO
	const mainTabs = [
		{
			id: "invoices",
			label: t("invoiceApprovals.mainTabs.invoicesPayments"),
			count: counts.all,
		},
		{
			id: "procurement",
			label: t("invoiceApprovals.mainTabs.procurement"),
			count: procurementCounts.all,
		},
		{
			id: "po",
			label: t("invoiceApprovals.mainTabs.purchaseOrders"),
			count: poCounts.all,
		},
	];

	const navigate = useNavigate();

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
							onClick={() => navigate("/approval-workflow/")}
							title={t("invoiceApprovals.actions.approvalWorkflow")}
						/>
						<div className="relative">
							<SearchInput
								placeholder={t("invoiceApprovals.actions.searchPlaceholder")}
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
							/>
						</div>
						{/* Type Filter - changes based on main tab */}
						{mainTab === "invoices" && (
							<FloatingLabelSelect
								label={t("invoiceApprovals.actions.filterByType")}
								value={selectedType}
								onChange={e => setSelectedType(e.target.value)}
								options={filterOptions}
								className="w-48"
							/>
						)}
						{mainTab === "procurement" && (
							<FloatingLabelSelect
								label={t("invoiceApprovals.actions.filterByType")}
								value={selectedProcurementType}
								onChange={e => setSelectedProcurementType(e.target.value)}
								options={procurementFilterOptions}
								className="w-48"
							/>
						)}
					</div>
				</div>

				{/* Main Tabs - Invoices/Payments vs Procurement */}
				<div className="mb-6">
					<Tabs tabs={mainTabs} activeTab={mainTab} onTabChange={setMainTab} />
				</div>

				{/* Conditional content based on main tab */}
				{mainTab === "invoices" && (
					<>
						{/* Statistics Cards for Invoices */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
							{statsCards.map((card, index) => (
								<StatisticsCard value={card.count} title={card.title} icon={card.icon} key={index} />
							))}
						</div>

						{/* Status Tabs */}
						<div className="mb-6">
							<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
						</div>

						{/* Invoice Table */}
						<Table
							columns={columns}
							data={getFilteredData()}
							onDelete={row => (row.status === "Pending" ? handleDelete(row) : null)}
							showActions={row => row.status === "Pending"}
						/>
					</>
				)}

				{mainTab === "procurement" && (
					<>
						{/* Statistics Cards for Procurement */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
							<StatisticsCard
								value={procurementCounts.all}
								title={t("invoiceApprovals.stats.totals")}
								icon={<FiPackage size={35} color="#28819C" />}
							/>
							<StatisticsCard
								value={procurementCounts.approved}
								title={t("invoiceApprovals.stats.approved")}
								icon={<IoIosCheckmarkCircleOutline color="green" size={35} />}
							/>
							<StatisticsCard
								value={procurementCounts.pending}
								title={t("invoiceApprovals.stats.pending")}
								icon={<MdAccessTime color="#FFC043" size={35} />}
							/>
							<StatisticsCard
								value={procurementCounts.rejected}
								title={t("invoiceApprovals.stats.rejected")}
								icon={<IoMdCloseCircleOutline color="red" size={35} />}
							/>
						</div>

						{/* Status Tabs */}
						<div className="mb-6">
							<Tabs tabs={procurementTabs} activeTab={activeTab} onTabChange={setActiveTab} />
						</div>

						{/* Procurement Table */}
						<Table
							columns={procurementColumns}
							data={getFilteredProcurementData()}
							showActions={row => row.status === "Pending"}
						/>
					</>
				)}

				{mainTab === "po" && (
					<>
						{/* Statistics Cards for PO */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
							<StatisticsCard
								value={poCounts.all}
								title={t("invoiceApprovals.stats.totals")}
								icon={<FiPackage size={35} color="#28819C" />}
							/>
							<StatisticsCard
								value={poCounts.approved}
								title={t("invoiceApprovals.stats.approved")}
								icon={<IoIosCheckmarkCircleOutline color="green" size={35} />}
							/>
							<StatisticsCard
								value={poCounts.pending}
								title={t("invoiceApprovals.stats.pending")}
								icon={<MdAccessTime color="#FFC043" size={35} />}
							/>
							<StatisticsCard
								value={poCounts.rejected}
								title={t("invoiceApprovals.stats.rejected")}
								icon={<IoMdCloseCircleOutline color="red" size={35} />}
							/>
						</div>

						{/* Status Tabs */}
						<div className="mb-6">
							<Tabs tabs={poTabs} activeTab={activeTab} onTabChange={setActiveTab} />
						</div>

						{/* PO Table */}
						<Table
							columns={poColumns}
							data={getFilteredPOData()}
							showActions={row => row.status === "Pending" && row.canApprove}
						/>
					</>
				)}
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
					setActionInvoiceType(null);
					setActionPRType(null);
					setActionPOId(null);
					setActionComments("");
				}}
				onConfirm={confirmApprove}
				title={
					actionPOId
						? t("invoiceApprovals.modals.approvePOTitle")
						: actionPRType
						? t("invoiceApprovals.modals.approvePRTitle")
						: t("invoiceApprovals.modals.approveTitle")
				}
				message={
					actionPOId
						? t("invoiceApprovals.modals.approvePOMessage")
						: actionPRType
						? t("invoiceApprovals.modals.approvePRMessage")
						: t("invoiceApprovals.modals.approveMessage")
				}
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
					setActionInvoiceType(null);
					setActionPRType(null);
					setActionPOId(null);
					setActionComments("");
				}}
				onConfirm={confirmReject}
				title={
					actionPOId
						? t("invoiceApprovals.modals.rejectPOTitle")
						: actionPRType
						? t("invoiceApprovals.modals.rejectPRTitle")
						: t("invoiceApprovals.modals.rejectTitle")
				}
				message={
					actionPOId
						? t("invoiceApprovals.modals.rejectPOMessage")
						: actionPRType
						? t("invoiceApprovals.modals.rejectPRMessage")
						: t("invoiceApprovals.modals.rejectMessage")
				}
				confirmText={t("invoiceApprovals.actions.reject")}
				confirmColor="red"
				showTextarea
				textareaLabel={t("invoiceApprovals.modals.rejectionReasonLabel")}
				textareaValue={actionComments}
				onTextareaChange={e => setActionComments(e.target.value)}
				loading={loading}
			/>

			{/* Delegate Modal */}
			<SlideUpModal
				isOpen={isDelegateModalOpen}
				onClose={() => {
					setIsDelegateModalOpen(false);
					setActionId(null);
					setActionInvoiceType(null);
					setActionComments("");
					setDelegateTargetUserId("");
				}}
				title={t("invoiceApprovals.modals.delegateTitle")}
			>
				<div className="space-y-4">
					<p className="text-gray-600">{t("invoiceApprovals.modals.delegateMessage")}</p>

					<FloatingLabelSelect
						label={t("invoiceApprovals.modals.selectUser")}
						value={delegateTargetUserId}
						onChange={e => setDelegateTargetUserId(e.target.value)}
						options={[
							{ value: "", label: t("invoiceApprovals.modals.selectUserPlaceholder") },
							// TODO: Replace with actual users from API
							{ value: "1", label: "User 1" },
							{ value: "2", label: "User 2" },
							{ value: "3", label: "User 3" },
							{ value: "5", label: "Department Head" },
						]}
						required
					/>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							{t("invoiceApprovals.modals.commentsLabel")}
						</label>
						<textarea
							value={actionComments}
							onChange={e => setActionComments(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							rows={3}
							placeholder={t("invoiceApprovals.modals.delegateCommentPlaceholder")}
						/>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button
							onClick={() => {
								setIsDelegateModalOpen(false);
								setActionId(null);
								setActionInvoiceType(null);
								setActionComments("");
								setDelegateTargetUserId("");
							}}
							title={t("invoiceApprovals.actions.cancel")}
							className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 bg-transparent shadow-none hover:shadow-none"
						/>
						<Button
							onClick={confirmDelegate}
							disabled={loading || !delegateTargetUserId}
							title={
								loading
									? t("invoiceApprovals.actions.delegating")
									: t("invoiceApprovals.actions.delegate")
							}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-none hover:shadow-none"
						/>
					</div>
				</div>
			</SlideUpModal>

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
