import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";
import { HiOfficeBuilding, HiSearch, HiShare } from "react-icons/hi";
import { VscTypeHierarchySub } from "react-icons/vsc";

import { parseApiError } from "../utils/errorHandler";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import ConfirmModal from "../components/shared/ConfirmModal";
import SlideUpModal from "../components/shared/SlideUpModal";
import CustomInput from "../components/shared/CustomInput";
import CustomDropdown from "../components/shared/CustomDropdown";
import Button from "../components/shared/Button";

import {
	fetchOrganizations,
	fetchOrganization,
	createOrganization,
	updateOrganization,
	deleteOrganization,
	fetchOrganizationHierarchy,
	fetchBusinessGroupsFromOrganizations,
	fetchOrgClassifications,
	fetchOrgNames,
	setPage,
} from "../store/organizationsSlice";
import { fetchLocations } from "../store/locationsSlice";
import MultiSelectDropdown from "../components/shared/MultiSelectDropdown";

const INITIAL_FORM_DATA = {
	code: "",
	name_id: "",
	business_group_id: "",
	location_id: "",
	work_start_time: "09:00",
	work_end_time: "17:00",
	organization_classification_ids: [],
	effective_start_date: "",
	effective_end_date: "",
};

const INITIAL_FILTERS = {
	search: "",
	business_group: "",
	location: "",
};

