import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../api/axios";
import SlideUpModal from "./SlideUpModal";

const InfoRow = ({ label, value }) => (
	<div className="flex justify-between text-sm text-gray-700 py-1">
		<span className="font-medium text-gray-600">{label}</span>
		<span>{value ?? "-"}</span>
	</div>
);

const StatusBadge = ({ value }) => {
	const colors = {
		DRAFT: "bg-gray-100 text-gray-800",
		PENDING: "bg-yellow-100 text-yellow-800",
		APPROVED: "bg-green-100 text-green-800",
		REJECTED: "bg-red-100 text-red-800",
	};

	return (
		<span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${colors[value] || colors.DRAFT}`}>
			{value || "DRAFT"}
		</span>
	);
};

const PaymentDetailsModal = ({ isOpen, paymentId, type = "AR", onClose }) => {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [payment, setPayment] = useState(null);

	useEffect(() => {
		if (!isOpen || !paymentId) return;

		const fetchPayment = async () => {
			setLoading(true);
			setError(null);
			try {
				const { data } = await api.get(`/finance/payments/${paymentId}/`);
				const payload = data?.data ?? data;
				setPayment(payload);
			} catch (err) {
				const message =
					err.response?.data?.message ||
					err.response?.data?.error ||
					err.response?.data?.detail ||
					err.message ||
					t("paymentDetails.errors.loadFailed");
				setError(message);
			} finally {
				setLoading(false);
			}
		};

		fetchPayment();
	}, [paymentId, isOpen, t]);

	// Reset state when modal closes
	useEffect(() => {
		if (!isOpen) {
			setPayment(null);
			setError(null);
		}
	}, [isOpen]);

	const formatCurrency = value => {
		if (value === null || value === undefined) return "-";
		const symbol = payment?.currency_symbol || "$";
		return `${symbol}${parseFloat(value).toLocaleString()}`;
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

	return (
		<SlideUpModal
			isOpen={isOpen}
			onClose={onClose}
			title={`${t("paymentDetails.title")} #${paymentId || ""}`}
			maxWidth="1100px"
		>
			<div className="space-y-6 pb-6">
				{loading && (
					<div className="flex items-center justify-center py-12">
						<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0d5f7a]"></div>
						<span className="ml-3 text-gray-500">{t("paymentDetails.loading")}</span>
					</div>
				)}

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
						<p className="text-red-600 text-sm">{error}</p>
					</div>
				)}

				{!loading && !error && payment && (
					<>
						{/* Summary Cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{/* Payment Info Card */}
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-[#0d5f7a] mb-3 flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
										/>
									</svg>
									{t("paymentDetails.sections.paymentInfo")}
								</h3>
								<InfoRow label={t("paymentDetails.fields.date")} value={payment.date} />
								<InfoRow
									label={type === "AR" ? t("payments.ar.customer") : t("payments.ap.supplier")}
									value={payment.business_partner_name}
								/>
								<InfoRow
									label={t("paymentDetails.fields.currency")}
									value={`${payment.currency_code} (${payment.currency_symbol})`}
								/>
								<InfoRow
									label={t("paymentDetails.fields.exchangeRate")}
									value={payment.exchange_rate}
								/>
							</div>

							{/* Amounts Card */}
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-[#0d5f7a] mb-3 flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									{t("paymentDetails.sections.amounts")}
								</h3>
								<InfoRow
									label={t("paymentDetails.fields.totalAllocated")}
									value={formatCurrency(payment.total_allocated)}
								/>
								<InfoRow
									label={t("paymentDetails.fields.allocatedInvoices")}
									value={payment.allocated_invoice_count}
								/>
								<div className="border-t border-gray-200 mt-2 pt-2">
									<InfoRow
										label={t("paymentDetails.fields.createdAt")}
										value={formatDateTime(payment.created_at)}
									/>
									<InfoRow
										label={t("paymentDetails.fields.updatedAt")}
										value={formatDateTime(payment.updated_at)}
									/>
								</div>
							</div>

							{/* Status Card */}
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-[#0d5f7a] mb-3 flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									{t("paymentDetails.sections.status")}
								</h3>
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">
											{t("paymentDetails.fields.approvalStatus")}
										</span>
										<StatusBadge value={payment.approval_status} />
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">
											{t("paymentDetails.fields.glEntry")}
										</span>
										<span
											className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
												payment.gl_entry
													? "bg-green-100 text-green-800"
													: "bg-gray-100 text-gray-600"
											}`}
										>
											{payment.gl_entry ? t("common.yes") : t("common.no")}
										</span>
									</div>
									{payment.gl_entry_details && (
										<div className="flex items-center justify-between">
											<span className="text-sm text-gray-600">
												{t("paymentDetails.fields.glPosted")}
											</span>
											<span
												className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
													payment.gl_entry_details.posted
														? "bg-green-100 text-green-800"
														: "bg-gray-100 text-gray-600"
												}`}
											>
												{payment.gl_entry_details.posted ? t("common.yes") : t("common.no")}
											</span>
										</div>
									)}
								</div>
								{payment.rejection_reason && (
									<div className="mt-3 p-2 bg-red-50 rounded-lg">
										<span className="text-xs text-red-600 font-medium">
											{t("paymentDetails.fields.rejectionReason")}:
										</span>
										<p className="text-sm text-red-700">{payment.rejection_reason}</p>
									</div>
								)}
							</div>
						</div>

						{/* Allocations Table */}
						{payment.allocations && payment.allocations.length > 0 && (
							<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
								<div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
									<h3 className="text-sm font-semibold text-[#0d5f7a] flex items-center gap-2">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
											/>
										</svg>
										{t("paymentDetails.sections.allocations")} ({payment.allocations.length})
									</h3>
								</div>
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
													{t("paymentDetails.allocations.invoiceId")}
												</th>
												<th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
													{t("paymentDetails.allocations.invoiceDate")}
												</th>
												<th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
													{t("paymentDetails.allocations.invoiceTotal")}
												</th>
												<th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
													{t("paymentDetails.allocations.paidAmount")}
												</th>
												<th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
													{t("paymentDetails.allocations.allocated")}
												</th>
												<th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
													{t("paymentDetails.allocations.paymentStatus")}
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-100 bg-white">
											{payment.allocations.map((alloc, idx) => (
												<tr
													key={alloc.id || idx}
													className="hover:bg-gray-50 transition-colors"
												>
													<td className="px-5 py-3 text-sm text-gray-800 font-medium">
														#{alloc.invoice_id}
													</td>
													<td className="px-5 py-3 text-sm text-gray-600">
														{alloc.invoice_date}
													</td>
													<td className="px-5 py-3 text-sm text-right text-gray-800">
														{formatCurrency(alloc.invoice_total)}
													</td>
													<td className="px-5 py-3 text-sm text-right text-gray-800">
														{formatCurrency(alloc.invoice_paid_amount)}
													</td>
													<td className="px-5 py-3 text-sm text-right text-[#0d5f7a] font-semibold">
														{formatCurrency(alloc.amount_allocated)}
													</td>
													<td className="px-5 py-3 text-center">
														<span
															className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
																alloc.invoice_payment_status === "PAID"
																	? "bg-green-100 text-green-800"
																	: alloc.invoice_payment_status === "PARTIALLY_PAID"
																	? "bg-yellow-100 text-yellow-800"
																	: "bg-gray-100 text-gray-600"
															}`}
														>
															{alloc.invoice_payment_status?.replace("_", " ") ||
																"UNPAID"}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{/* GL Entry Section */}
						{payment.gl_entry_details && (
							<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
								<div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
									<div className="flex items-center justify-between">
										<h3 className="text-sm font-semibold text-[#0d5f7a] flex items-center gap-2">
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
													d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
												/>
											</svg>
											{t("paymentDetails.sections.glEntry")}
										</h3>
										<div className="flex items-center gap-4 text-sm">
											<span className="text-gray-500">
												{t("paymentDetails.fields.date")}:{" "}
												<span className="text-gray-700 font-medium">
													{payment.gl_entry_details.date}
												</span>
											</span>
											{payment.gl_entry_details.memo && (
												<span className="text-gray-500">
													{t("paymentDetails.fields.memo")}:{" "}
													<span className="text-gray-700 font-medium">
														{payment.gl_entry_details.memo}
													</span>
												</span>
											)}
											<span
												className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
													payment.gl_entry_details.posted
														? "bg-green-100 text-green-800"
														: "bg-gray-100 text-gray-600"
												}`}
											>
												{payment.gl_entry_details.posted
													? t("paymentDetails.fields.posted")
													: t("paymentDetails.fields.notPosted")}
											</span>
										</div>
									</div>
								</div>
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
													{t("paymentDetails.glLines.type")}
												</th>
												<th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
													{t("paymentDetails.glLines.amount")}
												</th>
												<th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
													{t("paymentDetails.glLines.segments")}
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-100 bg-white">
											{(payment.gl_entry_details.lines || []).map((line, idx) => (
												<tr key={line.id || idx} className="hover:bg-gray-50 transition-colors">
													<td className="px-5 py-3">
														<span
															className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
																line.type === "DEBIT"
																	? "bg-red-100 text-red-800"
																	: "bg-green-100 text-green-800"
															}`}
														>
															{line.type === "DEBIT"
																? t("glLines.debit")
																: t("glLines.credit")}
														</span>
													</td>
													<td className="px-5 py-3 text-sm text-right font-mono font-semibold text-gray-800">
														{formatCurrency(line.amount)}
													</td>
													<td className="px-5 py-3">
														{line.segment_combination?.segments &&
														line.segment_combination.segments.length > 0 ? (
															<div className="flex flex-wrap gap-2">
																{line.segment_combination.segments.map(
																	(seg, segIdx) => (
																		<span
																			key={segIdx}
																			className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
																			title={seg.segment_alias}
																		>
																			{seg.segment_type_name}: {seg.segment_code}
																		</span>
																	)
																)}
															</div>
														) : (
															<span className="text-gray-400 text-sm">
																{t("paymentDetails.glLines.noSegments")}
															</span>
														)}
													</td>
												</tr>
											))}
											{(!payment.gl_entry_details.lines ||
												payment.gl_entry_details.lines.length === 0) && (
												<tr>
													<td
														className="px-5 py-8 text-center text-sm text-gray-400"
														colSpan={3}
													>
														{t("paymentDetails.glLines.noLines")}
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{/* Approval Timeline */}
						{(payment.submitted_for_approval_at || payment.approved_at || payment.rejected_at) && (
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-[#0d5f7a] mb-4 flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
									{t("paymentDetails.sections.timeline")}
								</h3>
								<div className="space-y-3">
									{payment.submitted_for_approval_at && (
										<div className="flex items-center gap-3">
											<div className="w-3 h-3 rounded-full bg-blue-500"></div>
											<span className="text-sm text-gray-600">
												{t("paymentDetails.timeline.submitted")}:{" "}
												<span className="font-medium">
													{formatDateTime(payment.submitted_for_approval_at)}
												</span>
											</span>
										</div>
									)}
									{payment.approved_at && (
										<div className="flex items-center gap-3">
											<div className="w-3 h-3 rounded-full bg-green-500"></div>
											<span className="text-sm text-gray-600">
												{t("paymentDetails.timeline.approved")}:{" "}
												<span className="font-medium">
													{formatDateTime(payment.approved_at)}
												</span>
											</span>
										</div>
									)}
									{payment.rejected_at && (
										<div className="flex items-center gap-3">
											<div className="w-3 h-3 rounded-full bg-red-500"></div>
											<span className="text-sm text-gray-600">
												{t("paymentDetails.timeline.rejected")}:{" "}
												<span className="font-medium">
													{formatDateTime(payment.rejected_at)}
												</span>
											</span>
										</div>
									)}
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</SlideUpModal>
	);
};

export default PaymentDetailsModal;
