import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PageHeader from "../components/shared/PageHeader";
import SlideUpModal from "../components/shared/SlideUpModal";
import Table from "../components/shared/Table";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelTextarea from "../components/shared/FloatingLabelTextarea";
import ConfirmModal from "../components/shared/ConfirmModal";
import Button from "../components/shared/Button";
import LoadingSpan from "../components/shared/LoadingSpan";

import {
	fetchCatalogItems,
	searchCatalogItems,
	createCatalogItem,
	updateCatalogItem,
	deleteCatalogItem,
	clearCatalogErrors,
} from "../store/catalogItemsSlice";

import { BiPlusCircle } from "react-icons/bi";
import { FiPackage } from "react-icons/fi";

const HeaderIcon = () => (
	<div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/30 flex items-center justify-center shadow-lg">
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M4 7L12 3L20 7V17L12 21L4 17V7Z" stroke="#D3D3D3" strokeWidth="1.5" strokeLinejoin="round" />
			<path
				d="M4 12L12 16L20 12"
				stroke="#48C1F0"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path d="M12 3V16" stroke="#48C1F0" strokeWidth="1.5" strokeLinecap="round" />
		</svg>
	</div>
);

const INITIAL_FORM_STATE = {
	code: "",
	name: "",
	description: "",
};

const ProcurementCatalog = () => {
	const { t, i18n } = useTranslation();
	usePageTitle(t("procurementCatalog.title"));
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	const {
		items = [],
		loading,
		error,
		creating,
		updating,
		deleting,
		actionError,
	} = useSelector(state => state.catalogItems || {});

	// Modal states
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState(null);

	// Form state
	const [formData, setFormData] = useState(INITIAL_FORM_STATE);
	const [formErrors, setFormErrors] = useState({});

	// Search state
	const [searchTerm, setSearchTerm] = useState("");
	const [searchTimeout, setSearchTimeout] = useState(null);

	// Fetch catalog items on mount
	useEffect(() => {
		dispatch(fetchCatalogItems());
	}, [dispatch]);

	// Handle search with debounce
	useEffect(() => {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		const timeout = setTimeout(() => {
			if (searchTerm.trim()) {
				dispatch(searchCatalogItems(searchTerm.trim()));
			} else {
				dispatch(fetchCatalogItems());
			}
		}, 300);

		setSearchTimeout(timeout);

		return () => {
			if (timeout) clearTimeout(timeout);
		};
	}, [searchTerm, dispatch]);

	// Show error toast
	useEffect(() => {
		if (error || actionError) {
			const errorMsg =
				typeof actionError === "object" ? Object.values(actionError).flat().join(", ") : error || actionError;
			toast.error(errorMsg, { autoClose: 5000 });
			dispatch(clearCatalogErrors());
		}
	}, [error, actionError, dispatch]);


	// Calculate statistics
	const stats = useMemo(() => {
		const total = items.length;
		return { total };
	}, [items]);

	// Table columns
	const columns = [
		{
			header: t("catalog.table.code"),
			accessor: "code",
			render: value => (
				<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#28819C]/10 text-[#28819C]">
					{value || "-"}
				</span>
			),
		},
		{
			header: t("catalog.table.name"),
			accessor: "name",
			render: value => <span className="font-medium text-gray-800">{value || "-"}</span>,
		},
		{
			header: t("catalog.table.description"),
			accessor: "description",
			render: value => <span className="text-gray-600 text-sm truncate max-w-xs block">{value || "-"}</span>,
		},
	];

	// Handlers
	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (formErrors[field]) {
			setFormErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = () => {
		const errors = {};

		if (!formData.code.trim()) {
			errors.code = t("catalog.validation.codeRequired");
		} else if (formData.code.length > 20) {
			errors.code = t("catalog.validation.codeMaxLength");
		}

		if (!formData.name.trim()) {
			errors.name = t("catalog.validation.nameRequired");
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
		setSelectedItem(row);
		setFormData({
			code: row.code || "",
			name: row.name || "",
			description: row.description || "",
		});
		setFormErrors({});
		setIsEditMode(true);
		setIsModalOpen(true);
	};

	const handleDelete = row => {
		setSelectedItem(row);
		setIsDeleteModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setIsEditMode(false);
		setSelectedItem(null);
		setFormData(INITIAL_FORM_STATE);
		setFormErrors({});
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		try {
			const itemData = {
				code: formData.code.toUpperCase().trim(),
				name: formData.name.trim(),
				description: formData.description.trim(),
			};

			if (isEditMode && selectedItem) {
				await dispatch(updateCatalogItem({ id: selectedItem.id, data: itemData })).unwrap();
				toast.success(t("catalog.messages.updateSuccess"));
			} else {
				await dispatch(createCatalogItem(itemData)).unwrap();
				toast.success(t("catalog.messages.createSuccess"));
			}

			handleCloseModal();
			// Refresh the list
			if (searchTerm.trim()) {
				dispatch(searchCatalogItems(searchTerm.trim()));
			} else {
				dispatch(fetchCatalogItems());
			}
		} catch {
			// Error handled by Redux
		}
	};

	const handleConfirmDelete = async () => {
		try {
			await dispatch(deleteCatalogItem(selectedItem.id)).unwrap();
			toast.success(t("catalog.messages.deleteSuccess"));
			setIsDeleteModalOpen(false);
			setSelectedItem(null);
		} catch {
			// Error handled by Redux
		}
	};

	const handleSearch = useCallback(e => {
		setSearchTerm(e.target.value);
	}, []);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<PageHeader title={t("catalog.title")} subtitle={t("catalog.subtitle")} icon={<HeaderIcon />} />

			<div className="mx-auto px-6 py-8">
				{/* Header with Title and Button */}
				<div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
					<h2 className="text-2xl font-bold text-gray-900">{t("catalog.title")}</h2>

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
								placeholder={t("catalog.searchPlaceholder")}
								value={searchTerm}
								onChange={handleSearch}
								className="w-64 pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#48C1F0]/40 transition-all"
							/>
						</div>

						{/* Add Button */}
						<Button
							onClick={handleOpenCreate}
							title={t("catalog.actions.add")}
							icon={<BiPlusCircle size={24} />}
						/>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-xl bg-[#28819C]/10 flex items-center justify-center">
								<FiPackage size={24} className="text-[#28819C]" />
							</div>
							<div>
								<p className="text-sm text-gray-500">{t("catalog.stats.total")}</p>
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
								<p className="text-sm text-gray-500">{t("catalog.stats.available")}</p>
								<p className="text-2xl font-bold text-green-600">{stats.total}</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-600">
									<path
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
							<div>
								<p className="text-sm text-gray-500">{t("catalog.stats.lastUpdated")}</p>
								<p className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
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
						data={items}
						onEdit={handleEdit}
						onDelete={handleDelete}
						editIcon="edit"
						emptyMessage={t("catalog.table.emptyMessage")}
					/>
				)}
			</div>

			{/* Add/Edit Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={isEditMode ? t("catalog.modals.editTitle") : t("catalog.modals.addTitle")}
				maxWidth="550px"
			>
				<div className="space-y-5 p-4">
					{/* Item Code */}
					<FloatingLabelInput
						label={t("catalog.form.code")}
						name="code"
						value={formData.code}
						onChange={e => handleInputChange("code", e.target.value.toUpperCase())}
						placeholder={t("catalog.form.codePlaceholder")}
						error={formErrors.code}
						maxLength={20}
					/>

					{/* Item Name */}
					<FloatingLabelInput
						label={t("catalog.form.name")}
						name="name"
						value={formData.name}
						onChange={e => handleInputChange("name", e.target.value)}
						placeholder={t("catalog.form.namePlaceholder")}
						error={formErrors.name}
					/>

					{/* Description */}
					<FloatingLabelTextarea
						label={t("catalog.form.description")}
						name="description"
						value={formData.description}
						onChange={e => handleInputChange("description", e.target.value)}
						placeholder={t("catalog.form.descriptionPlaceholder")}
						rows={4}
					/>

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4 justify-center">
						<Button
							onClick={handleCloseModal}
							title={t("catalog.actions.cancel")}
							className="bg-gray-100 text-gray-700 hover:bg-gray-200"
						/>

						<Button
							disabled={creating || updating}
							onClick={handleSubmit}
							title={
								creating || updating
									? t("catalog.actions.saving")
									: isEditMode
									? t("catalog.actions.update")
									: t("catalog.actions.create")
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
					setSelectedItem(null);
				}}
				onConfirm={handleConfirmDelete}
				title={t("catalog.modals.deleteTitle")}
				message={t("catalog.modals.deleteMessage", { name: selectedItem?.name, code: selectedItem?.code })}
				confirmText={deleting ? t("catalog.actions.deleting") : t("catalog.actions.delete")}
				cancelText={t("catalog.actions.cancel")}
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

export default ProcurementCatalog;
