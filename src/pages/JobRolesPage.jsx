import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import SlideUpModal from "../components/shared/SlideUpModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import ConfirmModal from "../components/shared/ConfirmModal";

import { fetchJobRoles, createJobRole, updateJobRole, deleteJobRole, clearError } from "../store/jobRolesSlice";

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

// Available Duty Roles Options
const DUTY_ROLES_OPTIONS = [
	{ id: "invoice", label: "Invoice" },
	{ id: "dashboard", label: "Dashboard" },
	{ id: "payment", label: "Payment" },
	{ id: "rules", label: "Rules" },
	{ id: "reports", label: "Reports" },
	{ id: "segments", label: "Segments" },
];

const JobRolesPage = () => {
	const dispatch = useDispatch();

	const {
		roles = [],
		loading,
		error,
		creating,
		updating,
		deleting,
		actionError,
	} = useSelector(state => state.jobRoles || {});

	// Modal states
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	// Selected role for view/edit/delete
	const [selectedRole, setSelectedRole] = useState(null);

	// Search and filter
	const [searchTerm, setSearchTerm] = useState("");
	const [filterJob, setFilterJob] = useState("");

	// Form data for create
	const [createForm, setCreateForm] = useState({
		name: "",
		description: "",
		duty_roles: [],
	});

	// Form data for edit
	const [editForm, setEditForm] = useState({
		name: "",
		description: "",
		duty_roles: [],
	});

	// Fetch roles on mount
	useEffect(() => {
		dispatch(fetchJobRoles());
	}, [dispatch]);

	// Show error toast
	useEffect(() => {
		if (error || actionError) {
			toast.error(error || actionError, { autoClose: 5000 });
			dispatch(clearError());
		}
	}, [error, actionError, dispatch]);

	// Update page title
	useEffect(() => {
		document.title = `Job Roles - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, []);

	// Filter roles based on search and filter
	const filteredRoles = useMemo(() => {
		return roles.filter(role => {
			const matchesSearch =
				!searchTerm ||
				role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				role.description?.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesFilter = !filterJob || role.name === filterJob;

			return matchesSearch && matchesFilter;
		});
	}, [roles, searchTerm, filterJob]);

	// Table columns
	const columns = [
		{
			header: "Name",
			accessor: "name",
			render: value => <span className="font-semibold text-[#0d5f7a]">{value || "-"}</span>,
		},
		{
			header: "Description",
			accessor: "description",
			render: value => value || "-",
		},
	];

	// Handlers
	const handleOpenCreate = () => {
		setCreateForm({ name: "", description: "", duty_roles: [] });
		setIsCreateModalOpen(true);
	};

	const handleOpenView = row => {
		setSelectedRole(row);
		setIsViewModalOpen(true);
	};

	const handleOpenEdit = role => {
		setSelectedRole(role);
		setEditForm({
			name: role.name || "",
			description: role.description || "",
			duty_roles: role.duty_roles || [],
		});
		setIsEditModalOpen(true);
		setIsViewModalOpen(false);
	};

	const handleOpenDelete = role => {
		setSelectedRole(role);
		setIsDeleteModalOpen(true);
		setIsViewModalOpen(false);
	};

	const handleCloseModals = () => {
		setIsCreateModalOpen(false);
		setIsViewModalOpen(false);
		setIsEditModalOpen(false);
		setIsDeleteModalOpen(false);
		setSelectedRole(null);
	};

	const handleCreateFormChange = e => {
		const { name, value } = e.target;
		setCreateForm(prev => ({ ...prev, [name]: value }));
	};

	const handleEditFormChange = e => {
		const { name, value } = e.target;
		setEditForm(prev => ({ ...prev, [name]: value }));
	};

	const handleDutyRoleToggle = (roleId, isCreate = true) => {
		if (isCreate) {
			setCreateForm(prev => ({
				...prev,
				duty_roles: prev.duty_roles.includes(roleId)
					? prev.duty_roles.filter(r => r !== roleId)
					: [...prev.duty_roles, roleId],
			}));
		} else {
			setEditForm(prev => ({
				...prev,
				duty_roles: prev.duty_roles.includes(roleId)
					? prev.duty_roles.filter(r => r !== roleId)
					: [...prev.duty_roles, roleId],
			}));
		}
	};

	const handleCreate = async () => {
		if (!createForm.name.trim()) {
			toast.error("Job title is required");
			return;
		}

		try {
			await dispatch(createJobRole(createForm)).unwrap();
			toast.success("Job role created successfully");
			handleCloseModals();
			dispatch(fetchJobRoles());
		} catch {
			// Error handled by Redux
		}
	};

	const handleUpdate = async () => {
		if (!editForm.name.trim()) {
			toast.error("Job title is required");
			return;
		}

		try {
			await dispatch(updateJobRole({ id: selectedRole.id, data: editForm })).unwrap();
			toast.success("Job role updated successfully");
			handleCloseModals();
			dispatch(fetchJobRoles());
		} catch {
			// Error handled by Redux
		}
	};

	const handleDelete = async () => {
		try {
			await dispatch(deleteJobRole(selectedRole.id)).unwrap();
			toast.success("Job role deleted successfully");
			handleCloseModals();
		} catch {
			// Error handled by Redux
		}
	};

	// Get unique job names for filter
	const jobOptions = useMemo(() => {
		const names = [...new Set(roles.map(r => r.name).filter(Boolean))];
		return names.map(name => ({ value: name, label: name }));
	}, [roles]);

	return (
		<div className="min-h-screen bg-[#EEEEEE]">
			<ToastContainer position="top-right" />

			{/* Header */}
			<PageHeader title="Job Roles" subtitle="Role Overview" icon={<JobRolesIcon />} />

			<div className="p-6">
				{/* Toolbar */}
				<div className="flex flex-wrap items-center justify-between gap-4 mb-6">
					<div className="flex items-center gap-4 flex-1">
						{/* Search */}
						<div className="relative flex-1 max-w-md">
							<svg
								className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
							>
								<path
									d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<input
								type="text"
								placeholder="Search bills ..."
								value={searchTerm}
								onChange={e => setSearchTerm(e.target.value)}
								className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#48C1F0]/40"
							/>
						</div>

						{/* Filter by Job */}
						<div className="relative">
							<select
								value={filterJob}
								onChange={e => setFilterJob(e.target.value)}
								className="appearance-none pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#48C1F0]/40 min-w-[150px]"
							>
								<option value="">All Jobs</option>
								{jobOptions.map(opt => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
							<svg
								className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
							>
								<path
									d="M3 6h14M6 10h8M9 14h2"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
								/>
							</svg>
							<svg
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
								width="12"
								height="12"
								viewBox="0 0 12 12"
								fill="none"
							>
								<path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
							</svg>
						</div>
					</div>

					{/* Create Button */}
					<Button
						onClick={handleOpenCreate}
						title="Create Job"
						icon={
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
								<path d="M8 1v14M1 8h14" stroke="white" strokeWidth="2" strokeLinecap="round" />
							</svg>
						}
						className="flex items-center gap-2 px-5 py-3 bg-[#28819C] text-white rounded-xl hover:bg-[#1d6a80] transition-colors font-medium shadow-md"
					/>
				</div>

				{/* Table */}
				<Table
					columns={columns}
					data={filteredRoles}
					onEdit={handleOpenView}
					editIcon="view"
					emptyMessage={loading ? "Loading job roles..." : "No job roles found"}
				/>
			</div>

			{/* Create Modal */}
			<SlideUpModal isOpen={isCreateModalOpen} onClose={handleCloseModals} title="Create Job" maxWidth="600px">
				<div className="space-y-5 p-4">
					<FloatingLabelInput
						label="Job Title"
						name="name"
						value={createForm.name}
						onChange={handleCreateFormChange}
						placeholder="Enter Job"
					/>

					<FloatingLabelInput
						label="Job Description"
						name="description"
						value={createForm.description}
						onChange={handleCreateFormChange}
						placeholder="Enter Job"
					/>

					{/* Duty Roles Checkboxes */}
					<div>
						<p className="text-sm font-medium text-[#28819C] mb-3">Duty Roles</p>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
							{DUTY_ROLES_OPTIONS.map(option => (
								<label
									key={option.id}
									className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800"
								>
									<input
										type="checkbox"
										checked={createForm.duty_roles.includes(option.id)}
										onChange={() => handleDutyRoleToggle(option.id, true)}
										className="w-4 h-4 rounded border-gray-300 text-[#28819C] focus:ring-[#28819C]"
									/>
									<span className="text-sm">{option.label}</span>
								</label>
							))}
						</div>
					</div>

					{/* Submit Button */}
					<Button
						onClick={handleCreate}
						disabled={creating}
						title={creating ? "Creating..." : "Create Job"}
						className="w-full py-3 bg-[#28819C] text-white rounded-xl hover:bg-[#1d6a80] transition-colors font-medium disabled:opacity-50"
					/>
				</div>
			</SlideUpModal>

			{/* View Modal */}
			<SlideUpModal isOpen={isViewModalOpen} onClose={handleCloseModals} title="View Job" maxWidth="600px">
				{selectedRole && (
					<div className="space-y-5 p-4">
						<div>
							<p className="text-sm font-medium text-[#28819C] mb-1">Job Name</p>
							<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
								{selectedRole.name || "-"}
							</div>
						</div>

						<div>
							<p className="text-sm font-medium text-[#28819C] mb-1">Description</p>
							<div className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
								{selectedRole.description || "-"}
							</div>
						</div>

						{/* Duty Rules Display */}
						{selectedRole.duty_roles && selectedRole.duty_roles.length > 0 && (
							<div>
								<p className="text-sm font-medium text-[#28819C] mb-3">Duty Rules</p>
								<div className="grid grid-cols-2 gap-2">
									{selectedRole.duty_roles.map((rule, idx) => (
										<div key={idx} className="flex items-center gap-2 text-gray-600">
											<span className="w-2 h-2 rounded-full bg-[#28819C]"></span>
											<span className="text-sm capitalize">
												{DUTY_ROLES_OPTIONS.find(o => o.id === rule)?.label || rule}
											</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Action Buttons */}
						<div className="flex gap-3 pt-2">
							<Button
								onClick={() => handleOpenEdit(selectedRole)}
								title="Edit"
								className="flex-1 py-3 bg-[#28819C] text-white rounded-xl hover:bg-[#1d6a80] transition-colors font-medium"
							/>
							<Button
								onClick={() => handleOpenDelete(selectedRole)}
								title="Delete"
								className="shadow-none hover:shadow-none flex-1 py-3 bg-white text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors font-medium"
							/>
						</div>
					</div>
				)}
			</SlideUpModal>

			{/* Edit Modal */}
			<SlideUpModal isOpen={isEditModalOpen} onClose={handleCloseModals} title="Edit Job" maxWidth="600px">
				<div className="space-y-5 p-4">
					<FloatingLabelInput
						label="Job Title"
						name="name"
						value={editForm.name}
						onChange={handleEditFormChange}
						placeholder="Enter Job"
					/>

					<FloatingLabelInput
						label="Job Description"
						name="description"
						value={editForm.description}
						onChange={handleEditFormChange}
						placeholder="Enter Job"
					/>

					{/* Duty Roles Select */}
					<div>
						<p className="text-sm font-medium text-[#28819C] mb-3">Duty Roles</p>
						<div className="relative">
							<select
								value={editForm.duty_roles[0] || ""}
								onChange={e => setEditForm(prev => ({ ...prev, duty_roles: [e.target.value] }))}
								className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#48C1F0]/40"
							>
								<option value="">Select Role</option>
								{DUTY_ROLES_OPTIONS.map(option => (
									<option key={option.id} value={option.id}>
										{option.label}
									</option>
								))}
							</select>
							<svg
								className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
								width="12"
								height="12"
								viewBox="0 0 12 12"
								fill="none"
							>
								<path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
							</svg>
						</div>
					</div>

					{/* Submit Button */}
					<Button
						onClick={handleUpdate}
						disabled={updating}
						title={updating ? "Saving..." : "Save Changes"}
						className="w-full py-3 bg-[#28819C] text-white rounded-xl hover:bg-[#1d6a80] transition-colors font-medium disabled:opacity-50"
					/>
				</div>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={handleCloseModals}
				onConfirm={handleDelete}
				title="Delete Job Role"
				message={`Are you sure you want to delete "${selectedRole?.name}"? This action cannot be undone.`}
				confirmText={deleting ? "Deleting..." : "Delete"}
				cancelText="Cancel"
				loading={deleting}
				confirmColor="red"
			/>
		</div>
	);
};

export default JobRolesPage;
