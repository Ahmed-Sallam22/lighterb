// src/pages/UsersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router";

import PageHeader from "../components/shared/PageHeader";
import Toolbar from "../components/shared/Toolbar";
import Table from "../components/shared/Table";
import SlideUpModal from "../components/shared/SlideUpModal";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import ConfirmModal from "../components/shared/ConfirmModal";
import UserForm from "../components/forms/UserForm";

import { fetchUsers, createUser, updateUser, deleteUser } from "../store/usersSlice";
import { fetchJobRoles } from "../store/jobRolesSlice";
import { HiUsers } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const FORM_INITIAL_STATE = {
	name: "",
	email: "",
	phone_number: "",
	user_type: "user",
	job_role: "",
	password: "",
	confirm_password: "",
};

const INITIAL_FILTERS_STATE = {
	user_type: "",
	name: "",
	email: "",
};

const UsersPage = () => {
	const { t } = useTranslation();
	const dispatch = useDispatch();

	const { users = [], loading, error } = useSelector(state => state.users || {});
	const { user: currentUser } = useSelector(state => state.auth || {});
	const { roles: jobRoles = [] } = useSelector(state => state.jobRoles || {});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingUser, setEditingUser] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState(null);

	const [formData, setFormData] = useState(FORM_INITIAL_STATE);
	const [formErrors, setFormErrors] = useState({});
	const [filters, setFilters] = useState(INITIAL_FILTERS_STATE);

	const [searchTerm, setSearchTerm] = useState("");

	const title = t("users.title");
	const subtitle = t("users.subtitle");

	// Check if current user is admin or super_admin
	const isAdminUser = currentUser?.user_type === "super_admin" || currentUser?.user_type === "admin";
	const isSuperAdmin = currentUser?.user_type === "super_admin";
	// User type options for filtering
	const userTypeOptions = useMemo(
		() => [
			{ value: "", label: t("users.filters.all") || "All" },
			{ value: "user", label: t("users.userTypes.user") || "User" },
			{ value: "admin", label: t("users.userTypes.admin") || "Admin" },
			{ value: "super_admin", label: t("users.userTypes.superAdmin") || "Super Admin" },
		],
		[t]
	);

	// User type options for form - based on current user's permissions
	// Admin can only change between user and admin
	// Super admin can change between user, admin, and super_admin
	const userTypeFormOptions = useMemo(() => {
		if (isSuperAdmin) {
			return [
				{ value: "user", label: t("users.userTypes.user") || "User" },
				{ value: "admin", label: t("users.userTypes.admin") || "Admin" },
				{ value: "super_admin", label: t("users.userTypes.superAdmin") || "Super Admin" },
			];
		}
		// Admin can only set user or admin
		return [
			{ value: "user", label: t("users.userTypes.user") || "User" },
			{ value: "admin", label: t("users.userTypes.admin") || "Admin" },
		];
	}, [t, isSuperAdmin]);

	// Job roles options for form
	const jobRoleOptions = useMemo(() => {
		return [
			{ value: "", label: t("users.form.selectJobRole") || "Select Job Role" },
			...(jobRoles || []).map(role => ({
				value: role.id.toString(),
				label: role.name,
			})),
		];
	}, [jobRoles, t]);

	// Fetch users on mount
	useEffect(() => {
		if (isAdminUser) {
			dispatch(fetchUsers());
			dispatch(fetchJobRoles());
		}
	}, [dispatch, isAdminUser]);

	// Show error toast if any
	useEffect(() => {
		if (error) {
			toast.error(error, { autoClose: 5000 });
		}
	}, [error]);

	// Update browser title when translations load/change
	useEffect(() => {
		document.title = `${title} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [title]);

	// Redirect if not admin
	if (!isAdminUser) {
		return <Navigate to="/dashboard" replace />;
	}

	// Transform API data for table display
	const tableData = (users || [])
		.filter(user => {
			if (!searchTerm) return true;
			const search = searchTerm.toLowerCase();
			return (
				user.name?.toLowerCase().includes(search) ||
				user.email?.toLowerCase().includes(search) ||
				user.phone_number?.toLowerCase().includes(search) ||
				user.user_type?.toLowerCase().includes(search)
			);
		})
		.filter(user => {
			if (filters.user_type && user.user_type !== filters.user_type) return false;
			return true;
		})
		.map(user => ({
			id: user.id,
			name: user.name || "-",
			email: user.email || "-",
			phone_number: user.phone_number || "-",
			user_type: user.user_type || "user",
			job_role_name: user.job_role_name || "-",
			rawData: user,
		}));

	// Table columns
	const columns = [
		{
			header: t("users.table.id"),
			accessor: "id",
			render: value => <span className="text-gray-500 font-medium">#{value}</span>,
		},
		{
			header: t("users.table.name"),
			accessor: "name",
			render: value => <span className="font-semibold text-[#0d5f7a]">{value}</span>,
		},
		{
			header: t("users.table.email"),
			accessor: "email",
		},
		{
			header: t("users.table.phone"),
			accessor: "phone_number",
		},
		{
			header: t("users.table.userType"),
			accessor: "user_type",
			render: value => {
				const typeColors = {
					super_admin: "bg-purple-100 text-purple-700",
					admin: "bg-blue-100 text-blue-700",
					user: "bg-gray-100 text-gray-700",
				};
				const typeLabels = {
					super_admin: t("users.userTypes.superAdmin"),
					admin: t("users.userTypes.admin"),
					user: t("users.userTypes.user"),
				};
				return (
					<span
						className={`px-3 py-1 rounded-full text-xs font-semibold ${
							typeColors[value] || typeColors.user
						}`}
					>
						{typeLabels[value] || value}
					</span>
				);
			},
		},
		{
			header: t("users.table.jobRole"),
			accessor: "job_role_name",
			render: value => value || "-",
		},
	];

	// Handlers
	const handleFilterChange = (field, value) => {
		setFilters(prev => ({ ...prev, [field]: value }));
	};

	const handleClearFilters = () => {
		setFilters(INITIAL_FILTERS_STATE);
		toast.info(t("users.messages.filtersCleared"));
	};

	const handleCreate = () => {
		setEditingUser(null);
		setFormData(FORM_INITIAL_STATE);
		setIsModalOpen(true);
	};

	const handleEdit = async row => {
		try {
			// Check if admin is trying to edit a super_admin (not allowed)
			if (!isSuperAdmin && row.rawData.user_type === "super_admin") {
				toast.error(t("users.messages.noPermission"));
				return;
			}

			setEditingUser(row.rawData);
			setFormData({
				name: row.rawData.name || "",
				email: row.rawData.email || "",
				phone_number: row.rawData.phone_number || "",
				user_type: row.rawData.user_type || "user",
				job_role: row.rawData.job_role?.toString() || "",
				password: "",
				confirm_password: "",
			});
			setIsModalOpen(true);
		} catch (err) {
			toast.error(err?.message || t("users.messages.fetchError"));
		}
	};

	const handleDelete = row => {
		setUserToDelete(row.rawData);
		setIsDeleteModalOpen(true);
	};

	const confirmDelete = async () => {
		if (!userToDelete) return;

		try {
			await dispatch(deleteUser(userToDelete.id)).unwrap();
			toast.success(t("users.messages.deleted"));
			setIsDeleteModalOpen(false);
			setUserToDelete(null);
		} catch (err) {
			toast.error(err?.message || t("users.messages.deleteError"));
		} finally {
			setIsDeleteModalOpen(false);
			setUserToDelete(null);
		}
	};

	const handleSubmit = async () => {
		// Map user_type string to API number value
		const userTypeMap = {
			user: 1,
			admin: 3,
			super_admin: 2,
		};

		if (editingUser) {
			// EDIT MODE - Only send user_type and job_role (PATCH)
			const updateData = {};

			// Always include user_type for update
			updateData.user_type = userTypeMap[formData.user_type] || 1;

			// Include job_role if selected
			if (formData.job_role) {
				updateData.job_role = parseInt(formData.job_role);
			}

			try {
				await dispatch(updateUser({ id: editingUser.id, data: updateData })).unwrap();
				toast.success(t("users.messages.updated"));
				setIsModalOpen(false);
				setFormData(FORM_INITIAL_STATE);
				setFormErrors({});
				setEditingUser(null);
				dispatch(fetchUsers()); // Refresh the list
			} catch (err) {
				toast.error(err || t("users.messages.saveError"));
			}
		} else {
			// CREATE MODE - Full validation and all fields
			if (!formData.name || !formData.email) {
				toast.error(t("users.messages.required"));
				return;
			}

			// Email validation
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email)) {
				toast.error(t("users.messages.invalidEmail"));
				return;
			}

			// Password validation for new users
			if (!formData.password || formData.password !== formData.confirm_password) {
				toast.error(t("users.messages.passwordMismatch"));
				return;
			}

			// Prepare data for API
			const userData = {
				name: formData.name,
				email: formData.email,
				phone_number: formData.phone_number || "",
				password: formData.password,
				confirm_password: formData.confirm_password,
			};

			// Only include user_type if creating admin or super_admin (not needed for regular users)
			if (formData.user_type !== "user") {
				userData.user_type = userTypeMap[formData.user_type] || 1;
			}

			try {
				await dispatch(createUser(userData)).unwrap();
				toast.success(t("users.messages.created"));
				setIsModalOpen(false);
				setFormData(FORM_INITIAL_STATE);
				setFormErrors({});
				setEditingUser(null);
				dispatch(fetchUsers()); // Refresh the list
			} catch (err) {
				toast.error(err || t("users.messages.saveError"));
			}
		}
	};

	const handleFormChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Clear error when field is edited
		if (formErrors[field]) {
			setFormErrors(prev => ({ ...prev, [field]: null }));
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingUser(null);
		setFormData(FORM_INITIAL_STATE);
		setFormErrors({});
	};

	const handleSearch = value => {
		setSearchTerm(value);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer position="top-right" />

			{/* Page Header */}
			<PageHeader icon={<HiUsers size={30} color="#D3D3D3" />} title={title} subtitle={subtitle} />

			{/* Toolbar */}
			<div className="px-6 mt-6">
				<Toolbar
					searchPlaceholder={t("users.searchPlaceholder")}
					onSearchChange={handleSearch}
					createButtonText={t("users.addUser")}
					onCreateClick={handleCreate}
				/>
			</div>

			{/* Filter Section */}
			<div className="px-6 mt-6">
				<div className="rounded-lg pt-3 pb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
						{/* User Type Filter */}
						<FloatingLabelSelect
							label={t("users.filters.userType")}
							name="filterUserType"
							value={filters.user_type}
							onChange={e => handleFilterChange("user_type", e.target.value)}
							options={userTypeOptions}
						/>
					</div>
					<div className="flex gap-2">
						<button
							onClick={handleClearFilters}
							className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
						>
							{t("users.filters.clear")}
						</button>
					</div>
				</div>
			</div>

			{/* Table Section */}
			<div className="px-6 mt-6">
				{loading ? (
					<div className="flex justify-center items-center py-12">
						<AiOutlineLoading3Quarters className="animate-spin text-4xl text-[#48C1F0]" />
					</div>
				) : (
					<Table
						columns={columns}
						data={tableData}
						onEdit={handleEdit}
						onDelete={handleDelete}
						emptyMessage={t("users.table.emptyMessage")}
					/>
				)}
			</div>

			{/* Create/Edit Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={editingUser ? t("users.modal.editTitle") : t("users.modal.createTitle")}
			>
				<UserForm
					t={t}
					formData={formData}
					errors={formErrors}
					onChange={handleFormChange}
					onCancel={handleCloseModal}
					onSubmit={handleSubmit}
					isEditing={!!editingUser}
					userTypeOptions={userTypeFormOptions}
					jobRoleOptions={jobRoleOptions}
					loading={loading}
				/>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setUserToDelete(null);
				}}
				onConfirm={confirmDelete}
				title={t("users.deleteModal.title")}
				message={t("users.deleteModal.message", { name: userToDelete?.name })}
				confirmLabel={t("users.deleteModal.confirm")}
				cancelLabel={t("users.deleteModal.cancel")}
				loading={loading}
			/>
		</div>
	);
};

export default UsersPage;
