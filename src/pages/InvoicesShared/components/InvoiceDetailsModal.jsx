import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import SlideUpModal from "../../../components/shared/SlideUpModal";
import InvoiceStatusBadge from "./InvoiceStatusBadge";

const InfoRow = ({ label, value }) => (
	<div className="flex justify-between text-sm text-gray-700 py-1">
		<span className="font-medium text-gray-600">{label}</span>
		<span>{value ?? "-"}</span>
	</div>
);

const InvoiceDetailsModal = ({ isOpen, invoiceId, type = "AP", onClose }) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [invoice, setInvoice] = useState(null);

	useEffect(() => {
		if (!isOpen || !invoiceId) return;

		const fetchInvoice = async () => {
			setLoading(true);
			setError(null);
			try {
				const endpoint =
					type === "AR" ? `/finance/invoice/ar/${invoiceId}/` : `/finance/invoice/ap/${invoiceId}/`;
				const { data } = await api.get(endpoint);
				const payload = data?.data ?? data;
				setInvoice(payload);
			} catch (err) {
				const message =
					err.response?.data?.message ||
					err.response?.data?.error ||
					err.response?.data?.detail ||
					err.message ||
					"Unable to load invoice details";
				setError(message);
			} finally {
				setLoading(false);
			}
		};

		fetchInvoice();
	}, [invoiceId, isOpen, type]);

	// Reset state when modal closes
	useEffect(() => {
		if (!isOpen) {
			setInvoice(null);
			setError(null);
		}
	}, [isOpen]);

	const formatCurrency = value => {
		if (value === null || value === undefined) return "-";
		return new Intl.NumberFormat("en-AE", {
			style: "currency",
			currency: invoice?.currency_code || "AED",
		}).format(parseFloat(value) || 0);
	};

	return (
		<SlideUpModal isOpen={isOpen} onClose={onClose} title={`${type} Invoice #${invoiceId || ""}`} maxWidth="1100px">
			<div className="space-y-6 pb-6">
				{loading && (
					<div className="flex items-center justify-center py-12">
						<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0d5f7a]"></div>
						<span className="ml-3 text-gray-500">Loading invoice details...</span>
					</div>
				)}

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
						<p className="text-red-600 text-sm">{error}</p>
					</div>
				)}

				{!loading && !error && invoice && (
					<>
						{/* Summary Cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{/* Invoice Info Card */}
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-[#0d5f7a] mb-3 flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
									Invoice Details
								</h3>
								<InfoRow label="Date" value={invoice.date} />
								<InfoRow
									label={type === "AR" ? "Customer" : "Supplier"}
									value={invoice.customer?.name || invoice.supplier?.name || "-"}
								/>
								<InfoRow label="Currency" value={invoice.currency_code} />
								<InfoRow label="Country" value={invoice.country_code || "-"} />
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
									Amounts
								</h3>
								<InfoRow label="Subtotal" value={formatCurrency(invoice.subtotal)} />
								<InfoRow label="Tax Amount" value={formatCurrency(invoice.tax_amount)} />
								<div className="border-t border-gray-200 mt-2 pt-2">
									<div className="flex justify-between text-base font-bold text-[#0d5f7a]">
										<span>Total</span>
										<span>{formatCurrency(invoice.total)}</span>
									</div>
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
									Status
								</h3>
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">Approval</span>
										<InvoiceStatusBadge type="approval" value={invoice.approval_status} />
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">Payment</span>
										<InvoiceStatusBadge type="payment" value={invoice.payment_status} />
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">Posted</span>
										<span
											className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
												invoice.is_posted
													? "bg-green-100 text-green-800"
													: "bg-gray-100 text-gray-600"
											}`}
										>
											{invoice.is_posted ? "Yes" : "No"}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Line Items Table */}
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
									Line Items ({invoice.items?.length || 0})
								</h3>
							</div>
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Name
											</th>
											<th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Description
											</th>
											<th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Qty
											</th>
											<th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Unit Price
											</th>
											<th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Line Total
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-100 bg-white">
										{(invoice.items || []).map((item, idx) => (
											<tr key={item.id || idx} className="hover:bg-gray-50 transition-colors">
												<td className="px-5 py-3 text-sm text-gray-800 font-medium">
													{item.name}
												</td>
												<td className="px-5 py-3 text-sm text-gray-600">{item.description}</td>
												<td className="px-5 py-3 text-sm text-right text-gray-800">
													{item.quantity}
												</td>
												<td className="px-5 py-3 text-sm text-right text-gray-800">
													{formatCurrency(item.unit_price)}
												</td>
												<td className="px-5 py-3 text-sm text-right text-[#0d5f7a] font-semibold">
													{formatCurrency(item.line_total)}
												</td>
											</tr>
										))}
										{(!invoice.items || invoice.items.length === 0) && (
											<tr>
												<td className="px-5 py-8 text-center text-sm text-gray-400" colSpan={5}>
													No items found for this invoice.
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>

						{/* Journal Entry Section */}
						{invoice.journal_entry && (
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
											Journal Entry
										</h3>
										<div className="flex items-center gap-4 text-sm">
											<span className="text-gray-500">
												Date:{" "}
												<span className="text-gray-700 font-medium">
													{invoice.journal_entry.date}
												</span>
											</span>
											{invoice.journal_entry.memo && (
												<span className="text-gray-500">
													Memo:{" "}
													<span className="text-gray-700 font-medium">
														{invoice.journal_entry.memo}
													</span>
												</span>
											)}
										</div>
									</div>
								</div>
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
													Type
												</th>
												<th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
													Amount
												</th>
												<th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
													Segments
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-100 bg-white">
											{(invoice.journal_entry.lines || []).map((line, idx) => (
												<tr key={line.id || idx} className="hover:bg-gray-50 transition-colors">
													<td className="px-5 py-3">
														<span
															className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
																line.type === "DEBIT"
																	? "bg-red-100 text-red-800"
																	: "bg-green-100 text-green-800"
															}`}
														>
															{line.type}
														</span>
													</td>
													<td className="px-5 py-3 text-sm text-right font-mono font-semibold text-gray-800">
														{formatCurrency(line.amount)}
													</td>
													<td className="px-5 py-3">
														{line.segment_details && line.segment_details.length > 0 ? (
															<div className="flex flex-wrap gap-2">
																{line.segment_details.map((seg, segIdx) => (
																	<span
																		key={segIdx}
																		className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
																		title={seg.segment_alias}
																	>
																		{seg.segment_type_name}: {seg.segment_code}
																	</span>
																))}
															</div>
														) : line.segments &&
														  Array.isArray(line.segments) &&
														  line.segments.length > 0 ? (
															<div className="flex flex-wrap gap-2">
																{line.segments.map((seg, segIdx) => (
																	<span
																		key={segIdx}
																		className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
																	>
																		{seg.segment_type_name}: {seg.segment_code}
																	</span>
																))}
															</div>
														) : line.segments &&
														  typeof line.segments === "object" &&
														  !Array.isArray(line.segments) &&
														  Object.keys(line.segments).length > 0 ? (
															<div className="flex flex-wrap gap-2">
																{Object.entries(line.segments).map(
																	([key, value], segIdx) => (
																		<span
																			key={segIdx}
																			className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
																		>
																			{key}:{" "}
																			{typeof value === "object"
																				? JSON.stringify(value)
																				: value}
																		</span>
																	)
																)}
															</div>
														) : (
															<span className="text-gray-400 text-sm">No segments</span>
														)}
													</td>
												</tr>
											))}
											{(!invoice.journal_entry.lines ||
												invoice.journal_entry.lines.length === 0) && (
												<tr>
													<td
														className="px-5 py-8 text-center text-sm text-gray-400"
														colSpan={3}
													>
														No journal lines available.
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</SlideUpModal>
	);
};

export default InvoiceDetailsModal;
