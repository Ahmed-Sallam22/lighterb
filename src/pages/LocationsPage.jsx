import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";
import Location from "../assets/location.svg?react";

import { parseApiError } from "../utils/errorHandler";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import ConfirmModal from "../components/shared/ConfirmModal";
import SlideUpModal from "../components/shared/SlideUpModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import Button from "../components/shared/Button";
import SearchInput from "../components/shared/SearchInput";

import {
	fetchLocations,
	fetchLocation,
	createLocation,
	updateLocation,
	deleteLocation,
	setPage,
	fetchCountriesLookup,
	fetchCitiesLookup,
	clearCities,
} from "../store/locationsSlice";
import { fetchOrganizations } from "../store/organizationsSlice";

const FORM_INITIAL_STATE = {
	name: "",
	code: "",
	description: "",
	organization_id: "",
	country_id: "",
	city_id: "",
	zone: "",
	street: "",
	building: "",
	floor: "",
	office: "",
	po_box: "",
};

const LocationsPage = () => {
	const { t, i18n } = useTranslation();
	usePageTitle(t("locations.title"));
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	const {
		locations,
		loading,
		count,
		page,
		hasNext,
		hasPrevious,
		creating,
		updating,
		countries,
		cities,
		citiesLoading,
	} = useSelector(state => state.locations);
	const { organizations } = useSelector(state => state.organizations);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);
	const [formData, setFormData] = useState(FORM_INITIAL_STATE);
	const [formErrors, setFormErrors] = useState({});
	const [localPageSize, setLocalPageSize] = useState(25);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterOrganization, setFilterOrganization] = useState("");

	// Fetch organizations and countries on mount
	useEffect(() => {
		dispatch(fetchOrganizations({ page_size: 100 }));
		dispatch(fetchCountriesLookup());
	}, [dispatch]);

	// Fetch locations with filters
	useEffect(() => {
		const params = {
			page,
			page_size: localPageSize,
			...(searchTerm && { search: searchTerm }),
			...(filterOrganization && { organization: filterOrganization }),
		};
		dispatch(fetchLocations(params));
	}, [dispatch, page, localPageSize, searchTerm, filterOrganization]);

	// Fetch cities when country changes in form
	useEffect(() => {
		if (formData.country_id) {
			dispatch(fetchCitiesLookup(formData.country_id));
		} else {
			dispatch(clearCities());
		}
	}, [formData.country_id, dispatch]);

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
			header: t("locations.table.organization"),
			accessor: "organization_name",
			render: value => value || "-",
		},
		{
			header: t("locations.table.country"),
			accessor: "country_name",
			render: value => value || "-",
		},
		{
			header: t("locations.table.city"),
			accessor: "city_name",
			render: value => value || "-",
		},
		{
			header: t("locations.table.status"),
			accessor: "status",
			render: renderStatus,
		},
	];

	const organizationOptions = [
		{ value: "", label: t("locations.form.selectOrganization") },
		...organizations.map(org => ({
			value: org.id,
			label: org.name_display || org.name,
		})),
	];

	const countryOptions = [
		{ value: "", label: t("locations.form.selectCountry") },
		...countries.map(country => ({
			value: country.id,
			label: country.name,
		})),
	];

	const cityOptions = [
		{ value: "", label: citiesLoading ? t("common.loading") : t("locations.form.selectCity") },
		...cities.map(city => ({
			value: city.id,
			label: city.name,
		})),
	];

	const handleCreate = () => {
		setEditingItem(null);
		setFormData(FORM_INITIAL_STATE);
		setFormErrors({});
		setIsModalOpen(true);
	};

	const handleEdit = async item => {
		try {
			setEditingItem(item);
			// Fetch the full location data from API
			const locationData = await dispatch(fetchLocation(item.id)).unwrap();
			
			setFormData({
				name: locationData.name || "",
				code: locationData.code || "",
				description: locationData.description || "",
				organization_id: locationData.organization || "",
				country_id: locationData.country || "",
				city_id: locationData.city || "",
				zone: locationData.zone || "",
				street: locationData.street || "",
				building: locationData.building || "",
				floor: locationData.floor || "",
				office: locationData.office || "",
				po_box: locationData.po_box || "",
			});
			setFormErrors({});
			// Fetch cities for the country
			if (locationData.country) {
				dispatch(fetchCitiesLookup(locationData.country));
			}
			setIsModalOpen(true);
		} catch (error) {
			toast.error(parseApiError(error, t, "errors.generic"));
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingItem(null);
		setFormData(FORM_INITIAL_STATE);
		setFormErrors({});
	};

	const handleInputChange = e => {
		const { name, value } = e.target;
		setFormData(prev => {
			const newData = { ...prev, [name]: value };
			// Reset city when country changes
			if (name === "country_id") {
				newData.city_id = "";
			}
			return newData;
		});
		if (formErrors[name]) {
			setFormErrors(prev => ({ ...prev, [name]: "" }));
		}
	};

	const validateForm = () => {
		const errors = {};
		if (!formData.name.trim()) {
			errors.name = t("common.required");
		}
		if (!editingItem && !formData.organization_id) {
			errors.organization_id = t("common.required");
		}
		if (!editingItem && !formData.code.trim()) {
			errors.code = t("common.required");
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			if (editingItem) {
				// For update, send editable fields (organization_id and code cannot be changed)
				const payload = {
					name: formData.name,
					...(formData.description && { description: formData.description }),
					...(formData.country_id && { country_id: parseInt(formData.country_id) }),
					...(formData.city_id && { city_id: parseInt(formData.city_id) }),
					zone: formData.zone || "",
					street: formData.street || "",
					building: formData.building || "",
					floor: formData.floor || "",
					office: formData.office || "",
					po_box: formData.po_box || "",
				};
				await dispatch(updateLocation({ id: editingItem.id, data: payload })).unwrap();
				toast.success(t("locations.messages.updateSuccess"));
			} else {
				// For create, include all required fields
				const payload = {
					organization_id: parseInt(formData.organization_id),
					code: formData.code,
					name: formData.name,
					...(formData.description && { description: formData.description }),
					...(formData.country_id && { country_id: parseInt(formData.country_id) }),
					...(formData.city_id && { city_id: parseInt(formData.city_id) }),
					zone: formData.zone || "",
					street: formData.street || "",
					building: formData.building || "",
					floor: formData.floor || "",
					office: formData.office || "",
					po_box: formData.po_box || "",
				};
				await dispatch(createLocation(payload)).unwrap();
				toast.success(t("locations.messages.createSuccess"));
			}
			handleCloseModal();
			dispatch(
				fetchLocations({
					page,
					page_size: localPageSize,
					...(filterOrganization && { organization: filterOrganization }),
				})
			);
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
				icon={<Location className="w-8 h-8 text-white" />}
				title={t("locations.title")}
				subtitle={t("locations.subtitle")}
			/>

			<div className="p-6">
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
						<h2 className="text-2xl font-bold text-[#1D7A8C]">{t("locations.title")}</h2>
						<div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
							<SearchInput
								placeholder={t("locations.searchPlaceholder")}
								value={searchTerm}
								onChange={e => setSearchTerm(e.target.value)}
								className="w-full md:w-64"
							/>
							<FloatingLabelSelect
								label={t("locations.form.filterByOrganization")}
								name="filterOrganization"
								value={filterOrganization}
								onChange={e => setFilterOrganization(e.target.value)}
								options={organizationOptions}
								className="w-full md:w-48"
							/>
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
								className="bg-[#1D7A8C] hover:bg-[#156576] text-white whitespace-nowrap"
							/>
						</div>
					</div>

					<Table
						columns={columns}
						data={locations}
						onEdit={handleEdit}
						onDelete={handleDeleteClick}
						emptyMessage={t("locations.table.emptyMessage")}
						loading={loading}
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
				<form onSubmit={handleSubmit} className="p-4">
					{/* Basic Information */}
					<div className="mb-6">
						<h3 className="text-lg font-semibold text-gray-700 mb-4">{t("locations.form.basicInfo")}</h3>
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
								error={formErrors.code}
								disabled={!!editingItem}
								required={!editingItem}
							/>
						</div>
						<div className="grid grid-cols-1 gap-4 mt-4">
							<FloatingLabelInput
								label={t("locations.form.description")}
								name="description"
								value={formData.description}
								onChange={handleInputChange}
							/>
						</div>
						{!editingItem && (
							<div className="grid grid-cols-1 gap-4 mt-4">
								<FloatingLabelSelect
									label={t("locations.form.organization")}
									name="organization_id"
									value={formData.organization_id}
									onChange={handleInputChange}
									options={organizationOptions}
									error={formErrors.organization_id}
									required
								/>
							</div>
						)}
					</div>

					{/* Location Details */}
					<div className="mb-6">
						<h3 className="text-lg font-semibold text-gray-700 mb-4">
							{t("locations.form.locationDetails")}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("locations.form.country")}
								name="country_id"
								value={formData.country_id}
								onChange={handleInputChange}
								options={countryOptions}
							/>
							<FloatingLabelSelect
								label={t("locations.form.city")}
								name="city_id"
								value={formData.city_id}
								onChange={handleInputChange}
								options={cityOptions}
								disabled={!formData.country_id || citiesLoading}
							/>
						</div>
					</div>

					{/* Address Details */}
					<div className="mb-6">
						<h3 className="text-lg font-semibold text-gray-700 mb-4">
							{t("locations.form.addressSection")}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("locations.form.zone")}
								name="zone"
								value={formData.zone}
								onChange={handleInputChange}
							/>
							<FloatingLabelInput
								label={t("locations.form.street")}
								name="street"
								value={formData.street}
								onChange={handleInputChange}
							/>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
							<FloatingLabelInput
								label={t("locations.form.building")}
								name="building"
								value={formData.building}
								onChange={handleInputChange}
							/>
							<FloatingLabelInput
								label={t("locations.form.floor")}
								name="floor"
								value={formData.floor}
								onChange={handleInputChange}
							/>
							<FloatingLabelInput
								label={t("locations.form.office")}
								name="office"
								value={formData.office}
								onChange={handleInputChange}
							/>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
							<FloatingLabelInput
								label={t("locations.form.poBox")}
								name="po_box"
								value={formData.po_box}
								onChange={handleInputChange}
							/>
						</div>
					</div>

					<div className="flex justify-end gap-3 pt-4 border-t">
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
