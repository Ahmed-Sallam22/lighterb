import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import Card from "../shared/Card";
import FloatingLabelInput from "../shared/FloatingLabelInput";
import FloatingLabelSelect from "../shared/FloatingLabelSelect";
import GLLinesSection from "../shared/GLLinesSection";
import Button from "../shared/Button";
import { createARInvoice } from "../../store/arInvoicesSlice";
import { createAPInvoice } from "../../store/apInvoicesSlice";
import { fetchCurrencies } from "../../store/currenciesSlice";
import { fetchCustomers } from "../../store/customersSlice";
import { fetchSuppliers } from "../../store/suppliersSlice";
import { fetchTaxRates } from "../../store/taxRatesSlice";
import { fetchCountries } from "../../store/countriesSlice";
import { fetchDefaultGLSegments, clearDefaultGLSegments } from "../../store/defaultCombinationsSlice";
// Static country options with ids expected by backend
// const countries = [
// 	{ value: 1, code: "AE", label: "United Arab Emirates (AE)" },
// 	{ value: 2, code: "US", label: "United States (US)" },
// 	{ value: 3, code: "GB", label: "United Kingdom (GB)" },
// 	{ value: 4, code: "SA", label: "Saudi Arabia (SA)" },
// ];

const paymentTermsOptions = [
	{ value: "NET30", label: "Net 30 Days" },
	{ value: "NET60", label: "Net 60 Days" },
	{ value: "NET90", label: "Net 90 Days" },
	{ value: "IMMEDIATE", label: "Immediate" },
	{ value: "COD", label: "Cash on Delivery" },
];

const goodsReceiptOptions = [
	{ value: "manual", label: "Manual Entry" },
	{ value: "gr-1219", label: "GR-1219 • Warehouse A" },
	{ value: "gr-1411", label: "GR-1411 • Abu Dhabi Port" },
];

