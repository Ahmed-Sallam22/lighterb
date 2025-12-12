import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/shared/PageHeader';
import Card from '../components/shared/Card';
import FloatingLabelInput from '../components/shared/FloatingLabelInput';
import Table from '../components/shared/Table';
import Button from '../components/shared/Button';
import { fetchTrialBalance, fetchARAgingReport, fetchAPAgingReport } from '../store/reportsSlice';

const ReportsIcon = () => (
	<svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g opacity="0.5">
			<path
				d="M4 2H24C25.1046 2 26 2.89543 26 4V24C26 25.1046 25.1046 26 24 26H4C2.89543 26 2 25.1046 2 24V4C2 2.89543 2.89543 2 4 2Z"
				stroke="#D3D3D3"
				strokeWidth="2"
			/>
			<path d="M8 18V22" stroke="#D3D3D3" strokeWidth="2" strokeLinecap="round" />
			<path d="M14 12V22" stroke="#D3D3D3" strokeWidth="2" strokeLinecap="round" />
			<path d="M20 6V22" stroke="#D3D3D3" strokeWidth="2" strokeLinecap="round" />
		</g>
	</svg>
);

const ReportsPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === 'rtl';
	const dispatch = useDispatch();
	const { trialBalance, arAging, apAging } = useSelector(state => state.reports);

	const [selectedReport, setSelectedReport] = useState('trial-balance');
	const [filters, setFilters] = useState({
		dateFrom: '',
		dateTo: '',
		asOf: new Date().toISOString().split('T')[0], // Default to today
	});

	const reportTabs = useMemo(
		() => [
			{ value: 'trial-balance', label: t('reports.tabs.trialBalance') },
			{ value: 'ar-aging', label: t('reports.tabs.arAging') },
			{ value: 'ap-aging', label: t('reports.tabs.apAging') },
		],
		[t]
	);

	// Update browser title
	useEffect(() => {
		document.title = `${t('reports.title')} - LightERP`;
		return () => {
			document.title = 'LightERP';
		};
	}, [t]);

	// Auto-load Trial Balance on mount
	useEffect(() => {
		dispatch(
			fetchTrialBalance({
				dateFrom: '',
				dateTo: '',
			})
		);
	}, [dispatch]);

	// Get current report state
	const getCurrentReport = () => {
		switch (selectedReport) {
			case 'trial-balance':
				return trialBalance;
			case 'ar-aging':
				return arAging;
			case 'ap-aging':
				return apAging;
			default:
				return { data: [], loading: false, error: null, downloadLinks: null };
		}
	};

	const currentReport = getCurrentReport();

	const handleFilterChange = e => {
		const { name, value } = e.target;
		setFilters(prev => ({ ...prev, [name]: value }));
	};

	const handleTabChange = reportType => {
		setSelectedReport(reportType);
		// Reset filters when changing report type
		setFilters({
			dateFrom: '',
			dateTo: '',
			asOf: new Date().toISOString().split('T')[0],
		});

		// Auto-load report data when switching tabs
		if (reportType === 'trial-balance') {
			dispatch(fetchTrialBalance({ dateFrom: '', dateTo: '' }));
		} else if (reportType === 'ar-aging') {
			dispatch(fetchARAgingReport({ asOf: new Date().toISOString().split('T')[0] }));
		} else if (reportType === 'ap-aging') {
			dispatch(fetchAPAgingReport({ asOf: new Date().toISOString().split('T')[0] }));
		}
	};

	const handleDownload = format => {
		const links = currentReport.downloadLinks;
		if (!links) {
			toast.error(t('reports.messages.noLinks'));
			return;
		}

		const url = format === 'xlsx' ? links?.xlsx : links?.csv;
		if (!url) {
			toast.error(t('reports.messages.linkUnavailable', { format: format.toUpperCase() }));
			return;
		}

		window.open(url, '_blank');
		toast.success(t('reports.messages.downloading', { format: format.toUpperCase() }));
	};

	// Trial Balance Table Columns
	const trialBalanceColumns = useMemo(
		() => [
			{
				header: t('reports.columns.accountCode'),
				accessor: 'code',
				sortable: true,
			},
			{
				header: t('reports.columns.accountName'),
				accessor: 'name',
				sortable: true,
			},
			{
				header: t('reports.columns.debit'),
				accessor: 'debit',
				sortable: true,
				render: value =>
					value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
			},
			{
				header: t('reports.columns.credit'),
				accessor: 'credit',
				sortable: true,
				render: value =>
					value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
			},
		],
		[t]
	);

	// AR/AP Aging Invoice Columns
	const agingInvoiceColumns = useMemo(
		() => [
			{ header: t('reports.columns.invoiceNumber'), accessor: 'number', sortable: true },
			{
				header: selectedReport === 'ar-aging' ? t('reports.columns.customer') : t('reports.columns.supplier'),
				accessor: selectedReport === 'ar-aging' ? 'customer' : 'supplier',
				sortable: true,
			},
			{ header: t('reports.columns.date'), accessor: 'date', sortable: true },
			{ header: t('reports.columns.dueDate'), accessor: 'due_date', sortable: true },
			{
				header: t('reports.columns.daysOverdue'),
				accessor: 'days_overdue',
				sortable: true,
				render: value => (value > 0 ? <span className="text-red-600 font-semibold">{value}</span> : value || 0),
			},
			{
				header: t('reports.columns.balance'),
				accessor: 'balance',
				sortable: true,
				render: value =>
					value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00',
			},
			{ header: t('reports.columns.agingBucket'), accessor: 'bucket', sortable: true },
		],
		[t, selectedReport]
	);

	const renderTrialBalance = () => {
		if (!trialBalance.data || trialBalance.data.length === 0) {
			return <div className="text-center py-8 text-gray-500">{t('reports.messages.noData')}</div>;
		}

		return (
			<Table
				columns={trialBalanceColumns}
				data={trialBalance.data}
				rowsPerPage={15}
				emptyMessage={t('reports.messages.noTrialData')}
			/>
		);
	};

	const renderAgingReport = reportData => {
		if (!reportData.data) {
			return <div className="text-center py-8 text-gray-500">{t('reports.messages.noData')}</div>;
		}

		const { invoices, summary, buckets } = reportData.data;

		return (
			<div className="space-y-6">
				{/* Summary Cards */}
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
					{buckets.map(bucket => (
						<Card key={bucket} className="bg-blue-50">
							<div className="text-center">
								<div className="text-xs text-gray-600 mb-1">{bucket}</div>
								<div className="text-lg font-bold text-[#0d5f7a]">
									{summary[bucket]?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
								</div>
							</div>
						</Card>
					))}
				</div>

				{/* Total Summary */}
				<Card className="bg-green-50 border-2 border-green-200">
					<div className="flex justify-between items-center">
						<span className="text-lg font-semibold text-gray-700">
							{t('reports.sections.totalOutstanding')}:
						</span>
						<span className="text-2xl font-bold text-green-700">
							{summary.TOTAL?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
						</span>
					</div>
				</Card>

				{/* Invoices Table */}
				<Card>
					<h3 className="text-lg font-semibold mb-4 text-gray-700">{t('reports.sections.invoiceDetails')}</h3>
					<Table
						columns={agingInvoiceColumns}
						data={invoices || []}
						rowsPerPage={10}
						emptyMessage={t('reports.messages.noInvoices')}
					/>
				</Card>
			</div>
		);
	};

	const renderReportContent = () => {
		if (currentReport.loading) {
			return (
				<div className="flex justify-center items-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d5f7a]"></div>
				</div>
			);
		}

		if (currentReport.error) {
			return (
				<div className="text-center py-8 text-red-500">
					{t('reports.messages.error', { message: currentReport.error })}
				</div>
			);
		}

		switch (selectedReport) {
			case 'trial-balance':
				return renderTrialBalance();
			case 'ar-aging':
				return renderAgingReport(arAging);
			case 'ap-aging':
				return renderAgingReport(apAging);
			default:
				return null;
		}
	};

	return (
		<div className="">
			<ToastContainer position={isRtl ? 'top-left' : 'top-right'} autoClose={3000} rtl={isRtl} />
			<PageHeader title={t('reports.title')} subtitle={t('reports.subtitle')} icon={<ReportsIcon />} />

			<div className="space-y-6">
				{/* Tabs Navigation */}
				<Card>
					<div className="flex border-b border-gray-200">
						{reportTabs.map(tab => (
							<Button
								key={tab.value}
								onClick={() => handleTabChange(tab.value)}
								title={tab.label}
								className={`px-6 py-3 font-medium text-sm transition-colors relative bg-transparent shadow-none hover:shadow-none ${
									selectedReport === tab.value
										? 'text-[#0d5f7a] border-b-2 border-[#0d5f7a]'
										: 'text-gray-500 hover:text-gray-700'
								}`}
							/>
						))}
					</div>
				</Card>

				{/* Filters and Actions */}
				<Card>
					<div className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{/* Conditional Filters */}
							{selectedReport === 'trial-balance' && (
								<>
									<FloatingLabelInput
										label={t('reports.filters.dateFrom')}
										name="dateFrom"
										type="date"
										value={filters.dateFrom}
										onChange={handleFilterChange}
									/>
									<FloatingLabelInput
										label={t('reports.filters.dateTo')}
										name="dateTo"
										type="date"
										value={filters.dateTo}
										onChange={handleFilterChange}
									/>
								</>
							)}

							{(selectedReport === 'ar-aging' || selectedReport === 'ap-aging') && (
								<FloatingLabelInput
									label={t('reports.filters.asOf')}
									name="asOf"
									type="date"
									value={filters.asOf}
									onChange={handleFilterChange}
									required
								/>
							)}
						</div>

						{/* Action Buttons */}
						<div className="flex flex-wrap gap-3">
							{currentReport.downloadLinks && (
								<>
									<Button
										onClick={() => handleDownload('xlsx')}
										title={t('reports.actions.downloadExcel')}
										className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-none hover:shadow-none"
									/>
									<Button
										onClick={() => handleDownload('csv')}
										title={t('reports.actions.downloadCsv')}
										className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-none hover:shadow-none"
									/>
								</>
							)}
						</div>
					</div>
				</Card>

				{/* Report Content */}
				<Card>{renderReportContent()}</Card>
			</div>
		</div>
	);
};

export default ReportsPage;
