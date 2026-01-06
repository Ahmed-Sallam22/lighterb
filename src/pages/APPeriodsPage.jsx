import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { FaCalendarAlt, FaLockOpen, FaLock, FaEye } from "react-icons/fa";
import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import SlideUpModal from "../components/shared/SlideUpModal";
import ConfirmModal from "../components/shared/ConfirmModal";
import LoadingSpan from "../components/shared/LoadingSpan";
import {
	fetchAPPeriods,
	fetchAPPeriod,
	openAPPeriod,
	closeAPPeriod,
	setPage,
	clearSelectedPeriod,
} from "../store/apPeriodsSlice";

const APPeriodsPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	// Get data from Redux
	const { periods, loading, actionLoading, count, page, hasNext, hasPrevious, selectedPeriod } = useSelector(
		state => state.apPeriods
	);

	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [confirmAction, setConfirmAction] = useState(null);
	const [selectedPeriodForAction, setSelectedPeriodForAction] = useState(null);
	const [localPageSize, setLocalPageSize] = useState(20);

	// Filter states
	const [filterState, setFilterState] = useState("");
	const [filterFiscalYear, setFilterFiscalYear] = useState("");

	// Get unique fiscal years from periods for filter dropdown
	const fiscalYearOptions = useMemo(() => {
		const years = [...new Set(periods.map(p => p.fiscal_year))].sort((a, b) => b - a);
		return years;
	}, [periods]);

	// Fetch periods on mount and when pagination/filter changes
	useEffect(() => {
		dispatch(
			fetchAPPeriods({
				page,
				page_size: localPageSize,
				state: filterState,
				fiscal_year: filterFiscalYear,
			})
		);
	}, [dispatch, page, localPageSize, filterState, filterFiscalYear]);

	// Update browser title
	useEffect(() => {
		document.title = `${t("apPeriods.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	// Pagination handlers
	const handlePageChange = useCallback(
		newPage => {
			dispatch(setPage(newPage));
		},
		[dispatch]
	);

	const handlePageSizeChange = useCallback(
		newPageSize => {
			setLocalPageSize(newPageSize);
			dispatch(setPage(1));
		},
		[dispatch]
	);

	// Table columns configuration
	const columns = useMemo(
		() => [
			{
				header: t("apPeriods.table.periodNumber"),
				accessor: "period_number",
				width: "80px",
				render: value => (
					<span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#28819C] text-white text-sm font-semibold">
						{value}
					</span>
				),
			},
			{
				header: t("apPeriods.table.periodName"),
				accessor: "period_name",
				render: value => <span className="font-medium text-gray-900">{value}</span>,
			},
			{
				header: t("apPeriods.table.fiscalYear"),
				accessor: "fiscal_year",
				width: "100px",
				render: value => <span className="font-semibold text-[#28819C]">{value}</span>,
			},
			{
				header: t("apPeriods.table.startDate"),
				accessor: "start_date",
				render: value => (
					<span className="text-gray-700">
						{value ? new Date(value).toLocaleDateString(i18n.language) : "-"}
					</span>
				),
			},
			{
				header: t("apPeriods.table.endDate"),
				accessor: "end_date",
				render: value => (
					<span className="text-gray-700">
						{value ? new Date(value).toLocaleDateString(i18n.language) : "-"}
					</span>
				),
			},
			{
				header: t("apPeriods.table.state"),
				accessor: "state",
				width: "120px",
				render: value => {
					const stateColors = {
						open: "bg-green-100 text-green-800",
						closed: "bg-red-100 text-red-800",
						hold: "bg-yellow-100 text-yellow-800",
					};
					return (
						<span
							className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
								stateColors[value] || "bg-gray-100 text-gray-800"
							}`}
						>
							{t(`apPeriods.states.${value}`) || value}
						</span>
					);
				},
			},
		],
		[t, i18n.language]
	);

	// Handle view period details
	const handleView = async row => {
		try {
			await dispatch(fetchAPPeriod(row.id)).unwrap();
			setIsViewModalOpen(true);
		} catch {
			toast.error(t("apPeriods.messages.fetchError"));
		}
	};

	const handleCloseViewModal = () => {
		setIsViewModalOpen(false);
		dispatch(clearSelectedPeriod());
	};

	// Handle open period action
	const handleOpenPeriod = row => {
		setSelectedPeriodForAction(row);
		setConfirmAction("open");
		setIsConfirmModalOpen(true);
	};

	// Handle close period action
	const handleClosePeriod = row => {
		setSelectedPeriodForAction(row);
		setConfirmAction("close");
		setIsConfirmModalOpen(true);
	};

	// Confirm action
	const handleConfirmAction = async () => {
		if (!selectedPeriodForAction) return;

		try {
			if (confirmAction === "open") {
				await dispatch(openAPPeriod(selectedPeriodForAction.id)).unwrap();
				toast.success(t("apPeriods.messages.openSuccess"));
			} else if (confirmAction === "close") {
				await dispatch(closeAPPeriod(selectedPeriodForAction.id)).unwrap();
				toast.success(t("apPeriods.messages.closeSuccess"));
			}
		} catch (error) {
			const errorMessage = typeof error === "string" ? error : t("apPeriods.messages.actionError");
			toast.error(errorMessage);
		} finally {
			setIsConfirmModalOpen(false);
			setSelectedPeriodForAction(null);
			setConfirmAction(null);
		}
	};

	const handleCancelConfirm = () => {
		setIsConfirmModalOpen(false);
		setSelectedPeriodForAction(null);
		setConfirmAction(null);
	};

	// Custom actions for table rows
	const customActions = [
		{
			icon: <FaLockOpen className="w-4 h-4" />,
			title: t("apPeriods.actions.open"),
			onClick: handleOpenPeriod,
			showWhen: row => row.state === "closed" || row.state === "hold",
			className: "text-green-600 hover:text-green-800",
		},
		{
			icon: <FaLock className="w-4 h-4" />,
			title: t("apPeriods.actions.close"),
			onClick: handleClosePeriod,
			showWhen: row => row.state === "open",
			className: "text-red-600 hover:text-red-800",
		},
	];

	// Clear filters
	const handleClearFilters = () => {
		setFilterState("");
		setFilterFiscalYear("");
		dispatch(setPage(1));
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer
				position={isRtl ? "top-left" : "top-right"}
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
				title={t("apPeriods.title")}
				subtitle={t("apPeriods.subtitle")}
				icon={<FaCalendarAlt className="w-7 h-7 text-[#28819C]" />}
			/>

			<div className="mx-auto px-6 py-8">
				{/* Filters */}
				<div className="bg-white rounded-xl shadow-sm p-4 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
						{/* State Filter */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								{t("apPeriods.filters.state")}
							</label>
							<select
								value={filterState}
								onChange={e => {
									setFilterState(e.target.value);
									dispatch(setPage(1));
								}}
								className="w-full h-10 px-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-[#48C1F0] cursor-pointer"
							>
								<option value="">{t("apPeriods.filters.allStates")}</option>
								<option value="open">{t("apPeriods.states.open")}</option>
								<option value="closed">{t("apPeriods.states.closed")}</option>
								<option value="hold">{t("apPeriods.states.hold")}</option>
							</select>
						</div>

						{/* Fiscal Year Filter */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								{t("apPeriods.filters.fiscalYear")}
							</label>
							<select
								value={filterFiscalYear}
								onChange={e => {
									setFilterFiscalYear(e.target.value);
									dispatch(setPage(1));
								}}
								className="w-full h-10 px-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-[#48C1F0] cursor-pointer"
							>
								<option value="">{t("apPeriods.filters.allYears")}</option>
								{fiscalYearOptions.map(year => (
									<option key={year} value={year}>
										{year}
									</option>
								))}
							</select>
						</div>

						{/* Empty spacer */}
						<div className="hidden md:block"></div>

						{/* Clear Filters Button */}
						<div className="flex justify-end">
							<button
								onClick={handleClearFilters}
								className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
							>
								{t("apPeriods.filters.clear")}
							</button>
						</div>
					</div>
				</div>

				{/* Table */}
				{loading ? (
					<LoadingSpan />
				) : (
					<>
						<Table
							columns={columns}
							data={periods}
							onView={handleView}
							customActions={customActions}
							showEditButton={false}
							showDeleteButton={false}
							emptyMessage={t("apPeriods.emptyMessage")}
						/>

						{/* Pagination */}
						<Pagination
							currentPage={page}
							totalCount={count}
							pageSize={localPageSize}
							hasNext={hasNext}
							hasPrevious={hasPrevious}
							onPageChange={handlePageChange}
							onPageSizeChange={handlePageSizeChange}
						/>
					</>
				)}
			</div>

			{/* View Details Modal */}
			<SlideUpModal
				isOpen={isViewModalOpen}
				onClose={handleCloseViewModal}
				title={t("apPeriods.modals.viewTitle")}
				maxWidth="600px"
			>
				{selectedPeriod && (
					<div className="space-y-4 p-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-500">
									{t("apPeriods.details.periodName")}
								</label>
								<p className="mt-1 text-lg font-semibold text-gray-900">{selectedPeriod.period_name}</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-500">
									{t("apPeriods.details.periodNumber")}
								</label>
								<p className="mt-1 text-lg font-semibold text-gray-900">
									{selectedPeriod.period_number}
								</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-500">
									{t("apPeriods.details.fiscalYear")}
								</label>
								<p className="mt-1 text-lg font-semibold text-[#28819C]">
									{selectedPeriod.fiscal_year}
								</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-500">
									{t("apPeriods.details.state")}
								</label>
								<span
									className={`inline-flex items-center px-3 py-1 mt-1 rounded-full text-xs font-semibold ${
										selectedPeriod.state === "open"
											? "bg-green-100 text-green-800"
											: selectedPeriod.state === "closed"
											? "bg-red-100 text-red-800"
											: "bg-yellow-100 text-yellow-800"
									}`}
								>
									{t(`apPeriods.states.${selectedPeriod.state}`) || selectedPeriod.state}
								</span>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-500">
									{t("apPeriods.details.startDate")}
								</label>
								<p className="mt-1 text-gray-900">
									{selectedPeriod.start_date
										? new Date(selectedPeriod.start_date).toLocaleDateString(i18n.language)
										: "-"}
								</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-500">
									{t("apPeriods.details.endDate")}
								</label>
								<p className="mt-1 text-gray-900">
									{selectedPeriod.end_date
										? new Date(selectedPeriod.end_date).toLocaleDateString(i18n.language)
										: "-"}
								</p>
							</div>
						</div>

						{/* Action buttons in modal */}
						<div className="flex justify-end gap-3 pt-4 border-t">
							{(selectedPeriod.state === "closed" || selectedPeriod.state === "hold") && (
								<button
									onClick={() => {
										handleCloseViewModal();
										handleOpenPeriod(selectedPeriod);
									}}
									disabled={actionLoading}
									className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
								>
									<FaLockOpen className="w-4 h-4" />
									{t("apPeriods.actions.open")}
								</button>
							)}
							{selectedPeriod.state === "open" && (
								<button
									onClick={() => {
										handleCloseViewModal();
										handleClosePeriod(selectedPeriod);
									}}
									disabled={actionLoading}
									className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
								>
									<FaLock className="w-4 h-4" />
									{t("apPeriods.actions.close")}
								</button>
							)}
							<button
								onClick={handleCloseViewModal}
								className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
							>
								{t("common.close")}
							</button>
						</div>
					</div>
				)}
			</SlideUpModal>

			{/* Confirm Action Modal */}
			<ConfirmModal
				isOpen={isConfirmModalOpen}
				onClose={handleCancelConfirm}
				onConfirm={handleConfirmAction}
				title={confirmAction === "open" ? t("apPeriods.modals.openTitle") : t("apPeriods.modals.closeTitle")}
				message={
					confirmAction === "open"
						? t("apPeriods.modals.openMessage", {
								period: selectedPeriodForAction?.period_name || "",
						  })
						: t("apPeriods.modals.closeMessage", {
								period: selectedPeriodForAction?.period_name || "",
						  })
				}
				confirmText={confirmAction === "open" ? t("apPeriods.actions.open") : t("apPeriods.actions.close")}
				cancelText={t("common.cancel")}
				loading={actionLoading}
			/>
		</div>
	);
};

export default APPeriodsPage;
