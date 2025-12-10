import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import SlideUpModal from "../components/shared/SlideUpModal";
import ConfirmModal from "../components/shared/ConfirmModal";
import Toggle from "../components/shared/Toggle";
import { fetchCurrencies, createCurrency, updateCurrency, deleteCurrency } from "../store/currenciesSlice";
import Button from "../components/shared/Button";
import { BiPlus } from "react-icons/bi";
import CurrencyHeaderIcon from "../assets/icons/CurrencyHeaderIcon";
import CurrencyForm from "../components/forms/CurrencyForm";

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

			<PageHeader title={t("currency.title")} subtitle={t("currency.subtitle")} icon={<CurrencyHeaderIcon />} />

			<div className="w-[95%] mx-auto px-6 py-8">
				{/* Header with Title and Button */}
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-gray-900">{t("currency.pageTitle")}</h2>

					<Button
						onClick={() => setIsModalOpen(true)}
						title={t("currency.addCurrency")}
						className="bg-[#28819C] hover:bg-[#206b85] text-white"
						icon={<BiPlus className="text-xl" />}
					/>
				</div>

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
				<CurrencyForm
					t={t}
					formData={formData}
					errors={errors}
					onChange={handleInputChange}
					onToggleBase={checked => setFormData(prev => ({ ...prev, isBaseCurrency: checked }))}
					onCancel={handleCloseModal}
					onSubmit={handleAddCurrency}
					isEditing={!!editingCurrency}
				/>
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
