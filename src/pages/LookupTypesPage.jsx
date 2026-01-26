import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
// import { Plus, Search, X } from "lucide-react";
import { Plus, Search, X } from "react-icons/fi";
import ErpPageTemplate from "../components/ErpPageTemplate";
import CustomTable from "../components/shared/CustomTable";
import Pagination from "../components/shared/Pagination";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelTextarea from "../components/shared/FloatingLabelTextarea";
import Button from "../components/shared/Button";
import ConfirmModal from "../components/shared/ConfirmModal";
import usePageTitle from "../hooks/usePageTitle";
import {
	fetchLookupTypesList,
	fetchLookupTypeById,
	createLookupType,
	updateLookupType,
	deleteLookupType,
	clearError,
	clearSuccess,
	clearCurrentLookupType,
} from "../store/lookupManagementSlice";

const TYPE_FORM_INITIAL = {
	name: "",
	description: "",
};

const INITIAL_FILTERS = {
	search: "",
};

const LookupTypesPage = () => {
	const { t } = useTranslation();
	usePageTitle(t("lookupTypes.title"));
	const dispatch = useDispatch();

	// Redux state
	const {
		lookupTypes,
		typesLoading,
		typesCount,
		typesPage,
		typesHasNext,
		typesHasPrevious,
		creating,
		updating,
		deleting,
		currentLookupType,
		error,
		success,
	} = useSelector(state => state.lookupManagement);

	// Local state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingType, setEditingType] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [typeToDelete, setTypeToDelete] = useState(null);
	const [formData, setFormData] = useState(TYPE_FORM_INITIAL);
	const [formErrors, setFormErrors] = useState({});
	const [localPageSize, setLocalPageSize] = useState(25);
	const [filters, setFilters] = useState(INITIAL_FILTERS);

	// Fetch lookup types when page or filters change
	useEffect(() => {
		dispatch(
			fetchLookupTypesList({
				page: typesPage,
				pageSize: localPageSize,
				search: filters.search,
			})
		);
	}, [dispatch, typesPage, localPageSize, filters]);

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

	// Load type data for editing
	useEffect(() => {
		if (currentLookupType && editingType) {
			setFormData({
				name: currentLookupType.name || "",
				description: currentLookupType.description || "",
			});
		}
	}, [currentLookupType, editingType]);

	const handlePageChange = useCallback(
		newPage => {
			dispatch(fetchLookupTypesList({ page: newPage, pageSize: localPageSize, search: filters.search }));
		},
		[dispatch, localPageSize, filters.search]
	);

	const handlePageSizeChange = useCallback(
		newPageSize => {
			setLocalPageSize(newPageSize);
			dispatch(
				fetchLookupTypesList({
					page: 1,
					pageSize: newPageSize,
					search: filters.search,
				})
			);
		},
		[dispatch, filters.search]
	);

	const handleFilterChange = e => {
		const { name, value } = e.target;
		setFilters(prev => ({ ...prev, [name]: value }));
	};

	const handleSearch = () => {
		dispatch(
			fetchLookupTypesList({
				page: 1,
				pageSize: localPageSize,
				search: filters.search,
			})
		);
	};

	const handleClearSearch = () => {
		setFilters({ search: "" });
		dispatch(
			fetchLookupTypesList({
				page: 1,
				pageSize: localPageSize,
				search: "",
			})
		);
	};

	// Modal handlers
	const handleCreateType = () => {
		setEditingType(null);
		setFormData(TYPE_FORM_INITIAL);
		setFormErrors({});
		dispatch(clearCurrentLookupType());
		setIsModalOpen(true);
	};

	const handleEditType = async item => {
		setEditingType(item);
		setFormErrors({});
		setIsModalOpen(true);
		// Fetch full details
		await dispatch(fetchLookupTypeById(item.id));
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingType(null);
		setFormData(TYPE_FORM_INITIAL);
		setFormErrors({});
		dispatch(clearCurrentLookupType());
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
		if (!formData.name?.trim()) {
			errors.name = t("lookupTypes.form.errors.nameRequired");
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			const payload = {
				name: formData.name.trim(),
				description: formData.description?.trim() || "",
			};

			if (editingType) {
				await dispatch(updateLookupType({ id: editingType.id, data: payload })).unwrap();
			} else {
				await dispatch(createLookupType(payload)).unwrap();
			}
			handleCloseModal();
			// Refresh list
			dispatch(
				fetchLookupTypesList({
					page: typesPage,
					pageSize: localPageSize,
					search: filters.search,
				})
			);
		} catch (err) {
			console.error("Failed to save lookup type:", err);
		}
	};

	const handleDeleteClick = item => {
		setTypeToDelete(item);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!typeToDelete) return;
		try {
			await dispatch(deleteLookupType(typeToDelete.id)).unwrap();
			setIsDeleteModalOpen(false);
			setTypeToDelete(null);
			// Refresh list
			dispatch(
				fetchLookupTypesList({
					page: typesPage,
					pageSize: localPageSize,
					search: filters.search,
				})
			);
		} catch (err) {
			console.error("Failed to delete lookup type:", err);
			setIsDeleteModalOpen(false);
			setTypeToDelete(null);
		}
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
		setTypeToDelete(null);
	};

	// Table columns
	const columns = [
		{
			header: t("lookupTypes.table.name"),
			accessor: "name",
			render: value => value || "-",
		},
		{
			header: t("lookupTypes.table.description"),
			accessor: "description",
			render: value => value || "-",
		},
	];

	const actions = [
		{
			label: t("common.edit"),
			onClick: handleEditType,
			variant: "secondary",
		},
		{
			label: t("common.delete"),
			onClick: handleDeleteClick,
			variant: "danger",
		},
	];

	return (
		<ErpPageTemplate title={t("lookupTypes.title")} showBackButton={false}>
			{/* Success/Error Messages */}
			{success && (
				<div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
					{success}
				</div>
			)}
			{error && (
				<div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">{error}</div>
			)}

			{/* Filters Section */}
			<div className="mb-6 bg-white rounded-lg shadow p-4">
				<div className="flex items-end gap-4">
					<div className="flex-1">
						<FloatingLabelInput
							label={t("lookupTypes.filters.search")}
							name="search"
							value={filters.search}
							onChange={handleFilterChange}
							placeholder={t("lookupTypes.filters.searchPlaceholder")}
						/>
					</div>
					<Button onClick={handleSearch} variant="primary" className="h-[42px]">
						<Search size={18} className="mr-2" />
						{t("common.search")}
					</Button>
					{filters.search && (
						<Button onClick={handleClearSearch} variant="secondary" className="h-[42px]">
							<X size={18} className="mr-2" />
							{t("common.clear")}
						</Button>
					)}
					<Button onClick={handleCreateType} variant="primary" className="h-[42px]">
						<Plus size={18} className="mr-2" />
						{t("lookupTypes.actions.create")}
					</Button>
				</div>
			</div>

			{/* Table Section */}
			<div className="bg-white rounded-lg shadow">
				<CustomTable
					columns={columns}
					data={lookupTypes}
					actions={actions}
					loading={typesLoading}
					emptyMessage={t("lookupTypes.table.empty")}
				/>

				{/* Pagination */}
				{typesCount > 0 && (
					<div className="p-4 border-t">
						<Pagination
							currentPage={typesPage}
							totalItems={typesCount}
							pageSize={localPageSize}
							onPageChange={handlePageChange}
							onPageSizeChange={handlePageSizeChange}
							hasNext={typesHasNext}
							hasPrevious={typesHasPrevious}
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
								{editingType ? t("lookupTypes.modal.editTitle") : t("lookupTypes.modal.createTitle")}
							</h2>

							<form onSubmit={handleSubmit} className="space-y-4">
								<FloatingLabelInput
									label={t("lookupTypes.form.name")}
									name="name"
									value={formData.name}
									onChange={handleInputChange}
									error={formErrors.name}
									required
								/>

								<FloatingLabelTextarea
									label={t("lookupTypes.form.description")}
									name="description"
									value={formData.description}
									onChange={handleInputChange}
									rows={3}
								/>

								<div className="flex justify-end gap-3 pt-4">
									<Button type="button" onClick={handleCloseModal} variant="secondary" disabled={creating || updating}>
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
				title={t("lookupTypes.deleteModal.title")}
				message={t("lookupTypes.deleteModal.message", { name: typeToDelete?.name })}
				confirmText={t("common.delete")}
				cancelText={t("common.cancel")}
				variant="danger"
				loading={deleting}
			/>
		</ErpPageTemplate>
	);
};

export default LookupTypesPage;
