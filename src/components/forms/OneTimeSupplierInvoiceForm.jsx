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
import { createOneTimeSupplierInvoice } from "../../store/oneTimeSupplierInvoicesSlice";
import { fetchCurrencies } from "../../store/currenciesSlice";
import { fetchCountries } from "../../store/countriesSlice";

const OneTimeSupplierInvoiceForm = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const { currencies } = useSelector(state => state.currencies);
	const { countries: fetchedCountries } = useSelector(state => state.countries);
	const { loading: invoiceLoading } = useSelector(state => state.oneTimeSupplierInvoices);

	const countries = fetchedCountries.map(country => ({
		value: country.id,
		code: country.code || "N/A",
		label: `${country.name} (${country.code})`,
	}));

	// Supplier info (one-time)
	const [supplierInfo, setSupplierInfo] = useState({
		supplier_name: "",
		supplier_email: "",
		supplier_phone: "",
		supplier_tax_id: "",
	});

	// Invoice form state
	const [invoiceForm, setInvoiceForm] = useState({
		date: "",
		currency: "",
		country: "",
		memo: "",
	});

	// Items state
	const [items, setItems] = useState([]);

	// GL Lines state
	const [glLines, setGLLines] = useState([]);
	const [glEntry, setGlEntry] = useState({
		date: "",
		currency_id: "",
		memo: "",
	});

	// Fetch required data on mount
	useEffect(() => {
		dispatch(fetchCurrencies());
		dispatch(fetchCountries());
	}, [dispatch]);

	// Sync glEntry date and currency with invoice form
	useEffect(() => {
		setGlEntry(prev => ({
			...prev,
			date: invoiceForm.date || prev.date,
			currency_id: invoiceForm.currency ? parseInt(invoiceForm.currency) : prev.currency_id,
			memo: invoiceForm.memo || prev.memo,
		}));
	}, [invoiceForm.date, invoiceForm.currency, invoiceForm.memo]);

	// Currency options from Redux
	const currencyOptions = currencies.map(currency => ({
		value: currency.id,
		label: `${currency.code} - ${currency.name}`,
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
				// Create default CREDIT line
				const newCreditLine = {
					id: creditLineId,
					type: "CREDIT",
					amount: invoiceTotalAmount.toFixed(2),
					segments: [],
					isAutoCredit: true, // Flag to identify this as the auto-managed CREDIT line
				};
				setGLLines(prev => [newCreditLine, ...prev]);
			}
		}
	}, [invoiceTotalAmount, glLines]);

	// Get selected currency code for formatting
	const selectedCurrency = currencies.find(c => c.id === parseInt(invoiceForm.currency));
	const currencyCode = selectedCurrency?.code || "USD";

	const formatCurrency = value =>
		new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(value);

	const handleSupplierChange = e => {
		const { name, value } = e.target;
		setSupplierInfo(prev => ({ ...prev, [name]: value }));
	};

	const handleInvoiceChange = e => {
		const { name, value } = e.target;
		setInvoiceForm(prev => ({ ...prev, [name]: value }));
	};

	const handleAddItem = () => {
		const newItem = {
			id: Date.now(),
			name: "",
			description: "",
			quantity: "1",
			unit_price: "0.00",
			tax_rate: 0,
		};
		setItems(prev => [...prev, newItem]);
	};

	const handleItemChange = (itemId, field, value) => {
		setItems(prev =>
			prev.map(item => {
				if (item.id === itemId) {
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

		// Validate supplier info
		if (!supplierInfo.supplier_name) {
			toast.error(t("oneTimeSupplierForm.messages.supplierNameRequired"));
			return;
		}

		// Validate required fields
		if (!invoiceForm.date || !invoiceForm.currency || !invoiceForm.country) {
			toast.error(t("invoiceForm.messages.requiredFields"));
			return;
		}

		if (items.length === 0) {
			toast.error(t("invoiceForm.messages.noItems"));
			return;
		}

		// Validate GL lines
		if (glLines.length === 0) {
			toast.error(t("invoiceForm.messages.noGlLines"));
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
			return;
		}

		// Prepare items for API
		const formattedItems = items.map((item, idx) => {
			const name = item.name || item.description || `Item ${idx + 1}`;
			return {
				name,
				description: item.description || name,
				quantity: String(parseFloat(item.quantity) || 0),
				unit_price: String(parseFloat(item.unit_price).toFixed(2)),
			};
		});

		// Build journal entry from GL lines
		const journalEntry = {
			date: glEntry.date || invoiceForm.date,
			currency_id: parseInt(invoiceForm.currency),
			memo: glEntry.memo || invoiceForm.memo || "One-time Supplier Invoice",
			lines: glLines.map(line => ({
				amount: String(parseFloat(line.amount).toFixed(2)),
				type: line.type,
				segments: (line.segments || [])
					.filter(seg => seg.segment_code)
					.map(seg => ({
						segment_type_id: seg.segment_type_id,
						segment_code: seg.segment_code,
					})),
			})),
		};

		// Prepare invoice data
		const invoiceData = {
			date: invoiceForm.date,
			supplier_name: supplierInfo.supplier_name,
			currency_id: parseInt(invoiceForm.currency),
			country_id: parseInt(invoiceForm.country),
			tax_amount: invoiceTaxAmount.toFixed(2),
			items: formattedItems,
			journal_entry: journalEntry,
		};

		// Add optional fields only if they have values
		if (supplierInfo.supplier_email) {
			invoiceData.supplier_email = supplierInfo.supplier_email;
		}
		if (supplierInfo.supplier_phone) {
			invoiceData.supplier_phone = supplierInfo.supplier_phone;
		}
		if (supplierInfo.supplier_tax_id) {
			invoiceData.supplier_tax_id = supplierInfo.supplier_tax_id;
		}

		try {
			console.log("Submitting one-time supplier invoice:", invoiceData);
			const result = await dispatch(createOneTimeSupplierInvoice(invoiceData)).unwrap();
			console.log("One-time supplier invoice created:", result);
			toast.success(t("oneTimeSupplierForm.messages.createSuccess"));
			navigate("/one-time-supplier-invoices");
		} catch (error) {
			console.error("Create invoice error:", error);
			let message = t("oneTimeSupplierForm.messages.createFailed");
			if (typeof error === "string") {
				message = error;
			} else if (error?.message) {
				message = error.message;
			}
			toast.error(message, { autoClose: 8000 });
		}
	};

	return (
		<div className="max-w-6xl mx-auto mt-5 pb-10 space-y-5">
			{/* Supplier Information */}
			<Card
				title={t("oneTimeSupplierForm.supplierInfo.title")}
				subtitle={t("oneTimeSupplierForm.supplierInfo.subtitle")}
			>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<FloatingLabelInput
						label={t("oneTimeSupplierForm.supplierInfo.name")}
						name="supplier_name"
						value={supplierInfo.supplier_name}
						onChange={handleSupplierChange}
						required
						placeholder={t("oneTimeSupplierForm.supplierInfo.namePlaceholder")}
					/>
					<FloatingLabelInput
						label={t("oneTimeSupplierForm.supplierInfo.email")}
						name="supplier_email"
						type="email"
						value={supplierInfo.supplier_email}
						onChange={handleSupplierChange}
						placeholder={t("oneTimeSupplierForm.supplierInfo.emailPlaceholder")}
					/>
					<FloatingLabelInput
						label={t("oneTimeSupplierForm.supplierInfo.phone")}
						name="supplier_phone"
						value={supplierInfo.supplier_phone}
						onChange={handleSupplierChange}
						placeholder={t("oneTimeSupplierForm.supplierInfo.phonePlaceholder")}
					/>
					<FloatingLabelInput
						label={t("oneTimeSupplierForm.supplierInfo.taxId")}
						name="supplier_tax_id"
						value={supplierInfo.supplier_tax_id}
						onChange={handleSupplierChange}
						placeholder={t("oneTimeSupplierForm.supplierInfo.taxIdPlaceholder")}
					/>
				</div>
			</Card>

			{/* Invoice Details */}
			<Card title={t("invoiceForm.details.title")}>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<FloatingLabelInput
						label={t("invoiceForm.details.invoiceDate")}
						name="date"
						type="date"
						value={invoiceForm.date}
						onChange={handleInvoiceChange}
						required
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
					<FloatingLabelInput
						label={t("invoiceForm.details.memo")}
						name="memo"
						value={invoiceForm.memo}
						onChange={handleInvoiceChange}
						placeholder={t("invoiceForm.details.memoPlaceholder")}
					/>
				</div>
			</Card>

			{/* Line Items - Table Style like InvoiceForm */}
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
									<th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
										{t("invoiceForm.items.actions")}
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{items.map(item => (
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
												onChange={e => handleItemChange(item.id, "description", e.target.value)}
												placeholder={t("invoiceForm.items.descriptionPlaceholder")}
											/>
										</td>
										<td className="px-4 py-3">
											<FloatingLabelInput
												label={t("invoiceForm.items.quantity")}
												type="number"
												step="1"
												value={item.quantity}
												onChange={e => handleItemChange(item.id, "quantity", e.target.value)}
												placeholder={t("invoiceForm.items.quantityPlaceholder")}
											/>
										</td>
										<td className="px-4 py-3">
											<FloatingLabelInput
												label={t("invoiceForm.items.unitPrice")}
												type="number"
												step="0.01"
												value={item.unit_price}
												onChange={e => handleItemChange(item.id, "unit_price", e.target.value)}
												placeholder={t("invoiceForm.items.unitPricePlaceholder")}
											/>
										</td>
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
								))}
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
										{t("invoiceForm.glDistribution.totalsMatch")}
									</span>
								) : (
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
								);
							})()}
						</div>
					</div>
				)}
			</Card>

			{/* Action Buttons */}
			<div className="flex justify-end gap-4 pt-4">
				<Button variant="outline" onClick={handleCancel}>
					{t("invoiceForm.actions.cancel")}
				</Button>
				<Button variant="primary" onClick={handleSubmit} disabled={invoiceLoading}>
					{invoiceLoading ? t("invoiceForm.actions.creating") : t("invoiceForm.actions.createInvoice")}
				</Button>
			</div>

			<ToastContainer
				position="top-right"
				autoClose={3000}
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

export default OneTimeSupplierInvoiceForm;
