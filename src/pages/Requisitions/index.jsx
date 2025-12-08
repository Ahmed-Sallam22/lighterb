import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiDollarSign, FiPlus, FiSearch, FiEye, FiEdit } from "react-icons/fi";
import PageHeader from "../../components/shared/PageHeader";
import FloatingLabelSelect from "../../components/shared/FloatingLabelSelect";
import RequisitionsHeadIcon from "../../ui/icons/RequisitionsHeadIcon";
import { IoDocumentTextOutline } from "react-icons/io5";
import { MdAccessTime } from "react-icons/md";
import { useTranslation } from "react-i18next";
import DoneIcon from "../../ui/icons/DoneIcon";
import NewRequisition from "./components/NewRequisition";
import SlideUpModal from "../../components/shared/SlideUpModal";
import { PiCirclesFourFill } from "react-icons/pi";
import BrowseCatalog from "./components/BrowseCatalog";

const RequisitionCard = ({ requisition, onView, onEdit, onSubmit, t }) => {
	const getStatusColor = status => {
		const colors = {
			approved: "bg-[#C9FFD7] text-[#34C759]",
			pending: "bg-yellow-100 text-yellow-700",
			rejected: "bg-red-100 text-red-700",
			draft: "bg-gray-100 text-gray-700",
		};
		return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
	};

	const getPriorityColor = priority => {
		const colors = {
			high: "bg-red-100 text-red-700",
			normal: "bg-gray-100 text-gray-700",
			low: "bg-[#DDF9FF] text-[#006F86]",
		};
		return colors[priority?.toLowerCase()] || "bg-gray-100 text-gray-700";
	};

	return (
		<div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow space-y-4">
			{/* Card Header */}
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-3 flex-wrap">
					<h3 className="text-lg font-semibold text-gray-900">{requisition.prNumber}</h3>
					<div className="flex items-center gap-2 flex-wrap">
						<span
							className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
								requisition.status
							)}`}
						>
							{requisition.status}
						</span>
						{requisition.priority && (
							<span
								className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
									requisition.priority
								)}`}
							>
								{requisition.priority}
							</span>
						)}
						{requisition.cataloged && (
							<span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
								Cataloged
							</span>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					<div className="flex flex-wrap justify-end gap-2">
						<button
							onClick={() => onView(requisition)}
							className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
						>
							<FiEye size={16} />
							{t("requisitions.view")}
						</button>

						<button
							onClick={() => onEdit(requisition)}
							className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
						>
							{t("requisitions.edit")}
						</button>

						<button
							onClick={() => onSubmit(requisition)}
							className="px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b82] transition-colors text-sm font-medium"
						>
							{t("requisitions.submitForApproval")}
						</button>
					</div>
				</div>
			</div>

			{/* Card Content */}
			<div className="mb-4">
				<h4 className="text-base font-medium text-gray-900 mb-3">{requisition.title}</h4>
				<div className="grid grid-cols-3 gap-6 text-sm">
					<div>
						<p className="text-gray-500 mb-1">{t("requisitions.requiredDate")}:</p>
						<p className="text-gray-900 font-medium">{requisition.requiredDate}</p>
					</div>
					<div>
						<p className="text-gray-500 mb-1">{t("requisitions.costCenter")}</p>
						<p className="text-gray-900 font-medium">{requisition.costCenter}</p>
					</div>
					<div>
						<p className="text-gray-500 mb-1">{t("requisitions.totalAmount")}</p>
						<p className="text-gray-900 font-semibold">{requisition.totalAmount}</p>
					</div>
				</div>
			</div>

			{/* Card Footer */}
			<div className="pt-3 border-t border-gray-200">
				<div className="text-sm text-gray-500">
					<span>{t("requisitions.createdDate")}</span>
					<span className="ml-2 text-gray-900">{requisition.createdDate}</span>
				</div>
			</div>
		</div>
	);
};

