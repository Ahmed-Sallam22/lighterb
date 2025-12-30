import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { HiBriefcase, HiClock, HiViewList, HiShare } from "react-icons/hi";

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
import PositionTreeView from "../components/PositionTreeView";

import {
	fetchPositions,
	createPosition,
	updatePosition,
	deletePosition,
	fetchPositionHistory,
	fetchPositionHierarchy,
	setPage,
} from "../store/positionsSlice";
import { fetchDepartments } from "../store/departmentsSlice";
import { fetchLocations } from "../store/locationsSlice";
import { fetchGrades } from "../store/gradesSlice";
import { fetchBusinessGroups } from "../store/businessGroupsSlice";

const FORM_INITIAL_STATE = {
	name: "",
	code: "",
	department: "",
	location: "",
	grade: "",
	reports_to: "",
	effective_start_date: "",
	effective_end_date: "",
};

const PositionsPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	const { positions, loading, count, page, hasNext, hasPrevious, creating, updating, treeData, treeLoading } =
		useSelector(state => state.positions);
	const { departments } = useSelector(state => state.departments);
	const { locations } = useSelector(state => state.locations);
	const { grades } = useSelector(state => state.grades);
	const { businessGroups } = useSelector(state => state.businessGroups);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);
	const [formData, setFormData] = useState(FORM_INITIAL_STATE);
	const [formErrors, setFormErrors] = useState({});
	const [localPageSize, setLocalPageSize] = useState(25);
	const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
	const [historyData, setHistoryData] = useState([]);
	const [historyLoading, setHistoryLoading] = useState(false);
	const [historyItem, setHistoryItem] = useState(null);
	const [viewMode, setViewMode] = useState("table"); // "table" or "tree"
	const [selectedTreeBg, setSelectedTreeBg] = useState("");

	useEffect(() => {
		dispatch(fetchPositions({ page, page_size: localPageSize }));
	}, [dispatch, page, localPageSize]);

	useEffect(() => {
		dispatch(fetchBusinessGroups({ page_size: 100 }));
	}, [dispatch]);

	// Fetch tree data when switching to tree view or when business group changes
	useEffect(() => {
		if (viewMode === "tree" && selectedTreeBg) {
			dispatch(fetchPositionHierarchy(selectedTreeBg));
		}
	}, [dispatch, viewMode, selectedTreeBg]);

	// Auto-select first business group when switching to tree view
	useEffect(() => {
		if (viewMode === "tree" && !selectedTreeBg && businessGroups.length > 0) {
			setSelectedTreeBg(businessGroups[0].id);
		}
	}, [viewMode, selectedTreeBg, businessGroups]);

	useEffect(() => {
		dispatch(fetchDepartments({ page: 1, page_size: 100 }));
		dispatch(fetchLocations({ page: 1, page_size: 100 }));
		dispatch(fetchGrades({ page: 1, page_size: 100 }));
	}, [dispatch]);

	useEffect(() => {
		document.title = `${t("positions.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

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
			header: t("positions.table.name"),
			accessor: "name",
			render: value => value || "-",
		},
		{
			header: t("positions.table.code"),
			accessor: "code",
			render: value => value || "-",
		},
		{
			header: t("positions.table.department"),
			accessor: "department_name",
			render: value => value || "-",
		},
		{
			header: t("positions.table.location"),
			accessor: "location_name",
			render: value => value || "-",
		},
		{
			header: t("positions.table.grade"),
			accessor: "grade_name",
			render: value => value || "-",
		},
		{
			header: t("positions.table.reportsTo"),
			accessor: "reports_to_name",
			render: value => value || "-",
		},
		{
			header: t("positions.table.status"),
			accessor: "status",
			render: renderStatus,
		},
	];

	const departmentOptions = [
		{ value: "", label: t("positions.form.selectDepartment") },
		...departments.map(dept => ({
			value: dept.id,
			label: dept.name,
		})),
	];

	const locationOptions = [
		{ value: "", label: t("positions.form.selectLocation") },
		...locations.map(loc => ({
			value: loc.id,
			label: loc.name,
		})),
	];

	const gradeOptions = [
		{ value: "", label: t("positions.form.selectGrade") },
		...grades.map(grade => ({
			value: grade.id,
			label: grade.name,
		})),
	];

	const reportsToOptions = [
		{ value: "", label: t("positions.form.selectReportsTo") },
		...positions
			.filter(pos => pos.id !== editingItem?.id)
			.map(pos => ({
				value: pos.id,
				label: `${pos.name} (${pos.code})`,
			})),
	];

	const handleCreate = () => {
		setEditingItem(null);
		setFormData(FORM_INITIAL_STATE);
		setFormErrors({});
		setIsModalOpen(true);
	};

	const handleEdit = item => {
		setEditingItem(item);
		setFormData({
			name: item.name || "",
			code: item.code || "",
			department: item.department || "",
			location: item.location || "",
			grade: item.grade || "",
			reports_to: item.reports_to || "",
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
			errors.name = t("common.required");
		}
		if (!editingItem) {
			if (!formData.department) {
				errors.department = t("common.required");
			}
			if (!formData.location) {
				errors.location = t("common.required");
			}
			if (!formData.grade) {
				errors.grade = t("common.required");
			}
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			const payload = {
				name: formData.name,
				...(formData.effective_start_date && { effective_start_date: formData.effective_start_date }),
				...(formData.effective_end_date && { effective_end_date: formData.effective_end_date }),
				...(formData.reports_to && { reports_to: formData.reports_to }),
			};

			if (!editingItem) {
				// For create, include required fields
				payload.department = formData.department;
				payload.location = formData.location;
				payload.grade = formData.grade;
				if (formData.code) payload.code = formData.code;
			}

			if (editingItem) {
				await dispatch(updatePosition({ id: editingItem.id, data: payload })).unwrap();
				toast.success(t("positions.messages.updateSuccess"));
			} else {
				await dispatch(createPosition(payload)).unwrap();
				toast.success(t("positions.messages.createSuccess"));
			}
			handleCloseModal();
			dispatch(fetchPositions({ page, page_size: localPageSize }));
		} catch (error) {
			toast.error(parseApiError(error, t, "positions.messages.saveError"));
		}
	};

	const handleDeleteClick = item => {
		setItemToDelete(item);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!itemToDelete) return;
		try {
			await dispatch(deletePosition(itemToDelete.id)).unwrap();
			toast.success(t("positions.messages.deleted"));
			setIsDeleteModalOpen(false);
			setItemToDelete(null);
		} catch (error) {
			toast.error(parseApiError(error, t, "positions.messages.deleteError"));
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
			const result = await dispatch(fetchPositionHistory(item.id)).unwrap();
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
		{ header: t("positions.table.name"), accessor: "name" },
		{ header: t("positions.table.code"), accessor: "code" },
		{ header: t("positions.table.department"), accessor: "department_name" },
		{ header: t("positions.table.location"), accessor: "location_name" },
		{ header: t("positions.table.grade"), accessor: "grade_name" },
		{ header: t("positions.table.reportsTo"), accessor: "reports_to_name" },
		{ header: t("positions.table.status"), accessor: "status" },
	];

	const historyCustomActions = [
		{
			title: t("history.viewHistory"),
			icon: <HiClock className="w-5 h-5 text-[#1D7A8C]" />,
			onClick: handleViewHistory,
		},
	];

	// Tree view handlers
	const handleTreeBgChange = e => {
		setSelectedTreeBg(e.target.value);
	};

	const handleRefreshTree = () => {
		if (selectedTreeBg) {
			dispatch(fetchPositionHierarchy(selectedTreeBg));
		}
	};

	const handleTreeNodeClick = node => {
		// Find the position in the list and open edit modal
		const position = positions.find(p => p.id === node.id);
		if (position) {
			handleEdit(position);
		} else {
			toast.info(t("positions.tree.loadingPosition"));
		}
	};

	const businessGroupOptions = [
		{ value: "", label: t("positions.form.selectBusinessGroup") },
		...businessGroups.map(bg => ({
			value: bg.id,
			label: bg.name,
		})),
	];

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer position="top-right" autoClose={3000} />

			<PageHeader
				icon={<HiBriefcase className="w-8 h-8 text-white mr-3" />}
				title={t("positions.title")}
				subtitle={t("positions.subtitle")}
			/>

			<div className="p-6">
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<div className="flex justify-between items-center mb-6">
						<div className="flex items-center gap-4">
							<h2 className="text-2xl font-bold text-[#1D7A8C]">{t("positions.title")}</h2>
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
									{t("positions.viewMode.table")}
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
									{t("positions.viewMode.hierarchy")}
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
							title={t("positions.createPosition")}
							className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
						/>
					</div>

					{viewMode === "table" ? (
						<>
							<Table
								columns={columns}
								data={positions}
								onEdit={handleEdit}
								onDelete={handleDeleteClick}
								customActions={historyCustomActions}
								emptyMessage={t("positions.table.emptyMessage")}
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
										label={t("positions.filters.businessGroup")}
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

							<PositionTreeView
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
				title={editingItem ? t("positions.modal.editTitle") : t("positions.modal.createTitle")}
			>
				<form onSubmit={handleSubmit} className="space-y-4 p-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("positions.form.name")}
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							error={formErrors.name}
							required
						/>
						<FloatingLabelInput
							label={t("positions.form.code")}
							name="code"
							value={formData.code}
							onChange={handleInputChange}
							disabled={!!editingItem}
						/>
					</div>

					{!editingItem && (
						<>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FloatingLabelSelect
									label={t("positions.form.department")}
									name="department"
									value={formData.department}
									onChange={handleInputChange}
									options={departmentOptions}
									error={formErrors.department}
									required
								/>
								<FloatingLabelSelect
									label={t("positions.form.location")}
									name="location"
									value={formData.location}
									onChange={handleInputChange}
									options={locationOptions}
									error={formErrors.location}
									required
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FloatingLabelSelect
									label={t("positions.form.grade")}
									name="grade"
									value={formData.grade}
									onChange={handleInputChange}
									options={gradeOptions}
									error={formErrors.grade}
									required
								/>
								<FloatingLabelSelect
									label={t("positions.form.reportsTo")}
									name="reports_to"
									value={formData.reports_to}
									onChange={handleInputChange}
									options={reportsToOptions}
								/>
							</div>
						</>
					)}

					{editingItem && (
						<FloatingLabelSelect
							label={t("positions.form.reportsTo")}
							name="reports_to"
							value={formData.reports_to}
							onChange={handleInputChange}
							options={reportsToOptions}
						/>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("positions.form.startDate")}
							name="effective_start_date"
							type="date"
							value={formData.effective_start_date}
							onChange={handleInputChange}
						/>
						<FloatingLabelInput
							label={t("positions.form.endDate")}
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
				title={t("positions.deleteModal.title")}
				message={t("positions.deleteModal.message")}
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

export default PositionsPage;
