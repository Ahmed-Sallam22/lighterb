import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiDollarSign, FiPlus, FiSearch } from "react-icons/fi";
import { IoDocumentTextOutline } from "react-icons/io5";
import { MdAccessTime } from "react-icons/md";
import { PiCirclesFourFill } from "react-icons/pi";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/shared/PageHeader";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import RequisitionsHeadIcon from "../ui/icons/RequisitionsHeadIcon";
import DoneIcon from "../ui/icons/DoneIcon";
import SlideUpModal from "../components/shared/SlideUpModal";
import StatisticsCard from "../components/shared/StatisticsCard";
import SearchInput from "../components/shared/SearchInput";
import RequisitionCard from "../components/RequisitionCard";
// import BrowseCatalog from "../components/BrowseCatalog";
import Button from "../components/shared/Button";
import Tabs from "../components/shared/Tabs";
import LoadingSpan from "../components/shared/LoadingSpan";
import ConfirmModal from "../components/shared/ConfirmModal";
import Pagination from "../components/shared/Pagination";
import RequisitionDetailsModal from "../components/shared/RequisitionDetailsModal";
import {
	fetchAllRequisitions,
	deleteRequisition,
	submitForApproval,
	clearError,
	setPage,
} from "../store/requisitionsSlice";

// Static options - move outside component
const STATUS_OPTIONS = [
	{ value: "all", label: "requisitions.filters.allStatuses" },
	{ value: "DRAFT", label: "requisitions.filters.draft" },
	{ value: "PENDING_APPROVAL", label: "requisitions.filters.pending" },
	{ value: "APPROVED", label: "requisitions.filters.approved" },
	{ value: "REJECTED", label: "requisitions.filters.rejected" },
];

const TAB_CONFIG = [
	{ id: "allPRs", key: "allPRs" },
	{ id: "catalog", key: "catalog" },
	{ id: "nonCatalog", key: "nonCatalog" },
	{ id: "service", key: "service" },
];

const RequisitionsPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const navigate = useNavigate();
	const dispatch = useDispatch();

	// Redux state
	const {
		requisitions,
		loading,
		error,
		actionError,
		deleting,
		submitting,
		count,
		catalogCount,
		nonCatalogCount,
		serviceCount,
		page,
		pageSize,
		hasNext,
		hasPrevious,
	} = useSelector(state => state.requisitions);

	// Modal states
	// const [isBrowseCatalogModalOpen, setIsBrowseCatalogModalOpen] = useState(false);
	const [deleteModal, setDeleteModal] = useState({ isOpen: false, requisition: null });
	const [viewModal, setViewModal] = useState({ isOpen: false, requisition: null });

	// Local page size state
	const [localPageSize, setLocalPageSize] = useState(pageSize || 20);

	// Filter states
	const [filters, setFilters] = useState({
		search: "",
		status: "all",
	});
	const [searchDebounce, setSearchDebounce] = useState("");

	const [activeTab, setActiveTab] = useState("allPRs");

	// Memoize tabs with translations and counts
	const tabs = useMemo(
		() => [
			{ id: "allPRs", label: t("requisitions.tabs.allPRs"), count: count },
			{ id: "catalog", label: t("requisitions.tabs.catalog"), count: catalogCount },
			{ id: "nonCatalog", label: t("requisitions.tabs.nonCatalog"), count: nonCatalogCount },
			{ id: "service", label: t("requisitions.tabs.service"), count: serviceCount },
		],
		[t, count, catalogCount, nonCatalogCount, serviceCount]
	);

	// Memoize status options with translations
	const statusOptions = useMemo(
		() =>
			STATUS_OPTIONS.map(option => ({
				...option,
				label: t(option.label),
			})),
		[t]
	);

	// Calculate statistics from actual data
	const statistics = useMemo(() => {
		const totalValue = requisitions.reduce((sum, r) => {
			const amount = parseFloat(r.total) || 0;
			return sum + amount;
		}, 0);

		const pending = requisitions.filter(r => r.status === "PENDING_APPROVAL").length;
		const approved = requisitions.filter(r => r.status === "APPROVED").length;

		return {
			total: count,
			pending,
			approved,
			totalValue,
		};
	}, [requisitions, count]);

	// Memoize stat cards configuration
	const statCards = useMemo(
		() => [
			{
				title: t("requisitions.stats.totalPRs"),
				value: statistics.total,
				icon: <IoDocumentTextOutline className="text-[#155dfc]" size={24} />,
				iconBg: "bg-[#EFF6FF]",
				valueColor: "text-gray-900",
			},
			{
				title: t("requisitions.stats.pendingApproval"),
				value: statistics.pending,
				icon: <MdAccessTime className="text-[#F54900]" size={24} />,
				iconBg: "bg-[#FFF7ED]",
				valueColor: "text-red-600",
			},
			{
				title: t("requisitions.stats.approved"),
				value: statistics.approved,
				icon: <DoneIcon />,
				iconBg: "bg-[#F0FDF4]",
				valueColor: "text-green-600",
			},
			{
				title: t("requisitions.stats.totalValue"),
				value: `${(statistics.totalValue || 0).toFixed(2)}`,
				icon: <FiDollarSign className="text-[#7C3AED]" size={24} />,
				iconBg: "bg-[#FAF5FF]",
				valueColor: "text-gray-900",
			},
		],
		[t, statistics]
	);

	// Filter requisitions based on active tab (client-side filtering for tab)
	const filteredRequisitions = useMemo(() => {
		if (activeTab === "allPRs") return requisitions;

		const tabTypeMap = {
			catalog: "Catalog",
			nonCatalog: "Non-Catalog",
			service: "Service",
		};

		return requisitions.filter(req => req.pr_type === tabTypeMap[activeTab]);
	}, [requisitions, activeTab]);

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			setSearchDebounce(filters.search);
		}, 500);
		return () => clearTimeout(timer);
	}, [filters.search]);

	// Fetch requisitions on mount and when filters change
	useEffect(() => {
		dispatch(
			fetchAllRequisitions({
				page,
				page_size: localPageSize,
				status: filters.status,
				search: searchDebounce,
			})
		);
	}, [dispatch, page, localPageSize, filters.status, searchDebounce]);

	// Handle errors
	useEffect(() => {
		if (error) {
			toast.error(error, { autoClose: 5000 });
			dispatch(clearError());
		}
	}, [error, dispatch]);

	useEffect(() => {
		if (actionError) {
			toast.error(actionError, { autoClose: 5000 });
			dispatch(clearError());
		}
	}, [actionError, dispatch]);

	// Handlers
	const handleFilterChange = useCallback(
		(name, value) => {
			setFilters(prev => ({ ...prev, [name]: value }));
			dispatch(setPage(1)); // Reset to first page when filters change
		},
		[dispatch]
	);

	const handleViewRequisition = useCallback(requisition => {
		setViewModal({ isOpen: true, requisition });
	}, []);

	const handleCloseViewModal = useCallback(() => {
		setViewModal({ isOpen: false, requisition: null });
	}, []);

	const handleEditRequisition = useCallback(requisition => {
		// TODO: Navigate to edit page
		console.log("Editing requisition:", requisition);
	}, []);

	const handleDeleteClick = useCallback(requisition => {
		setDeleteModal({ isOpen: true, requisition });
	}, []);

	const handleConfirmDelete = useCallback(async () => {
		if (!deleteModal.requisition) return;

		try {
			await dispatch(
				deleteRequisition({
					prType: deleteModal.requisition.pr_type,
					id: deleteModal.requisition.pr_id,
				})
			).unwrap();

			toast.success(t("requisitions.messages.deleteSuccess"));
			setDeleteModal({ isOpen: false, requisition: null });
		} catch {
			// Error handled by Redux
		}
	}, [deleteModal.requisition, dispatch, t]);

	const handleSubmitRequisition = useCallback(
		async requisition => {
			try {
				await dispatch(
					submitForApproval({
						prType: requisition.pr_type,
						id: requisition.pr_id,
					})
				).unwrap();

				toast.success(t("requisitions.messages.submitSuccess"));
			} catch {
				// Error handled by Redux
			}
		},
		[dispatch, t]
	);

	const handleTabChange = useCallback(tabId => {
		setActiveTab(tabId);
	}, []);

	const handlePageChange = useCallback(
		newPage => {
			dispatch(setPage(newPage));
		},
		[dispatch]
	);

	const handlePageSizeChange = useCallback(
		newPageSize => {
			setLocalPageSize(newPageSize);
			dispatch(setPage(1)); // Reset to first page when page size changes
		},
		[dispatch]
	);

	return (
		<div className="min-h-screen bg-[#EEEEEE]">
			{/* Header */}
			<PageHeader
				title={t("requisitions.title")}
				subtitle={t("requisitions.subtitle")}
				icon={<RequisitionsHeadIcon width={32} height={30} className="text-[#28819C]" />}
			/>

			<div className="p-6">
				{/* Title and Action Buttons */}
				<div className="px-6 py-4 flex justify-between items-center">
					<h1 className="text-3xl font-semibold text-[#28819C]">{t("requisitions.title")}</h1>
					<div className="flex items-center gap-4">
						<Button
							onClick={() => navigate("/create-requisition")}
							icon={<FiPlus className="text-xl" />}
							title={t("requisitions.createRequisition")}
						/>
						{/* <Button
							onClick={() => setIsBrowseCatalogModalOpen(true)}
							icon={<FiSearch className="text-xl" />}
							title={t("requisitions.browseCatalog.title")}
						/> */}
					</div>
				</div>

				<div className="mx-auto py-6 space-y-6">
					{/* Statistics Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
						{statCards.map(card => (
							<StatisticsCard
								key={card.title}
								title={card.title}
								value={card.value}
								icon={card.icon}
								iconClassName={card.iconBg}
								valueClassName={card.valueColor}
							/>
						))}
					</div>

					{/* Tabs Section - Now using Tabs component */}
					<Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

					{/* Filters Section */}
					<div className="flex justify-end">
						<div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-1/2">
							<SearchInput
								value={filters.search}
								onChange={e => handleFilterChange("search", e.target.value)}
								placeholder={t("requisitions.searchPlaceholder")}
							/>
							<div className="w-full md:w-1/3 md:min-w-[200px]">
								<FloatingLabelSelect
									id="status"
									value={filters.status}
									onChange={e => handleFilterChange("status", e.target.value)}
									options={statusOptions}
									icon={<PiCirclesFourFill className="text-[#28819C]" size={20} />}
								/>
							</div>
						</div>
					</div>

					{/* Requisitions List */}
					{loading ? (
						<LoadingSpan />
					) : filteredRequisitions.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-gray-500">
							<IoDocumentTextOutline size={48} className="mb-4" />
							<p className="text-lg">{t("requisitions.noRequisitionsFound")}</p>
						</div>
					) : (
						<div className="space-y-4">
							{filteredRequisitions.map(requisition => (
								<RequisitionCard
									key={`${requisition.pr_type}-${requisition.pr_id}`}
									requisition={requisition}
									onView={handleViewRequisition}
									onEdit={handleEditRequisition}
									onSubmit={handleSubmitRequisition}
									onDelete={handleDeleteClick}
									t={t}
									submitting={submitting}
								/>
							))}
						</div>
					)}

					{/* Pagination */}
					{!loading && count > 0 && (
						<Pagination
							currentPage={page}
							totalCount={count}
							pageSize={localPageSize}
							hasNext={hasNext}
							hasPrevious={hasPrevious}
							onPageChange={handlePageChange}
							onPageSizeChange={handlePageSizeChange}
						/>
					)}
				</div>
			</div>

			{/* Browse Catalog Modal
			<SlideUpModal
				isOpen={isBrowseCatalogModalOpen}
				onClose={() => setIsBrowseCatalogModalOpen(false)}
				title={t("requisitions.browseCatalog.title")}
				maxWidth="1000px"
			>
				<BrowseCatalog onClose={() => setIsBrowseCatalogModalOpen(false)} />
			</SlideUpModal> */}

			{/* Requisition Details Modal */}
			<RequisitionDetailsModal
				isOpen={viewModal.isOpen}
				requisitionId={viewModal.requisition?.pr_id}
				prType={viewModal.requisition?.pr_type}
				onClose={handleCloseViewModal}
			/>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={deleteModal.isOpen}
				onClose={() => setDeleteModal({ isOpen: false, requisition: null })}
				onConfirm={handleConfirmDelete}
				title={t("requisitions.modals.deleteTitle")}
				message={t("requisitions.modals.deleteMessage", {
					prNumber: deleteModal.requisition?.pr_number || deleteModal.requisition?.pr_id,
				})}
				confirmText={deleting ? t("requisitions.actions.deleting") : t("requisitions.actions.delete")}
				cancelText={t("requisitions.actions.cancel")}
				isLoading={deleting}
				variant="danger"
			/>

			{/* Toast Container */}
			<ToastContainer
				position={isRtl ? "top-left" : "top-right"}
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

export default RequisitionsPage;
