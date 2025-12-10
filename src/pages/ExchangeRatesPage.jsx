import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import SlideUpModal from "../components/shared/SlideUpModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import ConfirmModal from "../components/shared/ConfirmModal";
import {
	fetchExchangeRates,
	fetchCurrencies,
	createExchangeRate,
	updateExchangeRate,
	deleteExchangeRate,
	convertCurrency,
	clearConversionResult,
} from "../store/exchangeRatesSlice";
import { IoCloseCircleOutline } from "react-icons/io5";
import { TbCaretUpDownFilled } from "react-icons/tb";
import Button from "../components/shared/Button";
import { BiPlusCircle } from "react-icons/bi";
import ExchangeRateForm from "../components/forms/ExchangeRateForm";
import CurrencyConverterForm from "../components/forms/CurrencyConverterForm";
import LoadingSpan from "../components/shared/LoadingSpan";

const INITIAL_FORM_STATE = {
	fromCurrency: "",
	toCurrency: "",
	rateType: "SPOT",
	rate: "",
	effectiveDate: "",
	source: "",
};

const INITIAL_CONVERTER_STATE = {
	amount: "",
	fromCurrency: "",
	toCurrency: "",
	rateDate: new Date().toISOString().split("T")[0],
};

const INITIAL_FILTERS_STATE = {
	fromCurrency: "",
	toCurrency: "",
	rateType: "",
	dateFrom: "",
	dateTo: "",
};

const ExchangeRatesPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	const { rates, currencies, loading, error, conversionResult } = useSelector(state => state.exchangeRates);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [isConverterOpen, setIsConverterOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedRate, setSelectedRate] = useState(null);

	const [formData, setFormData] = useState(INITIAL_FORM_STATE);
	const [errors, setErrors] = useState({});

	// Filter states
	const [filters, setFilters] = useState(INITIAL_FILTERS_STATE);

	// Converter states
	const [converterData, setConverterData] = useState(INITIAL_CONVERTER_STATE);
	const [converterErrors, setConverterErrors] = useState({});

	// Fetch rates and currencies on mount
	useEffect(() => {
		dispatch(fetchExchangeRates());
		dispatch(fetchCurrencies());
	}, [dispatch]);

	// Display error toast
	useEffect(() => {
		if (error) {
			toast.error(error, { autoClose: 5000 });
		}
	}, [error]);

	// Helper to translate Rate Types
	const getRateTypeLabel = type => {
		const key = type?.toUpperCase();
		return t(`exchangeRates.rateTypes.${key}`, type);
	};

	// Transform API data for table display
	const exchangeRates = rates.map(rate => ({
		id: rate.id,
		fromCurrency: rate.from_currency?.code || rate.from_currency_code || "-",
		toCurrency: rate.to_currency?.code || rate.to_currency_code || "-",
		rateType: getRateTypeLabel(rate.rate_type) || "-",
		rate: rate.rate || "-",
		effectiveDate: rate.rate_date || "-",
		source: rate.source || "-",
		status: t("exchangeRates.table.active"),
		rawData: rate,
	}));

	// Table columns
	const columns = [
		{
			header: t("exchangeRates.table.fromCurrency"),
			accessor: "fromCurrency",
		},
		{
			header: t("exchangeRates.table.toCurrency"),
			accessor: "toCurrency",
		},
		{
			header: t("exchangeRates.table.rateType"),
			accessor: "rateType",
			render: value => <span className="font-semibold text-[#28819C]">{value}</span>,
		},
		{
			header: t("exchangeRates.table.exchangeRate"),
			accessor: "rate",
		},
		{
			header: t("exchangeRates.table.effectiveDate"),
			accessor: "effectiveDate",
		},
		{
			header: t("exchangeRates.table.source"),
			accessor: "source",
		},
		{
			header: t("exchangeRates.table.status"),
			accessor: "status",
			render: value => (
				<span
					className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
						value === t("exchangeRates.table.active")
							? "bg-green-100 text-green-800"
							: "bg-gray-100 text-gray-800"
					}`}
				>
					{value}
				</span>
			),
		},
	];

	// Currency options from Redux
	// const currencyCodeOptions = currencies.map(currency => ({
	// 	value: currency.code,
	// 	label: `${currency.code} - ${currency.name}`,
	// }));
	const currencyCodeOptions = useMemo(() => {
		return currencies
			.filter(currency => currency.code)
			.map(currency => ({
				value: currency.code,
				label: `${currency.code} - ${currency.name}`,
			}));
	}, [currencies]);

	// const currencyIdOptions = currencies
	// 	.filter(currency => currency.id !== undefined && currency.id !== null)
	// 	.map(currency => ({
	// 		value: currency.id.toString(),
	// 		label: `${currency.code} - ${currency.name}`,
	// 	}));
	const currencyIdOptions = useMemo(() => {
		return currencies
			.filter(currency => currency.id !== undefined && currency.id !== null)
			.map(currency => ({
				value: currency.id.toString(),
				label: `${currency.code} - ${currency.name}`,
			}));
	}, [currencies]);

	// Rate type options
	// const rateTypeOptions = [
	// 	{ value: "SPOT", label: t("exchangeRates.rateTypes.SPOT") },
	// 	{ value: "CORPORATE", label: t("exchangeRates.rateTypes.CORPORATE") },
	// 	{ value: "USER", label: t("exchangeRates.rateTypes.USER") },
	// 	{ value: "AVERAGE", label: t("exchangeRates.rateTypes.AVERAGE") },
	// ];
	const rateTypeOptions = useMemo(
		() => [
			{ value: "SPOT", label: t("exchangeRates.rateTypes.SPOT") },
			{ value: "CORPORATE", label: t("exchangeRates.rateTypes.CORPORATE") },
			{ value: "USER", label: t("exchangeRates.rateTypes.USER") },
			{ value: "AVERAGE", label: t("exchangeRates.rateTypes.AVERAGE") },
		],
		[t]
	);

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const handleFilterChange = (field, value) => {
		setFilters(prev => ({ ...prev, [field]: value }));
	};

	const handleApplyFilters = () => {
		const filterParams = {
			from_currency: filters.fromCurrency,
			to_currency: filters.toCurrency,
			rate_type: filters.rateType,
			date_from: filters.dateFrom,
			date_to: filters.dateTo,
		};
		dispatch(fetchExchangeRates(filterParams));
		toast.info(t("exchangeRates.messages.filtersApplied"));
	};

	const handleClearFilters = () => {
		setFilters(INITIAL_FILTERS_STATE);
		dispatch(fetchExchangeRates());
		toast.info(t("exchangeRates.messages.filtersCleared"));
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.fromCurrency) {
			newErrors.fromCurrency = t("exchangeRates.validation.fromCurrencyRequired");
		}

		if (!formData.toCurrency) {
			newErrors.toCurrency = t("exchangeRates.validation.toCurrencyRequired");
		}

		if (formData.fromCurrency === formData.toCurrency) {
			newErrors.toCurrency = t("exchangeRates.validation.sameCurrency");
		}

		if (!formData.rateType) {
			newErrors.rateType = t("exchangeRates.validation.rateTypeRequired");
		}

		if (!formData.rate.toString().trim()) {
			newErrors.rate = t("exchangeRates.validation.rateRequired");
		} else if (isNaN(formData.rate) || parseFloat(formData.rate) <= 0) {
			newErrors.rate = t("exchangeRates.validation.ratePositive");
		}

		if (!formData.effectiveDate) {
			newErrors.effectiveDate = t("exchangeRates.validation.effectiveDateRequired");
		}

		if (!formData.source.trim()) {
			newErrors.source = t("exchangeRates.validation.sourceRequired");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleAddExchangeRate = async () => {
		if (!validateForm()) return;

		try {
			const rateData = {
				from_currency: parseInt(formData.fromCurrency, 10),
				to_currency: parseInt(formData.toCurrency, 10),
				rate: parseFloat(formData.rate),
				rate_date: formData.effectiveDate,
				rate_type: formData.rateType || "SPOT",
				source: formData.source,
			};

			if (Number.isNaN(rateData.from_currency) || Number.isNaN(rateData.to_currency)) {
				toast.error(t("exchangeRates.messages.invalidSelection"));
				return;
			}

			if (isEditMode && selectedRate) {
				await dispatch(updateExchangeRate({ id: selectedRate.id, rateData })).unwrap();
				toast.success(t("exchangeRates.messages.updateSuccess"));
			} else {
				await dispatch(createExchangeRate(rateData)).unwrap();
				toast.success(t("exchangeRates.messages.createSuccess"));
			}

			handleCloseModal();
			dispatch(fetchExchangeRates());
		} catch (error) {
			console.error("Failed to save exchange rate:", error);
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setIsEditMode(false);
		setSelectedRate(null);
		setFormData(INITIAL_FORM_STATE);
		setErrors({});
	};

	const handleEdit = row => {
		const rate = row.rawData || row;
		setSelectedRate(rate);
		setIsEditMode(true);
		setFormData({
			fromCurrency:
				rate.from_currency?.id?.toString() || rate.from_currency?.toString() || rate.from_currency || "",
			toCurrency: rate.to_currency?.id?.toString() || rate.to_currency?.toString() || rate.to_currency || "",
			rateType: rate.rate_type || "SPOT",
			rate: rate.rate || "",
			effectiveDate: rate.rate_date || "",
			source: rate.source || "",
		});
		setIsModalOpen(true);
	};

	const handleDelete = row => {
		const rate = row.rawData || row;
		setSelectedRate(rate);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		try {
			await dispatch(deleteExchangeRate(selectedRate.id)).unwrap();
			toast.success(t("exchangeRates.messages.deleteSuccess"));
			setIsDeleteModalOpen(false);
			setSelectedRate(null);
		} catch (error) {
			console.error("Failed to delete exchange rate:", error);
		}
	};

	// Converter handlers
	const validateConverter = () => {
		const newErrors = {};

		if (!converterData.amount.toString().trim()) {
			newErrors.amount = t("exchangeRates.validation.amountRequired");
		} else if (isNaN(converterData.amount) || parseFloat(converterData.amount) <= 0) {
			newErrors.amount = t("exchangeRates.validation.amountPositive");
		}

		if (!converterData.fromCurrency) {
			newErrors.fromCurrency = t("exchangeRates.validation.fromCurrencyRequired");
		}

		if (!converterData.toCurrency) {
			newErrors.toCurrency = t("exchangeRates.validation.toCurrencyRequired");
		}

		if (converterData.fromCurrency === converterData.toCurrency) {
			newErrors.toCurrency = t("exchangeRates.validation.sameCurrency");
		}

		if (!converterData.rateDate) {
			newErrors.rateDate = t("exchangeRates.validation.rateDateRequired");
		}

		setConverterErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleConvert = async () => {
		if (!validateConverter()) return;

		try {
			const conversionData = {
				amount: converterData.amount,
				from_currency_code: converterData.fromCurrency,
				to_currency_code: converterData.toCurrency,
				rate_date: converterData.rateDate,
			};

			await dispatch(convertCurrency(conversionData)).unwrap();
			toast.success(t("exchangeRates.messages.convertSuccess"));
		} catch (error) {
			console.error("Failed to convert currency:", error);
		}
	};

	const handleCloseConverter = () => {
		setIsConverterOpen(false);
		setConverterData(INITIAL_CONVERTER_STATE);
		setConverterErrors({});
		dispatch(clearConversionResult());
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<PageHeader
				title={t("exchangeRates.title")}
				subtitle={t("exchangeRates.subtitle")}
				icon={<IoCloseCircleOutline size={35} color="#28819C" />}
			/>

			<div className="mx-auto px-6 py-8">
				{/* Header with Title and Buttons */}
				<div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
					<h2 className="text-2xl font-bold text-gray-900">{t("exchangeRates.title")}</h2>
					<div className="flex gap-3">
						<Button
							onClick={() => setIsConverterOpen(true)}
							title={t("exchangeRates.actions.currencyConverter")}
							icon={
								<div className="flex items-center justify-center bg-[#28819C] rounded-full p-1">
									<TbCaretUpDownFilled color="white" size={20} />
								</div>
							}
							className="bg-white border border-[#28819C] text-[#28819C] hover:bg-gray-50"
						/>

						<Button
							onClick={() => setIsModalOpen(true)}
							title={t("exchangeRates.actions.addExchangeRate")}
							icon={<BiPlusCircle size={24} />}
						/>
					</div>
				</div>

				{/* Filter Section */}
				<div className="rounded-lg pt-3 pb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
						{/* From Currency Filter */}
						<FloatingLabelSelect
							label={t("exchangeRates.filters.fromCurrency")}
							name="filterFromCurrency"
							value={filters.fromCurrency}
							onChange={e => handleFilterChange("fromCurrency", e.target.value)}
							options={[{ value: "", label: t("exchangeRates.filters.all") }, ...currencyCodeOptions]}
						/>

						{/* To Currency Filter */}
						<FloatingLabelSelect
							label={t("exchangeRates.filters.toCurrency")}
							name="filterToCurrency"
							value={filters.toCurrency}
							onChange={e => handleFilterChange("toCurrency", e.target.value)}
							options={[{ value: "", label: t("exchangeRates.filters.all") }, ...currencyCodeOptions]}
						/>

						{/* Rate Type Filter */}
						<FloatingLabelSelect
							label={t("exchangeRates.filters.rateType")}
							name="filterRateType"
							value={filters.rateType}
							onChange={e => handleFilterChange("rateType", e.target.value)}
							options={[{ value: "", label: t("exchangeRates.filters.all") }, ...rateTypeOptions]}
						/>

						{/* Date From Filter */}
						<FloatingLabelInput
							label={t("exchangeRates.filters.dateFrom")}
							name="filterDateFrom"
							type="date"
							value={filters.dateFrom}
							onChange={e => handleFilterChange("dateFrom", e.target.value)}
						/>

						{/* Date To Filter */}
						<FloatingLabelInput
							label={t("exchangeRates.filters.dateTo")}
							name="filterDateTo"
							type="date"
							value={filters.dateTo}
							onChange={e => handleFilterChange("dateTo", e.target.value)}
						/>
					</div>

					{/* Filter Buttons */}
					<div className="flex justify-end gap-4">
						<Button
							onClick={handleClearFilters}
							title={t("exchangeRates.actions.clearAll")}
							className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
						/>
						<Button onClick={handleApplyFilters} title={t("exchangeRates.actions.applyFilters")} />
					</div>
				</div>

				{/* Table */}
				{loading ? (
					<LoadingSpan />
				) : (
					<Table
						columns={columns}
						data={exchangeRates}
						onEdit={handleEdit}
						onDelete={handleDelete}
						editIcon="edit"
						emptyMessage={t("exchangeRates.table.emptyMessage")}
					/>
				)}
			</div>

			{/* Add/Edit Exchange Rate Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={isEditMode ? t("exchangeRates.modals.editTitle") : t("exchangeRates.modals.addTitle")}
				maxWidth="550px"
			>
				<ExchangeRateForm
					t={t}
					formData={formData}
					errors={errors}
					onChange={handleInputChange}
					onSubmit={handleAddExchangeRate}
					onCancel={handleCloseModal}
					currencyOptions={currencyIdOptions}
					rateTypeOptions={rateTypeOptions}
					isEditMode={isEditMode}
				/>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setSelectedRate(null);
				}}
				onConfirm={handleConfirmDelete}
				title={t("exchangeRates.modals.deleteTitle")}
				message={t("exchangeRates.modals.deleteMessage")}
				confirmText={t("exchangeRates.actions.delete")}
				cancelText={t("exchangeRates.actions.cancel")}
			/>

			{/* Currency Converter Modal */}

			<SlideUpModal
				isOpen={isConverterOpen}
				onClose={handleCloseConverter}
				title={t("exchangeRates.modals.converterTitle")}
				maxWidth="550px"
			>
				<CurrencyConverterForm
					t={t}
					data={converterData}
					errors={converterErrors}
					result={conversionResult}
					onChange={(field, value) => {
						setConverterData(prev => ({ ...prev, [field]: value }));

						if (converterErrors[field]) {
							setConverterErrors(prev => ({ ...prev, [field]: "" }));
						}
					}}
					onClose={handleCloseConverter}
					onConvert={handleConvert}
					currencyOptions={currencyCodeOptions}
				/>
			</SlideUpModal>

			{/* Toast Container */}
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
		</div>
	);
};

export default ExchangeRatesPage;
