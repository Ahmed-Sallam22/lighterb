import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { usePageTitle } from "../hooks/usePageTitle";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import CustomInput from "../components/shared/CustomInput";
import CustomStatus from "../components/shared/CustomStatus";
import Button from "../components/shared/Button";
import EmployeeModal from "../components/shared/EmployeeModal";
import ConfirmModal from "../components/shared/ConfirmModal";

import { fetchEmployees, createEmployee, deleteEmployee, setPage, clearError } from "../store/employeesSlice";
import SearchIcon from "../assets/icons/search.svg?react";

const INITIAL_FILTERS = {
	employeeNumber: "",
	name: "",
	includeInactive: true,
};

const EmployeeSearchPage = () => {
	const { t } = useTranslation();
	usePageTitle(t("employeeSearch.title"));
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const {
		employees = [],
		loading,
		creating,
		deleting,
		error,
		actionError,
		count: totalCount,
		page,
		hasNext,
		hasPrevious,
	} = useSelector(state => state.employees || {});

	const [filters, setFilters] = useState(INITIAL_FILTERS);
	const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);
	const [pageSize, setPageSize] = useState(25);

	// Modal state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalMode] = useState("create");
	const [selectedEmployee, setSelectedEmployee] = useState(null);

	// Delete modal state
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [employeeToDelete, setEmployeeToDelete] = useState(null);

	useEffect(() => {
		const params = {
			as_of_date: "ALL",
			status: appliedFilters.includeInactive ? "ALL" : "ACTIVE",
			page,
			page_size: pageSize,
		};

		if (appliedFilters.employeeNumber) {
			params.employee_number = appliedFilters.employeeNumber.trim();
		}
		if (appliedFilters.name) {
			params.name = appliedFilters.name.trim();
		}

		dispatch(fetchEmployees(params));
	}, [dispatch, appliedFilters, page, pageSize]);

	useEffect(() => {
		if (error) {
			toast.error(error);
			dispatch(clearError());
		}
		if (actionError) {
			toast.error(actionError);
			dispatch(clearError());
		}
	}, [error, actionError, dispatch]);

	const columns = [
		{
			header: t("employeeSearch.table.number"),
			accessor: "employee_number",
			render: value => <span className="font-medium text-gray-800">{value || "-"}</span>,
		},
		{
			header: t("employeeSearch.table.name"),
			accessor: "person_name",
			render: value => <span className="font-medium text-[#1D7A8C]">{value || "-"}</span>,
		},
		{
			header: t("employeeSearch.table.status"),
			accessor: "status",
			render: value => (
				<span
					className={`px-3 py-1 rounded-full text-xs font-semibold ${
						value === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
					}`}
				>
					{value === "active" ? t("common.active") : t("common.inactive")}
				</span>
			),
		},
		{
			header: t("employeeSearch.table.employeeType"),
			accessor: "employee_type_name",
			render: value => value || "-",
		},
		{
			header: t("employeeSearch.table.organization"),
			accessor: "current_organization_name",
			render: value => value || "-",
		},
		{
			header: t("employeeSearch.table.hireDate"),
			accessor: "hire_date",
			render: value => value || "-",
		},
	];

	const handleFilterChange = e => {
		const { name, value } = e.target;
		setFilters(prev => ({ ...prev, [name]: value }));
	};

	const handleSearch = () => {
		setAppliedFilters(filters);
		dispatch(setPage(1));
	};

	const handleReset = () => {
		setFilters(INITIAL_FILTERS);
		setAppliedFilters(INITIAL_FILTERS);
		dispatch(setPage(1));
	};

	const handleCreateEmployee = () => {
		// Navigate to the create employee page
		navigate("/create-employee");
	};

	const handleViewEmployee = employee => {
		// Navigate to profile page with employee ID
		navigate(`/profile/${employee.id}`);
	};

	const handleEditEmployee = employee => {
		// Navigate to create-employee page with ID for edit mode
		navigate(`/create-employee?id=${employee.id}`);
	};

	const handleDeleteClick = employee => {
		setEmployeeToDelete(employee);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!employeeToDelete) return;
		try {
			await dispatch(deleteEmployee(employeeToDelete.id)).unwrap();
			toast.success(t("employeeSearch.messages.deleteSuccess"));
			setIsDeleteModalOpen(false);
			setEmployeeToDelete(null);
		} catch {
			// Error handled in useEffect
		}
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
		setEmployeeToDelete(null);
	};

	const handleModalClose = () => {
		setIsModalOpen(false);
		setSelectedEmployee(null);
	};

	const handleModalSubmit = async employeeData => {
		try {
			await dispatch(createEmployee(employeeData)).unwrap();
			toast.success(t("employeeSearch.messages.createSuccess"));
			handleModalClose();
		} catch {
			// Error already handled in useEffect
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<PageHeader icon={<SearchIcon className="w-8 h-8" />} title={t("employeeSearch.title")} />

			<div className="mx-auto px-6 py-8 m-6">
				<h2 className="text-3xl font-bold text-[#28819C] mb-6">{t("employeeSearch.secondTitle")}</h2>

				<div className="bg-white rounded-2xl shadow-lg p-6">
					<div className="flex flex-col gap-6">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
							<CustomInput
								label={t("employeeSearch.fields.employeeNumber")}
								name="employeeNumber"
								value={filters.employeeNumber}
								onChange={handleFilterChange}
								placeholder={t("employeeSearch.placeholders.employeeNumber")}
							/>
							<CustomInput
								label={t("employeeSearch.fields.name")}
								name="name"
								value={filters.name}
								onChange={handleFilterChange}
								placeholder={t("employeeSearch.placeholders.name")}
							/>
							<CustomStatus
								label={t("employeeSearch.fields.status")}
								checked={filters.includeInactive}
								onChange={value => setFilters(prev => ({ ...prev, includeInactive: value }))}
							/>
						</div>

						<div className="flex flex-col justify-between gap-4">
							<div className="flex items-center justify-end gap-3">
								<Button
									onClick={handleReset}
									title={t("employeeSearch.buttons.reset")}
									className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-none"
								/>
								<Button
									onClick={handleSearch}
									title={t("employeeSearch.buttons.search")}
									disabled={loading}
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-lg p-4 mt-6">
					<Table
						columns={columns}
						data={employees}
						emptyMessage={loading ? t("common.loading") : t("employeeSearch.table.empty")}
						onView={handleViewEmployee}
						onEdit={handleEditEmployee}
						onDelete={handleDeleteClick}
					/>

					<div className="mt-4 flex items-center justify-end">
						<Button
							onClick={handleCreateEmployee}
							title={t("employeeSearch.buttons.createEmployee")}
							className="shadow-none border border-[#28819C] bg-white text-[#28819C] hover:bg-[#E8F7FA]"
							disabled={creating || deleting}
						/>
					</div>
				</div>

				{/* Pagination Section */}
				<div className="mt-6 flex items-center justify-center">
					<Pagination
						currentPage={page}
						totalCount={totalCount}
						pageSize={pageSize}
						onPageChange={newPage => dispatch(setPage(newPage))}
						onPageSizeChange={newPageSize => {
							setPageSize(newPageSize);
							dispatch(setPage(1));
						}}
						hasNext={hasNext}
						hasPrevious={hasPrevious}
					/>
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title={t("employeeSearch.deleteModal.title")}
				message={t("employeeSearch.deleteModal.message", {
					name: employeeToDelete?.person_name || employeeToDelete?.employee_number,
				})}
				confirmText={t("common.delete")}
				cancelText={t("common.cancel")}
				variant="danger"
			/>

			<EmployeeModal
				isOpen={isModalOpen}
				onClose={handleModalClose}
				mode={modalMode}
				employee={selectedEmployee}
				onSubmit={handleModalSubmit}
				loading={creating}
			/>
		</div>
	);
};

export default EmployeeSearchPage;