const OrganizationsPage = () => {
	const { t, i18n } = useTranslation();
	usePageTitle(t("organizations.title"));
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	// Redux state
	const {
		organizations,
		currentOrganization,
		businessGroups,
		loading,
		count,
		page,
		hasNext,
		hasPrevious,
		creating,
		updating,
		hierarchy,
		hierarchyLoading,
		orgClassifications,
		orgNames,
	} = useSelector(state => state.organizations);

	const { locations } = useSelector(state => state.locations);

	// Local state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);
	const [formData, setFormData] = useState(INITIAL_FORM_DATA);
	const [formErrors, setFormErrors] = useState({});
	const [localPageSize, setLocalPageSize] = useState(25);
	const [isHierarchyModalOpen, setIsHierarchyModalOpen] = useState(false);
	const [hierarchyItem, setHierarchyItem] = useState(null);
	const [filters, setFilters] = useState(INITIAL_FILTERS);

	// Fetch lookups on mount
	useEffect(() => {
		dispatch(fetchOrgClassifications());
		dispatch(fetchOrgNames());
		dispatch(fetchLocations({ page_size: 100, status: "active" }));
		dispatch(fetchBusinessGroupsFromOrganizations({ page_size: 100 }));
	}, [dispatch]);

	// Fetch data when filters change
	useEffect(() => {
		const params = {
			page,
			page_size: localPageSize,
		};
		if (filters.search) params.search = filters.search;
		if (filters.business_group) params.business_group = filters.business_group;
		if (filters.location) params.location = filters.location;

		dispatch(fetchOrganizations(params));
	}, [dispatch, page, localPageSize, filters]);

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

	const handleFilterChange = e => {
		const { name, value } = e.target;
		setFilters(prev => ({ ...prev, [name]: value }));
		dispatch(setPage(1));
	};

	const handleSearch = () => {
		dispatch(setPage(1));
		const params = {
			page: 1,
			page_size: localPageSize,
		};
		if (filters.search) params.search = filters.search;
		if (filters.business_group) params.business_group = filters.business_group;
		if (filters.location) params.location = filters.location;
		dispatch(fetchOrganizations(params));
	};

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

	const renderOrgType = value => {
		return (
			<span
				className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
					value ? "bg-[#E8F7FA] text-[#1D7A8C]" : "bg-gray-100 text-gray-600"
				}`}
			>
				{value ? t("organizations.types.businessGroup") : ""}
			</span>
		);
	};

	// Organization columns
	const columns = [
		{
			header: t("organizations.table.name"),
			accessor: "name_display",
			render: value => value || "-",
		},
		{
			header: t("organizations.table.code"),
			accessor: "code",
			render: value => value || "-",
		},
		{
			header: t("organizations.table.type"),
			accessor: "is_business_group",
			render: renderOrgType,
		},
		{
			header: t("organizations.table.businessGroup"),
			accessor: "business_group",
			render: value => {
				if (!value) return "-";
				const bg = businessGroups.find(b => b.id === value);
				return bg?.name_display || "-";
			},
		},
		{
			header: t("organizations.table.location"),
			accessor: "location",
			render: value => {
				if (!value) return "-";
				const loc = locations.find(l => l.id === value);
				return loc?.name || "-";
			},
		},
		{
			header: t("organizations.table.workingHours"),
			accessor: "working_hours",
			render: value => (value ? `${value}h` : "-"),
		},
		{
			header: t("organizations.table.status"),
			accessor: "status",
			render: renderStatus,
		},
	];

	// Dropdown options

	const organizationNameOptions = useMemo(
		() => [
			{ value: "", label: t("organizations.form.selectName") },
			...orgNames.map(name => ({
				value: name.id.toString(), // ✅
				label: name.name,
			})),
		],
		[orgNames, t]
	);

	const classificationOptions = useMemo(
		() => [
			...orgClassifications.map(cls => ({
				value: cls.id,
				label: cls.name,
			})),
		],
		[orgClassifications]
	);

	// Check if name_id is business_group
	const isBusinessGroupType = useMemo(() => {
		const selected = orgNames.find(n => n.id.toString() === formData.name_id);
		return selected?.code === "BG";
	}, [formData.name_id, orgNames]);

	const businessGroupOptions = useMemo(
		() => [
			{ value: "", label: t("organizations.form.selectBusinessGroup") },
			...businessGroups.map(bg => ({
				value: bg.id,
				label: `${bg.name_display} - ${bg.code}`,
			})),
		],
		[businessGroups, t]
	);

	const locationOptions = useMemo(
		() => [
			{ value: "", label: t("organizations.form.selectLocation") },
			...locations.map(loc => ({
				value: loc.id,
				label: loc.name,
			})),
		],
		[locations, t]
	);

	// Filter dropdown options (include "All" option)
	const filterBusinessGroupOptions = useMemo(
		() => [
			{ value: "", label: t("organizations.filters.allBusinessGroups") },
			...businessGroups.map(bg => ({
				value: bg.id,
				label: bg.name_display || bg.code,
			})),
		],
		[businessGroups, t]
	);

	const filterLocationOptions = useMemo(
		() => [
			{ value: "", label: t("organizations.filters.allLocations") },
			...locations.map(loc => ({
				value: loc.id,
				label: loc.name,
			})),
		],
		[locations, t]
	);

	const handleCreate = () => {
		setEditingItem(null);
		setFormData(INITIAL_FORM_DATA);
		setFormErrors({});
		setIsModalOpen(true);
	};

	const handleEdit = async item => {
		try {
			setEditingItem(item);
			// Fetch the full organization data from API
			const orgData = await dispatch(fetchOrganization(item.id)).unwrap();
			console.log("data", orgData);
			// Keep organization_classification as an array for multi-select
			const classificationIds = orgData.organization_classification || [];
			setFormData({
				code: orgData.code || "",
				name_id: orgData.name ? orgData.name.toString() : "", // ✅ هنا الحل
				business_group_id: orgData.business_group || "",
				location_id: orgData.location || "",
				work_start_time: orgData.work_start_time ? orgData.work_start_time.substring(0, 5) : "09:00",
				work_end_time: orgData.work_end_time ? orgData.work_end_time.substring(0, 5) : "17:00",
				organization_classification_ids: classificationIds,
				effective_start_date: orgData.effective_start_date || "",
				effective_end_date: orgData.effective_end_date || "",
			});
			setFormErrors({});
			setIsModalOpen(true);
		} catch (error) {
			toast.error(parseApiError(error, t, "errors.generic"));
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingItem(null);
		setFormData(INITIAL_FORM_DATA);
		setFormErrors({});
	};

	const handleInputChange = e => {
		const { name, value } = e.target;
		setFormData(prev => {
			const nextData = { ...prev, [name]: value };
			// Reset business_group_id when name_id changes to Business Groups
			if (name === "name_id" && value === "BG") {
				nextData.business_group_id = "";
			}
			return nextData;
		});
		if (formErrors[name]) {
			setFormErrors(prev => ({ ...prev, [name]: "" }));
		}
	};

	const validateForm = () => {
		const errors = {};
		if (!formData.code.trim()) {
			errors.code = t("common.required");
		}
		if (!formData.name_id) {
			errors.name_id = t("common.required");
		}
		if (formData.name_id !== "BG" && !formData.business_group_id) {
			errors.business_group_id = t("common.required");
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		// if (!validateForm()) return;

		try {
			const isBusinessGroup = formData.name_id === "BG";

			// Handle organization_classification_ids

			console.log("hii");
			const payload = {
				code: formData.code,
				name_id: parseInt(formData.name_id),
				...(formData.location_id && { location_id: parseInt(formData.location_id) }),
				...(formData.work_start_time && { work_start_time: formData.work_start_time }),
				...(formData.work_end_time && { work_end_time: formData.work_end_time }),
				...(formData.effective_start_date && { effective_start_date: formData.effective_start_date }),
				...(formData.effective_end_date && { effective_end_date: formData.effective_end_date }),
			};

			// Handle organization_classification_ids - should be an array
			if (formData.organization_classification_ids && formData.organization_classification_ids.length > 0) {
				payload.organization_classification_ids = formData.organization_classification_ids.map(id =>
					parseInt(id)
				);
			}
			// For departments, add business_group_id
			if (!isBusinessGroup) {
				if (formData.business_group_id) {
					payload.business_group_id = parseInt(formData.business_group_id);
				}
			}

			if (editingItem) {
				await dispatch(updateOrganization({ id: editingItem.id, data: payload })).unwrap();
				toast.success(t("organizations.messages.updateSuccess"));
			} else {
				await dispatch(createOrganization(payload)).unwrap();
				toast.success(t("organizations.messages.createSuccess"));
			}
			// Refresh the list
			const params = {
				page,
				page_size: localPageSize,
			};
			if (filters.search) params.search = filters.search;
			if (filters.business_group) params.business_group = filters.business_group;
			if (filters.location) params.location = filters.location;
			dispatch(fetchOrganizations(params));
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
			await dispatch(deleteOrganization(itemToDelete.id)).unwrap();
			toast.success(t("organizations.messages.deleteSuccess"));
			setIsDeleteModalOpen(false);
			setItemToDelete(null);
		} catch (error) {
			toast.error(parseApiError(error, t, "organizations.messages.deleteError"));
		}
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
		setItemToDelete(null);
	};

	const handleViewHierarchy = async item => {
		setHierarchyItem(item);
		setIsHierarchyModalOpen(true);
		dispatch(fetchOrganizationHierarchy(item.id));
	};

	const handleCloseHierarchyModal = () => {
		setIsHierarchyModalOpen(false);
		setHierarchyItem(null);
	};

	const customActions = [
		{
			title: t("organizations.viewHierarchy"),
			icon: <VscTypeHierarchySub className="w-5 h-5 text-[#1D7A8C]" />,
			onClick: handleViewHierarchy,
		},
	];

	// Render hierarchy tree recursively
	const renderHierarchyTree = (node, level = 0) => {
		if (!node) return null;
		return (
			<div key={node.id} className={`${level > 0 ? "ml-6 border-l-2 border-gray-200 pl-4" : ""}`}>
				<div className="flex items-center gap-2 py-2">
					<div
						className={`w-3 h-3 rounded-full ${node.is_business_group ? "bg-[#1D7A8C]" : "bg-green-500"}`}
					></div>
					<span className="font-medium">{node.name}</span>
					<span className="text-gray-500 text-sm">({node.code})</span>
					{node.working_hours && <span className="text-xs text-gray-400">{node.working_hours}h</span>}
				</div>
				{node.children && node.children.length > 0 && (
					<div>{node.children.map(child => renderHierarchyTree(child, level + 1))}</div>
				)}
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer position="top-right" autoClose={3000} />

			<PageHeader
				icon={<HiOfficeBuilding className="w-8 h-8 text-white mr-3" />}
				title={t("organizations.title")}
			/>

			<div className="p-6">
				<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<CustomInput
							label={t("organizations.filters.search")}
							name="search"
							value={filters.search}
							onChange={handleFilterChange}
							placeholder={t("organizations.filters.searchPlaceholder")}
						/>
						<CustomDropdown
							label={t("organizations.filters.businessGroup")}
							name="business_group"
							value={filters.business_group}
							onChange={handleFilterChange}
							options={filterBusinessGroupOptions}
							showBorder={true}
						/>
						<CustomDropdown
							label={t("organizations.filters.location")}
							name="location"
							value={filters.location}
							onChange={handleFilterChange}
							options={filterLocationOptions}
							showBorder={true}
						/>
					</div>
					<div className="flex items-end md:justify-end mt-5">
						<Button
							onClick={handleSearch}
							icon={<HiSearch className="w-5 h-5" />}
							title={t("common.search")}
							className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
						/>
					</div>
				</div>

				{/* Table Section */}
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold text-[#1D7A8C]">{t("organizations.title")}</h2>
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
							title={t("organizations.modal.createTitle")}
							className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
						/>
					</div>

					<Table
						columns={columns}
						data={organizations}
						onEdit={handleEdit}
						onDelete={handleDeleteClick}
						customActions={customActions}
						emptyMessage={t("organizations.table.emptyMessage")}
						loading={loading}
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
				</div>
			</div>

			{/* Create/Edit Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={editingItem ? t("organizations.modal.editTitle") : t("organizations.modal.createTitle")}
			>
				<form onSubmit={handleSubmit} className="space-y-4 p-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<CustomInput
							label={t("organizations.form.code")}
							name="code"
							value={formData.code}
							onChange={handleInputChange}
							error={formErrors.code}
							disabled={!!editingItem}
							required={!editingItem}
							bgColor="bg-[#fff]"
						/>

						<CustomDropdown
							label={t("organizations.form.name")}
							name="name_id"
							value={formData.name_id}
							onChange={handleInputChange}
							options={organizationNameOptions}
							error={formErrors.name_id}
							required
							disabled={!!editingItem}
							bgColor="bg-[#fff]"
							showBorder={true}
						/>
					</div>

					{!isBusinessGroupType && (
						<>
							<CustomDropdown
								label={t("organizations.form.businessGroup")}
								name="business_group_id"
								value={formData.business_group_id}
								onChange={handleInputChange}
								options={businessGroupOptions}
								error={formErrors.business_group_id}
								required
								bgColor="bg-[#fff]"
								showBorder={true}
							/>
						</>
					)}
					<MultiSelectDropdown
						label={t("organizations.form.classification")}
						name="organization_classification_ids"
						value={formData.organization_classification_ids}
						onChange={handleInputChange}
						options={classificationOptions}
					/>

					<CustomDropdown
						label={t("organizations.form.location")}
						name="location_id"
						value={formData.location_id}
						onChange={handleInputChange}
						options={locationOptions}
						bgColor="bg-[#fff]"
						showBorder={true}
					/>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<CustomInput
							label={t("organizations.form.workStartTime")}
							name="work_start_time"
							type="time"
							value={formData.work_start_time}
							onChange={handleInputChange}
							bgColor="bg-[#fff]"
						/>
						<CustomInput
							label={t("organizations.form.workEndTime")}
							name="work_end_time"
							type="time"
							value={formData.work_end_time}
							onChange={handleInputChange}
							bgColor="bg-[#fff]"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<CustomInput
							label={t("organizations.form.startDate")}
							name="effective_start_date"
							type="date"
							value={formData.effective_start_date}
							onChange={handleInputChange}
							bgColor="bg-[#fff]"
						/>
						<CustomInput
							label={t("organizations.form.endDate")}
							name="effective_end_date"
							type="date"
							value={formData.effective_end_date}
							onChange={handleInputChange}
							bgColor="bg-[#fff]"
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
				title={t("organizations.deleteModal.title")}
				message={t("organizations.deleteModal.message")}
				confirmText={t("common.delete")}
				cancelText={t("common.cancel")}
				variant="danger"
			/>

			{/* Hierarchy Modal */}
			<SlideUpModal
				isOpen={isHierarchyModalOpen}
				onClose={handleCloseHierarchyModal}
				title={t("organizations.hierarchy.title", { name: hierarchyItem?.name_display || "" })}
			>
				<div className="p-4">
					{hierarchyLoading ? (
						<div className="flex justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D7A8C]"></div>
						</div>
					) : hierarchy ? (
						renderHierarchyTree(hierarchy)
					) : (
						<p className="text-gray-500 text-center py-8">{t("organizations.hierarchy.noData")}</p>
					)}
				</div>
			</SlideUpModal>
		</div>
	);
};

export default OrganizationsPage;
