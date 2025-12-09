import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { IoClose, IoDocumentTextOutline } from "react-icons/io5";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import FloatingLabelInput from "../../../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../../../components/shared/FloatingLabelSelect";
import DecorationPattern from "../../../ui/DecorationPattern";

function NewRequisition() {
	const { t } = useTranslation();
	const [formData, setFormData] = useState({
		assetNumber: "",
		costCenter: "",
		project: "",
		priority: "",
		prType: "",
		businessJustification: "",
		description: "",
	});

	const [lineItems, setLineItems] = useState([
		{
			id: 1,
			itemType: "",
			quantity: "",
			uom: "",
			estimatedUnitPrice: "",
			needByDate: "",
			specification: "",
			description: "",
		},
	]);

	const [attachments, setAttachments] = useState([]);
	const [additionalNotes, setAdditionalNotes] = useState("");

	const costCenterOptions = [
		{ value: "", label: t("requisitions.newRequisition.selectCostCenter") },
		{ value: "IT-001", label: "IT-001" },
		{ value: "HR-001", label: "HR-001" },
		{ value: "FIN-001", label: "FIN-001" },
	];

	const projectOptions = [
		{ value: "", label: t("requisitions.newRequisition.selectProject") },
		{ value: "project1", label: "Project 1" },
		{ value: "project2", label: "Project 2" },
		{ value: "project3", label: "Project 3" },
	];

	const priorityOptions = [
		{ value: "", label: t("requisitions.newRequisition.selectPriority") },
		{ value: "high", label: t("requisitions.newRequisition.priorities.high") },
		{ value: "normal", label: t("requisitions.newRequisition.priorities.normal") },
		{ value: "low", label: t("requisitions.newRequisition.priorities.low") },
	];

	const prTypeOptions = [
		{ value: "", label: t("requisitions.newRequisition.selectPRType") },
		{ value: "goods", label: t("requisitions.newRequisition.prTypes.goods") },
		{ value: "services", label: t("requisitions.newRequisition.prTypes.services") },
		{ value: "both", label: t("requisitions.newRequisition.prTypes.both") },
	];

	const itemTypeOptions = [
		{ value: "", label: t("requisitions.newRequisition.selectItemType") },
		{ value: "material", label: t("requisitions.newRequisition.itemTypes.material") },
		{ value: "service", label: t("requisitions.newRequisition.itemTypes.service") },
		{ value: "asset", label: t("requisitions.newRequisition.itemTypes.asset") },
	];

	const uomOptions = [
		{ value: "", label: t("requisitions.newRequisition.selectUoM") },
		{ value: "pcs", label: t("requisitions.newRequisition.uomTypes.pieces") },
		{ value: "kg", label: t("requisitions.newRequisition.uomTypes.kilograms") },
		{ value: "ltr", label: t("requisitions.newRequisition.uomTypes.liters") },
		{ value: "box", label: t("requisitions.newRequisition.uomTypes.box") },
		{ value: "set", label: t("requisitions.newRequisition.uomTypes.set") },
	];

	const handleInputChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSelectChange = (name, value) => {
		setFormData(prev => ({
			...prev,
			[name]: value,
		}));
	};

	const handleCheckBudget = () => {
		console.log("Check budget", formData);
		// Add budget check logic here
	};

	const handleAddLineItem = () => {
		const newLineItem = {
			id: lineItems.length + 1,
			itemType: "",
			quantity: "",
			uom: "",
			estimatedUnitPrice: "",
			needByDate: "",
			specification: "",
			description: "",
		};
		setLineItems([...lineItems, newLineItem]);
	};

	const handleDeleteLineItem = id => {
		if (lineItems.length > 1) {
			setLineItems(lineItems.filter(item => item.id !== id));
		}
	};

	const handleLineItemChange = (id, field, value) => {
		setLineItems(lineItems.map(item => (item.id === id ? { ...item, [field]: value } : item)));
	};

	const calculateLineTotal = item => {
		const quantity = parseFloat(item.quantity) || 0;
		const price = parseFloat(item.estimatedUnitPrice) || 0;
		return (quantity * price).toFixed(2);
	};

	const calculateTotalEstimatedAmount = () => {
		return lineItems
			.reduce((total, item) => {
				const lineTotal = parseFloat(calculateLineTotal(item)) || 0;
				return total + lineTotal;
			}, 0)
			.toFixed(2);
	};

	const handleFileUpload = e => {
		const files = Array.from(e.target.files);
		setAttachments([...attachments, ...files]);
	};

	const handleRemoveAttachment = index => {
		setAttachments(attachments.filter((_, i) => i !== index));
	};

	return (
		<div className="w-full relative">
			{/* Requisition Details*/}
			<div className=" space-y-4  flex flex-col gap-2">
				<h3 className="text-lg font-medium text-[#006F86] mb-4">
					{t("requisitions.newRequisition.requisitionDetails")}
				</h3>
				<FloatingLabelInput
					id="assetNumber"
					name="assetNumber"
					label={t("requisitions.newRequisition.assetNumber")}
					value={formData.assetNumber}
					onChange={handleInputChange}
					placeholder={t("requisitions.newRequisition.enterAssetNumber")}
				/>
				{/* Cost Center and Project Row */}
				<div className="grid grid-cols-2 gap-4">
					<FloatingLabelSelect
						id="costCenter"
						name="costCenter"
						label={t("requisitions.newRequisition.costCenter")}
						value={formData.costCenter}
						onChange={e => handleSelectChange("costCenter", e.target.value)}
						options={costCenterOptions}
					/>
					<FloatingLabelSelect
						id="project"
						name="project"
						label={t("requisitions.newRequisition.project")}
						value={formData.project}
						onChange={e => handleSelectChange("project", e.target.value)}
						options={projectOptions}
					/>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<FloatingLabelSelect
						id="priority"
						name="priority"
						label={t("requisitions.newRequisition.priority")}
						value={formData.priority}
						onChange={e => handleSelectChange("priority", e.target.value)}
						options={priorityOptions}
					/>
					<FloatingLabelSelect
						id="prType"
						name="prType"
						label={t("requisitions.newRequisition.prType")}
						value={formData.prType}
						onChange={e => handleSelectChange("prType", e.target.value)}
						options={prTypeOptions}
					/>
				</div>
				<FloatingLabelInput
					id="businessJustification"
					name="businessJustification"
					label={t("requisitions.newRequisition.businessJustification")}
					value={formData.businessJustification}
					onChange={handleInputChange}
					placeholder={t("requisitions.newRequisition.businessJustification")}
					inputClassName="rounded-lg"
				/>
				{/* Description Textarea */}
				<div className="relative">
					<textarea
						id="description"
						name="description"
						value={formData.description}
						onChange={handleInputChange}
						placeholder=" "
						rows="5"
						className="peer w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28819C] focus:border-transparent transition-all resize-none bg-white"
					/>
					<label
						htmlFor="description"
						className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#28819C]"
					>
						{t("requisitions.newRequisition.description")}
					</label>
				</div>
				{/* Check Budget Button */}
				<button
					onClick={handleCheckBudget}
					className="w-full bg-[#28819C] text-white py-3 rounded-lg hover:bg-[#206b82] transition-colors font-medium text-base shadow-md hover:shadow-lg justify-center flex items-center gap-2"
				>
					<span>{t("requisitions.newRequisition.checkBudget")}</span>
				</button>
			</div>

			{/* Line Items Section */}
			<div className="mt-8 gap-8 flex flex-col">
				{/* Header with Add Line Button */}
				<div className="flex justify-between items-center">
					<h3 className="text-lg font-medium text-[#28819C]">{t("requisitions.newRequisition.lineItems")}</h3>
					<button
						onClick={handleAddLineItem}
						className="flex items-center gap-2 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b82] transition-colors text-sm font-medium"
					>
						<FiPlus size={18} />
						{t("requisitions.newRequisition.addLine")}
					</button>
				</div>

				<div>
					{lineItems.map((item, index) => (
						<div key={item.id} className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-6 relative">
							{/* Line Item Header */}
							<div className="flex justify-between items-center mb-4">
								<h4 className="text-base font-medium text-gray-700">
									{t("requisitions.newRequisition.lineItem")} {index + 1}
								</h4>
								{lineItems.length > 1 && (
									<button
										onClick={() => handleDeleteLineItem(item.id)}
										className="text-red-500 hover:text-red-700 transition-colors"
									>
										<FiTrash2 size={20} />
									</button>
								)}
							</div>

							{/* Item Type */}
							<div className="mb-4">
								<FloatingLabelSelect
									id={`itemType-${item.id}`}
									name={`itemType-${item.id}`}
									label={t("requisitions.newRequisition.itemType")}
									value={item.itemType}
									onChange={e => handleLineItemChange(item.id, "itemType", e.target.value)}
									options={itemTypeOptions}
								/>
							</div>

							{/* Quantity and UoM Row */}
							<div className="grid grid-cols-2 gap-4 mb-4">
								<FloatingLabelInput
									id={`quantity-${item.id}`}
									name={`quantity-${item.id}`}
									label={t("requisitions.newRequisition.quantity")}
									type="number"
									value={item.quantity}
									onChange={e => handleLineItemChange(item.id, "quantity", e.target.value)}
									placeholder={t("requisitions.newRequisition.enterQuantity")}
								/>
								<FloatingLabelSelect
									id={`uom-${item.id}`}
									name={`uom-${item.id}`}
									label={t("requisitions.newRequisition.uom")}
									value={item.uom}
									onChange={e => handleLineItemChange(item.id, "uom", e.target.value)}
									options={uomOptions}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4 mb-4">
								<FloatingLabelInput
									id={`estimatedUnitPrice-${item.id}`}
									name={`estimatedUnitPrice-${item.id}`}
									label={t("requisitions.newRequisition.estimatedUnitPrice")}
									type="number"
									value={item.estimatedUnitPrice}
									onChange={e => handleLineItemChange(item.id, "estimatedUnitPrice", e.target.value)}
									placeholder={t("requisitions.newRequisition.enterPrice")}
								/>
								<FloatingLabelInput
									id={`needByDate-${item.id}`}
									name={`needByDate-${item.id}`}
									label={t("requisitions.newRequisition.needByDate")}
									type="date"
									value={item.needByDate}
									onChange={e => handleLineItemChange(item.id, "needByDate", e.target.value)}
								/>
							</div>

							{/* Specification */}
							<div className="mb-4">
								<div className="relative">
									<textarea
										id={`specification-${item.id}`}
										name={`specification-${item.id}`}
										value={item.specification}
										onChange={e => handleLineItemChange(item.id, "specification", e.target.value)}
										placeholder=" "
										rows="3"
										className="peer w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28819C] focus:border-transparent transition-all resize-none bg-white"
									/>
									<label
										htmlFor={`specification-${item.id}`}
										className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#28819C]"
									>
										{t("requisitions.newRequisition.specification")}
									</label>
								</div>
							</div>

							{/* Description */}
							<div className="mb-4">
								<div className="relative">
									<textarea
										id={`lineDescription-${item.id}`}
										name={`lineDescription-${item.id}`}
										value={item.description}
										onChange={e => handleLineItemChange(item.id, "description", e.target.value)}
										placeholder=" "
										rows="3"
										className="peer w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28819C] focus:border-transparent transition-all resize-none bg-white"
									/>
									<label
										htmlFor={`lineDescription-${item.id}`}
										className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#28819C]"
									>
										{t("requisitions.newRequisition.description")}
									</label>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4 mb-4">
								<FloatingLabelInput
									id={`Total-${item.id}`}
									name={`Total-${item.id}`}
									label={t("requisitions.newRequisition.lineTotal")}
									disabled
									value={`$${calculateLineTotal(item)}`}
									labelClassName="text-gray-500"
									inputClassName="bg-white shadow-none cursor-default border-gray-300 border-1 focus:ring-0 focus:border-gray-300 font-medium"
								/>
							</div>
						</div>
					))}
				</div>

				<div className="flex justify-end mt-6">
					<div className="bg-white border border-gray-200 rounded-lg p-4 ">
						<div className="flex flex-col">
							<span className="text-base text-gray-600">
								{t("requisitions.newRequisition.totalEstimatedAmount")}
							</span>
							<span className="text-2xl font-bold text-[#28819C]">
								${calculateTotalEstimatedAmount()}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Attachments Section */}
			<div className="mt-8 space-y-4">
				<div className="flex justify-between items-center">
					<h3 className="text-lg font-medium text-[#28819C]">
						{t("requisitions.newRequisition.attachments")} ({attachments.length})
					</h3>
					<label className="flex items-center gap-2 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b82] transition-colors text-sm font-medium cursor-pointer">
						<FiPlus size={18} />
						{t("requisitions.newRequisition.addFile")}
						<input type="file" multiple onChange={handleFileUpload} className="hidden" />
					</label>
				</div>

				<div className="bg-[#F9FAFB] border border-gray-200 rounded-lg p-8 min-h-[200px] flex flex-col items-center justify-center">
					{attachments.length === 0 ? (
						<>
							<IoDocumentTextOutline className="text-gray-400 mb-4" size={48} />
							<p className="text-gray-700 font-medium mb-1">
								{t("requisitions.newRequisition.noFilesAttached")}
							</p>
							<p className="text-gray-500 text-sm">
								{t("requisitions.newRequisition.filesLinkedOnSave")}
							</p>
						</>
					) : (
						<div className="w-full space-y-2">
							{attachments.map((file, index) => (
								<div
									key={index}
									className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
								>
									<div className="flex items-center gap-3">
										<IoDocumentTextOutline className="text-[#28819C]" size={24} />
										<span className="text-sm text-gray-700">{file.name}</span>
									</div>
									<button
										onClick={() => handleRemoveAttachment(index)}
										className="text-red-500 hover:text-red-700 transition-colors"
									>
										<FiTrash2 size={18} />
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Additional Notes Section */}
			<div className="mt-8 space-y-4">
				<div className="relative">
					<textarea
						id="additionalNotes"
						name="additionalNotes"
						value={additionalNotes}
						onChange={e => setAdditionalNotes(e.target.value)}
						placeholder=" "
						rows="6"
						className="peer w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28819C] focus:border-transparent transition-all resize-none bg-white"
					/>
					<label
						htmlFor="additionalNotes"
						className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#28819C]"
					>
						{t("requisitions.newRequisition.additionalNotes")}
					</label>
				</div>
			</div>

			<div className="absolute bottom-100 left-[-200px] pointer-events-none">
				<DecorationPattern />
			</div>
			<div className="absolute bottom-110 left-[-250px] pointer-events-none">
				<DecorationPattern />
			</div>
			{/* Action Buttons */}
			<div className="mt-8 flex justify-end gap-4">
				<button className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
					{t("requisitions.newRequisition.cancel")}
				</button>
				<button className="px-6 py-2.5 bg-[#28819C] text-white rounded-lg hover:bg-[#206b82] transition-colors font-medium">
					{t("requisitions.newRequisition.createAsset")}
				</button>
			</div>
			<div className="absolute bottom-0 left-0 pointer-events-none">
				<DecorationPattern />
			</div>
		</div>
	);
}

export default NewRequisition;
