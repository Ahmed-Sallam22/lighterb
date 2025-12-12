import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/shared/PageHeader";
import Card from "../components/shared/Card";
import Table from "../components/shared/Table";
import SlideUpModal from "../components/shared/SlideUpModal";
import ConfirmModal from "../components/shared/ConfirmModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import Toggle from "../components/shared/Toggle";
import {
	fetchSuppliers,
	fetchSupplierById,
	createSupplier,
	updateSupplier,
	deleteSupplier,
} from "../store/suppliersSlice";

import LoadingSpan from "../components/shared/LoadingSpan";

const SupplierIcon = () => (
	<svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g opacity="0.5">
			<path d="M14 2L2 8V20L14 26L26 20V8L14 2Z" stroke="#D3D3D3" strokeWidth="2" strokeLinejoin="round" />
			<path
				d="M14 14C15.6569 14 17 12.6569 17 11C17 9.34315 15.6569 8 14 8C12.3431 8 11 9.34315 11 11C11 12.6569 12.3431 14 14 14Z"
				fill="#D3D3D3"
			/>
			<path
				d="M8 22C8 19.2386 10.2386 17 13 17H15C17.7614 17 20 19.2386 20 22"
				stroke="#D3D3D3"
				strokeWidth="2"
			/>
		</g>
	</svg>
);

const SuppliersPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();
	const { suppliers, loading, error } = useSelector(state => state.suppliers);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [editingSupplier, setEditingSupplier] = useState(null);
	const [viewingSupplier, setViewingSupplier] = useState(null);
	const [supplierToDelete, setSupplierToDelete] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");

	const [supplierForm, setSupplierForm] = useState({
		name: "",
		email: "",
		phone: "",
		country: 1,
		address: "",
		notes: "",
		is_active: true,
		website: "",
		vat_number: "",
		tax_id: "",
	});

	// Countries with backend IDs
	const countries = [
		{ value: 1, label: "United Arab Emirates" },
		{ value: 2, label: "United States" },
		{ value: 3, label: "United Kingdom" },
		{ value: 4, label: "Germany" },
		{ value: 5, label: "France" },
		{ value: 6, label: "Saudi Arabia" },
		{ value: 7, label: "Egypt" },
		{ value: 8, label: "India" },
	];

	// Update browser title
	useEffect(() => {
		document.title = `${t("suppliers.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	const refreshSuppliers = useCallback(() => dispatch(fetchSuppliers()), [dispatch]);

	useEffect(() => {
		refreshSuppliers();
	}, [refreshSuppliers]);

	useEffect(() => {
		if (error) {
			toast.error(error);
		}
	}, [error]);

	const handleOpenModal = async (supplier = null) => {
		if (supplier) {
			// Fetch full supplier details from API
			try {
				const supplierDetails = await dispatch(fetchSupplierById(supplier.id)).unwrap();
				setEditingSupplier(supplierDetails);
				setSupplierForm({
					name: supplierDetails.name || "",
					email: supplierDetails.email || "",
					phone: supplierDetails.phone || "",
					country: supplierDetails.country || 1,
					address: supplierDetails.address || "",
					notes: supplierDetails.notes || "",
					is_active: supplierDetails.is_active !== undefined ? supplierDetails.is_active : true,
					website: supplierDetails.website || "",
					vat_number: supplierDetails.vat_number || "",
					tax_id: supplierDetails.tax_id || "",
				});
				setIsModalOpen(true);
			} catch (err) {
				toast.error(err || t("suppliers.messages.error"));
			}
		} else {
			setEditingSupplier(null);
			setSupplierForm({
				name: "",
				email: "",
				phone: "",
				country: 1,
				address: "",
				notes: "",
				is_active: true,
				website: "",
				vat_number: "",
				tax_id: "",
			});
			setIsModalOpen(true);
		}
	};

	const handleViewSupplier = async supplier => {
		try {
			const supplierDetails = await dispatch(fetchSupplierById(supplier.id)).unwrap();
			setViewingSupplier(supplierDetails);
			setIsViewModalOpen(true);
		} catch (err) {
			toast.error(err || t("suppliers.messages.error"));
		}
	};

	const handleCloseViewModal = () => {
		setIsViewModalOpen(false);
		setViewingSupplier(null);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingSupplier(null);
		setSupplierForm({
			name: "",
			email: "",
			phone: "",
			country: 1,
			address: "",
			notes: "",
			is_active: true,
			website: "",
			vat_number: "",
			tax_id: "",
		});
	};

	const handleChange = e => {
		const { name, value } = e.target;
		setSupplierForm(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async e => {
		e.preventDefault();

		if (!supplierForm.name.trim()) {
			toast.error(t("suppliers.messages.nameRequired"));
			return;
		}

		// Format data for API
		const formattedData = {
			name: supplierForm.name,
			email: supplierForm.email || undefined,
			phone: supplierForm.phone || undefined,
			country: parseInt(supplierForm.country) || 1,
			address: supplierForm.address || undefined,
			notes: supplierForm.notes || undefined,
			is_active: supplierForm.is_active,
			website: supplierForm.website || undefined,
			vat_number: supplierForm.vat_number || undefined,
			tax_id: supplierForm.tax_id || undefined,
		};

		// Remove undefined values
		Object.keys(formattedData).forEach(key => {
			if (formattedData[key] === undefined) {
				delete formattedData[key];
			}
		});

		try {
			if (editingSupplier) {
				await dispatch(updateSupplier({ id: editingSupplier.id, supplierData: formattedData })).unwrap();
				toast.success(t("suppliers.messages.updated"));
			} else {
				await dispatch(createSupplier(formattedData)).unwrap();
				toast.success(t("suppliers.messages.created"));
			}
			await refreshSuppliers();
			handleCloseModal();
		} catch (err) {
			console.error("Error saving supplier:", err);
			toast.error(err || t("suppliers.messages.error"));
		}
	};

	const handleDeleteClick = supplier => {
		setSupplierToDelete(supplier);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!supplierToDelete) return;

		try {
			await dispatch(deleteSupplier(supplierToDelete.id)).unwrap();
			toast.success(t("suppliers.messages.deleted"));
			await refreshSuppliers();
			setIsDeleteModalOpen(false);
			setSupplierToDelete(null);
		} catch (err) {
			toast.error(err || t("suppliers.messages.error"));
		}
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
		setSupplierToDelete(null);
	};

	const columns = [
		{
			header: t("suppliers.table.id"),
			accessor: "id",
			sortable: true,
			width: "80px",
			render: value => <span className="font-semibold text-gray-900">{value}</span>,
		},
		{
			header: t("suppliers.table.name"),
			accessor: "name",
			sortable: true,
			render: value => <span className="font-semibold text-gray-900">{value}</span>,
		},
		{
			header: t("suppliers.table.email"),
			accessor: "email",
			sortable: true,
			render: value => <span className="text-gray-600 text-sm">{value || "-"}</span>,
		},
		{
			header: t("suppliers.table.phone"),
			accessor: "phone",
			sortable: true,
			width: "160px",
			render: value => (
				<span className="text-gray-600 text-sm" dir="ltr">
					{value || "-"}
				</span>
			),
		},
		{
			header: t("suppliers.table.country"),
			accessor: "country_code",
			sortable: true,
			width: "120px",
			render: value => <span className="font-medium text-gray-700">{value || "-"}</span>,
		},
		{
			header: t("suppliers.table.vatNumber") || "VAT Number",
			accessor: "vat_number",
			sortable: true,
			width: "180px",
			render: value => <span className="text-gray-600 text-sm font-mono">{value || "-"}</span>,
		},
		{
			header: t("suppliers.table.status"),
			accessor: "is_active",
			sortable: true,
			width: "120px",
			render: value => (
				<span
					className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
						value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
					}`}
				>
					{value ? t("suppliers.enums.active") : t("suppliers.enums.inactive")}
				</span>
			),
		},
	];

	const filteredSuppliers = suppliers.filter(
		supplier =>
			supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			supplier.vat_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			supplier.country_code?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="">
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
			<PageHeader title={t("suppliers.title")} subtitle={t("suppliers.subtitle")} icon={<SupplierIcon />} />

			<Card>
				<div className="mb-4 flex justify-between items-center flex-wrap gap-4">
					<input
						type="text"
						placeholder={t("suppliers.actions.search")}
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						className={`px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5f7a] max-w-md ${
							isRtl ? "text-right" : "text-left"
						}`}
					/>
					<Button
						onClick={() => handleOpenModal()}
						title={t("suppliers.actions.add")}
						className="px-6 py-2 bg-[#0d5f7a] text-white rounded-lg hover:bg-[#0a4a5e] transition-colors font-medium"
					/>
				</div>

				{loading ? (
					<LoadingSpan />
				) : (
					<Table
						columns={columns}
						data={filteredSuppliers}
						onView={handleViewSupplier}
						onEdit={handleOpenModal}
						onDelete={handleDeleteClick}
						emptyMessage={t("suppliers.messages.empty")}
					/>
				)}
			</Card>

			{/* Add/Edit Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={editingSupplier ? t("suppliers.modals.editTitle") : t("suppliers.modals.addTitle")}
			>
				<form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
					{/* Basic Information */}
					<div>
						<h4 className="text-sm font-semibold text-gray-700 mb-3">{t("suppliers.form.basicInfo")}</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={`${t("suppliers.form.supplierName")} *`}
								name="name"
								type="text"
								value={supplierForm.name}
								onChange={handleChange}
								required
								placeholder={t("suppliers.form.placeholders.enterName")}
							/>

							<FloatingLabelInput
								label={t("suppliers.table.email")}
								name="email"
								type="email"
								value={supplierForm.email}
								onChange={handleChange}
								placeholder={t("suppliers.form.placeholders.enterEmail")}
							/>

							<FloatingLabelInput
								label={t("suppliers.table.phone")}
								name="phone"
								type="text"
								value={supplierForm.phone}
								onChange={handleChange}
								placeholder="e.g., +1-555-123-4567"
							/>

							<FloatingLabelInput
								label={t("suppliers.form.website")}
								name="website"
								type="url"
								value={supplierForm.website}
								onChange={handleChange}
								placeholder="https://www.example.com"
							/>

							<FloatingLabelInput
								label={t("suppliers.form.vatNumber")}
								name="vat_number"
								type="text"
								value={supplierForm.vat_number}
								onChange={handleChange}
								placeholder="e.g., VAT123456789"
							/>

							<FloatingLabelInput
								label={t("suppliers.form.taxId")}
								name="tax_id"
								type="text"
								value={supplierForm.tax_id}
								onChange={handleChange}
								placeholder="e.g., 12-3456789"
							/>
						</div>
					</div>

					{/* Address Information */}
					<div className="pt-4">
						<h4 className="text-sm font-semibold text-gray-700 mb-3">{t("suppliers.form.addressInfo")}</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={`${t("suppliers.table.country")} *`}
								name="country"
								value={supplierForm.country}
								onChange={handleChange}
								options={countries}
								placeholder={t("suppliers.form.placeholders.select")}
								required
							/>

							<div className="md:col-span-2">
								<FloatingLabelInput
									label={t("suppliers.table.address")}
									name="address"
									type="text"
									value={supplierForm.address}
									onChange={handleChange}
									placeholder={t("suppliers.form.placeholders.enterAddress")}
								/>
							</div>
						</div>
					</div>

					{/* Notes */}
					<div className="pt-4">
						<h4 className="text-sm font-semibold text-gray-700 mb-3">
							{t("suppliers.form.additionalInfo")}
						</h4>
						<div className="grid grid-cols-1 gap-4">
							<div className="flex items-center gap-3 mb-3">
								<Toggle
									checked={supplierForm.is_active}
									onChange={checked => setSupplierForm(prev => ({ ...prev, is_active: checked }))}
								/>
								<label className="text-sm font-medium text-gray-700">
									{t("suppliers.form.activeSupplier")}
								</label>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									{t("suppliers.form.notes")}
								</label>
								<textarea
									name="notes"
									value={supplierForm.notes}
									onChange={handleChange}
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d5f7a] focus:border-transparent resize-none"
									placeholder={t("suppliers.form.placeholders.enterNotes")}
								/>
							</div>
						</div>
					</div>

					<div className="flex justify-end gap-3 pt-4 sticky">
						<Button
							onClick={handleCloseModal}
							title={t("suppliers.actions.cancel")}
							className="bg-transparent shadow-none hover:shadow-none px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
						/>
						<Button
							onClick={handleSubmit}
							disabled={loading}
							title={
								loading
									? t("suppliers.actions.saving")
									: editingSupplier
									? t("suppliers.actions.update")
									: t("suppliers.actions.create")
							}
							className="px-6 py-2 bg-[#0d5f7a] text-white rounded-lg hover:bg-[#0a4a5e] transition-colors disabled:opacity-50"
						/>
					</div>
				</form>
			</SlideUpModal>

			{/* View Modal (Read-Only) */}
			<SlideUpModal
				isOpen={isViewModalOpen}
				onClose={handleCloseViewModal}
				title={t("suppliers.modals.viewTitle") || "Supplier Details"}
			>
				{viewingSupplier && (
					<div className="space-y-6 max-h-[80vh] overflow-y-auto">
						{/* Basic Information */}
						<div>
							<h4 className="text-sm font-semibold text-gray-700 mb-3">
								{t("suppliers.form.basicInfo")}
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-xs text-gray-500 mb-1">
										{t("suppliers.form.supplierName")}
									</label>
									<p className="text-gray-900 font-medium">{viewingSupplier.name || "-"}</p>
								</div>
								<div>
									<label className="block text-xs text-gray-500 mb-1">
										{t("suppliers.table.email")}
									</label>
									<p className="text-gray-900">{viewingSupplier.email || "-"}</p>
								</div>
								<div>
									<label className="block text-xs text-gray-500 mb-1">
										{t("suppliers.table.phone")}
									</label>
									<p className="text-gray-900" dir="ltr">
										{viewingSupplier.phone || "-"}
									</p>
								</div>
								<div>
									<label className="block text-xs text-gray-500 mb-1">
										{t("suppliers.form.website")}
									</label>
									<p className="text-gray-900">
										{viewingSupplier.website ? (
											<a
												href={viewingSupplier.website}
												target="_blank"
												rel="noopener noreferrer"
												className="text-[#0d5f7a] hover:underline"
											>
												{viewingSupplier.website}
											</a>
										) : (
											"-"
										)}
									</p>
								</div>
								<div>
									<label className="block text-xs text-gray-500 mb-1">
										{t("suppliers.form.vatNumber")}
									</label>
									<p className="text-gray-900 font-mono">{viewingSupplier.vat_number || "-"}</p>
								</div>
								<div>
									<label className="block text-xs text-gray-500 mb-1">
										{t("suppliers.form.taxId")}
									</label>
									<p className="text-gray-900 font-mono">{viewingSupplier.tax_id || "-"}</p>
								</div>
							</div>
						</div>

						{/* Address Information */}
						<div className="pt-4 border-t">
							<h4 className="text-sm font-semibold text-gray-700 mb-3">
								{t("suppliers.form.addressInfo")}
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-xs text-gray-500 mb-1">
										{t("suppliers.table.country")}
									</label>
									<p className="text-gray-900">
										{viewingSupplier.country_name || viewingSupplier.country_code || "-"}
									</p>
								</div>
								<div className="md:col-span-2">
									<label className="block text-xs text-gray-500 mb-1">
										{t("suppliers.table.address")}
									</label>
									<p className="text-gray-900">{viewingSupplier.address || "-"}</p>
								</div>
							</div>
						</div>

						{/* Status & Notes */}
						<div className="pt-4 border-t">
							<h4 className="text-sm font-semibold text-gray-700 mb-3">
								{t("suppliers.form.additionalInfo")}
							</h4>
							<div className="grid grid-cols-1 gap-4">
								<div>
									<label className="block text-xs text-gray-500 mb-1">
										{t("suppliers.table.status")}
									</label>
									<span
										className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
											viewingSupplier.is_active
												? "bg-green-100 text-green-800"
												: "bg-gray-100 text-gray-800"
										}`}
									>
										{viewingSupplier.is_active
											? t("suppliers.enums.active")
											: t("suppliers.enums.inactive")}
									</span>
								</div>
								<div>
									<label className="block text-xs text-gray-500 mb-1">
										{t("suppliers.form.notes")}
									</label>
									<p className="text-gray-900 whitespace-pre-wrap">{viewingSupplier.notes || "-"}</p>
								</div>
							</div>
						</div>

						{/* Timestamps */}
						{(viewingSupplier.created_at || viewingSupplier.updated_at) && (
							<div className="pt-4 border-t">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
									{viewingSupplier.created_at && (
										<div>
											<label className="block text-xs mb-1">
												{t("suppliers.form.createdAt") || "Created At"}
											</label>
											<p>{new Date(viewingSupplier.created_at).toLocaleString()}</p>
										</div>
									)}
									{viewingSupplier.updated_at && (
										<div>
											<label className="block text-xs mb-1">
												{t("suppliers.form.updatedAt") || "Updated At"}
											</label>
											<p>{new Date(viewingSupplier.updated_at).toLocaleString()}</p>
										</div>
									)}
								</div>
							</div>
						)}

						<div className="flex justify-end gap-3 pt-4">
							<Button
								onClick={handleCloseViewModal}
								title={t("suppliers.actions.close") || "Close"}
								className="bg-transparent shadow-none hover:shadow-none px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
							/>
							<Button
								onClick={() => {
									handleCloseViewModal();
									handleOpenModal(viewingSupplier);
								}}
								title={t("suppliers.actions.edit")}
								className="px-6 py-2 bg-[#0d5f7a] text-white rounded-lg hover:bg-[#0a4a5e] transition-colors"
							/>
						</div>
					</div>
				)}
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title={t("suppliers.modals.deleteTitle")}
				message={t("suppliers.modals.deleteMessage", { name: supplierToDelete?.name })}
				confirmText={t("suppliers.actions.delete")}
				cancelText={t("suppliers.actions.cancel")}
			/>
		</div>
	);
};

export default SuppliersPage;
