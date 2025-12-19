import React from "react";
import FloatingLabelInput from "../shared/FloatingLabelInput";
import Toggle from "../shared/Toggle";
import Button from "../shared/Button";

const CurrencyForm = ({ t, formData, errors, onChange, onToggleBase, onToggleActive, onCancel, onSubmit, isEditing }) => {
	return (
		<div className="flex flex-col gap-6 py-2">
			{/* Currency Code */}
			<FloatingLabelInput
				label={t("currency.modal.codeLabel")}
				name="code"
				value={formData.code}
				onChange={e => onChange("code", e.target.value)}
				error={errors.code}
				required
				placeholder={t("currency.modal.codePlaceholder")}
				maxLength={3}
				disabled={isEditing}
			/>

			{/* Currency Name */}
			<FloatingLabelInput
				label={t("currency.modal.nameLabel")}
				name="name"
				value={formData.name}
				onChange={e => onChange("name", e.target.value)}
				error={errors.name}
				required
				placeholder={t("currency.modal.namePlaceholder")}
			/>

			{/* Symbol */}
			<FloatingLabelInput
				label={t("currency.modal.symbolLabel")}
				name="symbol"
				value={formData.symbol}
				onChange={e => onChange("symbol", e.target.value)}
				error={errors.symbol}
				required
				placeholder={t("currency.modal.symbolPlaceholder")}
			/>

			{/* Exchange Rate to Base */}
			<FloatingLabelInput
				label={t("currency.modal.exchangeRateLabel")}
				name="exchangeRateToBase"
				type="number"
				step="0.0001"
				value={formData.exchangeRateToBase}
				onChange={e => onChange("exchangeRateToBase", e.target.value)}
				error={errors.exchangeRateToBase}
				required
				placeholder={t("currency.modal.exchangeRatePlaceholder")}
			/>

			{/* Active Toggle */}
			<div className="flex items-center gap-3">
				<Toggle checked={formData.isActive} onChange={onToggleActive} />
				<div>
					<p className="text-sm font-semibold text-gray-700">{t("currency.modal.setAsActive")}</p>
					<p className="text-xs text-gray-500">{t("currency.modal.activeDescription")}</p>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<Toggle checked={formData.isBase} onChange={onToggleBase} />
				<div>
					<p className="text-sm font-semibold text-gray-700">{t("currency.modal.setAsBase")}</p>
					<p className="text-xs text-gray-500">{t("currency.modal.baseDescription")}</p>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex gap-3 pt-4 ">
				<Button
					onClick={onCancel}
					title={t("currency.modal.cancel")}
					className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 flex-1"
				/>

				<Button
					onClick={onSubmit}
					title={isEditing ? t("currency.modal.update") : t("currency.modal.create")}
					className="flex-1"
				/>
			</div>
		</div>
	);
};

export default CurrencyForm;
