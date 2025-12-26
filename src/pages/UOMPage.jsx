import { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import SlideUpModal from "../components/shared/SlideUpModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import FloatingLabelTextarea from "../components/shared/FloatingLabelTextarea";
import ConfirmModal from "../components/shared/ConfirmModal";
import Button from "../components/shared/Button";
import Toggle from "../components/shared/Toggle";
import LoadingSpan from "../components/shared/LoadingSpan";

import { fetchUOMs, createUOM, updateUOM, deleteUOM, toggleUOMActive, clearError } from "../store/uomSlice";

import { BiPlusCircle } from "react-icons/bi";
import { TbRulerMeasure } from "react-icons/tb";

// UOM Types constant
const UOM_TYPES = [
	{ value: "QUANTITY", label: "uom.types.quantity" },
	{ value: "WEIGHT", label: "uom.types.weight" },
	{ value: "LENGTH", label: "uom.types.length" },
	{ value: "AREA", label: "uom.types.area" },
	{ value: "VOLUME", label: "uom.types.volume" },
];

const INITIAL_FORM_STATE = {
	code: "",
	name: "",
	description: "",
	uom_type: "",
	is_active: true,
};

const UOMPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	const {
		uoms = [],
		loading,
		error,
		creating,
		updating,
		deleting,
		actionError,
	} = useSelector(state => state.uom || {});

	// Modal states
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedUOM, setSelectedUOM] = useState(null);

	// Form state
	const [formData, setFormData] = useState(INITIAL_FORM_STATE);
	const [formErrors, setFormErrors] = useState({});

	// Filter states
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState("all");
	const [filterActive, setFilterActive] = useState("");

	// Fetch UOMs on mount and when filters change
	useEffect(() => {
		const params = {};
		if (searchTerm) params.search = searchTerm;
		if (filterType !== "all") params.uom_type = filterType;
		if (filterActive !== "") params.is_active = filterActive;

		dispatch(fetchUOMs(params));
	}, [dispatch, searchTerm, filterType, filterActive]);

	// Show error toast
	useEffect(() => {
		if (error || actionError) {
			const errorMsg =
				typeof actionError === "object" ? Object.values(actionError).flat().join(", ") : error || actionError;
			toast.error(errorMsg, { autoClose: 5000 });
			dispatch(clearError());
		}
	}, [error, actionError, dispatch]);

	// Update page title
	useEffect(() => {
		document.title = `${t("uom.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	// Memoized type options with translations
	const typeOptions = useMemo(
		() => [
			{ value: "all", label: t("uom.filters.allTypes") },
			...UOM_TYPES.map(type => ({
				value: type.value,
				label: t(type.label),
			})),
		],
		[t]
	);

	// Active filter options
	const activeOptions = useMemo(
		() => [
			{ value: "", label: t("uom.filters.allStatus") },
			{ value: "true", label: t("uom.filters.active") },
			{ value: "false", label: t("uom.filters.inactive") },
		],
		[t]
	);

	// Form type options
	const formTypeOptions = useMemo(
		() => [
			{ value: "", label: t("uom.form.selectType") },
			...UOM_TYPES.map(type => ({
				value: type.value,
				label: t(type.label),
			})),
		],
		[t]
	);

	// Calculate statistics
	const stats = useMemo(() => {
		const total = uoms.length;
		const active = uoms.filter(u => u.is_active).length;
		const inactive = total - active;
		return { total, active, inactive };
	}, [uoms]);

	// Table columns
	const columns = [
		{
			header: t("uom.table.code"),
			accessor: "code",
			render: value => (
				<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#28819C]/10 text-[#28819C]">
					{value || "-"}
				</span>
			),
		},
		{
			header: t("uom.table.name"),
			accessor: "name",
			render: value => <span className="font-medium text-gray-800">{value || "-"}</span>,
		},
		{
			header: t("uom.table.type"),
			accessor: "uom_type",
			render: value => {
				const typeObj = UOM_TYPES.find(type => type.value === value);
				return (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
						{typeObj ? t(typeObj.label) : value || "-"}
					</span>
				);
			},
		},
		{
			header: t("uom.table.active"),
			accessor: "is_active",
			width: "140px",
			render: (value, row) => (
				<div className="flex items-center gap-3">
					<Toggle checked={!!value} onChange={checked => handleToggleActive(row, checked)} />
				</div>
			),
		},
	];

	// Handlers
	const handleToggleActive = async (uom, newValue) => {
		try {
			await dispatch(toggleUOMActive(uom.id)).unwrap();
			toast.success(
				newValue
					? t("uom.messages.activated", { code: uom.code })
					: t("uom.messages.deactivated", { code: uom.code })
			);
		} catch (err) {
			const errorMessage = err?.message || err?.error || t("uom.messages.updateActiveError");
			toast.error(errorMessage);
		}
	};

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (formErrors[field]) {
			setFormErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = () => {
		const errors = {};

		if (!formData.code.trim()) {
			errors.code = t("uom.validation.codeRequired");
		} else if (formData.code.length > 10) {
			errors.code = t("uom.validation.codeMaxLength");
		}

		if (!formData.name.trim()) {
			errors.name = t("uom.validation.nameRequired");
		}

		if (!formData.uom_type) {
			errors.uom_type = t("uom.validation.typeRequired");
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleOpenCreate = () => {
		setFormData(INITIAL_FORM_STATE);
		setFormErrors({});
		setIsEditMode(false);
		setIsModalOpen(true);
	};

	const handleEdit = row => {
		setSelectedUOM(row);
		setFormData({
			code: row.code || "",
			name: row.name || "",
			description: row.description || "",
			uom_type: row.uom_type || "",
			is_active: row.is_active !== undefined ? row.is_active : true,
		});
		setFormErrors({});
		setIsEditMode(true);
		setIsModalOpen(true);
	};

	const handleDelete = row => {
		setSelectedUOM(row);
		setIsDeleteModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setIsEditMode(false);
		setSelectedUOM(null);
		setFormData(INITIAL_FORM_STATE);
		setFormErrors({});
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		try {
			const uomData = {
				code: formData.code.toUpperCase().trim(),
				name: formData.name.trim(),
				description: formData.description.trim(),
				uom_type: formData.uom_type,
				is_active: formData.is_active,
			};

			if (isEditMode && selectedUOM) {
				await dispatch(updateUOM({ id: selectedUOM.id, data: uomData })).unwrap();
				toast.success(t("uom.messages.updateSuccess"));
			} else {
				await dispatch(createUOM(uomData)).unwrap();
				toast.success(t("uom.messages.createSuccess"));
			}

			handleCloseModal();
			// Refresh the list
			const params = {};
			if (searchTerm) params.search = searchTerm;
			if (filterType !== "all") params.uom_type = filterType;
			if (filterActive !== "") params.is_active = filterActive;
			dispatch(fetchUOMs(params));
		} catch {
			// Error handled by Redux
		}
	};

	const handleConfirmDelete = async () => {
		try {
			await dispatch(deleteUOM(selectedUOM.id)).unwrap();
			toast.success(t("uom.messages.deleteSuccess"));
			setIsDeleteModalOpen(false);
			setSelectedUOM(null);
		} catch {
			// Error handled by Redux
		}
	};

	const handleSearch = useCallback(e => {
		setSearchTerm(e.target.value);
	}, []);

	const handleTypeFilter = useCallback(e => {
		setFilterType(e.target.value);
	}, []);

	const handleActiveFilter = useCallback(e => {
		setFilterActive(e.target.value);
	}, []);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<PageHeader
				title={t("uom.title")}
				subtitle={t("uom.subtitle")}
				icon={<TbRulerMeasure size={30} color="#28819C" />}
			/>

			<div className="mx-auto px-6 py-8">
				{/* Header with Title and Button */}
				<div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
					<h2 className="text-2xl font-bold text-gray-900">{t("uom.title")}</h2>

					<div className="flex items-center gap-4 flex-wrap">
						{/* Search Input */}
						<div className="relative">
							<svg
								className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
							>
								<path
									d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<input
								type="text"
								placeholder={t("uom.searchPlaceholder")}
								value={searchTerm}
								onChange={handleSearch}
								className="w-64 pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#48C1F0]/40 transition-all"
							/>
						</div>

						{/* Type Filter */}
						<div className="w-48">
							<FloatingLabelSelect
								id="typeFilter"
								value={filterType}
								onChange={handleTypeFilter}
								options={typeOptions}
							/>
						</div>

						{/* Active Filter */}
						<div className="w-40">
							<FloatingLabelSelect
								id="activeFilter"
								value={filterActive}
								onChange={handleActiveFilter}
								options={activeOptions}
							/>
						</div>

						{/* Add Button */}
						<Button
							onClick={handleOpenCreate}
							title={t("uom.actions.add")}
							icon={<BiPlusCircle size={24} />}
						/>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-xl bg-[#28819C]/10 flex items-center justify-center">
								<TbRulerMeasure size={24} className="text-[#28819C]" />
							</div>
							<div>
								<p className="text-sm text-gray-500">{t("uom.stats.total")}</p>
								<p className="text-2xl font-bold text-gray-900">{stats.total}</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-600">
									<path
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
							<div>
								<p className="text-sm text-gray-500">{t("uom.stats.active")}</p>
								<p className="text-2xl font-bold text-green-600">{stats.active}</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-600">
									<path
										d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
							<div>
								<p className="text-sm text-gray-500">{t("uom.stats.inactive")}</p>
								<p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Table */}
				{loading ? (
					<LoadingSpan />
				) : (
					<Table
						columns={columns}
						data={uoms}
						onEdit={handleEdit}
						onDelete={handleDelete}
						editIcon="edit"
						emptyMessage={t("uom.table.emptyMessage")}
					/>
				)}
			</div>

			{/* Add/Edit Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={isEditMode ? t("uom.modals.editTitle") : t("uom.modals.addTitle")}
				maxWidth="550px"
			>
				<div className="space-y-5 p-4">
					{/* UOM Code */}
					<FloatingLabelInput
						label={t("uom.form.code")}
						name="code"
						value={formData.code}
						onChange={e => handleInputChange("code", e.target.value.toUpperCase())}
						placeholder={t("uom.form.codePlaceholder")}
						error={formErrors.code}
						maxLength={10}
					/>

					{/* UOM Name */}
					<FloatingLabelInput
						label={t("uom.form.name")}
						name="name"
						value={formData.name}
						onChange={e => handleInputChange("name", e.target.value)}
						placeholder={t("uom.form.namePlaceholder")}
						error={formErrors.name}
					/>

					{/* UOM Type */}
					<FloatingLabelSelect
						id="uom_type"
						label={t("uom.form.type")}
						value={formData.uom_type}
						onChange={e => handleInputChange("uom_type", e.target.value)}
						options={formTypeOptions}
						error={formErrors.uom_type}
					/>

					{/* Description */}
					<FloatingLabelTextarea
						label={t("uom.form.description")}
						name="description"
						value={formData.description}
						onChange={e => handleInputChange("description", e.target.value)}
						placeholder={t("uom.form.descriptionPlaceholder")}
						rows={3}
					/>

					{/* Active Toggle */}
					<div className="flex items-center justify-between py-2">
						<span className="text-sm font-medium text-gray-700">{t("uom.form.isActive")}</span>
						<Toggle
							checked={formData.is_active}
							onChange={checked => handleInputChange("is_active", checked)}
						/>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4 justify-center">
						<Button
							onClick={handleCloseModal}
							title={t("uom.actions.cancel")}
							className="bg-gray-100 text-gray-700 hover:bg-gray-200"
						/>

						<Button
							disabled={creating || updating}
							onClick={handleSubmit}
							title={
								creating || updating
									? t("uom.actions.saving")
									: isEditMode
									? t("uom.actions.update")
									: t("uom.actions.create")
							}
						/>
					</div>
				</div>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setSelectedUOM(null);
				}}
				onConfirm={handleConfirmDelete}
				title={t("uom.modals.deleteTitle")}
				message={t("uom.modals.deleteMessage", { name: selectedUOM?.name, code: selectedUOM?.code })}
				confirmText={deleting ? t("uom.actions.deleting") : t("uom.actions.delete")}
				cancelText={t("uom.actions.cancel")}
				loading={deleting}
			/>

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

export default UOMPage;
