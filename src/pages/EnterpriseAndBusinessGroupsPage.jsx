import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { HiOfficeBuilding, HiClock } from "react-icons/hi";

import { parseApiError } from "../utils/errorHandler";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Tabs from "../components/shared/Tabs";
import Pagination from "../components/shared/Pagination";
import ConfirmModal from "../components/shared/ConfirmModal";
import SlideUpModal from "../components/shared/SlideUpModal";
import HistoryModal from "../components/shared/HistoryModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import Button from "../components/shared/Button";

import {
	fetchBusinessGroups,
	createBusinessGroup,
	updateBusinessGroup,
	deleteBusinessGroup,
	fetchBusinessGroupHistory,
	setPage as setBusinessGroupPage,
} from "../store/businessGroupsSlice";
import {
	fetchEnterprises,
	createEnterprise,
	updateEnterprise,
	deleteEnterprise,
	fetchEnterpriseHistory,
	setPage as setEnterprisePage,
} from "../store/enterprisesSlice";

const BUSINESS_GROUP_FORM_INITIAL = {
	name: "",
	code: "",
	enterprise: "",
	effective_start_date: "",
	effective_end_date: "",
};

const ENTERPRISE_FORM_INITIAL = {
	name: "",
	code: "",
	effective_start_date: "",
	effective_end_date: "",
};

const EnterpriseAndBusinessGroupsPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	// Redux state
	const {
		businessGroups,
		loading: bgLoading,
		count: bgCount,
		page: bgPage,
		hasNext: bgHasNext,
		hasPrevious: bgHasPrevious,
		creating: bgCreating,
		updating: bgUpdating,
	} = useSelector(state => state.businessGroups);

	const {
		enterprises,
		loading: entLoading,
		count: entCount,
		page: entPage,
		hasNext: entHasNext,
		hasPrevious: entHasPrevious,
		creating: entCreating,
		updating: entUpdating,
	} = useSelector(state => state.enterprises);

	// Local state
	const [activeTab, setActiveTab] = useState("businessGroups");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);
	const [formData, setFormData] = useState(BUSINESS_GROUP_FORM_INITIAL);
	const [formErrors, setFormErrors] = useState({});
	const [localPageSize, setLocalPageSize] = useState(25);
	const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
	const [historyData, setHistoryData] = useState([]);
	const [historyLoading, setHistoryLoading] = useState(false);
	const [historyItem, setHistoryItem] = useState(null);

	const tabs = [
		{ id: "businessGroups", label: t("enterpriseBusinessGroups.tabs.businessGroups") },
		{ id: "enterprise", label: t("enterpriseBusinessGroups.tabs.enterprise") },
	];

	// Fetch data based on active tab
	useEffect(() => {
		if (activeTab === "businessGroups") {
			dispatch(fetchBusinessGroups({ page: bgPage, page_size: localPageSize }));
			// Also fetch enterprises for dropdown
			dispatch(fetchEnterprises({ page: 1, page_size: 100 }));
		} else {
			dispatch(fetchEnterprises({ page: entPage, page_size: localPageSize }));
		}
	}, [dispatch, activeTab, bgPage, entPage, localPageSize]);

	useEffect(() => {
		document.title = `${t("enterpriseBusinessGroups.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	const handlePageChange = useCallback(
		newPage => {
			if (activeTab === "businessGroups") {
				dispatch(setBusinessGroupPage(newPage));
			} else {
				dispatch(setEnterprisePage(newPage));
			}
		},
		[dispatch, activeTab]
	);

	const handlePageSizeChange = useCallback(
		newPageSize => {
			setLocalPageSize(newPageSize);
			if (activeTab === "businessGroups") {
				dispatch(setBusinessGroupPage(1));
			} else {
				dispatch(setEnterprisePage(1));
			}
		},
		[dispatch, activeTab]
	);

	const formatDate = dateString => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
	};

	const renderStatus = value => {
		const isActive = value === "active";
		return (
			<span
				className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
					isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
				}`}
			>
				<span
					className={`w-2 h-2 rounded-full ${isRtl ? "ml-1.5" : "mr-1.5"} ${
						isActive ? "bg-green-500" : "bg-gray-400"
					}`}
				></span>
				{isActive ? t("common.active") : t("common.inactive")}
			</span>
		);
	};

	// Business Groups columns
	const businessGroupColumns = [
		{
			header: t("enterpriseBusinessGroups.businessGroups.table.groupName"),
			accessor: "name",
			render: value => value || "-",
		},
		{
			header: t("enterpriseBusinessGroups.businessGroups.table.groupCode"),
			accessor: "code",
			render: value => value || "-",
		},
		{
			header: t("enterpriseBusinessGroups.businessGroups.table.enterprise"),
			accessor: "enterprise_name",
			render: value => value || "-",
		},
		{
			header: t("enterpriseBusinessGroups.businessGroups.table.startDate"),
			accessor: "effective_start_date",
			render: value => formatDate(value),
		},
		{
			header: t("enterpriseBusinessGroups.businessGroups.table.endDate"),
			accessor: "effective_end_date",
			render: value => formatDate(value),
		},
		{
			header: t("enterpriseBusinessGroups.businessGroups.table.status"),
			accessor: "status",
			render: renderStatus,
		},
	];

	// Enterprise columns
	const enterpriseColumns = [
		{
			header: t("enterpriseBusinessGroups.enterprise.table.name"),
			accessor: "name",
			render: value => value || "-",
		},
		{
			header: t("enterpriseBusinessGroups.enterprise.table.code"),
			accessor: "code",
			render: value => value || "-",
		},
		{
			header: t("enterpriseBusinessGroups.enterprise.table.startDate"),
			accessor: "effective_start_date",
			render: value => formatDate(value),
		},
		{
			header: t("enterpriseBusinessGroups.enterprise.table.endDate"),
			accessor: "effective_end_date",
			render: value => formatDate(value),
		},
		{
			header: t("enterpriseBusinessGroups.enterprise.table.status"),
			accessor: "status",
			render: renderStatus,
		},
	];

	const enterpriseOptions = [
		{ value: "", label: t("enterpriseBusinessGroups.businessGroups.form.selectEnterprise") },
		...enterprises.map(ent => ({
			value: ent.id,
			label: ent.name,
		})),
	];

	const handleCreate = () => {
		setEditingItem(null);
		setFormData(activeTab === "businessGroups" ? BUSINESS_GROUP_FORM_INITIAL : ENTERPRISE_FORM_INITIAL);
		setFormErrors({});
		setIsModalOpen(true);
	};

	const handleEdit = item => {
		setEditingItem(item);
		if (activeTab === "businessGroups") {
			setFormData({
				name: item.name || "",
				code: item.code || "",
				enterprise: item.enterprise || "",
				effective_start_date: item.effective_start_date || "",
				effective_end_date: item.effective_end_date || "",
			});
		} else {
			setFormData({
				name: item.name || "",
				code: item.code || "",
				effective_start_date: item.effective_start_date || "",
				effective_end_date: item.effective_end_date || "",
			});
		}
		setFormErrors({});
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingItem(null);
		setFormData(activeTab === "businessGroups" ? BUSINESS_GROUP_FORM_INITIAL : ENTERPRISE_FORM_INITIAL);
		setFormErrors({});
	};

	const handleInputChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		if (formErrors[name]) {
			setFormErrors(prev => ({ ...prev, [name]: "" }));
		}
	};

	const validateForm = () => {
		const errors = {};
		if (!formData.name.trim()) {
			errors.name = t("common.required");
		}
		if (activeTab === "businessGroups" && !editingItem && !formData.enterprise) {
			errors.enterprise = t("common.required");
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			if (activeTab === "businessGroups") {
				const payload = {
					name: formData.name,
					...(formData.effective_start_date && { effective_start_date: formData.effective_start_date }),
					...(formData.effective_end_date && { effective_end_date: formData.effective_end_date }),
				};

				if (!editingItem) {
					// For create, include code and enterprise
					if (formData.code) payload.code = formData.code;
					payload.enterprise = formData.enterprise;
				}

				if (editingItem) {
					await dispatch(updateBusinessGroup({ id: editingItem.id, data: payload })).unwrap();
					toast.success(t("enterpriseBusinessGroups.businessGroups.messages.updateSuccess"));
				} else {
					await dispatch(createBusinessGroup(payload)).unwrap();
					toast.success(t("enterpriseBusinessGroups.businessGroups.messages.createSuccess"));
				}
				dispatch(fetchBusinessGroups({ page: bgPage, page_size: localPageSize }));
			} else {
				const payload = {
					name: formData.name,
					...(formData.effective_start_date && { effective_start_date: formData.effective_start_date }),
					...(formData.effective_end_date && { effective_end_date: formData.effective_end_date }),
				};

				if (!editingItem && formData.code) {
					payload.code = formData.code;
				}

				if (editingItem) {
					await dispatch(updateEnterprise({ id: editingItem.id, data: payload })).unwrap();
					toast.success(t("enterpriseBusinessGroups.enterprise.messages.updateSuccess"));
				} else {
					await dispatch(createEnterprise(payload)).unwrap();
					toast.success(t("enterpriseBusinessGroups.enterprise.messages.createSuccess"));
				}
				dispatch(fetchEnterprises({ page: entPage, page_size: localPageSize }));
			}
			handleCloseModal();
		} catch (error) {
			toast.error(parseApiError(error, t, "errors.generic"));
		}
	};

	const handleDeleteClick = item => {
		setItemToDelete(item);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!itemToDelete) return;
		try {
			if (activeTab === "businessGroups") {
				await dispatch(deleteBusinessGroup(itemToDelete.id)).unwrap();
				toast.success(t("enterpriseBusinessGroups.businessGroups.messages.deleted"));
			} else {
				await dispatch(deleteEnterprise(itemToDelete.id)).unwrap();
				toast.success(t("enterpriseBusinessGroups.enterprise.messages.deleted"));
			}
			setIsDeleteModalOpen(false);
			setItemToDelete(null);
		} catch (error) {
			toast.error(parseApiError(error, t, "enterpriseBusinessGroups.messages.deleteError"));
		}
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
		setItemToDelete(null);
	};

	const handleViewHistory = async item => {
		setHistoryItem(item);
		setIsHistoryModalOpen(true);
		setHistoryLoading(true);
		try {
			let result;
			if (activeTab === "businessGroups") {
				result = await dispatch(fetchBusinessGroupHistory(item.id)).unwrap();
			} else {
				result = await dispatch(fetchEnterpriseHistory(item.id)).unwrap();
			}
			setHistoryData(result.results || []);
		} catch (error) {
			toast.error(parseApiError(error, t, "history.fetchError"));
			setHistoryData([]);
		} finally {
			setHistoryLoading(false);
		}
	};

	const handleCloseHistoryModal = () => {
		setIsHistoryModalOpen(false);
		setHistoryData([]);
		setHistoryItem(null);
	};

	const historyColumns =
		activeTab === "businessGroups"
			? [
					{ header: t("enterpriseBusinessGroups.businessGroups.table.groupName"), accessor: "name" },
					{ header: t("enterpriseBusinessGroups.businessGroups.table.groupCode"), accessor: "code" },
					{
						header: t("enterpriseBusinessGroups.businessGroups.table.enterprise"),
						accessor: "enterprise_name",
					},
					{ header: t("enterpriseBusinessGroups.businessGroups.table.status"), accessor: "status" },
			  ]
			: [
					{ header: t("enterpriseBusinessGroups.enterprise.table.name"), accessor: "name" },
					{ header: t("enterpriseBusinessGroups.enterprise.table.code"), accessor: "code" },
					{ header: t("enterpriseBusinessGroups.enterprise.table.status"), accessor: "status" },
			  ];

	const historyCustomActions = [
		{
			title: t("history.viewHistory"),
			icon: <HiClock className="w-5 h-5 text-[#1D7A8C]" />,
			onClick: handleViewHistory,
		},
	];

	const currentData = activeTab === "businessGroups" ? businessGroups : enterprises;
	const currentColumns = activeTab === "businessGroups" ? businessGroupColumns : enterpriseColumns;
	const currentLoading = activeTab === "businessGroups" ? bgLoading : entLoading;
	const currentCount = activeTab === "businessGroups" ? bgCount : entCount;
	const currentPage = activeTab === "businessGroups" ? bgPage : entPage;
	const currentHasNext = activeTab === "businessGroups" ? bgHasNext : entHasNext;
	const currentHasPrevious = activeTab === "businessGroups" ? bgHasPrevious : entHasPrevious;
	const currentCreating = activeTab === "businessGroups" ? bgCreating : entCreating;
	const currentUpdating = activeTab === "businessGroups" ? bgUpdating : entUpdating;

	const getCreateButtonText = () => {
		return activeTab === "businessGroups"
			? t("enterpriseBusinessGroups.businessGroups.createBusinessGroup")
			: t("enterpriseBusinessGroups.enterprise.createEnterprise");
	};

	const getModalTitle = () => {
		if (activeTab === "businessGroups") {
			return editingItem
				? t("enterpriseBusinessGroups.businessGroups.modal.editTitle")
				: t("enterpriseBusinessGroups.businessGroups.modal.createTitle");
		}
		return editingItem
			? t("enterpriseBusinessGroups.enterprise.modal.editTitle")
			: t("enterpriseBusinessGroups.enterprise.modal.createTitle");
	};

	const getTableTitle = () => {
		return activeTab === "businessGroups"
			? t("enterpriseBusinessGroups.businessGroups.title")
			: t("enterpriseBusinessGroups.enterprise.title");
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer position="top-right" autoClose={3000} />

			<PageHeader
				icon={<HiOfficeBuilding className="w-8 h-8 text-white mr-3" />}
				title={t("enterpriseBusinessGroups.title")}
				subtitle={t("enterpriseBusinessGroups.subtitle")}
			/>

			<div className="p-6">
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<div className="mb-6">
						<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
					</div>

					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold text-[#1D7A8C]">{getTableTitle()}</h2>
						<Button
							onClick={handleCreate}
							icon={
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4v16m8-8H4"
									/>
								</svg>
							}
							title={getCreateButtonText()}
							className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
						/>
					</div>

					<Table
						columns={currentColumns}
						data={currentData}
						onEdit={handleEdit}
						onDelete={handleDeleteClick}
						customActions={historyCustomActions}
						emptyMessage={t("enterpriseBusinessGroups.table.emptyMessage")}
					/>

					<div className="mt-6">
						<Pagination
							currentPage={currentPage}
							totalCount={currentCount}
							pageSize={localPageSize}
							onPageChange={handlePageChange}
							onPageSizeChange={handlePageSizeChange}
							hasNext={currentHasNext}
							hasPrevious={currentHasPrevious}
						/>
					</div>
				</div>
			</div>

			{/* Create/Edit Modal */}
			<SlideUpModal isOpen={isModalOpen} onClose={handleCloseModal} title={getModalTitle()}>
				<form onSubmit={handleSubmit} className="space-y-4 p-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={
								activeTab === "businessGroups"
									? t("enterpriseBusinessGroups.businessGroups.form.groupName")
									: t("enterpriseBusinessGroups.enterprise.form.name")
							}
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							error={formErrors.name}
							required
						/>
						<FloatingLabelInput
							label={
								activeTab === "businessGroups"
									? t("enterpriseBusinessGroups.businessGroups.form.groupCode")
									: t("enterpriseBusinessGroups.enterprise.form.code")
							}
							name="code"
							value={formData.code}
							onChange={handleInputChange}
							disabled={!!editingItem}
						/>
					</div>

					{activeTab === "businessGroups" && (
						<FloatingLabelSelect
							label={t("enterpriseBusinessGroups.businessGroups.form.enterprise")}
							name="enterprise"
							value={formData.enterprise}
							onChange={handleInputChange}
							options={enterpriseOptions}
							error={formErrors.enterprise}
							disabled={!!editingItem}
							required={!editingItem}
						/>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("enterpriseBusinessGroups.form.startDate")}
							name="effective_start_date"
							type="date"
							value={formData.effective_start_date}
							onChange={handleInputChange}
						/>
						<FloatingLabelInput
							label={t("enterpriseBusinessGroups.form.endDate")}
							name="effective_end_date"
							type="date"
							value={formData.effective_end_date}
							onChange={handleInputChange}
						/>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							onClick={handleCloseModal}
							title={t("common.cancel")}
							className="bg-gray-200 hover:bg-gray-300 text-gray-800"
						/>
						<Button
							type="submit"
							disabled={currentCreating || currentUpdating}
							title={
								currentCreating || currentUpdating
									? t("common.saving")
									: editingItem
									? t("common.update")
									: t("common.create")
							}
							className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
						/>
					</div>
				</form>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title={
					activeTab === "businessGroups"
						? t("enterpriseBusinessGroups.businessGroups.deleteModal.title")
						: t("enterpriseBusinessGroups.enterprise.deleteModal.title")
				}
				message={
					activeTab === "businessGroups"
						? t("enterpriseBusinessGroups.businessGroups.deleteModal.message")
						: t("enterpriseBusinessGroups.enterprise.deleteModal.message")
				}
				confirmText={t("common.delete")}
				cancelText={t("common.cancel")}
				variant="danger"
			/>

			{/* History Modal */}
			<HistoryModal
				isOpen={isHistoryModalOpen}
				onClose={handleCloseHistoryModal}
				title={t("history.title", { name: historyItem?.name || "" })}
				loading={historyLoading}
				data={historyData}
				columns={historyColumns}
			/>
		</div>
	);
};

export default EnterpriseAndBusinessGroupsPage;
