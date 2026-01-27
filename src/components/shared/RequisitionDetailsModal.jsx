import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import api from "../../api/axios";
import SlideUpModal from "./SlideUpModal";
import ConfirmModal from "./ConfirmModal";

const InfoRow = ({ label, value, className = "" }) => (
	<div className={`flex justify-between text-sm text-gray-700 py-1 ${className}`}>
		<span className="font-medium text-gray-600">{label}</span>
		<span>{value ?? "-"}</span>
	</div>
);

const StatusBadge = ({ value }) => {
	const colors = {
		DRAFT: "bg-gray-100 text-gray-800",
		PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
		APPROVED: "bg-green-100 text-green-800",
		REJECTED: "bg-red-100 text-red-800",
	};

	return (
		<span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${colors[value] || colors.DRAFT}`}>
			{value || "DRAFT"}
		</span>
	);
};

const PriorityBadge = ({ value }) => {
	const colors = {
		LOW: "bg-blue-100 text-blue-800",
		MEDIUM: "bg-yellow-100 text-yellow-800",
		HIGH: "bg-orange-100 text-orange-800",
		URGENT: "bg-red-100 text-red-800",
	};

	return (
		<span
			className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
				colors[value] || "bg-gray-100 text-gray-800"
			}`}
		>
			{value || "-"}
		</span>
	);
};

