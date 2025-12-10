import React from "react";
import FloatingLabelInput from "../shared/FloatingLabelInput";
import FloatingLabelSelect from "../shared/FloatingLabelSelect";
import Button from "../shared/Button";

const ExchangeRateForm = ({
	t,
	formData,
	errors = {},
	onChange,
	onSubmit,
	onCancel,
	currencyOptions = [],
	rateTypeOptions = [],
	isEditMode = false,
}) => {
	const handleChange = (field, value) => {
		if (onChange) onChange(field, value);
	};

	return (
		<div className="space-y-6">
			{/* From Currency */}
			<FloatingLabelSelect
				label={t("exchangeRates.table.fromCurrency")}
				name="fromCurrency"
				value={formData.fromCurrency}
				onChange={e => handleChange("fromCurrency", e.target.value)}
				error={errors.fromCurrency}
				options={currencyOptions}
				required
			/>

			{/* To Currency */}
			<FloatingLabelSelect
				label={t("exchangeRates.table.toCurrency")}
				name="toCurrency"
				value={formData.toCurrency}
				onChange={e => handleChange("toCurrency", e.target.value)}
				error={errors.toCurrency}
				options={currencyOptions}
				required
			/>

			{/* Rate Type */}
			<FloatingLabelSelect
				label={t("exchangeRates.table.rateType")}
				name="rateType"
				value={formData.rateType}
				onChange={e => handleChange("rateType", e.target.value)}
				error={errors.rateType}
				options={rateTypeOptions}
				required
			/>

			{/* Exchange Rate */}
			<FloatingLabelInput
				label={t("exchangeRates.table.exchangeRate")}
				name="rate"
				type="number"
				step="0.0001"
				value={formData.rate}
				onChange={e => handleChange("rate", e.target.value)}
				error={errors.rate}
				required
				placeholder={t("exchangeRates.form.placeholders.rate")}
			/>

			{/* Effective Date */}
			<FloatingLabelInput
				label={t("exchangeRates.table.effectiveDate")}
				name="effectiveDate"
				type="date"
				value={formData.effectiveDate}
				onChange={e => handleChange("effectiveDate", e.target.value)}
				error={errors.effectiveDate}
				required
			/>

			{/* Source */}
			<FloatingLabelInput
				label={t("exchangeRates.table.source")}
				name="source"
				value={formData.source}
				onChange={e => handleChange("source", e.target.value)}
				error={errors.source}
				required
				placeholder={t("exchangeRates.form.placeholders.source")}
			/>

			{/* Action Buttons */}
			<div className="flex gap-3 pt-4">
				<Button
					onClick={onCancel}
					title={t("exchangeRates.actions.cancel")}
					className="bg-white border border-[#28819C] text-[#28819C] hover:bg-gray-50 flex-1"
				/>
				<Button
					onClick={onSubmit}
					title={isEditMode ? t("exchangeRates.actions.update") : t("exchangeRates.actions.create")}
					className="bg-[#28819C] hover:bg-[#206b85] text-white flex-1"
				/>
			</div>
		</div>
	);
};

export default ExchangeRateForm;
