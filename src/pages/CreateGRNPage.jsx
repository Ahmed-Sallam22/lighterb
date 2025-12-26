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

import {
	fetchAvailablePOsForReceiving,
	fetchPODetailsForReceiving,
	fetchUserProfile,
	createGRN,
	clearSelectedPO,
	clearCreateStatus,
	resetGRNState,
} from "../store/grnSlice";

import { FiCheck } from "react-icons/fi";
import { MdInventory } from "react-icons/md";

// Initial form state
const INITIAL_FORM_STATE = {
	po_header_id: "",
	receipt_date: new Date().toISOString().split("T")[0],
	notes: "",
};

// GRN Icon
const GRNIcon = () => (
	<svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g opacity="0.5">
			<path
				d="M4 4C4 2.89543 4.89543 2 6 2H18L24 8V23C24 24.1046 23.1046 25 22 25H6C4.89543 25 4 24.1046 4 23V4Z"
				fill="#D3D3D3"
			/>
			<path d="M18 2V8H24" fill="#A0A0A0" />
			<path d="M8 12H20M8 16H16M8 20H12" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
			<circle cx="20" cy="20" r="5" fill="#28819C" />
			<path
				d="M18 20L19.5 21.5L22.5 18.5"
				stroke="white"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</g>
	</svg>
);

