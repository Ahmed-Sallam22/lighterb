import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";
import api from "../api/axios";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import SlideUpModal from "../components/shared/SlideUpModal";
import ConfirmModal from "../components/shared/ConfirmModal";
import Button from "../components/shared/Button";
import SearchInput from "../components/shared/SearchInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import FloatingLabelTextarea from "../components/shared/FloatingLabelTextarea";

import {
	fetchPOs,
	fetchPODetails,
	deletePO,
	submitPOForApproval,
	confirmPO,
	cancelPO,
	setPage,
	clearCurrentPO,
} from "../store/poSlice";
import { BiPlus } from "react-icons/bi";

// PO Icon
const POIcon = () => (
	<svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g opacity="0.5">
			<path
				d="M4 4C4 2.89543 4.89543 2 6 2H18L24 8V23C24 24.1046 23.1046 25 22 25H6C4.89543 25 4 24.1046 4 23V4Z"
				fill="#D3D3D3"
			/>
			<path d="M18 2V8H24" fill="#A0A0A0" />
			<path d="M8 12H20M8 16H16M8 20H12" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
		</g>
	</svg>
);

// Status options
const STATUS_OPTIONS = [
	{ value: "", label: "poPage.filters.allStatuses" },
	{ value: "DRAFT", label: "poPage.statuses.draft" },
	{ value: "SUBMITTED", label: "poPage.statuses.submitted" },
	{ value: "APPROVED", label: "poPage.statuses.approved" },
	{ value: "REJECTED", label: "poPage.statuses.rejected" },
	{ value: "CONFIRMED", label: "poPage.statuses.confirmed" },
	{ value: "PARTIALLY_RECEIVED", label: "poPage.statuses.partiallyReceived" },
	{ value: "RECEIVED", label: "poPage.statuses.received" },
	{ value: "CANCELLED", label: "poPage.statuses.cancelled" },
];

