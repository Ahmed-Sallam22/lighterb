import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/shared/PageHeader';
import Table from '../components/shared/Table';
import SlideUpModal from '../components/shared/SlideUpModal';
import FloatingLabelInput from '../components/shared/FloatingLabelInput';
import FloatingLabelSelect from '../components/shared/FloatingLabelSelect';
import ConfirmModal from '../components/shared/ConfirmModal';
import {
	fetchInvoiceApprovals,
	createInvoiceApproval,
	updateInvoiceApproval,
	deleteInvoiceApproval,
	approveInvoice,
	rejectInvoice,
} from '../store/invoiceApprovalsSlice';
import { fetchARInvoices } from '../store/arInvoicesSlice';
import { fetchAPInvoices } from '../store/apInvoicesSlice';

const InvoiceApprovalsPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === 'rtl';
	const dispatch = useDispatch();

	const { approvals, loading } = useSelector(state => state.invoiceApprovals);
	const { invoices: arInvoices } = useSelector(state => state.arInvoices);
	const { invoices: apInvoices } = useSelector(state => state.apInvoices);

	const [activeTab, setActiveTab] = useState('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedType, setSelectedType] = useState('all');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
	const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
	const [editingApproval, setEditingApproval] = useState(null);
	const [deleteId, setDeleteId] = useState(null);
	const [actionId, setActionId] = useState(null);
	const [formData, setFormData] = useState({
		invoice_type: '',
		invoice_id: '',
		submitted_by: '',
	});
	const [actionComments, setActionComments] = useState('');
	const [availableInvoices, setAvailableInvoices] = useState([]);

	useEffect(() => {
		dispatch(fetchInvoiceApprovals());
		dispatch(fetchARInvoices());
		dispatch(fetchAPInvoices());
	}, [dispatch]);

	// Update available invoices when invoice type changes
	useEffect(() => {
		if (formData.invoice_type === 'AR') {
			setAvailableInvoices(arInvoices || []);
		} else if (formData.invoice_type === 'AP') {
			setAvailableInvoices(apInvoices || []);
		} else {
			setAvailableInvoices([]);
		}
		// Reset invoice_id when invoice type changes
		setFormData(prev => ({ ...prev, invoice_id: '' }));
	}, [formData.invoice_type, arInvoices, apInvoices]);

	const handleCreate = () => {
		setEditingApproval(null);
		setFormData({
			invoice_type: '',
			invoice_id: '',
			submitted_by: '',
		});
		setIsModalOpen(true);
	};

	const handleEdit = approval => {
		setEditingApproval(approval);
		setFormData({
			invoice_type: approval.invoice_type,
			invoice_id: approval.invoice_id.toString(),
			submitted_by: approval.submitted_by,
		});
		setIsModalOpen(true);
	};

	const handleDelete = id => {
		setDeleteId(id?.id);
		setIsDeleteModalOpen(true);
	};

	const confirmDelete = async () => {
		try {
			await dispatch(deleteInvoiceApproval(deleteId)).unwrap();
			toast.success(t('invoiceApprovals.messages.deleteSuccess'));
			setIsDeleteModalOpen(false);
			setDeleteId(null);
		} catch (error) {
			toast.error(error || t('invoiceApprovals.messages.deleteError'));
		}
	};

	const handleApprove = id => {
		setActionId(id);
		setActionComments('');
		setIsApproveModalOpen(true);
	};

	const handleReject = id => {
		setActionId(id);
		setActionComments('');
		setIsRejectModalOpen(true);
	};

	const confirmApprove = async () => {
		try {
			await dispatch(
				approveInvoice({
					id: actionId,
					approvalData: {
						approver: 'Current User', // Replace with actual user
						comments: actionComments,
					},
				})
			).unwrap();
			toast.success(t('invoiceApprovals.messages.approveSuccess'));
			setIsApproveModalOpen(false);
			setActionId(null);
			setActionComments('');
		} catch (error) {
			toast.error(error || t('invoiceApprovals.messages.approveError'));
		}
	};

	const confirmReject = async () => {
		try {
			await dispatch(
				rejectInvoice({
					id: actionId,
					approvalData: {
						approver: 'Current User', // Replace with actual user
						comments: actionComments,
					},
				})
			).unwrap();
			toast.success(t('invoiceApprovals.messages.rejectSuccess'));
			setIsRejectModalOpen(false);
			setActionId(null);
			setActionComments('');
		} catch (error) {
			toast.error(error || t('invoiceApprovals.messages.rejectError'));
		}
	};

	const handleSubmit = async () => {
		// Validation
		if (!formData.invoice_type || !formData.invoice_id || !formData.submitted_by) {
			toast.error(t('invoiceApprovals.messages.fillRequired'));
			return;
		}

		const approvalData = {
			invoice_type: formData.invoice_type,
			invoice_id: parseInt(formData.invoice_id),
			submitted_by: formData.submitted_by,
		};

		try {
			if (editingApproval) {
				await dispatch(
					updateInvoiceApproval({
						id: editingApproval.id,
						approvalData,
					})
				).unwrap();
				toast.success(t('invoiceApprovals.messages.updateSuccess'));
			} else {
				await dispatch(createInvoiceApproval(approvalData)).unwrap();
				toast.success(t('invoiceApprovals.messages.createSuccess'));
			}
			setIsModalOpen(false);
			setFormData({
				invoice_type: '',
				invoice_id: '',
				submitted_by: '',
			});
		} catch (error) {
			toast.error(error || t('invoiceApprovals.messages.saveError'));
		}
	};

	const handleChange = (field, value) => {
		setFormData(prev => ({
			...prev,
			[field]: value,
		}));
	};

	// Map API data to table format
	const mappedApprovals = approvals.map(approval => ({
		id: approval.id,
		type:
			approval.invoice_type === 'AP'
				? t('invoiceApprovals.actions.apInvoice')
				: t('invoiceApprovals.actions.arInvoice'),
		invoiceNumber: `INV-${approval.invoice_id}`,
		submittedBy: approval.submitted_by,
		approver: approval.approver || t('invoiceApprovals.form.na'),
		// Keep internal status for logic, translate in render
		status:
			approval.status === 'PENDING_APPROVAL'
				? 'Pending'
				: approval.status === 'APPROVED'
				? 'Approved'
				: 'Rejected',
		submittedDate: new Date(approval.submitted_at).toLocaleDateString(),
		rawStatus: approval.status,
		rawType: approval.invoice_type === 'AP' ? 'AP Invoice' : 'AR Invoice', // Used for filtering
	}));

	// Use real data if available, otherwise use sample data
	const displayApprovals = approvals.length > 0 ? mappedApprovals : [];

	// Calculate counts for tabs
	const getCounts = () => {
		return {
			all: displayApprovals.length,
			approved: displayApprovals.filter(a => a.status === 'Approved').length,
			pending: displayApprovals.filter(a => a.status === 'Pending').length,
			rejected: displayApprovals.filter(a => a.status === 'Rejected').length,
		};
	};

	const counts = getCounts();

	// Statistics cards data
	const statsCards = [
		{
			title: t('invoiceApprovals.stats.totals'),
			count: counts.all,
			icon: (
				<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="56" height="56" rx="28" fill="#F5F7FA" />
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M19.8313 10.0831C19.9114 10.0831 19.9927 10.0831 20.0751 10.0831H35.9251C36.0076 10.0831 36.0888 10.0831 36.1689 10.0831C37.8635 10.0823 39.0297 10.0818 40.0119 10.4236C41.8669 11.069 43.307 12.5618 43.9245 14.4423L42.7369 14.8322L43.9245 14.4423C44.2512 15.4375 44.2508 16.6206 44.2502 18.3773C44.2501 18.4559 44.2501 18.5356 44.2501 18.6166V41.9568C44.2501 44.3989 41.3718 45.8527 39.4761 44.118C39.3436 43.9968 39.1566 43.9968 39.0241 44.118L38.219 44.8548C36.672 46.2704 34.3282 46.2704 32.7813 44.8548C32.1896 44.3134 31.3106 44.3134 30.719 44.8548C29.172 46.2704 26.8282 46.2704 25.2813 44.8548C24.6896 44.3134 23.8106 44.3134 23.219 44.8548C21.672 46.2704 19.3282 46.2704 17.7813 44.8548L16.9761 44.118C16.8436 43.9968 16.6566 43.9968 16.5241 44.118C14.6284 45.8527 11.7501 44.3989 11.7501 41.9568V18.6166C11.7501 18.5356 11.7501 18.4559 11.7501 18.3773C11.7494 16.6206 11.749 15.4375 12.0757 14.4423C12.6932 12.5618 14.1334 11.069 15.9883 10.4236C16.9705 10.0818 18.1367 10.0823 19.8313 10.0831ZM20.0751 12.5831C18.04 12.5831 17.339 12.6006 16.8099 12.7847C15.7109 13.1671 14.832 14.0618 14.451 15.2222C14.2659 15.7861 14.2501 16.5296 14.2501 18.6166V41.9568C14.2501 42.1553 14.35 42.2765 14.4753 42.3344C14.5406 42.3646 14.6044 42.3724 14.6576 42.3653C14.7045 42.3591 14.7652 42.3388 14.8364 42.2737C15.9242 41.2782 17.576 41.2782 18.6638 42.2737L19.469 43.0104C20.0606 43.5518 20.9396 43.5518 21.5313 43.0104C23.0782 41.5948 25.422 41.5948 26.969 43.0104C27.5606 43.5518 28.4396 43.5518 29.0313 43.0104C30.5782 41.5948 32.922 41.5948 34.469 43.0104C35.0606 43.5518 35.9396 43.5518 36.5313 43.0104L37.3364 42.2737C38.4242 41.2782 40.076 41.2782 41.1638 42.2737C41.235 42.3388 41.2957 42.3591 41.3426 42.3653C41.3958 42.3724 41.4597 42.3646 41.5249 42.3345C41.6502 42.2765 41.7501 42.1553 41.7501 41.9568V18.6166C41.7501 16.5296 41.7344 15.7861 41.5492 15.2222C41.1682 14.0618 40.2893 13.1671 39.1903 12.7847C38.6612 12.6006 37.9602 12.5831 35.9251 12.5831H20.0751ZM18.4168 20.4998C18.4168 19.8095 18.9764 19.2498 19.6668 19.2498H20.5001C21.1905 19.2498 21.7501 19.8095 21.7501 20.4998C21.7501 21.1902 21.1905 21.7498 20.5001 21.7498H19.6668C18.9764 21.7498 18.4168 21.1902 18.4168 20.4998ZM24.2501 20.4998C24.2501 19.8095 24.8098 19.2498 25.5001 19.2498H36.3334C37.0238 19.2498 37.5834 19.8095 37.5834 20.4998C37.5834 21.1902 37.0238 21.7498 36.3334 21.7498H25.5001C24.8098 21.7498 24.2501 21.1902 24.2501 20.4998ZM18.4168 26.3331C18.4168 25.6428 18.9764 25.0831 19.6668 25.0831H20.5001C21.1905 25.0831 21.7501 25.6428 21.7501 26.3331C21.7501 27.0235 21.1905 27.5831 20.5001 27.5831H19.6668C18.9764 27.5831 18.4168 27.0235 18.4168 26.3331ZM24.2501 26.3331C24.2501 25.6428 24.8098 25.0831 25.5001 25.0831H36.3334C37.0238 25.0831 37.5834 25.6428 37.5834 26.3331C37.5834 27.0235 37.0238 27.5831 36.3334 27.5831H25.5001C24.8098 27.5831 24.2501 27.0235 24.2501 26.3331ZM18.4168 32.1665C18.4168 31.4761 18.9764 30.9165 19.6668 30.9165H20.5001C21.1905 30.9165 21.7501 31.4761 21.7501 32.1665C21.7501 32.8568 21.1905 33.4165 20.5001 33.4165H19.6668C18.9764 33.4165 18.4168 32.8568 18.4168 32.1665ZM24.2501 32.1665C24.2501 31.4761 24.8098 30.9165 25.5001 30.9165H36.3334C37.0238 30.9165 37.5834 31.4761 37.5834 32.1665C37.5834 32.8568 37.0238 33.4165 36.3334 33.4165H25.5001C24.8098 33.4165 24.2501 32.8568 24.2501 32.1665Z"
						fill="#28819C"
					/>
				</svg>
			),
		},
		{
			title: t('invoiceApprovals.stats.approved'),
			count: counts.approved,
			icon: (
				<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="56" height="56" rx="28" fill="#F5F7FA" />
					<g clipPath="url(#clip0_102_16946)">
						<path
							d="M18.6673 27.9997L26.6673 34.6663L37.334 21.333M28.0006 46.6663C25.5493 46.6663 23.122 46.1835 20.8572 45.2454C18.5925 44.3073 16.5347 42.9324 14.8013 41.199C13.068 39.4656 11.693 37.4078 10.7549 35.1431C9.81681 32.8784 9.33398 30.451 9.33398 27.9997C9.33398 25.5483 9.81681 23.121 10.7549 20.8563C11.693 18.5915 13.068 16.5337 14.8013 14.8003C16.5347 13.067 18.5925 11.692 20.8572 10.7539C23.122 9.81584 25.5493 9.33301 28.0006 9.33301C32.9514 9.33301 37.6993 11.2997 41.2 14.8003C44.7007 18.301 46.6673 23.049 46.6673 27.9997C46.6673 32.9504 44.7007 37.6983 41.2 41.199C37.6993 44.6997 32.9514 46.6663 28.0006 46.6663Z"
							stroke="#00A350"
							strokeWidth="2.66667"
						/>
					</g>
					<defs>
						<clipPath id="clip0_102_16946">
							<rect width="40" height="40" fill="white" transform="translate(8 8)" />
						</clipPath>
					</defs>
				</svg>
			),
		},
		{
			title: t('invoiceApprovals.stats.pending'),
			count: counts.pending,
			icon: (
				<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="56" height="56" rx="28" fill="#F5F7FA" />
					<circle cx="28.0007" cy="27.9997" r="16.6667" stroke="#FFC043" strokeWidth="2.5" />
					<path
						d="M28 21.333V27.9997L32.1667 32.1663"
						stroke="#FFC043"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			),
		},
		{
			title: t('invoiceApprovals.stats.rejected'),
			count: counts.rejected,
			icon: (
				<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="56" height="56" rx="28" fill="#F5F7FA" />
					<path
						d="M27.9998 43.2379C36.4156 43.2379 43.2379 36.4156 43.2379 27.9998C43.2379 19.584 36.4156 12.7617 27.9998 12.7617C19.584 12.7617 12.7617 19.584 12.7617 27.9998C12.7617 36.4156 19.584 43.2379 27.9998 43.2379Z"
						stroke="#D44333"
						strokeWidth="1.90476"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M22.2852 22.2861L33.7137 33.7147M33.7137 22.2861L22.2852 33.7147"
						stroke="#D44333"
						strokeWidth="1.90476"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			),
		},
	];

	// Table columns
	const columns = [
		{
			header: t('invoiceApprovals.table.type'),
			accessor: 'type',
			width: '140px',
			render: value => <span className="font-semibold text-gray-900">{value}</span>,
		},
		{
			header: t('invoiceApprovals.table.invoiceNumber'),
			accessor: 'invoiceNumber',
			width: '150px',
			render: value => <span className="font-semibold text-[#28819C]">{value}</span>,
		},
		{
			header: t('invoiceApprovals.table.submittedBy'),
			accessor: 'submittedBy',
			render: value => <span className="text-gray-900">{value}</span>,
		},
		{
			header: t('invoiceApprovals.table.approver'),
			accessor: 'approver',
			render: value => <span className="text-gray-900">{value}</span>,
		},
		{
			header: t('invoiceApprovals.table.status'),
			accessor: 'status',
			width: '120px',
			render: value => (
				<span
					className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
						value === 'Approved'
							? 'bg-green-100 text-green-800'
							: value === 'Pending'
							? 'bg-yellow-100 text-yellow-800'
							: value === 'Rejected'
							? 'bg-red-100 text-red-800'
							: 'bg-gray-100 text-gray-800'
					}`}
				>
					{t(`invoiceApprovals.table.statusValues.${value.toLowerCase()}`)}
				</span>
			),
		},
		{
			header: t('invoiceApprovals.table.submittedDate'),
			accessor: 'submittedDate',
			width: '150px',
			render: value => <span className="text-gray-700">{value}</span>,
		},
		{
			header: t('invoiceApprovals.table.actions'),
			accessor: 'id',
			width: '200px',
			render: (value, row) => (
				<div className="flex gap-2">
					{row.status === 'Pending' && (
						<>
							<button
								onClick={() => handleApprove(value)}
								className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium"
							>
								{t('invoiceApprovals.actions.approve')}
							</button>
							<button
								onClick={() => handleReject(value)}
								className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium"
							>
								{t('invoiceApprovals.actions.reject')}
							</button>
						</>
					)}
				</div>
			),
		},
	];

	// Filter data based on active tab
	const getFilteredData = () => {
		let filtered = displayApprovals;

		// Filter by tab
		if (activeTab !== 'all') {
			filtered = filtered.filter(item => item.status.toLowerCase() === activeTab.toLowerCase());
		}

		// Filter by type
		if (selectedType !== 'all') {
			filtered = filtered.filter(item => item.rawType === selectedType);
		}

		// Filter by search
		if (searchQuery) {
			filtered = filtered.filter(
				item =>
					item.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.approver.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		return filtered;
	};

	const tabs = [
		{ id: 'all', label: t('invoiceApprovals.tabs.all'), count: counts.all },
		{ id: 'approved', label: t('invoiceApprovals.tabs.approved'), count: counts.approved },
		{ id: 'pending', label: t('invoiceApprovals.tabs.pending'), count: counts.pending },
		{ id: 'rejected', label: t('invoiceApprovals.tabs.rejected'), count: counts.rejected },
	];

	return (
		<div className="min-h-screen bg-gray-50">
			<PageHeader
				title={t('invoiceApprovals.title')}
				subtitle={t('invoiceApprovals.subtitle')}
				icon={
					<svg width="29" height="35" viewBox="0 0 29 35" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M5.83125 0.0830994C5.91135 0.0830994 5.99265 0.0830994 6.07509 0.0830994H21.9251C22.0076 0.0830994 22.0888 0.0830994 22.1689 0.0830994C23.8635 0.0822937 25.0297 0.0818024 26.0119 0.423639C27.8669 1.06904 29.307 2.56176 29.9245 4.44232C30.2512 5.43754 30.2508 6.62062 30.2502 8.37732C30.2501 8.45589 30.2501 8.53557 30.2501 8.61659V31.9568C30.2501 34.3989 27.3718 35.8527 25.4761 34.118C25.3436 33.9968 25.1566 33.9968 25.0241 34.118L24.219 34.8548C22.672 36.2704 20.3282 36.2704 18.7813 34.8548C18.1896 34.3134 17.3106 34.3134 16.719 34.8548C15.172 36.2704 12.8282 36.2704 11.2813 34.8548C10.6896 34.3134 9.81057 34.3134 9.21895 34.8548C7.67199 36.2704 5.32819 36.2704 3.78124 34.8548L2.97609 34.118C2.84358 33.9968 2.65659 33.9968 2.52408 34.118C0.628358 35.8527 -2.24988 34.3989 -2.24988 31.9568V8.61659C-2.24988 8.53557 -2.24989 8.45589 -2.24989 8.37732C-2.25057 6.62062 -2.25098 5.43754 -2.07568 4.44232C-1.45819 2.56176 -0.0180215 1.06904 1.83689 0.423639C2.81905 0.0818024 3.98526 0.0822937 5.67988 0.0830994H5.83125Z"
							fill="#28819C"
						/>
					</svg>
				}
			/>

			<div className="w-[95%] mx-auto px-6 py-8">
				{/* Header with Title and Buttons */}
				<div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
					<h2 className="text-2xl font-bold text-gray-900">{t('invoiceApprovals.title')}</h2>
					<div className="flex gap-3">
						{/* Create Button */}
						<button
							onClick={handleCreate}
							className="px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#1f6477] transition-colors duration-200 font-medium"
						>
							{t('invoiceApprovals.actions.createApproval')}
						</button>
						{/* Search Button */}
						<div className="relative">
							<input
								type="text"
								placeholder={t('invoiceApprovals.actions.searchPlaceholder')}
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className={`px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28819C] focus:border-transparent ${
									isRtl ? 'text-right' : 'text-left'
								}`}
							/>
						</div>
						{/* Type Filter */}
						<select
							value={selectedType}
							onChange={e => setSelectedType(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28819C] focus:border-transparent bg-white"
						>
							<option value="all">{t('invoiceApprovals.actions.filterAllTypes')}</option>
							<option value="AP Invoice">{t('invoiceApprovals.actions.apInvoice')}</option>
							<option value="AR Invoice">{t('invoiceApprovals.actions.arInvoice')}</option>
						</select>
					</div>
				</div>

				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					{statsCards.map((card, index) => (
						<div
							key={index}
							className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
						>
							<div className="flex justify-between items-center">
								<div className="flex flex-col">
									<h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
									<p className="text-3xl font-bold text-gray-900">{card.count}</p>
								</div>
								<div>{card.icon}</div>
							</div>
						</div>
					))}
				</div>

				{/* Tabs */}
				<div className="bg-white rounded-lg shadow-sm mb-6">
					<div className="border-b border-gray-200">
						<nav className="flex -mb-px">
							{tabs.map(tab => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${
										activeTab === tab.id
											? 'border-[#28819C] text-[#28819C]'
											: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
									}`}
								>
									{tab.label}
									<span
										className={`mx-2 py-0.5 px-2 rounded-full text-xs ${
											activeTab === tab.id
												? 'bg-[#28819C] text-white'
												: 'bg-gray-200 text-gray-600'
										}`}
									>
										{tab.count}
									</span>
								</button>
							))}
						</nav>
					</div>
				</div>

				{/* Table */}
				<Table
					columns={columns}
					data={getFilteredData()}
					onEdit={row => (row.status === 'Pending' ? handleEdit(row) : null)}
					onDelete={row => (row.status === 'Pending' ? handleDelete(row) : null)}
					showActions={row => row.status === 'Pending'}
				/>
			</div>

			{/* Create/Edit Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setFormData({
						invoice_type: '',
						invoice_id: '',
						submitted_by: '',
					});
				}}
				title={
					editingApproval ? t('invoiceApprovals.modals.editTitle') : t('invoiceApprovals.modals.createTitle')
				}
			>
				<div className="space-y-4">
					<FloatingLabelSelect
						label={t('invoiceApprovals.form.invoiceType')}
						value={formData.invoice_type}
						onChange={e => handleChange('invoice_type', e.target.value)}
						options={[
							{ value: 'AP', label: t('invoiceApprovals.actions.apInvoice') },
							{ value: 'AR', label: t('invoiceApprovals.actions.arInvoice') },
						]}
						required
					/>

					<FloatingLabelSelect
						label={t('invoiceApprovals.form.invoice')}
						value={formData.invoice_id}
						onChange={e => handleChange('invoice_id', e.target.value)}
						options={availableInvoices.map(invoice => ({
							value: invoice.id.toString(),
							label: `#${invoice.id} - ${
								invoice.customer?.name ||
								invoice.supplier?.name ||
								invoice.vendor?.name ||
								t('invoiceApprovals.form.na')
							} - ${invoice.total || invoice.amount || 0}`,
						}))}
						disabled={!formData.invoice_type}
						required
					/>

					<FloatingLabelInput
						label={t('invoiceApprovals.form.submittedBy')}
						value={formData.submitted_by}
						onChange={e => handleChange('submitted_by', e.target.value)}
						required
					/>

					{/* Action Buttons */}
					<div className="border-t border-gray-200 mt-6 pt-4 flex gap-3">
						<button
							onClick={() => {
								setIsModalOpen(false);
								setFormData({
									invoice_type: '',
									invoice_id: '',
									submitted_by: '',
								});
							}}
							className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
							disabled={loading}
						>
							{t('invoiceApprovals.actions.cancel')}
						</button>
						<button
							onClick={handleSubmit}
							disabled={loading}
							className="flex-1 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#1f6477] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? (
								<span className="flex items-center justify-center">
									<svg
										className="animate-spin mx-2 h-4 w-4 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									{editingApproval
										? t('invoiceApprovals.actions.updating')
										: t('invoiceApprovals.actions.creating')}
								</span>
							) : editingApproval ? (
								t('invoiceApprovals.actions.update')
							) : (
								t('invoiceApprovals.actions.create')
							)}
						</button>
					</div>
				</div>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setDeleteId(null);
				}}
				onConfirm={confirmDelete}
				title={t('invoiceApprovals.modals.deleteTitle')}
				message={t('invoiceApprovals.modals.deleteMessage')}
				confirmText={t('invoiceApprovals.actions.delete')}
				cancelText={t('invoiceApprovals.actions.cancel')}
				confirmButtonClass="bg-red-600 hover:bg-red-700"
			/>

			{/* Approve Confirmation Modal */}
			<SlideUpModal
				isOpen={isApproveModalOpen}
				onClose={() => {
					setIsApproveModalOpen(false);
					setActionId(null);
					setActionComments('');
				}}
				title={t('invoiceApprovals.modals.approveTitle')}
			>
				<div className="space-y-4">
					<p className="text-gray-600">{t('invoiceApprovals.modals.approveMessage')}</p>

					<FloatingLabelInput
						label={t('invoiceApprovals.modals.commentsLabel')}
						value={actionComments}
						onChange={e => setActionComments(e.target.value)}
						multiline
						rows={3}
					/>

					{/* Action Buttons */}
					<div className="border-t border-gray-200 mt-6 pt-4 flex gap-3">
						<button
							onClick={() => {
								setIsApproveModalOpen(false);
								setActionId(null);
								setActionComments('');
							}}
							className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
							disabled={loading}
						>
							{t('invoiceApprovals.actions.cancel')}
						</button>
						<button
							onClick={confirmApprove}
							disabled={loading}
							className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? (
								<span className="flex items-center justify-center">
									<svg
										className="animate-spin mx-2 h-4 w-4 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									{t('invoiceApprovals.actions.approving')}
								</span>
							) : (
								t('invoiceApprovals.actions.approve')
							)}
						</button>
					</div>
				</div>
			</SlideUpModal>

			{/* Reject Confirmation Modal */}
			<SlideUpModal
				isOpen={isRejectModalOpen}
				onClose={() => {
					setIsRejectModalOpen(false);
					setActionId(null);
					setActionComments('');
				}}
				title={t('invoiceApprovals.modals.rejectTitle')}
			>
				<div className="space-y-4">
					<p className="text-gray-600">{t('invoiceApprovals.modals.rejectMessage')}</p>

					<FloatingLabelInput
						label={t('invoiceApprovals.modals.rejectionReasonLabel')}
						value={actionComments}
						onChange={e => setActionComments(e.target.value)}
						multiline
						rows={3}
						required
					/>

					{/* Action Buttons */}
					<div className="border-t border-gray-200 mt-6 pt-4 flex gap-3">
						<button
							onClick={() => {
								setIsRejectModalOpen(false);
								setActionId(null);
								setActionComments('');
							}}
							className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
							disabled={loading}
						>
							{t('invoiceApprovals.actions.cancel')}
						</button>
						<button
							onClick={confirmReject}
							disabled={loading}
							className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? (
								<span className="flex items-center justify-center">
									<svg
										className="animate-spin mx-2 h-4 w-4 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									{t('invoiceApprovals.actions.rejecting')}
								</span>
							) : (
								t('invoiceApprovals.actions.reject')
							)}
						</button>
					</div>
				</div>
			</SlideUpModal>

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

export default InvoiceApprovalsPage;
