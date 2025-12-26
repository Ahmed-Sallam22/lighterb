import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

import PageHeader from "../components/shared/PageHeader";
import Card from "../components/shared/Card";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import Button from "../components/shared/Button";
import Tabs from "../components/shared/Tabs";
import { fetchPages, createJobRoleWithPages, clearError } from "../store/jobRolesSlice";

// Icons mapping for pages
import { HiDocumentText, HiUsers } from "react-icons/hi";
import {
	FaFileInvoiceDollar,
	FaCreditCard,
	FaFileAlt,
	FaUserTie,
	FaChartBar,
	FaCalendarAlt,
	FaCog,
	FaBox,
	FaMoneyBillWave,
} from "react-icons/fa";
import { MdDashboard, MdPeople, MdShoppingCart, MdWork } from "react-icons/md";

// Page icons mapping - maps page names/codes to icons
const PAGE_ICONS = {
	invoices: FaFileInvoiceDollar,
	accounting: HiDocumentText,
	reports: FaChartBar,
	users: HiUsers,
	"users management": HiUsers,
	payments: FaCreditCard,
	inventory: FaBox,
	"financial reports": FaMoneyBillWave,
	calendar: FaCalendarAlt,
	settings: FaCog,
	dashboard: MdDashboard,
	customers: MdPeople,
	suppliers: MdShoppingCart,
	"job roles": MdWork,
	"ar invoices": FaFileInvoiceDollar,
	"ap invoices": FaFileAlt,
	"ar receipts": FaCreditCard,
	"ap payments": FaCreditCard,
	journals: HiDocumentText,
	"journal entries": HiDocumentText,
	assets: FaBox,
	procurement: MdShoppingCart,
	requisitions: FaFileAlt,
	approvals: FaUserTie,
};

// Function to get icon for a page
const getPageIcon = pageName => {
	const normalizedName = pageName?.toLowerCase() || "";
	for (const [key, Icon] of Object.entries(PAGE_ICONS)) {
		if (normalizedName.includes(key)) {
			return Icon;
		}
	}
	return HiDocumentText; // Default icon
};

// Job Roles Icon
const JobRolesIcon = () => (
	<svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g opacity="0.5">
			<path
				d="M14 13.5C17.3137 13.5 20 10.8137 20 7.5C20 4.18629 17.3137 1.5 14 1.5C10.6863 1.5 8 4.18629 8 7.5C8 10.8137 10.6863 13.5 14 13.5Z"
				fill="#D3D3D3"
			/>
			<path
				d="M2 25.5C2 19.9772 6.47715 15.5 12 15.5H16C21.5228 15.5 26 19.9772 26 25.5V26.5H2V25.5Z"
				fill="#D3D3D3"
			/>
		</g>
	</svg>
);

// Checkbox component
const Checkbox = ({ checked, onChange, disabled }) => (
	<button
		type="button"
		onClick={() => !disabled && onChange(!checked)}
		disabled={disabled}
		className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
			checked ? "bg-[#28819C] border-[#28819C]" : "bg-white border-gray-300 hover:border-[#28819C]"
		} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
	>
		{checked && (
			<svg width="12" height="10" viewBox="0 0 12 10" fill="none">
				<path
					d="M1 5L4.5 8.5L11 1"
					stroke="white"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		)}
	</button>
);

