import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import ConfirmModal from "../components/shared/ConfirmModal";
import SlideUpModal from "../components/shared/SlideUpModal";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import Button from "../components/shared/Button";
import LoadingSpan from "../components/shared/LoadingSpan";
import {
	fetchWorkflowTemplates,
	fetchWorkflowTemplateDetails,
	deleteWorkflowTemplate,
	setPage,
	clearCurrentTemplate,
} from "../store/workflowTemplatesSlice";

// Workflow icon component
const WorkflowIcon = () => (
	<svg
		className="w-8 h-8"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M3 3h6v6H3zM15 3h6v6h-6zM9 15h6v6H9z" />
		<path d="M6 9v3h3M18 9v3h-3M12 9v6" />
	</svg>
);

const ApprovalWorkflowPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	// Get data from Redux
	const { templates, loading, detailsLoading, count, page, hasNext, hasPrevious, currentTemplate } = useSelector(
		state => state.workflowTemplates
	);

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [templateToDelete, setTemplateToDelete] = useState(null);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [localPageSize, setLocalPageSize] = useState(20);

	// Filter states
	const [filters, setFilters] = useState({
		is_active: "",
		content_type: "",
		code: "",
	});

	// Fetch templates on mount and when pagination/filter changes
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
		dispatch(fetchWorkflowTemplates(params));
	}, [dispatch, page, localPageSize, filters]);

	// Update browser title
	useEffect(() => {
		document.title = `${t("approvalWorkflow.title")} - LightERP`;
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
			header: t("approvalWorkflow.table.id"),
			accessor: "id",
			sortable: true,
			render: value => <span className="text-gray-600">#{value}</span>,
		},
		{
			header: t("approvalWorkflow.table.code"),
			accessor: "code",
			sortable: true,
			render: value => value || "-",
		},
		{
			header: t("approvalWorkflow.table.name"),
			accessor: "name",
			sortable: true,
			render: value => <span className="font-medium">{value || "-"}</span>,
		},
		{
			header: t("approvalWorkflow.table.contentType"),
			accessor: "content_type_details",
			render: value =>
				value ? (
					<span className="text-sm">
						{value.app_label} - {value.model_name}
					</span>
				) : (
					"-"
				),
		},
		{
			header: t("approvalWorkflow.table.status"),
			accessor: "is_active",
			render: value => (
				<span
					className={`px-3 py-1 rounded-full text-xs font-semibold ${
						value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
					}`}
				>
					{value ? t("approvalWorkflow.status.active") : t("approvalWorkflow.status.inactive")}
				</span>
			),
		},
		{
			header: t("approvalWorkflow.table.version"),
			accessor: "version",
			render: value => <span className="text-gray-600">v{value || 1}</span>,
		},
		{
			header: t("approvalWorkflow.table.stages"),
			accessor: "stage_count",
			render: value => (
				<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
					{value || 0} {t("approvalWorkflow.table.stagesLabel")}
				</span>
			),
		},
		{
			header: t("approvalWorkflow.table.instances"),
			accessor: "instance_count",
			render: value => value ?? 0,
		},
		{
			header: t("approvalWorkflow.table.createdAt"),
			accessor: "created_at",
			render: value => {
				if (!value) return "-";
				const date = new Date(value);
				return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
			},
		},
	];

	// Filter options
	const statusOptions = [
		{ value: "", label: t("approvalWorkflow.filters.allStatuses") },
		{ value: "true", label: t("approvalWorkflow.status.active") },
		{ value: "false", label: t("approvalWorkflow.status.inactive") },
	];

	// Filter handlers
	const handleFilterChange = e => {
		const { name, value } = e.target;
		setFilters(prev => ({ ...prev, [name]: value }));
		dispatch(setPage(1)); // Reset to first page when filter changes
	};

	const handleClearFilters = () => {
		setFilters({
			is_active: "",
			content_type: "",
			code: "",
		});
		dispatch(setPage(1));
	};

	const handleView = async template => {
		try {
			await dispatch(fetchWorkflowTemplateDetails(template.id)).unwrap();
			setIsViewModalOpen(true);
		} catch (error) {
			toast.error(error || t("approvalWorkflow.messages.fetchError"));
		}
	};

	const handleCloseViewModal = () => {
		setIsViewModalOpen(false);
		dispatch(clearCurrentTemplate());
	};

	const handleDeleteClick = template => {
		setTemplateToDelete(template);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!templateToDelete) return;

		try {
			await dispatch(deleteWorkflowTemplate(templateToDelete.id)).unwrap();
			toast.success(t("approvalWorkflow.messages.deleteSuccess"));
			setIsDeleteModalOpen(false);
			setTemplateToDelete(null);
			// Refresh after delete
			dispatch(fetchWorkflowTemplates({ page, page_size: localPageSize }));
		} catch (error) {
			toast.error(error || t("approvalWorkflow.messages.deleteError"));
		}
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
		setTemplateToDelete(null);
	};

	// Show delete button only if no instances are using this template
	const showDeleteButton = row => {
		return row.instance_count === 0;
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Page Header */}
			<PageHeader
				icon={<WorkflowIcon />}
				title={t("approvalWorkflow.title")}
				subtitle={t("approvalWorkflow.subtitle")}
			/>

			{/* Filters Section */}
			<div className="px-6 mt-6">
				<div className="bg-white rounded-2xl shadow-lg p-6 border border-dashed border-gray-300">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
						<FloatingLabelInput
							label={t("approvalWorkflow.filters.code")}
							type="text"
							name="code"
							value={filters.code}
							onChange={handleFilterChange}
							placeholder={t("approvalWorkflow.filters.codePlaceholder")}
						/>
						<FloatingLabelInput
							label={t("approvalWorkflow.filters.contentType")}
							type="text"
							name="content_type"
							value={filters.content_type}
							onChange={handleFilterChange}
							placeholder={t("approvalWorkflow.filters.contentTypePlaceholder")}
						/>
						<FloatingLabelSelect
							label={t("approvalWorkflow.filters.status")}
							name="is_active"
							value={filters.is_active}
							onChange={handleFilterChange}
							options={statusOptions}
							searchable={false}
						/>
						{/* Buttons */}
						<div className="flex gap-3 justify-end">
							<Button variant="outline" onClick={handleClearFilters}>
								{t("approvalWorkflow.filters.reset")}
							</Button>
							<Button variant="primary" onClick={() => dispatch(setPage(1))}>
								{t("approvalWorkflow.filters.applyFilters")}
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
							data={templates}
							onView={handleView}
							onDelete={handleDeleteClick}
							showEditButton={() => false}
							showDeleteButton={showDeleteButton}
							emptyMessage={t("approvalWorkflow.emptyMessage")}
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
				title={t("approvalWorkflow.modals.deleteTitle")}
				message={t("approvalWorkflow.modals.deleteMessage", {
					name: templateToDelete?.name || t("approvalWorkflow.modals.thisTemplate"),
				})}
				confirmText={t("approvalWorkflow.modals.delete")}
				cancelText={t("approvalWorkflow.modals.cancel")}
			/>

			{/* View Details Modal */}
			<SlideUpModal
				isOpen={isViewModalOpen}
				onClose={handleCloseViewModal}
				title={t("approvalWorkflow.modals.viewTitle")}
				maxWidth="800px"
			>
				{detailsLoading ? (
					<div className="flex justify-center items-center py-12">
						<LoadingSpan />
					</div>
				) : currentTemplate ? (
					<div className="space-y-6">
						{/* Basic Info */}
						<div className="bg-gray-50 rounded-xl p-4">
							<h3 className="text-lg font-semibold text-gray-800 mb-4">
								{t("approvalWorkflow.details.basicInfo")}
							</h3>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<span className="text-sm text-gray-500">{t("approvalWorkflow.table.code")}</span>
									<p className="font-medium">{currentTemplate.code || "-"}</p>
								</div>
								<div>
									<span className="text-sm text-gray-500">{t("approvalWorkflow.table.name")}</span>
									<p className="font-medium">{currentTemplate.name}</p>
								</div>
								<div>
									<span className="text-sm text-gray-500">
										{t("approvalWorkflow.table.contentType")}
									</span>
									<p className="font-medium">
										{currentTemplate.content_type_details
											? `${currentTemplate.content_type_details.app_label}.${currentTemplate.content_type_details.model_name}`
											: "-"}
									</p>
								</div>
								<div>
									<span className="text-sm text-gray-500">{t("approvalWorkflow.table.status")}</span>
									<p>
										<span
											className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
												currentTemplate.is_active
													? "bg-green-100 text-green-800"
													: "bg-gray-100 text-gray-800"
											}`}
										>
											{currentTemplate.status_display ||
												(currentTemplate.is_active
													? t("approvalWorkflow.status.active")
													: t("approvalWorkflow.status.inactive"))}
										</span>
									</p>
								</div>
								<div>
									<span className="text-sm text-gray-500">{t("approvalWorkflow.table.version")}</span>
									<p className="font-medium">v{currentTemplate.version || 1}</p>
								</div>
								<div>
									<span className="text-sm text-gray-500">
										{t("approvalWorkflow.table.instances")}
									</span>
									<p className="font-medium">{currentTemplate.instance_count || 0}</p>
								</div>
							</div>
							{currentTemplate.description && (
								<div className="mt-4">
									<span className="text-sm text-gray-500">
										{t("approvalWorkflow.details.description")}
									</span>
									<p className="font-medium">{currentTemplate.description}</p>
								</div>
							)}
						</div>

						{/* Stages */}
						<div className="bg-gray-50 rounded-xl p-4">
							<h3 className="text-lg font-semibold text-gray-800 mb-4">
								{t("approvalWorkflow.details.stages")} ({currentTemplate.stage_count || 0})
							</h3>
							{currentTemplate.stages && currentTemplate.stages.length > 0 ? (
								<div className="space-y-3">
									{currentTemplate.stages.map((stage, index) => (
										<div
											key={stage.id}
											className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
										>
											<div className="flex items-start gap-4">
												{/* Stage Number */}
												<div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
													{stage.order_index}
												</div>

												{/* Stage Details */}
												<div className="flex-1">
													<div className="flex items-center justify-between mb-2">
														<h4 className="font-semibold text-gray-800">{stage.name}</h4>
														<span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
															{stage.policy_display}
														</span>
													</div>

													<div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
														<div>
															<span className="text-gray-500">
																{t("approvalWorkflow.details.requiredRole")}:
															</span>
															<p className="font-medium">
																{stage.required_role_name || "-"}
															</p>
														</div>
														<div>
															<span className="text-gray-500">
																{t("approvalWorkflow.details.decisionPolicy")}:
															</span>
															<p className="font-medium">{stage.decision_policy}</p>
														</div>
														<div>
															<span className="text-gray-500">
																{t("approvalWorkflow.details.allowReject")}:
															</span>
															<p
																className={`font-medium ${
																	stage.allow_reject
																		? "text-green-600"
																		: "text-red-600"
																}`}
															>
																{stage.allow_reject ? t("common.yes") : t("common.no")}
															</p>
														</div>
														<div>
															<span className="text-gray-500">
																{t("approvalWorkflow.details.allowDelegate")}:
															</span>
															<p
																className={`font-medium ${
																	stage.allow_delegate
																		? "text-green-600"
																		: "text-red-600"
																}`}
															>
																{stage.allow_delegate
																	? t("common.yes")
																	: t("common.no")}
															</p>
														</div>
													</div>

													{stage.sla_hours && (
														<div className="mt-2 text-sm">
															<span className="text-gray-500">
																{t("approvalWorkflow.details.slaHours")}:
															</span>
															<span className="font-medium ms-1">
																{stage.sla_hours} {t("approvalWorkflow.details.hours")}
															</span>
														</div>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<p className="text-gray-500 text-center py-4">
									{t("approvalWorkflow.details.noStages")}
								</p>
							)}
						</div>

						{/* Timestamps */}
						<div className="flex justify-between text-sm text-gray-500 pt-4 border-t">
							<span>
								{t("approvalWorkflow.details.createdAt")}:{" "}
								{currentTemplate.created_at
									? new Date(currentTemplate.created_at).toLocaleString()
									: "-"}
							</span>
							<span>
								{t("approvalWorkflow.details.updatedAt")}:{" "}
								{currentTemplate.updated_at
									? new Date(currentTemplate.updated_at).toLocaleString()
									: "-"}
							</span>
						</div>
					</div>
				) : (
					<p className="text-center text-gray-500 py-8">{t("approvalWorkflow.messages.noData")}</p>
				)}
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

export default ApprovalWorkflowPage;