const CreateGRNPage = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const dispatch = useDispatch();

	// Redux state
	const {
		availablePOs,
		loadingAvailablePOs,
		selectedPO,
		loadingPODetails,
		userProfile,
		creating,
		createSuccess,
		createError,
	} = useSelector(state => state.grn);

	// Local state
	const [activeTab, setActiveTab] = useState("general");
	const [formData, setFormData] = useState(INITIAL_FORM_STATE);
	const [formErrors, setFormErrors] = useState({});

	// PO Items state
	const [poItems, setPoItems] = useState([]);
	const [selectedItems, setSelectedItems] = useState([]); // Array of selected item IDs
	const [itemDetails, setItemDetails] = useState({}); // { [id]: { quantity_to_receive, line_notes } }

	// Fetch available POs and user profile on mount
	useEffect(() => {
		dispatch(fetchAvailablePOsForReceiving());
		dispatch(fetchUserProfile());

		// Cleanup on unmount
		return () => {
			dispatch(resetGRNState());
		};
	}, [dispatch]);

	// Update page title
	useEffect(() => {
		document.title = `${t("createGRN.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	// Fetch PO details when PO is selected
	useEffect(() => {
		if (!formData.po_header_id) {
			dispatch(clearSelectedPO());
			setPoItems([]);
			setSelectedItems([]);
			setItemDetails({});
			return;
		}

		dispatch(fetchPODetailsForReceiving(formData.po_header_id));
	}, [formData.po_header_id, dispatch]);

	// Update poItems when selectedPO changes
	useEffect(() => {
		if (selectedPO) {
			// Set items from PO - filter only items with remaining quantity > 0
			const items = (selectedPO.items || []).filter(item => parseFloat(item.remaining_quantity) > 0);
			setPoItems(items);
			// Reset selections when PO changes
			setSelectedItems([]);
			setItemDetails({});
		} else {
			setPoItems([]);
		}
	}, [selectedPO]);

	// Handle create success/error
	useEffect(() => {
		if (createSuccess) {
			toast.success(t("createGRN.messages.createSuccess"));
			dispatch(clearCreateStatus());
			navigate("/procurement/receiving-grn");
		}
		if (createError) {
			toast.error(createError);
			dispatch(clearCreateStatus());
		}
	}, [createSuccess, createError, t, navigate, dispatch]);

	// Check if PO is selected
	const isPOSelected = formData.po_header_id !== "";

	// Tabs configuration
	const tabs = useMemo(
		() => [
			{ id: "general", label: t("createGRN.tabs.general") },
			{ id: "lines", label: t("createGRN.tabs.lines"), disabled: !isPOSelected },
		],
		[t, isPOSelected]
	);

	// PO options
	const poOptions = useMemo(() => {
		return [
			{ value: "", label: t("createGRN.form.selectPO") },
			...availablePOs.map(po => ({
				value: po.id,
				label: `${po.po_number} - ${po.supplier_name}`,
			})),
		];
	}, [availablePOs, t]);

	// Calculate total quantity to receive
	const totalQuantity = useMemo(() => {
		return selectedItems
			.reduce((total, itemId) => {
				const details = itemDetails[itemId] || {};
				const qty = parseFloat(details.quantity_to_receive) || 0;
				return total + qty;
			}, 0)
			.toFixed(3);
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
					const item = poItems.find(i => i.id === itemId);
					if (item) {
						setItemDetails(prevDetails => ({
							...prevDetails,
							[itemId]: {
								quantity_to_receive: item.remaining_quantity || "",
								line_notes: "",
							},
						}));
					}
					return [...prev, itemId];
				}
			});
		},
		[poItems]
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
		navigate("/procurement/receiving-grn");
	}, [navigate]);

	// Validate form
	const validateForm = useCallback(() => {
		const errors = {};

		if (!formData.po_header_id) {
			errors.po_header_id = t("createGRN.validation.poRequired");
		}
		if (!formData.receipt_date) {
			errors.receipt_date = t("createGRN.validation.receiptDateRequired");
		}

		if (selectedItems.length === 0) {
			errors.items = t("createGRN.validation.itemsRequired");
		}

		// Validate each selected item
		selectedItems.forEach(itemId => {
			const details = itemDetails[itemId] || {};
			const item = poItems.find(i => i.id === itemId);
			const remainingQty = parseFloat(item?.remaining_quantity) || 0;
			const qtyToReceive = parseFloat(details.quantity_to_receive) || 0;

			if (qtyToReceive < 0) {
				errors[`item_${itemId}_quantity`] = t("createGRN.validation.quantityNegative");
			}
			if (qtyToReceive > remainingQty) {
				errors[`item_${itemId}_quantity`] = t("createGRN.validation.quantityExceedsRemaining");
			}
		});

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	}, [formData, selectedItems, itemDetails, poItems, t]);

	// Handle submit
	const handleSubmit = () => {
		if (!validateForm()) {
			if (formErrors.items || selectedItems.length === 0) {
				toast.error(t("createGRN.validation.checkLines"));
				setActiveTab("lines");
			} else if (formErrors.po_header_id || formErrors.receipt_date) {
				toast.error(t("createGRN.validation.checkGeneral"));
				setActiveTab("general");
			}
			return;
		}

		const payload = {
			po_header_id: parseInt(formData.po_header_id),
			receipt_date: formData.receipt_date,
			grn_type: selectedPO?.po_type || "Catalog",
			received_by_id: userProfile?.id || 1,
			notes: formData.notes,
			lines_from_po: selectedItems.map(itemId => ({
				po_line_item_id: itemId,
				quantity_to_receive: itemDetails[itemId]?.quantity_to_receive || "0.000",
				line_notes: itemDetails[itemId]?.line_notes || "",
			})),
		};

		dispatch(createGRN(payload));
	};

	return (
		<div className="min-h-screen bg-[#EEEEEE]">
			<ToastContainer position="top-right" />

			{/* Header */}
			<PageHeader title={t("createGRN.pageTitle")} subtitle={t("createGRN.title")} icon={<GRNIcon />} />

			<div className="max-w-6xl mx-auto mt-5 pb-10 px-6 space-y-5">
				{/* Header with Cancel and Create buttons */}
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-bold text-[#28819C]">{t("createGRN.title")}</h1>
					<div className="flex gap-3">
						<Button
							onClick={handleCancel}
							title={t("createGRN.actions.cancel")}
							className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-none"
						/>
						<Button
							onClick={handleSubmit}
							disabled={creating}
							title={creating ? t("createGRN.actions.creating") : t("createGRN.actions.create")}
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
							{/* Purchase Order */}
							<FloatingLabelSelect
								label={t("createGRN.form.purchaseOrder")}
								name="po_header_id"
								value={formData.po_header_id}
								onChange={e => handleInputChange("po_header_id", e.target.value)}
								options={poOptions}
								error={formErrors.po_header_id}
								required
								disabled={loadingAvailablePOs}
							/>

							{/* Receipt Date */}
							<FloatingLabelInput
								label={t("createGRN.form.receiptDate")}
								name="receipt_date"
								type="date"
								value={formData.receipt_date}
								onChange={e => handleInputChange("receipt_date", e.target.value)}
								error={formErrors.receipt_date}
								required
							/>

							{/* Selected PO Info - Read only fields */}
							{selectedPO && (
								<>
									<FloatingLabelInput
										label={t("createGRN.form.supplier")}
										name="supplier"
										value={selectedPO.supplier_name || ""}
										readOnly
										disabled
									/>
									<FloatingLabelInput
										label={t("createGRN.form.grnType")}
										name="grn_type"
										value={selectedPO.po_type || ""}
										readOnly
										disabled
									/>
									<FloatingLabelInput
										label={t("createGRN.form.currency")}
										name="currency"
										value={selectedPO.currency_code || ""}
										readOnly
										disabled
									/>
									<FloatingLabelInput
										label={t("createGRN.form.totalAmount")}
										name="total_amount"
										value={selectedPO.total_amount || ""}
										readOnly
										disabled
									/>
								</>
							)}

							{/* Notes - Full width */}
							<div className="md:col-span-2">
								<FloatingLabelTextarea
									label={t("createGRN.form.notes")}
									name="notes"
									value={formData.notes}
									onChange={e => handleInputChange("notes", e.target.value)}
									rows={4}
								/>
							</div>
						</div>

						{/* Loading indicator for PO details */}
						{loadingPODetails && (
							<div className="flex items-center justify-center py-4">
								<div className="w-6 h-6 border-4 border-[#28819C] border-t-transparent rounded-full animate-spin"></div>
								<span className="ml-2 text-gray-500">{t("createGRN.messages.loadingPODetails")}</span>
							</div>
						)}
					</Card>
				)}

				{/* Lines Tab */}
				{activeTab === "lines" && (
					<Card>
						<div className="p-2">
							<div className="mb-4">
								<h3 className="text-lg font-semibold text-gray-900">{t("createGRN.lines.title")}</h3>
								<p className="text-sm text-gray-500">{t("createGRN.lines.subtitle")}</p>
							</div>

							{loadingPODetails ? (
								<div className="flex items-center justify-center py-12">
									<div className="w-8 h-8 border-4 border-[#28819C] border-t-transparent rounded-full animate-spin"></div>
								</div>
							) : poItems.length === 0 ? (
								<div className="text-center py-12 text-gray-500">
									<MdInventory className="w-12 h-12 mx-auto mb-3 text-gray-300" />
									<p>{t("createGRN.lines.noItems")}</p>
								</div>
							) : (
								<div className="space-y-4">
									{/* Available Items */}
									<div className="space-y-2">
										{poItems.map(item => {
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

														{/* Quantity Info */}
														<div className="flex items-center gap-4 text-sm">
															<div className="text-gray-500">
																{t("createGRN.lines.ordered")}:{" "}
																<span className="font-medium text-gray-700">
																	{item.quantity}
																</span>
															</div>
															<div className="text-gray-500">
																{t("createGRN.lines.received")}:{" "}
																<span className="font-medium text-gray-700">
																	{item.quantity_received}
																</span>
															</div>
															<div className="flex items-center gap-2">
																<span className="text-gray-500">
																	{t("createGRN.lines.remaining")}:
																</span>
																<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
																	{item.remaining_quantity}
																</span>
															</div>
														</div>
													</div>

													{/* Item Details Form - Shown when selected */}
													{isSelected && (
														<div className="border-t border-gray-200 bg-gray-50 p-4">
															<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																{/* Quantity to Receive */}
																<div>
																	<label className="block text-sm font-medium text-gray-700 mb-1">
																		{t("createGRN.lines.quantityToReceive")} *
																	</label>
																	<input
																		type="number"
																		value={details.quantity_to_receive || ""}
																		onChange={e =>
																			handleItemDetailChange(
																				item.id,
																				"quantity_to_receive",
																				e.target.value
																			)
																		}
																		onClick={e => e.stopPropagation()}
																		max={item.remaining_quantity}
																		min="0"
																		step="0.001"
																		className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28819C] ${
																			formErrors[`item_${item.id}_quantity`]
																				? "border-red-500"
																				: "border-gray-300"
																		}`}
																		placeholder={t(
																			"createGRN.lines.quantityPlaceholder"
																		)}
																	/>
																	{formErrors[`item_${item.id}_quantity`] && (
																		<p className="text-xs text-red-500 mt-1">
																			{formErrors[`item_${item.id}_quantity`]}
																		</p>
																	)}
																</div>

																{/* Line Notes */}
																<div>
																	<label className="block text-sm font-medium text-gray-700 mb-1">
																		{t("createGRN.lines.lineNotes")}
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
																			"createGRN.lines.lineNotesPlaceholder"
																		)}
																	/>
																</div>
															</div>

															{/* Unit Info */}
															<div className="mt-3 flex justify-between text-sm text-gray-600">
																<span>
																	{t("createGRN.lines.unitOfMeasure")}:{" "}
																	{item.unit_of_measure_code}
																</span>
																<span>
																	{t("createGRN.lines.unitPrice")}: {item.unit_price}
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
													{t("createGRN.lines.selectedItems")}: {selectedItems.length}
												</span>
												<span className="text-lg font-semibold text-gray-900">
													{t("createGRN.lines.totalQuantity")}: {totalQuantity}
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

export default CreateGRNPage;
