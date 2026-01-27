import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PageHeader from "../components/shared/PageHeader";
import Card from "../components/shared/Card";
import Tabs from "../components/shared/Tabs";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import FloatingLabelTextarea from "../components/shared/FloatingLabelTextarea";
import Button from "../components/shared/Button";
import RequisitionsHeadIcon from "../ui/icons/RequisitionsHeadIcon";

import { createRequisition, clearError } from "../store/requisitionsSlice";
import { fetchUOMs } from "../store/uomSlice";
import { fetchCatalogItems } from "../store/catalogItemsSlice";
import { fetchSegmentTypes, fetchSegmentValues } from "../store/segmentsSlice";

import { FiPlus, FiTrash2 } from "react-icons/fi";

// Priority options
const PRIORITY_OPTIONS = [
	{ value: "", label: "createRequisition.form.selectPriority" },
	{ value: "LOW", label: "createRequisition.priorities.low" },
	{ value: "MEDIUM", label: "createRequisition.priorities.medium" },
	{ value: "HIGH", label: "createRequisition.priorities.high" },
	{ value: "URGENT", label: "createRequisition.priorities.urgent" },
];

// PR Type options
const PR_TYPE_OPTIONS = [
	{ value: "", label: "createRequisition.prTypes.selectType" },
	{ value: "Catalog", label: "createRequisition.prTypes.catalog" },
	{ value: "Non-Catalog", label: "createRequisition.prTypes.nonCatalog" },
	{ value: "Service", label: "createRequisition.prTypes.service" },
];

// Initial form state
const INITIAL_FORM_STATE = {
	date: new Date().toISOString().split("T")[0],
	required_date: "",
	requester_name: "",
	requester_department: "",
	requester_email: "",
	priority: "MEDIUM",
	pr_type: "",
	description: "",
	notes: "",
};

// Initial line item
const createEmptyLineItem = () => ({
	id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
	item_name: "",
	item_description: "",
	catalog_item_id: "",
	quantity: "",
	unit_of_measure_id: "",
	estimated_unit_price: "",
	notes: "",
});

