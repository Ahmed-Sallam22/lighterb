import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PageHeader from "../components/shared/PageHeader";
import Card from "../components/shared/Card";
import Tabs from "../components/shared/Tabs";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import FloatingLabelTextarea from "../components/shared/FloatingLabelTextarea";
import Button from "../components/shared/Button";

import { fetchSuppliers } from "../store/suppliersSlice";
import { fetchCurrencies } from "../store/currenciesSlice";
import api from "../api/axios";

import { FiCheck, FiX } from "react-icons/fi";
import { MdShoppingCart } from "react-icons/md";

// PO Type options
const PO_TYPE_OPTIONS = [
	{ value: "", label: "createPO.form.selectPoType" },
	{ value: "Catalog", label: "createPO.poTypes.catalog" },
	{ value: "Non-Catalog", label: "createPO.poTypes.nonCatalog" },
	{ value: "Service", label: "createPO.poTypes.service" },
];

// Initial form state
const INITIAL_FORM_STATE = {
	po_type: "",
	supplier_id: "",
	currency_id: "",
	po_date: new Date().toISOString().split("T")[0],
	required_date: "",
	notes: "",
};

// PO Icon
const POIcon = () => (
	<svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g opacity="0.5">
			<path
				d="M4 4C4 2.89543 4.89543 2 6 2H18L24 8V23C24 24.1046 23.1046 25 22 25H6C4.89543 25 4 24.1046 4 23V4Z"
				fill="#D3D3D3"
			/>
			<path d="M18 2V8H24" fill="#A0A0A0" />
			<path d="M8 12H20M8 16H16M8 20H12" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
		</g>
	</svg>
);

const CreatePoPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const navigate = useNavigate();
	const dispatch = useDispatch();

	// Redux state
	const { suppliers = [] } = useSelector(state => state.suppliers || {});
	const { currencies = [] } = useSelector(state => state.currencies || {});

	// Local state
	const [activeTab, setActiveTab] = useState("general");
	const [formData, setFormData] = useState(INITIAL_FORM_STATE);
	const [formErrors, setFormErrors] = useState({});
	const [creating, setCreating] = useState(false);

	// PR Items state
	const [prItems, setPrItems] = useState([]);
	const [loadingItems, setLoadingItems] = useState(false);
	const [selectedItems, setSelectedItems] = useState([]); // Array of selected item IDs
	const [itemDetails, setItemDetails] = useState({}); // { [id]: { quantity, unit_price, line_notes } }

	// Fetch suppliers and currencies on mount
	useEffect(() => {
		dispatch(fetchSuppliers());
		dispatch(fetchCurrencies());
	}, [dispatch]);

	// Update page title
	useEffect(() => {
		document.title = `${t("createPO.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	// Fetch PR items when PO type changes
	useEffect(() => {
		const fetchPRItems = async () => {
			if (!formData.po_type) {
				setPrItems([]);
				setSelectedItems([]);
				setItemDetails({});
				return;
			}

			setLoadingItems(true);
			try {
				const response = await api.get(`/procurement/pr/items-by-type/?pr_type=${formData.po_type}`);
				const items = response.data?.data?.items || [];
				setPrItems(items);
				// Reset selections when type changes
				setSelectedItems([]);
				setItemDetails({});
			} catch (error) {
				console.error("Error fetching PR items:", error);
				toast.error(t("createPO.messages.fetchItemsError"));
				setPrItems([]);
			} finally {
				setLoadingItems(false);
			}
		};

		fetchPRItems();
	}, [formData.po_type, t]);

	// Check if PO type is selected
	const isPoTypeSelected = formData.po_type !== "";

	// Tabs configuration
	const tabs = useMemo(
		() => [
			{ id: "general", label: t("createPO.tabs.general") },
			{ id: "lines", label: t("createPO.tabs.lines"), disabled: !isPoTypeSelected },
		],
		[t, isPoTypeSelected]
	);

	// Supplier options
	const supplierOptions = useMemo(() => {
		return [
			{ value: "", label: t("createPO.form.selectSupplier") },
			...suppliers.map(supplier => ({
				value: supplier.id,
				label: supplier.name || supplier.supplier_name || `Supplier ${supplier.id}`,
			})),
		];
	}, [suppliers, t]);

	// Currency options
	const currencyOptions = useMemo(() => {
		return [
			{ value: "", label: t("createPO.form.selectCurrency") },
			...currencies.map(currency => ({
				value: currency.id,
				label: `${currency.code} - ${currency.name}`,
			})),
		];
	}, [currencies, t]);

	// PO Type options with translations
	const poTypeOptions = useMemo(
		() =>
			PO_TYPE_OPTIONS.map(opt => ({
				value: opt.value,
				label: t(opt.label),
			})),
		[t]
	);

	// Calculate total amount
	const totalAmount = useMemo(() => {
		return selectedItems
			.reduce((total, itemId) => {
				const details = itemDetails[itemId] || {};
				const qty = parseFloat(details.quantity) || 0;
				const price = parseFloat(details.unit_price) || 0;
				return total + qty * price;
			}, 0)
			.toFixed(2);
	}, [selectedItems, itemDetails]);

	// Handlers
	const handleInputChange = useCallback(
		(field, value) => {
			setFormData(prev => ({ ...prev, [field]: value }));
			if (formErrors[field]) {
				setFormErrors(prev => ({ ...prev, [field]: "" }));
			}
		},
		[formErrors]
	);

	const handleItemSelect = useCallback(
		itemId => {
			setSelectedItems(prev => {
				if (prev.includes(itemId)) {
					// Remove item
					const newSelected = prev.filter(id => id !== itemId);
					// Also remove its details
					setItemDetails(prevDetails => {
						const newDetails = { ...prevDetails };
						delete newDetails[itemId];
						return newDetails;
					});
					return newSelected;
				} else {
					// Add item with default values
					const item = prItems.find(i => i.id === itemId);
					if (item) {
						setItemDetails(prevDetails => ({
							...prevDetails,
							[itemId]: {
								quantity: item.remaining_quantity || item.quantity || "",
								unit_price: item.estimated_unit_price || "",
								line_notes: "",
							},
						}));
					}
					return [...prev, itemId];
				}
			});
		},
		[prItems]
	);

	const handleItemDetailChange = useCallback((itemId, field, value) => {
		setItemDetails(prev => ({
			...prev,
			[itemId]: {
				...prev[itemId],
				[field]: value,
			},
		}));
	}, []);

	const handleCancel = useCallback(() => {
		navigate("/procurement");
	}, [navigate]);

	// Validate form
	const validateForm = useCallback(() => {
		const errors = {};

		if (!formData.po_type) {
			errors.po_type = t("createPO.validation.poTypeRequired");
		}
		if (!formData.supplier_id) {
			errors.supplier_id = t("createPO.validation.supplierRequired");
		}
		if (!formData.currency_id) {
			errors.currency_id = t("createPO.validation.currencyRequired");
		}
		if (!formData.po_date) {
			errors.po_date = t("createPO.validation.poDateRequired");
		}
		if (!formData.required_date) {
			errors.required_date = t("createPO.validation.requiredDateRequired");
		}

		if (selectedItems.length === 0) {
			errors.items = t("createPO.validation.itemsRequired");
		}

		// Validate each selected item
		selectedItems.forEach(itemId => {
			const details = itemDetails[itemId] || {};
			if (!details.quantity || parseFloat(details.quantity) <= 0) {
				errors[`item_${itemId}_quantity`] = t("createPO.validation.quantityRequired");
			}
			if (!details.unit_price || parseFloat(details.unit_price) <= 0) {
				errors[`item_${itemId}_unit_price`] = t("createPO.validation.unitPriceRequired");
			}
		});

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	}, [formData, selectedItems, itemDetails, t]);

	// Handle submit
	const handleSubmit = async () => {
		if (!validateForm()) {
			if (formErrors.items || selectedItems.length === 0) {
				toast.error(t("createPO.validation.checkLines"));
				setActiveTab("lines");
			} else if (formErrors.po_type || formErrors.supplier_id || formErrors.currency_id) {
				toast.error(t("createPO.validation.checkGeneral"));
				setActiveTab("general");
			}
			return;
		}

		setCreating(true);

		const payload = {
			po_type: formData.po_type,
			supplier_id: parseInt(formData.supplier_id),
			currency_id: parseInt(formData.currency_id),
			po_date: formData.po_date,
			required_date: formData.required_date,
			notes: formData.notes,
			items_from_pr: selectedItems.map(itemId => ({
				pr_item_id: itemId,
				quantity: parseFloat(itemDetails[itemId]?.quantity) || 0,
				unit_price: itemDetails[itemId]?.unit_price || "0.00",
				line_notes: itemDetails[itemId]?.line_notes || "",
			})),
		};

		try {
			await api.post("/procurement/po/", payload);
			toast.success(t("createPO.messages.createSuccess"));
			navigate("/procurement");
		} catch (error) {
			console.error("Error creating PO:", error);
			const errorMsg =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				t("createPO.messages.createError");
			toast.error(errorMsg);
		} finally {
			setCreating(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#EEEEEE]">
			<ToastContainer position="top-right" />

			{/* Header */}
			<PageHeader title={t("createPO.pageTitle")} subtitle={t("createPO.title")} icon={<POIcon />} />

			<div className="max-w-6xl mx-auto mt-5 pb-10 px-6 space-y-5">
				{/* Header with Cancel and Create buttons */}
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-bold text-[#28819C]">{t("createPO.title")}</h1>
					<div className="flex gap-3">
						<Button
							onClick={handleCancel}
							title={t("createPO.actions.cancel")}
							className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-none"
						/>
						<Button
							onClick={handleSubmit}
							disabled={creating}
							title={creating ? t("createPO.actions.creating") : t("createPO.actions.create")}
							className="bg-[#28819C] hover:bg-[#1d6a80] text-white"
						/>
					</div>
				</div>

				{/* Tabs */}
				<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

				{/* General Tab */}
				{activeTab === "general" && (
					<Card>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
							{/* PO Type */}
							<FloatingLabelSelect
								label={t("createPO.form.poType")}
								name="po_type"
								value={formData.po_type}
								onChange={e => handleInputChange("po_type", e.target.value)}
								options={poTypeOptions}
								error={formErrors.po_type}
								required
							/>

							{/* Supplier */}
							<FloatingLabelSelect
								label={t("createPO.form.supplier")}
								name="supplier_id"
								value={formData.supplier_id}
								onChange={e => handleInputChange("supplier_id", e.target.value)}
								options={supplierOptions}
								error={formErrors.supplier_id}
								required
							/>

							{/* Currency */}
							<FloatingLabelSelect
								label={t("createPO.form.currency")}
								name="currency_id"
								value={formData.currency_id}
								onChange={e => handleInputChange("currency_id", e.target.value)}
								options={currencyOptions}
								error={formErrors.currency_id}
								required
							/>

							{/* PO Date */}
							<FloatingLabelInput
								label={t("createPO.form.poDate")}
								name="po_date"
								type="date"
								value={formData.po_date}
								onChange={e => handleInputChange("po_date", e.target.value)}
								error={formErrors.po_date}
								required
							/>

							{/* Required Date */}
							<FloatingLabelInput
								label={t("createPO.form.requiredDate")}
								name="required_date"
								type="date"
								value={formData.required_date}
								onChange={e => handleInputChange("required_date", e.target.value)}
								error={formErrors.required_date}
								required
							/>

							{/* Notes - Full width */}
							<div className="md:col-span-2">
								<FloatingLabelTextarea
									label={t("createPO.form.notes")}
									name="notes"
									value={formData.notes}
									onChange={e => handleInputChange("notes", e.target.value)}
									rows={4}
								/>
							</div>
						</div>
					</Card>
				)}

				{/* Lines Tab */}
				{activeTab === "lines" && (
					<Card>
						<div className="p-2">
							<div className="mb-4">
								<h3 className="text-lg font-semibold text-gray-900">{t("createPO.lines.title")}</h3>
								<p className="text-sm text-gray-500">{t("createPO.lines.subtitle")}</p>
							</div>

							{loadingItems ? (
								<div className="flex items-center justify-center py-12">
									<div className="w-8 h-8 border-4 border-[#28819C] border-t-transparent rounded-full animate-spin"></div>
								</div>
							) : prItems.length === 0 ? (
								<div className="text-center py-12 text-gray-500">
									<MdShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
									<p>{t("createPO.lines.noItems")}</p>
								</div>
							) : (
								<div className="space-y-4">
									{/* Available Items */}
									<div className="space-y-2">
										{prItems.map(item => {
											const isSelected = selectedItems.includes(item.id);
											const details = itemDetails[item.id] || {};

											return (
												<div
													key={item.id}
													className={`border rounded-xl overflow-hidden transition-all ${
														isSelected
															? "border-[#28819C] bg-[#28819C]/5"
															: "border-gray-200 hover:border-gray-300"
													}`}
												>
													{/* Item Header - Clickable to select */}
													<div
														className="flex items-center gap-4 p-4 cursor-pointer"
														onClick={() => handleItemSelect(item.id)}
													>
														{/* Checkbox */}
														<div
															className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
																isSelected
																	? "bg-[#28819C] border-[#28819C]"
																	: "bg-white border-gray-300"
															}`}
														>
															{isSelected && <FiCheck className="w-3 h-3 text-white" />}
														</div>

														{/* Item Info */}
														<div className="flex-1 min-w-0">
															<h4 className="font-medium text-gray-900">
																{item.item_name}
															</h4>
															<p className="text-sm text-gray-500 truncate">
																{item.item_description}
															</p>
														</div>

														{/* Remaining Quantity Badge */}
														<div className="flex items-center gap-2">
															<span className="text-sm text-gray-500">
																{t("createPO.lines.remainingQty")}:
															</span>
															<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
																{item.remaining_quantity}
															</span>
														</div>
													</div>

													{/* Item Details Form - Shown when selected */}
													{isSelected && (
														<div className="border-t border-gray-200 bg-gray-50 p-4">
															<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
																{/* Quantity */}
																<div>
																	<label className="block text-sm font-medium text-gray-700 mb-1">
																		{t("createPO.lines.quantity")} *
																	</label>
																	<input
																		type="number"
																		value={details.quantity || ""}
																		onChange={e =>
																			handleItemDetailChange(
																				item.id,
																				"quantity",
																				e.target.value
																			)
																		}
																		onClick={e => e.stopPropagation()}
																		max={item.remaining_quantity}
																		min="0"
																		step="0.01"
																		className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28819C] ${
																			formErrors[`item_${item.id}_quantity`]
																				? "border-red-500"
																				: "border-gray-300"
																		}`}
																		placeholder={t(
																			"createPO.lines.quantityPlaceholder"
																		)}
																	/>
																	{formErrors[`item_${item.id}_quantity`] && (
																		<p className="text-xs text-red-500 mt-1">
																			{formErrors[`item_${item.id}_quantity`]}
																		</p>
																	)}
																</div>

																{/* Unit Price */}
																<div>
																	<label className="block text-sm font-medium text-gray-700 mb-1">
																		{t("createPO.lines.unitPrice")} *
																	</label>
																	<input
																		type="number"
																		value={details.unit_price || ""}
																		onChange={e =>
																			handleItemDetailChange(
																				item.id,
																				"unit_price",
																				e.target.value
																			)
																		}
																		onClick={e => e.stopPropagation()}
																		min="0"
																		step="0.01"
																		className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28819C] ${
																			formErrors[`item_${item.id}_unit_price`]
																				? "border-red-500"
																				: "border-gray-300"
																		}`}
																		placeholder={t(
																			"createPO.lines.unitPricePlaceholder"
																		)}
																	/>
																	{formErrors[`item_${item.id}_unit_price`] && (
																		<p className="text-xs text-red-500 mt-1">
																			{formErrors[`item_${item.id}_unit_price`]}
																		</p>
																	)}
																</div>

																{/* Line Notes */}
																<div>
																	<label className="block text-sm font-medium text-gray-700 mb-1">
																		{t("createPO.lines.lineNotes")}
																	</label>
																	<input
																		type="text"
																		value={details.line_notes || ""}
																		onChange={e =>
																			handleItemDetailChange(
																				item.id,
																				"line_notes",
																				e.target.value
																			)
																		}
																		onClick={e => e.stopPropagation()}
																		className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28819C]"
																		placeholder={t(
																			"createPO.lines.lineNotesPlaceholder"
																		)}
																	/>
																</div>
															</div>

															{/* Line Total */}
															<div className="mt-3 flex justify-end">
																<span className="text-sm text-gray-600">
																	{t("createPO.lines.lineTotal")}:{" "}
																	<span className="font-semibold text-gray-900">
																		{(
																			(parseFloat(details.quantity) || 0) *
																			(parseFloat(details.unit_price) || 0)
																		).toFixed(2)}
																	</span>
																</span>
															</div>
														</div>
													)}
												</div>
											);
										})}
									</div>

									{/* Summary */}
									{selectedItems.length > 0 && (
										<div className="border-t pt-4 mt-4">
											<div className="flex justify-between items-center">
												<span className="text-gray-600">
													{t("createPO.lines.selectedItems")}: {selectedItems.length}
												</span>
												<span className="text-lg font-semibold text-gray-900">
													{t("createPO.lines.totalAmount")}: {totalAmount}
												</span>
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					</Card>
				)}
			</div>
		</div>
	);
};

export default CreatePoPage;
