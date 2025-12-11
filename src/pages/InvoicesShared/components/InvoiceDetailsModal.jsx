import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
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
				const endpoint = type === "AR" ? `/finance/invoice/ar/${invoiceId}/` : `/finance/invoice/ap/${invoiceId}/`;
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

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
			<div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-100">
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
					<div>
						<p className="text-xs uppercase text-gray-500 tracking-widest">{type} Invoice</p>
						<h2 className="text-xl font-semibold text-[#0d5f7a]">Invoice #{invoiceId}</h2>
					</div>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-800 transition-colors rounded-full p-2"
						aria-label="Close"
					>
						✕
					</button>
				</div>

				<div className="p-6 space-y-4">
					{loading && <div className="text-center text-gray-500 py-8">Loading invoice details...</div>}
					{error && <div className="text-center text-red-600 py-4 text-sm">{error}</div>}

					{!loading && !error && invoice && (
						<>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
									<h3 className="text-sm font-semibold text-gray-700 mb-2">Summary</h3>
									<InfoRow label="Date" value={invoice.date} />
									<InfoRow
										label={type === "AR" ? "Customer" : "Supplier"}
										value={invoice.customer?.name || invoice.supplier?.name || "-"}
									/>
									<InfoRow label="Currency" value={invoice.currency_code} />
									<InfoRow label="Country" value={invoice.country_code || "-"} />
									<InfoRow label="Subtotal" value={invoice.subtotal} />
									<InfoRow label="Tax Amount" value={invoice.tax_amount} />
									<InfoRow label="Total" value={invoice.total} />
								</div>
								<div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
									<h3 className="text-sm font-semibold text-gray-700 mb-2">Status</h3>
									<div className="flex items-center gap-3 mb-2">
										<span className="text-sm text-gray-600">Approval</span>
										<InvoiceStatusBadge type="approval" value={invoice.approval_status} />
									</div>
									<div className="flex items-center gap-3">
										<span className="text-sm text-gray-600">Payment</span>
										<InvoiceStatusBadge type="payment" value={invoice.payment_status} />
									</div>
								</div>
							</div>

							<div className="rounded-xl border border-gray-100">
								<div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
									<h3 className="text-sm font-semibold text-gray-700">Line Items</h3>
								</div>
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-100">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
												<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
												<th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty</th>
												<th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit Price</th>
												<th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Line Total</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-100">
											{(invoice.items || []).map(item => (
												<tr key={`${item.name}-${item.description}`}>
													<td className="px-4 py-3 text-sm text-gray-800">{item.name}</td>
													<td className="px-4 py-3 text-sm text-gray-600">{item.description}</td>
													<td className="px-4 py-3 text-sm text-right text-gray-800">{item.quantity}</td>
													<td className="px-4 py-3 text-sm text-right text-gray-800">{item.unit_price}</td>
													<td className="px-4 py-3 text-sm text-right text-gray-900 font-semibold">{item.line_total}</td>
												</tr>
											))}
											{(!invoice.items || invoice.items.length === 0) && (
												<tr>
													<td className="px-4 py-3 text-center text-sm text-gray-500" colSpan={5}>
														No items found for this invoice.
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</div>

							{invoice.journal_entry && (
								<div className="rounded-xl border border-gray-100">
									<div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
										<h3 className="text-sm font-semibold text-gray-700">Journal Entry</h3>
									</div>
									<div className="p-4 space-y-3">
										<InfoRow label="Date" value={invoice.journal_entry.date} />
										<InfoRow label="Memo" value={invoice.journal_entry.memo || "-"} />
										<div className="overflow-x-auto">
											<table className="min-w-full divide-y divide-gray-100">
												<thead className="bg-gray-50">
													<tr>
														<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
														<th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
														<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Segments</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-gray-100">
													{(invoice.journal_entry.lines || []).map(line => (
														<tr key={line.id}>
															<td className="px-4 py-3 text-sm text-gray-800">{line.type}</td>
															<td className="px-4 py-3 text-sm text-right text-gray-800">{line.amount}</td>
															<td className="px-4 py-3 text-sm text-gray-700">
																{line.segments && line.segments.length > 0 ? (
																	<div className="flex flex-wrap gap-2">
																		{line.segments.map((seg, idx) => (
																			<span
																				key={`${line.id}-${idx}`}
																				className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
																			>
																				{seg.segment_type_name}: {seg.segment_code}
																			</span>
																		))}
																	</div>
																) : (
																	<span className="text-gray-400">No segments</span>
																)}
															</td>
														</tr>
													))}
													{(!invoice.journal_entry.lines || invoice.journal_entry.lines.length === 0) && (
														<tr>
															<td className="px-4 py-3 text-center text-sm text-gray-500" colSpan={3}>
																No journal lines available.
															</td>
														</tr>
													)}
												</tbody>
											</table>
										</div>
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default InvoiceDetailsModal;

