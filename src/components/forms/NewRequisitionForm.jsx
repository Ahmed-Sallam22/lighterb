import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus } from 'react-icons/fi';
import FloatingLabelInput from '../shared/FloatingLabelInput';
import FloatingLabelSelect from '../shared/FloatingLabelSelect';
import DecorationPattern from '../../ui/DecorationPattern';
import Button from '../shared/Button';
import FloatingLabelTextarea from '../shared/FloatingLabelTextarea';
import LineItemCard from '../LineItemCard';
import AttachmentsSection from '../AttachmentsSection';

// Move static data outside component to prevent recreation
const COST_CENTER_OPTIONS = [
	{ value: 'IT-001', label: 'IT-001' },
	{ value: 'HR-001', label: 'HR-001' },
	{ value: 'FIN-001', label: 'FIN-001' },
];

const PROJECT_OPTIONS = [
	{ value: 'project1', label: 'Project 1' },
	{ value: 'project2', label: 'Project 2' },
	{ value: 'project3', label: 'Project 3' },
];

// Helper to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Initial line item factory
const createLineItem = () => ({
	id: generateId(),
	itemType: '',
	quantity: '',
	uom: '',
	estimatedUnitPrice: '',
	needByDate: '',
	specification: '',
	description: '',
});

function NewRequisition({ onClose, onSubmit }) {
	const { t } = useTranslation();

	const [formData, setFormData] = useState({
		assetNumber: '',
		costCenter: '',
		project: '',
		priority: '',
		prType: '',
		businessJustification: '',
		description: '',
	});

	const [lineItems, setLineItems] = useState([createLineItem()]);
	const [attachments, setAttachments] = useState([]);
	const [additionalNotes, setAdditionalNotes] = useState('');
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Memoize options with translations
	const costCenterOptions = useMemo(
		() => [{ value: '', label: t('requisitions.newRequisition.selectCostCenter') }, ...COST_CENTER_OPTIONS],
		[t]
	);

	const projectOptions = useMemo(
		() => [{ value: '', label: t('requisitions.newRequisition.selectProject') }, ...PROJECT_OPTIONS],
		[t]
	);

	const priorityOptions = useMemo(
		() => [
			{ value: '', label: t('requisitions.newRequisition.selectPriority') },
			{ value: 'high', label: t('requisitions.newRequisition.priorities.high') },
			{ value: 'normal', label: t('requisitions.newRequisition.priorities.normal') },
			{ value: 'low', label: t('requisitions.newRequisition.priorities.low') },
		],
		[t]
	);

	const prTypeOptions = useMemo(
		() => [
			{ value: '', label: t('requisitions.newRequisition.selectPRType') },
			{ value: 'goods', label: t('requisitions.newRequisition.prTypes.goods') },
			{ value: 'services', label: t('requisitions.newRequisition.prTypes.services') },
			{ value: 'both', label: t('requisitions.newRequisition.prTypes.both') },
		],
		[t]
	);

	const itemTypeOptions = useMemo(
		() => [
			{ value: '', label: t('requisitions.newRequisition.selectItemType') },
			{ value: 'material', label: t('requisitions.newRequisition.itemTypes.material') },
			{ value: 'service', label: t('requisitions.newRequisition.itemTypes.service') },
			{ value: 'asset', label: t('requisitions.newRequisition.itemTypes.asset') },
		],
		[t]
	);

	const uomOptions = useMemo(
		() => [
			{ value: '', label: t('requisitions.newRequisition.selectUoM') },
			{ value: 'pcs', label: t('requisitions.newRequisition.uomTypes.pieces') },
			{ value: 'kg', label: t('requisitions.newRequisition.uomTypes.kilograms') },
			{ value: 'ltr', label: t('requisitions.newRequisition.uomTypes.liters') },
			{ value: 'box', label: t('requisitions.newRequisition.uomTypes.box') },
			{ value: 'set', label: t('requisitions.newRequisition.uomTypes.set') },
		],
		[t]
	);

	// Validation function
	const validateForm = useCallback(() => {
		const newErrors = {};

		if (!formData.costCenter) {
			newErrors.costCenter = t('requisitions.newRequisition.errors.costCenterRequired');
		}
		if (!formData.priority) {
			newErrors.priority = t('requisitions.newRequisition.errors.priorityRequired');
		}
		if (!formData.prType) {
			newErrors.prType = t('requisitions.newRequisition.errors.prTypeRequired');
		}

		// Validate line items
		const hasValidLineItem = lineItems.some(item => item.itemType && item.quantity && item.estimatedUnitPrice);

		if (!hasValidLineItem) {
			newErrors.lineItems = t('requisitions.newRequisition.errors.atLeastOneLineItem');
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}, [formData, lineItems, t]);

	const handleInputChange = useCallback(
		e => {
			const { name, value } = e.target;
			setFormData(prev => ({ ...prev, [name]: value }));
			// Clear error for this field
			if (errors[name]) {
				setErrors(prev => ({ ...prev, [name]: undefined }));
			}
		},
		[errors]
	);

	const handleSelectChange = useCallback(
		(name, value) => {
			setFormData(prev => ({ ...prev, [name]: value }));
			if (errors[name]) {
				setErrors(prev => ({ ...prev, [name]: undefined }));
			}
		},
		[errors]
	);

	const handleCheckBudget = useCallback(() => {
		// TODO: Implement budget check
		console.log('Checking budget for:', formData);
	}, [formData]);

	const handleAddLineItem = useCallback(() => {
		setLineItems(prev => [...prev, createLineItem()]);
	}, []);

	const handleDeleteLineItem = useCallback(id => {
		setLineItems(prev => {
			if (prev.length <= 1) return prev;
			return prev.filter(item => item.id !== id);
		});
	}, []);

	const handleLineItemChange = useCallback((id, field, value) => {
		setLineItems(prev => prev.map(item => (item.id === id ? { ...item, [field]: value } : item)));
	}, []);

	const calculateLineTotal = useCallback(item => {
		const quantity = parseFloat(item.quantity) || 0;
		const price = parseFloat(item.estimatedUnitPrice) || 0;
		return (quantity * price).toFixed(2);
	}, []);

	// Memoize total calculation
	const totalEstimatedAmount = useMemo(() => {
		return lineItems
			.reduce((total, item) => {
				const lineTotal = parseFloat(calculateLineTotal(item)) || 0;
				return total + lineTotal;
			}, 0)
			.toFixed(2);
	}, [lineItems, calculateLineTotal]);

	const handleFileUpload = useCallback(e => {
		const files = Array.from(e.target.files);
		setAttachments(prev => [...prev, ...files]);
	}, []);

	const handleRemoveAttachment = useCallback(index => {
		setAttachments(prev => prev.filter((_, i) => i !== index));
	}, []);

	const handleSubmit = useCallback(
		async e => {
			e.preventDefault();

			if (!validateForm()) {
				return;
			}

			setIsSubmitting(true);
			try {
				const requisitionData = {
					...formData,
					lineItems,
					attachments,
					additionalNotes,
					totalAmount: totalEstimatedAmount,
				};

				await onSubmit?.(requisitionData);
				onClose();
			} catch (error) {
				console.error('Error submitting requisition:', error);
				setErrors({ submit: t('requisitions.newRequisition.errors.submitFailed') });
			} finally {
				setIsSubmitting(false);
			}
		},
		[formData, lineItems, attachments, additionalNotes, totalEstimatedAmount, validateForm, onSubmit, onClose, t]
	);

	return (
		<form onSubmit={handleSubmit} className="w-full relative">
			{/* Error Summary */}
			{errors.submit && (
				<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{errors.submit}</div>
			)}

			{/* Requisition Details */}
			<div className="space-y-4 flex flex-col gap-2">
				<h3 className="text-lg font-medium text-[#006F86] mb-4">
					{t('requisitions.newRequisition.requisitionDetails')}
				</h3>

				<FloatingLabelInput
					id="assetNumber"
					name="assetNumber"
					label={t('requisitions.newRequisition.assetNumber')}
					value={formData.assetNumber}
					onChange={handleInputChange}
					placeholder={t('requisitions.newRequisition.enterAssetNumber')}
				/>

				<div className="grid grid-cols-2 gap-4">
					<FloatingLabelSelect
						id="costCenter"
						name="costCenter"
						label={t('requisitions.newRequisition.costCenter')}
						value={formData.costCenter}
						onChange={e => handleSelectChange('costCenter', e.target.value)}
						options={costCenterOptions}
						error={errors.costCenter}
					/>
					<FloatingLabelSelect
						id="project"
						name="project"
						label={t('requisitions.newRequisition.project')}
						value={formData.project}
						onChange={e => handleSelectChange('project', e.target.value)}
						options={projectOptions}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<FloatingLabelSelect
						id="priority"
						name="priority"
						label={t('requisitions.newRequisition.priority')}
						value={formData.priority}
						onChange={e => handleSelectChange('priority', e.target.value)}
						options={priorityOptions}
						error={errors.priority}
					/>
					<FloatingLabelSelect
						id="prType"
						name="prType"
						label={t('requisitions.newRequisition.prType')}
						value={formData.prType}
						onChange={e => handleSelectChange('prType', e.target.value)}
						options={prTypeOptions}
						error={errors.prType}
					/>
				</div>

				<FloatingLabelInput
					id="businessJustification"
					name="businessJustification"
					label={t('requisitions.newRequisition.businessJustification')}
					value={formData.businessJustification}
					onChange={handleInputChange}
					placeholder={t('requisitions.newRequisition.businessJustification')}
					inputClassName="rounded-lg"
				/>

				<FloatingLabelTextarea
					id="description"
					name="description"
					value={formData.description}
					onChange={handleInputChange}
					label={t('requisitions.newRequisition.description')}
					rows={5}
				/>

				<Button
					type="button"
					onClick={handleCheckBudget}
					title={t('requisitions.newRequisition.checkBudget')}
					className="w-full bg-[#28819C] hover:bg-[#206b82] py-3 rounded-lg transition-colors font-medium text-base shadow-md hover:shadow-lg justify-center"
				/>
			</div>

			{/* Line Items Section */}
			<div className="mt-8 gap-8 flex flex-col">
				<div className="flex justify-between items-center">
					<h3 className="text-lg font-medium text-[#28819C]">{t('requisitions.newRequisition.lineItems')}</h3>
					<Button
						type="button"
						onClick={handleAddLineItem}
						title={t('requisitions.newRequisition.addLine')}
						icon={<FiPlus size={18} />}
					/>
				</div>

				{errors.lineItems && (
					<div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
						{errors.lineItems}
					</div>
				)}

				<div>
					{lineItems.map((item, index) => (
						<LineItemCard
							key={item.id}
							item={item}
							index={index}
							lineItemsLength={lineItems.length}
							t={t}
							itemTypeOptions={itemTypeOptions}
							uomOptions={uomOptions}
							onDelete={handleDeleteLineItem}
							onChange={handleLineItemChange}
							calculateLineTotal={calculateLineTotal}
						/>
					))}
				</div>

				<div className="flex justify-end mt-6">
					<div className="bg-white border border-gray-200 rounded-lg p-4">
						<div className="flex flex-col">
							<span className="text-base text-gray-600">
								{t('requisitions.newRequisition.totalEstimatedAmount')}
							</span>
							<span className="text-2xl font-bold text-[#28819C]">${totalEstimatedAmount}</span>
						</div>
					</div>
				</div>
			</div>

			{/* Attachments Section */}
			<AttachmentsSection
				t={t}
				attachments={attachments}
				onUpload={handleFileUpload}
				onRemove={handleRemoveAttachment}
			/>

			{/* Additional Notes Section */}
			<div className="mt-8 space-y-4">
				<FloatingLabelTextarea
					id="additionalNotes"
					name="additionalNotes"
					value={additionalNotes}
					onChange={e => setAdditionalNotes(e.target.value)}
					label={t('requisitions.newRequisition.additionalNotes')}
					rows={6}
				/>
			</div>

			{/* Decorative Elements */}
			<div className="absolute bottom-100 left-[-200px] pointer-events-none">
				<DecorationPattern />
			</div>
			<div className="absolute bottom-110 left-[-250px] pointer-events-none">
				<DecorationPattern />
			</div>

			{/* Action Buttons */}
			<div className="mt-8 flex justify-end gap-4">
				<Button
					type="button"
					title={t('requisitions.newRequisition.cancel')}
					className="bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
					onClick={onClose}
					disabled={isSubmitting}
				/>
				<Button
					type="submit"
					title={t('requisitions.newRequisition.createRequisition')}
					className="px-6 py-2.5 bg-[#28819C] text-white rounded-lg hover:bg-[#206b82] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={isSubmitting}
				/>
			</div>

			<div className="absolute bottom-0 left-0 pointer-events-none">
				<DecorationPattern />
			</div>
		</form>
	);
}

export default NewRequisition;
