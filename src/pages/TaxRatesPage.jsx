import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/shared/PageHeader';
import Table from '../components/shared/Table';
import SlideUpModal from '../components/shared/SlideUpModal';
import ConfirmModal from '../components/shared/ConfirmModal';
import FloatingLabelInput from '../components/shared/FloatingLabelInput';
import FloatingLabelSelect from '../components/shared/FloatingLabelSelect';
import Toggle from '../components/shared/Toggle';
import { fetchTaxRates, createTaxRate, updateTaxRate, deleteTaxRate } from '../store/taxRatesSlice';

const TaxRatesPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === 'rtl';
	const dispatch = useDispatch();
	const { taxRates, loading } = useSelector(state => state.taxRates);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [deleteId, setDeleteId] = useState(null);
	const [formData, setFormData] = useState({
		name: '',
		rate: '',
		country: '',
		code: '',
		category: '',
		isActive: true,
	});
	const [errors, setErrors] = useState({});

	// Fetch tax rates on component mount
	useEffect(() => {
		dispatch(fetchTaxRates());
	}, [dispatch]);

	// Country options
	const countryOptions = useMemo(
		() => [
			{ value: 'AE', label: t('taxRates.options.countries.AE') },
			{ value: 'EG', label: t('taxRates.options.countries.EG') },
			{ value: 'IN', label: t('taxRates.options.countries.IN') },
			{ value: 'SA', label: t('taxRates.options.countries.SA') },
			{ value: 'US', label: t('taxRates.options.countries.US') },
		],
		[t]
	);

	// Category options
	const categoryOptions = useMemo(
		() => [
			{ value: 'STANDARD', label: t('taxRates.options.categories.STANDARD') },
			{ value: 'ZERO', label: t('taxRates.options.categories.ZERO') },
			{ value: 'EXEMPT', label: t('taxRates.options.categories.EXEMPT') },
		],
		[t]
	);

	// Table columns
	const columns = useMemo(
		() => [
			{
				header: t('taxRates.table.code'),
				accessor: 'code',
				width: '120px',
				render: value => <span className="font-semibold text-gray-900">{value}</span>,
			},
			{
				header: t('taxRates.table.name'),
				accessor: 'name',
				render: value => <span className="text-gray-900">{value}</span>,
			},
			{
				header: t('taxRates.table.rate'),
				accessor: 'rate',
				width: '100px',
				render: value => <span className="font-semibold text-[#28819C]">{value}%</span>,
			},
			{
				header: t('taxRates.table.country'),
				accessor: 'country',
				width: '100px',
				render: value => <span className="text-gray-700 font-medium">{value}</span>,
			},
			{
				header: t('taxRates.table.category'),
				accessor: 'category',
				width: '120px',
				render: value => (
					<span
						className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
							value === 'STANDARD'
								? 'bg-blue-100 text-blue-800'
								: value === 'ZERO'
								? 'bg-yellow-100 text-yellow-800'
								: 'bg-purple-100 text-purple-800'
						}`}
					>
						{/* Try to translate, fallback to value if not found */}
						{t(`taxRates.options.categories.${value}`, { defaultValue: value })}
					</span>
				),
			},
			{
				header: t('taxRates.table.status'),
				accessor: 'is_active',
				width: '100px',
				render: value => (
					<span
						className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
							value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
						}`}
					>
						{value ? t('taxRates.table.active') : t('taxRates.table.inactive')}
					</span>
				),
			},
		],
		[t]
	);

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = t('taxRates.validation.nameRequired');
		}

		if (!formData.rate.toString().trim()) {
			newErrors.rate = t('taxRates.validation.rateRequired');
		} else if (isNaN(formData.rate) || parseFloat(formData.rate) < 0) {
			newErrors.rate = t('taxRates.validation.ratePositive');
		}

		if (!formData.country) {
			newErrors.country = t('taxRates.validation.countryRequired');
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleAddTaxRate = async () => {
		if (!validateForm()) return;

		const taxRateData = {
			name: formData.name,
			rate: parseFloat(formData.rate),
			country: formData.country,
			code: formData.code || null,
			category: formData.category || null,
			is_active: formData.isActive,
		};

		try {
			if (editingId) {
				// Update existing tax rate
				await dispatch(updateTaxRate({ id: editingId, data: taxRateData })).unwrap();
				toast.success(t('taxRates.messages.updateSuccess'));
			} else {
				// Add new tax rate
				await dispatch(createTaxRate(taxRateData)).unwrap();
				toast.success(t('taxRates.messages.createSuccess'));
			}
			handleCloseModal();
		} catch (error) {
			const errorMessage = error?.message || error?.error || t('taxRates.messages.saveError');
			toast.error(errorMessage);
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingId(null);
		setFormData({
			name: '',
			rate: '',
			country: '',
			code: '',
			category: '',
			isActive: true,
		});
		setErrors({});
	};

	const handleEdit = row => {
		const taxRate = taxRates.find(rate => rate.id === row?.id);

		if (taxRate) {
			setEditingId(row?.id);
			setFormData({
				name: taxRate.name,
				rate: taxRate.rate.toString(),
				country: taxRate.country,
				code: taxRate.code || '',
				category: taxRate.category || '',
				isActive: taxRate.is_active,
			});
			setIsModalOpen(true);
		}
	};

	const handleDelete = id => {
		setDeleteId(id.id);
		setIsDeleteModalOpen(true);
	};

	const confirmDelete = async () => {
		if (deleteId) {
			try {
				await dispatch(deleteTaxRate(deleteId)).unwrap();
				toast.success(t('taxRates.messages.deleteSuccess'));
				setIsDeleteModalOpen(false);
				setDeleteId(null);
			} catch (error) {
				const errorMessage = error?.message || error?.error || t('taxRates.messages.deleteError');
				toast.error(errorMessage);
			}
		}
	};

	const cancelDelete = () => {
		setIsDeleteModalOpen(false);
		setDeleteId(null);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer
				position={isRtl ? 'top-left' : 'top-right'}
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				rtl={isRtl}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>

			<PageHeader
				title={t('taxRates.title')}
				subtitle={t('taxRates.subtitle')}
				icon={
					<svg width="29" height="35" viewBox="0 0 29 35" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M14.5 0C6.49 0 0 6.49 0 14.5C0 22.51 6.49 29 14.5 29C22.51 29 29 22.51 29 14.5C29 6.49 22.51 0 14.5 0ZM14.5 26.5C7.87 26.5 2.5 21.13 2.5 14.5C2.5 7.87 7.87 2.5 14.5 2.5C21.13 2.5 26.5 7.87 26.5 14.5C26.5 21.13 21.13 26.5 14.5 26.5Z"
							fill="#28819C"
						/>
						<path
							d="M11 8H13V11H16V13H13V16H16V18H13V21H11V18H8V16H11V13H8V11H11V8ZM18 8H21V11H18V8ZM18 18H21V21H18V18Z"
							fill="#28819C"
						/>
					</svg>
				}
			/>

			<div className=" mx-auto px-6 py-8">
				{/* Header with Title and Buttons */}
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-gray-900">{t('taxRates.title')}</h2>
					<div className="flex gap-3">
						<button
							onClick={() => setIsModalOpen(true)}
							className="flex items-center gap-2 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM15 11H11V15H9V11H5V9H9V5H11V9H15V11Z"
									fill="white"
								/>
							</svg>
							{t('taxRates.actions.add')}
						</button>
					</div>
				</div>

				{/* Table */}
				<Table
					columns={columns}
					data={taxRates}
					onEdit={handleEdit}
					onDelete={handleDelete}
					editIcon="edit"
					loading={loading}
				/>
			</div>

			{/* Add/Edit Tax Rate Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={editingId ? t('taxRates.modals.editTitle') : t('taxRates.modals.addTitle')}
				maxWidth="550px"
			>
				<div className="space-y-6">
					{/* Tax Name */}
					<FloatingLabelInput
						label={t('taxRates.form.name')}
						name="name"
						value={formData.name}
						onChange={e => handleInputChange('name', e.target.value)}
						error={errors.name}
						required
						placeholder={t('taxRates.form.placeholders.name')}
					/>

					{/* Tax Rate */}
					<FloatingLabelInput
						label={t('taxRates.form.rate')}
						name="rate"
						type="number"
						step="0.01"
						min="0"
						value={formData.rate}
						onChange={e => handleInputChange('rate', e.target.value)}
						error={errors.rate}
						required
						placeholder={t('taxRates.form.placeholders.rate')}
					/>

					{/* Country */}
					<FloatingLabelSelect
						label={t('taxRates.form.country')}
						name="country"
						value={formData.country}
						onChange={e => handleInputChange('country', e.target.value)}
						error={errors.country}
						options={countryOptions}
						required
						placeholder={t('taxRates.options.selectCountry')}
					/>

					{/* Tax Code (Optional) */}
					<FloatingLabelInput
						label={t('taxRates.form.code')}
						name="code"
						value={formData.code}
						onChange={e => handleInputChange('code', e.target.value)}
						placeholder={t('taxRates.form.placeholders.code')}
					/>

					{/* Category (Optional) */}
					<FloatingLabelSelect
						label={t('taxRates.form.category')}
						name="category"
						value={formData.category}
						onChange={e => handleInputChange('category', e.target.value)}
						options={categoryOptions}
						placeholder={t('taxRates.options.selectCategory')}
					/>

					{/* Toggle for Active Status */}
					<div className="pt-2">
						<Toggle
							label={t('taxRates.form.setActive')}
							checked={formData.isActive}
							onChange={checked => handleInputChange('isActive', checked)}
						/>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4">
						<button
							onClick={handleCloseModal}
							className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
						>
							{t('taxRates.actions.cancel')}
						</button>
						<button
							onClick={handleAddTaxRate}
							className="flex-1 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium"
						>
							{editingId ? t('taxRates.actions.update') : t('taxRates.actions.create')}
						</button>
					</div>
				</div>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={cancelDelete}
				onConfirm={confirmDelete}
				title={t('taxRates.modals.deleteTitle')}
				message={t('taxRates.modals.deleteMessage')}
				confirmText={t('taxRates.actions.delete')}
				cancelText={t('taxRates.actions.cancel')}
				type="danger"
			/>
		</div>
	);
};

export default TaxRatesPage;
