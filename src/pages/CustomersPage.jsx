// src/pages/Customers.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

import PageHeader from "../components/shared/PageHeader";
import Toolbar from "../components/shared/Toolbar";
import Table from "../components/shared/Table";
import SlideUpModal from "../components/shared/SlideUpModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import Toggle from "../components/shared/Toggle";
import ConfirmModal from "../components/shared/ConfirmModal";

import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from "../store/customersSlice";
import { fetchCurrencies } from "../store/currenciesSlice";
import { MdPerson } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
const FROM_INITIAL_STATE = {
	code: "",
	name: "",
	email: "",
	country: "",
	currency: "",
	vat_number: "",
	is_active: true,
};

const CustomersPage = () => {
	const { t } = useTranslation();
	const dispatch = useDispatch();

	const { customers = [], loading, error } = useSelector(state => state.customers || {});
	const { currencies = [] } = useSelector(state => state.currencies || {});

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCustomer, setEditingCustomer] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [customerToDelete, setCustomerToDelete] = useState(null);

	const [formData, setFormData] = useState(FROM_INITIAL_STATE);

	const [searchTerm, setSearchTerm] = useState("");

	const title = t("customers.title");
	const subtitle = t("customers.subtitle");

	const countryOptions = useMemo(() => {
		const countries = [
			{ value: "AE", label: "United Arab Emirates (AE)" },
			{ value: "EG", label: "Egypt (EG)" },
			{ value: "IN", label: "India (IN)" },
			{ value: "SA", label: "Saudi Arabia (SA)" },
			{ value: "US", label: "United States (US)" },
		];
		return [{ value: "", label: t("customers.form.selectCountry") || "Select Country" }, ...countries];
	}, [t]);

	// const currencyOptions = [
	// 	{ value: "", label: t("customers.form.selectCurrency") || "Select Currency" },
	// 	...currencies.map(currency => ({
	// 		value: currency.id?.toString() ?? currency.code ?? "",
	// 		label: `${currency.code} - ${currency.name}`,
	// 	})),
	// ];
	const currencyOptions = useMemo(() => {
		return [
			{ value: "", label: t("customers.form.selectCurrency") || "Select Currency" },
			...currencies.map(currency => ({
				value: currency.id?.toString() ?? currency.code ?? "",
				label: `${currency.code} - ${currency.name}`,
			})),
		];
	}, [currencies, t]);

	// Fetch customers and currencies on mount
	useEffect(() => {
		dispatch(fetchCustomers());
		dispatch(fetchCurrencies());
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
				customer.code?.toLowerCase().includes(search) ||
				(customer.country?.toLowerCase && customer.country?.toLowerCase().includes(search)) ||
				customer.vat_number?.toLowerCase().includes(search)
			);
		})
		.map(customer => ({
			id: customer.id,
			code: customer.code || "-",
			name: customer.name || "-",
			email: customer.email || "-",
			country: customer.country || "-",
			currencyName: customer.currency_name || customer.currency || "-",
			vatNumber: customer.vat_number || "-",
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
			header: t("customers.table.code"),
			accessor: "code",
			render: value => value || "-",
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
			header: t("customers.table.country"),
			accessor: "country",
			render: value => value || "-",
		},
		{
			header: t("customers.table.currency"),
			accessor: "currencyName",
			render: value => value || "-",
		},
		{
			header: t("customers.table.vatNumber"),
			accessor: "vatNumber",
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
	const handleCreate = () => {
		setEditingCustomer(null);
		setFormData(FROM_INITIAL_STATE);
		setIsModalOpen(true);
	};

	const handleEdit = row => {
		setEditingCustomer(row.rawData);
		setFormData({
			code: row.rawData.code || "",
			name: row.rawData.name || "",
			email: row.rawData.email || "",
			country: row.rawData.country || "",
			currency: row.rawData.currency?.toString() || "",
			vat_number: row.rawData.vat_number || "",
			is_active: row.rawData.is_active !== undefined ? row.rawData.is_active : true,
		});
		setIsModalOpen(true);
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
		}
	};

	const handleSubmit = async () => {
		// Validation
		if (!formData.name || !formData.email || !formData.country || !formData.currency) {
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
			code: formData.code || null,
			name: formData.name,
			email: formData.email,
			country: formData.country,
			currency: parseInt(formData.currency),
			vat_number: formData.vat_number || null,
			is_active: formData.is_active,
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
					{/* Customer Code */}
					<FloatingLabelInput
						label={t("customers.form.code")}
						name="code"
						type="text"
						value={formData.code}
						onChange={handleInputChange}
						placeholder="e.g., CUST-UAE-001"
					/>

					{/* Customer Name */}
					<FloatingLabelInput
						label={t("customers.form.name")}
						name="name"
						type="text"
						value={formData.name}
						onChange={handleInputChange}
						required
						placeholder={t("customers.form.name")}
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

					{/* Country */}
					<FloatingLabelSelect
						label={t("customers.form.country")}
						name="country"
						value={formData.country}
						onChange={handleInputChange}
						options={countryOptions}
						required
					/>

					{/* Currency */}
					<FloatingLabelSelect
						label={t("customers.form.currency")}
						name="currency"
						value={formData.currency}
						onChange={handleInputChange}
						options={currencyOptions}
						required
					/>

					{/* VAT Number */}
					<FloatingLabelInput
						label={t("customers.form.vatNumber")}
						name="vat_number"
						type="text"
						value={formData.vat_number}
						onChange={handleInputChange}
						placeholder="e.g., AE100200300400001"
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
						<button
							type="button"
							onClick={() => {
								setIsModalOpen(false);
								setEditingCustomer(null);
								setFormData(FROM_INITIAL_STATE);
							}}
							className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
							disabled={loading}
						>
							{t("customers.modal.cancel")}
						</button>
						<button
							type="button"
							onClick={handleSubmit}
							className="flex-1 px-4 py-2.5 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={loading}
						>
							{loading ? (
								<span className="flex items-center justify-center gap-2">
									<AiOutlineLoading3Quarters size={24} />
									{editingCustomer ? t("customers.modal.updating") : t("customers.modal.creating")}
								</span>
							) : editingCustomer ? (
								t("customers.modal.update")
							) : (
								t("customers.modal.create")
							)}
						</button>
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
