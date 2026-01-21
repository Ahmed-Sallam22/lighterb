import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { usePageTitle } from "../hooks/usePageTitle";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import CustomInput from "../components/shared/CustomInput";
import CustomStatus from "../components/shared/CustomStatus";
import Button from "../components/shared/Button";
import EmployeeModal from "../components/shared/EmployeeModal";
import SlideUpModal from "../components/shared/SlideUpModal";

import {
	fetchEmployees,
	createEmployee,
	fetchEmployeeById,
	setPage,
	clearError,
	clearSelectedEmployee,
} from "../store/employeesSlice";
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

	const {
		employees = [],
		selectedEmployee: viewEmployee,
		loading,
		loadingEmployee,
		creating,
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
	const [modalMode, setModalMode] = useState("create");
	const [selectedEmployee, setSelectedEmployee] = useState(null);

	// View modal state
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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
		setModalMode("create");
		setSelectedEmployee(null);
		setIsModalOpen(true);
	};

	const handleViewEmployee = employee => {
		dispatch(fetchEmployeeById(employee.id));
		setIsViewModalOpen(true);
	};

	const handleCloseViewModal = () => {
		setIsViewModalOpen(false);
		dispatch(clearSelectedEmployee());
	};

	const handleEditEmployee = employee => {
		setModalMode("edit");
		setSelectedEmployee(employee);
		setIsModalOpen(true);
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
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
									className="shadow-none"
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
					/>

					<div className="mt-4 flex items-center justify-end">
						<Button
							onClick={handleCreateEmployee}
							title={t("employeeSearch.buttons.createEmployee")}
							className="shadow-none border border-[#28819C] bg-white text-[#28819C] hover:bg-[#E8F7FA]"
							disabled={creating}
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

			{/* View Employee Modal */}
			<SlideUpModal
				isOpen={isViewModalOpen}
				onClose={handleCloseViewModal}
				title={t("employeeSearch.modal.viewTitle")}
			>
				{loadingEmployee ? (
					<div className="flex items-center justify-center py-8">
						<span className="text-gray-500">{t("common.loading")}</span>
					</div>
				) : viewEmployee ? (
					<div className="py-4">
						<h3 className="text-lg font-semibold text-[#1D7A8C] mb-4 border-b pb-2">
							{t("employeeSearch.modal.employeeDetails")}
						</h3>
						<div className="space-y-3">
							<div className="flex justify-between items-center py-2 border-b border-gray-100">
								<span className="text-gray-500">{t("employeeSearch.modal.fields.employeeNumber")}</span>
								<span className="font-medium text-gray-800">{viewEmployee.employee_number || "-"}</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-gray-100">
								<span className="text-gray-500">{t("employeeSearch.modal.fields.employeeName")}</span>
								<span className="font-medium text-gray-800">{viewEmployee.person_name || "-"}</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-gray-100">
								<span className="text-gray-500">{t("employeeSearch.table.status")}</span>
								<span
									className={`px-3 py-1 rounded-full text-xs font-semibold ${
										viewEmployee.status === "active"
											? "bg-green-100 text-green-700"
											: "bg-gray-100 text-gray-600"
									}`}
								>
									{viewEmployee.status === "active" ? t("common.active") : t("common.inactive")}
								</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-gray-100">
								<span className="text-gray-500">{t("employeeSearch.table.employeeType")}</span>
								<span className="font-medium text-gray-800">
									{viewEmployee.employee_type_name || "-"}
								</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-gray-100">
								<span className="text-gray-500">{t("employeeSearch.table.organization")}</span>
								<span className="font-medium text-gray-800">
									{viewEmployee.current_organization_name || "-"}
								</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-gray-100">
								<span className="text-gray-500">{t("employeeSearch.modal.fields.position")}</span>
								<span className="font-medium text-gray-800">
									{viewEmployee.current_position_name || "-"}
								</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-gray-100">
								<span className="text-gray-500">{t("employeeSearch.table.hireDate")}</span>
								<span className="font-medium text-gray-800">{viewEmployee.hire_date || "-"}</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-gray-100">
								<span className="text-gray-500">
									{t("employeeSearch.modal.fields.effectiveStartDate")}
								</span>
								<span className="font-medium text-gray-800">
									{viewEmployee.effective_start_date || "-"}
								</span>
							</div>
							<div className="flex justify-between items-center py-2">
								<span className="text-gray-500">
									{t("employeeSearch.modal.fields.effectiveEndDate")}
								</span>
								<span className="font-medium text-gray-800">
									{viewEmployee.effective_end_date || "-"}
								</span>
							</div>
						</div>
						<div className="flex justify-end pt-4 mt-4 border-t">
							<Button
								onClick={handleCloseViewModal}
								title={t("common.cancel")}
								className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-none"
							/>
						</div>
					</div>
				) : null}
			</SlideUpModal>

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
