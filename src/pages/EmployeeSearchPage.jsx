import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { HiSearch } from "react-icons/hi";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import Button from "../components/shared/Button";
import { fetchBusinessGroups } from "../store/businessGroupsSlice";
import { fetchDepartments } from "../store/departmentsSlice";

const EMPLOYEE_DATA = [
	{
		id: 100245,
		number: "100245",
		name: "Ahmed Ali",
		isActive: true,
		jobTitle: "HR Specialist",
		department: "Human Resources",
		businessGroup: "Corporate",
	},
	{
		id: 100387,
		number: "100387",
		name: "Sara Hassan",
		isActive: true,
		jobTitle: "Software Engineer",
		department: "IT Development",
		businessGroup: "Technology",
	},
	{
		id: 100112,
		number: "100112",
		name: "Omar Nabil",
		isActive: false,
		jobTitle: "Production Supervisor",
		department: "Production",
		businessGroup: "Manufacturing",
	},
];

const INITIAL_FILTERS = {
	employeeNumber: "",
	name: "",
	businessGroup: "all",
	department: "all",
	includeInactive: true,
};

const EmployeeSearchPage = () => {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const { businessGroups = [] } = useSelector(state => state.businessGroups || {});
	const { departments = [] } = useSelector(state => state.departments || {});
	const [filters, setFilters] = useState(INITIAL_FILTERS);
	const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(25);

	useEffect(() => {
		document.title = `${t("employeeSearch.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	useEffect(() => {
		dispatch(fetchBusinessGroups({ page_size: 100 }));
		dispatch(fetchDepartments({ page: 1, page_size: 100 }));
	}, [dispatch]);

	const getOptionValue = value =>
		value === null || value === undefined ? "" : String(value);

	const getBusinessGroupKey = businessGroup =>
		getOptionValue(businessGroup?.id ?? businessGroup?.code ?? businessGroup?.name);

	const getDepartmentKey = department =>
		getOptionValue(department?.id ?? department?.code ?? department?.name);

	const businessGroupOptions = useMemo(() => {
		return [
			{ value: "all", label: t("employeeSearch.placeholders.businessGroup") },
			...businessGroups.map(group => ({
				value: getBusinessGroupKey(group),
				label: group.name || group.code || "Unnamed Business Group",
			})),
		];
	}, [businessGroups, t]);

	const departmentOptions = useMemo(() => {
		const normalizedBusinessGroup = getOptionValue(filters.businessGroup);
		const filteredDepartments =
			normalizedBusinessGroup === "all"
				? departments
				: departments.filter(department => {
						const departmentGroupId = getOptionValue(
							department?.business_group ??
								department?.business_group_id ??
								department?.business_group?.id
						);
						return departmentGroupId === normalizedBusinessGroup;
				  });

		return [
			{ value: "all", label: t("employeeSearch.placeholders.department") },
			...filteredDepartments.map(department => ({
				value: getDepartmentKey(department),
				label: department.name || department.code || "Unnamed Department",
			})),
		];
	}, [departments, filters.businessGroup, t]);

	const selectedBusinessGroupName = useMemo(() => {
		if (appliedFilters.businessGroup === "all") return "";
		const matchedGroup = businessGroups.find(
			group => getBusinessGroupKey(group) === appliedFilters.businessGroup
		);
		return matchedGroup?.name || matchedGroup?.code || appliedFilters.businessGroup;
	}, [appliedFilters.businessGroup, businessGroups]);

	const selectedDepartmentName = useMemo(() => {
		if (appliedFilters.department === "all") return "";
		const matchedDepartment = departments.find(
			department => getDepartmentKey(department) === appliedFilters.department
		);
		return matchedDepartment?.name || matchedDepartment?.code || appliedFilters.department;
	}, [appliedFilters.department, departments]);

	const filteredEmployees = useMemo(() => {
		const numberQuery = appliedFilters.employeeNumber.trim();
		const nameQuery = appliedFilters.name.trim().toLowerCase();

		return EMPLOYEE_DATA.filter(employee => {
			const matchesNumber = numberQuery ? employee.number.includes(numberQuery) : true;
			const matchesName = nameQuery ? employee.name.toLowerCase().includes(nameQuery) : true;
			const matchesBusinessGroup =
				appliedFilters.businessGroup === "all" ||
				employee.businessGroup === selectedBusinessGroupName ||
				employee.businessGroup === appliedFilters.businessGroup;
			const matchesDepartment =
				appliedFilters.department === "all" ||
				employee.department === selectedDepartmentName ||
				employee.department === appliedFilters.department;
			const matchesStatus = appliedFilters.includeInactive || employee.isActive;

			return matchesNumber && matchesName && matchesBusinessGroup && matchesDepartment && matchesStatus;
		});
	}, [appliedFilters, selectedBusinessGroupName, selectedDepartmentName]);

	const totalCount = filteredEmployees.length;
	const totalPages = Math.ceil(totalCount / pageSize) || 1;
	const hasPrevious = totalCount > 0 && currentPage > 1;
	const hasNext = totalCount > 0 && currentPage < totalPages;

	useEffect(() => {
		if (totalCount === 0) {
			setCurrentPage(1);
			return;
		}
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalCount, totalPages]);

	const paginatedEmployees = useMemo(() => {
		const startIndex = (currentPage - 1) * pageSize;
		return filteredEmployees.slice(startIndex, startIndex + pageSize);
	}, [filteredEmployees, currentPage, pageSize]);

	const columns = [
		{
			header: t("employeeSearch.table.number"),
			accessor: "number",
			render: value => <span className="font-medium text-gray-800">{value}</span>,
		},
		{
			header: t("employeeSearch.table.name"),
			accessor: "name",
			render: value => <span className="font-medium text-[#1D7A8C]">{value}</span>,
		},
		{
			header: t("employeeSearch.table.status"),
			accessor: "isActive",
			render: value => (
				<span
					className={`px-3 py-1 rounded-full text-xs font-semibold ${
						value ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
					}`}
				>
					{value ? t("common.active") : t("common.inactive")}
				</span>
			),
		},
		{
			header: t("employeeSearch.table.jobTitle"),
			accessor: "jobTitle",
			render: value => value || "-",
		},
		{
			header: t("employeeSearch.table.department"),
			accessor: "department",
			render: value => value || "-",
		},
		{
			header: t("employeeSearch.table.businessGroup"),
			accessor: "businessGroup",
			render: value => value || "-",
		},
		{
			header: t("employeeSearch.table.action"),
			accessor: "action",
			width: "120px",
			render: (value, row) => (
				<button
					type="button"
					title={t("employeeSearch.actions.view", { name: row.name })}
					className="flex items-center justify-center w-9 h-9 rounded-full bg-[#E8F3F7] text-[#28819C] hover:bg-[#D7EDF5] transition-colors"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
						<path
							d="M12 5C7 5 2.73 8.11 1 12.5C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12.5C21.27 8.11 17 5 12 5ZM12 17.5C9.24 17.5 7 15.26 7 12.5C7 9.74 9.24 7.5 12 7.5C14.76 7.5 17 9.74 17 12.5C17 15.26 14.76 17.5 12 17.5ZM12 9.5C10.34 9.5 9 10.84 9 12.5C9 14.16 10.34 15.5 12 15.5C13.66 15.5 15 14.16 15 12.5C15 10.84 13.66 9.5 12 9.5Z"
							fill="currentColor"
						/>
					</svg>
				</button>
			),
		},
	];

	const handleFilterChange = e => {
		const { name, value } = e.target;
		setFilters(prev => {
			const nextFilters = { ...prev, [name]: value };
			if (name === "businessGroup") {
				nextFilters.department = "all";
			}
			return nextFilters;
		});
	};

	const handleSearch = () => {
		setAppliedFilters(filters);
		setCurrentPage(1);
	};

	const handleReset = () => {
		setFilters(INITIAL_FILTERS);
		setAppliedFilters(INITIAL_FILTERS);
		setCurrentPage(1);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<PageHeader
				icon={<HiSearch className="w-8 h-8 text-white mr-3" />}
				title={t("employeeSearch.title")}
				subtitle={t("employeeSearch.subtitle")}
			/>

			<div className="mx-auto px-6 py-8">
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<h2 className="text-xl font-bold text-[#1D7A8C] mb-6">{t("employeeSearch.searchTitle")}</h2>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="space-y-4">
							<FloatingLabelInput
								label={t("employeeSearch.fields.employeeNumber")}
								name="employeeNumber"
								value={filters.employeeNumber}
								onChange={handleFilterChange}
								placeholder={t("employeeSearch.placeholders.employeeNumber")}
							/>
							<FloatingLabelInput
								label={t("employeeSearch.fields.name")}
								name="name"
								value={filters.name}
								onChange={handleFilterChange}
								placeholder={t("employeeSearch.placeholders.name")}
							/>
						</div>

						<div className="space-y-4">
							<FloatingLabelSelect
								label={t("employeeSearch.fields.businessGroup")}
								name="businessGroup"
								value={filters.businessGroup}
								onChange={handleFilterChange}
								options={businessGroupOptions}
								placeholder={t("employeeSearch.placeholders.businessGroup")}
							/>
							<FloatingLabelSelect
								label={t("employeeSearch.fields.department")}
								name="department"
								value={filters.department}
								onChange={handleFilterChange}
								options={departmentOptions}
								placeholder={t("employeeSearch.placeholders.department")}
							/>
						</div>

						<div className="flex flex-col justify-between gap-4">
							<div className="relative rounded-[20px] bg-linear-to-r from-white/15 via-white/10 to-white/5 shadow-md p-0.5">
								<div className="flex items-center justify-between rounded-[18px] bg-white px-5 py-4">
									<span className="text-sm font-semibold text-[#7A9098]">
										{t("employeeSearch.fields.status")}
									</span>
									<button
										type="button"
										onClick={() =>
											setFilters(prev => ({ ...prev, includeInactive: !prev.includeInactive }))
										}
										aria-pressed={filters.includeInactive}
										className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
											filters.includeInactive ? "bg-[#28819C]" : "bg-gray-200"
										}`}
									>
										<span
											className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
												filters.includeInactive ? "translate-x-5" : "translate-x-1"
											}`}
										/>
									</button>
								</div>
							</div>

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
						data={paginatedEmployees}
						emptyMessage={t("employeeSearch.table.empty")}
					/>

					<div className="mt-6">
						<Pagination
							currentPage={currentPage}
							totalCount={totalCount}
							pageSize={pageSize}
							onPageChange={setCurrentPage}
							onPageSizeChange={newPageSize => {
								setPageSize(newPageSize);
								setCurrentPage(1);
							}}
							hasNext={hasNext}
							hasPrevious={hasPrevious}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EmployeeSearchPage;
