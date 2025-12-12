import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Card from "../shared/Card";
import FloatingLabelInput from "../shared/FloatingLabelInput";
import FloatingLabelSelect from "../shared/FloatingLabelSelect";
import GLLinesSection from "../shared/GLLinesSection";
import { fetchCurrencies } from "../../store/currenciesSlice";
import { fetchCustomers } from "../../store/customersSlice";
import { fetchARInvoices } from "../../store/arInvoicesSlice";
import { createARPayment, updateARPayment } from "../../store/arPaymentsSlice";
import { FaTrash, FaPlus, FaChevronDown } from "react-icons/fa";

const ReceivePaymentForm = ({ onCancel, onSuccess, editPaymentData }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const { currencies } = useSelector(state => state.currencies);
	const { customers } = useSelector(state => state.customers);
	const { invoices: arInvoices } = useSelector(state => state.arInvoices);
	const { loading } = useSelector(state => state.arPayments);
	console.log("arInvoices", arInvoices);
	// Check if we're in edit mode - support both route state and prop
	const editPayment = editPaymentData || location.state?.payment;
	const paymentId = editPaymentData?.id || location.state?.paymentId;
	const isEditMode = !!editPayment;

	// Payment form state - matching API structure
	const [paymentForm, setPaymentForm] = useState({
		date: "",
		business_partner_id: "",
		currency_id: "",
		exchange_rate: "",
	});

	// Allocations state - matching API structure: { invoice_id, amount_allocated }
	const [allocations, setAllocations] = useState([{ id: Date.now(), invoice_id: "", amount_allocated: "" }]);

	// GL Entry state
	const [glEntry, setGlEntry] = useState({
		date: "",
		currency_id: "",
		memo: "",
	});

	const [glLines, setGlLines] = useState([{ id: Date.now(), type: "", amount: "", segments: [] }]);

	// Fetch currencies, customers, and invoices on mount
	useEffect(() => {
		dispatch(fetchCurrencies({ page_size: 100 }));
		dispatch(fetchCustomers({ page_size: 100 }));
		dispatch(fetchARInvoices({ page_size: 100 }));
	}, [dispatch]);

	// Pre-fill form if in edit mode
	useEffect(() => {
		if (editPayment) {
			setPaymentForm({
				date: editPayment.date || "",
				business_partner_id: editPayment.business_partner_id || editPayment.customer || "",
				currency_id: editPayment.currency_id || editPayment.currency || "",
				exchange_rate: editPayment.exchange_rate || "1.0000",
			});

			// Pre-fill allocations if they exist
			if (editPayment.allocations && Array.isArray(editPayment.allocations)) {
				setAllocations(
					editPayment.allocations.map((a, idx) => ({
						id: idx + 1,
						invoice_id: a.invoice_id || a.invoice || "",
						amount_allocated: a.amount_allocated || a.amount || "",
					}))
				);
			}

			// Pre-fill GL entry if exists
			if (editPayment.gl_entry) {
				setGlEntry({
					date: editPayment.gl_entry.date || editPayment.date || "",
					currency_id: editPayment.gl_entry.currency_id || editPayment.currency_id || "",
					memo: editPayment.gl_entry.memo || "",
				});
				if (editPayment.gl_entry.lines) {
					setGlLines(
						editPayment.gl_entry.lines.map((line, idx) => ({
							id: idx + 1,
							type: line.type || "",
							amount: line.amount || "",
							segments: line.segments || [],
						}))
					);
				}
			}
		}
	}, [editPayment]);

	// Sync GL entry date and currency with payment form
	useEffect(() => {
		setGlEntry(prev => ({
			...prev,
			date: paymentForm.date,
			currency_id: paymentForm.currency_id,
		}));
	}, [paymentForm.date, paymentForm.currency_id]);
	// Currency options from Redux - filter active currencies only
	const currencyOptions = (currencies || [])
		.filter(currency => currency.is_active)
		.map(currency => ({
			value: currency.id,
			label: `${currency.code} - ${currency.name}`,
		}));

	// Customer options from Redux
	const customerOptions = (customers || []).map(customer => ({
		value: customer.id,
		label: customer.name || customer.company_name || `Customer ${customer.id}`,
	}));

	// Invoice options for allocations - filter by selected customer if any
	const invoiceOptions = (arInvoices || [])
		.filter(
			inv => !paymentForm.business_partner_id || inv.customer_id === parseInt(paymentForm.business_partner_id)
		)
		.map(invoice => ({
			value: invoice.invoice_id,
			label: `#${invoice.invoice_id} - ${invoice.customer_name || "N/A"} (${invoice.total || 0} ${
				invoice.currency_code || ""
			})`,
			total_amount: invoice.total || 0,
		}));

	const handleChange = e => {
		const { name, value } = e.target;
		setPaymentForm(prev => ({ ...prev, [name]: value }));
	};

	// Allocation handlers
	const handleAddAllocation = () => {
		setAllocations(prev => [...prev, { id: Date.now(), invoice_id: "", amount_allocated: "" }]);
	};

	const handleRemoveAllocation = allocationId => {
		if (allocations.length > 1) {
			setAllocations(prev => prev.filter(a => a.id !== allocationId));
		}
	};

	const handleAllocationChange = (allocationId, field, value) => {
		setAllocations(prev => prev.map(a => (a.id === allocationId ? { ...a, [field]: value } : a)));
	};

	const getTotalAllocated = () => {
		return allocations.reduce((sum, a) => sum + parseFloat(a.amount_allocated || 0), 0);
	};

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		} else {
			navigate(-1);
		}
	};

	const handleReceivePayment = async () => {
		// Validate required fields
		if (!paymentForm.business_partner_id || !paymentForm.date || !paymentForm.currency_id) {
			toast.error("Please fill all required fields (Customer, Date, Currency)");
			return;
		}

		// Validate allocations - at least one should have invoice and amount
		const validAllocations = allocations.filter(a => a.invoice_id && a.amount_allocated);
		if (validAllocations.length === 0) {
			toast.error("Please add at least one invoice allocation");
			return;
		}

		// Prepare GL entry lines (filter out empty lines)
		const validGlLines = glLines
			.filter(line => line.type && line.amount)
			.map(line => ({
				amount: line.amount,
				type: line.type,
				segments: (line.segments || [])
					.filter(seg => seg.segment_code)
					.map(seg => ({
						segment_type_id: seg.segment_type_id,
						segment_code: seg.segment_code,
					})),
			}));

		// Prepare payment data according to API structure
		const paymentData = {
			date: paymentForm.date,
			business_partner_id: parseInt(paymentForm.business_partner_id),
			currency_id: parseInt(paymentForm.currency_id),
			exchange_rate: paymentForm.exchange_rate || "1.0000",
			allocations: validAllocations.map(a => ({
				invoice_id: parseInt(a.invoice_id),
				amount_allocated: parseFloat(a.amount_allocated).toFixed(2),
			})),
			gl_entry: {
				date: glEntry.date || paymentForm.date,
				currency_id: parseInt(glEntry.currency_id || paymentForm.currency_id),
				memo: glEntry.memo || `Payment from customer`,
				lines: validGlLines,
			},
		};

		try {
			if (isEditMode && paymentId) {
				await dispatch(updateARPayment({ id: paymentId, data: paymentData })).unwrap();
				toast.success("AR Payment updated successfully");
			} else {
				await dispatch(createARPayment(paymentData)).unwrap();
				toast.success("AR Payment received successfully");
			}
			if (onSuccess) {
				onSuccess();
			} else {
				navigate(-1);
			}
		} catch (error) {
			toast.error(error || `Failed to ${isEditMode ? "update" : "receive"} payment`);
		}
	};

	const formatCurrency = value => {
		const numericValue = Number(value ?? 0);
		if (Number.isNaN(numericValue)) {
			return "0.00";
		}
		return numericValue.toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	};

	return (
		<div className="max-w-4xl mx-auto mt-5 pb-10 space-y-5">
			{/* Payment Details */}
			<Card title={t("paymentForm.paymentDetails") || "Payment Details"}>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<FloatingLabelSelect
						label={t("paymentForm.customer") || "Customer"}
						name="business_partner_id"
						value={paymentForm.business_partner_id}
						onChange={handleChange}
						options={customerOptions}
						required
						placeholder={t("paymentForm.selectCustomer") || "Select customer"}
					/>

					<FloatingLabelInput
						label={t("paymentForm.date") || "Date"}
						name="date"
						type="date"
						value={paymentForm.date}
						onChange={handleChange}
						required
						placeholder="dd/mm/yyyy"
					/>

					<FloatingLabelSelect
						label={t("paymentForm.currency") || "Currency"}
						name="currency_id"
						value={paymentForm.currency_id}
						onChange={handleChange}
						options={currencyOptions}
						required
						placeholder={t("paymentForm.selectCurrency") || "Select Currency"}
					/>

					<FloatingLabelInput
						label={t("paymentForm.exchangeRate") || "Exchange Rate"}
						name="exchange_rate"
						type="number"
						step="0.0001"
						value={paymentForm.exchange_rate}
						onChange={handleChange}
						placeholder="1.0000"
					/>
				</div>
			</Card>

			{/* Invoice Allocations */}
			<Card
				title={t("paymentForm.allocations") || "Invoice Allocations"}
				subtitle={t("paymentForm.allocationsSubtitle") || "Allocate payment amounts to invoices"}
				actionSlot={
					<button
						type="button"
						onClick={handleAddAllocation}
						className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#48C1F0] text-[#48C1F0] text-sm font-semibold hover:bg-[#48C1F0]/10 transition-colors"
					>
						<FaPlus className="w-3 h-3" />
						{t("paymentForm.addAllocation") || "Add Allocation"}
					</button>
				}
			>
				{allocations.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-[#b6c4cc] bg-[#f5f8fb] p-6 text-center text-[#567086]">
						<p className="text-lg font-semibold mb-2">
							{t("paymentForm.noAllocations") || "No allocations added yet"}
						</p>
						<p className="text-sm mb-6">
							{t("paymentForm.noAllocationsDesc") ||
								"Add invoice allocations to specify how this payment should be applied."}
						</p>
						<button
							type="button"
							onClick={handleAddAllocation}
							className="px-4 py-2 rounded-full bg-[#0d5f7a] text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform"
						>
							<FaPlus className="inline w-3 h-3 mr-2" />
							{t("paymentForm.addFirstAllocation") || "Add First Allocation"}
						</button>
					</div>
				) : (
					<div className="space-y-4">
						{/* Allocations List */}
						<div className="space-y-3">
							{allocations.map((allocation, index) => (
								<div
									key={allocation.id}
									className="flex flex-wrap items-end gap-4 p-4 rounded-xl border border-[#e1edf5] bg-[#f5f8fb]"
								>
									<div className="flex-1 min-w-[200px]">
										<label className="block text-xs font-medium text-[#567086] mb-1">
											{t("paymentForm.invoice") || "Invoice"} #{index + 1}
										</label>
										<div className="relative">
											<select
												value={allocation.invoice_id}
												onChange={e =>
													handleAllocationChange(allocation.id, "invoice_id", e.target.value)
												}
												className="w-full h-11 px-3 pr-10 rounded-lg border border-[#d7e3ec] bg-white text-[#1e3a4f] focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-transparent appearance-none"
											>
												<option value="">
													{t("paymentForm.selectInvoice") || "Select Invoice"}
												</option>
												{invoiceOptions.map(opt => (
													<option key={opt.value} value={opt.value}>
														{opt.label}
													</option>
												))}
											</select>
											<FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#567086] pointer-events-none" />
										</div>
									</div>

									<div className="w-40">
										<label className="block text-xs font-medium text-[#567086] mb-1">
											{t("paymentForm.amountAllocated") || "Amount Allocated"}
										</label>
										<input
											type="number"
											step="0.01"
											value={allocation.amount_allocated}
											onChange={e =>
												handleAllocationChange(
													allocation.id,
													"amount_allocated",
													e.target.value
												)
											}
											placeholder="0.00"
											className="w-full h-11 px-3 rounded-lg border border-[#d7e3ec] bg-white text-[#1e3a4f] focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-transparent text-right"
										/>
									</div>

									<button
										type="button"
										onClick={() => handleRemoveAllocation(allocation.id)}
										disabled={allocations.length === 1}
										className="h-11 w-11 flex items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
										title={t("paymentForm.deleteAllocation") || "Delete Allocation"}
									>
										<FaTrash className="w-4 h-4" />
									</button>
								</div>
							))}
						</div>

						{/* Allocations Summary */}
						<div className="flex justify-end">
							<div className="bg-white rounded-xl border border-[#d7e3ec] p-4 min-w-[200px]">
								<div className="flex justify-between items-center text-sm">
									<span className="text-[#567086] font-medium">
										{t("paymentForm.totalAllocated") || "Total Allocated"}:
									</span>
									<span className="font-bold text-[#0d5f7a]">
										{formatCurrency(getTotalAllocated())}
									</span>
								</div>
							</div>
						</div>
					</div>
				)}
			</Card>

			{/* GL Lines Section */}
			<Card title={t("glLines.title") || "GL Lines"} subtitle={t("glLines.subtitle") || "Posting"}>
				<GLLinesSection
					lines={glLines}
					onChange={setGlLines}
					glEntry={glEntry}
					onGlEntryChange={setGlEntry}
					showGlEntryHeader={true}
					title=""
				/>
			</Card>

			{/* Action Buttons */}
			<div className="mt-6 flex flex-wrap justify-end gap-3">
				<button
					type="button"
					onClick={handleCancel}
					className="px-6 py-2 rounded-full border border-[#7A9098] text-[#7A9098] font-semibold hover:bg-[#f1f5f8] transition-colors"
				>
					Cancel
				</button>
				<button
					type="button"
					onClick={handleReceivePayment}
					disabled={loading}
					className="px-8 py-2 rounded-full bg-[#0d5f7a] text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? "Processing..." : isEditMode ? "Update Payment" : "Receive Payment"}
				</button>
			</div>
		</div>
	);
};

export default ReceivePaymentForm;