const CreateRequisitionPage = () => {
	const { t, i18n } = useTranslation();
	usePageTitle(t("createRequisition.title"));
	const isRtl = i18n.dir() === "rtl";
	const navigate = useNavigate();
	const dispatch = useDispatch();

	// Redux state
	const { creating, actionError } = useSelector(state => state.requisitions || {});
	const { uoms = [] } = useSelector(state => state.uom || {});
	const { items: catalogItems = [] } = useSelector(state => state.catalogItems || {});
	const { types: segmentTypes = [], values: segmentValues = [] } = useSelector(state => state.segments);

	// Local state
	const [activeTab, setActiveTab] = useState("general");
	const [formData, setFormData] = useState(INITIAL_FORM_STATE);
	const [lineItems, setLineItems] = useState([createEmptyLineItem()]);
	const [formErrors, setFormErrors] = useState({});
	const [lineItemErrors, setLineItemErrors] = useState({});
	const [segments, setSegments] = useState([]);

	// Fetch UOMs, catalog items, and segment types on mount
	useEffect(() => {
		dispatch(fetchUOMs({ is_active: true }));
		dispatch(fetchCatalogItems());
		dispatch(fetchSegmentTypes());
	}, [dispatch]);

	// Fetch segment values (all at once to avoid state overwriting)
	useEffect(() => {
		if (segmentTypes.length > 0) {
			// Fetch all segment values without filtering by type
			// The API will return all values and we'll group them client-side
			dispatch(fetchSegmentValues({ is_active: true, page_size: 1000 }));
		}
	}, [dispatch, segmentTypes]);

	// Show error toast
	useEffect(() => {
		if (actionError) {
			const errorMsg =
				typeof actionError === "object" ? Object.values(actionError).flat().join(", ") : actionError;
			toast.error(errorMsg, { autoClose: 5000 });
			dispatch(clearError());
		}
	}, [actionError, dispatch]);

	// Check if PR type is selected
	const isPrTypeSelected = formData.pr_type !== "";

	// Tabs configuration
	const tabs = useMemo(
		() => [
			{ id: "general", label: t("createRequisition.tabs.generalInfo") },
			{ id: "lineItems", label: t("createRequisition.tabs.lineItems"), disabled: !isPrTypeSelected },
			{ id: "segments", label: t("createRequisition.tabs.segments") },
		],
		[t, isPrTypeSelected]
	);

	// Filter active UOMs
	const activeUOMs = useMemo(() => {
		const filtered = uoms.filter(uom => uom.is_active);
		return [
			{ value: "", label: t("createRequisition.form.selectUOM") },
			...filtered.map(uom => ({
				value: uom.id,
				label: `${uom.code} - ${uom.name}`,
			})),
		];
	}, [uoms, t]);

	// Filter active catalog items
	const activeCatalogItems = useMemo(() => {
		return [
			{ value: "", label: t("createRequisition.form.selectCatalogItem") },
			...catalogItems.map(item => ({
				value: item.id,
				label: `${item.code} - ${item.name}`,
			})),
		];
	}, [catalogItems, t]);

	// Priority options with translations
	const priorityOptions = useMemo(
		() =>
			PRIORITY_OPTIONS.map(opt => ({
				value: opt.value,
				label: t(opt.label),
			})),
		[t]
	);

	// PR Type options with translations
	const prTypeOptions = useMemo(
		() =>
			PR_TYPE_OPTIONS.map(opt => ({
				value: opt.value,
				label: t(opt.label),
			})),
		[t]
	);

	// Calculate total estimated amount
	const totalEstimatedAmount = useMemo(() => {
		return lineItems
			.reduce((total, item) => {
				const qty = parseFloat(item.quantity) || 0;
				const price = parseFloat(item.estimated_unit_price) || 0;
				return total + qty * price;
			}, 0)
			.toFixed(2);
	}, [lineItems]);

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

	const handleLineItemChange = useCallback(
		(itemId, field, value) => {
			setLineItems(prev => prev.map(item => (item.id === itemId ? { ...item, [field]: value } : item)));
			// Clear error for this field
			if (lineItemErrors[itemId]?.[field]) {
				setLineItemErrors(prev => ({
					...prev,
					[itemId]: { ...prev[itemId], [field]: "" },
				}));
			}
		},
		[lineItemErrors]
	);

	const handleAddLineItem = useCallback(() => {
		setLineItems(prev => [...prev, createEmptyLineItem()]);
	}, []);

	const handleSegmentChange = useCallback((segmentTypeId, segmentCode) => {
		setSegments(prev => {
			const existing = prev.find(s => s.segment_type_id === segmentTypeId);
			if (existing) {
				// Update existing segment
				return prev.map(s => (s.segment_type_id === segmentTypeId ? { ...s, segment_code: segmentCode } : s));
			} else {
				// Add new segment
				return [...prev, { segment_type_id: segmentTypeId, segment_code: segmentCode }];
			}
		});
	}, []);

	// Handle tab change with validation
	const handleTabChange = useCallback(
		tabId => {
			if (tabId === "lineItems" && !formData.pr_type) {
				toast.warning(t("createRequisition.validation.selectPrTypeFirst"));
				return;
			}
			setActiveTab(tabId);
		},
		[formData.pr_type, t]
	);

	const handleRemoveLineItem = useCallback(itemId => {
		setLineItems(prev => {
			if (prev.length <= 1) return prev;
			return prev.filter(item => item.id !== itemId);
		});
		// Remove errors for this item
		setLineItemErrors(prev => {
			const newErrors = { ...prev };
			delete newErrors[itemId];
			return newErrors;
		});
	}, []);

	// Validation
	const validateGeneralInfo = useCallback(() => {
		const errors = {};

		if (!formData.date) {
			errors.date = t("createRequisition.validation.dateRequired");
		}
		if (!formData.required_date) {
			errors.required_date = t("createRequisition.validation.requiredDateRequired");
		}
		if (!formData.requester_name.trim()) {
			errors.requester_name = t("createRequisition.validation.requesterNameRequired");
		}
		if (!formData.requester_department.trim()) {
			errors.requester_department = t("createRequisition.validation.requesterDepartmentRequired");
		}
		if (!formData.requester_email.trim()) {
			errors.requester_email = t("createRequisition.validation.requesterEmailRequired");
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.requester_email)) {
			errors.requester_email = t("createRequisition.validation.invalidEmail");
		}
		if (!formData.priority) {
			errors.priority = t("createRequisition.validation.priorityRequired");
		}
		if (!formData.description.trim()) {
			errors.description = t("createRequisition.validation.descriptionRequired");
		}
		if (!formData.pr_type) {
			errors.pr_type = t("createRequisition.validation.prTypeRequired");
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	}, [formData, t]);

	const validateLineItems = useCallback(() => {
		const errors = {};
		let isValid = true;

		lineItems.forEach(item => {
			const itemErrors = {};

			if (!item.item_name.trim()) {
				itemErrors.item_name = t("createRequisition.validation.itemNameRequired");
				isValid = false;
			}
			if (!item.quantity || parseFloat(item.quantity) <= 0) {
				itemErrors.quantity = t("createRequisition.validation.quantityRequired");
				isValid = false;
			}
			if (!item.unit_of_measure_id) {
				itemErrors.unit_of_measure_id = t("createRequisition.validation.uomRequired");
				isValid = false;
			}
			if (!item.estimated_unit_price || parseFloat(item.estimated_unit_price) <= 0) {
				itemErrors.estimated_unit_price = t("createRequisition.validation.priceRequired");
				isValid = false;
			}
			// Catalog type requires catalog_item_id
			if (formData.pr_type === "Catalog" && !item.catalog_item_id) {
				itemErrors.catalog_item_id = t("createRequisition.validation.catalogItemRequired");
				isValid = false;
			}

			if (Object.keys(itemErrors).length > 0) {
				errors[item.id] = itemErrors;
			}
		});

		setLineItemErrors(errors);
		return isValid;
	}, [lineItems, formData.pr_type, t]);

	const handleSubmit = useCallback(async () => {
		// Validate both tabs
		const isGeneralValid = validateGeneralInfo();
		const isLineItemsValid = validateLineItems();

		if (!isGeneralValid) {
			setActiveTab("general");
			toast.error(t("createRequisition.validation.checkGeneralInfo"));
			return;
		}

		if (!isLineItemsValid) {
			setActiveTab("lineItems");
			toast.error(t("createRequisition.validation.checkLineItems"));
			return;
		}

		// Prepare data
		const requisitionData = {
			date: formData.date,
			required_date: formData.required_date,
			requester_name: formData.requester_name.trim(),
			requester_department: formData.requester_department.trim(),
			requester_email: formData.requester_email.trim(),
			priority: formData.priority,
			description: formData.description.trim(),
			notes: formData.notes.trim(),
			items: lineItems.map(item => {
				const lineItem = {
					item_name: item.item_name.trim(),
					item_description: item.item_description.trim(),
					quantity: item.quantity,
					unit_of_measure_id: parseInt(item.unit_of_measure_id),
					estimated_unit_price: item.estimated_unit_price,
					notes: item.notes.trim(),
				};

				// Only include catalog_item_id for Catalog type
				if (formData.pr_type === "Catalog" && item.catalog_item_id) {
					lineItem.catalog_item_id = parseInt(item.catalog_item_id);
				}

				return lineItem;
			}),
			segments: segments
				.filter(s => s.segment_code)
				.map(s => ({
					segment_type_id: s.segment_type_id,
					segment_code: s.segment_code,
				})),
		};

		try {
			await dispatch(
				createRequisition({
					prType: formData.pr_type,
					data: requisitionData,
				})
			).unwrap();

			toast.success(t("createRequisition.messages.createSuccess"));
			navigate("/requisitions");
		} catch {
			// Error handled by Redux
		}
	}, [formData, lineItems, segments, validateGeneralInfo, validateLineItems, dispatch, navigate, t]);

	const handleCancel = useCallback(() => {
		navigate("/requisitions");
	}, [navigate]);

	// Render General Info Tab
	const renderGeneralInfoTab = () => (
		<div className="space-y-6">
			{/* PR Type */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelSelect
					id="pr_type"
					label={t("createRequisition.form.prType")}
					value={formData.pr_type}
					onChange={e => handleInputChange("pr_type", e.target.value)}
					options={prTypeOptions}
					error={formErrors.pr_type}
				/>
				<FloatingLabelSelect
					id="priority"
					label={t("createRequisition.form.priority")}
					value={formData.priority}
					onChange={e => handleInputChange("priority", e.target.value)}
					options={priorityOptions}
					error={formErrors.priority}
				/>
			</div>

			{/* Dates */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<FloatingLabelInput
					id="date"
					label={t("createRequisition.form.date")}
					type="date"
					value={formData.date}
					onChange={e => handleInputChange("date", e.target.value)}
					error={formErrors.date}
				/>
				<FloatingLabelInput
					id="required_date"
					label={t("createRequisition.form.requiredDate")}
					type="date"
					value={formData.required_date}
					onChange={e => handleInputChange("required_date", e.target.value)}
					error={formErrors.required_date}
				/>
			</div>

			{/* Requester Info */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<FloatingLabelInput
					id="requester_name"
					label={t("createRequisition.form.requesterName")}
					value={formData.requester_name}
					onChange={e => handleInputChange("requester_name", e.target.value)}
					placeholder={t("createRequisition.form.requesterNamePlaceholder")}
					error={formErrors.requester_name}
				/>
				<FloatingLabelInput
					id="requester_department"
					label={t("createRequisition.form.requesterDepartment")}
					value={formData.requester_department}
					onChange={e => handleInputChange("requester_department", e.target.value)}
					placeholder={t("createRequisition.form.requesterDepartmentPlaceholder")}
					error={formErrors.requester_department}
				/>
				<FloatingLabelInput
					id="requester_email"
					label={t("createRequisition.form.requesterEmail")}
					type="email"
					value={formData.requester_email}
					onChange={e => handleInputChange("requester_email", e.target.value)}
					placeholder={t("createRequisition.form.requesterEmailPlaceholder")}
					error={formErrors.requester_email}
				/>
			</div>

			{/* Description */}
			<FloatingLabelTextarea
				id="description"
				label={t("createRequisition.form.description")}
				value={formData.description}
				onChange={e => handleInputChange("description", e.target.value)}
				placeholder={t("createRequisition.form.descriptionPlaceholder")}
				error={formErrors.description}
				rows={3}
			/>

			{/* Notes */}
			<FloatingLabelTextarea
				id="notes"
				label={t("createRequisition.form.notes")}
				value={formData.notes}
				onChange={e => handleInputChange("notes", e.target.value)}
				placeholder={t("createRequisition.form.notesPlaceholder")}
				rows={3}
			/>
		</div>
	);

	// Render Segments Tab
	const renderSegmentsTab = () => {
		// Group segment values by segment type
		const segmentValuesByType = {};
		segmentValues.forEach(value => {
			if (!segmentValuesByType[value.segment_type]) {
				segmentValuesByType[value.segment_type] = [];
			}
			segmentValuesByType[value.segment_type].push(value);
		});

		console.log("Segment Types:", segmentTypes);
		console.log("Segment Values:", segmentValues);
		console.log("Grouped by Type:", segmentValuesByType);

		return (
			<div className="space-y-6">
				{/* Header with gradient */}
				<div className="bg-gradient-to-r from-[#28819C] to-[#48C1F0] rounded-2xl p-6 text-white shadow-lg">
					<div className="flex items-center gap-3 mb-2">
						<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
							/>
						</svg>
						<div>
							<h3 className="text-2xl font-bold">{t("createRequisition.segments.title")}</h3>
							<p className="text-blue-100 text-sm mt-1">{t("createRequisition.segments.subtitle")}</p>
						</div>
					</div>
				</div>

				{segmentTypes.length === 0 ? (
					<div className="text-center py-16">
						<svg
							className="w-20 h-20 mx-auto text-gray-300 mb-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
							/>
						</svg>
						<p className="text-gray-500 text-lg font-medium">
							{t("createRequisition.segments.noSegmentTypes")}
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
						{segmentTypes.map((segmentType, index) => {
							const values = segmentValuesByType[segmentType.id] || [];
							const selectedSegment = segments.find(s => s.segment_type_id === segmentType.id);
							const isRequired = segmentType.is_required;

							console.log(`Segment Type: ${segmentType.segment_name} (ID: ${segmentType.id})`);
							console.log("Values for this type:", values);

							const options = [
								{ value: "", label: t("createRequisition.segments.selectSegment") },
								...values.map(val => ({
									value: val.code,
									label: `${val.code} - ${val.alias}`,
								})),
							];

							// Color palette for cards
							const colors = [
								"border-blue-200 bg-blue-50/50",
								"border-purple-200 bg-purple-50/50",
								"border-green-200 bg-green-50/50",
								"border-amber-200 bg-amber-50/50",
								"border-pink-200 bg-pink-50/50",
								"border-indigo-200 bg-indigo-50/50",
							];
							const cardColor = colors[index % colors.length];

							return (
								<div
									key={segmentType.id}
									className={`border-2 rounded-xl p-5 transition-all hover:shadow-md ${cardColor}`}
								>
									<div className="flex items-center justify-between mb-3">
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 bg-[#28819C] rounded-full"></div>
											<h4 className="font-semibold text-gray-700 text-sm">
												{segmentType.segment_name}
												{isRequired && <span className="text-red-500 ml-1">*</span>}
											</h4>
										</div>
										<span className="text-xs bg-white/70 px-2 py-1 rounded-full text-gray-600 font-medium">
											{values.length} options
										</span>
									</div>
									<FloatingLabelSelect
										id={`segment_${segmentType.id}`}
										label={""}
										value={selectedSegment?.segment_code || ""}
										onChange={e => handleSegmentChange(segmentType.id, e.target.value)}
										options={options}
									/>
									{segmentType.description && (
										<p className="text-xs text-gray-500 mt-2 italic">{segmentType.description}</p>
									)}
								</div>
							);
						})}
					</div>
				)}

				{/* Selected Segments Summary */}
				{segments.filter(s => s.segment_code).length > 0 && (
					<div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-sm">
						<div className="flex items-center gap-2 mb-4">
							<svg
								className="w-6 h-6 text-green-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<h4 className="font-bold text-gray-800 text-lg">
								{t("createRequisition.segments.selectedSegments")}
							</h4>
							<span className="ml-auto bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
								{segments.filter(s => s.segment_code).length} / {segmentTypes.length}
							</span>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{segments
								.filter(s => s.segment_code)
								.map(segment => {
									const segmentType = segmentTypes.find(st => st.id === segment.segment_type_id);
									const segmentValue = segmentValues.find(
										sv =>
											sv.segment_type === segment.segment_type_id &&
											sv.code === segment.segment_code
									);
									return (
										<div
											key={segment.segment_type_id}
											className="bg-white rounded-lg p-4 shadow-sm border border-green-100"
										>
											<div className="flex items-start gap-3">
												<div className="w-1.5 h-full bg-green-500 rounded-full"></div>
												<div className="flex-1">
													<p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
														{segmentType?.segment_name}
													</p>
													<p className="text-[#28819C] font-bold text-sm">
														{segment.segment_code}
													</p>
													<p className="text-gray-700 text-xs mt-1">
														{segmentValue?.alias || "Unknown"}
													</p>
												</div>
											</div>
										</div>
									);
								})}
						</div>
					</div>
				)}
			</div>
		);
	};

	// Render Line Items Tab
	const renderLineItemsTab = () => (
		<div className="space-y-6">
			{/* Add Line Item Button */}
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold text-gray-800">
					{t("createRequisition.lineItems.title")} ({lineItems.length})
				</h3>
				<Button
					onClick={handleAddLineItem}
					title={t("createRequisition.lineItems.addItem")}
					icon={<FiPlus size={18} />}
				/>
			</div>

			{/* Line Items */}
			<div className="space-y-4">
				{lineItems.map((item, index) => (
					<div key={item.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
						{/* Line Item Header */}
						<div className="flex justify-between items-center mb-4">
							<h4 className="font-medium text-gray-700">
								{t("createRequisition.lineItems.item")} #{index + 1}
							</h4>
							{lineItems.length > 1 && (
								<button
									type="button"
									onClick={() => handleRemoveLineItem(item.id)}
									className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
								>
									<FiTrash2 size={18} />
								</button>
							)}
						</div>

						{/* Item Details */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
							<FloatingLabelInput
								id={`item_name_${item.id}`}
								label={t("createRequisition.lineItems.itemName")}
								value={item.item_name}
								onChange={e => handleLineItemChange(item.id, "item_name", e.target.value)}
								placeholder={t("createRequisition.lineItems.itemNamePlaceholder")}
								error={lineItemErrors[item.id]?.item_name}
							/>

							{/* Show catalog item select only for Catalog type */}
							{formData.pr_type === "Catalog" && (
								<FloatingLabelSelect
									id={`catalog_item_${item.id}`}
									label={t("createRequisition.lineItems.catalogItem")}
									value={item.catalog_item_id}
									onChange={e => handleLineItemChange(item.id, "catalog_item_id", e.target.value)}
									options={activeCatalogItems}
									error={lineItemErrors[item.id]?.catalog_item_id}
								/>
							)}
						</div>

						<div className="mb-4">
							<FloatingLabelTextarea
								id={`item_description_${item.id}`}
								label={t("createRequisition.lineItems.itemDescription")}
								value={item.item_description}
								onChange={e => handleLineItemChange(item.id, "item_description", e.target.value)}
								placeholder={t("createRequisition.lineItems.itemDescriptionPlaceholder")}
								rows={2}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
							<FloatingLabelInput
								id={`quantity_${item.id}`}
								label={t("createRequisition.lineItems.quantity")}
								type="number"
								min="1"
								value={item.quantity}
								onChange={e => handleLineItemChange(item.id, "quantity", e.target.value)}
								error={lineItemErrors[item.id]?.quantity}
							/>
							<FloatingLabelSelect
								id={`uom_${item.id}`}
								label={t("createRequisition.lineItems.uom")}
								value={item.unit_of_measure_id}
								onChange={e => handleLineItemChange(item.id, "unit_of_measure_id", e.target.value)}
								options={activeUOMs}
								error={lineItemErrors[item.id]?.unit_of_measure_id}
							/>
							<FloatingLabelInput
								id={`price_${item.id}`}
								label={t("createRequisition.lineItems.estimatedPrice")}
								type="number"
								step="0.01"
								min="0"
								value={item.estimated_unit_price}
								onChange={e => handleLineItemChange(item.id, "estimated_unit_price", e.target.value)}
								error={lineItemErrors[item.id]?.estimated_unit_price}
							/>
						</div>

						{/* Line Total */}
						<div className="flex justify-between items-center bg-white rounded-lg p-3 border border-gray-100">
							<span className="text-sm text-gray-600">{t("createRequisition.lineItems.lineTotal")}</span>
							<span className="font-semibold text-[#28819C]">
								$
								{(
									(parseFloat(item.quantity) || 0) * (parseFloat(item.estimated_unit_price) || 0)
								).toFixed(2)}
							</span>
						</div>

						{/* Item Notes */}
						<div className="mt-4">
							<FloatingLabelInput
								id={`notes_${item.id}`}
								label={t("createRequisition.lineItems.notes")}
								value={item.notes}
								onChange={e => handleLineItemChange(item.id, "notes", e.target.value)}
								placeholder={t("createRequisition.lineItems.notesPlaceholder")}
							/>
						</div>
					</div>
				))}
			</div>

			{/* Total Estimated Amount */}
			<div className="bg-[#28819C]/10 rounded-xl p-5 border border-[#28819C]/20">
				<div className="flex justify-between items-center">
					<span className="text-lg font-medium text-gray-700">
						{t("createRequisition.lineItems.totalEstimatedAmount")}
					</span>
					<span className="text-2xl font-bold text-[#28819C]">${totalEstimatedAmount}</span>
				</div>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<PageHeader
				title={t("createRequisition.title")}
				subtitle={t("createRequisition.subtitle")}
				icon={<RequisitionsHeadIcon width={32} height={30} className="text-[#28819C]" />}
			/>

			<div className="mx-auto px-6 py-8 max-w-5xl">
				{/* Tabs */}
				<div className="mb-6">
					<Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
				</div>

				{/* Form Content */}
				<Card className="p-6">
					{activeTab === "general" && renderGeneralInfoTab()}
					{activeTab === "lineItems" && renderLineItemsTab()}
					{activeTab === "segments" && renderSegmentsTab()}

					{/* Action Buttons */}
					<div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
						<Button
							onClick={handleCancel}
							title={t("createRequisition.actions.cancel")}
							className="bg-gray-100 text-gray-700 hover:bg-gray-200"
							disabled={creating}
						/>
						<Button
							onClick={handleSubmit}
							title={
								creating
									? t("createRequisition.actions.creating")
									: t("createRequisition.actions.create")
							}
							disabled={creating}
						/>
					</div>
				</Card>
			</div>

			{/* Toast Container */}
			<ToastContainer
				position={isRtl ? "top-left" : "top-right"}
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={isRtl}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="light"
			/>
		</div>
	);
};

export default CreateRequisitionPage;
