import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchApprovalSteps, approveStep, rejectStep } from "../store/approvalStepsSlice";

// Components
import PageHeader from "../components/shared/PageHeader";
import ProcurementApprovalHeaderIcon from "../assets/icons/ProcurementApprovalHeaderIcon";
import ApprovalStateMessage from "../components/ApprovalStateMessage";
import ApprovalDetailHeader from "../components/ApprovalDetailHeader";
import ApprovalStepsList from "../components/ApprovalStepsList";
import ApprovalActionModals from "../components/ApprovalActionModals";

const ProcurementApprovalDetail = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { instanceId } = useParams();
	const dispatch = useDispatch();

	const { steps, loading, error, actionLoading } = useSelector(state => state.approvalSteps);

	// Modal State
	const [modalState, setModalState] = useState({
		type: null, // 'APPROVE' or 'REJECT' or null
		step: null,
	});
	const [actionInput, setActionInput] = useState(""); // Shared for comments or reason

	// Fetch Data
	useEffect(() => {
		if (instanceId) {
			dispatch(fetchApprovalSteps({ approval_instance: instanceId }));
		}
	}, [dispatch, instanceId]);

	// Title Management
	useEffect(() => {
		document.title = `${t("procurementApprovalDetail.title", { id: instanceId })} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [instanceId, t]);

	// Derived State
	const instanceSteps = useMemo(
		() => steps.filter(step => step.approval_instance === parseInt(instanceId)),
		[steps, instanceId]
	);

	const overallStatus = useMemo(() => {
		if (instanceSteps.length === 0) return "PENDING";
		if (instanceSteps.some(s => s.status === "REJECTED")) return "REJECTED";
		if (instanceSteps.every(s => s.status === "APPROVED")) return "APPROVED";
		if (instanceSteps.some(s => s.status === "IN_PROGRESS")) return "IN_PROGRESS";
		return "PENDING";
	}, [instanceSteps]);

	// Handlers
	const handleCloseModal = () => {
		setModalState({ type: null, step: null });
		setActionInput("");
	};

	const handleAction = async () => {
		const { type, step } = modalState;
		if (!step) return;

		try {
			if (type === "APPROVE") {
				await dispatch(approveStep({ id: step.id, comments: actionInput })).unwrap();
			} else {
				await dispatch(rejectStep({ id: step.id, reason: actionInput })).unwrap();
			}
			// Refresh data
			await dispatch(fetchApprovalSteps({ approval_instance: instanceId })).unwrap();
			handleCloseModal();
		} catch (err) {
			console.error(`Error ${type.toLowerCase()}ing step:`, err);
			alert(err.message || "Action failed");
		}
	};

	// Render Helpers
	const goBack = () => navigate("/procurement/approvals");

	if (loading) return <ApprovalStateMessage type="loading" instanceId={instanceId} />;
	if (error) return <ApprovalStateMessage type="error" message={error} onBack={goBack} />;
	if (instanceSteps.length === 0)
		return <ApprovalStateMessage type="empty" instanceId={instanceId} onBack={goBack} />;

	return (
		<section className="min-h-screen bg-[#f2f3f5] pb-12">
			<PageHeader
				icon={<ProcurementApprovalHeaderIcon />}
				title={t("procurementApprovalDetail.instanceTitle", { id: instanceId })}
				subtitle={t("procurementApprovalDetail.detailsSubtitle")}
			/>

			<div className="max-w-6xl mx-auto px-6 mt-8 space-y-6">
				<div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6 md:p-8">
					<ApprovalDetailHeader
						instanceId={instanceId}
						overallStatus={overallStatus}
						approvedCount={instanceSteps.filter(s => s.status === "APPROVED").length}
						totalSteps={instanceSteps.length}
						onBack={goBack}
					/>

					<ApprovalStepsList
						steps={instanceSteps}
						actionLoading={actionLoading}
						onApprove={step => setModalState({ type: "APPROVE", step })}
						onReject={step => setModalState({ type: "REJECT", step })}
					/>
				</div>
			</div>

			<ApprovalActionModals
				modalState={modalState}
				inputValue={actionInput}
				setInputValue={setActionInput}
				onClose={handleCloseModal}
				onConfirm={handleAction}
				actionLoading={actionLoading}
			/>
		</section>
	);
};

export default ProcurementApprovalDetail;
