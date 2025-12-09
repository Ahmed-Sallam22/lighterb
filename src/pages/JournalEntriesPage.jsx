import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/shared/PageHeader';
import Table from '../components/shared/Table';
import Toolbar from '../components/shared/Toolbar';
import ConfirmModal from '../components/shared/ConfirmModal';
import { fetchJournals, deleteJournal, postJournal, reverseJournal } from '../store/journalsSlice';

const StatPattern = () => (
	<svg
		className="absolute top-0 inset-0 bottom-0"
		width="255"
		height="110"
		viewBox="0 0 255 110"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g opacity="0.5">
			<mask id="mask0_188_15416" maskUnits="userSpaceOnUse" x="0" y="-1" width="255" height="111">
				<rect opacity="0.2" y="-0.346924" width="254.875" height="110.172" rx="10" fill="white" />
			</mask>
			<g mask="url(#mask0_188_15416)">
				<path
					d="M185.206 64.0737L159.069 77.8952L211.325 108.498L185.206 64.0737Z"
					stroke="#7A9098"
					strokeWidth="3"
				/>
				<path
					d="M258.398 91.7837L235.567 84.3174L267.607 136.441L258.398 91.7837Z"
					stroke="#7A9098"
					strokeWidth="3"
				/>
				<path
					d="M114.257 92.693L103.282 123.022L144.403 96.1051L114.257 92.693Z"
					stroke="#7A9098"
					strokeWidth="3"
				/>
				<path
					d="M8.56127 93.1316L-2.03999 75.0951L-2.14153 120.528L18.3103 109.713L8.56127 93.1316Z"
					stroke="#7A9098"
					strokeWidth="3"
				/>
				<path
					d="M196.949 -2.34499L181.268 9.32849L208.636 24.0049L208.656 -11.0629L196.949 -2.34499Z"
					stroke="#7A9098"
					strokeWidth="3"
				/>
				<path
					d="M63.541 92.7497L47.8596 104.423L75.2274 119.1L75.2475 84.0319L63.541 92.7497Z"
					stroke="#7A9098"
					strokeWidth="3"
				/>
				<path
					d="M246.766 28.9628L260.84 -13.2088L239.212 -15.0905L246.766 28.9628Z"
					stroke="#7A9098"
					strokeWidth="3"
				/>
			</g>
		</g>
	</svg>
);

const TotalEntriesIcon = () => (
	<svg width="24" height="22" viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M0 9.03278C0 6.62404 0 4.27953 0 1.91094C0 0.586131 0.473717 -0.040179 1.85473 0.016025C3.95836 0.0882872 6.16637 0.0160485 8.12548 0.240864C9.28163 0.364627 10.4174 0.634414 11.5058 1.04378C12.6788 0.670614 13.8825 0.40193 15.1028 0.240864C17.2145 0.0401359 19.6393 0.00802914 21.9436 0C22.8188 0 23.2363 0.50582 23.2363 1.38903C23.2363 6.47415 23.2363 11.5593 23.2363 16.6444C23.2363 17.9371 22.4816 18.1539 21.4378 18.1458C19.3984 18.1458 17.351 18.1458 15.3116 18.1458C14.0028 18.1458 12.951 18.5152 12.8145 20.0648C12.7503 20.8115 12.3809 21.3334 11.578 21.3093C11.4286 21.3063 11.2814 21.2733 11.145 21.2123C11.0086 21.1513 10.8859 21.0635 10.784 20.9542C10.6822 20.8449 10.6033 20.7162 10.5522 20.5758C10.501 20.4355 10.4785 20.2863 10.4861 20.137C10.3656 18.459 9.2335 18.1378 7.86052 18.1378C5.87732 18.1378 3.90216 18.1378 1.92699 18.1378C0.61021 18.1378 -0.00803453 17.7123 0.0321112 16.3072C0.104373 13.8984 0.0321112 11.4255 0.0321112 8.98461L0 9.03278ZM21.1407 9.2094V7.23426C21.1407 1.80656 21.1407 1.80653 15.697 2.32842C15.4999 2.32951 15.3035 2.35105 15.1108 2.39267C13.8904 2.77004 12.8868 3.50069 12.8546 4.80141C12.7583 8.29408 12.8145 11.7948 12.8546 15.2955C12.8546 15.7371 12.7904 16.2911 13.5452 16.0984C15.697 15.6006 17.8809 15.9217 20.0488 15.8736C20.8998 15.8736 21.205 15.5765 21.1889 14.7174C21.1086 12.9349 21.1407 11.0641 21.1407 9.2094ZM2.14378 9.05684C2.14378 10.8393 2.22407 12.6218 2.14378 14.3962C2.06349 15.6809 2.57735 15.9298 3.74961 15.9217C5.71675 15.9217 7.70797 15.6488 9.65905 16.1225C10.7028 16.3714 10.5101 15.6247 10.5101 15.0867C10.5101 11.7868 10.5583 8.48677 10.5101 5.18679C10.5253 4.82144 10.4663 4.45679 10.3366 4.11488C10.207 3.77297 10.0094 3.46089 9.75572 3.19749C9.50207 2.93409 9.19767 2.72484 8.86089 2.58237C8.52412 2.4399 8.16195 2.3672 7.79629 2.36861C6.41527 2.23211 5.02624 2.36858 3.64522 2.28828C2.54523 2.21602 2.11969 2.56129 2.17589 3.70946C2.19998 5.49193 2.14378 7.31452 2.14378 9.05684Z"
			fill="#28819C"
		/>
	</svg>
);

