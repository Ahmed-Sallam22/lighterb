import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { HiViewGrid, HiClock, HiViewList, HiShare } from "react-icons/hi";

import { parseApiError } from "../utils/errorHandler";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import ConfirmModal from "../components/shared/ConfirmModal";
import SlideUpModal from "../components/shared/SlideUpModal";
import HistoryModal from "../components/shared/HistoryModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import Button from "../components/shared/Button";
import SearchInput from "../components/shared/SearchInput";
import DepartmentTreeView from "../components/DepartmentTreeView";

import {
	fetchDepartments,
	createDepartment,
	updateDepartment,
	deleteDepartment,
	fetchDepartmentHistory,
	fetchDepartmentTree,
	setPage,
} from "../store/departmentsSlice";
import { fetchBusinessGroups } from "../store/businessGroupsSlice";
import { fetchLocations } from "../store/locationsSlice";

const FORM_INITIAL_STATE = {
	code: "",
	name: "",
	business_group: "",
	location: "",
	parent: "",
	effective_start_date: "",
	effective_end_date: "",
};

const DepartmentsPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	const { departments, loading, count, page, hasNext, hasPrevious, creating, updating, treeData, treeLoading } =
		useSelector(state => state.departments);
	const { businessGroups } = useSelector(state => state.businessGroups);
	const { locations } = useSelector(state => state.locations);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);
	const [formData, setFormData] = useState(FORM_INITIAL_STATE);
	const [formErrors, setFormErrors] = useState({});
	const [localPageSize, setLocalPageSize] = useState(25);
	const [searchTerm, setSearchTerm] = useState("");
	const [filters, setFilters] = useState({
		status: "",
		business_group: "",
	});
	const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
	const [historyData, setHistoryData] = useState([]);
	const [historyLoading, setHistoryLoading] = useState(false);
	const [historyItem, setHistoryItem] = useState(null);
	const [viewMode, setViewMode] = useState("table"); // "table" or "tree"
	const [selectedTreeBg, setSelectedTreeBg] = useState("");

	useEffect(() => {
		dispatch(fetchBusinessGroups({ page_size: 100 }));
		dispatch(fetchLocations({ page: 1, page_size: 100 }));
	}, [dispatch]);

	useEffect(() => {
		const params = {
			page,
			page_size: localPageSize,
			...(searchTerm && { search: searchTerm }),
			...(filters.status && { status: filters.status }),
			...(filters.business_group && { business_group: filters.business_group }),
		};
		dispatch(fetchDepartments(params));
	}, [dispatch, page, localPageSize, searchTerm, filters]);

	useEffect(() => {
		document.title = `${t("departments.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	// Fetch tree data when switching to tree view or when business group changes
	useEffect(() => {
		if (viewMode === "tree" && selectedTreeBg) {
			dispatch(fetchDepartmentTree(selectedTreeBg));
		}
	}, [dispatch, viewMode, selectedTreeBg]);

	// Auto-select first business group when switching to tree view
	useEffect(() => {
		if (viewMode === "tree" && !selectedTreeBg && businessGroups.length > 0) {
			setSelectedTreeBg(businessGroups[0].id);
		}
	}, [viewMode, selectedTreeBg, businessGroups]);

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

	const columns = [
		{
			header: t("departments.table.code"),
			accessor: "code",
			render: value => value || "-",
		},
		{
			header: t("departments.table.name"),
			accessor: "name",
			render: value => value || "-",
		},
		{
			header: t("departments.table.businessGroup"),
			accessor: "business_group_name",
			render: value => value || "-",
		},
		{
			header: t("departments.table.location"),
			accessor: "location_name",
			render: value => value || "-",
		},
		{
			header: t("departments.table.parentDepartment"),
			accessor: "parent_code",
			render: value => value || "-",
		},
		{
			header: t("departments.table.status"),
			accessor: "status",
			render: renderStatus,
		},
		{
			header: t("departments.table.effectiveStartDate"),
			accessor: "effective_start_date",
			render: value => formatDate(value),
		},
		{
			header: t("departments.table.effectiveEndDate"),
			accessor: "effective_end_date",
			render: value => formatDate(value),
		},
	];

	const businessGroupOptions = [
		{ value: "", label: t("departments.form.selectBusinessGroup") },
		...businessGroups.map(bg => ({
			value: bg.id,
			label: bg.name,
		})),
	];

	const locationOptions = [
		{ value: "", label: t("departments.form.selectLocation") },
		...locations.map(loc => ({
			value: loc.id,
			label: loc.name,
		})),
	];

	const parentDepartmentOptions = [
		{ value: "", label: t("departments.form.selectParent") },
		...departments
			.filter(dept => dept.id !== editingItem?.id)
			.map(dept => ({
				value: dept.id,
				label: `${dept.name} (${dept.code})`,
			})),
	];

	const statusFilterOptions = [
		{ value: "", label: t("departments.filters.allStatus") },
		{ value: "active", label: t("common.active") },
		{ value: "inactive", label: t("common.inactive") },
	];

	const handleFilterChange = (key, value) => {
		setFilters(prev => ({ ...prev, [key]: value }));
		dispatch(setPage(1));
	};

	const handleCreate = () => {
		setEditingItem(null);
		setFormData(FORM_INITIAL_STATE);
		setFormErrors({});
		setIsModalOpen(true);
	};

	const handleEdit = item => {
		setEditingItem(item);
		setFormData({
			code: item.code || "",
			name: item.name || "",
			business_group: item.business_group || "",
			location: item.location || "",
			parent: item.parent || "",
			effective_start_date: item.effective_start_date || "",
			effective_end_date: item.effective_end_date || "",
		});
		setFormErrors({});
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingItem(null);
		setFormData(FORM_INITIAL_STATE);
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
			errors.name = t("departments.form.nameRequired");
		}
		if (!editingItem) {
			if (!formData.business_group) {
				errors.business_group = t("common.required");
			}
			if (!formData.location) {
				errors.location = t("common.required");
			}
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			if (editingItem) {
				// For update, only send editable fields (code and business_group are read-only)
				const payload = {
					name: formData.name,
					...(formData.location && { location: formData.location }),
					...(formData.parent && { parent: formData.parent }),
					...(formData.effective_start_date && { effective_start_date: formData.effective_start_date }),
					...(formData.effective_end_date && { effective_end_date: formData.effective_end_date }),
				};
				await dispatch(updateDepartment({ id: editingItem.id, data: payload })).unwrap();
				toast.success(t("departments.messages.updated"));
			} else {
				// For create, send all required fields
				const payload = {
					name: formData.name,
					business_group: formData.business_group,
					location: formData.location,
					...(formData.code && { code: formData.code }),
					...(formData.parent && { parent: formData.parent }),
					...(formData.effective_start_date && { effective_start_date: formData.effective_start_date }),
					...(formData.effective_end_date && { effective_end_date: formData.effective_end_date }),
				};
				await dispatch(createDepartment(payload)).unwrap();
				toast.success(t("departments.messages.created"));
			}
			handleCloseModal();
			dispatch(fetchDepartments({ page, page_size: localPageSize }));
		} catch (error) {
			toast.error(parseApiError(error, t, "departments.messages.saveError"));
		}
	};

	const handleDeleteClick = item => {
		setItemToDelete(item);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!itemToDelete) return;
		try {
			await dispatch(deleteDepartment(itemToDelete.id)).unwrap();
			toast.success(t("departments.messages.deleted"));
			setIsDeleteModalOpen(false);
			setItemToDelete(null);
		} catch (error) {
			toast.error(parseApiError(error, t, "departments.messages.deleteError"));
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
			const result = await dispatch(fetchDepartmentHistory(item.id)).unwrap();
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

	const historyColumns = [
		{ header: t("departments.table.name"), accessor: "name" },
		{ header: t("departments.table.code"), accessor: "code" },
		{ header: t("departments.table.businessGroup"), accessor: "business_group_name" },
		{ header: t("departments.table.location"), accessor: "location_name" },
		{ header: t("departments.table.parentDepartment"), accessor: "parent_code" },
		{ header: t("departments.table.status"), accessor: "status" },
	];

	const historyCustomActions = [
		{
			title: t("history.viewHistory"),
			icon: <HiClock className="w-5 h-5 text-[#1D7A8C]" />,
			onClick: handleViewHistory,
		},
	];

	// Tree view handlers
	const handleTreeNodeClick = node => {
		// Find the full department data and open edit modal
		const dept = departments.find(d => d.id === node.id);
		if (dept) {
			handleEdit(dept);
		}
	};

	const handleRefreshTree = () => {
		if (selectedTreeBg) {
			dispatch(fetchDepartmentTree(selectedTreeBg));
		}
	};

	const handleTreeBgChange = e => {
		setSelectedTreeBg(e.target.value);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer position="top-right" autoClose={3000} />

			<PageHeader
				icon={<HiViewGrid className="w-8 h-8 text-white mr-3" />}
				title={t("departments.title")}
				subtitle={t("departments.subtitle")}
			/>

			<div className="p-6">
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<div className="flex justify-between items-center mb-6">
						<div className="flex items-center gap-4">
							<h2 className="text-2xl font-bold text-[#1D7A8C]">{t("departments.title")}</h2>
							{/* View Mode Toggle */}
							<div className="flex items-center bg-gray-100 rounded-lg p-1">
								<button
									onClick={() => setViewMode("table")}
									className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
										viewMode === "table"
											? "bg-white text-[#1D7A8C] shadow-sm"
											: "text-gray-600 hover:text-gray-800"
									}`}
								>
									<HiViewList className="w-4 h-4" />
									{t("departments.viewMode.table")}
								</button>
								<button
									onClick={() => setViewMode("tree")}
									className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
										viewMode === "tree"
											? "bg-white text-[#1D7A8C] shadow-sm"
											: "text-gray-600 hover:text-gray-800"
									}`}
								>
									<HiShare className="w-4 h-4" />
									{t("departments.viewMode.tree")}
								</button>
							</div>
						</div>
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
							title={t("departments.createDepartment")}
							className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
						/>
					</div>

					{viewMode === "table" ? (
						<>
							{/* Filters */}
							<div className="flex flex-wrap gap-4 mb-6">
								<div className="w-64">
									<SearchInput
										value={searchTerm}
										onChange={e => {
											setSearchTerm(e.target.value);
											dispatch(setPage(1));
										}}
										placeholder={t("departments.searchPlaceholder")}
									/>
								</div>
								<div className="w-48">
									<FloatingLabelSelect
										label={t("departments.filters.status")}
										name="status"
										value={filters.status}
										onChange={e => handleFilterChange("status", e.target.value)}
										options={statusFilterOptions}
									/>
								</div>
								<div className="w-48">
									<FloatingLabelSelect
										label={t("departments.filters.businessGroup")}
										name="business_group"
										value={filters.business_group}
										onChange={e => handleFilterChange("business_group", e.target.value)}
										options={businessGroupOptions}
									/>
								</div>
							</div>

							<Table
								columns={columns}
								data={departments}
								onEdit={handleEdit}
								onDelete={handleDeleteClick}
								customActions={historyCustomActions}
								emptyMessage={t("departments.table.emptyMessage")}
							/>

							<div className="mt-6">
								<Pagination
									currentPage={page}
									totalCount={count}
									pageSize={localPageSize}
									onPageChange={handlePageChange}
									onPageSizeChange={handlePageSizeChange}
									hasNext={hasNext}
									hasPrevious={hasPrevious}
								/>
							</div>
						</>
					) : (
						<>
							{/* Tree View Filters */}
							<div className="flex flex-wrap gap-4 mb-6">
								<div className="w-64">
									<FloatingLabelSelect
										label={t("departments.filters.businessGroup")}
										name="tree_business_group"
										value={selectedTreeBg}
										onChange={handleTreeBgChange}
										options={businessGroupOptions.filter(opt => opt.value !== "")}
									/>
								</div>
								<Button
									onClick={handleRefreshTree}
									icon={
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
											/>
										</svg>
									}
									title={t("common.refresh")}
									className="bg-gray-100 hover:bg-gray-200 text-gray-700"
								/>
							</div>

							<DepartmentTreeView
								treeData={treeData}
								loading={treeLoading}
								onNodeClick={handleTreeNodeClick}
								onRefresh={handleRefreshTree}
							/>
						</>
					)}
				</div>
			</div>

			{/* Create/Edit Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={editingItem ? t("departments.modal.editTitle") : t("departments.modal.createTitle")}
			>
				<form onSubmit={handleSubmit} className="space-y-4 p-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("departments.form.code")}
							name="code"
							value={formData.code}
							onChange={handleInputChange}
							placeholder={t("departments.form.codeOptional")}
							disabled={!!editingItem}
						/>
						<FloatingLabelInput
							label={t("departments.form.name")}
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							error={formErrors.name}
							required
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelSelect
							label={t("departments.form.businessGroup")}
							name="business_group"
							value={formData.business_group}
							onChange={handleInputChange}
							options={businessGroupOptions}
							disabled={!!editingItem}
						/>
						<FloatingLabelSelect
							label={t("departments.form.location")}
							name="location"
							value={formData.location}
							onChange={handleInputChange}
							options={locationOptions}
							error={!editingItem ? formErrors.location : undefined}
							required={!editingItem}
						/>
					</div>

					<FloatingLabelSelect
						label={t("departments.form.parentDepartment")}
						name="parent"
						value={formData.parent}
						onChange={handleInputChange}
						options={parentDepartmentOptions}
					/>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("departments.form.effectiveStartDate")}
							name="effective_start_date"
							type="date"
							value={formData.effective_start_date}
							onChange={handleInputChange}
							error={formErrors.effective_start_date}
							required
						/>
						<FloatingLabelInput
							label={t("departments.form.effectiveEndDate")}
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
							disabled={creating || updating}
							title={
								creating || updating
									? t("common.saving")
									: editingItem
									? t("departments.modal.update")
									: t("departments.modal.create")
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
				title={t("departments.deleteModal.title")}
				message={t("departments.deleteModal.message", { name: itemToDelete?.name })}
				confirmText={t("departments.deleteModal.confirm")}
				cancelText={t("departments.deleteModal.cancel")}
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

export default DepartmentsPage;
