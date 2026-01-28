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
import { fetchBusinessGroupsFromOrganizations } from "../store/organizationsSlice";
import CustomInput from "../components/shared/CustomInput";
import CustomDropdown from "../components/shared/CustomDropdown";

const FORM_INITIAL_STATE = {
	location_name: "",
	description: "",
	business_group_id: "",
	country_id: "",
	city_id: "",
	effective_from: "",
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
	const { businessGroups } = useSelector(state => state.organizations);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);
	const [formData, setFormData] = useState(FORM_INITIAL_STATE);
	const [formErrors, setFormErrors] = useState({});
	const [localPageSize, setLocalPageSize] = useState(25);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterOrganization, setFilterOrganization] = useState("");

	// Fetch business groups and countries on mount
	useEffect(() => {
		dispatch(fetchBusinessGroupsFromOrganizations({ page_size: 100, status: "active" }));
		dispatch(fetchCountriesLookup());
	}, [dispatch]);

	// Fetch locations with filters
	useEffect(() => {
		const params = {
			page,
			page_size: localPageSize,
			...(searchTerm && { search: searchTerm }),
			...(filterOrganization && { business_group: filterOrganization }),
		};
		dispatch(fetchLocations(params));
	}, [dispatch, page, localPageSize, searchTerm, filterOrganization]);

	// Fetch cities when country changes in form
	useEffect(() => {
		if (formData.country_id) {
			dispatch(fetchCitiesLookup(countries.find(c => c.id === formData.country_id)?.name));
		} else {
			dispatch(clearCities());
		}
	}, [formData.country_id, dispatch, countries]);

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
			accessor: "location_name",
			render: value => value || "-",
		},
		{
			header: t("locations.table.businessGroup"),
			accessor: "business_group_name",
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

	const businessGroupOptions = [
		{ value: "", label: t("locations.form.selectBusinessGroup") },
		...businessGroups.map(bg => ({
			value: bg.id,
			label: bg.organization_name,
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

			// Find business_group_id from business_group_name
			let businessGroupId = "";
			if (locationData.business_group_name) {
				const bg = businessGroups.find(group => group.organization_name === locationData.business_group_name);
				console.log(bg)
				businessGroupId = bg ? bg.id : "";
			}

			setFormData({
				location_name: locationData.location_name || "",
				description: locationData.description || "",
				business_group_id: businessGroupId,
				country_id: locationData.country ? locationData.country : "",
				city_id: locationData.city ? locationData.city : "",
				effective_from: locationData.effective_from,
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
				dispatch(fetchCitiesLookup(countries.find(c => c.id === locationData.country)?.name));
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
		if (!formData.location_name.trim()) {
			errors.location_name = t("common.required");
		}
		if (!formData.country_id) {
			errors.country_id = t("common.required");
		}
		if (!formData.city_id) {
			errors.city_id = t("common.required");
		}
		if (!editingItem && !formData.effective_from) {
			errors.effective_from = t("common.required");
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			if (editingItem) {
				// For update, send editable fields (business_group_id cannot be changed)
				const payload = {
					location_name: formData.location_name,
					country_id: parseInt(formData.country_id),
					city_id: parseInt(formData.city_id),
				};

				// Add optional fields
				if (formData.description) payload.description = formData.description;
				if (formData.zone) payload.zone = formData.zone;
				if (formData.street) payload.street = formData.street;
				if (formData.building) payload.building = formData.building;
				if (formData.floor) payload.floor = formData.floor;
				if (formData.office) payload.office = formData.office;
				if (formData.po_box) payload.po_box = formData.po_box;
				await dispatch(updateLocation({ id: editingItem.id, data: payload })).unwrap();
				toast.success(t("locations.messages.updateSuccess"));
			} else {
				// For create, include all required fields
				const payload = {
					location_name: formData.location_name,
					country_id: parseInt(formData.country_id),
					city_id: parseInt(formData.city_id),
					effective_from: formData.effective_from,
				};

				// Add optional business_group_id
				if (formData.business_group_id) {
					payload.business_group_id = parseInt(formData.business_group_id);
				}

				// Add other optional fields
				if (formData.description) payload.description = formData.description;
				if (formData.zone) payload.zone = formData.zone;
				if (formData.street) payload.street = formData.street;
				if (formData.building) payload.building = formData.building;
				if (formData.floor) payload.floor = formData.floor;
				if (formData.office) payload.office = formData.office;
				if (formData.po_box) payload.po_box = formData.po_box;
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
								label={t("locations.form.filterByBusinessGroup")}
								name="filterOrganization"
								value={filterOrganization}
								onChange={e => setFilterOrganization(e.target.value)}
								options={businessGroupOptions}
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
						<div className="grid grid-cols-1 gap-4">
							<CustomInput
								label={t("locations.form.locationName")}
								name="location_name"
								value={formData.location_name}
								onChange={handleInputChange}
								error={formErrors.location_name}
								required
								bgColor="bg-white"
							/>
						</div>
						<div className="grid grid-cols-1 gap-4 mt-4">
							<CustomInput
								label={t("locations.form.description")}
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								bgColor="bg-white"
							/>
						</div>

						<>
							<div className="grid grid-cols-1 gap-4 mt-4">
								<CustomDropdown
									label={t("locations.form.businessGroup")}
									name="business_group_id"
									value={formData.business_group_id}
									onChange={handleInputChange}
									options={businessGroupOptions}
									error={formErrors.business_group_id}
									disabled={!!editingItem}
									bgColor="bg-white"
								/>
							</div>
							<div className="grid grid-cols-1 gap-4 mt-4">
								<CustomInput
									label={t("locations.form.effectiveFrom")}
									name="effective_from"
									type="date"
									value={formData.effective_from}
									onChange={handleInputChange}
									error={formErrors.effective_from}
									required
									disabled={!!editingItem}
									bgColor="bg-white"
								/>
							</div>
						</>
					</div>

					{/* Location Details */}
					<div className="mb-6">
						<h3 className="text-lg font-semibold text-gray-700 mb-4">
							{t("locations.form.locationDetails")}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<CustomDropdown
								label={t("locations.form.country")}
								name="country_id"
								value={formData.country_id}
								onChange={handleInputChange}
								options={countryOptions}
								error={formErrors.country_id}
								required
								bgColor="bg-white"
							/>
							<CustomDropdown
								label={t("locations.form.city")}
								name="city_id"
								value={formData.city_id}
								onChange={handleInputChange}
								options={cityOptions}
								disabled={!formData.country_id || citiesLoading}
								error={formErrors.city_id}
								required
								bgColor="bg-white"
							/>
						</div>
					</div>

					{/* Address Details */}
					<div className="mb-6">
						<h3 className="text-lg font-semibold text-gray-700 mb-4">
							{t("locations.form.addressSection")}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<CustomInput
								label={t("locations.form.zone")}
								name="zone"
								value={formData.zone}
								onChange={handleInputChange}
								bgColor="bg-white"
							/>
							<CustomInput
								label={t("locations.form.street")}
								name="street"
								value={formData.street}
								onChange={handleInputChange}
								bgColor="bg-white"
							/>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
							<CustomInput
								label={t("locations.form.building")}
								name="building"
								value={formData.building}
								onChange={handleInputChange}
								bgColor="bg-white"
							/>
							<CustomInput
								label={t("locations.form.floor")}
								name="floor"
								value={formData.floor}
								onChange={handleInputChange}
								bgColor="bg-white"
							/>
							<CustomInput
								label={t("locations.form.office")}
								name="office"
								value={formData.office}
								onChange={handleInputChange}
								bgColor="bg-white"
							/>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
							<CustomInput
								label={t("locations.form.poBox")}
								name="po_box"
								value={formData.po_box}
								onChange={handleInputChange}
								bgColor="bg-white"
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
