import React from "react";
import FloatingLabelInput from "../shared/FloatingLabelInput";
import FloatingLabelSelect from "../shared/FloatingLabelSelect";

const CurrencyConverterForm = ({
	t,
	data,
	errors = {},
	onChange,
	onClose,
	onConvert,
	currencyOptions = [],
	result = null,
}) => {
	const handleChange = (field, value) => {
		if (onChange) onChange(field, value);
	};

	return (
		<div className="flex flex-col gap-6">
			{/* Amount */}
			<FloatingLabelInput
				label={t("exchangeRates.form.amount")}
				name="amount"
				type="number"
				step="0.01"
				value={data.amount}
				onChange={e => handleChange("amount", e.target.value)}
				error={errors.amount}
				required
				placeholder={t("exchangeRates.form.placeholders.amount")}
			/>

			{/* From Currency */}
			<FloatingLabelSelect
				label={t("exchangeRates.table.fromCurrency")}
				name="fromCurrency"
				value={data.fromCurrency}
				onChange={e => handleChange("fromCurrency", e.target.value)}
				error={errors.fromCurrency}
				options={currencyOptions}
				required
			/>

			{/* To Currency */}
			<FloatingLabelSelect
				label={t("exchangeRates.table.toCurrency")}
				name="toCurrency"
				value={data.toCurrency}
				onChange={e => handleChange("toCurrency", e.target.value)}
				error={errors.toCurrency}
				options={currencyOptions}
				required
			/>

			{/* Rate Date */}
			<FloatingLabelInput
				label={t("exchangeRates.form.rateDate")}
				name="rateDate"
				type="date"
				value={data.rateDate}
				onChange={e => handleChange("rateDate", e.target.value)}
				error={errors.rateDate}
				required
			/>

			{/* Conversion Result */}
			{result && (
				<div className="bg-green-50 border border-green-200 rounded-lg p-4">
					<p className="text-sm text-green-800 mb-2">{t("exchangeRates.converter.resultTitle")}:</p>
					<div className="space-y-1">
						<p className="text-lg font-semibold text-green-900" dir="ltr">
							{data.amount} {data.fromCurrency} = {result.converted_amount} {data.toCurrency}
						</p>
						<div className="flex gap-4">
							<p className="text-sm text-green-700">
								{t("exchangeRates.converter.exchangeRate")}: {result.rate}
							</p>
							<p className="text-sm text-green-600">
								{t("exchangeRates.converter.rateDate")}: {result.rate_date || data.rateDate}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Action Buttons */}
			<div className="flex gap-3 pt-4">
				<button
					onClick={onClose}
					className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
				>
					{t("exchangeRates.actions.close")}
				</button>

				<button
					onClick={onConvert}
					className="flex-1 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium"
				>
					{t("exchangeRates.actions.convert")}
				</button>
			</div>
		</div>
	);
};

export default CurrencyConverterForm;