const CreateJobRolePage = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { t } = useTranslation();

	const { pages = [], pagesLoading, creating, actionError } = useSelector(state => state.jobRoles || {});

	// Tabs
	const [activeTab, setActiveTab] = useState("general");

	// Form data
	const [formData, setFormData] = useState({
		name: "",
		description: "",
	});

	// Selected page IDs
	const [selectedPageIds, setSelectedPageIds] = useState([]);

	// Fetch pages on mount
	useEffect(() => {
		dispatch(fetchPages());
	}, [dispatch]);

	// Update page title
	useEffect(() => {
		document.title = `${t("jobRoles.modals.createTitle")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	// Show error toast
	useEffect(() => {
		if (actionError) {
			toast.error(actionError, { autoClose: 5000 });
			dispatch(clearError());
		}
	}, [actionError, dispatch]);

	const tabs = [
		{ id: "general", label: t("jobRoles.tabs.general") },
		{ id: "functions", label: t("jobRoles.tabs.functions") },
	];

	const handleFormChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handlePageToggle = pageId => {
		setSelectedPageIds(prev => (prev.includes(pageId) ? prev.filter(id => id !== pageId) : [...prev, pageId]));
	};

	const handleCancel = () => {
		navigate("/job-roles");
	};

	const handleSubmit = async () => {
		// Validate required fields
		if (!formData.name.trim()) {
			toast.error(t("jobRoles.form.nameRequired"));
			return;
		}

		const payload = {
			name: formData.name.trim(),
			description: formData.description.trim(),
			page_ids: selectedPageIds,
		};

		try {
			await dispatch(createJobRoleWithPages(payload)).unwrap();
			toast.success(t("jobRoles.messages.created"));
			navigate("/job-roles");
		} catch {
			// Error handled by Redux
		}
	};

	// Get functions count for selected pages
	const getPageFunctionsCount = page => {
		// If page has functions/permissions count, use it
		return page.functions_count || page.permissions_count || 0;
	};

	return (
		<div className="min-h-screen bg-[#EEEEEE]">
			<ToastContainer position="top-right" />

			{/* Header */}
			<PageHeader
				title={t("jobRoles.title")}
				subtitle={t("jobRoles.modals.createTitle")}
				icon={<JobRolesIcon />}
			/>

			<div className="max-w-6xl mx-auto mt-5 pb-10 px-6 space-y-5">
				{/* Header with Cancel and Create buttons */}
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-bold text-[#28819C]">{t("jobRoles.modals.createTitle")}</h1>
					<div className="flex gap-3">
						<Button
							onClick={handleCancel}
							title={t("jobRoles.actions.cancel")}
							className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-none"
						/>
						<Button
							onClick={handleSubmit}
							disabled={creating}
							title={creating ? t("jobRoles.actions.creating") : t("jobRoles.actions.create")}
							className="bg-[#28819C] hover:bg-[#1d6a80] text-white"
						/>
					</div>
				</div>

				{/* Tabs */}
				<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

				{/* Tab Content */}
				{activeTab === "general" && (
					<Card>
						<div className="grid grid-cols-1 gap-6 p-2">
							<FloatingLabelInput
								label={t("jobRoles.form.name")}
								name="name"
								value={formData.name}
								onChange={handleFormChange}
								required
								placeholder={t("jobRoles.form.namePlaceholder")}
							/>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("jobRoles.form.description")}
								</label>
								<textarea
									name="description"
									value={formData.description}
									onChange={handleFormChange}
									rows={4}
									className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-[#48C1F0] resize-none"
									placeholder={t("jobRoles.form.descriptionPlaceholder")}
								/>
							</div>
						</div>
					</Card>
				)}

				{activeTab === "functions" && (
					<Card>
						<div className="p-2">
							<div className="mb-4">
								<h3 className="text-lg font-semibold text-gray-900">{t("jobRoles.functions.title")}</h3>
								<p className="text-sm text-gray-500">{t("jobRoles.functions.subtitle")}</p>
							</div>

							{pagesLoading ? (
								<div className="flex items-center justify-center py-12">
									<div className="w-8 h-8 border-4 border-[#28819C] border-t-transparent rounded-full animate-spin"></div>
								</div>
							) : pages.length === 0 ? (
								<div className="text-center py-12 text-gray-500">{t("jobRoles.functions.noPages")}</div>
							) : (
								<div className="space-y-2">
									{pages.map(page => {
										const PageIcon = getPageIcon(page.name);
										const isSelected = selectedPageIds.includes(page.id);
										const functionsCount = getPageFunctionsCount(page);

										return (
											<div
												key={page.id}
												className={`flex items-center gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
													isSelected
														? "border-[#28819C] bg-[#28819C]/5"
														: "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
												}`}
												onClick={() => handlePageToggle(page.id)}
											>
												{/* Checkbox */}
												<Checkbox
													checked={isSelected}
													onChange={() => handlePageToggle(page.id)}
												/>

												{/* Icon */}
												<div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
													<PageIcon className="w-5 h-5 text-gray-600" />
												</div>

												{/* Page Info */}
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2">
														<h4 className="font-medium text-gray-900">{page.name}</h4>
														{functionsCount > 0 && (
															<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
																{functionsCount}
															</span>
														)}
													</div>
													<p className="text-sm text-gray-500 truncate">
														{page.description || page.code || "No description"}
													</p>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					</Card>
				)}
			</div>
		</div>
	);
};

export default CreateJobRolePage;
