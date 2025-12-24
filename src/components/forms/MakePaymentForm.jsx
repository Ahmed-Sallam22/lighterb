import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import FloatingLabelInput from "../shared/FloatingLabelInput";
import FloatingLabelSelect from "../shared/FloatingLabelSelect";
import GLLinesSection from "../shared/GLLinesSection";
import api from "../../api/axios";
import { fetchCurrencies } from "../../store/currenciesSlice";
import { fetchSuppliers } from "../../store/suppliersSlice";
import { fetchAPInvoices } from "../../store/apInvoicesSlice";
import { fetchSegmentTypes } from "../../store/segmentsSlice";
import { createAPPayment, updateAPPayment } from "../../store/apPaymentsSlice";
import { FaTrash, FaPlus, FaChevronDown, FaChevronUp } from "react-icons/fa";

const MakePaymentForm = ({ onCancel, onSuccess, editPaymentData }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const hasInitialized = React.useRef(false);
	const { currencies } = useSelector(state => state.currencies);
	const { suppliers } = useSelector(state => state.suppliers);
	const { invoices: apInvoices } = useSelector(state => state.apInvoices);
	const { loading } = useSelector(state => state.apPayments);
	const { types: segmentTypes = [] } = useSelector(state => state.segments);

	// Check if we're in edit mode
	const editPayment = editPaymentData || location.state?.payment;
	const paymentId = editPaymentData?.id || location.state?.paymentId;
	const isEditMode = !!editPayment;

	// Collapsible state for GL Entry Details
	const [isGLEntryOpen, setIsGLEntryOpen] = useState(true);

	// Payment form state
	const [paymentForm, setPaymentForm] = useState({
		date: "",
		business_partner_id: "",
		currency_id: "",
		exchange_rate: "",
	});

	// Allocations state
	const [allocations, setAllocations] = useState([{ id: Date.now(), invoice_id: "", amount_allocated: "" }]);

	// GL Entry state
	const [glEntry, setGlEntry] = useState({
		date: "",
		currency_id: "",
		memo: "",
	});

	const [glLines, setGlLines] = useState([{ id: Date.now(), type: "", amount: "", segments: [] }]);

	// Fetch data on mount
	useEffect(() => {
		dispatch(fetchCurrencies({ page_size: 100 }));
		dispatch(fetchSuppliers({ page_size: 100 }));
		dispatch(fetchSegmentTypes());
	}, [dispatch]);

	// Fetch invoices when supplier is selected
	useEffect(() => {
		if (paymentForm.business_partner_id) {
			const supplierId = suppliers.find(
				s => s.business_partner_id === parseInt(paymentForm.business_partner_id)
			)?.id;
			if (supplierId) {
				dispatch(fetchAPInvoices({ supplier_id: supplierId, page_size: 100 }));
			}
		}
	}, [dispatch, paymentForm.business_partner_id, suppliers]);

	// Pre-fill form if in edit mode (only once)
	useEffect(() => {
		if (editPayment && !hasInitialized.current) {
			hasInitialized.current = true;
			setPaymentForm({
				date: editPayment.date || "",
				business_partner_id: editPayment.business_partner_id || editPayment.supplier || "",
				currency_id: editPayment.currency_id || editPayment.currency || "",
				exchange_rate: editPayment.exchange_rate || "1.0000",
			});

			if (editPayment.allocations && Array.isArray(editPayment.allocations)) {
				setAllocations(
					editPayment.allocations.map((a, idx) => ({
						id: idx + 1,
						invoice_id: a.invoice_id || a.invoice || "",
						amount_allocated: a.amount_allocated || a.amount || "",
					}))
				);
			}

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

	// Options
	const currencyOptions = (currencies || [])
		.filter(currency => currency.is_active)
		.map(currency => ({
			value: currency.id,
			label: `${currency.code} - ${currency.name}`,
		}));

	const supplierOptions = (suppliers || []).map(supplier => ({
		value: supplier.business_partner_id,
		key: supplier.id,
		label: supplier.name || supplier.company_name || `Supplier ${supplier.id}`,
	}));

	const invoiceOptions = (apInvoices || []).map(invoice => ({
		value: invoice.invoice_id,
		label: `#${invoice.invoice_id}`,
	}));

	// Handlers
	const handleChange = e => {
		const { name, value } = e.target;
		setPaymentForm(prev => ({ ...prev, [name]: value }));
	};

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

		// When invoice_id changes, fetch invoice details and populate GL line
		if (field === "invoice_id" && value) {
			fetchInvoiceAndPopulateGLLine(value);
		}
	};

	// Fetch invoice details and create locked DEBIT line from invoice's CREDIT line
	const fetchInvoiceAndPopulateGLLine = useCallback(
		async invoiceId => {
			try {
				const response = await api.get(`/finance/invoice/ap/${invoiceId}/`);
				const invoiceData = response.data?.data || response.data;

				if (invoiceData?.journal_entry?.lines) {
					// Find CREDIT lines from the invoice
					const creditLines = invoiceData.journal_entry.lines.filter(line => line.type === "CREDIT");

					if (creditLines.length > 0) {
						// Create locked DEBIT lines from the invoice's CREDIT lines
						const lockedDebitLines = creditLines.map((creditLine, idx) => ({
							id: `locked-${invoiceId}-${idx}`,
							type: "DEBIT",
							amount: creditLine.amount,
							isLocked: true,
							segments: (creditLine.segments || []).map(seg => {
								// Map segment_type_name to segment_type_id using segmentTypes
								const segmentType = segmentTypes.find(
									st => st.name === seg.segment_type_name || st.segment_name === seg.segment_type_name
								);
								return {
									segment_type_id: segmentType?.id || seg.segment_type_id || seg.segment_type,
									segment_code: seg.segment_code,
								};
							}),
						}));

						// Replace or add locked lines (remove previous locked lines first)
						setGlLines(prev => {
							const nonLockedLines = prev.filter(line => !line.isLocked);
							// If only one empty line exists, replace it with locked lines
							if (nonLockedLines.length === 1 && !nonLockedLines[0].type && !nonLockedLines[0].amount) {
								return lockedDebitLines;
							}
							return [...lockedDebitLines, ...nonLockedLines];
						});
					}
				}
			} catch (error) {
				console.error("Failed to fetch invoice details:", error);
			}
		},
		[segmentTypes]
	);

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		} else {
			navigate(-1);
		}
	};

	const handleMakePayment = async () => {
		if (!paymentForm.business_partner_id || !paymentForm.date || !paymentForm.currency_id) {
			toast.error(t("paymentForm.errors.requiredFields"));
			return;
		}

		const validAllocations = allocations.filter(a => a.invoice_id && a.amount_allocated);
		if (validAllocations.length === 0) {
			toast.error(t("paymentForm.errors.noAllocations"));
			return;
		}

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
				memo: glEntry.memo || `Payment to supplier`,
				lines: validGlLines,
			},
		};

		console.log("Payment Request Body:", JSON.stringify(paymentData, null, 2));

		try {
			if (isEditMode && paymentId) {
				await dispatch(updateAPPayment({ id: paymentId, data: paymentData })).unwrap();
				toast.success(t("paymentForm.messages.apUpdated"));
			} else {
				await dispatch(createAPPayment(paymentData)).unwrap();
				toast.success(t("paymentForm.messages.apCreated"));
			}
			if (onSuccess) {
				onSuccess();
			} else {
				navigate(-1);
			}
		} catch (error) {
			toast.error(error || t("paymentForm.messages.createFailed"));
		}
	};

	return (
		<div className="bg-gray-50 rounded-xl p-6 space-y-6">
			{/* Payment Information Section */}
			<div>
				<h3 className="text-sm font-semibold text-gray-700 mb-4">{t("paymentForm.paymentInformation")}</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<FloatingLabelInput
						label={t("paymentForm.paymentDate")}
						name="date"
						type="date"
						value={paymentForm.date}
						onChange={handleChange}
						required
					/>
					<FloatingLabelSelect
						label={t("paymentForm.businessPartner")}
						name="business_partner_id"
						value={paymentForm.business_partner_id}
						onChange={handleChange}
						options={supplierOptions}
						required
						placeholder={t("paymentForm.select")}
					/>
					<FloatingLabelSelect
						label={t("paymentForm.currency")}
						name="currency_id"
						value={paymentForm.currency_id}
						onChange={handleChange}
						options={currencyOptions}
						placeholder={t("paymentForm.select")}
					/>
					<FloatingLabelInput
						label={t("paymentForm.exchangeRate")}
						name="exchange_rate"
						type="number"
						step="0.0001"
						value={paymentForm.exchange_rate}
						onChange={handleChange}
						placeholder="1.0000"
					/>
				</div>
			</div>

			{/* Allocations Section */}
			<div>
				<h3 className="text-sm font-semibold text-gray-700 mb-4">{t("paymentForm.allocations")}</h3>
				<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
					{/* Table Header */}
					<div className="grid grid-cols-[1fr_2fr_80px] gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
						<span className="text-xs font-medium text-gray-600">{t("paymentForm.invoiceId")}</span>
						<span className="text-xs font-medium text-gray-600">{t("paymentForm.amountAllocated")}</span>
						<span className="text-xs font-medium text-gray-600 text-center">
							{t("paymentForm.actions")}
						</span>
					</div>
					{/* Table Body */}
					<div className="divide-y divide-gray-100">
						{allocations.map(allocation => (
							<div
								key={allocation.id}
								className="grid grid-cols-[1fr_2fr_80px] gap-4 px-4 py-3 items-center"
							>
								<div className="relative">
									<select
										value={allocation.invoice_id}
										onChange={e =>
											handleAllocationChange(allocation.id, "invoice_id", e.target.value)
										}
										className="w-full h-10 px-3 pr-8 text-sm bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-transparent"
									>
										<option value="">{t("paymentForm.selectInvoice")}</option>
										{invoiceOptions.map(opt => (
											<option key={opt.value} value={opt.value}>
												{opt.label}
											</option>
										))}
									</select>
									<FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
								</div>
								<input
									type="number"
									step="0.01"
									value={allocation.amount_allocated}
									onChange={e =>
										handleAllocationChange(allocation.id, "amount_allocated", e.target.value)
									}
									placeholder="0.00"
									className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-transparent"
								/>
								<div className="flex justify-center">
									<button
										type="button"
										onClick={() => handleRemoveAllocation(allocation.id)}
										disabled={allocations.length === 1}
										className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
									>
										<FaTrash className="w-4 h-4" />
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
				<button
					type="button"
					onClick={handleAddAllocation}
					className="mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
				>
					<FaPlus className="w-3 h-3" />
					{t("paymentForm.addAllocation")}
				</button>
			</div>

			{/* GL Entry Details Section - Collapsible */}
			<div>
				<button
					type="button"
					onClick={() => setIsGLEntryOpen(!isGLEntryOpen)}
					className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4"
				>
					{isGLEntryOpen ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
					{t("paymentForm.glEntryDetails")}
				</button>

				{isGLEntryOpen && (
					<GLLinesSection
						lines={glLines}
						onChange={setGlLines}
						glEntry={glEntry}
						onGlEntryChange={setGlEntry}
						showGlEntryHeader={true}
						title=""
						invoiceTotal={1} // Always allow adding lines in payments
					/>
				)}
			</div>

			{/* Action Buttons */}
			<div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
				<button
					type="button"
					onClick={handleCancel}
					className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
				>
					{t("paymentForm.cancel")}
				</button>
				<button
					type="button"
					onClick={handleMakePayment}
					disabled={loading}
					className="px-6 py-2.5 text-sm font-medium text-white bg-[#4A9AAF] rounded-lg hover:bg-[#3d8294] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading
						? t("paymentForm.processing")
						: isEditMode
						? t("paymentForm.updatePayment")
						: t("paymentForm.createPayment")}
				</button>
			</div>
		</div>
	);
};

export default MakePaymentForm;