const PrTypeBadge = ({ value }) => {
	const colors = {
		Catalog: "bg-blue-100 text-blue-800",
		"Non-Catalog": "bg-purple-100 text-purple-800",
		Service: "bg-green-100 text-green-800",
	};

	return (
		<span
			className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
				colors[value] || "bg-gray-100 text-gray-800"
			}`}
		>
			{value || "-"}
		</span>
	);
};

// PR Type endpoints mapping
const PR_TYPE_ENDPOINTS = {
	Catalog: "/procurement/pr/catalog/",
	"Non-Catalog": "/procurement/pr/non-catalog/",
	Service: "/procurement/pr/service/",
};

const RequisitionDetailsModal = ({ isOpen, requisitionId, prType, onClose }) => {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [requisition, setRequisition] = useState(null);
	const [showAttachmentForm, setShowAttachmentForm] = useState(false);
	const [attachments, setAttachments] = useState([]);
	const [loadingAttachments, setLoadingAttachments] = useState(false);
	const [uploadingAttachment, setUploadingAttachment] = useState(false);
	const [deletingAttachment, setDeletingAttachment] = useState(false);
	const [confirmDeleteModal, setConfirmDeleteModal] = useState({ isOpen: false, attachmentId: null, fileName: "" });
	const fileInputRef = useRef(null);
	const [attachmentForm, setAttachmentForm] = useState({
		file: null,
		file_type: "",
		description: "",
		file_name: "",
	});

	useEffect(() => {
		if (!isOpen || !requisitionId || !prType) return;

		const fetchRequisition = async () => {
			setLoading(true);
			setError(null);
			try {
				const endpoint = PR_TYPE_ENDPOINTS[prType];
				if (!endpoint) {
					throw new Error("Invalid PR type");
				}
				const { data } = await api.get(`${endpoint}${requisitionId}/`);
				const payload = data?.data ?? data;
				setRequisition({ ...payload, pr_type: prType });
			} catch (err) {
				const message =
					err.response?.data?.message ||
					err.response?.data?.error ||
					err.response?.data?.detail ||
					err.message ||
					t("requisitions.errors.loadFailed");
				setError(message);
			} finally {
				setLoading(false);
			}
		};

		fetchRequisition();
	}, [requisitionId, prType, isOpen, t]);

	// Fetch attachments
	useEffect(() => {
		if (!isOpen || !requisitionId) return;

		const fetchAttachments = async () => {
			setLoadingAttachments(true);
			try {
				const { data } = await api.get(`/procurement/pr/${requisitionId}/attachments/`);
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
	}, [requisitionId, isOpen]);

	// Reset state when modal closes
	useEffect(() => {
		if (!isOpen) {
			setRequisition(null);
			setError(null);
			setShowAttachmentForm(false);
			setAttachments([]);
			setConfirmDeleteModal({ isOpen: false, attachmentId: null, fileName: "" });
			setAttachmentForm({
				file: null,
				file_type: "",
				description: "",
				file_name: "",
			});
		}
	}, [isOpen]);

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
			toast.error(t("requisitions.attachments.errors.noFile"));
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

			await api.post(`/procurement/pr/${requisitionId}/attachments/`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			toast.success(t("requisitions.attachments.messages.uploadSuccess"));

			// Refresh attachments list
			const { data } = await api.get(`/procurement/pr/${requisitionId}/attachments/`);
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
				t("requisitions.attachments.errors.uploadFailed");
			toast.error(message, { autoClose: 8000 });
		} finally {
			setUploadingAttachment(false);
		}
	};

	const handleDeleteAttachment = (attachmentId, fileName) => {
		setConfirmDeleteModal({ isOpen: true, attachmentId, fileName });
	};

	const confirmDeleteAttachment = async () => {
		setDeletingAttachment(true);
		try {
			await api.delete(`/procurement/pr/attachments/${confirmDeleteModal.attachmentId}/`);
			toast.success(t("requisitions.attachments.messages.deleteSuccess"));

			// Refresh attachments list
			const { data } = await api.get(`/procurement/pr/${requisitionId}/attachments/`);
			const attachmentsList = data?.data ?? data?.results ?? data ?? [];
			setAttachments(Array.isArray(attachmentsList) ? attachmentsList : []);
			setConfirmDeleteModal({ isOpen: false, attachmentId: null, fileName: "" });
		} catch (err) {
			const message =
				err.response?.data?.message ||
				err.response?.data?.error ||
				err.response?.data?.detail ||
				err.message ||
				t("requisitions.attachments.errors.deleteFailed");
			toast.error(message, { autoClose: 8000 });
		} finally {
			setDeletingAttachment(false);
		}
	};

	const handleDownloadAttachment = async (attachmentId, fileName) => {
		try {
			const { data } = await api.get(`/procurement/pr/${requisitionId}/attachments/${attachmentId}/`, {
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
			toast.error(t("requisitions.attachments.errors.downloadFailed"), { autoClose: 8000 });
		}
	};

	const formatCurrency = value => {
		if (value === null || value === undefined) return "-";
		return `$${parseFloat(value).toLocaleString()}`;
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

	const formatDate = dateString => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<SlideUpModal
			isOpen={isOpen}
			onClose={onClose}
			title={`${t("requisitions.details.title")} ${requisition?.pr_number || `#${requisitionId}` || ""}`}
			maxWidth="1100px"
		>
			<div className="space-y-6 pb-6">
				{/* Attachment Actions Bar */}
				{!loading && !error && requisition && (
					<div className="flex gap-3 border-b border-gray-200 pb-4">
						<button
							onClick={() => setShowAttachmentForm(!showAttachmentForm)}
							className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
							{t("requisitions.attachments.uploadAttachment")}
						</button>
						<button
							onClick={() => {
								const attachmentsSection = document.getElementById("attachments-section");
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
							{t("requisitions.attachments.viewAttachments")}
							{attachments.length > 0 && (
								<span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-blue-500 rounded-full">
									{attachments.length}
								</span>
							)}
						</button>
					</div>
				)}

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
								{t("requisitions.attachments.uploadAttachment")}
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
									{t("requisitions.attachments.selectFile")}
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
										{attachmentForm.file.name} ({(attachmentForm.file.size / 1024).toFixed(2)} KB)
									</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("requisitions.attachments.description")}
								</label>
								<textarea
									value={attachmentForm.description}
									onChange={e =>
										setAttachmentForm(prev => ({ ...prev, description: e.target.value }))
									}
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
									placeholder={t("requisitions.attachments.descriptionPlaceholder")}
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
											{t("requisitions.attachments.uploading")}
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
											{t("requisitions.attachments.upload")}
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

				{loading && (
					<div className="flex items-center justify-center py-12">
						<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#28819C]"></div>
						<span className="ml-3 text-gray-500">{t("common.loading")}</span>
					</div>
				)}

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
						<p className="text-red-600 text-sm">{error}</p>
					</div>
				)}

				{!loading && !error && requisition && (
					<>
						{/* Summary Cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{/* PR Info Card */}
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-[#28819C] mb-3 flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
									{t("requisitions.details.prInfo")}
								</h3>
								<InfoRow
									label={t("requisitions.details.prNumber")}
									value={requisition.pr_number || `PR-${requisition.pr_id}`}
								/>
								<InfoRow label={t("requisitions.details.date")} value={formatDate(requisition.date)} />
								<InfoRow
									label={t("requisitions.details.requiredDate")}
									value={formatDate(requisition.required_date)}
								/>
								<div className="flex justify-between items-center py-1">
									<span className="text-sm font-medium text-gray-600">
										{t("requisitions.details.prType")}
									</span>
									<PrTypeBadge value={requisition.pr_type} />
								</div>
							</div>

							{/* Requester Info Card */}
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-[#28819C] mb-3 flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
									{t("requisitions.details.requesterInfo")}
								</h3>
								<InfoRow
									label={t("requisitions.details.requesterName")}
									value={requisition.requester_name}
								/>
								<InfoRow
									label={t("requisitions.details.department")}
									value={requisition.requester_department}
								/>
								<InfoRow label={t("requisitions.details.email")} value={requisition.requester_email} />
							</div>

							{/* Status Card */}
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-[#28819C] mb-3 flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									{t("requisitions.details.statusInfo")}
								</h3>
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">
											{t("requisitions.details.status")}
										</span>
										<StatusBadge value={requisition.status} />
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">
											{t("requisitions.details.priority")}
										</span>
										<PriorityBadge value={requisition.priority} />
									</div>
									<div className="border-t border-gray-200 mt-2 pt-2">
										<InfoRow
											label={t("requisitions.details.total")}
											value={formatCurrency(requisition.total)}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Description & Notes */}
						{(requisition.description || requisition.notes) && (
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-[#28819C] mb-3 flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 6h16M4 12h16M4 18h7"
										/>
									</svg>
									{t("requisitions.details.descriptionNotes")}
								</h3>
								{requisition.description && (
									<div className="mb-3">
										<p className="text-xs font-medium text-gray-500 mb-1">
											{t("requisitions.details.description")}
										</p>
										<p className="text-sm text-gray-700">{requisition.description}</p>
									</div>
								)}
								{requisition.notes && (
									<div>
										<p className="text-xs font-medium text-gray-500 mb-1">
											{t("requisitions.details.notes")}
										</p>
										<p className="text-sm text-gray-700">{requisition.notes}</p>
									</div>
								)}
							</div>
						)}

						{/* Line Items */}
						{requisition.items && requisition.items.length > 0 && (
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-[#28819C] mb-4 flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
										/>
									</svg>
									{t("requisitions.details.lineItems")} ({requisition.items.length})
								</h3>
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													#
												</th>
												<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													{t("requisitions.details.itemName")}
												</th>
												<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													{t("requisitions.details.itemDescription")}
												</th>
												<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
													{t("requisitions.details.quantity")}
												</th>
												<th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
													{t("requisitions.details.uom")}
												</th>
												<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
													{t("requisitions.details.unitPrice")}
												</th>
												<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
													{t("requisitions.details.totalPrice")}
												</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-200">
											{requisition.items.map((item, index) => (
												<tr key={item.id || index} className="hover:bg-gray-50">
													<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
														{item.line_number || index + 1}
													</td>
													<td className="px-4 py-3 text-sm font-medium text-gray-900">
														{item.item_name || "-"}
													</td>
													<td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
														{item.item_description || "-"}
													</td>
													<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
														{parseFloat(item.quantity || 0).toLocaleString()}
													</td>
													<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
														{item.unit_of_measure_code || "-"}
													</td>
													<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
														{formatCurrency(item.estimated_unit_price)}
													</td>
													<td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
														{formatCurrency(item.total_price_per_item)}
													</td>
												</tr>
											))}
										</tbody>
										<tfoot className="bg-gray-50">
											<tr>
												<td
													colSpan="6"
													className="px-4 py-3 text-sm font-semibold text-gray-900 text-right"
												>
													{t("requisitions.details.grandTotal")}:
												</td>
												<td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-[#28819C] text-right">
													{formatCurrency(requisition.total)}
												</td>
											</tr>
										</tfoot>
									</table>
								</div>
							</div>
						)}

						{/* Empty Items Message */}
						{(!requisition.items || requisition.items.length === 0) && (
							<div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
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
										d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
									/>
								</svg>
								<p className="text-gray-500">{t("requisitions.details.noItems")}</p>
							</div>
						)}

						{/* Approval History */}
						{(requisition.submitted_for_approval_at ||
							requisition.approved_at ||
							requisition.rejected_at) && (
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-[#28819C] mb-3 flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									{t("requisitions.details.approvalHistory")}
								</h3>
								<div className="space-y-2">
									{requisition.submitted_for_approval_at && (
										<InfoRow
											label={t("requisitions.details.submittedAt")}
											value={formatDateTime(requisition.submitted_for_approval_at)}
										/>
									)}
									{requisition.approved_at && (
										<>
											<InfoRow
												label={t("requisitions.details.approvedAt")}
												value={formatDateTime(requisition.approved_at)}
											/>
											{requisition.approved_by && (
												<InfoRow
													label={t("requisitions.details.approvedBy")}
													value={requisition.approved_by}
												/>
											)}
										</>
									)}
									{requisition.rejected_at && (
										<>
											<InfoRow
												label={t("requisitions.details.rejectedAt")}
												value={formatDateTime(requisition.rejected_at)}
											/>
											{requisition.rejected_by && (
												<InfoRow
													label={t("requisitions.details.rejectedBy")}
													value={requisition.rejected_by}
												/>
											)}
											{requisition.rejection_reason && (
												<div className="mt-2 p-3 bg-red-50 rounded-lg">
													<p className="text-xs font-medium text-red-600 mb-1">
														{t("requisitions.details.rejectionReason")}
													</p>
													<p className="text-sm text-red-700">
														{requisition.rejection_reason}
													</p>
												</div>
											)}
										</>
									)}
								</div>
							</div>
						)}

						{/* Attachments Section */}
						<div
							id="attachments-section"
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
								{t("requisitions.attachments.title")} ({attachments.length})
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
									<p className="text-gray-500 text-sm">
										{t("requisitions.attachments.noAttachments")}
									</p>
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
													title={t("requisitions.attachments.download")}
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
													title={t("requisitions.attachments.delete")}
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
						<div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
							<div className="flex flex-wrap gap-6 justify-between text-xs text-gray-500">
								<div>
									<span className="font-medium">{t("requisitions.details.createdAt")}:</span>
									{formatDateTime(requisition.created_at)}
								</div>
								<div>
									<span className="font-medium">{t("requisitions.details.updatedAt")}:</span>
									{formatDateTime(requisition.updated_at)}
								</div>
							</div>
						</div>
					</>
				)}
			</div>

			{/* Confirm Delete Modal */}
			<ConfirmModal
				isOpen={confirmDeleteModal.isOpen}
				onClose={() => setConfirmDeleteModal({ isOpen: false, attachmentId: null, fileName: "" })}
				onConfirm={confirmDeleteAttachment}
				title={t("requisitions.attachments.deleteTitle")}
				message={t("requisitions.attachments.deleteMessage", { fileName: confirmDeleteModal.fileName })}
				confirmText={t("requisitions.attachments.delete")}
				cancelText={t("common.cancel")}
				loading={deletingAttachment}
				confirmColor="red"
			/>
		</SlideUpModal>
	);
};

export default RequisitionDetailsModal;
