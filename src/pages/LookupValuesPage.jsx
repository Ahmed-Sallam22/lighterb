import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Search, X } from "react-icons/fi";
import ErpPageTemplate from "../components/ErpPageTemplate";
import CustomTable from "../components/shared/CustomTable";
import Pagination from "../components/shared/Pagination";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelTextarea from "../components/shared/FloatingLabelTextarea";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import Button from "../components/shared/Button";
import ConfirmModal from "../components/shared/ConfirmModal";
import { usePageTitle } from "../hooks/usePageTitle";
import {
	fetchLookupValuesList,
	fetchLookupValueById,
	createLookupValue,
	updateLookupValue,
	deleteLookupValue,
	clearError,
	clearSuccess,
	clearCurrentLookupValue,
	fetchLookupTypesList,
} from "../store/lookupManagementSlice";

const VALUE_FORM_INITIAL = {
	lookup_type: "",
	name: "",
	sequence: "",
	description: "",
	parent: "",
};

const INITIAL_FILTERS = {
	lookupType: "",
	parentName: "",
};

const LookupValuesPage = () => {
	const { t } = useTranslation();
	usePageTitle(t("lookupValues.title"));
	const dispatch = useDispatch();

	// Redux state
	const {
		lookupValues,
		lookupTypes,
		valuesLoading,
		valuesCount,
		valuesPage,
		valuesHasNext,
		valuesHasPrevious,
		creating,
		updating,
		deleting,
		currentLookupValue,
		error,
		success,
	} = useSelector(state => state.lookupManagement);

	// Local state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingValue, setEditingValue] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [valueToDelete, setValueToDelete] = useState(null);
	const [formData, setFormData] = useState(VALUE_FORM_INITIAL);
	const [formErrors, setFormErrors] = useState({});
	const [localPageSize, setLocalPageSize] = useState(25);
	const [filters, setFilters] = useState(INITIAL_FILTERS);

	// Fetch lookup types for dropdown
	useEffect(() => {
		dispatch(fetchLookupTypesList({ page: 1, pageSize: 1000 }));
	}, [dispatch]);

	// Fetch lookup values when page or filters change
	useEffect(() => {
		dispatch(
			fetchLookupValuesList({
				page: valuesPage,
				pageSize: localPageSize,
				lookupType: filters.lookupType,
				parentName: filters.parentName,
			})
		);
	}, [dispatch, valuesPage, localPageSize, filters]);

	// Handle success/error notifications
	useEffect(() => {
		if (success) {
			const timer = setTimeout(() => {
				dispatch(clearSuccess());
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [success, dispatch]);

	useEffect(() => {
		if (error) {
			const timer = setTimeout(() => {
				dispatch(clearError());
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [error, dispatch]);

	// Load value data for editing
	useEffect(() => {
		if (currentLookupValue && editingValue) {
			setFormData({
				lookup_type: currentLookupValue.lookup_type || "",
				name: currentLookupValue.name || "",
				sequence: currentLookupValue.sequence || "",
				description: currentLookupValue.description || "",
				parent: currentLookupValue.parent || "",
			});
		}
	}, [currentLookupValue, editingValue]);

	const handlePageChange = useCallback(
		newPage => {
			dispatch(
				fetchLookupValuesList({
					page: newPage,
					pageSize: localPageSize,
					lookupType: filters.lookupType,
					parentName: filters.parentName,
				})
			);
		},
		[dispatch, localPageSize, filters]
	);

	const handlePageSizeChange = useCallback(
		newPageSize => {
			setLocalPageSize(newPageSize);
			dispatch(
				fetchLookupValuesList({
					page: 1,
					pageSize: newPageSize,
					lookupType: filters.lookupType,
					parentName: filters.parentName,
				})
			);
		},
		[dispatch, filters]
	);

	const handleFilterChange = e => {
		const { name, value } = e.target;
		setFilters(prev => ({ ...prev, [name]: value }));
	};

	const handleSearch = () => {
		dispatch(
			fetchLookupValuesList({
				page: 1,
				pageSize: localPageSize,
				lookupType: filters.lookupType,
				parentName: filters.parentName,
			})
		);
	};

	const handleClearFilters = () => {
		setFilters(INITIAL_FILTERS);
		dispatch(
			fetchLookupValuesList({
				page: 1,
				pageSize: localPageSize,
				lookupType: "",
				parentName: "",
			})
		);
	};

	// Modal handlers
	const handleCreateValue = () => {
		setEditingValue(null);
		setFormData(VALUE_FORM_INITIAL);
		setFormErrors({});
		dispatch(clearCurrentLookupValue());
		setIsModalOpen(true);
	};

	const handleEditValue = async item => {
		setEditingValue(item);
		setFormErrors({});
		setIsModalOpen(true);
		// Fetch full details
		await dispatch(fetchLookupValueById(item.id));
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingValue(null);
		setFormData(VALUE_FORM_INITIAL);
		setFormErrors({});
		dispatch(clearCurrentLookupValue());
	};

	const handleInputChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		// Clear error for this field
		if (formErrors[name]) {
			setFormErrors(prev => ({ ...prev, [name]: "" }));
		}
	};

	const validateForm = () => {
		const errors = {};
		if (!formData.lookup_type) {
			errors.lookup_type = t("lookupValues.form.errors.lookupTypeRequired");
		}
		if (!formData.name?.trim()) {
			errors.name = t("lookupValues.form.errors.nameRequired");
		}
		if (!formData.sequence) {
			errors.sequence = t("lookupValues.form.errors.sequenceRequired");
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			const payload = {
				lookup_type: parseInt(formData.lookup_type),
				name: formData.name.trim(),
				sequence: parseInt(formData.sequence),
				description: formData.description?.trim() || "",
				parent: formData.parent ? parseInt(formData.parent) : null,
			};

			if (editingValue) {
				await dispatch(updateLookupValue({ id: editingValue.id, data: payload })).unwrap();
			} else {
				await dispatch(createLookupValue(payload)).unwrap();
			}
			handleCloseModal();
			// Refresh list
			dispatch(
				fetchLookupValuesList({
					page: valuesPage,
					pageSize: localPageSize,
					lookupType: filters.lookupType,
					parentName: filters.parentName,
				})
			);
		} catch (err) {
			console.error("Failed to save lookup value:", err);
		}
	};

	const handleDeleteClick = item => {
		setValueToDelete(item);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!valueToDelete) return;
		try {
			await dispatch(deleteLookupValue(valueToDelete.id)).unwrap();
			setIsDeleteModalOpen(false);
			setValueToDelete(null);
			// Refresh list
			dispatch(
				fetchLookupValuesList({
					page: valuesPage,
					pageSize: localPageSize,
					lookupType: filters.lookupType,
					parentName: filters.parentName,
				})
			);
		} catch (err) {
			console.error("Failed to delete lookup value:", err);
			setIsDeleteModalOpen(false);
			setValueToDelete(null);
		}
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
		setValueToDelete(null);
	};

	// Options for dropdowns
	const lookupTypeOptions = useMemo(
		() => [
			{ value: "", label: t("lookupValues.filters.allTypes") },
			...lookupTypes.map(type => ({
				value: type.name,
				label: type.name,
			})),
		],
		[lookupTypes, t]
	);

	const lookupTypeFormOptions = useMemo(
		() => [
			{ value: "", label: t("lookupValues.form.selectLookupType") },
			...lookupTypes.map(type => ({
				value: type.id,
				label: type.name,
			})),
		],
		[lookupTypes, t]
	);

	const parentValueOptions = useMemo(() => {
		const options = [{ value: "", label: t("lookupValues.form.noParent") }];

		// Get potential parent values from the current list
		// Only show values that could be parents (same type or related)
		if (formData.lookup_type) {
			const relevantValues = lookupValues.filter(
				v => v.lookup_type === parseInt(formData.lookup_type) && (!editingValue || v.id !== editingValue.id)
			);
			options.push(
				...relevantValues.map(v => ({
					value: v.id,
					label: v.name,
				}))
			);
		}

		return options;
	}, [lookupValues, formData.lookup_type, editingValue, t]);

	const renderBoolean = value => (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
				value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
			}`}
		>
			{value ? t("common.yes") : t("common.no")}
		</span>
	);

	// Table columns
	const columns = [
		{
			header: t("lookupValues.table.lookupType"),
			accessor: "lookup_type_name",
			render: value => value || "-",
		},
		{
			header: t("lookupValues.table.name"),
			accessor: "name",
			render: value => value || "-",
		},
		{
			header: t("lookupValues.table.description"),
			accessor: "description",
			render: value => value || "-",
		},
		{
			header: t("lookupValues.table.sequence"),
			accessor: "sequence",
			render: value => value || "-",
		},
		{
			header: t("lookupValues.table.parentName"),
			accessor: "parent_name",
			render: value => value || "-",
		},
		{
			header: t("lookupValues.table.isActive"),
			accessor: "is_active",
			render: renderBoolean,
		},
	];

	const actions = [
		{
			label: t("common.edit"),
			onClick: handleEditValue,
			variant: "secondary",
		},
		{
			label: t("common.delete"),
			onClick: handleDeleteClick,
			variant: "danger",
		},
	];

	return (
		<ErpPageTemplate title={t("lookupValues.title")} showBackButton={false}>
			{/* Success/Error Messages */}
			{success && (
				<div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">{success}</div>
			)}
			{error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">{error}</div>}

			{/* Filters Section */}
			<div className="mb-6 bg-white rounded-lg shadow p-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
					<FloatingLabelSelect
						label={t("lookupValues.filters.lookupType")}
						name="lookupType"
						value={filters.lookupType}
						onChange={handleFilterChange}
						options={lookupTypeOptions}
					/>
					<FloatingLabelInput
						label={t("lookupValues.filters.parentName")}
						name="parentName"
						value={filters.parentName}
						onChange={handleFilterChange}
						placeholder={t("lookupValues.filters.parentNamePlaceholder")}
					/>
				</div>
				<div className="flex items-center gap-4">
					<Button onClick={handleSearch} variant="primary">
						<Search size={18} className="mr-2" />
						{t("common.search")}
					</Button>
					{(filters.lookupType || filters.parentName) && (
						<Button onClick={handleClearFilters} variant="secondary">
							<X size={18} className="mr-2" />
							{t("common.clear")}
						</Button>
					)}
					<Button onClick={handleCreateValue} variant="primary" className="ml-auto">
						<Plus size={18} className="mr-2" />
						{t("lookupValues.actions.create")}
					</Button>
				</div>
			</div>

			{/* Table Section */}
			<div className="bg-white rounded-lg shadow">
				<CustomTable
					columns={columns}
					data={lookupValues}
					actions={actions}
					loading={valuesLoading}
					emptyMessage={t("lookupValues.table.empty")}
				/>

				{/* Pagination */}
				{valuesCount > 0 && (
					<div className="p-4 border-t">
						<Pagination
							currentPage={valuesPage}
							totalItems={valuesCount}
							pageSize={localPageSize}
							onPageChange={handlePageChange}
							onPageSizeChange={handlePageSizeChange}
							hasNext={valuesHasNext}
							hasPrevious={valuesHasPrevious}
						/>
					</div>
				)}
			</div>

			{/* Create/Edit Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<h2 className="text-2xl font-bold mb-6">
								{editingValue ? t("lookupValues.modal.editTitle") : t("lookupValues.modal.createTitle")}
							</h2>

							<form onSubmit={handleSubmit} className="space-y-4">
								<FloatingLabelSelect
									label={t("lookupValues.form.lookupType")}
									name="lookup_type"
									value={formData.lookup_type}
									onChange={handleInputChange}
									options={lookupTypeFormOptions}
									error={formErrors.lookup_type}
									required
								/>

								<FloatingLabelInput
									label={t("lookupValues.form.name")}
									name="name"
									value={formData.name}
									onChange={handleInputChange}
									error={formErrors.name}
									required
								/>

								<FloatingLabelInput
									label={t("lookupValues.form.sequence")}
									name="sequence"
									type="number"
									value={formData.sequence}
									onChange={handleInputChange}
									error={formErrors.sequence}
									required
								/>

								<FloatingLabelTextarea
									label={t("lookupValues.form.description")}
									name="description"
									value={formData.description}
									onChange={handleInputChange}
									rows={3}
								/>

								<FloatingLabelSelect
									label={t("lookupValues.form.parent")}
									name="parent"
									value={formData.parent}
									onChange={handleInputChange}
									options={parentValueOptions}
								/>

								<div className="flex justify-end gap-3 pt-4">
									<Button
										type="button"
										onClick={handleCloseModal}
										variant="secondary"
										disabled={creating || updating}
									>
										{t("common.cancel")}
									</Button>
									<Button type="submit" variant="primary" disabled={creating || updating}>
										{creating || updating ? t("common.saving") : t("common.save")}
									</Button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title={t("lookupValues.deleteModal.title")}
				message={t("lookupValues.deleteModal.message", { name: valueToDelete?.name })}
				confirmText={t("common.delete")}
				cancelText={t("common.cancel")}
				variant="danger"
				loading={deleting}
			/>
		</ErpPageTemplate>
	);
};

export default LookupValuesPage;
