import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { HiLocationMarker } from "react-icons/hi";

import { parseApiError } from "../utils/errorHandler";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import ConfirmModal from "../components/shared/ConfirmModal";
import SlideUpModal from "../components/shared/SlideUpModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import Button from "../components/shared/Button";

import { fetchLocations, createLocation, updateLocation, deleteLocation, setPage } from "../store/locationsSlice";
import { fetchBusinessGroups } from "../store/businessGroupsSlice";
import { fetchEnterprises } from "../store/enterprisesSlice";

const FORM_INITIAL_STATE = {
	name: "",
	code: "",
	address_details: "",
	country: "",
	enterprise: "",
	business_group: "",
};

const LocationsPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	const { locations, loading, count, page, hasNext, hasPrevious, creating, updating } = useSelector(
		state => state.locations
	);
	const { businessGroups } = useSelector(state => state.businessGroups);
	const { enterprises } = useSelector(state => state.enterprises);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);
	const [formData, setFormData] = useState(FORM_INITIAL_STATE);
	const [formErrors, setFormErrors] = useState({});
	const [localPageSize, setLocalPageSize] = useState(25);

	useEffect(() => {
		dispatch(fetchBusinessGroups({ page: 1, page_size: 100 }));
		dispatch(fetchEnterprises({ page: 1, page_size: 100 }));
	}, [dispatch]);

	useEffect(() => {
		dispatch(fetchLocations({ page, page_size: localPageSize }));
	}, [dispatch, page, localPageSize]);

	useEffect(() => {
		document.title = `${t("locations.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	const handlePageChange = useCallback(
		newPage => {
			dispatch(setPage(newPage));
		},
		[dispatch]
	);

	const handlePageSizeChange = useCallback(
		newPageSize => {
			setLocalPageSize(newPageSize);
			dispatch(setPage(1));
		},
		[dispatch]
	);

	const renderStatus = value => {
		const isActive = value === "active";
		return (
			<span
				className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
					isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
				}`}
			>
				<span
					className={`w-2 h-2 rounded-full ${isRtl ? "ml-1.5" : "mr-1.5"} ${
						isActive ? "bg-green-500" : "bg-gray-400"
					}`}
				></span>
				{isActive ? t("common.active") : t("common.inactive")}
			</span>
		);
	};

	const columns = [
		{
			header: t("locations.table.name"),
			accessor: "name",
			render: value => value || "-",
		},
		{
			header: t("locations.table.code"),
			accessor: "code",
			render: value => value || "-",
		},
		{
			header: t("locations.table.enterprise"),
			accessor: "enterprise_name",
			render: value => value || "-",
		},
		{
			header: t("locations.table.businessGroup"),
			accessor: "business_group_name",
			render: value => value || "-",
		},
		{
			header: t("locations.table.country"),
			accessor: "country",
			render: value => value || "-",
		},
		{
			header: t("locations.table.status"),
			accessor: "status",
			render: renderStatus,
		},
	];

	const enterpriseOptions = [
		{ value: "", label: t("locations.form.selectEnterprise") },
		...enterprises.map(ent => ({
			value: ent.id,
			label: ent.name,
		})),
	];

	const businessGroupOptions = [
		{ value: "", label: t("locations.form.selectBusinessGroup") },
		...businessGroups.map(bg => ({
			value: bg.id,
			label: bg.name,
		})),
	];

	const handleCreate = () => {
		setEditingItem(null);
		setFormData(FORM_INITIAL_STATE);
		setFormErrors({});
		setIsModalOpen(true);
	};

	const handleEdit = item => {
		setEditingItem(item);
		setFormData({
			name: item.name || "",
			code: item.code || "",
			address_details: item.address_details || "",
			country: item.country || "",
			enterprise: item.enterprise || "",
			business_group: item.business_group || "",
		});
		setFormErrors({});
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingItem(null);
		setFormData(FORM_INITIAL_STATE);
		setFormErrors({});
	};

	const handleInputChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		if (formErrors[name]) {
			setFormErrors(prev => ({ ...prev, [name]: "" }));
		}
	};

	const validateForm = () => {
		const errors = {};
		if (!formData.name.trim()) {
			errors.name = t("common.required");
		}
		if (!formData.country.trim()) {
			errors.country = t("common.required");
		}
		if (!editingItem && !formData.enterprise && !formData.business_group) {
			errors.enterprise = t("locations.form.enterpriseOrBgRequired");
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			if (editingItem) {
				// For update, only send editable fields
				const payload = {
					name: formData.name,
					...(formData.address_details && { address_details: formData.address_details }),
					country: formData.country,
				};
				await dispatch(updateLocation({ id: editingItem.id, data: payload })).unwrap();
				toast.success(t("locations.messages.updateSuccess"));
			} else {
				// For create, include all required fields
				const payload = {
					name: formData.name,
					country: formData.country,
					...(formData.code && { code: formData.code }),
					...(formData.address_details && { address_details: formData.address_details }),
					...(formData.enterprise && { enterprise: formData.enterprise }),
					...(formData.business_group && { business_group: formData.business_group }),
				};
				await dispatch(createLocation(payload)).unwrap();
				toast.success(t("locations.messages.createSuccess"));
			}
			handleCloseModal();
			dispatch(fetchLocations({ page, page_size: localPageSize }));
		} catch (error) {
			toast.error(parseApiError(error, t, "locations.messages.saveError"));
		}
	};

	const handleDeleteClick = item => {
		setItemToDelete(item);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!itemToDelete) return;
		try {
			await dispatch(deleteLocation(itemToDelete.id)).unwrap();
			toast.success(t("locations.messages.deleted"));
			setIsDeleteModalOpen(false);
			setItemToDelete(null);
		} catch (error) {
			toast.error(parseApiError(error, t, "locations.messages.deleteError"));
		}
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
		setItemToDelete(null);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer position="top-right" autoClose={3000} />

			<PageHeader
				icon={<HiLocationMarker className="w-8 h-8 text-white mr-3" />}
				title={t("locations.title")}
				subtitle={t("locations.subtitle")}
			/>

			<div className="p-6">
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold text-[#1D7A8C]">{t("locations.title")}</h2>
						<Button
							onClick={handleCreate}
							icon={
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4v16m8-8H4"
									/>
								</svg>
							}
							title={t("locations.createLocation")}
							className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
						/>
					</div>

					<Table
						columns={columns}
						data={locations}
						onEdit={handleEdit}
						onDelete={handleDeleteClick}
						emptyMessage={t("locations.table.emptyMessage")}
					/>

					<div className="mt-6">
						<Pagination
							currentPage={page}
							totalCount={count}
							pageSize={localPageSize}
							onPageChange={handlePageChange}
							onPageSizeChange={handlePageSizeChange}
							hasNext={hasNext}
							hasPrevious={hasPrevious}
						/>
					</div>
				</div>
			</div>

			{/* Create/Edit Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={editingItem ? t("locations.modal.editTitle") : t("locations.modal.createTitle")}
			>
				<form onSubmit={handleSubmit} className="space-y-4 p-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("locations.form.name")}
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							error={formErrors.name}
							required
						/>
						<FloatingLabelInput
							label={t("locations.form.code")}
							name="code"
							value={formData.code}
							onChange={handleInputChange}
							disabled={!!editingItem}
						/>
					</div>

					{!editingItem && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("locations.form.enterprise")}
								name="enterprise"
								value={formData.enterprise}
								onChange={handleInputChange}
								options={enterpriseOptions}
								error={formErrors.enterprise}
							/>
							<FloatingLabelSelect
								label={t("locations.form.businessGroup")}
								name="business_group"
								value={formData.business_group}
								onChange={handleInputChange}
								options={businessGroupOptions}
							/>
						</div>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("locations.form.country")}
							name="country"
							value={formData.country}
							onChange={handleInputChange}
							error={formErrors.country}
							required
						/>
						<FloatingLabelInput
							label={t("locations.form.addressDetails")}
							name="address_details"
							value={formData.address_details}
							onChange={handleInputChange}
						/>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							onClick={handleCloseModal}
							title={t("common.cancel")}
							className="bg-gray-200 hover:bg-gray-300 text-gray-800"
						/>
						<Button
							type="submit"
							disabled={creating || updating}
							title={
								creating || updating
									? t("common.saving")
									: editingItem
									? t("common.update")
									: t("common.create")
							}
							className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
						/>
					</div>
				</form>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title={t("locations.deleteModal.title")}
				message={t("locations.deleteModal.message")}
				confirmText={t("common.delete")}
				cancelText={t("common.cancel")}
				variant="danger"
			/>
		</div>
	);
};

export default LocationsPage;
