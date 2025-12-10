import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch, FiEye, FiEdit } from 'react-icons/fi';
import PageHeader from '../components/shared/PageHeader';
import FloatingLabelSelect from '../components/shared/FloatingLabelSelect';
import RequisitionsHeadIcon from '../ui/icons/RequisitionsHeadIcon';
import { IoDocumentTextOutline, IoLocationOutline, IoSettingsOutline } from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import DoneIcon from '../ui/icons/DoneIcon';
import { HiOutlineSwitchHorizontal } from 'react-icons/hi';
import { IoIosTrendingDown } from 'react-icons/io';
import { PiGearFineBold } from 'react-icons/pi';
import BoxIcon from '../ui/icons/BoxIcon';
import DirectoriesIcon from '../ui/icons/DirectoriesIcon';
import { PiCirclesFourFill } from 'react-icons/pi';
import Table from '../components/shared/Table';
import BoxesIcon from '../ui/icons/BoxesIcon';
import Button from '../components/shared/Button';
import StatisticsCard from '../components/shared/StatisticsCard';
import SearchInput from '../components/shared/SearchInput';
import { sampleData } from '../dummyData/assetsData';

const AssetsPage = () => {
	const { t } = useTranslation();

	const { loading, error, statistics } = useState(
		{ lines: [], loading: false, error: null, statistics: {} } // Placeholder state
	);

	const [filters, setFilters] = useState({
		search: '',
		status: 'All Statuses',
		category: 'All Categories',
	});

	// Sample asset data

	useEffect(() => {
		if (error) {
			toast.error(error, { autoClose: 5000 });
		}
	}, [error]);

	const statCards = [
		{
			title: t('assets.stats.totalAssets'),
			value: statistics?.totalLines || 0,

			valueColor: 'text-gray-900',
		},
		{
			title: t('assets.stats.activeAssets'),
			value: `$${(statistics?.totalDebits || 0).toFixed(2)}`,
			valueColor: 'text-red-600',
		},
		{
			title: t('assets.stats.draftAssets'),
			value: `$${(statistics?.totalCredits || 0).toFixed(2)}`,

			valueColor: 'text-green-600',
		},
		{
			title: t('assets.stats.totalNetBookValue'),
			value: `$${(statistics?.totalBalance || 0).toFixed(2)}`,
			valueColor: 'text-gray-900',
		},
	];

	const statusOptions = [
		{ value: 'All Statuses', label: t('assets.status.allStatuses') },
		{ value: 'capitalized', label: t('assets.status.capitalized') },
		{ value: 'cip', label: t('assets.status.cip') },
		{ value: 'draft', label: t('assets.status.draft') },
		{ value: 'retired', label: t('assets.status.retired') },
	];
	const categoryOptions = [
		{ value: 'All Categories', label: t('assets.filters.allCategories') },
		{ value: 'office', label: t('assets.filters.office') },
		{ value: 'electronics', label: t('assets.filters.electronics') },
		{ value: 'furniture', label: t('assets.filters.furniture') },
		{ value: 'itEquipment', label: t('assets.filters.itEquipment') },
	];

	const actions = [
		{ label: t('assets.approvals'), icon: <DoneIcon color="#0A0A0A" width={18} height={18} /> },
		{ label: t('assets.transfer'), icon: <HiOutlineSwitchHorizontal color="#0A0A0A" /> },
		{ label: t('assets.adjustments'), icon: <IoSettingsOutline color="#0A0A0A" /> },
		{ label: t('assets.retirements'), icon: <BoxesIcon /> },
		{ label: t('assets.categories'), icon: <DirectoriesIcon /> },
		{ label: t('assets.locations'), icon: <IoLocationOutline color="#0A0A0A" /> },
		{ label: t('assets.depreciation'), icon: <IoIosTrendingDown color="#0A0A0A" /> },
		{ label: t('assets.settings'), icon: <PiGearFineBold color="#0A0A0A" /> },
	];

	const handleFilterChange = (name, value) => {
		setFilters(prev => ({
			...prev,
			[name]: value,
		}));
	};

	const handleView = _row => {
		// TODO: Implement view asset functionality
	};

	const columns = [
		{
			header: t('assets.table.assetNumber'),
			accessor: 'assetNumber',
		},
		{
			header: t('assets.table.name'),
			accessor: 'name',
		},
		{
			header: t('assets.table.category'),
			accessor: 'category',
		},
		{
			header: t('assets.table.location'),
			accessor: 'location',
		},
		{
			header: t('assets.table.acquisitionCost'),
			accessor: 'acquisitionCost',
			render: value => <span className="font-semibold">{value}</span>,
		},
		{
			header: t('assets.table.netBookValue'),
			accessor: 'netBookValue',
			render: value => <span className="font-semibold">{value}</span>,
		},
		{
			header: t('assets.table.status'),
			accessor: 'status',
			render: value => {
				const statusColors = {
					Capitalized: 'bg-green-500 text-white',
					CIP: 'bg-[#28819C] text-white',
					Draft: 'bg-gray-100 text-gray-800',
					Retired: 'bg-red-100 text-red-800',
				};
				return (
					<span
						className={`px-3 py-1 rounded-full text-xs font-semibold ${
							statusColors[value] || 'bg-gray-100 text-gray-800'
						}`}
					>
						{value}
					</span>
				);
			},
		},
		{
			header: t('assets.table.actions'),
			accessor: 'actions',
			render: (value, row) => (
				<button
					onClick={() => handleView(row)}
					className="text-[#28819C] hover:text-[#206b82] transition-colors"
				>
					<FiEye size={20} />
				</button>
			),
		},
	];

	return (
		<div className="min-h-screen bg-[#EEEEEE]">
			{/* Header */}
			<PageHeader
				title={t('assets.title')}
				subtitle={t('assets.subtitle')}
				icon={<RequisitionsHeadIcon width={32} height={30} className="text-[#28819C]" />}
			/>

			<div className="p-6">
				<div className=" py-4 flex justify-between items-center">
					<h1 className="text-3xl font-semibold text-[#28819C]">{t('assets.title')}</h1>
					<div className="flex items-center gap-4">
						<Button
							onClick={() => {
								// TODO: Implement new asset functionality
							}}
							icon={<FiPlus className="text-xl" />}
							title={t('assets.newAsset')}
						/>

						<Button
							onClick={() => {
								// TODO: Implement add from AP invoice functionality
							}}
							icon={<IoDocumentTextOutline className="text-xl" />}
							title={t('assets.fromAPInvoice')}
							className="bg-[#00A63E] hover:bg-[#029839] text-white"
						/>

						<Button
							onClick={() => {
								// TODO: Implement add from GRN functionality
							}}
							icon={<BoxIcon />}
							title={t('assets.fromGRN')}
							className="bg-[#00A63E] hover:bg-[#029839] text-white"
						/>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-3 justify-end">
					{actions.map(({ label, icon }) => (
						<Button
							key={label}
							onClick={() => {}}
							className={'bg-white hover:bg-gray-50 transition-colors text-gray-700 font-semibold'}
							title={label}
							icon={icon}
						/>
					))}
				</div>

				<div className="mx-auto py-6 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
						{statCards?.map(card => (
							<StatisticsCard title={card.title} value={card.value} valueClassName={card.valueColor} />
						))}
					</div>

					<div className="flex justify-end">
						<div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-2/3">
							<SearchInput
								value={filters.search}
								onChange={e => handleFilterChange('search', e.target.value)}
								placeholder={t('assets.searchPlaceholder')}
							/>
							<div className="flex items-center gap-4">
								<FloatingLabelSelect
									id="status"
									value={filters.status}
									onChange={e => handleFilterChange('status', e.target.value)}
									options={statusOptions}
									icon={<PiCirclesFourFill className="text-[#28819C]" size={20} />}
									buttonClassName="min-w-[12rem]"
								/>
								<FloatingLabelSelect
									id="category"
									value={filters.category}
									onChange={e => handleFilterChange('category', e.target.value)}
									options={categoryOptions}
									icon={<PiCirclesFourFill className="text-[#28819C]" size={20} />}
									buttonClassName="min-w-[12rem]"
								/>
							</div>
						</div>
					</div>

					{/* Cards Section */}
					{loading ? (
						<div className="flex justify-center items-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#28819C]"></div>
						</div>
					) : (
						<Table
							columns={columns}
							data={sampleData}
							emptyMessage={t('assets.emptyMessage')}
							showActions={false}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default AssetsPage;
