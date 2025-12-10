import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next"; // ADD THIS IMPORT
import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import SlideUpModal from "../components/shared/SlideUpModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import ConfirmModal from "../components/shared/ConfirmModal";
import Toggle from "../components/shared/Toggle";
import { fetchCurrencies, createCurrency, updateCurrency, deleteCurrency } from "../store/currenciesSlice";

const CurrencyPage = () => {
	const { t } = useTranslation(); // ADD THIS LINE
	const dispatch = useDispatch();
	const { currencies } = useSelector(state => state.currencies);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCurrency, setEditingCurrency] = useState(null);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [currencyToDelete, setCurrencyToDelete] = useState(null);

	const [formData, setFormData] = useState({
		code: "",
		name: "",
		symbol: "",
		isBaseCurrency: false,
	});
	const [errors, setErrors] = useState({});

	// Fetch currencies on component mount
	useEffect(() => {
		dispatch(fetchCurrencies());
	}, [dispatch]);

	const handleToggleBaseCurrency = async (currency, newValue) => {
		const payload = {
			code: currency.code,
			name: currency.name,
			symbol: currency.symbol,
			is_base: newValue,
		};

		try {
			await dispatch(updateCurrency({ id: currency.id, data: payload })).unwrap();
			toast.success(
				newValue
					? t("currency.messages.baseSet", { code: currency.code })
					: t("currency.messages.baseUnset", { code: currency.code })
			);
		} catch (err) {
			const errorMessage = err?.message || err?.error || t("currency.messages.updateBaseError");

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

	// Table columns
	const columns = [
		{
			header: t("currency.table.code"),
			accessor: "code",
			width: "120px",
			render: value => <span className="font-semibold text-gray-900">{value}</span>,
		},
		{
			header: t("currency.table.name"),
			accessor: "name",
			render: value => <span className="text-gray-900">{value}</span>,
		},
		{
			header: t("currency.table.symbol"),
			accessor: "symbol",
			width: "120px",
			render: value => <span className="font-semibold text-gray-700">{value}</span>,
		},
		{
			header: t("currency.table.baseCurrency"),
			accessor: "is_base",
			width: "160px",
			render: (value, row) => (
				<div className="flex items-center gap-3">
					<Toggle checked={!!value} onChange={checked => handleToggleBaseCurrency(row, checked)} />
				</div>
			),
		},
	];

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.code.trim()) {
			newErrors.code = t("currency.validation.codeRequired");
		} else if (formData.code.length !== 3) {
			newErrors.code = t("currency.validation.codeLength");
		}

		if (!formData.name.trim()) {
			newErrors.name = t("currency.validation.nameRequired");
		}

		if (!formData.symbol.trim()) {
			newErrors.symbol = t("currency.validation.symbolRequired");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleAddCurrency = async () => {
		if (!validateForm()) return;

		const currencyData = {
			code: formData.code.toUpperCase().trim(),
			name: formData.name.trim(),
			symbol: formData.symbol.trim(),
			is_base: formData.isBaseCurrency,
		};

		try {
			if (editingCurrency) {
				// Update existing currency
				await dispatch(
					updateCurrency({
						id: editingCurrency.id,
						data: currencyData,
					})
				).unwrap();
				toast.success(t("currency.messages.updateSuccess"));
			} else {
				// Create new currency
				await dispatch(createCurrency(currencyData)).unwrap();
				toast.success(t("currency.messages.createSuccess"));
			}
			// Refresh the currencies list
			await dispatch(fetchCurrencies());
			handleCloseModal();
		} catch (err) {
			// Display detailed error message from API response
			const errorMessage = err?.message || err?.error || err?.detail || t("currency.messages.createError");

			// If there are field-specific errors, display them
			if (err && typeof err === "object" && !err.message && !err.error && !err.detail) {
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

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingCurrency(null);
		setFormData({
			code: "",
			name: "",
			symbol: "",
			isBaseCurrency: false,
		});
		setErrors({});
	};

	const handleEdit = row => {
		// Handle both row.rawData and direct row object
		const currency = row.rawData || row;
		setEditingCurrency(currency);
		setFormData({
			code: currency.code || "",
			name: currency.name || "",
			symbol: currency.symbol || "",
			isBaseCurrency: !!currency.is_base,
		});
		setIsModalOpen(true);
	};

	const handleDelete = row => {
		// Handle both row.rawData and direct row object
		const currency = row.rawData || row;
		setCurrencyToDelete(currency);
		setConfirmDelete(true);
	};

	const handleConfirmDelete = async () => {
		try {
			await dispatch(deleteCurrency(currencyToDelete.id)).unwrap();
			toast.success(t("currency.messages.deleteSuccess"));
			setConfirmDelete(false);
			setCurrencyToDelete(null);
		} catch (err) {
			// Display detailed error message from API response
			const errorMessage = err?.message || err?.error || err?.detail || t("currency.messages.deleteError");

			// If there are field-specific errors, display them
			if (err && typeof err === "object" && !err.message && !err.error && !err.detail) {
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

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer
				position="top-right"
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>

			<PageHeader
				title={t("currency.title")}
				subtitle={t("currency.subtitle")}
				icon={
					<svg width="29" height="35" viewBox="0 0 29 35" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M14.5 0C6.49 0 0 6.49 0 14.5C0 22.51 6.49 29 14.5 29C22.51 29 29 22.51 29 14.5C29 6.49 22.51 0 14.5 0ZM14.5 26.5C7.87 26.5 2.5 21.13 2.5 14.5C2.5 7.87 7.87 2.5 14.5 2.5C21.13 2.5 26.5 7.87 26.5 14.5C26.5 21.13 21.13 26.5 14.5 26.5Z"
							fill="#28819C"
						/>
						<path
							d="M15.75 7.5H13.25V13.25H7.5V15.75H13.25V21.5H15.75V15.75H21.5V13.25H15.75V7.5Z"
							fill="#28819C"
						/>
					</svg>
				}
			/>

			<div className="w-[95%] mx-auto px-6 py-8">
				{/* Header with Title and Button */}
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-gray-900">{t("currency.pageTitle")}</h2>
					<button
						onClick={() => setIsModalOpen(true)}
						className="flex items-center gap-2 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium"
					>
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM15 11H11V15H9V11H5V9H9V5H11V9H15V11Z"
								fill="white"
							/>
						</svg>
						{t("currency.addCurrency")}
					</button>
				</div>

				{/* Table */}
				<Table
					columns={columns}
					data={currencies}
					onEdit={handleEdit}
					onDelete={handleDelete}
					editIcon="edit"
				/>
			</div>

			{/* Add/Edit Currency Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={editingCurrency ? t("currency.modal.titleEdit") : t("currency.modal.titleAdd")}
				maxWidth="550px"
			>
				<div className="space-y-6">
					{/* Currency Code */}
					<FloatingLabelInput
						label={t("currency.modal.codeLabel")}
						name="code"
						value={formData.code}
						onChange={e => handleInputChange("code", e.target.value)}
						error={errors.code}
						required
						placeholder={t("currency.modal.codePlaceholder")}
						maxLength={3}
						disabled={!!editingCurrency}
					/>

					{/* Currency Name */}
					<FloatingLabelInput
						label={t("currency.modal.nameLabel")}
						name="name"
						value={formData.name}
						onChange={e => handleInputChange("name", e.target.value)}
						error={errors.name}
						required
						placeholder={t("currency.modal.namePlaceholder")}
					/>

					{/* Symbol */}
					<FloatingLabelInput
						label={t("currency.modal.symbolLabel")}
						name="symbol"
						value={formData.symbol}
						onChange={e => handleInputChange("symbol", e.target.value)}
						error={errors.symbol}
						required
						placeholder={t("currency.modal.symbolPlaceholder")}
					/>

					{/* Base Currency Toggle */}
					<div className="flex items-center gap-3">
						<Toggle
							checked={formData.isBaseCurrency}
							onChange={checked => setFormData(prev => ({ ...prev, isBaseCurrency: checked }))}
						/>
						<div>
							<p className="text-sm font-semibold text-gray-700">{t("currency.modal.setAsBase")}</p>
							<p className="text-xs text-gray-500">{t("currency.modal.baseDescription")}</p>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4">
						<button
							onClick={handleCloseModal}
							className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
						>
							{t("currency.modal.cancel")}
						</button>
						<button
							onClick={handleAddCurrency}
							className="flex-1 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium"
						>
							{editingCurrency ? t("currency.modal.update") : t("currency.modal.create")}
						</button>
					</div>
				</div>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={confirmDelete}
				onClose={() => {
					setConfirmDelete(false);
					setCurrencyToDelete(null);
				}}
				onConfirm={handleConfirmDelete}
				title={t("currency.deleteConfirm.title")}
				message={t("currency.deleteConfirm.message", {
					code: currencyToDelete?.code,
					name: currencyToDelete?.name,
				})}
				confirmText={t("currency.deleteConfirm.confirm")}
				cancelText={t("currency.deleteConfirm.cancel")}
			/>
		</div>
	);
};

export default CurrencyPage;
