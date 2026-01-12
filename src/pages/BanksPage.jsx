import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import SlideUpModal from "../components/shared/SlideUpModal";
import ConfirmModal from "../components/shared/ConfirmModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import FloatingLabelTextarea from "../components/shared/FloatingLabelTextarea";
import Toggle from "../components/shared/Toggle";
import Button from "../components/shared/Button";
import LoadingSpan from "../components/shared/LoadingSpan";

import {
	fetchBanks,
	createBank,
	updateBank,
	deleteBank,
	activateBank,
	deactivateBank,
	setPage,
} from "../store/banksSlice";
import { fetchCountries } from "../store/countriesSlice";

import { BiPlus } from "react-icons/bi";
import { FiEye } from "react-icons/fi";
import { BsBank2 } from "react-icons/bs";

// Bank Header Icon
const BankHeaderIcon = () => <BsBank2 className="w-8 h-8 text-white" />;

const INITIAL_FORM_STATE = {
	bank_name: "",
	bank_code: "",
	country: "",
	swift_code: "",
	routing_number: "",
	contact_email: "",
	contact_phone: "",
	website: "",
	is_active: true,
	notes: "",
};

const BanksPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();
	const navigate = useNavigate();

	// Redux state
	const { banks, loading, count, page, hasNext, hasPrevious, actionLoading } = useSelector(state => state.banks);
	const { countries = [] } = useSelector(state => state.countries);

	// Local state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingBank, setEditingBank] = useState(null);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [bankToDelete, setBankToDelete] = useState(null);
	const [localPageSize, setLocalPageSize] = useState(20);
	const [formData, setFormData] = useState(INITIAL_FORM_STATE);
	const [errors, setErrors] = useState({});

	// Filters
	const [filters, setFilters] = useState({
		country: "",
		is_active: "",
	});

	// Fetch data on mount and when filters/pagination change
	useEffect(() => {
		dispatch(fetchCountries());
	}, [dispatch]);

	useEffect(() => {
		dispatch(
			fetchBanks({
				page,
				page_size: localPageSize,
				country: filters.country || undefined,
				is_active: filters.is_active !== "" ? filters.is_active : undefined,
			})
		);
	}, [dispatch, page, localPageSize, filters]);

	// Country options for select
	const countryOptions = useMemo(() => {
		return [
			{ value: "", label: t("banks.filters.allCountries") },
			...countries.map(c => ({
				value: c.id,
				label: c.name,
			})),
		];
	}, [countries, t]);

	// Active status options
	const activeOptions = useMemo(
		() => [
			{ value: "", label: t("banks.filters.allStatus") },
			{ value: "true", label: t("banks.filters.active") },
			{ value: "false", label: t("banks.filters.inactive") },
		],
		[t]
	);

	// Handle filter change
	const handleFilterChange = useCallback(
		(field, value) => {
			setFilters(prev => ({ ...prev, [field]: value }));
			dispatch(setPage(1));
		},
		[dispatch]
	);

	// Pagination handlers
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

	// Toggle active status
	const handleToggleActive = async (bank, newValue) => {
		try {
			if (newValue) {
				await dispatch(activateBank(bank.id)).unwrap();
				toast.success(t("banks.messages.activated", { name: bank.bank_name }));
			} else {
				await dispatch(deactivateBank(bank.id)).unwrap();
				toast.success(t("banks.messages.deactivated", { name: bank.bank_name }));
			}
		} catch (err) {
			const errorMessage = err?.message || t("banks.messages.updateActiveError");
			toast.error(errorMessage);
		}
	};

	// Table columns
	const columns = useMemo(
		() => [
			{
				header: t("banks.table.bankName"),
				accessor: "bank_name",
				render: value => <span className="font-semibold text-gray-900">{value}</span>,
			},
			{
				header: t("banks.table.bankCode"),
				accessor: "bank_code",
				width: "120px",
				render: value => <span className="font-mono text-gray-700">{value}</span>,
			},
			{
				header: t("banks.table.country"),
				accessor: "country_name",
				render: value => <span className="text-gray-700">{value || "-"}</span>,
			},
			{
				header: t("banks.table.swiftCode"),
				accessor: "swift_code",
				width: "150px",
				render: value => <span className="font-mono text-gray-700">{value || "-"}</span>,
			},
			{
				header: t("banks.table.totalBranches"),
				accessor: "total_branches",
				width: "120px",
				render: value => (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
						{value || 0}
					</span>
				),
			},
			{
				header: t("banks.table.totalAccounts"),
				accessor: "total_accounts",
				width: "120px",
				render: value => (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
						{value || 0}
					</span>
				),
			},
			{
				header: t("banks.table.active"),
				accessor: "is_active",
				width: "120px",
				render: (value, row) => (
					<Toggle checked={!!value} onChange={checked => handleToggleActive(row, checked)} />
				),
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[t]
	);

	// Form validation
	const validateForm = () => {
		const newErrors = {};

		if (!formData.bank_name.trim()) {
			newErrors.bank_name = t("banks.validation.nameRequired");
		}
		if (!formData.bank_code.trim()) {
			newErrors.bank_code = t("banks.validation.codeRequired");
		}
		if (!formData.country) {
			newErrors.country = t("banks.validation.countryRequired");
		}
		if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
			newErrors.contact_email = t("banks.validation.invalidEmail");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle form input change
	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	// Open create modal
	const handleCreate = () => {
		setEditingBank(null);
		setFormData(INITIAL_FORM_STATE);
		setErrors({});
		setIsModalOpen(true);
	};

	// Open edit modal
	const handleEdit = row => {
		const bank = row.rawData || row;
		setEditingBank(bank);
		setFormData({
			bank_name: bank.bank_name || "",
			bank_code: bank.bank_code || "",
			country: bank.country || "",
			swift_code: bank.swift_code || "",
			routing_number: bank.routing_number || "",
			contact_email: bank.contact_email || "",
			contact_phone: bank.contact_phone || "",
			website: bank.website || "",
			is_active: bank.is_active !== undefined ? bank.is_active : true,
			notes: bank.notes || "",
		});
		setErrors({});
		setIsModalOpen(true);
	};

	// Handle view (navigate to details page)
	const handleView = row => {
		const bank = row.rawData || row;
		navigate(`/banks/${bank.id}`);
	};

	// Handle form submit
	const handleSubmit = async () => {
		if (!validateForm()) return;

		const bankData = {
			bank_name: formData.bank_name.trim(),
			bank_code: formData.bank_code.trim().toUpperCase(),
			country: parseInt(formData.country),
			swift_code: formData.swift_code.trim() || null,
			routing_number: formData.routing_number.trim() || null,
			contact_email: formData.contact_email.trim() || null,
			contact_phone: formData.contact_phone.trim() || null,
			website: formData.website.trim() || null,
			is_active: formData.is_active,
			notes: formData.notes.trim() || null,
		};

		try {
			if (editingBank) {
				await dispatch(updateBank({ id: editingBank.id, data: bankData })).unwrap();
				toast.success(t("banks.messages.updateSuccess"));
			} else {
				await dispatch(createBank(bankData)).unwrap();
				toast.success(t("banks.messages.createSuccess"));
			}
			handleCloseModal();
			dispatch(fetchBanks({ page, page_size: localPageSize, ...filters }));
		} catch (err) {
			const errorMessage = err?.message || err?.error || t("banks.messages.saveError");
			if (err && typeof err === "object" && !err.message && !err.error) {
				const errorMessages = [];
				Object.keys(err).forEach(key => {
					if (Array.isArray(err[key])) {
						errorMessages.push(`${key}: ${err[key].join(", ")}`);
					} else if (typeof err[key] === "string") {
						errorMessages.push(`${key}: ${err[key]}`);
					}
				});
				if (errorMessages.length > 0) {
					toast.error(errorMessages.join(" | "));
					return;
				}
			}
			toast.error(errorMessage);
		}
	};

	// Close modal
	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingBank(null);
		setFormData(INITIAL_FORM_STATE);
		setErrors({});
	};

	// Handle delete click
	const handleDelete = row => {
		const bank = row.rawData || row;
		setBankToDelete(bank);
		setConfirmDelete(true);
	};

	// Confirm delete
	const handleConfirmDelete = async () => {
		try {
			await dispatch(deleteBank(bankToDelete.id)).unwrap();
			toast.success(t("banks.messages.deleteSuccess"));
			setConfirmDelete(false);
			setBankToDelete(null);
		} catch (err) {
			const errorMessage = err?.message || t("banks.messages.deleteError");
			toast.error(errorMessage);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer
				position={isRtl ? "top-left" : "top-right"}
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				rtl={isRtl}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>

			<PageHeader title={t("banks.title")} subtitle={t("banks.subtitle")} icon={<BankHeaderIcon />} />

			<div className="w-[95%] mx-auto px-6 py-8">
				{/* Header with Title, Filters, and Add Button */}
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
					<h2 className="text-2xl font-bold text-gray-900">{t("banks.pageTitle")}</h2>

					<div className="flex flex-wrap items-center gap-4">
						{/* Country Filter */}
						<div className="w-48">
							<FloatingLabelSelect
								label={t("banks.filters.country")}
								value={filters.country}
								onChange={e => handleFilterChange("country", e.target.value)}
								options={countryOptions}
							/>
						</div>

						{/* Status Filter */}
						<div className="w-40">
							<FloatingLabelSelect
								label={t("banks.filters.status")}
								value={filters.is_active}
								onChange={e => handleFilterChange("is_active", e.target.value)}
								options={activeOptions}
							/>
						</div>

						<Button
							onClick={handleCreate}
							title={t("banks.addBank")}
							className="bg-[#28819C] hover:bg-[#206b85] text-white"
							icon={<BiPlus className="text-xl" />}
						/>
					</div>
				</div>

				{/* Table */}
				{loading ? (
					<LoadingSpan />
				) : (
					<>
						<Table
							columns={columns}
							data={banks}
							onView={handleView}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>

						{/* Pagination */}
						<Pagination
							currentPage={page}
							totalCount={count}
							pageSize={localPageSize}
							hasNext={hasNext}
							hasPrevious={hasPrevious}
							onPageChange={handlePageChange}
							onPageSizeChange={handlePageSizeChange}
						/>
					</>
				)}
			</div>

			{/* Add/Edit Bank Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={editingBank ? t("banks.modal.titleEdit") : t("banks.modal.titleAdd")}
				maxWidth="700px"
			>
				<div className="space-y-6 p-2">
					{/* Basic Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("banks.form.bankName")}
							name="bank_name"
							value={formData.bank_name}
							onChange={e => handleInputChange("bank_name", e.target.value)}
							error={errors.bank_name}
							required
						/>
						<FloatingLabelInput
							label={t("banks.form.bankCode")}
							name="bank_code"
							value={formData.bank_code}
							onChange={e => handleInputChange("bank_code", e.target.value)}
							error={errors.bank_code}
							required
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelSelect
							label={t("banks.form.country")}
							name="country"
							value={formData.country}
							onChange={e => handleInputChange("country", e.target.value)}
							options={countries.map(c => ({ value: c.id, label: c.name }))}
							error={errors.country}
							required
						/>
						<FloatingLabelInput
							label={t("banks.form.swiftCode")}
							name="swift_code"
							value={formData.swift_code}
							onChange={e => handleInputChange("swift_code", e.target.value)}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("banks.form.routingNumber")}
							name="routing_number"
							value={formData.routing_number}
							onChange={e => handleInputChange("routing_number", e.target.value)}
						/>
						<FloatingLabelInput
							label={t("banks.form.website")}
							name="website"
							value={formData.website}
							onChange={e => handleInputChange("website", e.target.value)}
							placeholder="https://www.example.com"
						/>
					</div>

					{/* Contact Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("banks.form.contactEmail")}
							name="contact_email"
							type="email"
							value={formData.contact_email}
							onChange={e => handleInputChange("contact_email", e.target.value)}
							error={errors.contact_email}
						/>
						<FloatingLabelInput
							label={t("banks.form.contactPhone")}
							name="contact_phone"
							value={formData.contact_phone}
							onChange={e => handleInputChange("contact_phone", e.target.value)}
						/>
					</div>

					{/* Notes */}
					<FloatingLabelTextarea
						label={t("banks.form.notes")}
						name="notes"
						value={formData.notes}
						onChange={e => handleInputChange("notes", e.target.value)}
						rows={3}
					/>

					{/* Active Toggle */}
					<div className="flex items-center gap-3">
						<span className="text-sm font-medium text-gray-700">{t("banks.form.active")}</span>
						<Toggle
							checked={formData.is_active}
							onChange={checked => handleInputChange("is_active", checked)}
						/>
					</div>

					{/* Action Buttons */}
					<div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
						<Button
							onClick={handleCloseModal}
							title={t("banks.modal.cancel")}
							className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
						/>
						<Button
							onClick={handleSubmit}
							disabled={actionLoading}
							title={actionLoading ? t("banks.modal.saving") : t("banks.modal.save")}
							className="bg-[#28819C] hover:bg-[#206b85] text-white"
						/>
					</div>
				</div>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={confirmDelete}
				onClose={() => {
					setConfirmDelete(false);
					setBankToDelete(null);
				}}
				onConfirm={handleConfirmDelete}
				title={t("banks.deleteConfirm.title")}
				message={t("banks.deleteConfirm.message", {
					name: bankToDelete?.bank_name,
				})}
				confirmText={t("banks.deleteConfirm.confirm")}
				cancelText={t("banks.deleteConfirm.cancel")}
			/>
		</div>
	);
};

export default BanksPage;