const POPage = () => {
	const { t } = useTranslation();
	usePageTitle(t("purchaseOrders.title"));
	const dispatch = useDispatch();
	const navigate = useNavigate();

	// Get data from Redux
	const { poList, loading, count, page, hasNext, hasPrevious, currentPO, detailsLoading } = useSelector(
		state => state.po
	);

	// Local state
	const [localPageSize, setLocalPageSize] = useState(20);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");

	// Modal state
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
	const [poToDelete, setPoToDelete] = useState(null);
	const [poToCancel, setPoToCancel] = useState(null);
	const [cancellationReason, setCancellationReason] = useState("");

	// Attachment state
	const [showAttachmentForm, setShowAttachmentForm] = useState(false);
	const [attachments, setAttachments] = useState([]);
	const [loadingAttachments, setLoadingAttachments] = useState(false);
	const [uploadingAttachment, setUploadingAttachment] = useState(false);
	const [deletingAttachment, setDeletingAttachment] = useState(false);
	const [confirmDeleteAttachmentModal, setConfirmDeleteAttachmentModal] = useState({
		isOpen: false,
		attachmentId: null,
		fileName: "",
	});
	const fileInputRef = useRef(null);
	const [attachmentForm, setAttachmentForm] = useState({
		file: null,
		file_type: "",
		description: "",
		file_name: "",
	});

	// Fetch PO list
	useEffect(() => {
		const params = {
			page,
			page_size: localPageSize,
		};
		if (searchTerm) params.search = searchTerm;
		if (statusFilter) params.status = statusFilter;

		dispatch(fetchPOs(params));
	}, [dispatch, page, localPageSize, searchTerm, statusFilter]);

	// Status options with translations
	const statusOptions = useMemo(
		() =>
			STATUS_OPTIONS.map(opt => ({
				value: opt.value,
				label: t(opt.label),
			})),
		[t]
	);

	// Get status badge styling
	const getStatusBadge = status => {
		const statusStyles = {
			DRAFT: "bg-gray-100 text-gray-800",
			SUBMITTED: "bg-blue-100 text-blue-800",
			APPROVED: "bg-green-100 text-green-800",
			REJECTED: "bg-red-100 text-red-800",
			CONFIRMED: "bg-purple-100 text-purple-800",
			PARTIALLY_RECEIVED: "bg-yellow-100 text-yellow-800",
			RECEIVED: "bg-teal-100 text-teal-800",
			CANCELLED: "bg-red-100 text-red-600",
		};
		return statusStyles[status] || "bg-gray-100 text-gray-800";
	};

	// Get PO type badge styling
	const getTypeBadge = type => {
		const typeStyles = {
			Catalog: "bg-blue-50 text-blue-700",
			"Non-Catalog": "bg-orange-50 text-orange-700",
			Service: "bg-green-50 text-green-700",
		};
		return typeStyles[type] || "bg-gray-50 text-gray-700";
	};

	// Table columns
	const columns = useMemo(
		() => [
			{
				header: t("poPage.table.poNumber"),
				accessor: "po_number",
				render: value => <span className="font-semibold text-[#28819C]">{value}</span>,
			},
			{
				header: t("poPage.table.poDate"),
				accessor: "po_date",
				render: value => <span className="text-gray-600">{value || "-"}</span>,
			},
			{
				header: t("poPage.table.poType"),
				accessor: "po_type",
				render: value => (
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(
							value
						)}`}
					>
						{value}
					</span>
				),
			},
			{
				header: t("poPage.table.supplier"),
				accessor: "supplier_name",
				render: value => <span className="text-gray-900">{value || "-"}</span>,
			},
			{
				header: t("poPage.table.currency"),
				accessor: "currency_code",
				width: "100px",
				render: value => <span className="font-medium text-gray-700">{value || "-"}</span>,
			},
			{
				header: t("poPage.table.totalAmount"),
				accessor: "total_amount",
				render: value => (
					<span className="font-semibold text-gray-900">
						{parseFloat(value || 0).toLocaleString(undefined, {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}
					</span>
				),
			},
			{
				header: t("poPage.table.itemCount"),
				accessor: "item_count",
				width: "100px",
				render: value => (
					<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
						{value}
					</span>
				),
			},
			{
				header: t("poPage.table.status"),
				accessor: "status",
				render: value => (
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(
							value
						)}`}
					>
						{t(`poPage.statuses.${value.toLowerCase().replace("_", "")}`)}
					</span>
				),
			},
		],
		[t]
	);

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

	// Handlers
	const handleCreatePO = () => {
		navigate("/procurement/po/create");
	};

	const handleViewPO = async po => {
		setIsViewModalOpen(true);
		dispatch(fetchPODetails(po.id));
	};

	const handleCloseViewModal = () => {
		setIsViewModalOpen(false);
		dispatch(clearCurrentPO());
	};

	const handleDeleteClick = po => {
		setPoToDelete(po);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!poToDelete) return;

		try {
			await dispatch(deletePO(poToDelete.id)).unwrap();
			toast.success(t("poPage.messages.deleted"));
			setIsDeleteModalOpen(false);
			setPoToDelete(null);
		} catch (error) {
			toast.error(error || t("poPage.messages.deleteError"));
		}
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
		setPoToDelete(null);
	};

	// Submit for Approval handler - like AP Payments (no modal)
	const handleSubmitForApproval = async po => {
		try {
			await dispatch(submitPOForApproval(po.id)).unwrap();
			toast.success(t("poPage.messages.submitted"));
			// Refresh list
			dispatch(fetchPOs({ page, page_size: localPageSize, search: searchTerm, status: statusFilter }));
		} catch (error) {
			toast.error(error || t("poPage.messages.submitError"));
		}
	};

	// Confirm PO handler - like AP Payments (no modal)
	const handleConfirmPO = async po => {
		try {
			await dispatch(confirmPO(po.id)).unwrap();
			toast.success(t("poPage.messages.confirmed"));
			// Refresh list
			dispatch(fetchPOs({ page, page_size: localPageSize, search: searchTerm, status: statusFilter }));
		} catch (error) {
			toast.error(error || t("poPage.messages.confirmError"));
		}
	};

	// Cancel PO handlers
	const handleCancelPOClick = po => {
		setPoToCancel(po);
		setCancellationReason("");
		setIsCancelModalOpen(true);
	};

	const handleConfirmCancelPO = async () => {
		if (!poToCancel) return;

		if (!cancellationReason.trim()) {
			toast.error(t("poPage.validation.reasonRequired"));
			return;
		}

		try {
			await dispatch(cancelPO({ id: poToCancel.id, reason: cancellationReason })).unwrap();
			toast.success(t("poPage.messages.cancelled"));
			setIsCancelModalOpen(false);
			setPoToCancel(null);
			setCancellationReason("");
		} catch (error) {
			toast.error(error || t("poPage.messages.cancelError"));
		}
	};

	const handleDismissCancelPO = () => {
		setIsCancelModalOpen(false);
		setPoToCancel(null);
		setCancellationReason("");
	};

	// Fetch attachments when modal opens
	useEffect(() => {
		if (!isViewModalOpen || !currentPO?.id) return;

		const fetchAttachments = async () => {
			setLoadingAttachments(true);
			try {
				const { data } = await api.get(`/procurement/po/${currentPO.id}/attachments/`);
				const attachmentsList = data?.data ?? data?.results ?? data ?? [];
				setAttachments(Array.isArray(attachmentsList) ? attachmentsList : []);
			} catch (err) {
				console.error("Failed to fetch attachments:", err);
				setAttachments([]);
			} finally {
				setLoadingAttachments(false);
			}
		};

		fetchAttachments();
	}, [currentPO?.id, isViewModalOpen]);

	// Reset attachment state when modal closes
	useEffect(() => {
		if (!isViewModalOpen) {
			setShowAttachmentForm(false);
			setAttachments([]);
			setConfirmDeleteAttachmentModal({ isOpen: false, attachmentId: null, fileName: "" });
			setAttachmentForm({
				file: null,
				file_type: "",
				description: "",
				file_name: "",
			});
		}
	}, [isViewModalOpen]);

	const convertFileToBase64 = file => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result.split(",")[1]);
			reader.onerror = error => reject(error);
		});
	};

	const handleFileSelect = async e => {
		const file = e.target.files?.[0];
		if (!file) return;

		setAttachmentForm(prev => ({
			...prev,
			file,
			file_type: file.type,
			file_name: file.name,
		}));
	};

	const handleUploadAttachment = async () => {
		if (!attachmentForm.file) {
			toast.error(t("poPage.attachments.errors.noFile"));
			return;
		}

		setUploadingAttachment(true);
		try {
			const base64 = await convertFileToBase64(attachmentForm.file);

			const formData = new FormData();
			formData.append("file_data", attachmentForm.file);
			formData.append("file_type", attachmentForm.file_type);
			formData.append("description", attachmentForm.description || "");
			formData.append("file_data_base64", base64);
			formData.append("file_name", attachmentForm.file_name);

			await api.post(`/procurement/po/${currentPO.id}/attachments/`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			toast.success(t("poPage.attachments.messages.uploadSuccess"));

			// Refresh attachments list
			const { data } = await api.get(`/procurement/po/${currentPO.id}/attachments/`);
			const attachmentsList = data?.data ?? data?.results ?? data ?? [];
			setAttachments(Array.isArray(attachmentsList) ? attachmentsList : []);

			// Reset form
			setAttachmentForm({
				file: null,
				file_type: "",
				description: "",
				file_name: "",
			});
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			setShowAttachmentForm(false);
		} catch (err) {
			const message =
				err.response?.data?.message ||
				err.response?.data?.error ||
				err.response?.data?.detail ||
				err.message ||
				t("poPage.attachments.errors.uploadFailed");
			toast.error(message, { autoClose: 8000 });
		} finally {
			setUploadingAttachment(false);
		}
	};

	const handleDeleteAttachment = (attachmentId, fileName) => {
		setConfirmDeleteAttachmentModal({ isOpen: true, attachmentId, fileName });
	};

	const confirmDeleteAttachment = async () => {
		setDeletingAttachment(true);
		try {
			await api.delete(`/procurement/po/attachments/${confirmDeleteAttachmentModal.attachmentId}/`);
			toast.success(t("poPage.attachments.messages.deleteSuccess"));

			// Refresh attachments list
			const { data } = await api.get(`/procurement/po/${currentPO.id}/attachments/`);
			const attachmentsList = data?.data ?? data?.results ?? data ?? [];
			setAttachments(Array.isArray(attachmentsList) ? attachmentsList : []);
			setConfirmDeleteAttachmentModal({ isOpen: false, attachmentId: null, fileName: "" });
		} catch (err) {
			const message =
				err.response?.data?.message ||
				err.response?.data?.error ||
				err.response?.data?.detail ||
				err.message ||
				t("poPage.attachments.errors.deleteFailed");
			toast.error(message, { autoClose: 8000 });
		} finally {
			setDeletingAttachment(false);
		}
	};

	const handleDownloadAttachment = async (attachmentId, fileName) => {
		try {
			const { data } = await api.get(`/procurement/po/${currentPO.id}/attachments/${attachmentId}/`, {
				responseType: "blob",
			});

			const url = window.URL.createObjectURL(new Blob([data]));
			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", fileName);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (err) {
			toast.error(t("poPage.attachments.errors.downloadFailed"), { autoClose: 8000 });
		}
	};

	const formatDateTime = dateString => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const handleSearchChange = e => {
		setSearchTerm(e.target.value);
		dispatch(setPage(1));
	};

	const handleStatusFilterChange = e => {
		setStatusFilter(e.target.value);
		dispatch(setPage(1));
	};

	// Show edit/delete only for DRAFT
	const showEditButton = row => row.status === "DRAFT";
	const showDeleteButton = row => row.status === "DRAFT";

	// Custom actions for table - similar to AP Payments
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
			title: t("poPage.actions.submitForApproval"),
			onClick: handleSubmitForApproval,
			showWhen: row => row.status === "DRAFT",
		},
		{
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
				</svg>
			),
			title: t("poPage.actions.confirm"),
			onClick: handleConfirmPO,
			showWhen: row => row.status === "APPROVED",
		},
		{
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
				</svg>
			),
			title: t("poPage.actions.cancelPO"),
			onClick: handleCancelPOClick,
			showWhen: row => row.status === "APPROVED",
		},
	];

	return (
		<div className="min-h-screen bg-[#EEEEEE]">
			<ToastContainer position="top-right" />

			{/* Header */}
			<PageHeader title={t("poPage.title")} subtitle={t("poPage.subtitle")} icon={<POIcon />} />

			<div className="w-[95%] mx-auto px-6 py-8">
				{/* Title and Create Button */}
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-[#28819C]">{t("poPage.title")}</h2>

					<Button
						onClick={handleCreatePO}
						title={t("poPage.actions.create")}
						icon={<BiPlus className="text-xl" />}
						className="bg-[#28819C] hover:bg-[#1d6a80] text-white"
					/>
				</div>

				{/* Filters Section */}
				<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Search */}
						<div>
							<SearchInput
								value={searchTerm}
								onChange={handleSearchChange}
								placeholder={t("poPage.filters.searchPlaceholder")}
								className="max-w-full"
							/>
						</div>

						{/* Status Filter */}
						<div>
							<FloatingLabelSelect
								label={t("poPage.filters.status")}
								name="status"
								value={statusFilter}
								onChange={handleStatusFilterChange}
								options={statusOptions}
							/>
						</div>
					</div>
				</div>

				{/* Table */}
				<Table
					columns={columns}
					data={poList}
					onView={handleViewPO}
					onDelete={handleDeleteClick}
					showEditButton={showEditButton}
					showDeleteButton={showDeleteButton}
					customActions={customActions}
					emptyMessage={loading ? t("poPage.table.loading") : t("poPage.table.emptyMessage")}
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
			</div>

			{/* View PO Modal */}
			<SlideUpModal
				isOpen={isViewModalOpen}
				onClose={handleCloseViewModal}
				title={t("poPage.modal.viewTitle")}
				maxWidth="800px"
			>
				{detailsLoading ? (
					<div className="flex items-center justify-center py-12">
						<div className="w-8 h-8 border-4 border-[#28819C] border-t-transparent rounded-full animate-spin"></div>
					</div>
				) : currentPO ? (
					<div className="space-y-6 p-4">
						{/* Attachment Actions Bar */}
						<div className="flex gap-3 border-b border-gray-200 pb-4">
							<button
								onClick={() => setShowAttachmentForm(!showAttachmentForm)}
								className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4v16m8-8H4"
									/>
								</svg>
								{t("poPage.attachments.uploadAttachment")}
							</button>
							<button
								onClick={() => {
									const attachmentsSection = document.getElementById("po-attachments-section");
									attachmentsSection?.scrollIntoView({ behavior: "smooth" });
								}}
								className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
									/>
								</svg>
								{t("poPage.attachments.viewAttachments")}
								{attachments.length > 0 && (
									<span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-blue-500 rounded-full">
										{attachments.length}
									</span>
								)}
							</button>
						</div>

						{/* Upload Attachment Form */}
						{showAttachmentForm && (
							<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-5 shadow-sm">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
										<svg
											className="w-5 h-5 text-blue-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
											/>
										</svg>
										{t("poPage.attachments.uploadAttachment")}
									</h3>
									<button
										onClick={() => setShowAttachmentForm(false)}
										className="text-gray-400 hover:text-gray-600 transition-colors"
									>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>

								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											{t("poPage.attachments.selectFile")}
											<span className="text-red-500 ml-1">*</span>
										</label>
										<input
											ref={fileInputRef}
											type="file"
											onChange={handleFileSelect}
											className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer border border-gray-300 rounded-lg bg-white"
										/>
										{attachmentForm.file && (
											<p className="mt-2 text-xs text-gray-600 flex items-center gap-1">
												<svg
													className="w-4 h-4 text-green-500"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M5 13l4 4L19 7"
													/>
												</svg>
												{attachmentForm.file.name} (
												{(attachmentForm.file.size / 1024).toFixed(2)} KB)
											</p>
										)}
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											{t("poPage.attachments.description")}
										</label>
										<textarea
											value={attachmentForm.description}
											onChange={e =>
												setAttachmentForm(prev => ({ ...prev, description: e.target.value }))
											}
											rows={3}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
											placeholder={t("poPage.attachments.descriptionPlaceholder")}
										/>
									</div>

									<div className="flex gap-3 pt-2">
										<button
											onClick={handleUploadAttachment}
											disabled={!attachmentForm.file || uploadingAttachment}
											className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{uploadingAttachment ? (
												<>
													<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
													{t("poPage.attachments.uploading")}
												</>
											) : (
												<>
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
														/>
													</svg>
													{t("poPage.attachments.upload")}
												</>
											)}
										</button>
										<button
											onClick={() => {
												setShowAttachmentForm(false);
												setAttachmentForm({
													file: null,
													file_type: "",
													description: "",
													file_name: "",
												});
												if (fileInputRef.current) {
													fileInputRef.current.value = "";
												}
											}}
											className="px-4 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200"
										>
											{t("common.cancel")}
										</button>
									</div>
								</div>
							</div>
						)}

						{/* PO Header Info */}
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">{t("poPage.modal.poNumber")}</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 font-semibold">
									{currentPO.po_number}
								</div>
							</div>
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">{t("poPage.modal.poDate")}</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
									{currentPO.po_date}
								</div>
							</div>
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">{t("poPage.modal.status")}</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(
											currentPO.status
										)}`}
									>
										{t(`poPage.statuses.${currentPO.status.toLowerCase().replace("_", "")}`)}
									</span>
								</div>
							</div>
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">{t("poPage.modal.poType")}</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(
											currentPO.po_type
										)}`}
									>
										{currentPO.po_type}
									</span>
								</div>
							</div>
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">{t("poPage.modal.supplier")}</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
									{currentPO.supplier_name}
								</div>
							</div>
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">{t("poPage.modal.currency")}</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
									{currentPO.currency_code}
								</div>
							</div>
						</div>

						{/* Source PR Numbers */}
						{currentPO.source_pr_numbers && currentPO.source_pr_numbers.length > 0 && (
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-2">{t("poPage.modal.sourcePRs")}</p>
								<div className="flex flex-wrap gap-2">
									{currentPO.source_pr_numbers.map((prNumber, index) => (
										<span
											key={index}
											className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
										>
											{prNumber}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Description */}
						{currentPO.description && (
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-1">
									{t("poPage.modal.description")}
								</p>
								<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
									{currentPO.description}
								</div>
							</div>
						)}

						{/* Items */}
						<div>
							<p className="text-sm font-medium text-[#28819C] mb-3">{t("poPage.modal.items")}</p>
							<div className="border rounded-xl overflow-hidden">
								<table className="w-full">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
												{t("poPage.modal.itemName")}
											</th>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
												{t("poPage.modal.quantity")}
											</th>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
												{t("poPage.modal.unitPrice")}
											</th>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
												{t("poPage.modal.lineTotal")}
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-200">
										{currentPO.items?.map((item, index) => (
											<tr key={item.id || index}>
												<td className="px-4 py-3">
													<div>
														<p className="font-medium text-gray-900">{item.item_name}</p>
														<p className="text-sm text-gray-500">{item.item_description}</p>
													</div>
												</td>
												<td className="px-4 py-3 text-gray-700">
													{parseFloat(item.quantity).toLocaleString()}
													{item.unit_of_measure_code}
												</td>
												<td className="px-4 py-3 text-gray-700">
													{parseFloat(item.unit_price).toLocaleString(undefined, {
														minimumFractionDigits: 2,
													})}
												</td>
												<td className="px-4 py-3 font-semibold text-gray-900">
													{parseFloat(item.line_total).toLocaleString(undefined, {
														minimumFractionDigits: 2,
													})}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>

						{/* Totals */}
						<div className="bg-gray-50 rounded-xl p-4">
							<div className="flex justify-between items-center mb-2">
								<span className="text-gray-600">{t("poPage.modal.subtotal")}</span>
								<span className="font-medium text-gray-900">
									{parseFloat(currentPO.subtotal || 0).toLocaleString(undefined, {
										minimumFractionDigits: 2,
									})}
								</span>
							</div>
							<div className="flex justify-between items-center mb-2">
								<span className="text-gray-600">{t("poPage.modal.tax")}</span>
								<span className="font-medium text-gray-900">
									{parseFloat(currentPO.tax_amount || 0).toLocaleString(undefined, {
										minimumFractionDigits: 2,
									})}
								</span>
							</div>
							<div className="flex justify-between items-center pt-2 border-t border-gray-200">
								<span className="text-lg font-semibold text-gray-900">{t("poPage.modal.total")}</span>
								<span className="text-lg font-bold text-[#28819C]">
									{currentPO.currency_code}
									{parseFloat(currentPO.total_amount || 0).toLocaleString(undefined, {
										minimumFractionDigits: 2,
									})}
								</span>
							</div>
						</div>

						{/* Attachments Section */}
						<div
							id="po-attachments-section"
							className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
						>
							<h3 className="text-sm font-semibold text-[#28819C] mb-4 flex items-center gap-2">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
									/>
								</svg>
								{t("poPage.attachments.title")} ({attachments.length})
							</h3>

							{loadingAttachments && (
								<div className="flex items-center justify-center py-8">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#28819C]"></div>
									<span className="ml-3 text-sm text-gray-500">{t("common.loading")}</span>
								</div>
							)}

							{!loadingAttachments && attachments.length === 0 && (
								<div className="bg-gray-50 rounded-lg p-8 text-center">
									<svg
										className="w-12 h-12 text-gray-400 mx-auto mb-3"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
										/>
									</svg>
									<p className="text-gray-500 text-sm">{t("poPage.attachments.noAttachments")}</p>
								</div>
							)}

							{!loadingAttachments && attachments.length > 0 && (
								<div className="space-y-2">
									{attachments.map((attachment, index) => (
										<div
											key={attachment.id || index}
											className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
										>
											<div className="flex items-center gap-3 flex-1 min-w-0">
												<div className="flex-shrink-0">
													<svg
														className="w-8 h-8 text-blue-500"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
														/>
													</svg>
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium text-gray-900 truncate">
														{attachment.file_name ||
															attachment.name ||
															`Attachment ${index + 1}`}
													</p>
													{attachment.description && (
														<p className="text-xs text-gray-500 truncate">
															{attachment.description}
														</p>
													)}
													<div className="flex items-center gap-2 mt-1">
														{attachment.file_type && (
															<span className="text-xs text-gray-400">
																{attachment.file_type}
															</span>
														)}
														{attachment.created_at && (
															<>
																<span className="text-gray-300">•</span>
																<span className="text-xs text-gray-400">
																	{formatDateTime(attachment.created_at)}
																</span>
															</>
														)}
													</div>
												</div>
											</div>
											<div className="flex items-center gap-2 flex-shrink-0">
												<button
													onClick={() =>
														handleDownloadAttachment(
															attachment.id,
															attachment.file_name || attachment.name || "file"
														)
													}
													className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
													title={t("poPage.attachments.download")}
												>
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
														/>
													</svg>
												</button>
												<button
													onClick={() => handleDeleteAttachment(attachment.attachment_id)}
													className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
													title={t("poPage.attachments.delete")}
												>
													<svg
														className="w-4 h-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
														/>
													</svg>
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Timestamps */}
						<div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
							<div>
								<span className="font-medium">{t("poPage.modal.createdAt")}:</span>
								{new Date(currentPO.created_at).toLocaleString()}
							</div>
							<div>
								<span className="font-medium">{t("poPage.modal.updatedAt")}:</span>
								{new Date(currentPO.updated_at).toLocaleString()}
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3 pt-2 flex-wrap">
							<Button
								onClick={handleCloseViewModal}
								title={t("poPage.actions.close")}
								className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
							/>
							{/* Submit for Approval - only for DRAFT */}
							{currentPO.status === "DRAFT" && (
								<Button
									onClick={() => {
										handleCloseViewModal();
										handleSubmitForApproval(currentPO);
									}}
									title={t("poPage.actions.submitForApproval")}
									icon={
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									}
									className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
								/>
							)}
							{/* Confirm - only for APPROVED */}
							{currentPO.status === "APPROVED" && (
								<Button
									onClick={() => {
										handleCloseViewModal();
										handleConfirmPO(currentPO);
									}}
									title={t("poPage.actions.confirm")}
									icon={
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
									}
									className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
								/>
							)}
							{/* Cancel - only for APPROVED */}
							{currentPO.status === "APPROVED" && (
								<Button
									onClick={() => {
										handleCloseViewModal();
										handleCancelPOClick(currentPO);
									}}
									title={t("poPage.actions.cancelPO")}
									icon={
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									}
									className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
								/>
							)}
							{/* Delete - only for DRAFT */}
							{currentPO.status === "DRAFT" && (
								<Button
									onClick={() => {
										handleCloseViewModal();
										handleDeleteClick(currentPO);
									}}
									title={t("poPage.actions.delete")}
									className="shadow-none hover:shadow-none flex-1 py-3 bg-white text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors font-medium"
								/>
							)}
						</div>
					</div>
				) : null}
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title={t("poPage.modal.deleteTitle")}
				message={t("poPage.modal.deleteMessage", { poNumber: poToDelete?.po_number })}
				confirmText={loading ? t("poPage.actions.deleting") : t("poPage.actions.delete")}
				cancelText={t("poPage.actions.cancel")}
				loading={loading}
				confirmColor="red"
			/>

			{/* Cancel PO Modal */}
			<SlideUpModal
				isOpen={isCancelModalOpen}
				onClose={handleDismissCancelPO}
				title={t("poPage.modal.cancelTitle")}
				maxWidth="600px"
			>
				<div className="p-4 space-y-6">
					<div>
						<p className="text-gray-700 mb-4">
							{t("poPage.modal.cancelMessage", { poNumber: poToCancel?.po_number })}
						</p>
						<FloatingLabelTextarea
							label={t("poPage.modal.cancellationReason")}
							name="cancellation_reason"
							value={cancellationReason}
							onChange={e => setCancellationReason(e.target.value)}
							rows={4}
							required
							placeholder={t("poPage.modal.cancellationReasonPlaceholder")}
						/>
					</div>

					<div className="flex gap-3">
						<Button
							onClick={handleDismissCancelPO}
							title={t("poPage.actions.close")}
							className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
						/>
						<Button
							onClick={handleConfirmCancelPO}
							disabled={loading}
							title={loading ? t("poPage.actions.cancelling") : t("poPage.actions.cancelPO")}
							className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
						/>
					</div>
				</div>
			</SlideUpModal>

			{/* Confirm Delete Attachment Modal */}
			<ConfirmModal
				isOpen={confirmDeleteAttachmentModal.isOpen}
				onClose={() => setConfirmDeleteAttachmentModal({ isOpen: false, attachmentId: null, fileName: "" })}
				onConfirm={confirmDeleteAttachment}
				title={t("poPage.attachments.deleteTitle")}
				message={t("poPage.attachments.deleteMessage", { fileName: confirmDeleteAttachmentModal.fileName })}
				confirmText={t("poPage.attachments.delete")}
				cancelText={t("common.cancel")}
				loading={deletingAttachment}
				confirmColor="red"
			/>
		</div>
	);
};

export default POPage;
