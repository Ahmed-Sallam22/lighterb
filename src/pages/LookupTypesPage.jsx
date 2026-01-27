import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaSearch, FaTimes, FaList, FaEye } from "react-icons/fa";
import { HiViewList } from "react-icons/hi";

import PageHeader from "../components/shared/PageHeader";
import CustomTable from "../components/shared/CustomTable";
import Pagination from "../components/shared/Pagination";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelTextarea from "../components/shared/FloatingLabelTextarea";
import Button from "../components/shared/Button";
import ConfirmModal from "../components/shared/ConfirmModal";
import SlideUpModal from "../components/shared/SlideUpModal";
import { usePageTitle } from "../hooks/usePageTitle";
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
	const navigate = useNavigate();

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

	const handleViewValues = item => {
		// Navigate to lookup values page with the lookup type filter
		navigate(`/lookups/values/${encodeURIComponent(item.name)}`);
	};

	// Custom actions for the table
	const customActions = [
		{
			title: t("lookupTypes.actions.viewValues"),
			icon: <FaEye className="w-5 h-5 text-[#1D7A8C]" />,
			onClick: handleViewValues,
		},
	];

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

	// Show success/error toast
	useEffect(() => {
		if (success) {
			toast.success(success);
		}
	}, [success]);

	useEffect(() => {
		if (error) {
			toast.error(error);
		}
	}, [error]);

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer position="top-right" autoClose={3000} />
			<PageHeader icon={<HiViewList className="w-8 h-8 text-white mr-3" />} title={t("lookupTypes.title")} />

			<div className="p-6">
				{/* Filters Section */}
				<div className="mb-6 bg-white rounded-2xl shadow-lg p-6">
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
						<Button
							onClick={handleSearch}
							icon={<FaSearch className="w-5 h-5" />}
							title={t("common.search")}
							className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
						/>
						{filters.search && (
							<Button
								onClick={handleClearSearch}
								icon={<FaTimes className="w-5 h-5" />}
								title={t("common.clear")}
								className="bg-gray-200 hover:bg-gray-300 text-gray-800"
							/>
						)}
						<Button
							onClick={handleCreateType}
							icon={<FaPlus className="w-5 h-5" />}
							title={t("lookupTypes.actions.create")}
							className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
						/>
					</div>
				</div>

				{/* Table Section */}
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold text-[#1D7A8C]">{t("lookupTypes.title")}</h2>
					</div>

					<CustomTable
						columns={columns}
						data={lookupTypes}
						onEdit={handleEditType}
						onDelete={handleDeleteClick}
						customActions={customActions}
						loading={typesLoading}
						emptyMessage={t("lookupTypes.table.empty")}
					/>

					{/* Pagination */}
					{typesCount > 0 && (
						<div className="mt-6">
							<Pagination
								currentPage={typesPage}
								totalCount={typesCount}
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
				<SlideUpModal
					isOpen={isModalOpen}
					onClose={handleCloseModal}
					title={editingType ? t("lookupTypes.modal.editTitle") : t("lookupTypes.modal.createTitle")}
				>
					<form onSubmit={handleSubmit} className="space-y-4 p-4">
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
							<Button
								type="button"
								onClick={handleCloseModal}
								title={t("common.cancel")}
								className="bg-gray-200 hover:bg-gray-300 text-gray-800"
								disabled={creating || updating}
							/>
							<Button
								type="submit"
								title={creating || updating ? t("common.saving") : t("common.save")}
								className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
								disabled={creating || updating}
							/>
						</div>
					</form>
				</SlideUpModal>

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
			</div>
		</div>
	);
};

export default LookupTypesPage;