const InvoiceForm = ({ isAPInvoice = false }) => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const { currencies } = useSelector(state => state.currencies);
	const { customers } = useSelector(state => state.customers);
	const { suppliers } = useSelector(state => state.suppliers);
	const { taxRates } = useSelector(state => state.taxRates);
	const { countries: fetchedCountries } = useSelector(state => state.countries);
	const { loading: invoiceLoading } = useSelector(state => (isAPInvoice ? state.apInvoices : state.arInvoices));
	const { defaultGLSegments } = useSelector(state => state.defaultCombinations);

	const countries = fetchedCountries.map(country => ({
		value: country.id,
		code: country.code || "N/A",
		label: `${country.name} `,
	}));

	const [invoiceForm, setInvoiceForm] = useState({
		customer: "",
		supplier: "",
		number: "",
		date: "",
		due_date: "",
		currency: "",
		country: 1, // backend expects country_id
		memo: "",
		payment_terms: "NET30",
		po_reference: "",
		vendor_invoice_number: "",
	});

	const [items, setItems] = useState([]);

	// GL Lines state for GLLinesSection
	const [glLines, setGLLines] = useState([]);
	const [glEntry, setGlEntry] = useState({
		date: "",
		currency_id: "",
		memo: "",
	});

	const [goodsReceipt, setGoodsReceipt] = useState("");

	// Track if default segments have been applied to avoid duplicate application
	const [defaultSegmentsApplied, setDefaultSegmentsApplied] = useState(false);

	// Fetch required data on mount
	useEffect(() => {
		dispatch(fetchCurrencies());
		dispatch(fetchCustomers());
		dispatch(fetchSuppliers());
		dispatch(fetchCountries());
		// Fetch default GL segments for the invoice type
		const transactionType = isAPInvoice ? "AP_INVOICE" : "AR_INVOICE";
		dispatch(fetchDefaultGLSegments(transactionType));

		return () => {
			dispatch(clearDefaultGLSegments());
		};
	}, [dispatch, isAPInvoice]);

	// Fetch tax rates when country changes
	useEffect(() => {
		if (invoiceForm.country) {
			dispatch(fetchTaxRates({ country: invoiceForm.country }));
		}
	}, [dispatch, invoiceForm.country]);

	// Sync glEntry date and currency with invoice form
	useEffect(() => {
		setGlEntry(prev => ({
			...prev,
			date: invoiceForm.date || prev.date,
			currency_id: invoiceForm.currency ? parseInt(invoiceForm.currency) : prev.currency_id,
			memo: invoiceForm.memo || prev.memo,
		}));
	}, [invoiceForm.date, invoiceForm.currency, invoiceForm.memo]);

	// Tax Rate options from Redux (filtered by country from API)
	const taxRateOptions = (taxRates || []).map(tax => ({
		value: tax.id,
		label: `${tax.name || "Tax"} - ${tax.rate}%`,
		rate: tax.rate,
		country: tax.country,
		country_code: tax.country_code,
		category: tax.category,
	}));

	// Currency options from Redux
	const currencyOptions = currencies.map(currency => ({
		value: currency.id,
		label: `${currency.code} - ${currency.name}`,
	}));

	// Customer options from Redux
	const customerOptions = customers.map(customer => ({
		value: customer.id,
		label: customer.name || `Customer ${customer.id}`,
	}));

	// Supplier options from Redux
	const supplierOptions = suppliers.map(supplier => ({
		value: supplier.id,
		label: supplier.name || `Supplier ${supplier.id}`,
	}));

	// Calculate invoice totals
	const invoiceSubtotal = items.reduce((sum, item) => {
		const qty = parseFloat(item.quantity) || 0;
		const price = parseFloat(item.unit_price) || 0;
		return sum + qty * price;
	}, 0);

	const invoiceTaxAmount = items.reduce((sum, item) => {
		const qty = parseFloat(item.quantity) || 0;
		const price = parseFloat(item.unit_price) || 0;
		const rate = parseFloat(item.tax_rate) || 0;
		const itemSubtotal = qty * price;
		return sum + itemSubtotal * (rate / 100);
	}, 0);

	const invoiceTotalAmount = invoiceSubtotal + invoiceTaxAmount;

	// Convert default GL segments from API format to GLLinesSection format
	const getDefaultCreditSegments = () => {
		if (!defaultGLSegments?.segments || !Array.isArray(defaultGLSegments.segments)) {
			return [];
		}
		return defaultGLSegments.segments.map(seg => ({
			segment_type_id: seg.segment_type_id,
			segment_code: seg.segment_code,
		}));
	};

	// Automatically manage CREDIT line to match invoice total
	useEffect(() => {
		if (invoiceTotalAmount > 0) {
			const creditLineId = "auto-credit-line";
			const existingCreditLine = glLines.find(line => line.id === creditLineId);

			if (existingCreditLine) {
				// Update existing CREDIT line amount
				if (parseFloat(existingCreditLine.amount) !== invoiceTotalAmount) {
					setGLLines(prev =>
						prev.map(line =>
							line.id === creditLineId ? { ...line, amount: invoiceTotalAmount.toFixed(2) } : line
						)
					);
				}
			} else {
				// Create default CREDIT line with default segments from API
				const defaultSegments = getDefaultCreditSegments();
				const newCreditLine = {
					id: creditLineId,
					type: "CREDIT",
					amount: invoiceTotalAmount.toFixed(2),
					segments: defaultSegments,
					isAutoCredit: true, // Flag to identify this as the auto-managed CREDIT line
				};
				setGLLines(prev => [newCreditLine, ...prev]);
				if (defaultSegments.length > 0) {
					setDefaultSegmentsApplied(true);
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [invoiceTotalAmount]);

	// Apply default segments to existing CREDIT line when defaultGLSegments is loaded
	useEffect(() => {
		if (defaultGLSegments?.segments && !defaultSegmentsApplied) {
			const creditLineId = "auto-credit-line";
			const existingCreditLine = glLines.find(line => line.id === creditLineId);

			if (existingCreditLine && existingCreditLine.segments.length === 0) {
				const defaultSegments = getDefaultCreditSegments();
				if (defaultSegments.length > 0) {
					setGLLines(prev =>
						prev.map(line => (line.id === creditLineId ? { ...line, segments: defaultSegments } : line))
					);
					setDefaultSegmentsApplied(true);
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultGLSegments, glLines, defaultSegmentsApplied]);

	// Get selected currency code for formatting
	const selectedCurrency = currencies.find(c => c.id === parseInt(invoiceForm.currency));
	const currencyCode = selectedCurrency?.code || "AED";

	const formatCurrency = value =>
		new Intl.NumberFormat("en-AE", { style: "currency", currency: currencyCode }).format(value);

	const handleInvoiceChange = e => {
		const { name, value } = e.target;
		setInvoiceForm(prev => ({ ...prev, [name]: value }));
	};

	const handleAddItem = () => {
		const newItem = {
			id: Date.now(),
			name: "", // Item name (required by API)
			description: "",
			quantity: "1", // String for API
			unit_price: "0.00",
			tax_rate_id: "", // Will store selected tax rate ID
			tax_rate: null, // Will store actual rate value
			tax_country: "",
			tax_category: "",
		};
		setItems(prev => [...prev, newItem]);
	};

	const handleItemChange = (itemId, field, value) => {
		setItems(prev =>
			prev.map(item => {
				if (item.id === itemId) {
					// If changing tax rate selection
					if (field === "tax_rate_id") {
						const selectedTaxRate = taxRateOptions.find(tr => tr.value === parseInt(value));
						if (selectedTaxRate) {
							return {
								...item,
								tax_rate_id: value,
								tax_rate: selectedTaxRate.rate,
								tax_country: selectedTaxRate.country || "AE",
								tax_category: selectedTaxRate.category || "STANDARD",
							};
						} else if (value === "EXEMPT") {
							// Special case for tax exempt
							return {
								...item,
								tax_rate_id: "EXEMPT",
								tax_rate: null,
								tax_country: invoiceForm.country || "AE",
								tax_category: "EXEMPT",
							};
						}
					}
					return { ...item, [field]: value };
				}
				return item;
			})
		);
	};

	const handleRemoveItem = itemId => {
		setItems(prev => prev.filter(item => item.id !== itemId));
		toast.success(t("invoiceForm.messages.itemRemoved"));
	};

	const handleCancel = () => {
		navigate(-1);
	};

	const handleSubmit = async e => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		console.log("Submit clicked", {
			invoiceForm,
			items,
			glLines,
			glEntry,
		});

		// Validate required fields
		const entityField = isAPInvoice ? "supplier" : "customer";
		if (!invoiceForm[entityField] || !invoiceForm.date || !invoiceForm.currency || !invoiceForm.country) {
			toast.error(t("invoiceForm.messages.requiredFields"));
			console.log("Validation failed: missing required fields");
			return;
		}

		if (items.length === 0) {
			toast.error(t("invoiceForm.messages.noItems"));
			console.log("Validation failed: no items");
			return;
		}

		// Validate GL lines
		if (glLines.length === 0) {
			toast.error(t("invoiceForm.messages.noGlLines"));
			console.log("Validation failed: no GL lines");
			return;
		}

		const totalDebit = glLines
			.filter(line => line.type === "DEBIT")
			.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
		const totalCredit = glLines
			.filter(line => line.type === "CREDIT")
			.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);

		if (Math.abs(totalDebit - totalCredit) >= 0.01) {
			toast.error(t("invoiceForm.messages.glNotBalanced"));
			console.log("Validation failed: GL not balanced", { totalDebit, totalCredit });
			return;
		}

		const glTotal = totalDebit;
		if (Math.abs(invoiceTotalAmount - glTotal) >= 0.01) {
			toast.error(
				t("invoiceForm.messages.totalsMismatch", {
					invoiceTotal: formatCurrency(invoiceTotalAmount),
					glTotal: formatCurrency(glTotal),
				})
			);
			console.log("Validation failed: totals mismatch", { invoiceTotalAmount, glTotal });
			return;
		}

		// Prepare items for API - name, description, quantity (string), unit_price (string)
		const formattedItems = items.map((item, idx) => {
			const name = item.name || item.description || `Item ${idx + 1}`;
			return {
				name,
				description: item.description || name,
				quantity: String(parseFloat(item.quantity) || 0),
				unit_price: String(parseFloat(item.unit_price) || 0).includes(".")
					? String(parseFloat(item.unit_price).toFixed(2))
					: String(parseFloat(item.unit_price) || 0) + ".00",
			};
		});

		// Build journal entry from GL lines (GLLinesSection format)
		const journalEntry = {
			date: glEntry.date || invoiceForm.date,
			currency_id: glEntry.currency_id || parseInt(invoiceForm.currency),
			memo: glEntry.memo || invoiceForm.memo || (isAPInvoice ? "AP Invoice" : "AR Invoice"),
			lines: glLines.map(line => ({
				amount: String(parseFloat(line.amount).toFixed(2)),
				type: line.type,
				segments: (line.segments || [])
					.filter(seg => seg.segment_code) // Only include segments with a code
					.map(seg => ({
						segment_type_id: seg.segment_type_id,
						segment_code: seg.segment_code,
					})),
			})),
		};

		// Prepare invoice data according to exact API structure
		const invoiceData = {
			date: invoiceForm.date,
			currency_id: parseInt(invoiceForm.currency),
			country_id: parseInt(invoiceForm.country) || 1,
			tax_amount: invoiceTaxAmount.toFixed(2),
			items: formattedItems,
			journal_entry: journalEntry,
		};

		if (isAPInvoice) {
			invoiceData.supplier_id = parseInt(invoiceForm.supplier);
		} else {
			invoiceData.customer_id = parseInt(invoiceForm.customer);
		}

		try {
			console.log("Submitting invoice data:", invoiceData);
			let result;
			if (isAPInvoice) {
				result = await dispatch(createAPInvoice(invoiceData)).unwrap();
				console.log("AP Invoice created:", result);
				toast.success(t("invoiceForm.messages.apCreated"));
			} else {
				result = await dispatch(createARInvoice(invoiceData)).unwrap();
				console.log("AR Invoice created:", result);
				toast.success(t("invoiceForm.messages.arCreated"));
			}
			navigate(-1);
		} catch (error) {
			console.error("Create invoice error:", error);

			// The error from unwrap() is already processed by the slice
			// It can be a string (from rejectWithValue) or an Error object
			let message = t("invoiceForm.messages.createFailed");

			if (typeof error === "string") {
				// Error is already a processed string from the slice
				message = error;
			} else if (error?.message) {
				message = error.message;
			}

			console.log("Displaying error toast:", message);
			toast.error(message, {
				autoClose: 8000, // Show longer for error messages
				style: { whiteSpace: "pre-wrap" }, // Allow line breaks
			});
		}
	};

	return (
		<div className="max-w-6xl mx-auto mt-5 pb-10 space-y-5">
			{/* Goods Receipt Link (AP Invoice Only) */}
			{/* {isAPInvoice && (
				<Card title={t("invoiceForm.goodsReceipt.title")} subtitle={t("invoiceForm.goodsReceipt.subtitle")}>
					<div className="grid grid-cols-1 gap-6">
						<FloatingLabelSelect
							label={t("invoiceForm.goodsReceipt.label")}
							name="goodsReceipt"
							value={goodsReceipt}
							onChange={e => setGoodsReceipt(e.target.value)}
							options={goodsReceiptOptions}
							placeholder={t("invoiceForm.goodsReceipt.placeholder")}
						/>
						<p className="text-xs text-[#7A9098]">{t("invoiceForm.goodsReceipt.helper")}</p>
					</div>
				</Card>
			)} */}

			{/* Invoice Details */}
			<Card title={t("invoiceForm.details.title")}>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<FloatingLabelSelect
						label={isAPInvoice ? t("invoiceForm.details.supplier") : t("invoiceForm.details.customer")}
						name={isAPInvoice ? "supplier" : "customer"}
						value={isAPInvoice ? invoiceForm.supplier : invoiceForm.customer}
						onChange={handleInvoiceChange}
						options={isAPInvoice ? supplierOptions : customerOptions}
						required
						placeholder={
							isAPInvoice
								? t("invoiceForm.details.selectSupplier")
								: t("invoiceForm.details.selectCustomer")
						}
					/>

					<FloatingLabelInput
						label={t("invoiceForm.details.invoiceNumber")}
						name="number"
						type="text"
						value={invoiceForm.number}
						onChange={handleInvoiceChange}
						placeholder={
							isAPInvoice
								? t("invoiceForm.details.invoiceNumberPlaceholderAP")
								: t("invoiceForm.details.invoiceNumberPlaceholderAR")
						}
					/>

					<FloatingLabelInput
						label={t("invoiceForm.details.invoiceDate")}
						name="date"
						type="date"
						value={invoiceForm.date}
						onChange={handleInvoiceChange}
						required
						placeholder={t("invoiceForm.details.datePlaceholder")}
					/>

					<FloatingLabelInput
						label={t("invoiceForm.details.dueDate")}
						name="due_date"
						type="date"
						value={invoiceForm.due_date}
						onChange={handleInvoiceChange}
						required
						placeholder={t("invoiceForm.details.datePlaceholder")}
					/>

					<FloatingLabelSelect
						label={t("invoiceForm.details.currency")}
						name="currency"
						value={invoiceForm.currency}
						onChange={handleInvoiceChange}
						options={currencyOptions}
						required
						placeholder={t("invoiceForm.details.selectCurrency")}
					/>

					<FloatingLabelSelect
						label={t("invoiceForm.details.country")}
						name="country"
						value={invoiceForm.country}
						onChange={handleInvoiceChange}
						options={countries}
						required
						placeholder={t("invoiceForm.details.selectCountry")}
					/>

					{isAPInvoice && (
						<>
							{/* <FloatingLabelSelect
								label={t("invoiceForm.details.paymentTerms")}
								name="payment_terms"
								value={invoiceForm.payment_terms}
								onChange={handleInvoiceChange}
								options={paymentTermsOptions}
								placeholder={t("invoiceForm.details.selectPaymentTerms")}
							/> */}

							{/* <FloatingLabelInput
								label={t("invoiceForm.details.poReference")}
								name="po_reference"
								type="text"
								value={invoiceForm.po_reference}
								onChange={handleInvoiceChange}
								placeholder={t("invoiceForm.details.poReferencePlaceholder")}
							/> */}

							{/* <FloatingLabelInput
								label={t("invoiceForm.details.vendorInvoiceNumber")}
								name="vendor_invoice_number"
								type="text"
								value={invoiceForm.vendor_invoice_number}
								onChange={handleInvoiceChange}
								placeholder={t("invoiceForm.details.vendorInvoiceNumberPlaceholder")}
							/> */}

							<div className="sm:col-span-2">
								<FloatingLabelInput
									label={t("invoiceForm.details.memo")}
									name="memo"
									type="text"
									value={invoiceForm.memo}
									onChange={handleInvoiceChange}
									placeholder={t("invoiceForm.details.memoPlaceholder")}
								/>
							</div>
						</>
					)}
				</div>
			</Card>

			{/* Line Items */}
			<Card
				title={t("invoiceForm.items.title")}
				subtitle={t("invoiceForm.items.subtitle", { count: items.length })}
				actionSlot={
					<button
						type="button"
						onClick={handleAddItem}
						className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#48C1F0] text-[#48C1F0] text-sm font-semibold hover:bg-[#48C1F0]/10 transition-colors"
					>
						{t("invoiceForm.items.addNew")}
					</button>
				}
			>
				{items.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-[#b6c4cc] bg-[#f5f8fb] p-6 text-center text-[#567086]">
						<p className="text-lg font-semibold mb-2">{t("invoiceForm.items.noItems")}</p>
						<p className="text-sm mb-6">{t("invoiceForm.items.noItemsDesc")}</p>
						<Button
							type="button"
							onClick={handleAddItem}
							className="px-4 py-2 rounded-full bg-[#0d5f7a] text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform"
							title={t("invoiceForm.items.addFirst")}
						/>
					</div>
				) : (
					<div className="">
						<table className="w-full border-collapse">
							<thead>
								<tr className="border-b border-gray-200 bg-gray-50">
									<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										{t("invoiceForm.items.name")}
									</th>
									<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										{t("invoiceForm.items.description")}
									</th>
									<th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
										{t("invoiceForm.items.quantity")}
									</th>
									<th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
										{t("invoiceForm.items.unitPrice")}
									</th>
									{!isAPInvoice && (
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											{t("invoiceForm.items.taxRate")}
										</th>
									)}

									<th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
										{t("invoiceForm.items.actions")}
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{items.map(item => {
									return (
										<tr key={item.id} className="hover:bg-gray-50 transition-colors">
											<td className="px-4 py-3">
												<FloatingLabelInput
													label={t("invoiceForm.items.name")}
													type="text"
													value={item.name}
													onChange={e => handleItemChange(item.id, "name", e.target.value)}
													placeholder={t("invoiceForm.items.namePlaceholder")}
												/>
											</td>
											<td className="px-4 py-3">
												<FloatingLabelInput
													label={t("invoiceForm.items.description")}
													type="text"
													value={item.description}
													onChange={e =>
														handleItemChange(item.id, "description", e.target.value)
													}
													placeholder={t("invoiceForm.items.descriptionPlaceholder")}
												/>
											</td>
											<td className="px-4 py-3">
												<FloatingLabelInput
													label={t("invoiceForm.items.quantity")}
													type="number"
													step="1"
													value={item.quantity}
													onChange={e =>
														handleItemChange(item.id, "quantity", e.target.value)
													}
													placeholder={t("invoiceForm.items.quantityPlaceholder")}
												/>
											</td>
											<td className="px-4 py-3">
												<FloatingLabelInput
													label={t("invoiceForm.items.unitPrice")}
													type="number"
													step="0.01"
													value={item.unit_price}
													onChange={e =>
														handleItemChange(item.id, "unit_price", e.target.value)
													}
													placeholder={t("invoiceForm.items.unitPricePlaceholder")}
												/>
											</td>
											{!isAPInvoice && (
												<td className="px-4 py-3">
													<FloatingLabelSelect
														label={t("invoiceForm.items.taxRate")}
														value={item.tax_rate_id || ""}
														onChange={e =>
															handleItemChange(item.id, "tax_rate_id", e.target.value)
														}
														options={[
															{ value: "", label: t("invoiceForm.items.selectTaxRate") },
															{
																value: "EXEMPT",
																label: t("invoiceForm.items.taxExempt"),
															},
															...taxRateOptions,
														]}
													/>
												</td>
											)}

											<td className="px-4 py-3 text-center">
												<Button
													type="button"
													onClick={() => handleRemoveItem(item.id)}
													className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors bg-transparent shadow-none hover:shadow-none"
													title={t("invoiceForm.items.deleteItem")}
													icon={
														<svg
															className="w-5 h-5"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
															/>
														</svg>
													}
												/>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>

						{/* Invoice Totals Summary */}
						<div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
							<div className="grid grid-cols-3 gap-4">
								<div className="text-center">
									<p className="text-xs text-gray-500 uppercase">
										{t("invoiceForm.totals.subtotal")}
									</p>
									<p className="text-lg font-bold text-gray-800">{formatCurrency(invoiceSubtotal)}</p>
								</div>
								<div className="text-center">
									<p className="text-xs text-gray-500 uppercase">{t("invoiceForm.totals.tax")}</p>
									<p className="text-lg font-bold text-gray-800">
										{formatCurrency(invoiceTaxAmount)}
									</p>
								</div>
								<div className="text-center border-l-2 border-[#0d5f7a]">
									<p className="text-xs text-[#0d5f7a] uppercase font-semibold">
										{t("invoiceForm.totals.invoiceTotal")}
									</p>
									<p className="text-xl font-bold text-[#0d5f7a]">
										{formatCurrency(invoiceTotalAmount)}
									</p>
								</div>
							</div>
						</div>
					</div>
				)}
			</Card>

			{/* GL Lines Section */}
			<Card title={t("invoiceForm.glDistribution.title")} subtitle={t("invoiceForm.glDistribution.subtitle")}>
				<GLLinesSection
					lines={glLines}
					onChange={setGLLines}
					glEntry={glEntry}
					onGlEntryChange={setGlEntry}
					showGlEntryHeader={false}
					title=""
					invoiceTotal={invoiceTotalAmount}
				/>

				{/* Invoice Total vs GL Total Comparison */}
				{glLines.length > 0 && (
					<div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium text-gray-700">
								{t("invoiceForm.glDistribution.invoiceTotal")}:
							</span>
							<span className="text-lg font-bold text-[#0d5f7a]">
								{formatCurrency(invoiceTotalAmount)}
							</span>
						</div>
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium text-gray-700">
								{t("invoiceForm.glDistribution.glTotalDebits")}:
							</span>
							<span className="text-lg font-bold text-[#0d5f7a]">
								{formatCurrency(
									glLines
										.filter(line => line.type === "DEBIT")
										.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0)
								)}
							</span>
						</div>
						<div className="border-t border-blue-200 pt-2 mt-2">
							{(() => {
								const glTotal = glLines
									.filter(line => line.type === "DEBIT")
									.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
								const isMatching = Math.abs(invoiceTotalAmount - glTotal) < 0.01;
								return isMatching ? (
									<span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
												clipRule="evenodd"
											/>
										</svg>
										Totals match - ready to create invoice
									</span>
								) : (
									<div>
										<span className="inline-flex items-center gap-1 text-amber-600 text-sm font-medium">
											<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
												<path
													fillRule="evenodd"
													d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
													clipRule="evenodd"
												/>
											</svg>
											{t("invoiceForm.glDistribution.totalsMismatch", {
												difference: formatCurrency(Math.abs(invoiceTotalAmount - glTotal)),
											})}
										</span>
										<p className="text-xs text-gray-500 mt-1">
											{t("invoiceForm.glDistribution.adjustHelper")}
										</p>
									</div>
								);
							})()}
						</div>
					</div>
				)}
			</Card>

			{/* Action Buttons */}
			<div className="mt-6 flex flex-wrap justify-end gap-3">
				<Button
					type="button"
					onClick={handleCancel}
					className="px-6 py-2 rounded-full border border-[#7A9098] text-[#7A9098] font-semibold hover:bg-[#f1f5f8] transition-colors bg-transparent shadow-none hover:shadow-none"
					title={t("invoiceForm.actions.cancel")}
				/>
				<Button
					type="button"
					onClick={handleSubmit}
					disabled={invoiceLoading}
					className="px-8 py-2 rounded-full bg-[#0d5f7a] text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
					title={invoiceLoading ? t("invoiceForm.actions.creating") : t("invoiceForm.actions.createInvoice")}
				/>
			</div>

			{/* Toast Container */}
			<ToastContainer
				position="top-right"
				autoClose={5000}
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

export default InvoiceForm;
