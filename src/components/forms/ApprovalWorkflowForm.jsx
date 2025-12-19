import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import Card from "../shared/Card";
import FloatingLabelInput from "../shared/FloatingLabelInput";
import FloatingLabelSelect from "../shared/FloatingLabelSelect";
import Button from "../shared/Button";
import Toggle from "../shared/Toggle";
import SlideUpModal from "../shared/SlideUpModal";
import { createWorkflowTemplate, fetchContentTypes } from "../../store/workflowTemplatesSlice";
import { fetchJobRoles } from "../../store/jobRolesSlice";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const DECISION_POLICIES = [
	{ value: "ANY", label: "Any (First approval wins)" },
	{ value: "ALL", label: "All (Everyone must approve)" },
	{ value: "QUORUM", label: "Quorum (Minimum required)" },
];

const ApprovalWorkflowForm = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const { loading, contentTypes } = useSelector(state => state.workflowTemplates);
	const { jobRoles } = useSelector(state => state.jobRoles);

	// Workflow form state
	const [workflowForm, setWorkflowForm] = useState({
		code: "",
		name: "",
		description: "",
		content_type: "",
		version: "1",
		is_active: true,
	});

	// Stages state
	const [stages, setStages] = useState([]);

	// Stage modal state
	const [isStageModalOpen, setIsStageModalOpen] = useState(false);
	const [editingStage, setEditingStage] = useState(null);
	const [stageForm, setStageForm] = useState({
		name: "",
		decision_policy: "ANY",
		quorum_count: "",
		required_role: "",
		dynamic_filter_json: "",
		allow_reject: true,
		allow_delegate: true,
		sla_hours: "48",
		parallel_group: "",
	});

	// Fetch required data on mount
	useEffect(() => {
		dispatch(fetchContentTypes());
		dispatch(fetchJobRoles());
	}, [dispatch]);

	// Content type options
	const contentTypeOptions = contentTypes.map(ct => ({
		value: ct.id,
		label: `${ct.app_label} - ${ct.model_name}`,
	}));

	// Job role options
	const jobRoleOptions = (jobRoles || []).map(role => ({
		value: role.id,
		label: role.name || `Role ${role.id}`,
	}));

	const handleWorkflowChange = e => {
		const { name, value } = e.target;
		setWorkflowForm(prev => ({ ...prev, [name]: value }));
	};

	const handleActiveToggle = () => {
		setWorkflowForm(prev => ({ ...prev, is_active: !prev.is_active }));
	};

	const handleStageFormChange = e => {
		const { name, value, type, checked } = e.target;
		setStageForm(prev => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const openAddStageModal = () => {
		setEditingStage(null);
		setStageForm({
			name: "",
			decision_policy: "ANY",
			quorum_count: "",
			required_role: "",
			dynamic_filter_json: "",
			allow_reject: true,
			allow_delegate: true,
			sla_hours: "48",
			parallel_group: "",
		});
		setIsStageModalOpen(true);
	};

	const openEditStageModal = (stage, index) => {
		setEditingStage(index);
		setStageForm({
			name: stage.name || "",
			decision_policy: stage.decision_policy || "ANY",
			quorum_count: stage.quorum_count?.toString() || "",
			required_role: stage.required_role?.toString() || "",
			dynamic_filter_json: stage.dynamic_filter_json || "",
			allow_reject: stage.allow_reject ?? true,
			allow_delegate: stage.allow_delegate ?? true,
			sla_hours: stage.sla_hours?.toString() || "48",
			parallel_group: stage.parallel_group?.toString() || "",
		});
		setIsStageModalOpen(true);
	};

	const handleSaveStage = () => {
		if (!stageForm.name) {
			toast.error(t("approvalWorkflow.form.stageNameRequired"));
			return;
		}

		const newStage = {
			order_index: editingStage !== null ? stages[editingStage].order_index : stages.length + 1,
			name: stageForm.name,
			decision_policy: stageForm.decision_policy,
			quorum_count: stageForm.decision_policy === "QUORUM" ? parseInt(stageForm.quorum_count) || null : null,
			required_role: stageForm.required_role ? parseInt(stageForm.required_role) : null,
			dynamic_filter_json: stageForm.dynamic_filter_json || "",
			allow_reject: stageForm.allow_reject,
			allow_delegate: stageForm.allow_delegate,
			sla_hours: parseInt(stageForm.sla_hours) || 48,
			parallel_group: stageForm.parallel_group ? parseInt(stageForm.parallel_group) : null,
		};

		if (editingStage !== null) {
			// Update existing stage
			setStages(prev => prev.map((stage, idx) => (idx === editingStage ? newStage : stage)));
		} else {
			// Add new stage
			setStages(prev => [...prev, newStage]);
		}

		setIsStageModalOpen(false);
		toast.success(
			editingStage !== null ? t("approvalWorkflow.form.stageUpdated") : t("approvalWorkflow.form.stageAdded")
		);
	};

	const handleDeleteStage = index => {
		setStages(prev => {
			const updated = prev.filter((_, idx) => idx !== index);
			// Re-index order_index
			return updated.map((stage, idx) => ({ ...stage, order_index: idx + 1 }));
		});
		toast.success(t("approvalWorkflow.form.stageDeleted"));
	};

	const handleCancel = () => {
		navigate(-1);
	};

	const handleSubmit = async e => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		// Validate required fields
		if (!workflowForm.code || !workflowForm.name || !workflowForm.content_type) {
			toast.error(t("approvalWorkflow.form.requiredFields"));
			return;
		}

		if (stages.length === 0) {
			toast.error(t("approvalWorkflow.form.noStages"));
			return;
		}

		// Prepare workflow data
		const workflowData = {
			code: workflowForm.code,
			name: workflowForm.name,
			description: workflowForm.description || "",
			content_type: parseInt(workflowForm.content_type),
			is_active: workflowForm.is_active,
			version: parseInt(workflowForm.version) || 1,
			stages: stages,
		};

		try {
			console.log("Submitting workflow:", workflowData);
			const result = await dispatch(createWorkflowTemplate(workflowData)).unwrap();
			console.log("Workflow created:", result);
			toast.success(t("approvalWorkflow.form.createSuccess"));
			navigate("/approval-workflow");
		} catch (error) {
			console.error("Create workflow error:", error);
			let message = t("approvalWorkflow.form.createFailed");
			if (typeof error === "string") {
				message = error;
			} else if (error?.message) {
				message = error.message;
			}
			toast.error(message, { autoClose: 8000 });
		}
	};

	// Get role name by ID
	const getRoleName = roleId => {
		const role = jobRoles?.find(r => r.id === roleId);
		return role?.name || t("approvalWorkflow.form.requiredRole");
	};

	return (
		<div className="max-w-6xl mx-auto mt-5 pb-10 space-y-5">
			{/* Header with Cancel and Create buttons */}
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-[#28819C]">{t("approvalWorkflow.form.title")}</h1>
				<div className="flex gap-3">
					<Button variant="outline" onClick={handleCancel}>
						{t("common.cancel")}
					</Button>
					<Button variant="primary" onClick={handleSubmit} disabled={loading}>
						{loading ? t("approvalWorkflow.form.creating") : t("approvalWorkflow.form.createWorkflow")}
					</Button>
				</div>
			</div>

			{/* Workflow Information */}
			<Card
				title={t("approvalWorkflow.form.workflowInfo")}
				actionSlot={
					<div className="flex items-center gap-2">
						<span className="text-sm text-gray-600">{t("approvalWorkflow.form.active")}</span>
						<button
							type="button"
							onClick={handleActiveToggle}
							className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
								workflowForm.is_active ? "bg-[#28819C]" : "bg-gray-300"
							}`}
						>
							<span
								className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
									workflowForm.is_active ? "translate-x-6" : "translate-x-1"
								}`}
							/>
						</button>
					</div>
				}
			>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<FloatingLabelInput
						label={t("approvalWorkflow.form.code")}
						name="code"
						value={workflowForm.code}
						onChange={handleWorkflowChange}
						required
						placeholder={t("approvalWorkflow.form.codePlaceholder")}
					/>
					<FloatingLabelInput
						label={t("approvalWorkflow.form.workflowName")}
						name="name"
						value={workflowForm.name}
						onChange={handleWorkflowChange}
						required
						placeholder={t("approvalWorkflow.form.workflowNamePlaceholder")}
					/>
					<FloatingLabelSelect
						label={t("approvalWorkflow.form.contentType")}
						name="content_type"
						value={workflowForm.content_type}
						onChange={handleWorkflowChange}
						options={contentTypeOptions}
						required
						placeholder={t("approvalWorkflow.form.selectContentType")}
					/>
					<FloatingLabelInput
						label={t("approvalWorkflow.form.version")}
						name="version"
						type="number"
						value={workflowForm.version}
						onChange={handleWorkflowChange}
						placeholder={t("approvalWorkflow.form.versionPlaceholder")}
					/>
				</div>
				<div className="mt-4">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						{t("approvalWorkflow.form.description")}
					</label>
					<textarea
						name="description"
						value={workflowForm.description}
						onChange={handleWorkflowChange}
						rows={4}
						className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-[#48C1F0] resize-none"
						placeholder={t("approvalWorkflow.form.descriptionPlaceholder")}
					/>
				</div>
			</Card>

			{/* Approval Stages */}
			<Card
				title={t("approvalWorkflow.form.approvalStages")}
				actionSlot={
					<button
						type="button"
						onClick={openAddStageModal}
						className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#28819C] text-white text-sm font-semibold hover:bg-[#1e6b82] transition-colors"
					>
						<FaPlus className="w-3 h-3" />
						{t("approvalWorkflow.form.addStage")}
					</button>
				}
			>
				{stages.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-[#b6c4cc] bg-[#f5f8fb] p-8 text-center text-[#567086]">
						<p className="text-lg font-semibold mb-2">{t("approvalWorkflow.form.noStages")}</p>
						<p className="text-sm mb-6">{t("approvalWorkflow.form.noStagesDesc")}</p>
						<Button
							type="button"
							onClick={openAddStageModal}
							className="px-4 py-2 rounded-full bg-[#0d5f7a] text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform"
							title={t("approvalWorkflow.form.addFirstStage")}
						/>
					</div>
				) : (
					<div className="space-y-4">
						{stages.map((stage, index) => (
							<div
								key={index}
								className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
							>
								{/* Stage Number */}
								<div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#28819C]/10 flex items-center justify-center">
									<span className="text-lg font-bold text-[#28819C]">#{stage.order_index}</span>
								</div>

								{/* Stage Info */}
								<div className="flex-1 min-w-0">
									<h4 className="text-base font-semibold text-[#28819C]">{stage.name}</h4>
									<p className="text-sm text-gray-500">
										{stage.decision_policy} • {getRoleName(stage.required_role)} •{" "}
										{stage.required_role
											? t("approvalWorkflow.form.requiredLevel")
											: t("approvalWorkflow.form.requiredLevel")}
									</p>
									<p className="text-xs text-gray-400 mt-1">
										{t("approvalWorkflow.form.sla")}: {stage.sla_hours}H
									</p>
								</div>

								{/* Actions */}
								<div className="flex-shrink-0 flex items-center gap-2">
									<button
										type="button"
										onClick={() => openEditStageModal(stage, index)}
										className="p-2 text-gray-500 hover:text-[#28819C] hover:bg-white rounded-lg transition-colors"
									>
										<FaEdit className="w-4 h-4" />
									</button>
									<button
										type="button"
										onClick={() => handleDeleteStage(index)}
										className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
									>
										<FaTrash className="w-4 h-4" />
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</Card>

			{/* Stage Modal */}
			<SlideUpModal
				isOpen={isStageModalOpen}
				onClose={() => setIsStageModalOpen(false)}
				title={
					editingStage !== null ? t("approvalWorkflow.form.editStage") : t("approvalWorkflow.form.addStage")
				}
			>
				<div className="space-y-4 p-4">
					{/* Row 1: Stage Order & Stage Name */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("approvalWorkflow.form.stageOrder")}
							name="order_index"
							type="number"
							value={editingStage !== null ? stages[editingStage]?.order_index : stages.length + 1}
							disabled
							placeholder={t("approvalWorkflow.form.stageOrderPlaceholder")}
						/>
						<FloatingLabelInput
							label={t("approvalWorkflow.form.stageName")}
							name="name"
							value={stageForm.name}
							onChange={handleStageFormChange}
							required
							placeholder={t("approvalWorkflow.form.stageNamePlaceholder")}
						/>
					</div>

					{/* Row 2: Decision Policy & Required Role */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<FloatingLabelSelect
							label={t("approvalWorkflow.form.decisionPolicy")}
							name="decision_policy"
							value={stageForm.decision_policy}
							onChange={handleStageFormChange}
							options={DECISION_POLICIES}
						/>
						<FloatingLabelSelect
							label={t("approvalWorkflow.form.requiredRole")}
							name="required_role"
							value={stageForm.required_role}
							onChange={handleStageFormChange}
							options={[{ value: "", label: t("approvalWorkflow.form.selectRole") }, ...jobRoleOptions]}
							placeholder={t("approvalWorkflow.form.selectRole")}
						/>
					</div>

					{/* Quorum Count (only visible when QUORUM policy is selected) */}
					{stageForm.decision_policy === "QUORUM" && (
						<FloatingLabelInput
							label={t("approvalWorkflow.form.quorumCount")}
							name="quorum_count"
							type="number"
							value={stageForm.quorum_count}
							onChange={handleStageFormChange}
							placeholder={t("approvalWorkflow.form.quorumCountPlaceholder")}
						/>
					)}

					{/* Row 3: SLA Hours (full width) */}
					<FloatingLabelInput
						label={t("approvalWorkflow.form.slaHours")}
						name="sla_hours"
						type="number"
						value={stageForm.sla_hours}
						onChange={handleStageFormChange}
						placeholder={t("approvalWorkflow.form.slaHoursPlaceholder")}
					/>

					{/* Row 4: Toggle switches */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="bg-gray-50 rounded-2xl">
							<Toggle
								label={t("approvalWorkflow.form.allowDelegate")}
								checked={stageForm.allow_delegate}
								onChange={checked => setStageForm(prev => ({ ...prev, allow_delegate: checked }))}
							/>
						</div>
						<div className="bg-gray-50 rounded-2xl">
							<Toggle
								label={t("approvalWorkflow.form.allowReject")}
								checked={stageForm.allow_reject}
								onChange={checked => setStageForm(prev => ({ ...prev, allow_reject: checked }))}
							/>
						</div>
					</div>

					{/* Action buttons */}
					<div className="flex justify-end gap-3 pt-4">
						<Button variant="outline" onClick={() => setIsStageModalOpen(false)}>
							{t("common.cancel")}
						</Button>
						<Button variant="primary" onClick={handleSaveStage}>
							{editingStage !== null
								? t("approvalWorkflow.form.updateStage")
								: t("approvalWorkflow.form.addStage")}
						</Button>
					</div>
				</div>
			</SlideUpModal>

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

export default ApprovalWorkflowForm;
