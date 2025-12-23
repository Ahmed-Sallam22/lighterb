import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import SlideUpModal from "../components/shared/SlideUpModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import ConfirmModal from "../components/shared/ConfirmModal";
import Button from "../components/shared/Button";
import SearchInput from "../components/shared/SearchInput";

import { fetchJobRoles, updateJobRole, deleteJobRole, clearError, setPage } from "../store/jobRolesSlice";
import { BiPlus } from "react-icons/bi";

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

const JobRolesPage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const {
		roles = [],
		loading,
		error,
		updating,
		deleting,
		actionError,
		count,
		page,
		hasNext,
		hasPrevious,
	} = useSelector(state => state.jobRoles || {});

	// Modal states
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	// Selected role for view/edit/delete
	const [selectedRole, setSelectedRole] = useState(null);

	// Search
	const [searchTerm, setSearchTerm] = useState("");
	const [localPageSize, setLocalPageSize] = useState(20);

	// Form data for edit
	const [editForm, setEditForm] = useState({
		name: "",
		description: "",
	});

	// Fetch roles on mount and when pagination/search changes
	useEffect(() => {
		dispatch(fetchJobRoles({ page, page_size: localPageSize, search: searchTerm }));
	}, [dispatch, page, localPageSize, searchTerm]);

	// Show error toast
	useEffect(() => {
		if (error || actionError) {
			toast.error(error || actionError, { autoClose: 5000 });
			dispatch(clearError());
		}
	}, [error, actionError, dispatch]);

	// Update page title
	useEffect(() => {
		document.title = `Responsibilities - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, []);

	// Pagination handlers
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

	// Table columns
	const columns = [
		{
			header: "Name",
			accessor: "name",
			render: value => <span className="font-semibold text-gray-900">{value || "-"}</span>,
		},
		{
			header: "Description",
			accessor: "description",
			render: value => <span className="text-gray-600 truncate max-w-[400px] block">{value || "-"}</span>,
		},
	];

	// Handlers
	const handleOpenCreate = () => {
		navigate("/job-roles/create");
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
		setIsViewModalOpen(false);
		setIsEditModalOpen(false);
		setIsDeleteModalOpen(false);
		setSelectedRole(null);
	};

	const handleEditFormChange = e => {
		const { name, value } = e.target;
		setEditForm(prev => ({ ...prev, [name]: value }));
	};

	const handleUpdate = async () => {
		if (!editForm.name.trim()) {
			toast.error("Name is required");
			return;
		}

		try {
			await dispatch(updateJobRole({ id: selectedRole.id, data: editForm })).unwrap();
			toast.success("Responsibility updated successfully");
			handleCloseModals();
			dispatch(fetchJobRoles({ page, page_size: localPageSize, search: searchTerm }));
		} catch {
			// Error handled by Redux
		}
	};

	const handleDelete = async () => {
		try {
			await dispatch(deleteJobRole(selectedRole.id)).unwrap();
			toast.success("Responsibility deleted successfully");
			handleCloseModals();
			dispatch(fetchJobRoles({ page, page_size: localPageSize, search: searchTerm }));
		} catch {
			// Error handled by Redux
		}
	};

	const handleSearchChange = e => {
		setSearchTerm(e.target.value);
		dispatch(setPage(1)); // Reset to first page on search
	};

	return (
		<div className="min-h-screen bg-[#EEEEEE]">
			<ToastContainer position="top-right" />

			{/* Header */}
			<PageHeader title="Responsibilities" subtitle="Lorem Ipsum" icon={<JobRolesIcon />} />

			<div className="w-[95%] mx-auto px-6 py-8">
				{/* Title and Create Button */}
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-[#28819C]">Responsibilities</h2>

					<Button
						onClick={handleOpenCreate}
						title="Create Responsibility"
						icon={<BiPlus className="text-xl" />}
						className="bg-[#28819C] hover:bg-[#1d6a80] text-white"
					/>
				</div>

				{/* Search Section */}
				<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
					<SearchInput
						value={searchTerm}
						onChange={handleSearchChange}
						placeholder="Search by code or name..."
						className="max-w-full"
					/>
				</div>

				{/* Table */}
				<Table
					columns={columns}
					data={roles}
					onView={handleOpenView}
					onEdit={handleOpenEdit}
					onDelete={row => {
						setSelectedRole(row);
						setIsDeleteModalOpen(true);
					}}
					emptyMessage={loading ? "Loading responsibilities..." : "No responsibilities found"}
				/>

				{/* Pagination */}
				<Pagination
					currentPage={page}
					totalCount={count}
					pageSize={localPageSize}
					hasNext={hasNext}
					hasPrevious={hasPrevious}
					onPageChange={handlePageChange}
					onPageSizeChange={handlePageSizeChange}
				/>
			</div>

			{/* View Modal */}
			<SlideUpModal
				isOpen={isViewModalOpen}
				onClose={handleCloseModals}
				title="View Responsibility"
				maxWidth="600px"
			>
				{selectedRole && (
					<div className="space-y-5 p-4">
						<div>
							<p className="text-sm font-medium text-[#28819C] mb-1">Name</p>
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
			<SlideUpModal
				isOpen={isEditModalOpen}
				onClose={handleCloseModals}
				title="Edit Responsibility"
				maxWidth="600px"
			>
				<div className="space-y-5 p-4">
					<FloatingLabelInput
						label="Name"
						name="name"
						value={editForm.name}
						onChange={handleEditFormChange}
						placeholder="Enter name"
					/>

					<FloatingLabelInput
						label="Description"
						name="description"
						value={editForm.description}
						onChange={handleEditFormChange}
						placeholder="Enter description"
					/>

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
				title="Delete Responsibility"
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
