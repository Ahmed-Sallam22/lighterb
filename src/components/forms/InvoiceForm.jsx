import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Card from "../shared/Card";
import FloatingLabelInput from "../shared/FloatingLabelInput";
import FloatingLabelSelect from "../shared/FloatingLabelSelect";
import { createARInvoice } from "../../store/arInvoicesSlice";
import { createAPInvoice } from "../../store/apInvoicesSlice";
import { fetchCurrencies } from "../../store/currenciesSlice";
import { fetchCustomers } from "../../store/customersSlice";
import { fetchSuppliers } from "../../store/suppliersSlice";
import { fetchTaxRates } from "../../store/taxRatesSlice";
import { fetchSegmentTypes, fetchSegmentValues } from "../../store/segmentsSlice";
import { fetchJournals, fetchJournalById, clearSelectedJournal } from "../../store/journalsSlice";

// Static country options with ids expected by backend
const countries = [
	{ value: 1, code: "AE", label: "United Arab Emirates (AE)" },
	{ value: 2, code: "US", label: "United States (US)" },
	{ value: 3, code: "GB", label: "United Kingdom (GB)" },
	{ value: 4, code: "SA", label: "Saudi Arabia (SA)" },
];

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
	const { currencies } = useSelector(state => state.currencies);
	const { customers } = useSelector(state => state.customers);
	const { suppliers } = useSelector(state => state.suppliers);
	const { taxRates } = useSelector(state => state.taxRates);
	const { types: segmentTypes = [], values: segmentValues = [] } = useSelector(state => state.segments);
	const { journals = [], selectedJournal, loading: journalsLoading } = useSelector(state => state.journals);
	const { loading: invoiceLoading } = useSelector(state => (isAPInvoice ? state.apInvoices : state.arInvoices));

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
	const [glLines, setGLLines] = useState([]);
	const [segmentFormState, setSegmentFormState] = useState({}); // Track segment form for each GL line

	const [goodsReceipt, setGoodsReceipt] = useState("");

	// Journal entry selection state
	const [journalEntryMode, setJournalEntryMode] = useState("select"); // 'select' or 'create'
	const [selectedJournalId, setSelectedJournalId] = useState("");

	// Fetch required data on mount
	useEffect(() => {
		dispatch(fetchCurrencies());
		dispatch(fetchCustomers());
		dispatch(fetchSuppliers());
		dispatch(fetchTaxRates());
		// Always fetch segments so we can build GL entries for AP/AR
		dispatch(fetchSegmentTypes());
		dispatch(fetchSegmentValues());
		// Fetch journal entries
		dispatch(fetchJournals());

		// Cleanup on unmount
		return () => {
			dispatch(clearSelectedJournal());
		};
	}, [dispatch]);

	// When a journal entry is selected, fetch its details
	useEffect(() => {
		if (selectedJournalId && journalEntryMode === "select") {
			dispatch(fetchJournalById(selectedJournalId));
		} else {
			dispatch(clearSelectedJournal());
		}
	}, [selectedJournalId, journalEntryMode, dispatch]);

	// Tax Rate options from Redux
	const taxRateOptions = (taxRates || []).map(tax => ({
		value: tax.id,
		label: `${tax.name || "Tax"} - ${tax.rate}% (${tax.country || "N/A"})`,
		rate: tax.rate,
		country: tax.country,
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

	const formatCurrency = value =>
		new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(value);

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
		toast.success("Item added");
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
		toast.success("Item removed");
	};

	const handleAddGLLine = () => {
		const newGLLine = {
			id: Date.now(),
			line_type: "DEBIT",
			amount: "0.00",
			description: "",
			segments: [],
		};
		setGLLines(prev => [...prev, newGLLine]);
	};

	const handleGLLineChange = (lineId, field, value) => {
		setGLLines(prev => prev.map(line => (line.id === lineId ? { ...line, [field]: value } : line)));
	};

	const handleSegmentFormChange = (lineId, field, value) => {
		const currentSegmentForm = segmentFormState[lineId] || { segment_type: "", segment: "" };

		const updatedForm = {
			...currentSegmentForm,
			[field]: value,
			// Reset segment value when segment type changes
			...(field === "segment_type" ? { segment: "" } : {}),
		};

		setSegmentFormState(prev => ({
			...prev,
			[lineId]: updatedForm,
		}));

		// Auto-add segment when both segment_type and segment are selected
		if (field === "segment" && value && updatedForm.segment_type) {
			const segmentType = segmentTypes.find(st => st.segment_id === parseInt(updatedForm.segment_type));
			const segmentValue = segmentValues.find(sv => sv.id === parseInt(value));

			const newSegment = {
				id: Date.now(),
				segment_type: parseInt(updatedForm.segment_type),
				segment: parseInt(value),
				// Store display names for UI
				segment_type_name:
					segmentType?.segment_name || segmentType?.segment_type || `Type ${updatedForm.segment_type}`,
				segment_value_name: segmentValue?.alias || segmentValue?.name || `Value ${value}`,
				segment_code: segmentValue?.code,
			};

			setGLLines(prev =>
				prev.map(line => {
					if (line.id === lineId) {
						return {
							...line,
							segments: [...(line.segments || []), newSegment],
						};
					}
					return line;
				})
			);

			// Reset segment form for this line
			setSegmentFormState(prev => ({
				...prev,
				[lineId]: { segment_type: "", segment: "" },
			}));

			toast.success("Segment added automatically");
		}
	};

	const handleRemoveSegmentFromLine = (lineId, segmentId) => {
		setGLLines(prev =>
			prev.map(line => {
				if (line.id === lineId) {
					return {
						...line,
						segments: line.segments.filter(seg => seg.id !== segmentId),
					};
				}
				return line;
			})
		);
		toast.success("Segment removed");
	};

	const handleRemoveGLLine = lineId => {
		setGLLines(prev => prev.filter(line => line.id !== lineId));
		toast.success("GL line removed");
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
			journalEntryMode,
			selectedJournalId,
			selectedJournal,
		});

		// Validate required fields
		const entityField = isAPInvoice ? "supplier" : "customer";
		if (!invoiceForm[entityField] || !invoiceForm.date || !invoiceForm.currency || !invoiceForm.country) {
			toast.error("Please fill all required fields");
			console.log("Validation failed: missing required fields");
			return;
		}

		if (items.length === 0) {
			toast.error("Please add at least one item");
			console.log("Validation failed: no items");
			return;
		}

		// Validate journal entry based on mode
		if (journalEntryMode === "select") {
			if (!selectedJournalId || !selectedJournal) {
				toast.error("Please select a journal entry");
				console.log("Validation failed: no journal entry selected");
				return;
			}

			// Just warn if totals don't match, but don't block submission
			const journalTotal = parseFloat(selectedJournal.total_debit) || 0;
			if (Math.abs(invoiceTotalAmount - journalTotal) >= 0.01) {
				console.log("Warning: Invoice total does not match journal entry total", {
					invoiceTotalAmount,
					journalTotal,
				});
				// Optional: show warning but continue
			}
		} else {
			// Creating new journal entry - validate GL lines
			if (glLines.length === 0) {
				toast.error("Please add at least one GL distribution line");
				console.log("Validation failed: no GL lines");
				return;
			}

			const totalDebit = glLines
				.filter(line => line.line_type === "DEBIT")
				.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
			const totalCredit = glLines
				.filter(line => line.line_type === "CREDIT")
				.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);

			if (Math.abs(totalDebit - totalCredit) >= 0.01) {
				toast.error("GL distribution lines are not balanced. Debits must equal Credits.");
				console.log("Validation failed: GL not balanced", { totalDebit, totalCredit });
				return;
			}

			const glTotal = totalDebit;
			if (Math.abs(invoiceTotalAmount - glTotal) >= 0.01) {
				toast.error(
					`Invoice total (${formatCurrency(
						invoiceTotalAmount
					)}) must match GL distribution total (${formatCurrency(glTotal)})`
				);
				console.log("Validation failed: totals mismatch", { invoiceTotalAmount, glTotal });
				return;
			}
		}

		// helper to find segment code
		const getSegmentCode = id => segmentValues.find(v => v.id === parseInt(id))?.code;

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

		// Build journal entry based on mode
		let journalEntry;
		if (journalEntryMode === "select" && selectedJournal) {
			// Use selected journal entry - transform lines to API format
			journalEntry = {
				date: selectedJournal.date,
				currency_id: selectedJournal.currency_id,
				memo: selectedJournal.memo || (isAPInvoice ? "AP Invoice" : "AR Invoice"),
				lines: selectedJournal.lines.map(line => ({
					amount: String(parseFloat(line.amount).toFixed(2)),
					type: line.type,
					segments: line.segment_details.map(seg => ({
						segment_type_id: seg.segment_type_id,
						segment_code: seg.segment_code,
					})),
				})),
			};
		} else {
			// Create new journal entry from GL lines
			journalEntry = {
				date: invoiceForm.date,
				currency_id: parseInt(invoiceForm.currency),
				memo: invoiceForm.memo || (isAPInvoice ? "AP Invoice" : "AR Invoice"),
				lines: glLines.map(line => ({
					amount: String(parseFloat(line.amount).toFixed(2)),
					type: line.line_type,
					segments: (line.segments || []).map(seg => ({
						segment_type_id: seg.segment_type,
						segment_code: seg.segment_code || getSegmentCode(seg.segment),
					})),
				})),
			};
		}

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
				toast.success("AP Invoice created successfully");
			} else {
				result = await dispatch(createARInvoice(invoiceData)).unwrap();
				console.log("AR Invoice created:", result);
				toast.success("AR Invoice created successfully");
			}
			navigate(-1);
		} catch (error) {
			console.error("Create invoice error:", error);

			// The error from unwrap() is already processed by the slice
			// It can be a string (from rejectWithValue) or an Error object
			let message = "Failed to create invoice";

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
			{isAPInvoice && (
				<Card title="Link to Goods Receipt (Optional)" subtitle="Select Goods Receipt Needing Invoice">
					<div className="grid grid-cols-1 gap-6">
						<FloatingLabelSelect
							label="Goods Receipt"
							name="goodsReceipt"
							value={goodsReceipt}
							onChange={e => setGoodsReceipt(e.target.value)}
							options={goodsReceiptOptions}
							placeholder="Select goods receipt"
						/>
						<p className="text-xs text-[#7A9098]">
							Found goods receipts needing invoices. Select one to auto-populate invoice details.
						</p>
					</div>
				</Card>
			)}

			{/* Invoice Details */}
			<Card title="Invoice Details">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<FloatingLabelSelect
						label={isAPInvoice ? "Supplier" : "Customer"}
						name={isAPInvoice ? "supplier" : "customer"}
						value={isAPInvoice ? invoiceForm.supplier : invoiceForm.customer}
						onChange={handleInvoiceChange}
						options={isAPInvoice ? supplierOptions : customerOptions}
						required
						placeholder={`Select ${isAPInvoice ? "supplier" : "customer"}`}
					/>

					<FloatingLabelInput
						label="Invoice Number"
						name="number"
						type="text"
						value={invoiceForm.number}
						onChange={handleInvoiceChange}
						placeholder={`e.g., ${
							isAPInvoice ? "AP-INV-2025-001" : "AR-INV-2025-001"
						} (auto-generated if empty)`}
					/>

					<FloatingLabelInput
						label="Invoice Date"
						name="date"
						type="date"
						value={invoiceForm.date}
						onChange={handleInvoiceChange}
						required
						placeholder="dd/mm/yyyy"
					/>

					<FloatingLabelInput
						label="Due Date"
						name="due_date"
						type="date"
						value={invoiceForm.due_date}
						onChange={handleInvoiceChange}
						required
						placeholder="dd/mm/yyyy"
					/>

					<FloatingLabelSelect
						label="Currency"
						name="currency"
						value={invoiceForm.currency}
						onChange={handleInvoiceChange}
						options={currencyOptions}
						required
						placeholder="Select currency"
					/>

					<FloatingLabelSelect
						label="Country"
						name="country"
						value={invoiceForm.country}
						onChange={handleInvoiceChange}
						options={countries}
						required
						placeholder="Select country"
					/>

					{isAPInvoice && (
						<>
							<FloatingLabelSelect
								label="Payment Terms"
								name="payment_terms"
								value={invoiceForm.payment_terms}
								onChange={handleInvoiceChange}
								options={paymentTermsOptions}
								placeholder="Select payment terms"
							/>

							<FloatingLabelInput
								label="PO Reference"
								name="po_reference"
								type="text"
								value={invoiceForm.po_reference}
								onChange={handleInvoiceChange}
								placeholder="e.g., PO-2025-456"
							/>

							<FloatingLabelInput
								label="Vendor Invoice Number"
								name="vendor_invoice_number"
								type="text"
								value={invoiceForm.vendor_invoice_number}
								onChange={handleInvoiceChange}
								placeholder="e.g., VENDOR-INV-789"
							/>

							<div className="sm:col-span-2">
								<FloatingLabelInput
									label="Memo"
									name="memo"
									type="text"
									value={invoiceForm.memo}
									onChange={handleInvoiceChange}
									placeholder="Invoice notes or description"
								/>
							</div>
						</>
					)}
				</div>
			</Card>

			{/* Line Items */}
			<Card
				title="Line Items"
				subtitle={`${items.length} item${items.length !== 1 ? "s" : ""} added`}
				actionSlot={
					<button
						type="button"
						onClick={handleAddItem}
						className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#48C1F0] text-[#48C1F0] text-sm font-semibold hover:bg-[#48C1F0]/10 transition-colors"
					>
						+ New Item
					</button>
				}
			>
				{items.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-[#b6c4cc] bg-[#f5f8fb] p-6 text-center text-[#567086]">
						<p className="text-lg font-semibold mb-2">No items added yet</p>
						<p className="text-sm mb-6">Add items to build your invoice.</p>
						<button
							type="button"
							onClick={handleAddItem}
							className="px-4 py-2 rounded-full bg-[#0d5f7a] text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform"
						>
							+ Add First Item
						</button>
					</div>
				) : (
					<div className="">
						<table className="w-full border-collapse">
							<thead>
								<tr className="border-b border-gray-200 bg-gray-50">
									<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Name
									</th>
									<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Description
									</th>
									<th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Quantity
									</th>
									<th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Unit Price
									</th>
									{!isAPInvoice && (
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Tax Rate
										</th>
									)}

									<th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{items.map(item => {
									return (
										<tr key={item.id} className="hover:bg-gray-50 transition-colors">
											<td className="px-4 py-3">
												<FloatingLabelInput
													label="Name"
													type="text"
													value={item.name}
													onChange={e => handleItemChange(item.id, "name", e.target.value)}
													placeholder="Item name"
												/>
											</td>
											<td className="px-4 py-3">
												<FloatingLabelInput
													label="Description"
													type="text"
													value={item.description}
													onChange={e =>
														handleItemChange(item.id, "description", e.target.value)
													}
													placeholder="Item description"
												/>
											</td>
											<td className="px-4 py-3">
												<FloatingLabelInput
													label="Quantity"
													type="number"
													step="1"
													value={item.quantity}
													onChange={e =>
														handleItemChange(item.id, "quantity", e.target.value)
													}
													placeholder="1"
												/>
											</td>
											<td className="px-4 py-3">
												<FloatingLabelInput
													label="Unit Price"
													type="number"
													step="0.01"
													value={item.unit_price}
													onChange={e =>
														handleItemChange(item.id, "unit_price", e.target.value)
													}
													placeholder="0.00"
												/>
											</td>
											{!isAPInvoice && (
												<td className="px-4 py-3">
													<FloatingLabelSelect
														label="Tax Rate"
														value={item.tax_rate_id || ""}
														onChange={e =>
															handleItemChange(item.id, "tax_rate_id", e.target.value)
														}
														options={[
															{ value: "", label: "Select Tax Rate" },
															{ value: "EXEMPT", label: "Tax Exempt (0%)" },
															...taxRateOptions,
														]}
													/>
												</td>
											)}

											<td className="px-4 py-3 text-center">
												<button
													type="button"
													onClick={() => handleRemoveItem(item.id)}
													className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
													title="Delete item"
												>
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
												</button>
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
									<p className="text-xs text-gray-500 uppercase">Subtotal</p>
									<p className="text-lg font-bold text-gray-800">{formatCurrency(invoiceSubtotal)}</p>
								</div>
								<div className="text-center">
									<p className="text-xs text-gray-500 uppercase">Tax</p>
									<p className="text-lg font-bold text-gray-800">
										{formatCurrency(invoiceTaxAmount)}
									</p>
								</div>
								<div className="text-center border-l-2 border-[#0d5f7a]">
									<p className="text-xs text-[#0d5f7a] uppercase font-semibold">Invoice Total</p>
									<p className="text-xl font-bold text-[#0d5f7a]">
										{formatCurrency(invoiceTotalAmount)}
									</p>
								</div>
							</div>
						</div>
					</div>
				)}
			</Card>

			{/* Journal Entry Section */}
			<Card title="Journal Entry" subtitle="Select an existing journal entry or create new GL distribution lines">
				{/* Mode Selection Tabs */}
				<div className="flex gap-4 mb-6 border-b border-gray-200">
					<button
						type="button"
						onClick={() => {
							setJournalEntryMode("select");
							setGLLines([]);
						}}
						className={`pb-3 px-4 font-semibold text-sm transition-colors ${
							journalEntryMode === "select"
								? "text-[#0d5f7a] border-b-2 border-[#0d5f7a]"
								: "text-gray-500 hover:text-gray-700"
						}`}
					>
						Select Existing Journal Entry
					</button>
				</div>

				{/* Select Existing Journal Entry Mode */}
				{journalEntryMode === "select" && (
					<div className="space-y-4">
						<FloatingLabelSelect
							label="Select Journal Entry"
							value={selectedJournalId}
							onChange={e => setSelectedJournalId(e.target.value)}
							options={[
								{ value: "", label: "Choose a journal entry..." },
								...(journals || []).map(journal => ({
									value: String(journal.id),
									label: `#${journal.id} - ${journal.memo || "No memo"} (${journal.currency_code} ${
										journal.total_debit
									}) - ${journal.date}`,
								})),
							]}
						/>

						{journalsLoading && (
							<div className="text-center text-gray-500 py-4">
								<div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full"></div>
								<span className="ml-2">Loading journal entry details...</span>
							</div>
						)}

						{/* Display Selected Journal Entry Details */}
						{selectedJournal && !journalsLoading && (
							<div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
									<div>
										<p className="text-xs text-gray-500 uppercase">Date</p>
										<p className="font-semibold text-gray-800">{selectedJournal.date}</p>
									</div>
									<div>
										<p className="text-xs text-gray-500 uppercase">Currency</p>
										<p className="font-semibold text-gray-800">{selectedJournal.currency_code}</p>
									</div>
									<div>
										<p className="text-xs text-gray-500 uppercase">Total</p>
										<p className="font-semibold text-gray-800">
											{formatCurrency(parseFloat(selectedJournal.total_debit) || 0)}
										</p>
									</div>
									<div>
										<p className="text-xs text-gray-500 uppercase">Status</p>
										<span
											className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
												selectedJournal.is_balanced
													? "bg-green-100 text-green-800"
													: "bg-red-100 text-red-800"
											}`}
										>
											{selectedJournal.is_balanced ? "Balanced" : "Not Balanced"}
										</span>
									</div>
								</div>

								{selectedJournal.memo && (
									<div className="mb-4">
										<p className="text-xs text-gray-500 uppercase">Memo</p>
										<p className="text-gray-700">{selectedJournal.memo}</p>
									</div>
								)}

								{/* Journal Lines Table */}
								<div className="overflow-x-auto">
									<table className="w-full border-collapse">
										<thead>
											<tr className="border-b border-gray-300 bg-gray-100">
												<th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
													Type
												</th>
												<th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
													Amount
												</th>
												<th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
													Segments
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-200">
											{selectedJournal.lines?.map((line, idx) => (
												<tr key={line.id || idx} className="hover:bg-gray-100">
													<td className="px-3 py-2">
														<span
															className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
																line.type === "DEBIT"
																	? "bg-red-100 text-red-800"
																	: "bg-green-100 text-green-800"
															}`}
														>
															{line.type}
														</span>
													</td>
													<td className="px-3 py-2 text-right font-mono font-semibold">
														{formatCurrency(parseFloat(line.amount) || 0)}
													</td>
													<td className="px-3 py-2">
														<div className="flex flex-wrap gap-1">
															{line.segment_details?.map((seg, segIdx) => (
																<span
																	key={segIdx}
																	className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
																	title={seg.segment_alias}
																>
																	{seg.segment_type_name}: {seg.segment_code}
																</span>
															))}
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								{/* Validation Message */}
								<div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium text-gray-700">Invoice Items Total:</span>
										<span className="text-lg font-bold text-[#0d5f7a]">
											{formatCurrency(invoiceTotalAmount)}
										</span>
									</div>
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium text-gray-700">Journal Entry Total:</span>
										<span className="text-lg font-bold text-[#0d5f7a]">
											{formatCurrency(parseFloat(selectedJournal.total_debit) || 0)}
										</span>
									</div>
									<div className="border-t border-blue-200 pt-2 mt-2">
										{Math.abs(invoiceTotalAmount - (parseFloat(selectedJournal.total_debit) || 0)) <
										0.01 ? (
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
													Totals don't match (Difference:{" "}
													{formatCurrency(
														Math.abs(
															invoiceTotalAmount -
																(parseFloat(selectedJournal.total_debit) || 0)
														)
													)}
													)
												</span>
												<p className="text-xs text-gray-500 mt-1">
													Adjust your line items above so the invoice total matches the
													journal entry total.
												</p>
											</div>
										)}
									</div>
								</div>
							</div>
						)}

						{!selectedJournalId && (
							<div className="rounded-2xl border border-dashed border-[#b6c4cc] bg-[#f5f8fb] p-6 text-center text-[#567086]">
								<p className="text-lg font-semibold mb-2">No journal entry selected</p>
								<p className="text-sm">
									Select an existing journal entry from the dropdown above, or switch to "Create New
									GL Lines" mode.
								</p>
							</div>
						)}
					</div>
				)}

				{/* Create New GL Lines Mode */}
				{journalEntryMode === "create" && (
					<div>
						<div className="flex justify-end mb-4">
							<button
								type="button"
								onClick={handleAddGLLine}
								className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#48C1F0] text-[#48C1F0] text-sm font-semibold hover:bg-[#48C1F0]/10 transition-colors"
							>
								+ New Line
							</button>
						</div>

						{glLines.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-[#b6c4cc] bg-[#f5f8fb] p-6 text-center text-[#567086]">
								<p className="text-lg font-semibold mb-2">No GL distribution lines added yet</p>
								<p className="text-sm mb-6">
									GL distribution lines are required to create this invoice. Debits and credits must
									balance.
								</p>
								<button
									type="button"
									onClick={handleAddGLLine}
									className="px-4 py-2 rounded-full bg-[#0d5f7a] text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform"
								>
									+ Add First Line
								</button>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full border-collapse">
									<thead>
										<tr className="border-b border-gray-200 bg-gray-50">
											<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Line Type
											</th>
											<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Description
											</th>
											<th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Amount
											</th>
											<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Segments Type
											</th>
											<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												Segments Value
											</th>
											<th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-100">
										{glLines.map(line => (
											<tr key={line.id} className="hover:bg-gray-50 transition-colors">
												<td className="px-4 py-3">
													<FloatingLabelSelect
														label="Line Type"
														value={line.line_type}
														onChange={e =>
															handleGLLineChange(line.id, "line_type", e.target.value)
														}
														options={[
															{ value: "DEBIT", label: "DEBIT" },
															{ value: "CREDIT", label: "CREDIT" },
														]}
													/>
												</td>
												<td className="px-4 py-3">
													<FloatingLabelInput
														label="Description"
														type="text"
														value={line.description}
														onChange={e =>
															handleGLLineChange(line.id, "description", e.target.value)
														}
														placeholder="Line description"
													/>
												</td>
												<td className="px-4 py-3">
													<FloatingLabelInput
														label="Amount"
														type="number"
														step="0.01"
														value={line.amount}
														onChange={e =>
															handleGLLineChange(line.id, "amount", e.target.value)
														}
														placeholder="0.00"
													/>
												</td>
												<td className="px-4 py-3">
													<div className="flex flex-col gap-2">
														{/* Display existing segments */}
														{line.segments && line.segments.length > 0 && (
															<div className="flex flex-wrap gap-1 mb-2">
																{line.segments.map(segment => (
																	<span
																		key={segment.id}
																		className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 group relative"
																	>
																		{segment.segment_type_name ||
																			segment.segment_type}
																		<button
																			type="button"
																			onClick={() =>
																				handleRemoveSegmentFromLine(
																					line.id,
																					segment.id
																				)
																			}
																			className="ml-1 text-blue-600 hover:text-red-600"
																			title="Remove segment"
																		>
																			×
																		</button>
																	</span>
																))}
															</div>
														)}

														<FloatingLabelSelect
															label="Segment Type"
															value={segmentFormState[line.id]?.segment_type || ""}
															onChange={e =>
																handleSegmentFormChange(
																	line.id,
																	"segment_type",
																	e.target.value
																)
															}
															options={[
																{ value: "", label: "Select Segment Type" },
																...(segmentTypes
																	?.filter(
																		type =>
																			type &&
																			type.segment_id !== undefined &&
																			type.segment_id !== null
																	)
																	.map(type => ({
																		value: String(type.segment_id),
																		label: `${type.segment_name} (${type.segment_type})`,
																	})) || []),
															]}
														/>

														<div className="text-xs text-gray-500 italic mt-1">
															Auto-adds when both selected
														</div>
													</div>
												</td>
												<td className="px-4 py-3">
													<div className="flex flex-col gap-2">
														{/* Display existing segment values */}
														{line.segments && line.segments.length > 0 && (
															<div className="flex flex-wrap gap-1 mb-2">
																{line.segments.map(segment => (
																	<span
																		key={segment.id}
																		className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 group relative"
																	>
																		{segment.segment_value_name ||
																			segment.alias ||
																			segment.name}
																		<button
																			type="button"
																			onClick={() =>
																				handleRemoveSegmentFromLine(
																					line.id,
																					segment.id
																				)
																			}
																			className="ml-1 text-green-600 hover:text-red-600"
																			title="Remove segment"
																		>
																			×
																		</button>
																	</span>
																))}
															</div>
														)}

														<FloatingLabelSelect
															label="Segment Value"
															value={segmentFormState[line.id]?.segment || ""}
															onChange={e =>
																handleSegmentFormChange(
																	line.id,
																	"segment",
																	e.target.value
																)
															}
															disabled={!segmentFormState[line.id]?.segment_type}
															options={[
																{ value: "", label: "Select Segment Value" },
																...(segmentValues
																	?.filter(value => {
																		const selectedTypeId =
																			segmentFormState[line.id]?.segment_type;
																		if (!selectedTypeId) return false;
																		return (
																			value.segment_type ===
																			parseInt(selectedTypeId)
																		);
																	})
																	.filter(
																		value =>
																			value &&
																			value.id !== undefined &&
																			value.id !== null
																	)
																	.map(value => ({
																		value: String(value.id),
																		label: `${value.alias} (${value.code})`,
																	})) || []),
															]}
														/>
													</div>
												</td>
												<td className="px-4 py-3 text-center">
													<button
														type="button"
														onClick={() => handleRemoveGLLine(line.id)}
														className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
														title="Delete line"
													>
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
													</button>
												</td>
											</tr>
										))}
									</tbody>
									<tfoot className="border-t-2 border-gray-300 bg-gray-50">
										<tr className="font-semibold">
											<td colSpan="2" className="px-4 py-3 text-right text-gray-700">
												Total Debits:
											</td>
											<td className="px-4 py-3 text-right text-lg text-red-700">
												{formatCurrency(
													glLines
														.filter(line => line.line_type === "DEBIT")
														.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0)
												)}
											</td>
											<td colSpan="3"></td>
										</tr>
										<tr className="font-semibold">
											<td colSpan="2" className="px-4 py-3 text-right text-gray-700">
												Total Credits:
											</td>
											<td className="px-4 py-3 text-right text-lg text-green-700">
												{formatCurrency(
													glLines
														.filter(line => line.line_type === "CREDIT")
														.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0)
												)}
											</td>
											<td colSpan="3"></td>
										</tr>
										<tr className="font-semibold border-t-2 border-[#0d5f7a]">
											<td colSpan="2" className="px-4 py-3 text-right text-[#0d5f7a] text-lg">
												Balance:
											</td>
											<td colSpan="4" className="px-4 py-3">
												{(() => {
													const totalDebit = glLines
														.filter(line => line.line_type === "DEBIT")
														.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
													const totalCredit = glLines
														.filter(line => line.line_type === "CREDIT")
														.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
													const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
													return isBalanced ? (
														<span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
															<svg
																className="w-5 h-5"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
																	clipRule="evenodd"
																/>
															</svg>
															Balanced
														</span>
													) : (
														<span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
															<svg
																className="w-5 h-5"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
																	clipRule="evenodd"
																/>
															</svg>
															Not Balanced (Diff:{" "}
															{formatCurrency(Math.abs(totalDebit - totalCredit))})
														</span>
													);
												})()}
											</td>
										</tr>
										<tr className="font-semibold border-t border-gray-300">
											<td colSpan="2" className="px-4 py-3 text-right text-gray-700">
												Invoice Total:
											</td>
											<td className="px-4 py-3 text-right text-lg text-[#0d5f7a]">
												{formatCurrency(invoiceTotalAmount)}
											</td>
											<td colSpan="3" className="px-4 py-3">
												{(() => {
													const totalDebit = glLines
														.filter(line => line.line_type === "DEBIT")
														.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
													const glTotal = totalDebit;
													const isMatching = Math.abs(invoiceTotalAmount - glTotal) < 0.01;
													return isMatching ? (
														<span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
															<svg
																className="w-5 h-5"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
																	clipRule="evenodd"
																/>
															</svg>
															Matches GL Total
														</span>
													) : (
														<span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
															<svg
																className="w-5 h-5"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
																	clipRule="evenodd"
																/>
															</svg>
															Mismatch (Diff:{" "}
															{formatCurrency(Math.abs(invoiceTotalAmount - glTotal))})
														</span>
													);
												})()}
											</td>
										</tr>
									</tfoot>
								</table>
							</div>
						)}
					</div>
				)}
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
					onClick={handleSubmit}
					disabled={invoiceLoading}
					className="px-8 py-2 rounded-full bg-[#0d5f7a] text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{invoiceLoading ? "Creating..." : "Create Invoice"}
				</button>
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
