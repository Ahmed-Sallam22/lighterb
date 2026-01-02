import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { HiOutlineUser } from "react-icons/hi";

import PageHeader from "../components/shared/PageHeader";
import Button from "../components/shared/Button";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import SlideUpModal from "../components/shared/SlideUpModal";
import { fetchBusinessGroups } from "../store/businessGroupsSlice";
import { fetchDepartments } from "../store/departmentsSlice";

const ASSIGNMENT_INITIAL_STATE = {
	effectiveDate: "",
	jobTitle: "",
	businessGroup: "",
	department: "",
	location: "",
	grade: "",
	manager: "",
	assignmentType: "",
};

const QUALIFICATION_INITIAL_STATE = {
	type: "",
	qualification: "",
	issuer: "",
	year: "",
	status: "",
};

const ProfilePage = () => {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const { businessGroups = [] } = useSelector(state => state.businessGroups || {});
	const { departments = [] } = useSelector(state => state.departments || {});
	const [activeTab, setActiveTab] = useState("assignment");
	const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
	const [isQualificationModalOpen, setIsQualificationModalOpen] = useState(false);
	const [assignmentForm, setAssignmentForm] = useState(ASSIGNMENT_INITIAL_STATE);
	const [qualificationForm, setQualificationForm] = useState(QUALIFICATION_INITIAL_STATE);

	useEffect(() => {
		document.title = `${t("profile.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	useEffect(() => {
		dispatch(fetchBusinessGroups({ page_size: 100 }));
		dispatch(fetchDepartments({ page: 1, page_size: 100 }));
	}, [dispatch]);

	const tabItems = [
		{ id: "assignment", label: t("profile.tabs.assignment") },
		{ id: "contacts", label: t("profile.tabs.contacts") },
		{ id: "qualifications", label: t("profile.tabs.qualifications") },
	];

	const jobTitleOptions = useMemo(
		() => [
			{ value: "", label: t("profile.modals.fields.jobTitle") },
			{ value: "senior_software_engineer", label: t("profile.modals.options.jobTitles.senior") },
			{ value: "hr_specialist", label: t("profile.modals.options.jobTitles.hrSpecialist") },
			{ value: "product_manager", label: t("profile.modals.options.jobTitles.productManager") },
		],
		[t]
	);

	const getOptionValue = value => (value === null || value === undefined ? "" : String(value));
	const getBusinessGroupKey = businessGroup =>
		getOptionValue(businessGroup?.id ?? businessGroup?.code ?? businessGroup?.name);
	const getDepartmentKey = department =>
		getOptionValue(department?.id ?? department?.code ?? department?.name);

	const businessGroupOptions = useMemo(() => {
		return [
			{ value: "", label: "Business Group" },
			...businessGroups.map(group => ({
				value: getBusinessGroupKey(group),
				label: group.name || group.code || "Unnamed Business Group",
			})),
		];
	}, [businessGroups]);

	const departmentOptions = useMemo(() => {
		const selectedGroup = assignmentForm.businessGroup;
		const filteredDepartments = selectedGroup
			? departments.filter(department => {
					const groupId = getOptionValue(
						department?.business_group ?? department?.business_group_id ?? department?.business_group?.id
					);
					return groupId === selectedGroup;
			  })
			: departments;

		return [
			{ value: "", label: "Department" },
			...filteredDepartments.map(department => ({
				value: getDepartmentKey(department),
				label: department.name || department.code || "Unnamed Department",
			})),
		];
	}, [departments, assignmentForm.businessGroup]);

	const locationOptions = useMemo(
		() => [
			{ value: "", label: t("profile.modals.fields.location") },
			{ value: "head_office", label: t("profile.modals.options.locations.headOffice") },
			{ value: "branch_office", label: t("profile.modals.options.locations.branchOffice") },
		],
		[t]
	);

	const gradeOptions = useMemo(
		() => [
			{ value: "", label: t("profile.modals.fields.grade") },
			{ value: "g7", label: t("profile.modals.options.grades.g7") },
			{ value: "g6", label: t("profile.modals.options.grades.g6") },
			{ value: "g5", label: t("profile.modals.options.grades.g5") },
		],
		[t]
	);

	const managerOptions = useMemo(
		() => [
			{ value: "", label: t("profile.modals.fields.manager") },
			{ value: "mohamed_hassan", label: t("profile.modals.options.managers.mohamedHassan") },
			{ value: "sarah_adel", label: t("profile.modals.options.managers.sarahAdel") },
		],
		[t]
	);

	const assignmentTypeOptions = useMemo(
		() => [
			{ value: "", label: t("profile.modals.fields.assignmentType") },
			{ value: "full_time", label: t("profile.modals.options.assignmentTypes.fullTime") },
			{ value: "part_time", label: t("profile.modals.options.assignmentTypes.partTime") },
			{ value: "contract", label: t("profile.modals.options.assignmentTypes.contract") },
		],
		[t]
	);

	const qualificationTypeOptions = useMemo(
		() => [
			{ value: "", label: t("profile.modals.fields.qualificationType") },
			{ value: "certificate", label: t("profile.modals.options.qualificationTypes.certificate") },
			{ value: "course", label: t("profile.modals.options.qualificationTypes.course") },
			{ value: "degree", label: t("profile.modals.options.qualificationTypes.degree") },
		],
		[t]
	);

	const qualificationStatusOptions = useMemo(
		() => [
			{ value: "", label: t("profile.modals.fields.status") },
			{ value: "valid", label: t("profile.qualifications.statuses.valid") },
			{ value: "completed", label: t("profile.qualifications.statuses.completed") },
			{ value: "expired", label: t("profile.modals.options.qualificationStatuses.expired") },
		],
		[t]
	);

	const handleAssignmentChange = event => {
		const { name, value } = event.target;
		setAssignmentForm(prev => {
			const nextForm = { ...prev, [name]: value };
			if (name === "businessGroup") {
				nextForm.department = "";
			}
			return nextForm;
		});
	};

	const handleQualificationChange = event => {
		const { name, value } = event.target;
		setQualificationForm(prev => ({ ...prev, [name]: value }));
	};

	const handleAssignmentSubmit = () => {
		setIsAssignmentModalOpen(false);
	};

	const handleQualificationSubmit = () => {
		setIsQualificationModalOpen(false);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<PageHeader
				icon={<HiOutlineUser className="w-8 h-8 text-white mr-3" />}
				title={t("profile.title")}
				subtitle={t("profile.subtitle")}
			/>

			<div className="px-6 py-8">
				<div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-6">
					<aside className="bg-white rounded-2xl shadow-lg p-4">
						<h3 className="text-sm font-semibold text-[#1D7A8C]">
							{t("profile.personalInformation")}
						</h3>
						<div className="mt-4 rounded-xl bg-gray-100 h-40 flex items-center justify-center">
							<div className="w-24 h-24 rounded-full bg-white shadow-inner flex items-center justify-center text-[#1D7A8C] font-bold text-2xl">
								AA
							</div>
						</div>
						<div className="mt-4 border-t border-gray-200 pt-4">
							<h2 className="text-lg font-bold text-gray-900">Ahmed Ali</h2>
							<div className="mt-3 text-xs text-gray-500 space-y-2">
								<div className="flex items-center justify-between">
									<span>{t("profile.employeeNo")}</span>
									<span className="text-gray-800">100245</span>
								</div>
								<div className="flex items-center justify-between">
									<span>{t("profile.status")}</span>
									<span className="text-green-600 font-semibold">{t("common.active")}</span>
								</div>
								<div className="flex items-center justify-between">
									<span>{t("profile.primaryAssignment")}</span>
									<span className="text-gray-800">{t("profile.primary")}</span>
								</div>
							</div>
							<div className="mt-4 border-t border-gray-200 pt-4 text-xs text-gray-500 space-y-2">
								<p>HR Specialist</p>
								<p>Human Resources</p>
								<p>Corporate</p>
							</div>
						</div>
					</aside>

					<section className="space-y-6">
						<div className="bg-white rounded-2xl shadow-lg px-6 py-4">
							<div className="flex flex-wrap items-center gap-4">
								{tabItems.map((tab, index) => {
									const isActive = activeTab === tab.id;
									return (
										<React.Fragment key={tab.id}>
											<button
												type="button"
												onClick={() => setActiveTab(tab.id)}
												className={`flex items-center gap-3 pb-2 border-b-2 transition-colors whitespace-nowrap ${
													isActive
														? "border-[#1D7A8C] text-[#1D7A8C]"
														: "border-transparent text-gray-500 hover:text-gray-700"
												}`}
											>
												<span
													className={`w-2 h-2 rounded-full ${
														isActive ? "bg-[#1D7A8C]" : "bg-gray-300"
													}`}
												/>
												<span className="text-sm font-medium">{tab.label}</span>
											</button>
											{index < tabItems.length - 1 && (
												<div className="hidden lg:block flex-1 h-px bg-gray-200" />
											)}
										</React.Fragment>
									);
								})}
							</div>
						</div>

						{activeTab === "assignment" && (
							<div className="space-y-4">
								<div className="bg-white rounded-2xl shadow-lg p-5">
									<h3 className="text-sm font-semibold text-gray-900">
										{t("profile.assignment.role")}
									</h3>
									<div className="mt-3 flex items-center gap-6 text-xs text-gray-500">
										<span>{t("profile.assignment.grade")}</span>
										<span className="flex items-center gap-2 text-green-600">
											<span className="w-2 h-2 rounded-full bg-green-500"></span>
											{t("common.active")}
										</span>
									</div>
								</div>

								<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
									<div className="bg-white rounded-2xl shadow-lg p-5">
										<h4 className="text-sm font-semibold text-[#1D7A8C]">
											{t("profile.assignment.detailsTitle")}
										</h4>
										<div className="mt-4 space-y-3 text-xs text-gray-500">
											<div className="flex items-center justify-between">
												<span>{t("profile.assignment.fields.title")}</span>
												<span className="text-gray-900 font-medium">
													{t("profile.assignment.currentAssignment")}
												</span>
											</div>
											<div className="flex items-center justify-between">
												<span>{t("profile.assignment.fields.assignmentType")}</span>
												<span className="text-gray-900 font-medium">
													{t("profile.assignment.fullTime")}
												</span>
											</div>
											<div className="flex items-center justify-between">
												<span>{t("profile.assignment.fields.effectiveFrom")}</span>
												<span className="text-gray-900 font-medium">01 Jan 2023</span>
											</div>
											<div className="flex items-center justify-between">
												<span>{t("profile.assignment.fields.assignmentStatus")}</span>
												<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
													{t("common.active")}
												</span>
											</div>
										</div>
									</div>

									<div className="bg-white rounded-2xl shadow-lg p-5">
										<h4 className="text-sm font-semibold text-[#1D7A8C]">
											{t("profile.assignment.organizationTitle")}
										</h4>
										<div className="mt-4 space-y-3 text-xs text-gray-500">
											<div className="flex items-center justify-between">
												<span>{t("profile.assignment.fields.title")}</span>
												<span className="text-gray-900 font-medium">Organization</span>
											</div>
											<div className="flex items-center justify-between">
												<span>{t("profile.assignment.fields.businessGroup")}</span>
												<span className="text-gray-900 font-medium">Technology</span>
											</div>
											<div className="flex items-center justify-between">
												<span>{t("profile.assignment.fields.department")}</span>
												<span className="text-gray-900 font-medium">Software Development</span>
											</div>
											<div className="flex items-center justify-between">
												<span>{t("profile.assignment.fields.location")}</span>
												<span className="text-gray-900 font-medium">Head Office</span>
											</div>
											<div className="flex items-center justify-between">
												<span>{t("profile.assignment.fields.manager")}</span>
												<span className="text-gray-900 font-medium">Mohamed Hassan</span>
											</div>
										</div>
									</div>
								</div>

								<div className="bg-white rounded-2xl shadow-lg p-4 flex items-center justify-end gap-3">
									<button
										type="button"
										className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
									>
										{t("profile.assignment.actions.view")}
									</button>
									<Button
										onClick={() => setIsAssignmentModalOpen(true)}
										title={t("profile.assignment.actions.update")}
										className="text-xs px-4 py-2"
									/>
								</div>
							</div>
						)}

						{activeTab === "contacts" && (
							<div className="space-y-6">
								<div className="bg-white rounded-2xl shadow-lg p-5">
									<h4 className="text-sm font-semibold text-[#1D7A8C]">
										{t("profile.contacts.addressTitle")}
									</h4>
									<div className="mt-4 overflow-x-auto">
										<table className="w-full text-xs text-gray-600">
											<thead className="bg-gray-50 text-[11px] uppercase text-gray-400">
												<tr>
													<th className="text-left px-3 py-2">
														{t("profile.contacts.table.email")}
													</th>
													<th className="text-left px-3 py-2">
														{t("profile.contacts.table.phone")}
													</th>
													<th className="text-left px-3 py-2">
														{t("profile.contacts.table.address")}
													</th>
													<th className="text-left px-3 py-2">
														{t("profile.contacts.table.addressType")}
													</th>
													<th className="text-left px-3 py-2">
														{t("profile.contacts.table.lastUpdate")}
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-200">
												<tr className="text-[#1D7A8C]">
													<td className="px-3 py-3">ahmed@company.com</td>
													<td className="px-3 py-3">01012345678</td>
													<td className="px-3 py-3">25 Abbas El Akkad St., Nasr City, Cairo, Egypt</td>
													<td className="px-3 py-3">Home</td>
													<td className="px-3 py-3">01-Mar-2025</td>
												</tr>
												<tr>
													<td className="px-3 py-3">ahmed.old@mail.com</td>
													<td className="px-3 py-3">01198765432</td>
													<td className="px-3 py-3">12 El Tayaran St., Heliopolis, Cairo, Egypt</td>
													<td className="px-3 py-3">Home</td>
													<td className="px-3 py-3">15-Jan-2022</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>

								<div className="bg-white rounded-2xl shadow-lg p-5">
									<h4 className="text-sm font-semibold text-[#1D7A8C]">
										{t("profile.contacts.familyTitle")}
									</h4>
									<div className="mt-4 overflow-x-auto">
										<table className="w-full text-xs text-gray-600">
											<thead className="bg-gray-50 text-[11px] uppercase text-gray-400">
												<tr>
													<th className="text-left px-3 py-2">
														{t("profile.contacts.table.name")}
													</th>
													<th className="text-left px-3 py-2">
														{t("profile.contacts.table.phone")}
													</th>
													<th className="text-left px-3 py-2">
														{t("profile.contacts.table.relationship")}
													</th>
													<th className="text-left px-3 py-2">
														{t("profile.contacts.table.contactType")}
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-200">
												<tr>
													<td className="px-3 py-3">Mona Ahmed</td>
													<td className="px-3 py-3">01055544321</td>
													<td className="px-3 py-3">Wife</td>
													<td className="px-3 py-3">Family</td>
												</tr>
												<tr>
													<td className="px-3 py-3">Ali Ahmed</td>
													<td className="px-3 py-3">01233322111</td>
													<td className="px-3 py-3">Brother</td>
													<td className="px-3 py-3">Emergency</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</div>
						)}

						{activeTab === "qualifications" && (
							<div className="space-y-4">
								<div className="bg-white rounded-2xl shadow-lg p-5">
									<div className="overflow-x-auto">
										<table className="w-full text-xs text-gray-600">
											<thead className="bg-gray-50 text-[11px] uppercase text-gray-400">
												<tr>
													<th className="text-left px-3 py-2">
														{t("profile.qualifications.table.type")}
													</th>
													<th className="text-left px-3 py-2">
														{t("profile.qualifications.table.qualification")}
													</th>
													<th className="text-left px-3 py-2">
														{t("profile.qualifications.table.issuer")}
													</th>
													<th className="text-left px-3 py-2">
														{t("profile.qualifications.table.year")}
													</th>
													<th className="text-left px-3 py-2">
														{t("profile.qualifications.table.status")}
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-200">
												<tr>
													<td className="px-3 py-3">Certificate</td>
													<td className="px-3 py-3">PMP</td>
													<td className="px-3 py-3">PMI</td>
													<td className="px-3 py-3">2022</td>
													<td className="px-3 py-3">
														<span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
															{t("profile.qualifications.statuses.valid")}
														</span>
													</td>
												</tr>
												<tr>
													<td className="px-3 py-3">Course</td>
													<td className="px-3 py-3">Leadership Skills</td>
													<td className="px-3 py-3">AUC</td>
													<td className="px-3 py-3">2021</td>
													<td className="px-3 py-3">
														<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
															{t("profile.qualifications.statuses.completed")}
														</span>
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>

								<div className="bg-white rounded-2xl shadow-lg p-4 flex items-center justify-end">
									<button
										type="button"
										onClick={() => setIsQualificationModalOpen(true)}
										className="px-4 py-2 text-xs font-medium text-[#1D7A8C] border border-[#1D7A8C] rounded-lg hover:bg-[#1D7A8C]/5 transition-colors"
									>
										{t("profile.qualifications.actions.add")}
									</button>
								</div>
							</div>
						)}
					</section>
				</div>
			</div>

			<SlideUpModal
				isOpen={isAssignmentModalOpen}
				onClose={() => setIsAssignmentModalOpen(false)}
				title={t("profile.modals.updateAssignment")}
				maxWidth="760px"
			>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
					<FloatingLabelInput
						label={t("profile.modals.fields.effectiveDate")}
						name="effectiveDate"
						type="date"
						value={assignmentForm.effectiveDate}
						onChange={handleAssignmentChange}
					/>
					<FloatingLabelSelect
						label={t("profile.modals.fields.jobTitle")}
						name="jobTitle"
						value={assignmentForm.jobTitle}
						onChange={handleAssignmentChange}
						options={jobTitleOptions}
					/>
					<FloatingLabelSelect
						label={t("profile.modals.fields.businessGroup")}
						name="businessGroup"
						value={assignmentForm.businessGroup}
						onChange={handleAssignmentChange}
						options={businessGroupOptions}
					/>
					<FloatingLabelSelect
						label={t("profile.modals.fields.department")}
						name="department"
						value={assignmentForm.department}
						onChange={handleAssignmentChange}
						options={departmentOptions}
					/>
					<FloatingLabelSelect
						label={t("profile.modals.fields.location")}
						name="location"
						value={assignmentForm.location}
						onChange={handleAssignmentChange}
						options={locationOptions}
					/>
					<FloatingLabelSelect
						label={t("profile.modals.fields.grade")}
						name="grade"
						value={assignmentForm.grade}
						onChange={handleAssignmentChange}
						options={gradeOptions}
					/>
					<FloatingLabelSelect
						label={t("profile.modals.fields.manager")}
						name="manager"
						value={assignmentForm.manager}
						onChange={handleAssignmentChange}
						options={managerOptions}
					/>
					<FloatingLabelSelect
						label={t("profile.modals.fields.assignmentType")}
						name="assignmentType"
						value={assignmentForm.assignmentType}
						onChange={handleAssignmentChange}
						options={assignmentTypeOptions}
					/>
				</div>
				<div className="flex items-center justify-end gap-3 py-4">
					<Button
						onClick={() => setIsAssignmentModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none"
					/>
					<Button onClick={handleAssignmentSubmit} title={t("common.update")} className="shadow-none" />
				</div>
			</SlideUpModal>

			<SlideUpModal
				isOpen={isQualificationModalOpen}
				onClose={() => setIsQualificationModalOpen(false)}
				title={t("profile.modals.addQualification")}
				maxWidth="560px"
			>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
					<FloatingLabelSelect
						label={t("profile.modals.fields.qualificationType")}
						name="type"
						value={qualificationForm.type}
						onChange={handleQualificationChange}
						options={qualificationTypeOptions}
					/>
					<FloatingLabelInput
						label={t("profile.modals.fields.qualifications")}
						name="qualification"
						value={qualificationForm.qualification}
						onChange={handleQualificationChange}
					/>
					<FloatingLabelInput
						label={t("profile.modals.fields.issuer")}
						name="issuer"
						value={qualificationForm.issuer}
						onChange={handleQualificationChange}
					/>
					<FloatingLabelInput
						label={t("profile.modals.fields.year")}
						name="year"
						type="number"
						value={qualificationForm.year}
						onChange={handleQualificationChange}
					/>
					<div className="md:col-span-2">
						<FloatingLabelSelect
							label={t("profile.modals.fields.status")}
							name="status"
							value={qualificationForm.status}
							onChange={handleQualificationChange}
							options={qualificationStatusOptions}
						/>
					</div>
				</div>
				<div className="flex items-center justify-end gap-3 py-4">
					<Button
						onClick={() => setIsQualificationModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none"
					/>
					<Button onClick={handleQualificationSubmit} title={t("common.add")} className="shadow-none" />
				</div>
			</SlideUpModal>
		</div>
	);
};

export default ProfilePage;
