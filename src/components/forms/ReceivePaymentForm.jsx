import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import FloatingLabelInput from "../shared/FloatingLabelInput";
import FloatingLabelSelect from "../shared/FloatingLabelSelect";
import { fetchCurrencies } from "../../store/currenciesSlice";
import { fetchCustomers } from "../../store/customersSlice";
import { fetchARInvoices } from "../../store/arInvoicesSlice";
import { fetchSegmentTypes, fetchSegmentValues } from "../../store/segmentsSlice";
import { createARPayment, updateARPayment } from "../../store/arPaymentsSlice";
import { FaTrash, FaPlus, FaChevronDown, FaChevronUp } from "react-icons/fa";

const ReceivePaymentForm = ({ onCancel, onSuccess, editPaymentData }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const hasInitialized = React.useRef(false);
	const { currencies } = useSelector(state => state.currencies);
	const { customers } = useSelector(state => state.customers);
	const { invoices: arInvoices } = useSelector(state => state.arInvoices);
	const { loading } = useSelector(state => state.arPayments);
	const { types: segmentTypes = [], values: segmentValues = [] } = useSelector(state => state.segments);

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
		dispatch(fetchCustomers({ page_size: 100 }));
		dispatch(fetchSegmentTypes());
		dispatch(fetchSegmentValues({ node_type: "child", page_size: 1000 }));
	}, [dispatch]);

	// Fetch invoices when customer is selected
	useEffect(() => {
		if (paymentForm.business_partner_id) {
			console.log(
				"where?",
				customers.find(c => c.business_partner_id === parseInt(paymentForm.business_partner_id))?.id,
				paymentForm.business_partner_id
			);
			dispatch(
				fetchARInvoices({
					customer_id: customers.find(
						c => c.business_partner_id === parseInt(paymentForm.business_partner_id)
					)?.id,
					page_size: 100,
				})
			);
		}
	}, [dispatch, paymentForm.business_partner_id, customers]);

	// Pre-fill form if in edit mode (only once)
	useEffect(() => {
		if (editPayment && !hasInitialized.current) {
			hasInitialized.current = true;
			setPaymentForm({
				date: editPayment.date || "",
				business_partner_id: editPayment.business_partner_id || editPayment.customer || "",
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

	const customerOptions = (customers || []).map(customer => ({
		value: customer.business_partner_id,
		key: customer.id,
		label: customer.name || customer.company_name || `Customer ${customer.id}`,
	}));

	const invoiceOptions = (arInvoices || []).map(invoice => ({
		value: invoice.invoice_id,
		label: `#${invoice.invoice_id}`,
	}));

	// Get segment options for a specific segment type
	const getSegmentOptions = segmentTypeId => {
		if (!segmentTypeId) return [];
		return segmentValues
			.filter(seg => seg.segment_type === segmentTypeId && seg.node_type === "child")
			.map(seg => ({
				value: seg.code,
				label: `${seg.code} - ${seg.name || seg.alias || ""}`,
			}));
	};

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
	};

	const handleAddGLLine = () => {
		const newLine = {
			id: Date.now(),
			type: "",
			amount: "",
			segments: segmentTypes.map(st => ({
				segment_type_id: st.id,
				segment_code: "",
			})),
		};
		setGlLines(prev => [...prev, newLine]);
	};

	const handleRemoveGLLine = lineId => {
		if (glLines.length > 1) {
			setGlLines(prev => prev.filter(l => l.id !== lineId));
		}
	};

	const handleGLLineChange = (lineId, field, value) => {
		setGlLines(prev => prev.map(line => (line.id === lineId ? { ...line, [field]: value } : line)));
	};

	const handleSegmentChange = (lineId, segmentTypeId, segmentCode) => {
		setGlLines(prev =>
			prev.map(line => {
				if (line.id === lineId) {
					const existingIndex = (line.segments || []).findIndex(s => s.segment_type_id === segmentTypeId);
					let updatedSegments;
					if (existingIndex !== -1) {
						updatedSegments = line.segments.map(s =>
							s.segment_type_id === segmentTypeId ? { ...s, segment_code: segmentCode } : s
						);
					} else {
						updatedSegments = [
							...(line.segments || []),
							{ segment_type_id: segmentTypeId, segment_code: segmentCode },
						];
					}
					return { ...line, segments: updatedSegments };
				}
				return line;
			})
		);
	};

	const getSegmentValue = (line, segmentTypeId) => {
		const segment = (line.segments || []).find(s => s.segment_type_id === segmentTypeId);
		return segment?.segment_code || "";
	};

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		} else {
			navigate(-1);
		}
	};

	const handleReceivePayment = async () => {
		if (!paymentForm.business_partner_id || !paymentForm.date || !paymentForm.currency_id) {
			toast.error(t("paymentForm.errors.requiredFieldsCustomer"));
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
				memo: glEntry.memo || `Payment from customer`,
				lines: validGlLines,
			},
		};

		console.log("Payment Request Body:", JSON.stringify(paymentData, null, 2));

		try {
			if (isEditMode && paymentId) {
				await dispatch(updateARPayment({ id: paymentId, data: paymentData })).unwrap();
				toast.success(t("paymentForm.messages.arUpdated"));
			} else {
				await dispatch(createARPayment(paymentData)).unwrap();
				toast.success(t("paymentForm.messages.arCreated"));
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
						label={t("paymentForm.customer")}
						name="business_partner_id"
						value={paymentForm.business_partner_id}
						onChange={handleChange}
						options={customerOptions}
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
					<div className="space-y-4">
						{/* GL Entry Header */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("paymentForm.glDate")}
								name="gl_date"
								type="date"
								value={glEntry.date}
								onChange={e => setGlEntry(prev => ({ ...prev, date: e.target.value }))}
							/>
							<FloatingLabelSelect
								label={t("paymentForm.currency")}
								name="gl_currency_id"
								value={glEntry.currency_id}
								onChange={e => setGlEntry(prev => ({ ...prev, currency_id: e.target.value }))}
								options={currencyOptions}
								placeholder={t("paymentForm.select")}
							/>
						</div>
						<FloatingLabelInput
							label={t("paymentForm.description")}
							name="memo"
							value={glEntry.memo}
							onChange={e => setGlEntry(prev => ({ ...prev, memo: e.target.value }))}
							placeholder={t("paymentForm.memoPlaceholder")}
						/>

						{/* GL Lines */}
						<div>
							<h4 className="text-sm font-medium text-gray-600 mb-3">{t("paymentForm.glLines")}</h4>
							<div className="bg-white rounded-lg border border-gray-200 overflow-hidden overflow-x-auto">
								{/* GL Lines Header */}
								<div
									className="grid gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200 min-w-[700px]"
									style={{
										gridTemplateColumns: `120px 150px ${segmentTypes
											.map(() => "1fr")
											.join(" ")} 60px`,
									}}
								>
									<span className="text-xs font-medium text-gray-600">{t("paymentForm.type")}</span>
									<span className="text-xs font-medium text-gray-600">{t("paymentForm.amount")}</span>
									{segmentTypes.map(st => (
										<span key={st.id} className="text-xs font-medium text-gray-600">
											{st.name || `Segment ${st.id}`}
										</span>
									))}
									<span className="text-xs font-medium text-gray-600 text-center">
										{t("paymentForm.actions")}
									</span>
								</div>

								{/* GL Lines Body */}
								<div className="divide-y divide-gray-100 min-w-[700px]">
									{glLines.map(line => (
										<div
											key={line.id}
											className="grid gap-3 px-4 py-3 items-center"
											style={{
												gridTemplateColumns: `120px 150px ${segmentTypes
													.map(() => "1fr")
													.join(" ")} 60px`,
											}}
										>
											{/* Type */}
											<div className="relative">
												<select
													value={line.type}
													onChange={e => handleGLLineChange(line.id, "type", e.target.value)}
													className="w-full h-10 px-3 pr-8 text-sm bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-transparent"
												>
													<option value="">{t("paymentForm.selectType")}</option>
													<option value="DEBIT">DEBIT</option>
													<option value="CREDIT">CREDIT</option>
												</select>
												<FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
											</div>

											{/* Amount */}
											<input
												type="number"
												step="0.01"
												value={line.amount}
												onChange={e => handleGLLineChange(line.id, "amount", e.target.value)}
												placeholder={t("paymentForm.amount")}
												className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-transparent"
											/>

											{/* Segment Columns */}
											{segmentTypes.map(st => {
												const options = getSegmentOptions(st.id);
												return (
													<div key={`${line.id}-${st.id}`} className="relative">
														<select
															value={getSegmentValue(line, st.id)}
															onChange={e =>
																handleSegmentChange(line.id, st.id, e.target.value)
															}
															className="w-full h-10 px-3 pr-8 text-sm bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-transparent"
														>
															<option value="">{t("paymentForm.selectAccount")}</option>
															{options.map(opt => (
																<option key={opt.value} value={opt.value}>
																	{opt.label}
																</option>
															))}
														</select>
														<FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
													</div>
												);
											})}

											{/* Delete */}
											<div className="flex justify-center">
												<button
													type="button"
													onClick={() => handleRemoveGLLine(line.id)}
													disabled={glLines.length === 1}
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
								onClick={handleAddGLLine}
								className="mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
							>
								<FaPlus className="w-3 h-3" />
								{t("paymentForm.addLine")}
							</button>
						</div>
					</div>
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
					onClick={handleReceivePayment}
					disabled={loading}
					className="px-6 py-2.5 text-sm font-medium text-white bg-[#4A9AAF] rounded-lg hover:bg-[#3d8294] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading
						? t("paymentForm.processing")
						: isEditMode
						? t("paymentForm.updatePayment")
						: t("paymentForm.receivePayment")}
				</button>
			</div>
		</div>
	);
};

export default ReceivePaymentForm;
