import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import SlideUpModal from "../components/shared/SlideUpModal";
import ConfirmModal from "../components/shared/ConfirmModal";
import Toggle from "../components/shared/Toggle";
import {
	fetchCurrencies,
	createCurrency,
	updateCurrency,
	deleteCurrency,
	convertToBaseCurrency,
	toggleCurrencyActive,
	setPage,
} from "../store/currenciesSlice";
import Button from "../components/shared/Button";
import { BiPlus } from "react-icons/bi";
import CurrencyHeaderIcon from "../assets/icons/CurrencyHeaderIcon";
import CurrencyForm from "../components/forms/CurrencyForm";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";

const CurrencyPage = () => {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const { currencies, count, page, hasNext, hasPrevious } = useSelector(state => state.currencies);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCurrency, setEditingCurrency] = useState(null);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [currencyToDelete, setCurrencyToDelete] = useState(null);
	const [converterModal, setConverterModal] = useState({ isOpen: false, currency: null });
	const [conversionAmount, setConversionAmount] = useState("100");
	const [localPageSize, setLocalPageSize] = useState(20);

	const [formData, setFormData] = useState({
		code: "",
		name: "",
		symbol: "",
		exchangeRateToBase: "1.0",
		isActive: true,
	});
	const [errors, setErrors] = useState({});

	// Fetch currencies on component mount and when pagination changes
	useEffect(() => {
		dispatch(fetchCurrencies({ page, page_size: localPageSize }));
	}, [dispatch, page, localPageSize]);

	const handlePageChange = useCallback(
		newPage => {
			dispatch(setPage(newPage));
		},
		[dispatch]
	);

	const handlePageSizeChange = useCallback(
		newPageSize => {
			setLocalPageSize(newPageSize);
			dispatch(setPage(1)); // Reset to first page when page size changes
		},
		[dispatch]
	);

	const handleToggleActive = async (currency, newValue) => {
		try {
			await dispatch(toggleCurrencyActive(currency.id)).unwrap();
			toast.success(
				newValue
					? t("currency.messages.activated", { code: currency.code })
					: t("currency.messages.deactivated", { code: currency.code })
			);
		} catch (err) {
			const errorMessage = err?.message || err?.error || t("currency.messages.updateActiveError");

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
			header: t("currency.table.exchangeRateToBase"),
			accessor: "exchange_rate_to_base_currency",
			width: "200px",
			render: value => (
				<span className="text-gray-900">{value !== null && value !== undefined ? value : "1.0"}</span>
			),
		},
		{
			header: t("currency.table.converter"),
			accessor: "id",
			width: "120px",
			render: (value, row) => (
				<Button
					onClick={() => {
						setConverterModal({ isOpen: true, currency: row });
						setConversionAmount("100");
					}}
					className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm shadow-none hover:shadow-none"
					title={t("currency.convert")}
				/>
			),
		},
		{
			header: t("currency.table.active"),
			accessor: "is_active",
			width: "160px",
			render: (value, row) => (
				<div className="flex items-center gap-3">
					<Toggle checked={!!value} onChange={checked => handleToggleActive(row, checked)} />
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
			exchange_rate_to_base_currency: formData.exchangeRateToBase,
			is_active: formData.isActive,
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
			await dispatch(fetchCurrencies({ page, page_size: localPageSize }));
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
			exchangeRateToBase: "1.0",
			isActive: true,
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
			exchangeRateToBase: currency.exchange_rate_to_base_currency || "1.0",
			isActive: currency.is_active !== undefined ? currency.is_active : true,
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

	const handleConvert = async () => {
		if (!conversionAmount || parseFloat(conversionAmount) <= 0) {
			toast.error(t("currency.messages.invalidAmount"));
			return;
		}

		try {
			await dispatch(
				convertToBaseCurrency({
					id: converterModal.currency.id,
					amount: parseFloat(conversionAmount),
				})
			).unwrap();
			setConverterModal({ isOpen: false, currency: null });
			setConversionAmount("100");
			toast.success(t("currency.messages.convertSuccess"));
		} catch (err) {
			const errorMessage = err?.message || err?.error || t("currency.messages.convertError");
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
					onToggleBase={checked => setFormData(prev => ({ ...prev, isActive: checked }))}
					onCancel={handleCloseModal}
					onSubmit={handleAddCurrency}
					isEditing={!!editingCurrency}
				/>
			</SlideUpModal>

			{/* Currency Converter Modal */}
			<SlideUpModal
				isOpen={converterModal.isOpen}
				onClose={() => {
					setConverterModal({ isOpen: false, currency: null });
					setConversionAmount("100");
				}}
				title={t("currency.converter.title")}
				maxWidth="500px"
			>
				<div className="space-y-4">
					<div className="bg-gray-50 p-4 rounded-lg">
						<p className="text-sm text-gray-600">{t("currency.converter.from")}</p>
						<p className="text-lg font-semibold text-gray-900">
							{converterModal.currency?.code} - {converterModal.currency?.name}
						</p>
						<p className="text-sm text-gray-500">
							{t("currency.converter.rate")}:{" "}
							{converterModal.currency?.exchange_rate_to_base_currency || "1.0"}
						</p>
					</div>

					<div>
						<FloatingLabelInput
							label={t("currency.converter.amount")}
							name="conversionAmount"
							type="number"
							step="0.01"
							min="0"
							value={conversionAmount}
							onChange={e => setConversionAmount(e.target.value)}
							placeholder={t("currency.converter.amountPlaceholder")}
						/>
					</div>

					<div className="flex gap-3 pt-4">
						<Button
							onClick={() => {
								setConverterModal({ isOpen: false, currency: null });
								setConversionAmount("100");
							}}
							title={t("currency.modal.cancel")}
							className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 flex-1"
						/>
						<Button onClick={handleConvert} title={t("currency.converter.convert")} className="flex-1" />
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
