// src/pages/Customers.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

import PageHeader from "../components/shared/PageHeader";
import Toolbar from "../components/shared/Toolbar";
import Table from "../components/shared/Table";
import Button from "../components/shared/Button";
import SlideUpModal from "../components/shared/SlideUpModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import Toggle from "../components/shared/Toggle";
import ConfirmModal from "../components/shared/ConfirmModal";

import {
	fetchCustomers,
	fetchCustomerById,
	createCustomer,
	updateCustomer,
	deleteCustomer,
} from "../store/customersSlice";
import { MdPerson } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
const FROM_INITIAL_STATE = {
	name: "",
	email: "",
	phone: "",
	country: "",
	address: "",
	notes: "",
	is_active: true,
	address_in_details: "",
};

const INITIAL_FILTERS_STATE = {
	is_active: "",
	country: "",
	country_code: "",
	name: "",
	email: "",
	phone: "",
};

const CustomersPage = () => {
	const { t } = useTranslation();
	const dispatch = useDispatch();

	const { customers = [], loading, error } = useSelector(state => state.customers || {});

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCustomer, setEditingCustomer] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [customerToDelete, setCustomerToDelete] = useState(null);

	const [formData, setFormData] = useState(FROM_INITIAL_STATE);
	const [filters, setFilters] = useState(INITIAL_FILTERS_STATE);

	const [searchTerm, setSearchTerm] = useState("");

	const title = t("customers.title");
	const subtitle = t("customers.subtitle");

	// use countires from backend
	const countryOptions = useMemo(() => {
		const countries = [
			{ id: 1, code: "AE", name: "United Arab Emirates" },
			{ id: 2, code: "EG", name: "Egypt" },
			{ id: 3, code: "IN", name: "India" },
			{ id: 4, code: "SA", name: "Saudi Arabia" },
			{ id: 5, code: "US", name: "United States" },
		];
		return [
			{ value: "", label: t("customers.form.selectCountry") || "Select Country" },
			...countries.map(country => ({
				value: country.id.toString(),
				label: `${country.name} (${country.code})`,
			})),
		];
	}, [t]);

	const statusOptions = useMemo(
		() => [
			{ value: "", label: t("customers.filters.all") || "All" },
			{ value: "true", label: t("customers.table.active") || "Active" },
			{ value: "false", label: t("customers.table.inactive") || "Inactive" },
		],
		[t]
	);

	const countryCodeOptions = useMemo(() => {
		const countries = [
			{ id: 1, code: "AE", name: "United Arab Emirates" },
			{ id: 2, code: "EG", name: "Egypt" },
			{ id: 3, code: "IN", name: "India" },
			{ id: 4, code: "SA", name: "Saudi Arabia" },
			{ id: 5, code: "US", name: "United States" },
		];
		return [
			{ value: "", label: t("customers.filters.all") || "All" },
			...countries.map(country => ({
				value: country.code,
				label: `${country.name} (${country.code})`,
			})),
		];
	}, [t]);

	// const currencyOptions = [
	// 	{ value: "", label: t("customers.form.selectCurrency") || "Select Currency" },
	// 	...currencies.map(currency => ({
	// 		value: currency.id?.toString() ?? currency.code ?? "",
	// 		label: `${currency.code} - ${currency.name}`,
	// 	})),
	// ];
	// const currencyOptions = useMemo(() => {
	// 	return [
	// 		{ value: "", label: t("customers.form.selectCurrency") || "Select Currency" },
	// 		...currencies.map(currency => ({
	// 			value: currency.id?.toString() ?? currency.code ?? "",
	// 			label: `${currency.code} - ${currency.name}`,
	// 		})),
	// 	];
	// }, [currencies, t]);

	// Fetch customers on mount
	useEffect(() => {
		dispatch(fetchCustomers());
	}, [dispatch]);

	// Show error toast if any
	useEffect(() => {
		if (error) {
			toast.error(error, { autoClose: 5000 });
		}
	}, [error]);

	// Update browser title when translations load/ change
	useEffect(() => {
		document.title = `${title} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [title]);

	// Transform API data for table display
	const tableData = (customers || [])
		.filter(customer => {
			if (!searchTerm) return true;
			const search = searchTerm.toLowerCase();
			return (
				customer.name?.toLowerCase().includes(search) ||
				customer.email?.toLowerCase().includes(search) ||
				customer.phone?.toLowerCase().includes(search) ||
				(customer.country_name?.toLowerCase && customer.country_name?.toLowerCase().includes(search)) ||
				(customer.country_code?.toLowerCase && customer.country_code?.toLowerCase().includes(search))
			);
		})
		.map(customer => ({
			id: customer.id,
			name: customer.name || "-",
			email: customer.email || "-",
			phone: customer.phone || "-",
			country: customer.country_name || customer.country_code || "-",
			isActive: customer.is_active,
			rawData: customer,
		}));

	// Table columns (localized headers & status)
	const columns = [
		{
			header: t("customers.table.id"),
			accessor: "id",
			render: value => <span className="text-gray-500 font-medium">#{value}</span>,
		},
		{
			header: t("customers.table.name"),
			accessor: "name",
			render: value => <span className="font-semibold text-[#0d5f7a]">{value}</span>,
		},
		{
			header: t("customers.table.email"),
			accessor: "email",
		},
		{
			header: t("customers.table.phone"),
			accessor: "phone",
		},
		{
			header: t("customers.table.country"),
			accessor: "country",
			render: value => value || "-",
		},
		{
			header: t("customers.table.status"),
			accessor: "isActive",
			render: value => (
				<span
					className={`px-3 py-1 rounded-full text-xs font-semibold ${
						value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
					}`}
				>
					{value ? t("customers.table.active") : t("customers.table.inactive")}
				</span>
			),
		},
	];

	// Handlers
	const handleFilterChange = (field, value) => {
		setFilters(prev => ({ ...prev, [field]: value }));
	};

	const handleApplyFilters = () => {
		const filterParams = {
			is_active: filters.is_active,
			country: filters.country,
			country_code: filters.country_code,
			name: filters.name,
			email: filters.email,
			phone: filters.phone,
		};
		dispatch(fetchCustomers(filterParams));
		toast.info(t("customers.messages.filtersApplied"));
	};

	const handleClearFilters = () => {
		setFilters(INITIAL_FILTERS_STATE);
		dispatch(fetchCustomers());
		toast.info(t("customers.messages.filtersCleared"));
	};

	const handleCreate = () => {
		setEditingCustomer(null);
		setFormData(FROM_INITIAL_STATE);
		setIsModalOpen(true);
	};

	const handleEdit = async row => {
		try {
			const customerDetails = await dispatch(fetchCustomerById(row.rawData.id)).unwrap();
			setEditingCustomer(customerDetails);
			setFormData({
				name: customerDetails.name || "",
				email: customerDetails.email || "",
				phone: customerDetails.phone || "",
				country: customerDetails.country?.toString() || "",
				address: customerDetails.address || "",
				notes: customerDetails.notes || "",
				is_active: customerDetails.is_active !== undefined ? customerDetails.is_active : true,
				address_in_details: customerDetails.address_in_details || "",
			});
			setIsModalOpen(true);
		} catch (err) {
			toast.error(err?.message || t("customers.messages.fetchError"));
		}
	};

	const handleDelete = row => {
		setCustomerToDelete(row.rawData);
		setIsDeleteModalOpen(true);
	};

	const confirmDelete = async () => {
		if (!customerToDelete) return;

		try {
			await dispatch(deleteCustomer(customerToDelete.id)).unwrap();
			toast.success(t("customers.messages.deleted"));
			setIsDeleteModalOpen(false);
			setCustomerToDelete(null);
		} catch (err) {
			toast.error(err?.message || t("customers.messages.deleteError"));
		} finally {
			setIsDeleteModalOpen(false);
			setCustomerToDelete(null);
		}
	};

	const handleSubmit = async () => {
		// Validation
		if (!formData.name || !formData.email || !formData.country) {
			toast.error(t("customers.messages.required"));
			return;
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			toast.error(t("customers.messages.invalidEmail"));
			return;
		}

		// Prepare data for API
		const customerData = {
			name: formData.name,
			email: formData.email,
			phone: formData.phone || "",
			country: parseInt(formData.country),
			address: formData.address || "",
			notes: formData.notes || "",
			is_active: formData.is_active,
			address_in_details: formData.address_in_details || "",
		};

		try {
			if (editingCustomer) {
				await dispatch(updateCustomer({ id: editingCustomer.id, data: customerData })).unwrap();
				toast.success(t("customers.messages.updated"));
			} else {
				await dispatch(createCustomer(customerData)).unwrap();
				toast.success(t("customers.messages.created"));
			}
			setIsModalOpen(false);
			setFormData(FROM_INITIAL_STATE);
			setEditingCustomer(null);
		} catch (err) {
			toast.error(err?.message || t("customers.messages.saveError"));
		}
	};

	const handleInputChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSearch = value => {
		setSearchTerm(value);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer position="top-right" />

			{/* Page Header */}
			<PageHeader icon={<MdPerson size={30} color="#D3D3D3" />} title={title} subtitle={subtitle} />

			{/* Toolbar */}
			<div className="px-6 mt-6">
				<Toolbar
					searchPlaceholder={t("customers.searchPlaceholder")}
					onSearchChange={handleSearch}
					createButtonText={t("customers.addCustomer")}
					onCreateClick={handleCreate}
				/>
			</div>

			{/* Filter Section */}
			<div className="px-6 mt-6">
				<div className="rounded-lg pt-3 pb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
						{/* Status Filter */}
						<FloatingLabelSelect
							label={t("customers.filters.status")}
							name="filterIsActive"
							value={filters.is_active}
							onChange={e => handleFilterChange("is_active", e.target.value)}
							options={statusOptions}
						/>

						{/* Country ID Filter */}
						<FloatingLabelSelect
							label={t("customers.filters.country")}
							name="filterCountry"
							value={filters.country}
							onChange={e => handleFilterChange("country", e.target.value)}
							options={[
								{ value: "", label: t("customers.filters.all") },
								...countryOptions.slice(1).map(opt => ({ value: opt.value, label: opt.label })),
							]}
						/>

						{/* Country Code Filter */}
						<FloatingLabelSelect
							label={t("customers.filters.countryCode")}
							name="filterCountryCode"
							value={filters.country_code}
							onChange={e => handleFilterChange("country_code", e.target.value)}
							options={countryCodeOptions}
						/>

						{/* Name Filter */}
						<FloatingLabelInput
							label={t("customers.filters.name")}
							name="filterName"
							type="text"
							value={filters.name}
							onChange={e => handleFilterChange("name", e.target.value)}
							placeholder={t("customers.filters.namePlaceholder")}
						/>

						{/* Email Filter */}
						<FloatingLabelInput
							label={t("customers.filters.email")}
							name="filterEmail"
							type="email"
							value={filters.email}
							onChange={e => handleFilterChange("email", e.target.value)}
							placeholder={t("customers.filters.emailPlaceholder")}
						/>

						{/* Phone Filter */}
						<FloatingLabelInput
							label={t("customers.filters.phone")}
							name="filterPhone"
							type="tel"
							value={filters.phone}
							onChange={e => handleFilterChange("phone", e.target.value)}
							placeholder={t("customers.filters.phonePlaceholder")}
						/>
					</div>

					{/* Filter Buttons */}
					<div className="flex justify-end gap-4">
						<Button
							onClick={handleClearFilters}
							title={t("customers.actions.clearAll")}
							className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
						/>
						<Button onClick={handleApplyFilters} title={t("customers.actions.applyFilters")} />
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="px-6 mt-6 pb-6">
				<Table
					columns={columns}
					data={tableData}
					onEdit={handleEdit}
					onDelete={handleDelete}
					emptyMessage={t("customers.table.empty")}
					loading={loading}
				/>
			</div>

			{/* Create/Edit Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setEditingCustomer(null);
					setFormData(FROM_INITIAL_STATE);
				}}
				title={editingCustomer ? t("customers.modal.titleEdit") : t("customers.modal.titleAdd")}
				maxWidth="1000px"
			>
				<div className="space-y-6">
					{/* Customer Name */}
					<FloatingLabelInput
						label={t("customers.form.name")}
						name="name"
						type="text"
						value={formData.name}
						onChange={handleInputChange}
						required
						placeholder={t("customers.form.namePlaceholder")}
					/>

					{/* Email */}
					<FloatingLabelInput
						label={t("customers.form.email")}
						name="email"
						type="email"
						value={formData.email}
						onChange={handleInputChange}
						required
						placeholder="customer@example.com"
					/>

					{/* Phone */}
					<FloatingLabelInput
						label={t("customers.form.phone")}
						name="phone"
						type="tel"
						value={formData.phone}
						onChange={handleInputChange}
						placeholder="+1-555-1234"
					/>

					{/* Country */}
					<FloatingLabelSelect
						label={t("customers.form.country")}
						name="country"
						value={formData.country}
						onChange={handleInputChange}
						options={countryOptions}
						required
					/>

					{/* Address */}
					<FloatingLabelInput
						label={t("customers.form.address")}
						name="address"
						type="text"
						value={formData.address}
						onChange={handleInputChange}
						placeholder="123 Main Street, New York, NY 10001"
					/>

					{/* Address Details */}
					<FloatingLabelInput
						label={t("customers.form.addressDetails")}
						name="address_in_details"
						type="text"
						value={formData.address_in_details}
						onChange={handleInputChange}
						placeholder="Suite 500, Building A, Floor 5"
					/>

					{/* Notes */}
					<FloatingLabelInput
						label={t("customers.form.notes")}
						name="notes"
						type="text"
						value={formData.notes}
						onChange={handleInputChange}
						placeholder="Important client - handle with priority"
					/>

					{/* Active Status Toggle */}
					<div className="pt-2">
						<Toggle
							label={t("customers.form.activeStatus")}
							checked={formData.is_active}
							onChange={checked => setFormData(prev => ({ ...prev, is_active: checked }))}
						/>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4 border-t border-gray-200 mt-6">
						<Button
							onClick={() => {
								setIsModalOpen(false);
								setEditingCustomer(null);
								setFormData(FROM_INITIAL_STATE);
							}}
							disabled={loading}
							title={t("customers.modal.cancel")}
							className="bg-transparent shadow-none hover:shadow-none flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
						/>
						<Button
							onClick={handleSubmit}
							disabled={loading}
							title={
								loading ? (
									<span className="flex items-center justify-center gap-2">
										<AiOutlineLoading3Quarters size={24} />
										{editingCustomer
											? t("customers.modal.updating")
											: t("customers.modal.creating")}
									</span>
								) : editingCustomer ? (
									t("customers.modal.update")
								) : (
									t("customers.modal.create")
								)
							}
							className="flex-1 px-4 py-2.5 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
						/>
					</div>
				</div>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setCustomerToDelete(null);
				}}
				onConfirm={confirmDelete}
				title={t("customers.deleteModal.title")}
				message={t("customers.deleteModal.message", { name: customerToDelete?.name })}
				confirmText={t("customers.deleteModal.confirm")}
				cancelText={t("customers.deleteModal.cancel")}
			/>
		</div>
	);
};

export default CustomersPage;