const PostedIcon = () => (
	<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g clipPath="url(#clip0_188_15472)">
			<path
				d="M10.9633 21C8.83042 21.1403 6.70692 20.6114 4.88853 19.4871C3.07013 18.3629 1.64737 16.6991 0.818378 14.7275C0.013799 12.849 -0.226208 10.7765 0.127707 8.76356C0.481623 6.75064 1.41412 4.88457 2.81113 3.39362C5.91258 0.261026 9.64446 -0.790427 13.9343 0.580084C14.2758 0.68459 14.6059 0.823063 14.9198 0.993418C15.5575 1.36324 16.5793 1.58078 16.101 2.62498C15.6227 3.66918 14.8256 3.16883 14.1227 2.80626C11.5213 1.45025 8.96331 1.68956 6.44157 3.04557C4.62316 4.00659 3.21176 5.59121 2.46606 7.50899C1.72035 9.42678 1.69029 11.5492 2.38138 13.4874C3.07247 15.4256 4.43843 17.0496 6.22888 18.0618C8.01934 19.074 10.1144 19.4066 12.13 18.9986C14.1277 18.5963 15.9207 17.5046 17.1961 15.9142C18.4715 14.3238 19.1483 12.3357 19.1082 10.297C19.1082 9.43404 18.2097 7.91125 19.8329 7.85324C21.3329 7.80973 20.9633 9.47028 21.0068 10.413C21.0522 13.1424 20.0254 15.7807 18.1472 17.7605C16.2691 19.7403 13.6895 20.9035 10.9633 21Z"
				fill="#28819C"
			/>
			<path
				d="M21.0003 2.95869C20.9424 3.5243 20.5293 3.79985 20.196 4.13341C17.3916 6.96145 14.5511 9.76045 11.783 12.6247C10.8916 13.5384 10.1815 13.7197 9.29019 12.6828C8.63077 11.9141 7.84092 11.2325 7.16701 10.5074C6.71773 10.0505 6.39164 9.55743 6.96411 8.97007C7.53657 8.38271 7.99309 8.66549 8.50758 9.08607C9.23222 9.67343 9.70324 10.9642 10.6163 10.7611C11.4134 10.5871 12.0221 9.56469 12.696 8.89031C14.8409 6.7439 16.981 4.59507 19.1163 2.44382C19.4569 2.10301 19.8409 1.71869 20.3627 1.99424C20.5538 2.0718 20.717 2.20543 20.8308 2.37757C20.9447 2.54971 21.0037 2.75231 21.0003 2.95869Z"
				fill="#28819C"
			/>
		</g>
		<defs>
			<clipPath id="clip0_188_15472">
				<rect width="21" height="21" fill="white" />
			</clipPath>
		</defs>
	</svg>
);

const DraftIcon = () => (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M18.5669 12.0581L16.6919 10.1831C16.5747 10.066 16.4157 10.0001 16.25 10.0001C16.0843 10.0001 15.9253 10.066 15.8081 10.1831L10 15.9913V18.75H12.7587L18.5669 12.9419C18.684 12.8247 18.7499 12.6657 18.7499 12.5C18.7499 12.3343 18.684 12.1753 18.5669 12.0581ZM12.2413 17.5H11.25V16.5087L14.375 13.3837L15.3663 14.375L12.2413 17.5ZM16.25 13.4913L15.2587 12.5L16.25 11.5087L17.2413 12.5L16.25 13.4913ZM5 10H11.25V11.25H5V10ZM5 6.25H12.5V7.5H5V6.25Z"
			fill="#28819C"
		/>
		<path
			d="M16.25 2.5C16.25 2.16848 16.1183 1.85054 15.8839 1.61612C15.6495 1.3817 15.3315 1.25 15 1.25H2.5C2.16848 1.25 1.85054 1.3817 1.61612 1.61612C1.3817 1.85054 1.25 2.16848 1.25 2.5V10.625C1.24854 11.8715 1.58661 13.0948 2.2279 14.1637C2.86919 15.2325 3.7895 16.1066 4.89 16.6919L8.125 18.4169V17L5.47875 15.5887C4.57853 15.1096 3.82568 14.3945 3.30093 13.52C2.77618 12.6456 2.49931 11.6448 2.5 10.625V2.5H15V8.125H16.25V2.5Z"
			fill="#28819C"
		/>
	</svg>
);

const JournalEntriesPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === 'rtl';
	const navigate = useNavigate();
	const dispatch = useDispatch();

	// Redux state
	const { journals, loading, error } = useSelector(state => state.journals);

	// Local state
	const [confirmDelete, setConfirmDelete] = useState(false);

	const [journalToDelete, setJournalToDelete] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterStatus, setFilterStatus] = useState('');

	// Fetch journals on component mount
	useEffect(() => {
		dispatch(fetchJournals());
	}, [dispatch]);

	// Show error toast if there's an error
	useEffect(() => {
		if (error) {
			// Display detailed error message
			const errorMessage =
				typeof error === 'string'
					? error
					: error?.message || error?.error || error?.detail || 'An error occurred';
			toast.error(errorMessage);
		}
	}, [error]);

	// Calculate statistics
	const totalEntries = journals.length;
	const postedEntries = journals.filter(j => j.is_posted || j.posted).length;
	const draftEntries = journals.filter(j => !(j.is_posted || j.posted)).length;

	// Filter and search journals
	const filteredJournals = journals.filter(journal => {
		const matchesSearch =
			searchTerm === '' ||
			journal.memo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			journal.id?.toString().includes(searchTerm);

		const isPosted = journal.is_posted || journal.posted;
		const matchesFilter =
			filterStatus === '' || (filterStatus === 'posted' && isPosted) || (filterStatus === 'draft' && !isPosted);

		return matchesSearch && matchesFilter;
	});

	// Transform data for table display
	const journalEntries = filteredJournals.map(journal => {
		const totalDebit = journal.lines?.reduce((sum, line) => sum + parseFloat(line.debit || 0), 0) || 0;
		const totalCredit = journal.lines?.reduce((sum, line) => sum + parseFloat(line.credit || 0), 0) || 0;
		const isPosted = journal.is_posted || journal.posted;

		return {
			id: journal.id,
			name: journal.memo || `Journal Entry ${journal.id}`,
			date: journal.date || new Date().toISOString().split('T')[0],
			lines: journal.lines?.length || 0,
			totalDebit: `$${totalDebit.toFixed(2)}`,
			totalCredit: `$${totalCredit.toFixed(2)}`,
			// Use localized keys for logic, we will translate in render
			status: isPosted ? 'posted' : 'draft',
			rawData: journal, // Keep original data for actions
		};
	});

	const statCards = [
		{
			title: t('journals.stats.totalEntries'),
			value: totalEntries.toString(),
			icon: <TotalEntriesIcon />,
			iconBg: 'bg-[#E1F5FE]',
			valueColor: 'text-gray-900',
		},
		{
			title: t('journals.stats.posted'),
			value: postedEntries.toString(),
			icon: <PostedIcon />,
			iconBg: 'bg-green-50',
			valueColor: 'text-green-600',
		},
		{
			title: t('journals.stats.draft'),
			value: draftEntries.toString(),
			icon: <DraftIcon />,
			iconBg: 'bg-gray-50',
			valueColor: 'text-gray-600',
		},
	];

	const columns = [
		{
			header: t('journals.table.name'),
			accessor: 'name',
		},
		{
			header: t('journals.table.id'),
			accessor: 'id',
			width: '140px',
		},
		{
			header: t('journals.table.date'),
			accessor: 'date',
			width: '130px',
		},
		{
			header: t('journals.table.lines'),
			accessor: 'lines',
			width: '100px',
			render: value => <span className="font-semibold">{value}</span>,
		},
		{
			header: t('journals.table.totalDebit'),
			accessor: 'totalDebit',
			width: '140px',
			render: value => <span className="font-semibold text-red-600">{value}</span>,
		},
		{
			header: t('journals.table.totalCredit'),
			accessor: 'totalCredit',
			width: '140px',
			render: value => <span className="font-semibold text-green-600">{value}</span>,
		},
		{
			header: t('journals.table.status'),
			accessor: 'status',
			width: '120px',
			render: value => {
				const statusColors = {
					posted: 'bg-green-100 text-green-800',
					draft: 'bg-gray-100 text-gray-800',
				};
				// Translate the value (which is 'posted' or 'draft')
				return (
					<span
						className={`px-3 py-1 rounded-full text-xs font-semibold ${
							statusColors[value] || 'bg-gray-100 text-gray-800'
						}`}
					>
						{t(`journals.status.${value}`)}
					</span>
				);
			},
		},
		{
			header: t('journals.table.actions'),
			accessor: 'actions',
			width: '200px',
			render: (_, row) => {
				const isPosted = row.rawData?.is_posted || row.rawData?.posted;
				return (
					<div className="flex items-center gap-2">
						{!isPosted && (
							<button
								onClick={e => {
									e.stopPropagation();
									handlePostJournal(row);
								}}
								className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-medium"
								title={t('journals.actions.post')}
							>
								{t('journals.actions.post')}
							</button>
						)}
						{isPosted && (
							<button
								onClick={e => {
									e.stopPropagation();
									handleReverseJournal(row);
								}}
								className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs font-medium"
								title={t('journals.actions.reverse')}
							>
								{t('journals.actions.reverse')}
							</button>
						)}
					</div>
				);
			},
		},
	];

	// Handler functions
	const handleView = row => {
		// Navigate to create/edit page with journal data for editing
		navigate('/journal/create', { state: { journal: row.rawData } });
	};

	const handleDelete = row => {
		setJournalToDelete(row);
		setConfirmDelete(true);
	};

	const handleConfirmDelete = async () => {
		if (journalToDelete) {
			try {
				await dispatch(deleteJournal(journalToDelete.id)).unwrap();
				toast.success(t('journals.messages.deleteSuccess'));
				setConfirmDelete(false);
				setJournalToDelete(null);
			} catch (err) {
				// Display detailed error message from API response
				const errorMessage = err?.message || err?.error || err?.detail || t('journals.messages.deleteError');
				toast.error(errorMessage);
			}
		}
	};

	const handlePostJournal = async row => {
		const isPosted = row.rawData?.is_posted || row.rawData?.posted;
		if (isPosted) {
			toast.info(t('journals.messages.postInfo'));
			return;
		}

		try {
			await dispatch(postJournal(row.id)).unwrap();
			toast.success(t('journals.messages.postSuccess'));
			dispatch(fetchJournals()); // Refresh the list
		} catch (err) {
			// Display detailed error message from API response
			const errorMessage = err?.message || err?.error || err?.detail || t('journals.messages.postError');
			toast.error(errorMessage);
		}
	};

	const handleReverseJournal = async row => {
		const isPosted = row.rawData?.is_posted || row.rawData?.posted;
		if (!isPosted) {
			toast.info(t('journals.messages.reverseInfo'));
			return;
		}

		try {
			await dispatch(reverseJournal(row.id)).unwrap();
			toast.success(t('journals.messages.reverseSuccess'));
			dispatch(fetchJournals()); // Refresh the list
		} catch (err) {
			// Display detailed error message from API response
			const errorMessage = err?.message || err?.error || err?.detail || t('journals.messages.reverseError');
			toast.error(errorMessage);
		}
	};

	const handleCreateJournal = () => {
		navigate('/journal/create');
	};

	const handleSearchChange = value => {
		setSearchTerm(value);
	};

	const handleFilterChange = value => {
		setFilterStatus(value);
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

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={confirmDelete}
				onClose={() => {
					setConfirmDelete(false);
					setJournalToDelete(null);
				}}
				onConfirm={handleConfirmDelete}
				title={t('journals.modals.deleteTitle')}
				message={t('journals.modals.deleteMessage', { name: journalToDelete?.name })}
				confirmText={t('journals.modals.deleteConfirm')}
				cancelText={t('journals.modals.cancel')}
			/>

			{/* Header */}
			<PageHeader
				title={t('journals.title')}
				subtitle={t('journals.subtitle')}
				icon={
					<svg width="29" height="35" viewBox="0 0 29 35" fill="none" xmlns="http://www.w3.org/2000/svg">
						<g opacity="0.5">
							<rect x="4.71582" y="11.7119" width="19.1169" height="19.3715" stroke="#D3D3D3" />
							<path
								d="M28.0342 30.8682C28.0342 31.7561 27.9992 32.653 27.9531 33.543C27.9452 33.6917 27.8495 33.8911 27.6348 34.0723C27.4249 34.2493 27.1425 34.3703 26.8506 34.3848H26.8496C26.7741 34.3886 26.6986 34.3901 26.623 34.3936C26.8455 34.3508 27.0557 34.2707 27.2354 34.1367C27.5193 33.925 27.6791 33.6173 27.709 33.2637C27.754 32.741 27.7393 32.2108 27.7393 31.7344C27.7393 27.8722 27.7431 24.0095 27.7471 20.1465C27.7758 20.1472 27.8038 20.15 27.8311 20.1494C27.8837 20.1483 27.9546 20.144 28.0342 20.1387V30.8682ZM27.9023 14.167C27.9421 14.1665 27.9699 14.1697 27.9883 14.1729L27.9922 14.1934C28.0048 14.3853 28.0133 14.578 28.0195 14.7715C28.023 16.5729 28.0264 18.1085 28.0264 18.5586C28.0264 18.6516 28.0181 18.7496 28.0059 18.8701C27.9978 18.9501 27.9905 19.0438 27.9834 19.1416C27.9361 19.145 27.8813 19.1479 27.8105 19.1494C27.787 19.1499 27.7661 19.1456 27.748 19.1445C27.7496 17.7228 27.7499 16.3007 27.752 14.8789V14.8652L27.751 14.8516C27.74 14.6492 27.7433 14.4463 27.7598 14.2441C27.7703 14.1842 27.784 14.1773 27.7754 14.1855C27.7712 14.1896 27.7721 14.1876 27.7861 14.1826C27.8021 14.177 27.838 14.1678 27.9023 14.167ZM0.504883 20.293L0.5 20.2812C0.500001 16.085 0.50016 11.8881 0.510742 7.69141V7.69043C0.510742 7.20161 0.502852 6.95884 0.733398 6.70508L0.734375 6.70605C1.18619 6.21551 1.79222 6.01391 2.64551 6.02148C3.68122 6.03075 4.71645 6.03633 5.75098 6.04004H5.75293C5.9196 6.04004 6.0785 6.03791 6.21387 6.02051C6.34518 6.00361 6.52409 5.96546 6.67969 5.84277C6.85185 5.7069 6.92228 5.52744 6.95312 5.37988C6.9809 5.24684 6.98448 5.0994 6.98535 4.97168C6.9889 4.45065 6.99585 3.91687 7.01855 3.39551V3.38184C7.02047 3.25203 7.06944 3.11079 7.18164 2.97656C7.29541 2.84048 7.46985 2.71905 7.69434 2.63965L7.70117 2.63672L7.70898 2.63379C8.28589 2.40943 8.94159 2.32233 9.58984 2.3877V2.38672C9.98286 2.43659 10.3325 2.44982 10.6543 2.3125C10.974 2.17604 11.1928 1.91896 11.3984 1.6709L11.3994 1.67188L11.4082 1.66016C11.5937 1.42339 11.8451 1.21021 12.1523 1.03906C12.4589 0.868358 12.8114 0.744165 13.1895 0.678711L13.1904 0.679688C13.6292 0.606016 13.939 0.519994 14.2568 0.50293L14.3936 0.5C15.393 0.513597 16.2902 0.703412 17.0234 1.15332L17.168 1.24707L17.1777 1.25391C17.3067 1.33752 17.4061 1.43332 17.4766 1.5332L17.5381 1.63477C17.6626 1.91101 17.8564 2.11389 18.1094 2.24316C18.3535 2.36782 18.6246 2.40942 18.876 2.42578V2.42676C19.0557 2.43884 19.2346 2.45336 19.4121 2.4668H17.9004C17.614 2.4668 17.5228 2.42146 17.4971 2.40332C17.4872 2.39633 17.4397 2.36454 17.3945 2.16895C17.3205 1.81274 17.1148 1.50331 16.833 1.27246L16.8193 1.26074L16.8047 1.25098L16.6572 1.15234C16.3085 0.932538 15.914 0.770134 15.4961 0.669922C15.0181 0.555301 14.5154 0.52364 14.0225 0.577148C12.8513 0.669179 11.7975 1.21298 11.5342 2.33105V2.33398C11.5229 2.3832 11.5106 2.40755 11.5049 2.41699C11.5006 2.42409 11.4986 2.42444 11.498 2.4248C11.4927 2.42847 11.4413 2.46027 11.2715 2.46191C10.4853 2.46902 9.74065 2.49563 8.98145 2.46973C8.78295 2.46295 8.58937 2.46263 8.41504 2.48535C8.23818 2.50844 8.04583 2.55991 7.87305 2.68164C7.512 2.93603 7.42169 3.3614 7.38086 3.75098L7.37988 3.75293C7.35553 3.99212 7.362 4.22443 7.37207 4.43262L7.39746 5.01758C7.39751 5.13551 7.40172 5.2726 7.43066 5.40039C7.46272 5.54156 7.53255 5.70606 7.68848 5.83398C7.8328 5.95231 7.99704 5.99452 8.12207 6.01367C8.24811 6.03294 8.39068 6.03612 8.5332 6.03613L14.3057 6.04297L14.8057 6.04395V6.0332H18.208C18.8792 6.03321 19.5721 6.04269 20.2617 6.02441C20.4958 6.01902 20.816 5.99783 21.0527 5.79688C21.3267 5.56427 21.3427 5.2305 21.3408 5.03223C21.3408 4.60897 21.3415 4.17363 21.3232 3.73535V3.7334L21.3086 3.59473C21.2552 3.27683 21.071 3.00343 20.8213 2.80957C20.6683 2.69082 20.4925 2.60298 20.3066 2.5459C20.417 2.55801 20.5271 2.57081 20.6367 2.58496H20.6396C20.898 2.61695 21.1192 2.71464 21.2725 2.84375C21.4238 2.97138 21.4918 3.1134 21.5049 3.2373C21.5591 3.83348 21.5517 4.42638 21.5664 5.06543C21.5666 5.16812 21.5706 5.29139 21.5967 5.4082C21.6267 5.54252 21.6935 5.70217 21.8447 5.82715C21.9838 5.94195 22.1415 5.98303 22.2588 6.00195C22.3775 6.02106 22.5112 6.0253 22.6436 6.02637C23.8605 6.03626 25.0325 6.01915 26.2334 6.04004H26.2354C26.7526 6.04683 27.2267 6.21481 27.5576 6.48145C27.8844 6.74498 28.0321 7.06891 28.0273 7.37109C28.0126 7.99132 28.0128 10.6083 28.0166 13.1699C27.9745 13.1671 27.9315 13.1664 27.8887 13.167C27.8405 13.1676 27.7929 13.1699 27.7461 13.1748V10.1885C27.7461 9.32058 27.746 8.45829 27.7637 7.59863H27.7646V7.58887C27.7646 7.17294 27.6126 6.79102 27.2832 6.52539C26.9696 6.27273 26.5557 6.17482 26.1191 6.1748H5.00195C4.09602 6.17481 3.18948 6.18967 2.29199 6.20215C2.11341 6.20085 1.93443 6.22663 1.76465 6.28027C1.58999 6.33552 1.42419 6.42072 1.28027 6.53418C1.13622 6.64776 1.01402 6.78996 0.929688 6.95703C0.848245 7.11838 0.806421 7.29642 0.80957 7.47949H0.808594C0.797808 8.88452 0.808842 10.2524 0.791016 11.6357V11.6396C0.780386 13.6885 0.750182 15.7559 0.751953 17.8145C0.751953 19.6295 0.759129 21.446 0.767578 23.2617L0.791016 28.7051V32.9004C0.791079 33.3676 0.976214 33.782 1.33301 34.0684C1.67693 34.3443 2.13334 34.4648 2.625 34.4648H23.7539L23.3809 34.4707C22.4691 34.4832 21.5641 34.4707 20.6387 34.4707H4.34766C3.74334 34.4707 3.12855 34.4828 2.5332 34.4883L2.28223 34.4844C1.71518 34.4577 1.28162 34.3222 0.992188 34.1201C0.72331 33.9324 0.55028 33.6694 0.512695 33.2939L0.504883 33.126C0.519112 28.8827 0.504883 24.6368 0.504883 20.3955V20.293Z"
								fill="white"
								stroke="#D3D3D3"
							/>
							<path
								d="M24.3203 11.26C24.5259 11.26 24.6574 11.2658 24.7461 11.2776C24.7513 11.3333 24.7559 11.4142 24.7559 11.5364L24.7705 31.1614C24.7705 31.3961 24.7529 31.6179 24.7383 31.8743C24.4032 31.8895 24.0818 31.9055 23.7617 31.9055H23.6104C23.796 31.8842 23.9798 31.8189 24.1348 31.7024C24.3223 31.5613 24.4647 31.3444 24.4863 31.0823L24.4883 31.0833C24.4994 30.992 24.5067 30.9004 24.5117 30.8088L24.5186 30.5344C24.5174 27.7206 24.5149 24.9068 24.5127 22.093H24.5234V12.5471C24.5234 12.2228 24.5059 11.7707 24.1475 11.4875C23.9789 11.3545 23.7826 11.2982 23.6055 11.2698C23.5804 11.2658 23.5545 11.2632 23.5283 11.26H24.3203ZM3.77441 11.3704C3.77441 11.3303 3.77501 11.295 3.77539 11.2639C3.78717 11.2635 3.79951 11.2623 3.8125 11.262L4.04883 11.26H4.84375C4.67849 11.2909 4.51793 11.3479 4.37988 11.4514C4.07936 11.6768 4.01742 12.0084 4.02344 12.2795C4.04318 13.2208 4.04222 14.1195 4.05859 15.0735C4.05937 15.218 4.0801 15.3577 4.09277 15.4534C4.10009 15.5086 4.105 15.5534 4.1084 15.592L4.1123 15.6936C4.10573 15.8991 4.08685 16.1045 4.06738 16.3333C4.05791 16.4445 4.04794 16.5609 4.04102 16.6799L4.03027 17.0422C4.03027 18.5352 4.06936 20.0657 4.07812 21.5432V30.717C4.07812 30.8538 4.08194 31.0056 4.11133 31.1458C4.14321 31.2977 4.21068 31.4662 4.35742 31.6057C4.49657 31.738 4.6629 31.8013 4.80762 31.8381C4.92677 31.8684 5.06116 31.8853 5.20312 31.8997L4.11914 31.8948C3.94998 31.8929 3.8387 31.8846 3.7627 31.8743C3.75985 31.8335 3.75879 31.7771 3.75879 31.6995V21.802L3.77441 21.7913V11.3704Z"
								fill="white"
								stroke="#D3D3D3"
							/>
							<path
								d="M16.4912 27.2781V27.3162H20.7559C20.781 27.3162 20.8173 27.3219 20.8604 27.3367C20.863 27.3376 20.8655 27.3386 20.8682 27.3396C20.8598 27.3432 20.8522 27.3482 20.8438 27.3513C20.7972 27.3683 20.7602 27.3737 20.7373 27.3738H14.1689L14.1562 27.3748C13.841 27.3909 13.5243 27.3904 13.209 27.3748C13.1322 27.3662 13.0702 27.3496 13.0205 27.3328C13.1048 27.3043 13.2009 27.2869 13.3037 27.2888H13.3223C14.3765 27.2709 15.4297 27.2762 16.4912 27.2781Z"
								fill="#187FC3"
								stroke="#D3D3D3"
							/>
							<path
								d="M20.6758 19.4719C20.7255 19.4693 20.7744 19.4747 20.8184 19.4866C20.8411 19.4927 20.8614 19.4998 20.8789 19.5081C20.8219 19.5275 20.7459 19.5449 20.6533 19.5452C18.4238 19.5535 16.1943 19.5591 13.9648 19.5637C13.674 19.5637 13.378 19.5489 13.0703 19.5295L13.0576 19.5286H13.0449C13.0128 19.5282 12.9834 19.5223 12.959 19.5139C12.9438 19.5087 12.933 19.5014 12.9248 19.4963C12.9249 19.4932 12.9256 19.4903 12.9258 19.4875C12.9593 19.4813 13.0099 19.4751 13.083 19.4749H16.8926V19.4719H20.6758Z"
								fill="#187FC3"
								stroke="#D3D3D3"
							/>
							<path
								d="M18.4434 23.4265H17.3711V23.4207C17.7285 23.422 18.086 23.4248 18.4434 23.4265Z"
								fill="#187FC3"
								stroke="#D3D3D3"
							/>
							<mask id="path-7-inside-1_139_14112" fill="white">
								<path d="M16.884 16.0946H13.1585C12.5966 16.0946 12.417 15.9737 12.417 15.5958C12.417 15.2623 12.6233 15.1052 13.1443 15.1052C15.6576 15.0997 18.1697 15.0997 20.6806 15.1052C21.1002 15.1052 21.5163 15.3832 21.495 15.6208C21.4737 15.8584 21.0718 16.096 20.6539 16.096H16.884V16.0946Z" />
							</mask>
							<path
								d="M16.884 16.0946H13.1585C12.5966 16.0946 12.417 15.9737 12.417 15.5958C12.417 15.2623 12.6233 15.1052 13.1443 15.1052C15.6576 15.0997 18.1697 15.0997 20.6806 15.1052C21.1002 15.1052 21.5163 15.3832 21.495 15.6208C21.4737 15.8584 21.0718 16.096 20.6539 16.096H16.884V16.0946Z"
								fill="#187FC3"
							/>
							<path
								d="M16.884 16.0946H17.884V15.0946H16.884V16.0946ZM13.1443 15.1052V16.1052L13.1465 16.1052L13.1443 15.1052ZM20.6806 15.1052L20.6783 16.1052H20.6806V15.1052ZM16.884 16.096H15.884V17.096H16.884V16.096ZM16.884 16.0946V15.0946H13.1585V16.0946V17.0946H16.884V16.0946ZM13.1585 16.0946V15.0946C13.0473 15.0946 12.9965 15.0881 12.9826 15.0856C12.9674 15.0829 13.0387 15.0923 13.1353 15.1572C13.25 15.2344 13.3366 15.3467 13.3832 15.464C13.4214 15.5602 13.417 15.6206 13.417 15.5958H12.417H11.417C11.417 15.9326 11.503 16.4696 12.0188 16.8166C12.4089 17.0791 12.8749 17.0946 13.1585 17.0946V16.0946ZM12.417 15.5958H13.417C13.417 15.6122 13.4148 15.6867 13.3707 15.7857C13.322 15.8948 13.2436 15.9858 13.1552 16.0471C13.1154 16.0747 13.0809 16.0912 13.0577 16.1005C13.0349 16.1097 13.0214 16.1126 13.0213 16.1126C13.0211 16.1126 13.0306 16.1106 13.0522 16.1087C13.0736 16.1068 13.1038 16.1052 13.1443 16.1052V15.1052V14.1052C12.8259 14.1052 12.3887 14.1448 12.0153 14.4038C11.5564 14.7221 11.417 15.2011 11.417 15.5958H12.417ZM13.1443 15.1052L13.1465 16.1052C15.6583 16.0997 18.1689 16.0997 20.6783 16.1052L20.6806 15.1052L20.6828 14.1052C18.1704 14.0997 15.6568 14.0997 13.1421 14.1052L13.1443 15.1052ZM20.6806 15.1052V16.1052C20.6769 16.1052 20.6834 16.105 20.6964 16.109C20.7099 16.1131 20.7157 16.1172 20.7112 16.1143C20.7084 16.1125 20.699 16.1062 20.6851 16.0936C20.6717 16.0814 20.6486 16.0584 20.6226 16.022C20.5767 15.9579 20.4762 15.7851 20.499 15.5313L21.495 15.6208L22.491 15.7102C22.5244 15.3376 22.3799 15.041 22.2489 14.8579C22.1153 14.6712 21.9488 14.5326 21.7951 14.4335C21.4909 14.2373 21.0955 14.1052 20.6806 14.1052V15.1052ZM21.495 15.6208L20.499 15.5313C20.5174 15.3261 20.609 15.1977 20.6505 15.1487C20.6741 15.1209 20.6939 15.1036 20.7053 15.0944C20.717 15.0851 20.7243 15.0808 20.7257 15.08C20.7272 15.0791 20.7178 15.0844 20.6992 15.0894C20.6812 15.0942 20.6649 15.096 20.6539 15.096V16.096V17.096C21.0401 17.096 21.4163 16.9895 21.7206 16.815C21.9637 16.6756 22.4355 16.3277 22.491 15.7102L21.495 15.6208ZM20.6539 16.096V15.096H16.884V16.096V17.096H20.6539V16.096ZM16.884 16.096H17.884V16.0946H16.884H15.884V16.096H16.884Z"
								fill="#D3D3D3"
								mask="url(#path-7-inside-1_139_14112)"
							/>
							<path
								d="M10.3359 18.5115C10.4131 18.503 10.4873 18.5139 10.5479 18.5359C9.95944 19.2054 9.37307 19.8615 8.7666 20.5105C8.78094 20.4958 8.78791 20.4942 8.77344 20.5027C8.75907 20.5111 8.73549 20.5226 8.69629 20.5398C8.66467 20.5537 8.63619 20.5645 8.59961 20.5798C8.57599 20.57 8.55663 20.5628 8.5332 20.5525C8.50928 20.5419 8.49482 20.5346 8.48633 20.53L8.47949 20.5232L8.25977 20.2908C8.07416 20.0831 7.91115 19.865 7.76855 19.6404V19.6394C7.86454 19.6553 7.9655 19.679 8.0293 19.7009L8.0332 19.7029C8.16265 19.7459 8.41893 19.8428 8.66895 19.8308C8.81657 19.8237 8.96815 19.7815 9.11035 19.6882C9.24685 19.5986 9.35196 19.4776 9.43555 19.3455L9.43652 19.3445C9.50536 19.235 9.60462 19.1209 9.7373 18.9871C9.84294 18.8805 10.007 18.7234 10.1387 18.5867C10.1756 18.5553 10.2431 18.5216 10.3359 18.5115Z"
								fill="#187FC3"
								stroke="#D3D3D3"
							/>
							<path
								d="M10.5186 14.5574C10.5329 14.567 10.5463 14.58 10.5625 14.5925C9.98571 15.2194 9.43228 15.8617 8.88477 16.4841L8.88379 16.4861C8.8479 16.5273 8.76954 16.5772 8.6748 16.5984C8.57574 16.6205 8.54448 16.595 8.55762 16.6042V16.6033L8.54688 16.5964L8.35547 16.4656C8.00272 16.2166 7.78114 16.0036 7.69531 15.7429C7.76629 15.7397 7.83814 15.7395 7.9043 15.7449C7.96061 15.7495 8.00521 15.757 8.03711 15.7654C8.07106 15.7743 8.07591 15.7807 8.06445 15.7732L8.06641 15.7742C8.2247 15.8773 8.47799 16.0279 8.77734 15.9783C9.06765 15.9299 9.25377 15.7115 9.34375 15.6101C9.6804 15.2327 10.0553 14.8756 10.4639 14.5408C10.4673 14.5379 10.4698 14.5341 10.4727 14.532C10.483 14.5371 10.4987 14.544 10.5186 14.5574Z"
								fill="#187FC3"
								stroke="#D3D3D3"
							/>
							<path
								d="M10.373 26.3359C10.4295 26.327 10.4862 26.3282 10.5391 26.3369C9.94175 27.0176 9.33513 27.6927 8.71777 28.3604L8.71582 28.3623C8.68175 28.3996 8.64614 28.4106 8.61621 28.4102C8.58498 28.4096 8.54167 28.396 8.5 28.3506L8.49805 28.3477L8.16016 28.0059C8.05815 27.9042 7.97084 27.8136 7.89648 27.7236C7.83284 27.6321 7.77643 27.538 7.72363 27.4434C7.72667 27.4411 7.72851 27.4385 7.73047 27.4375C7.7412 27.4319 7.79458 27.4088 7.90723 27.4609C8.18296 27.5886 8.48736 27.6719 8.80078 27.6074C9.12542 27.5406 9.35966 27.3366 9.53516 27.1045L9.53418 27.1035C9.7121 26.8701 9.90867 26.706 10.1787 26.4199C10.2134 26.3874 10.2793 26.3508 10.373 26.3359Z"
								fill="#187FC3"
								stroke="#D3D3D3"
							/>
							<path
								d="M10.4932 22.3647C10.509 22.3772 10.5245 22.3897 10.5391 22.4009C10.5489 22.4084 10.5585 22.4155 10.5674 22.4224C9.98604 23.0742 9.40928 23.7275 8.83301 24.3765C8.83079 24.3775 8.82856 24.3799 8.8252 24.3813C8.8016 24.3913 8.76307 24.4021 8.71289 24.4087C8.60486 24.4229 8.50755 24.4079 8.45801 24.3872H8.45605C8.45686 24.3872 8.40585 24.3588 8.30566 24.2632C8.21383 24.1755 8.11052 24.0602 8.01172 23.9351C7.91299 23.81 7.82478 23.6833 7.76074 23.5757C7.89056 23.5817 8.01671 23.6061 8.12988 23.6509C8.27136 23.7206 8.48144 23.8143 8.7168 23.7925C9.00532 23.7657 9.19718 23.5876 9.32324 23.4458L9.32227 23.4448C9.67005 23.0598 10.044 22.6892 10.4404 22.3325C10.4523 22.3382 10.4705 22.347 10.4932 22.3647Z"
								fill="#187FC3"
								stroke="#D3D3D3"
							/>
						</g>
					</svg>
				}
			/>

			<div className="w-[95%] mx-auto py-6 space-y-6">
				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{statCards.map((card, index) => (
						<div
							key={index}
							className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative overflow-hidden"
						>
							<StatPattern />
							<div className="relative z-10 flex items-center justify-between">
								<div className="flex flex-row items-center gap-2">
									<div className="text-[#28819C] opacity-80">{card.icon}</div>

									<p className="text-[#000000] text-lg">{card.title}</p>
								</div>
								<p className="text-3xl font-bold text-[#28819C]">{card.value}</p>
							</div>
						</div>
					))}
				</div>

				{/* Toolbar */}
				<Toolbar
					searchPlaceholder={t('journals.toolbar.searchPlaceholder')}
					filterOptions={[
						{ value: '', label: t('journals.toolbar.filterAll') },
						{ value: 'posted', label: t('journals.toolbar.posted') },
						{ value: 'draft', label: t('journals.toolbar.draft') },
					]}
					createButtonText={t('journals.toolbar.newJournal')}
					onSearchChange={handleSearchChange}
					onFilterChange={handleFilterChange}
					onCreateClick={handleCreateJournal}
				/>

				{/* Table Section */}
				{loading ? (
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
						<div className="flex items-center justify-center gap-2">
							<div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
							<span className="text-gray-600">{t('journals.table.loading')}</span>
						</div>
					</div>
				) : (
					<Table
						columns={columns}
						data={journalEntries}
						onDelete={handleDelete}
						onEdit={handleView}
						className="mb-8"
						emptyMessage={t('journals.table.emptyMessage')}
					/>
				)}
			</div>
		</div>
	);
};

export default JournalEntriesPage;