const RequisitionsPage = () => {
	const { t } = useTranslation();
	const [isNewReqModelOpen, setIsNewReqModelOpen] = useState(false);
	const [isBrowseCatalogModelOpen, setIsBrowseCatalogModelOpen] = useState(false);

	const { loading, error, statistics } = useState(
		{ lines: [], loading: false, error: null, statistics: {} } // Placeholder state
	);

	const [filters, setFilters] = useState({
		search: "",
		status: "All Statuses",
	});

	const [activeTab, setActiveTab] = useState("myPRs");

	const tabs = [
		{ id: "myPRs", label: t("requisitions.tabs.myPRs") },
		{ id: "pending", label: t("requisitions.tabs.pendingApproval") },
		{ id: "allPRs", label: t("requisitions.tabs.allPRs") },
	];

	// Sample requisitions data
	const requisitionsData = [
		{
			id: 1,
			prNumber: "PR-202511-0010",
			title: "Office Supplies Q4",
			status: "Approved",
			priority: "Normal",
			cataloged: true,
			requiredDate: "2025-11-10",
			costCenter: "IT-001",
			totalAmount: "$15,420.50",
			createdDate: "2025-11-10",
		},
		{
			id: 2,
			prNumber: "PR-202511-0011",
			title: "Office Supplies Q4",
			status: "Pending",
			priority: "Normal",
			cataloged: true,
			requiredDate: "2025-11-10",
			costCenter: "IT-001",
			totalAmount: "$15,420.50",
			createdDate: "2025-11-10",
		},
		{
			id: 3,
			prNumber: "PR-202511-0012",
			title: "Office Supplies Q4",
			status: "Draft",
			priority: "Normal",
			cataloged: false,
			requiredDate: "2025-11-10",
			costCenter: "IT-001",
			totalAmount: "$15,420.50",
			createdDate: "2025-11-10",
		},
	];

	useEffect(() => {
		if (error) {
			toast.error(error, { autoClose: 5000 });
		}
	}, [error]);

	const statusOptions = [
		{ value: "All Statuses", label: "All Statuses" },
		{ value: "posted", label: "Posted" },
		{ value: "draft", label: "Draft" },
	];

	const statCards = [
		{
			title: t("requisitions.stats.totalPRs"),
			value: statistics?.totalLines || 0,
			icon: <IoDocumentTextOutline className="text-[#155dfc]" size={24} />,
			iconBg: "bg-[#EFF6FF]",

			valueColor: "text-gray-900",
		},
		{
			title: t("requisitions.stats.pendingApproval"),
			value: `$${(statistics?.totalDebits || 0).toFixed(2)}`,
			icon: <MdAccessTime className="text-[#F54900]" size={24} />,
			iconBg: "bg-[#FFF7ED]",
			valueColor: "text-red-600",
		},
		{
			title: t("requisitions.stats.approved"),
			value: `$${(statistics?.totalCredits || 0).toFixed(2)}`,
			icon: <DoneIcon />,
			iconBg: "bg-[#F0FDF4]",

			valueColor: "text-green-600",
		},
		{
			title: t("requisitions.stats.totalValue"),
			value: statistics?.postedLines || 0,
			icon: <FiDollarSign className="text-[#7C3AED]" size={24} />,
			iconBg: "bg-[#FAF5FF]",
			valueColor: "text-gray-900",
		},
	];

	const handleFilterChange = (name, value) => {
		setFilters(prev => ({
			...prev,
			[name]: value,
		}));
	};

	const handleViewRequisition = requisition => {
		console.log("View requisition:", requisition);
		// Add your view logic here
	};

	const handleEditRequisition = requisition => {
		console.log("Edit requisition:", requisition);
		// Add your edit logic here
	};

	const handleSubmitRequisition = requisition => {
		console.log("Submit requisition:", requisition);
		// Add your submit logic here
	};

	return (
		<div className="min-h-screen bg-[#EEEEEE]">
			{/* Header */}
			<PageHeader
				title={t("requisitions.title")}
				subtitle={t("requisitions.subtitle")}
				icon={<RequisitionsHeadIcon width={32} height={30} className="text-[#28819C]" />}
			/>

			{/* Title and Create Button Row */}

			<div className="p-6">
				<div className="px-6 py-4 flex justify-between items-center">
					<h1 className="text-3xl font-semibold text-[#28819C]">{t("requisitions.title")}</h1>
					<div className="flex items-center gap-4">
						<button
							onClick={() => setIsNewReqModelOpen(true)}
							className="flex items-center gap-2 px-4 py-2 bg-[#28819C] text-white rounded-[10px] hover:bg-[#206b82] font-medium transition-colors shadow-md hover:shadow-lg"
						>
							<FiPlus className="text-xl" />
							{t("requisitions.createRequisition")}
						</button>

						<button
							onClick={() => setIsBrowseCatalogModelOpen(true)}
							className="flex items-center gap-2 px-4 py-2 bg-[#28819C] text-white rounded-[10px] hover:bg-[#206b82] font-medium transition-colors shadow-md hover:shadow-lg"
						>
							<FiSearch className="text-xl" />
							{t("requisitions.browseCatalog.title")}
						</button>
					</div>
				</div>

				<div className="mx-auto py-6 space-y-6">
					{/* Statistics Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
						{statCards?.map(card => (
							<div
								key={card.title}
								className="bg-white rounded-xl shadow-md px-5 py-4 hover:shadow-lg transition-shadow relative overflow-hidden"
							>
								<div className="relative flex flex-row justify-between items-center">
									<div className="">
										<p className="text-[#4A5565] text-lg font-medium">{card.title}</p>
										<p className={`text-xl font-semibold `}>{card.value}</p>
									</div>
									<div
										className={`p-3 rounded-lg ${
											card.iconBg || "bg-gray-100"
										} flex items-center justify-center`}
									>
										{card.icon}
									</div>
								</div>
							</div>
						))}
					</div>
					{/* Tabs Section */}
					<div className="flex items-center gap-0 bg-white rounded-full p-1 w-fit">
						{tabs.map(tab => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
									activeTab === tab.id
										? "bg-[#EEEEEE] shadow-sm"
										: "text-gray-600 hover:text-[#28819C]"
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>

					<div className="flex justify-end">
						<div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-1/2">
							<div className="relative flex-1">
								<FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
								<input
									type="text"
									value={filters.search}
									onChange={e => handleFilterChange("search", e.target.value)}
									placeholder={t("requisitions.searchPlaceholder")}
									className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28819C] focus:border-transparent text-sm"
								/>
							</div>
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

					{/* Cards Section */}
					{loading ? (
						<div className="flex justify-center items-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#28819C]"></div>
						</div>
					) : (
						requisitionsData.map(requisition => (
							<RequisitionCard
								key={requisition.id}
								requisition={requisition}
								onView={handleViewRequisition}
								onEdit={handleEditRequisition}
								onSubmit={handleSubmitRequisition}
								t={t}
							/>
						))
					)}
				</div>
			</div>
			<SlideUpModal
				isOpen={isNewReqModelOpen}
				onClose={() => setIsNewReqModelOpen(false)}
				title={t("requisitions.newRequisition.title")}
				maxWidth="1000px"
			>
				<NewRequisition />
			</SlideUpModal>
			<SlideUpModal
				isOpen={isBrowseCatalogModelOpen}
				onClose={() => setIsBrowseCatalogModelOpen(false)}
				title={t("requisitions.browseCatalog.title")}
				maxWidth="1000px"
			>
				<BrowseCatalog />
			</SlideUpModal>
		</div>
	);
};

export default RequisitionsPage;
