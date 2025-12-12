import React from "react";
import { FiTrash2 } from "react-icons/fi";
import FloatingLabelInput from "./shared/FloatingLabelInput";
import FloatingLabelSelect from "./shared/FloatingLabelSelect";
import Button from "./shared/Button";

function LineItemCard({
	item,
	index,
	lineItemsLength,
	t,
	itemTypeOptions,
	uomOptions,
	onDelete,
	onChange,
	calculateLineTotal,
}) {
	return (
		<div className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-6 relative">
			{/* Header */}
			<div className="flex justify-between items-center mb-4">
				<h4 className="text-base font-medium text-gray-700">
					{t("requisitions.newRequisition.lineItem")} {index + 1}
				</h4>
				{lineItemsLength > 1 && (
					<Button
						onClick={() => onDelete(item.id)}
						className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-300"
						icon={<FiTrash2 size={18} />}
					/>
				)}
			</div>

			{/* Item Type */}
			<div className="mb-4">
				<FloatingLabelSelect
					id={`itemType-${item.id}`}
					label={t("requisitions.newRequisition.itemType")}
					value={item.itemType}
					onChange={e => onChange(item.id, "itemType", e.target.value)}
					options={itemTypeOptions}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4 mb-4">
				<FloatingLabelInput
					id={`quantity-${item.id}`}
					label={t("requisitions.newRequisition.quantity")}
					type="number"
					value={item.quantity}
					onChange={e => onChange(item.id, "quantity", e.target.value)}
				/>
				<FloatingLabelSelect
					id={`uom-${item.id}`}
					label={t("requisitions.newRequisition.uom")}
					value={item.uom}
					onChange={e => onChange(item.id, "uom", e.target.value)}
					options={uomOptions}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4 mb-4">
				<FloatingLabelInput
					id={`estimatedUnitPrice-${item.id}`}
					label={t("requisitions.newRequisition.estimatedUnitPrice")}
					type="number"
					value={item.estimatedUnitPrice}
					onChange={e => onChange(item.id, "estimatedUnitPrice", e.target.value)}
				/>
				<FloatingLabelInput
					id={`needByDate-${item.id}`}
					label={t("requisitions.newRequisition.needByDate")}
					type="date"
					value={item.needByDate}
					onChange={e => onChange(item.id, "needByDate", e.target.value)}
				/>
			</div>

			{/* Specification */}
			<div className="mb-4">
				<textarea
					value={item.specification}
					onChange={e => onChange(item.id, "specification", e.target.value)}
					rows="3"
					className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none bg-white"
					placeholder={t("requisitions.newRequisition.specification")}
				/>
			</div>

			{/* Description */}
			<div className="mb-4">
				<textarea
					value={item.description}
					onChange={e => onChange(item.id, "description", e.target.value)}
					rows="3"
					className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none bg-white"
					placeholder={t("requisitions.newRequisition.description")}
				/>
			</div>

			{/* Total */}
			<div className="grid grid-cols-2 gap-4 mb-4">
				<FloatingLabelInput
					id={`total-${item.id}`}
					label={t("requisitions.newRequisition.lineTotal")}
					disabled
					value={`$${calculateLineTotal(item)}`}
				/>
			</div>
		</div>
	);
}

export default LineItemCard;
