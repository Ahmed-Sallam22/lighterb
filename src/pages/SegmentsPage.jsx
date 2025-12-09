import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/shared/PageHeader';
import FloatingLabelInput from '../components/shared/FloatingLabelInput';
import FloatingLabelSelect from '../components/shared/FloatingLabelSelect';
import SlideUpModal from '../components/shared/SlideUpModal';
import ConfirmModal from '../components/shared/ConfirmModal';
import Toggle from '../components/shared/Toggle';
import Table from '../components/shared/Table';
import Toolbar from '../components/shared/Toolbar';
import {
	fetchSegmentTypes,
	createSegmentType,
	updateSegmentType,
	deleteSegmentType,
	fetchSegmentValues,
	createSegmentValue,
	updateSegmentValue,
	deleteSegmentValue,
} from '../store/segmentsSlice';

const AddIcon = () => (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M10 0C10.5523 0 11 0.447715 11 1V9H19C19.5523 9 20 9.44772 20 10C20 10.5523 19.5523 11 19 11H11V19C11 19.5523 10.5523 20 10 20C9.44772 20 9 19.5523 9 19V11H1C0.447715 11 0 10.5523 0 10C0 9.44772 0.447715 9 1 9H9V1C9 0.447715 9.44772 0 10 0Z"
			fill="white"
		/>
	</svg>
);

const SegmentsPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === 'rtl';
	const dispatch = useDispatch();
	const { types, values, loading, typesLoading, valuesLoading } = useSelector(state => state.segments);

	// Segment Types State
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [currentSegmentId, setCurrentSegmentId] = useState(null);
	const [formData, setFormData] = useState({
		segment_name: '',
		segment_type: '',
		length: '',
		display_order: '',
		description: '',
		is_required: false,
		has_hierarchy: false,
		is_active: true,
	});

	// Segment Values State
	const [isValueModalOpen, setIsValueModalOpen] = useState(false);
	const [isValueEditMode, setIsValueEditMode] = useState(false);
	const [currentValueId, setCurrentValueId] = useState(null);
	const [selectedSegmentTypeLength, setSelectedSegmentTypeLength] = useState(null);
	const [valueFormData, setValueFormData] = useState({
		segment_type: '',
		code: '',
		alias: '',
		parent_code: null,
		parent: null,
		node_type: 'child',
		is_active: true,
	});

	// Delete confirmation states
	const [showDeleteTypeModal, setShowDeleteTypeModal] = useState(false);
	const [showDeleteValueModal, setShowDeleteValueModal] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);

	// Filters for segment values
	const [selectedSegmentType, setSelectedSegmentType] = useState('');
	const [searchQuery, setSearchQuery] = useState('');

	const [errors, setErrors] = useState({});
	const [valueErrors, setValueErrors] = useState({});

	// Fetch data on component mount
	useEffect(() => {
		dispatch(fetchSegmentTypes());
	}, [dispatch]);

	// Refetch values when filter changes
	useEffect(() => {
		dispatch(fetchSegmentValues({ segment_type: selectedSegmentType }));
	}, [dispatch, selectedSegmentType]);

	// ========== SEGMENT TYPES HANDLERS ==========
	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.segment_name.trim()) {
			newErrors.segment_name = t('segments.validation.nameRequired');
		}

		if (!formData.segment_type.trim()) {
			newErrors.segment_type = t('segments.validation.techTypeRequired');
		}

		if (!formData.length) {
			newErrors.length = t('segments.validation.lengthRequired');
		}

		if (!formData.display_order) {
			newErrors.display_order = t('segments.validation.orderRequired');
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleAddOrUpdateSegment = async () => {
		if (!validateForm()) {
			return;
		}

		const segmentData = {
			segment_name: formData.segment_name,
			segment_type: formData.segment_type,
			length: parseInt(formData.length),
			display_order: parseInt(formData.display_order),
			description: formData.description || null,
			is_required: formData.is_required,
			has_hierarchy: formData.has_hierarchy,
			is_active: formData.is_active,
		};

		try {
			if (isEditMode && currentSegmentId) {
				await dispatch(updateSegmentType({ id: currentSegmentId, data: segmentData })).unwrap();
				toast.success(t('segments.messages.typeUpdated'));
			} else {
				await dispatch(createSegmentType(segmentData)).unwrap();
				toast.success(t('segments.messages.typeCreated'));
			}
			handleCloseModal();
			dispatch(fetchSegmentTypes());
		} catch (error) {
			console.error('Error saving segment:', error);
			toast.error(isEditMode ? t('segments.messages.errorUpdateType') : t('segments.messages.errorCreateType'));
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setIsEditMode(false);
		setCurrentSegmentId(null);
		setFormData({
			segment_name: '',
			segment_type: '',
			length: '',
			display_order: '',
			description: '',
			is_required: false,
			has_hierarchy: false,
			is_active: true,
		});
		setErrors({});
	};

	const handleEditSegment = segment => {
		setIsEditMode(true);
		setCurrentSegmentId(segment.segment_id);
		setFormData({
			segment_name: segment.segment_name,
			segment_type: segment.segment_type,
			length: segment.length.toString(),
			display_order: segment.display_order.toString(),
			description: segment.description || '',
			is_required: segment.is_required,
			has_hierarchy: segment.has_hierarchy,
			is_active: segment.is_active,
		});
		setIsModalOpen(true);
	};

	const handleDeleteSegmentClick = segment => {
		setItemToDelete(segment);
		setShowDeleteTypeModal(true);
	};

	const handleConfirmDeleteSegment = async () => {
		if (itemToDelete) {
			try {
				await dispatch(deleteSegmentType(itemToDelete.segment_id)).unwrap();
				toast.success(t('segments.messages.typeDeleted'));
				setShowDeleteTypeModal(false);
				setItemToDelete(null);
				dispatch(fetchSegmentTypes());
			} catch (error) {
				console.error('Error deleting segment:', error);
				toast.error(t('segments.messages.errorDeleteType'));
			}
		}
	};

	const toggleRequired = async segment => {
		try {
			await dispatch(
				updateSegmentType({
					id: segment.segment_id,
					data: { ...segment, is_required: !segment.is_required },
				})
			).unwrap();
			toast.success(t('segments.messages.typeUpdated'));
			dispatch(fetchSegmentTypes());
		} catch (error) {
			console.error('Error updating segment:', error);
			toast.error(t('segments.messages.errorUpdateType'));
		}
	};

	const toggleHierarchy = async segment => {
		try {
			await dispatch(
				updateSegmentType({
					id: segment.segment_id,
					data: { ...segment, has_hierarchy: !segment.has_hierarchy },
				})
			).unwrap();
			toast.success(t('segments.messages.typeUpdated'));
			dispatch(fetchSegmentTypes());
		} catch (error) {
			console.error('Error updating segment:', error);
			toast.error(t('segments.messages.errorUpdateType'));
		}
	};

	// ========== SEGMENT VALUES HANDLERS ==========
	const handleValueInputChange = (field, value) => {
		setValueFormData(prev => ({ ...prev, [field]: value }));

		// When segment type is selected, get its length
		if (field === 'segment_type') {
			const selectedType = types.find(type => type.segment_id.toString() === value);
			if (selectedType) {
				setSelectedSegmentTypeLength(selectedType.length);
			} else {
				setSelectedSegmentTypeLength(null);
			}
		}

		if (valueErrors[field]) {
			setValueErrors(prev => ({ ...prev, [field]: '' }));
		}
	};

	const validateValueForm = () => {
		const newErrors = {};

		if (!valueFormData.segment_type) {
			newErrors.segment_type = t('segments.validation.typeRequired');
		}

		if (!valueFormData.code.trim()) {
			newErrors.code = t('segments.validation.codeRequired');
		} else if (selectedSegmentTypeLength && valueFormData.code.length !== selectedSegmentTypeLength) {
			newErrors.code = t('segments.validation.codeLength', { length: selectedSegmentTypeLength });
		}

		if (!valueFormData.alias.trim()) {
			newErrors.alias = t('segments.validation.aliasRequired');
		}

		setValueErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleAddOrUpdateSegmentValue = async () => {
		if (!validateValueForm()) {
			return;
		}

		const valueData = {
			segment_type: parseInt(valueFormData.segment_type),
			code: valueFormData.code,
			alias: valueFormData.alias,
			node_type: valueFormData.node_type,
			is_active: valueFormData.is_active,
			parent_code: valueFormData.parent_code || null,
			parent: valueFormData.parent || null,
			children: [],
		};

		try {
			if (isValueEditMode && currentValueId) {
				await dispatch(updateSegmentValue({ id: currentValueId, data: valueData })).unwrap();
				toast.success(t('segments.messages.valueUpdated'));
			} else {
				await dispatch(createSegmentValue(valueData)).unwrap();
				toast.success(t('segments.messages.valueCreated'));
			}
			handleCloseValueModal();
			dispatch(fetchSegmentValues({ segment_type: selectedSegmentType }));
		} catch (error) {
			console.error('Error saving segment value:', error);
			toast.error(
				isValueEditMode ? t('segments.messages.errorUpdateValue') : t('segments.messages.errorCreateValue')
			);
		}
	};

	const handleCloseValueModal = () => {
		setIsValueModalOpen(false);
		setIsValueEditMode(false);
		setCurrentValueId(null);
		setSelectedSegmentTypeLength(null);
		setValueFormData({
			segment_type: '',
			code: '',
			alias: '',
			parent_code: null,
			parent: null,
			node_type: 'child',
			is_active: true,
		});
		setValueErrors({});
	};

	const handleEditValue = row => {
		setIsValueEditMode(true);
		setCurrentValueId(row.id);

		// Find the segment type and set its length
		const selectedType = types.find(type => type.segment_id === row.segment_type);
		if (selectedType) {
			setSelectedSegmentTypeLength(selectedType.length);
		}

		setValueFormData({
			segment_type: row.segment_type.toString(),
			code: row.code,
			alias: row.alias,
			parent_code: row.parent_code,
			parent: row.parent,
			node_type: row.node_type,
			is_active: row.is_active,
		});
		setIsValueModalOpen(true);
	};

	const handleDeleteValueClick = row => {
		setItemToDelete(row);
		setShowDeleteValueModal(true);
	};

	const handleConfirmDeleteValue = async () => {
		if (itemToDelete) {
			try {
				await dispatch(deleteSegmentValue(itemToDelete.id)).unwrap();
				toast.success(t('segments.messages.valueDeleted'));
				setShowDeleteValueModal(false);
				setItemToDelete(null);
				dispatch(fetchSegmentValues({ segment_type: selectedSegmentType }));
			} catch (error) {
				console.error('Error deleting segment value:', error);
				toast.error(t('segments.messages.errorDeleteValue'));
			}
		}
	};

	const handleSearchChange = value => {
		setSearchQuery(value);
	};

	const handleFilterChange = value => {
		setSelectedSegmentType(value);
	};

	// Table columns for segment values
	const valueColumns = useMemo(
		() => [
			{
				header: t('segments.table.id'),
				accessor: 'id',
				width: '80px',
				render: value => <span className="font-semibold text-gray-900">{value}</span>,
			},
			{
				header: t('segments.table.code'),
				accessor: 'code',
				width: '120px',
				render: value => <span className="font-semibold text-gray-700">{value}</span>,
			},
			{
				header: t('segments.table.alias'),
				accessor: 'alias',
				render: value => <span className="text-gray-900">{value}</span>,
			},
			{
				header: t('segments.table.name'),
				accessor: 'name',
				render: value => <span className="text-gray-600 text-sm">{value}</span>,
			},
			{
				header: t('segments.table.type'),
				accessor: 'segment_type_name',
				width: '140px',
				render: value => <span className="font-semibold text-[#28819C]">{value}</span>,
			},
			{
				header: t('segments.table.parent'),
				accessor: 'parent_code',
				width: '100px',
				render: value => <span className="text-gray-600">{value || '-'}</span>,
			},
			{
				header: t('segments.table.nodeType'),
				accessor: 'node_type',
				width: '100px',
				render: value => (
					<span className={`font-medium ${value === 'parent' ? 'text-blue-600' : 'text-green-600'}`}>
						{value === 'parent' ? t('segments.form.parentNode') : t('segments.form.childNode')}
					</span>
				),
			},
			{
				header: t('segments.table.level'),
				accessor: 'level',
				width: '80px',
				render: value => <span className="text-gray-600">{value}</span>,
			},
			{
				header: t('segments.table.status'),
				accessor: 'is_active',
				width: '100px',
				render: value => (
					<span
						className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
							value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
						}`}
					>
						{value ? t('segments.status.active') : t('segments.status.inactive')}
					</span>
				),
			},
		],
		[t]
	);

	// Segment type options for values dropdown
	const segmentTypeOptions = types.map(type => ({
		value: type.segment_id.toString(),
		label: type.segment_name,
	}));

	const nodeTypeOptions = [
		{ value: 'child', label: t('segments.form.childNode') },
		{ value: 'parent', label: t('segments.form.parentNode') },
	];

	// Filter values based on search query
	const filteredValues = values.filter(value => {
		if (!searchQuery) return true;
		const search = searchQuery.toLowerCase();
		return (
			value.code?.toLowerCase().includes(search) ||
			value.alias?.toLowerCase().includes(search) ||
			value.name?.toLowerCase().includes(search)
		);
	});

	return (
		<div className="min-h-screen bg-gray-50">
			<PageHeader
				title={t('segments.title')}
				subtitle={t('segments.subtitle')}
				icon={
					<svg width="29" height="35" viewBox="0 0 29 35" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M16.25 2.5C16.25 2.16848 16.1183 1.85054 15.8839 1.61612C15.6495 1.3817 15.3315 1.25 15 1.25H2.5C2.16848 1.25 1.85054 1.3817 1.61612 1.61612C1.3817 1.85054 1.25 2.16848 1.25 2.5V10.625C1.24854 11.8715 1.58661 13.0948 2.2279 14.1637C2.86919 15.2325 3.7895 16.1066 4.89 16.6919L8.125 18.4169V17L5.47875 15.5887C4.57853 15.1096 3.82568 14.3945 3.30093 13.52C2.77618 12.6456 2.49931 11.6448 2.5 10.625V2.5H15V8.125H16.25V2.5Z"
							fill="#28819C"
						/>
					</svg>
				}
			/>

			<div className="w-[95%] mx-auto py-6">
				{/* Header with Add Button */}
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold text-gray-900">{t('segments.types.title')}</h2>
					<button
						onClick={() => setIsModalOpen(true)}
						className="flex items-center gap-2 px-6 py-3 bg-[#28819C] text-white rounded-lg hover:bg-[#206a82] transition-colors font-medium shadow-md"
						disabled={typesLoading}
					>
						<AddIcon />
						{t('segments.types.addBtn')}
					</button>
				</div>

				{/* Segments Grid */}
				{typesLoading ? (
					<div className="text-center py-10">
						<p className="text-gray-500">{t('segments.types.loading')}</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{types.map(segment => (
							<div
								key={segment.segment_id}
								className="bg-white rounded-3xl shadow-[0_10px_35px_rgba(15,55,80,0.08)] border border-gray-100 p-6 transition-all duration-300 hover:shadow-[0_18px_45px_rgba(15,55,80,0.12)]"
							>
								<div className="flex items-start justify-between gap-4">
									<div>
										<h3 className="text-xl font-semibold text-gray-900">{segment.segment_name}</h3>
										<p className="text-sm text-gray-500 mt-1">{segment.segment_type}</p>
									</div>
									<div className="flex items-center gap-1 text-[#1A7A99]">
										<button
											type="button"
											onClick={() => handleEditSegment(segment)}
											className="rounded-full hover:bg-[#E7F3F6] transition-colors"
											title={t('segments.actions.edit')}
										>
											<svg
												width="32"
												height="32"
												viewBox="0 0 32 32"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<g clipPath="url(#clip0_79_19294)">
													<path
														fillRule="evenodd"
														clipRule="evenodd"
														d="M17.8384 9.74767C19.0575 8.52861 21.034 8.52861 22.253 9.74767C23.4721 10.9667 23.4721 12.9432 22.253 14.1623L15.9295 20.4858C15.5682 20.8471 15.3555 21.0598 15.119 21.2444C14.8401 21.4619 14.5384 21.6484 14.2191 21.8005C13.9482 21.9296 13.6629 22.0247 13.1781 22.1863L10.9574 22.9265L10.4227 23.1048C9.98896 23.2493 9.5108 23.1364 9.18753 22.8132C8.86426 22.4899 8.75139 22.0117 8.89596 21.578L9.81444 18.8226C9.976 18.3378 10.0711 18.0525 10.2002 17.7816C10.3523 17.4624 10.5388 17.1606 10.7563 16.8818C10.9409 16.6452 11.1536 16.4325 11.5149 16.0712L17.8384 9.74767ZM10.9343 21.8801L12.8287 21.2487C13.3561 21.0729 13.5802 20.9972 13.7889 20.8978C14.0426 20.7769 14.2823 20.6287 14.5039 20.4559C14.6862 20.3137 14.8541 20.147 15.2472 19.7539L20.2935 14.7076C19.7677 14.5222 19.0904 14.1785 18.4563 13.5444C17.8222 12.9103 17.4785 12.233 17.2931 11.7072L12.2468 16.7535C11.8537 17.1466 11.687 17.3145 11.5449 17.4968C11.372 17.7184 11.2238 17.9581 11.1029 18.2118C11.0035 18.4205 10.9279 18.6446 10.752 19.172L10.1206 21.0664L10.9343 21.8801ZM18.1042 10.8961C18.127 11.0127 18.1656 11.1713 18.2299 11.3566C18.3746 11.7739 18.6481 12.322 19.1634 12.8373C19.6787 13.3526 20.2268 13.6261 20.6441 13.7708C20.8294 13.8351 20.988 13.8737 21.1046 13.8965L21.5459 13.4552C22.3745 12.6267 22.3745 11.2833 21.5459 10.4548C20.7174 9.62624 19.3741 9.62624 18.5455 10.4548L18.1042 10.8961Z"
														fill="#757575"
													/>
												</g>
												<defs>
													<clipPath id="clip0_79_19294">
														<rect
															width="16"
															height="16"
															fill="white"
															transform="translate(8 8)"
														/>
													</clipPath>
												</defs>
											</svg>
										</button>
										<button
											type="button"
											onClick={() => handleDeleteSegmentClick(segment)}
											className="rounded-full hover:bg-red-50 transition-colors"
											title={t('segments.actions.delete')}
										>
											<svg
												width="24"
												height="24"
												viewBox="0 0 24 24"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M10.1133 6.66671C10.3878 5.88991 11.1287 5.33337 11.9995 5.33337C12.8703 5.33337 13.6111 5.88991 13.8857 6.66671"
													stroke="#757575"
													strokeLinecap="round"
												/>
												<path d="M17.6674 8H6.33398" stroke="#757575" strokeLinecap="round" />
												<path
													d="M16.5545 9.66663L16.2478 14.266C16.1298 16.036 16.0708 16.9209 15.4942 17.4605C14.9175 18 14.0306 18 12.2567 18H11.7411C9.96726 18 9.08033 18 8.50365 17.4605C7.92698 16.9209 7.86798 16.036 7.74999 14.266L7.44336 9.66663"
													stroke="#757575"
													strokeLinecap="round"
												/>
												<path
													d="M10.334 11.3334L10.6673 14.6667"
													stroke="#757575"
													strokeLinecap="round"
												/>
												<path
													d="M13.6673 11.3334L13.334 14.6667"
													stroke="#757575"
													strokeLinecap="round"
												/>
											</svg>
										</button>
									</div>
								</div>

								<div className="mt-3 flex flex-wrap gap-4">
									<button
										type="button"
										onClick={() => toggleRequired(segment)}
										className="inline-flex items-center gap-2 rounded-2xl py-2 text-sm font-semibold text-[#1F809F]"
									>
										<span
											className={`h-4 w-4 rounded-md border flex items-center justify-center ${
												segment.is_required
													? 'bg-[#1F809F] border-[#1F809F]'
													: 'border-gray-300 bg-white'
											}`}
										>
											{segment.is_required && (
												<svg
													width="10"
													height="8"
													viewBox="0 0 13 10"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M1 4.5L4.5 8L12 1"
														stroke="white"
														strokeWidth="1.5"
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
												</svg>
											)}
										</span>
										{t('segments.types.required')}
									</button>

									<button
										type="button"
										onClick={() => toggleHierarchy(segment)}
										className="inline-flex items-center gap-2 rounded-2xl py-2 text-sm font-semibold text-[#1F809F]"
									>
										<span
											className={`h-4 w-4 rounded-md border flex items-center justify-center ${
												segment.has_hierarchy
													? 'bg-[#1F809F] border-[#1F809F]'
													: 'border-gray-300 bg-white'
											}`}
										>
											{segment.has_hierarchy && (
												<svg
													width="10"
													height="8"
													viewBox="0 0 13 10"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M1 4.5L4.5 8L12 1"
														stroke="white"
														strokeWidth="1.5"
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
												</svg>
											)}
										</span>
										{t('segments.types.hasHierarchy')}
									</button>
								</div>

								<p className="mt-3 text-[15px] leading-relaxed text-gray-600">
									{segment.description || t('segments.types.noDescription')}
								</p>

								<div className="mt-3 flex items-center justify-between border-gray-100 pt-4">
									<span
										className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold ${
											segment.is_active
												? 'bg-green-50 text-green-700'
												: 'bg-gray-100 text-gray-600'
										}`}
									>
										{segment.is_active
											? t('segments.status.active')
											: t('segments.status.inactive')}
									</span>
									<div className={`text-xs text-gray-500 ${isRtl ? 'text-left' : 'text-right'}`}>
										<div>
											{t('segments.types.length')}: {segment.length}
										</div>
										<div>
											{t('segments.types.order')}: {segment.display_order}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Add/Edit Segment Type Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={isEditMode ? t('segments.modals.editType') : t('segments.modals.addType')}
				className="w-full"
				maxWidth="550px"
			>
				<div className="relative overflow-hidden py-2">
					<div className="grid gap-4">
						<FloatingLabelInput
							label={t('segments.form.segmentName')}
							value={formData.segment_name}
							onChange={e => handleInputChange('segment_name', e.target.value)}
							required
							error={errors.segment_name}
							className="bg-white rounded-2xl"
						/>

						<FloatingLabelInput
							label={t('segments.form.technicalType')}
							value={formData.segment_type}
							onChange={e => handleInputChange('segment_type', e.target.value)}
							required
							error={errors.segment_type}
							className="bg-white rounded-2xl"
						/>

						<FloatingLabelInput
							label={t('segments.form.fixedLength')}
							type="number"
							value={formData.length}
							onChange={e => handleInputChange('length', e.target.value)}
							required
							error={errors.length}
							className="bg-white rounded-2xl"
						/>

						<FloatingLabelInput
							label={t('segments.form.displayOrder')}
							type="number"
							value={formData.display_order}
							onChange={e => handleInputChange('display_order', e.target.value)}
							required
							error={errors.display_order}
							className="bg-white rounded-2xl"
						/>

						<div className="relative rounded-2xl bg-white border border-[#E0EAED] shadow-sm">
							<textarea
								value={formData.description}
								onChange={e => handleInputChange('description', e.target.value)}
								placeholder={t('segments.form.placeholders.description')}
								rows="4"
								className="w-full bg-transparent px-5 pt-5 pb-3 text-gray-900 focus:outline-none"
							/>
						</div>

						<Toggle
							label={t('segments.form.mandatory')}
							checked={formData.is_required}
							onChange={() => handleInputChange('is_required', !formData.is_required)}
						/>
						<Toggle
							label={t('segments.form.hierarchy')}
							checked={formData.has_hierarchy}
							onChange={() => handleInputChange('has_hierarchy', !formData.has_hierarchy)}
						/>
						<Toggle
							label={t('segments.form.status')}
							checked={formData.is_active}
							onChange={() => handleInputChange('is_active', !formData.is_active)}
						/>
					</div>

					<div className="mt-6 flex justify-end gap-4">
						<button
							type="button"
							onClick={handleCloseModal}
							className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
						>
							{t('segments.actions.cancel')}
						</button>
						<button
							type="button"
							onClick={handleAddOrUpdateSegment}
							disabled={loading}
							className="rounded-full bg-[#1E7A96] px-8 py-2 text-sm font-semibold text-white hover:bg-[#16637A] disabled:opacity-50"
						>
							{loading
								? t('segments.actions.saving')
								: isEditMode
								? t('segments.actions.update')
								: t('segments.modals.addType')}
						</button>
					</div>
				</div>
			</SlideUpModal>

			{/* Segment Values Section */}
			<div className="w-[95%] mx-auto py-6">
				<h2 className="text-2xl font-bold text-gray-900 mb-6">{t('segments.values.title')}</h2>

				{/* Toolbar */}
				<Toolbar
					searchPlaceholder={t('segments.values.searchPlaceholder')}
					filterOptions={[{ value: '', label: t('segments.values.allTypes') }, ...segmentTypeOptions]}
					createButtonText={t('segments.values.addBtn')}
					onSearchChange={handleSearchChange}
					onFilterChange={handleFilterChange}
					onCreateClick={() => setIsValueModalOpen(true)}
				/>

				{/* Table */}
				<div className="mt-6">
					{valuesLoading ? (
						<div className="text-center py-10">
							<p className="text-gray-500">{t('segments.values.loading')}</p>
						</div>
					) : (
						<Table
							columns={valueColumns}
							data={filteredValues}
							onEdit={handleEditValue}
							onDelete={handleDeleteValueClick}
							editIcon="edit"
							emptyMessage={t('segments.values.empty')}
							showDeleteButton={row => row.can_delete !== false}
						/>
					)}
				</div>
			</div>

			{/* Add/Edit Segment Value Modal */}
			<SlideUpModal
				isOpen={isValueModalOpen}
				onClose={handleCloseValueModal}
				title={isValueEditMode ? t('segments.modals.editValue') : t('segments.modals.addValue')}
				maxWidth="550px"
			>
				<div className="space-y-4">
					<FloatingLabelSelect
						label={t('segments.form.segmentType')}
						value={valueFormData.segment_type}
						onChange={e => handleValueInputChange('segment_type', e.target.value)}
						options={segmentTypeOptions}
						required
						error={valueErrors.segment_type}
					/>
					{selectedSegmentTypeLength && (
						<p className="text-xs text-blue-600 font-medium mt-1 px-1">
							{t('segments.values.infoLength', { length: selectedSegmentTypeLength })}
						</p>
					)}

					<FloatingLabelInput
						label={t('segments.form.code')}
						value={valueFormData.code}
						onChange={e => handleValueInputChange('code', e.target.value)}
						required
						error={valueErrors.code}
						maxLength={selectedSegmentTypeLength || undefined}
						placeholder={
							selectedSegmentTypeLength
								? t('segments.form.placeholders.codeWithLen', { length: selectedSegmentTypeLength })
								: t('segments.form.placeholders.code')
						}
					/>
					{selectedSegmentTypeLength && (
						<p className="text-xs text-gray-500 mt-1 px-1">
							{t('segments.values.requiredLength', { length: selectedSegmentTypeLength })}
							{valueFormData.code && (
								<span
									className={`mx-1 ${
										valueFormData.code.length === selectedSegmentTypeLength
											? 'text-green-600 font-semibold'
											: 'text-orange-600 font-semibold'
									}`}
								>
									{t('segments.values.currentLength', {
										current: valueFormData.code.length,
										max: selectedSegmentTypeLength,
									})}
								</span>
							)}
						</p>
					)}

					<FloatingLabelInput
						label={t('segments.form.alias')}
						value={valueFormData.alias}
						onChange={e => handleValueInputChange('alias', e.target.value)}
						required
						error={valueErrors.alias}
					/>

					<FloatingLabelInput
						label={t('segments.form.parentCode')}
						value={valueFormData.parent_code || ''}
						onChange={e => handleValueInputChange('parent_code', e.target.value || null)}
						placeholder={t('segments.form.placeholders.parent')}
					/>

					<FloatingLabelSelect
						label={t('segments.form.nodeType')}
						value={valueFormData.node_type}
						onChange={e => handleValueInputChange('node_type', e.target.value)}
						options={nodeTypeOptions}
					/>

					<Toggle
						label={t('segments.form.status')}
						checked={valueFormData.is_active}
						onChange={() => handleValueInputChange('is_active', !valueFormData.is_active)}
					/>

					{/* Action Buttons */}
					<div className="flex justify-end gap-4 pt-4">
						<button
							type="button"
							onClick={handleCloseValueModal}
							className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
						>
							{t('segments.actions.close')}
						</button>
						<button
							type="button"
							onClick={handleAddOrUpdateSegmentValue}
							disabled={loading}
							className="px-6 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206a82] transition-colors font-medium disabled:opacity-50"
						>
							{loading
								? t('segments.actions.saving')
								: isValueEditMode
								? t('segments.actions.update')
								: t('segments.modals.addValue')}
						</button>
					</div>
				</div>
			</SlideUpModal>

			{/* Delete Segment Type Confirmation Modal */}
			<ConfirmModal
				isOpen={showDeleteTypeModal}
				onClose={() => {
					setShowDeleteTypeModal(false);
					setItemToDelete(null);
				}}
				onConfirm={handleConfirmDeleteSegment}
				title={t('segments.modals.deleteType')}
				message={t('segments.modals.deleteTypeMsg', { name: itemToDelete?.segment_name })}
				confirmText={t('segments.actions.delete')}
				cancelText={t('segments.actions.cancel')}
			/>

			{/* Delete Segment Value Confirmation Modal */}
			<ConfirmModal
				isOpen={showDeleteValueModal}
				onClose={() => {
					setShowDeleteValueModal(false);
					setItemToDelete(null);
				}}
				onConfirm={handleConfirmDeleteValue}
				title={t('segments.modals.deleteValue')}
				message={t('segments.modals.deleteValueMsg', { code: itemToDelete?.code, alias: itemToDelete?.alias })}
				confirmText={t('segments.actions.delete')}
				cancelText={t('segments.actions.cancel')}
			/>

			{/* Toast Container */}
			<ToastContainer
				position={isRtl ? 'top-left' : 'top-right'}
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

export default SegmentsPage;
