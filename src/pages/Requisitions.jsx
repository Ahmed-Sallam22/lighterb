import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { FiDollarSign, FiPlus, FiSearch } from "react-icons/fi";
import { IoDocumentTextOutline } from "react-icons/io5";
import { MdAccessTime } from "react-icons/md";
import { PiCirclesFourFill } from "react-icons/pi";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/shared/PageHeader";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import RequisitionsHeadIcon from "../ui/icons/RequisitionsHeadIcon";
import DoneIcon from "../ui/icons/DoneIcon";
import NewRequisition from "../components/forms/NewRequisitionForm";
import SlideUpModal from "../components/shared/SlideUpModal";
import StatisticsCard from "../components/shared/StatisticsCard";
import SearchInput from "../components/shared/SearchInput";
import RequisitionCard from "../components/RequisitionCard";
import BrowseCatalog from "../components/BrowseCatalog";
import Button from "../components/shared/Button";
import Tabs from "../components/shared/Tabs";
import { requisitionsData } from "../dummyData/requisitionsData";
import LoadingSpan from "../components/shared/LoadingSpan";

// Static options - move outside component
const STATUS_OPTIONS = [
	{ value: "all", label: "requisitions.filters.allStatuses" },
	{ value: "posted", label: "requisitions.filters.posted" },
	{ value: "draft", label: "requisitions.filters.draft" },
	{ value: "pending", label: "requisitions.filters.pending" },
	{ value: "approved", label: "requisitions.filters.approved" },
];

const TAB_CONFIG = [
	{ id: "myPRs", key: "myPRs" },
	{ id: "pending", key: "pendingApproval" },
	{ id: "allPRs", key: "allPRs" },
];

const RequisitionsPage = () => {
	const { t } = useTranslation();

	// Modal states
	const [isNewReqModalOpen, setIsNewReqModalOpen] = useState(false);
	const [isBrowseCatalogModalOpen, setIsBrowseCatalogModalOpen] = useState(false);

	// Data states
	const [requisitions, setRequisitions] = useState(requisitionsData);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Filter states
	const [filters, setFilters] = useState({
		search: "",
		status: "all",
	});

	const [activeTab, setActiveTab] = useState("allPRs");

	// Memoize tabs with translations
	const tabs = useMemo(
		() =>
			TAB_CONFIG.map(tab => ({
				id: tab.id,
				label: t(`requisitions.tabs.${tab.key}`),
			})),
		[t]
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
			const amount = parseFloat(r.totalAmount) || 0;
			return sum + amount;
		}, 0);

		const stats = {
			total: requisitions.length,
			pending: requisitions.filter(r => r.status === "pending").length,
			approved: requisitions.filter(r => r.status === "approved").length,
			totalValue: totalValue,
		};
		return stats;
	}, [requisitions]);

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

	// Filter requisitions based on search, status, and active tab
	const filteredRequisitions = useMemo(() => {
		return requisitions.filter(req => {
			// Search filter
			const matchesSearch =
				!filters.search ||
				req.id?.toLowerCase().includes(filters.search.toLowerCase()) ||
				req.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
				req.createdBy?.toLowerCase().includes(filters.search.toLowerCase());

			// Status filter
			const matchesStatus = filters.status === "all" || req.status === filters.status;

			// Tab filter
			let matchesTab = true;
			if (activeTab === "myPRs") {
				// Assuming there's a currentUserId or isOwner property
				matchesTab = req.isOwner || req.createdBy === "currentUser";
			} else if (activeTab === "pending") {
				matchesTab = req.status === "pending";
			}
			// 'allPRs' shows everything

			return matchesSearch && matchesStatus && matchesTab;
		});
	}, [requisitions, filters, activeTab]);

	// Handle errors
	useEffect(() => {
		if (error) {
			toast.error(error, { autoClose: 5000 });
			setError(null); // Clear error after showing
		}
	}, [error]);

	// Fetch requisitions (placeholder for real API call)
	useEffect(() => {
		const fetchRequisitions = async () => {
			setLoading(true);
			try {
				// TODO: Replace with actual API call
				// const data = await api.getRequisitions();
				// setRequisitions(data);

				// Simulating API delay
				await new Promise(resolve => setTimeout(resolve, 500));
				setRequisitions(requisitionsData);
			} catch (err) {
				setError(t("requisitions.errors.fetchFailed"));
				console.error("Error fetching requisitions:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchRequisitions();
	}, [t]);

	// Handlers
	const handleFilterChange = useCallback((name, value) => {
		setFilters(prev => ({ ...prev, [name]: value }));
	}, []);

	const handleViewRequisition = useCallback(requisition => {
		// TODO: Navigate to requisition detail page or open modal
		console.log("Viewing requisition:", requisition);
	}, []);

	const handleEditRequisition = useCallback(requisition => {
		// TODO: Open edit modal with requisition data
		console.log("Editing requisition:", requisition);
	}, []);

	const handleSubmitRequisition = useCallback(
		requisition => {
			// TODO: Submit requisition for approval
			console.log("Submitting requisition:", requisition);
			toast.success(t("requisitions.messages.submitSuccess"));
		},
		[t]
	);

	const handleCreateRequisition = useCallback(
		async requisitionData => {
			try {
				// TODO: API call to create requisition
				// const newReq = await api.createRequisition(requisitionData);

				const newReq = {
					id: `PR-${Date.now()}`,
					...requisitionData,
					status: "draft",
					createdAt: new Date().toISOString(),
					isOwner: true,
				};

				setRequisitions(prev => [newReq, ...prev]);
				toast.success(t("requisitions.messages.createSuccess"));
				setIsNewReqModalOpen(false);
			} catch (err) {
				toast.error(t("requisitions.errors.createFailed"));
				console.error("Error creating requisition:", err);
				throw err;
			}
		},
		[t]
	);

	const handleTabChange = useCallback(tabId => {
		setActiveTab(tabId);
	}, []);

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
							onClick={() => setIsNewReqModalOpen(true)}
							icon={<FiPlus className="text-xl" />}
							title={t("requisitions.createRequisition")}
						/>
						<Button
							onClick={() => setIsBrowseCatalogModalOpen(true)}
							icon={<FiSearch className="text-xl" />}
							title={t("requisitions.browseCatalog.title")}
						/>
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
									key={requisition.id}
									requisition={requisition}
									onView={handleViewRequisition}
									onEdit={handleEditRequisition}
									onSubmit={handleSubmitRequisition}
									t={t}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			{/* New Requisition Modal */}
			<SlideUpModal
				isOpen={isNewReqModalOpen}
				onClose={() => setIsNewReqModalOpen(false)}
				title={t("requisitions.newRequisition.title")}
				maxWidth="1000px"
			>
				<NewRequisition onClose={() => setIsNewReqModalOpen(false)} onSubmit={handleCreateRequisition} />
			</SlideUpModal>

			{/* Browse Catalog Modal */}
			<SlideUpModal
				isOpen={isBrowseCatalogModalOpen}
				onClose={() => setIsBrowseCatalogModalOpen(false)}
				title={t("requisitions.browseCatalog.title")}
				maxWidth="1000px"
			>
				<BrowseCatalog onClose={() => setIsBrowseCatalogModalOpen(false)} />
			</SlideUpModal>
		</div>
	);
};

export default RequisitionsPage;
