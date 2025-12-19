import React, { useMemo, useEffect } from "react";
import { useParams } from "react-router";
import { QuickActionsIcon } from "../components/shared/QuickActionsPanel";
import PageHeader from "../components/shared/PageHeader";
import InvoiceForm from "../components/forms/InvoiceForm";
import OneTimeSupplierInvoiceForm from "../components/forms/OneTimeSupplierInvoiceForm";
import ReceivePaymentForm from "../components/forms/ReceivePaymentForm";
import MakePaymentForm from "../components/forms/MakePaymentForm";
import ApprovalWorkflowForm from "../components/forms/ApprovalWorkflowForm";
import { QUICK_ACTIONS, getQuickActionById } from "../constants/quickActions";

const QuickActionDetail = () => {
	const { actionId } = useParams();

	const action = useMemo(() => getQuickActionById(actionId) || QUICK_ACTIONS[0], [actionId]);

	useEffect(() => {
		const pageTitle = action?.label ? `Light ERP | ${action.label}` : "Light ERP | Quick Actions";
		document.title = pageTitle;
	}, [action?.id, action?.label]);

	// Determine which form to display based on action ID
	const renderFormContent = () => {
		switch (action?.id) {
			case "create-ar-invoice":
				return <InvoiceForm isAPInvoice={false} />;

			case "create-ap-invoice":
				return <InvoiceForm isAPInvoice={true} />;

			case "create-one-time-supplier-invoice":
				return <OneTimeSupplierInvoiceForm />;

			case "receive-payment":
				return <ReceivePaymentForm />;

			case "make-payment":
				return <MakePaymentForm />;

			case "create-approval-workflow":
				return <ApprovalWorkflowForm />;

			default:
				return (
					<div className="max-w-4xl mx-auto mt-5 pb-10">
						<div className="rounded-4xl bg-white shadow-xl border border-white/60 p-12 text-center">
							<p className="text-xl text-[#28819C] font-semibold mb-4">{action?.label}</p>
							<p className="text-[#7A9098]">This feature is under development</p>
						</div>
					</div>
				);
		}
	};

	return (
		<section className="min-h-screen bg-[#edf2f7]">
			<PageHeader icon={<QuickActionsIcon />} title="Quick Actions" subtitle={action.label} />

			{/* Render the appropriate form based on action type */}
			{renderFormContent()}
		</section>
	);
};

export default QuickActionDetail;
