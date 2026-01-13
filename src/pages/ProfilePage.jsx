import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
	HiOutlineUser,
	HiOutlineEye,
	HiOutlinePencilAlt,
	HiOutlineChevronDown,
	HiOutlineCheck,
	HiOutlineBookmark,
} from "react-icons/hi";

import PageHeader from "../components/shared/PageHeader";
import Button from "../components/shared/Button";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import SlideUpModal from "../components/shared/SlideUpModal";
import Toggle from "../components/shared/Toggle";
import { fetchBusinessGroups } from "../store/businessGroupsSlice";
import { fetchDepartments } from "../store/departmentsSlice";
import userImage from "../assets/userimage.png";

const ASSIGNMENT_DATA = [
	{ id: 1, title: "Current Assignment", type: "Full Time", effectiveFrom: "01 Jan 2023", status: "active" },
	{ id: 2, title: "Current Assignment", type: "Full Time", effectiveFrom: "01 Jan 2023", status: "inactive" },
	{ id: 3, title: "Current Assignment", type: "Full Time", effectiveFrom: "01 Jan 2023", status: "active" },
	{ id: 4, title: "Current Assignment", type: "Full Time", effectiveFrom: "01 Jan 2023", status: "active" },
];

const QUALIFICATION_DATA = [
	{ id: 1, type: "Certificate", qualification: "PMP", issuer: "PMI", year: "2022", status: "valid" },
	{ id: 2, type: "Course", qualification: "Leadership Skills", issuer: "AUC", year: "2021", status: "completed" },
];

const COMPETENCIES_LIST = [
	{ id: 1, name: "Negotiation", selected: true, level: "beginner" },
	{ id: 2, name: "Leadership", selected: false, level: "" },
	{ id: 3, name: "Time Management", selected: false, level: "" },
	{ id: 4, name: "Customer Service", selected: false, level: "" },
	{ id: 5, name: "Data Analysis", selected: false, level: "" },
	{ id: 6, name: "Teamwork", selected: true, level: "intermediate" },
	{ id: 7, name: "Communication", selected: true, level: "advanced" },
];

const QUALIFICATION_INITIAL_STATE = {
	qualificationTitle: "",
	qualificationType: "",
	status: true,
	titleOther: "",
	gradeScore: "",
	awardingEntity: "",
	studyStartDate: "",
	studyEndDate: "",
	awardedDate: "",
	projectedCompletion: "",
	completionPercentage: 0,
};

const ProfilePage = () => {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	useSelector(state => state.businessGroups || {});
	useSelector(state => state.departments || {});
	const [activeTab, setActiveTab] = useState("assignment");

	// Assignment modals
	const [isViewAssignmentModalOpen, setIsViewAssignmentModalOpen] = useState(false);
	const [isEditAssignmentModalOpen, setIsEditAssignmentModalOpen] = useState(false);
	const [selectedAssignment, setSelectedAssignment] = useState(null);
	const [editAssignmentForm, setEditAssignmentForm] = useState({
		title: "",
		assignmentType: "",
		effectiveFrom: "",
		status: true,
	});

	// Qualification modal
	const [isQualificationModalOpen, setIsQualificationModalOpen] = useState(false);
	const [qualificationForm, setQualificationForm] = useState(QUALIFICATION_INITIAL_STATE);
	const [competencies, setCompetencies] = useState(COMPETENCIES_LIST);
	const [isCompetenciesOpen, setIsCompetenciesOpen] = useState(false);
	const [activeLevelDropdown, setActiveLevelDropdown] = useState(null);
	const levelDropdownRef = React.useRef(null);

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

	// Close level dropdown when clicking outside
	useEffect(() => {
		if (activeLevelDropdown === null) return;

		const handleClickOutside = event => {
			if (levelDropdownRef.current && !levelDropdownRef.current.contains(event.target)) {
				setActiveLevelDropdown(null);
			}
		};

		// Use a small delay to avoid immediate closure
		const timeoutId = setTimeout(() => {
			document.addEventListener("mousedown", handleClickOutside);
		}, 0);

		return () => {
			clearTimeout(timeoutId);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [activeLevelDropdown]);

	const tabItems = [
		{ id: "assignment", label: t("profile.tabs.assignment") },
		{ id: "contacts", label: t("profile.tabs.contacts") },
		{ id: "qualifications", label: t("profile.tabs.qualifications") },
		{ id: "organization", label: t("profile.tabs.organization") },
	];

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

	const handleViewAssignment = assignment => {
		setSelectedAssignment(assignment);
		setIsViewAssignmentModalOpen(true);
	};

	const handleEditAssignment = assignment => {
		setSelectedAssignment(assignment);
		setEditAssignmentForm({
			title: assignment.title,
			type: assignment.type === "Full Time" ? "full_time" : "part_time",
			effectiveFrom: "",
			status: assignment.status,
		});
		setIsEditAssignmentModalOpen(true);
	};

	const handleQualificationChange = e => {
		const { name, value } = e.target;
		setQualificationForm(prev => ({ ...prev, [name]: value }));
	};

	const handleCompetencyToggle = id => {
		setCompetencies(prev =>
			prev.map(comp =>
				comp.id === id ? { ...comp, selected: !comp.selected, level: !comp.selected ? "" : comp.level } : comp
			)
		);
	};

	const handleCompetencyLevelChange = (id, level) => {
		setCompetencies(prev => prev.map(comp => (comp.id === id ? { ...comp, level, selected: true } : comp)));
		// Keep dropdown open to allow changing level
	};

	const handleQualificationSubmit = () => {
		setIsQualificationModalOpen(false);
		setQualificationForm(QUALIFICATION_INITIAL_STATE);
		setCompetencies(COMPETENCIES_LIST);
	};

	const renderStatusBadge = status => {
		const isActive = status === "active";
		return (
			<span
				className={`px-3 py-1 rounded-full text-xs font-semibold ${
					isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
				}`}
			>
				{isActive ? t("common.active") : t("common.inactive")}
			</span>
		);
	};

	const renderQualificationStatus = status => {
		const statusMap = {
			valid: { className: "bg-gray-100 text-gray-600", label: t("profile.qualifications.statuses.valid") },
			completed: {
				className: "bg-green-100 text-green-700",
				label: t("profile.qualifications.statuses.completed"),
			},
		};
		const statusInfo = statusMap[status] || statusMap.valid;
		return (
			<span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>
				{statusInfo.label}
			</span>
		);
	};

	const getLevelBadgeColor = level => {
		switch (level.toLowerCase()) {
			case "beginner":
				return "bg-orange-100 text-orange-600";
			case "intermediate":
				return "bg-blue-100 text-blue-600";
			case "advanced":
				return "bg-green-100 text-green-700";
			default:
				return "bg-gray-100 text-gray-600";
		}
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
					{/* Personal Information Sidebar */}
					<aside className="bg-white rounded-2xl shadow-lg p-4">
						<h3 className="text-lg font-semibold text-[#1D7A8C]">{t("profile.personalInformation")}</h3>
						<div className="mt-4 flex items-center justify-center">
							<img src={userImage} alt="Ahmed Ali" className="w-32 h-32 rounded-full object-cover" />
						</div>
						<div className="mt-4 border-t border-gray-200 pt-4">
							<h2 className="text-xl font-bold text-gray-900">Ahmed Ali</h2>
							<div className="mt-3 text-sm text-gray-500 space-y-2">
								<div className="flex items-center justify-between">
									<span>{t("profile.employeeNo")}</span>
									<span className="text-gray-800">100245</span>
								</div>
								<div className="flex items-center justify-between">
									<span>{t("profile.hireDate")}</span>
									<span className="text-gray-800">15-Jan-2023</span>
								</div>
								<div className="flex items-center justify-between">
									<span>{t("profile.status")}</span>
									<span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
										{t("common.active")}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span>{t("profile.primaryAssignment")}</span>
								</div>
							</div>
							<div className="mt-4 border-t border-gray-200 pt-4">
								<p className="text-base font-semibold text-gray-900">Senior Software Engineer</p>
								<div className="mt-2 flex items-center gap-3">
									<span className="text-sm text-gray-600">Grade G7</span>
									<span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
										{t("common.active")}
									</span>
								</div>
							</div>
							<div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-500 space-y-1">
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
							<div className="bg-white rounded-2xl shadow-lg p-6">
								<h3 className="text-lg font-semibold text-[#1D7A8C] mb-6  pl-3">
									{t("profile.assignment.detailsTitle")}
								</h3>
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead className="bg-gray-50">
											<tr>
												<th className="text-left px-4 py-3 text-gray-600 font-semibold">
													{t("profile.assignment.fields.title")}
												</th>
												<th className="text-left px-4 py-3 text-gray-600 font-semibold">
													{t("profile.assignment.fields.assignmentType")}
												</th>
												<th className="text-left px-4 py-3 text-gray-600 font-semibold">
													{t("profile.assignment.fields.effectiveFrom")}
												</th>
												<th className="text-left px-4 py-3 text-gray-600 font-semibold">
													{t("profile.status")}
												</th>
												<th className="text-center px-4 py-3 text-gray-600 font-semibold">
													{t("profile.assignment.fields.action")}
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-100">
											{ASSIGNMENT_DATA.map(assignment => (
												<tr key={assignment.id} className="hover:bg-gray-50">
													<td className="px-4 py-4 text-gray-700">{assignment.title}</td>
													<td className="px-4 py-4 text-gray-700">{assignment.type}</td>
													<td className="px-4 py-4 text-gray-700">
														{assignment.effectiveFrom}
													</td>
													<td className="px-4 py-4">
														{renderStatusBadge(assignment.status)}
													</td>
													<td className="px-4 py-4">
														<div className="flex items-center justify-center gap-2">
															<button
																onClick={() => handleViewAssignment(assignment)}
																className="text-[#1D7A8C] hover:text-[#155a66] p-1"
															>
																<HiOutlineEye className="w-5 h-5" />
															</button>
															<button
																onClick={() => handleEditAssignment(assignment)}
																className="text-[#1D7A8C] hover:text-[#155a66] p-1"
															>
																<HiOutlinePencilAlt className="w-5 h-5" />
															</button>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{activeTab === "contacts" && (
							<div className="space-y-6">
								{/* Address & Communication */}
								<div className="bg-white rounded-2xl shadow-lg p-6">
									<h4 className="text-lg font-semibold text-[#1D7A8C] mb-6  pl-3">
										{t("profile.contacts.addressTitle")}
									</h4>
									<div className="overflow-x-auto">
										<table className="w-full text-sm">
											<thead className="bg-gray-50">
												<tr>
													<th className="text-left px-4 py-3 text-gray-600 font-semibold">
														{t("profile.contacts.table.email")}
													</th>
													<th className="text-left px-4 py-3 text-gray-600 font-semibold">
														{t("profile.contacts.table.phone")}
													</th>
													<th className="text-left px-4 py-3 text-gray-600 font-semibold">
														{t("profile.contacts.table.address")}
													</th>
													<th className="text-left px-4 py-3 text-gray-600 font-semibold">
														{t("profile.contacts.table.addressType")}
													</th>
													<th className="text-left px-4 py-3 text-gray-600 font-semibold">
														{t("profile.contacts.table.lastUpdate")}
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-100">
												<tr>
													<td className="px-4 py-4 text-[#1D7A8C] cursor-pointer hover:underline">
														ahmed@company.com
													</td>
													<td className="px-4 py-4 text-[#1D7A8C] cursor-pointer hover:underline">
														01012345678
													</td>
													<td className="px-4 py-4 text-[#1D7A8C] cursor-pointer hover:underline">
														25 Abbas El Akkad St., Nasr city, Cairo, Egypt
													</td>
													<td className="px-4 py-4 text-[#1D7A8C] cursor-pointer hover:underline">
														Home
													</td>
													<td className="px-4 py-4 text-[#1D7A8C] cursor-pointer hover:underline">
														01-Mar-2025
													</td>
												</tr>
												<tr>
													<td className="px-4 py-4 text-gray-700">ahmed.old@mail.com</td>
													<td className="px-4 py-4 text-gray-700">01198765432</td>
													<td className="px-4 py-4 text-gray-700">
														12 El Tayaran St., Heliopolis Cairo, Egypt
													</td>
													<td className="px-4 py-4 text-gray-700">Home</td>
													<td className="px-4 py-4 text-gray-700">15-Jan-2022</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>

								{/* Emergency / Family Contacts */}
								<div className="bg-white rounded-2xl shadow-lg p-6">
									<h4 className="text-lg font-semibold text-[#1D7A8C] mb-6  pl-3">
										{t("profile.contacts.familyTitle")}
									</h4>
									<div className="overflow-x-auto">
										<table className="w-full text-sm">
											<thead className="bg-gray-50">
												<tr>
													<th className="text-left px-4 py-3 text-gray-600 font-semibold">
														{t("profile.contacts.table.name")}
													</th>
													<th className="text-left px-4 py-3 text-gray-600 font-semibold">
														{t("profile.contacts.table.phone")}
													</th>
													<th className="text-left px-4 py-3 text-gray-600 font-semibold">
														{t("profile.contacts.table.relationship")}
													</th>
													<th className="text-left px-4 py-3 text-gray-600 font-semibold">
														{t("profile.contacts.table.contactType")}
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-100">
												<tr>
													<td className="px-4 py-4 text-gray-700">Mona Ahmed</td>
													<td className="px-4 py-4 text-gray-700">01055544321</td>
													<td className="px-4 py-4 text-gray-700">Wife</td>
													<td className="px-4 py-4 text-gray-700">Family</td>
												</tr>
												<tr>
													<td className="px-4 py-4 text-gray-700">Ali Ahmed</td>
													<td className="px-4 py-4 text-gray-700">01233322111</td>
													<td className="px-4 py-4 text-gray-700">Brother</td>
													<td className="px-4 py-4 text-gray-700">Emergency</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</div>
						)}

						{activeTab === "qualifications" && (
							<div className="space-y-4">
								<div className="bg-white rounded-2xl shadow-lg p-6">
									<div className="overflow-x-auto">
										<table className="w-full text-sm">
											<thead className="bg-gray-50">
												<tr>
													<th className="text-left px-4 py-3 text-gray-600 font-semibold">
														{t("profile.qualifications.table.type")}
													</th>
													<th className="text-left px-4 py-3 text-gray-600 font-semibold">
														{t("profile.qualifications.table.qualification")}
													</th>
													<th className="text-left px-4 py-3 text-gray-600 font-semibold">
														{t("profile.qualifications.table.issuer")}
													</th>
													<th className="text-left px-4 py-3 text-gray-600 font-semibold">
														{t("profile.qualifications.table.year")}
													</th>
													<th className="text-left px-4 py-3 text-gray-600 font-semibold">
														{t("profile.qualifications.table.status")}
													</th>
													<th className="text-left px-4 py-3 text-gray-600 font-semibold">
														{t("profile.qualifications.table.action")}
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-gray-100">
												{QUALIFICATION_DATA.map((qual, index) => (
													<tr key={index}>
														<td className="px-4 py-4 text-gray-700">{qual.type}</td>
														<td className="px-4 py-4 text-gray-700">
															{qual.qualification}
														</td>
														<td className="px-4 py-4 text-gray-700">{qual.issuer}</td>
														<td className="px-4 py-4 text-gray-700">{qual.year}</td>
														<td className="px-4 py-4">
															{renderQualificationStatus(qual.status)}
														</td>
														<td className="px-4 py-4">
															<div className="flex items-center gap-2">
																<button
																	type="button"
																	className="p-1.5 text-gray-500 hover:text-[#1D7A8C] transition-colors"
																	title="View"
																>
																	<HiOutlineEye className="w-5 h-5" />
																</button>
																<button
																	type="button"
																	className="p-1.5 text-gray-500 hover:text-[#1D7A8C] transition-colors"
																	title="Edit"
																>
																	<HiOutlinePencilAlt className="w-5 h-5" />
																</button>
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>

								<div className="bg-white rounded-2xl shadow-lg p-4 flex items-center justify-end">
									<button
										type="button"
										onClick={() => setIsQualificationModalOpen(true)}
										className="px-4 py-2 text-sm font-medium text-[#1D7A8C] border border-[#1D7A8C] rounded-lg hover:bg-[#1D7A8C]/5 transition-colors"
									>
										{t("profile.qualifications.actions.add")}
									</button>
								</div>
							</div>
						)}

						{activeTab === "organization" && (
							<div className="space-y-6">
								<div className="bg-white rounded-2xl shadow-lg p-6">
									<h4 className="text-lg font-semibold text-[#1D7A8C] mb-3">
										{t("profile.organization.title")}
									</h4>
									<div className="h-px bg-gray-200 mb-6"></div>
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<label className="text-sm text-gray-500 font-normal">
												{t("profile.organization.fields.title")}
											</label>
											<p className="text-gray-800 font-bold">Organization</p>
										</div>
										<div className="flex items-center justify-between">
											<label className="text-sm text-gray-500 font-normal">
												{t("profile.organization.fields.businessGroup")}
											</label>
											<p className="text-gray-800 font-bold">Technology</p>
										</div>
										<div className="flex items-center justify-between">
											<label className="text-sm text-gray-500 font-normal">
												{t("profile.organization.fields.department")}
											</label>
											<p className="text-gray-800 font-bold">Software Development</p>
										</div>
										<div className="flex items-center justify-between">
											<label className="text-sm text-gray-500 font-normal">
												{t("profile.organization.fields.location")}
											</label>
											<p className="text-gray-800 font-bold">Head Office</p>
										</div>
										<div className="flex items-center justify-between">
											<label className="text-sm text-gray-500 font-normal">
												{t("profile.organization.fields.manager")}
											</label>
											<p className="text-gray-800 font-bold">Mohamed Hassan</p>
										</div>
									</div>
								</div>
							</div>
						)}
					</section>
				</div>
			</div>

			{/* View Assignment Modal */}
			<SlideUpModal
				isOpen={isViewAssignmentModalOpen}
				onClose={() => setIsViewAssignmentModalOpen(false)}
				title={t("profile.modals.viewAssignment")}
				maxWidth="560px"
			>
				{selectedAssignment && (
					<div className="py-4">
						<h4 className="text-lg font-semibold text-[#1D7A8C] mb-6 underline">
							{t("profile.modals.assignmentDetails")}
						</h4>
						<div className="space-y-4">
							<div className="mb-3">
								<p className="text-gray-800 font-medium text-base">{selectedAssignment.title}</p>
							</div>
							<div className="space-y-3">
								<div className="flex items-start gap-4">
									<label className="block text-sm text-gray-500 min-w-[140px]">
										{t("profile.assignment.fields.title")}
									</label>
									<p className="text-gray-800 font-medium">{selectedAssignment.title}</p>
								</div>
								<div className="flex items-start gap-4">
									<label className="block text-sm text-gray-500 min-w-[140px]">
										{t("profile.assignment.fields.assignmentType")}
									</label>
									<p className="text-gray-800 font-medium">{selectedAssignment.type}</p>
								</div>
								<div className="flex items-start gap-4">
									<label className="block text-sm text-gray-500 min-w-[140px]">
										{t("profile.assignment.fields.effectiveFrom")}
									</label>
									<p className="text-gray-800 font-medium">{selectedAssignment.effectiveFrom}</p>
								</div>
								<div className="flex items-start gap-4">
									<label className="block text-sm text-gray-500 min-w-[140px]">
										{t("profile.assignment.fields.assignmentStatus")}
									</label>
									{renderStatusBadge(selectedAssignment.status)}
								</div>
							</div>
						</div>
					</div>
				)}
				<div className="flex items-center justify-end gap-3 py-4 border-t border-gray-200 mt-4">
					<Button
						onClick={() => setIsViewAssignmentModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none"
					/>
				</div>
			</SlideUpModal>

			{/* Edit Assignment Modal */}
			<SlideUpModal
				isOpen={isEditAssignmentModalOpen}
				onClose={() => setIsEditAssignmentModalOpen(false)}
				title={t("profile.modals.editAssignment")}
				maxWidth="560px"
			>
				<div className="py-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("profile.assignment.fields.title")}
							name="title"
							value={editAssignmentForm.title}
							onChange={e => setEditAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
						/>
						<FloatingLabelSelect
							label={t("profile.assignment.fields.assignmentType")}
							name="assignmentType"
							value={editAssignmentForm.type}
							onChange={e => setEditAssignmentForm(prev => ({ ...prev, type: e.target.value }))}
							options={assignmentTypeOptions}
						/>
						<FloatingLabelInput
							label={t("profile.assignment.fields.effectiveFrom")}
							name="effectiveFrom"
							type="date"
							value={editAssignmentForm.effectiveFrom}
							onChange={e => setEditAssignmentForm(prev => ({ ...prev, effectiveFrom: e.target.value }))}
						/>
						<div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
							<label className="text-sm text-gray-600">{t("profile.assignment.fields.status")}</label>
							<Toggle
								enabled={editAssignmentForm.status === true || editAssignmentForm.status === "active"}
								onChange={enabled => setEditAssignmentForm(prev => ({ ...prev, status: enabled }))}
							/>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-end gap-3 py-4 border-t border-gray-200 mt-4">
					<Button
						onClick={() => setIsEditAssignmentModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none"
					/>
					<Button
						onClick={() => setIsEditAssignmentModalOpen(false)}
						title={t("common.edit")}
						className="shadow-none"
					/>
				</div>
			</SlideUpModal>

			<SlideUpModal
				isOpen={isQualificationModalOpen}
				onClose={() => setIsQualificationModalOpen(false)}
				title={t("profile.modals.addQualification")}
				maxWidth="760px"
			>
				<div className="py-4 space-y-6">
					{/* Basic Information Section */}
					<div>
						<h4 className="text-base font-bold text-black mb-6  pl-3 flex items-center gap-2 uppercase">
							<HiOutlineBookmark className="w-5 h-5 text-[#1D7A8C]" />
							{t("profile.qualifications.sections.basicInfo")}
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={`${t("profile.qualifications.fields.qualificationTitle")} *`}
								name="qualificationTitle"
								value={qualificationForm.qualificationTitle}
								onChange={handleQualificationChange}
								options={[
									{ value: "", label: `${t("profile.qualifications.fields.qualificationTitle")} *` },
								]}
								required
							/>
							<FloatingLabelSelect
								label={`${t("profile.qualifications.fields.qualificationType")}`}
								name="qualificationType"
								value={qualificationForm.qualificationType}
								onChange={handleQualificationChange}
								options={qualificationTypeOptions}
								required
							/>
							<div className="flex items-center justify-between bg-gray-50 rounded-xl px-2 border border-gray-200">
								<label className="text-sm text-gray-600 font-medium">
									{t("profile.qualifications.fields.status")} <span className="text-red-400">*</span>
								</label>
								<Toggle
									enabled={qualificationForm.status === true}
									onChange={enabled => setQualificationForm(prev => ({ ...prev, status: enabled }))}
									className="py-2"
								/>
							</div>
							<FloatingLabelInput
								label={t("profile.qualifications.fields.titleIfOthers")}
								name="titleOther"
								value={qualificationForm.titleOther || ""}
								onChange={handleQualificationChange}
							/>
							<FloatingLabelInput
								label={t("profile.qualifications.fields.gradeScore")}
								name="gradeScore"
								value={qualificationForm.gradeScore || ""}
								onChange={handleQualificationChange}
							/>
							<FloatingLabelInput
								label={t("profile.qualifications.fields.awardingEntity")}
								name="awardingEntity"
								value={qualificationForm.awardingEntity}
								onChange={handleQualificationChange}
							/>
						</div>
					</div>

					{/* Timeline & Progress Section */}
					<div>
						<h4 className="text-base font-bold text-black mb-6  pl-3 flex items-center gap-2 uppercase ">
							<HiOutlineBookmark className="w-5 h-5 text-[#1D7A8C]" />
							{t("profile.qualifications.sections.timeline")}
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FloatingLabelInput
								label={t("profile.qualifications.fields.studyStartDate")}
								name="studyStartDate"
								type="date"
								value={qualificationForm.studyStartDate || ""}
								onChange={handleQualificationChange}
							/>
							<FloatingLabelInput
								label={t("profile.qualifications.fields.studyEndDate")}
								name="studyEndDate"
								type="date"
								value={qualificationForm.studyEndDate || ""}
								onChange={handleQualificationChange}
							/>
							<FloatingLabelInput
								label={t("profile.qualifications.fields.awardedDate")}
								name="awardedDate"
								type="date"
								value={qualificationForm.awardedDate || ""}
								onChange={handleQualificationChange}
							/>
							<FloatingLabelInput
								label={t("profile.qualifications.fields.projectedCompletion")}
								name="projectedCompletion"
								type="date"
								value={qualificationForm.projectedCompletion || ""}
								onChange={handleQualificationChange}
							/>
						</div>
					</div>

					{/* Competencies Section */}
					<div>
						<button
							type="button"
							onClick={() => setIsCompetenciesOpen(!isCompetenciesOpen)}
							className="w-full flex items-center justify-between text-lg font-semibold text-[#1D7A8C] mb-6  pl-3 pr-2"
						>
							<span className="flex items-center gap-2">
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
									/>
								</svg>
								{t("profile.qualifications.sections.competencies")}
							</span>
							<HiOutlineChevronDown
								className={`w-5 h-5 transition-transform ${isCompetenciesOpen ? "rotate-180" : ""}`}
							/>
						</button>
						{isCompetenciesOpen && (
							<div className="relative" ref={levelDropdownRef}>
								{/* Competencies List */}
								<div className="space-y-2 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg p-4">
									{competencies.map(comp => (
										<div key={comp.id} className="flex items-center justify-between p-2 relative">
											<div className="flex items-center gap-2 flex-1">
												<span className="w-2 h-2 rounded-full bg-green-500"></span>
												<span className="text-sm text-gray-700">{comp.name}</span>
											</div>
											<div className="flex items-center gap-1 relative">
												<button
													type="button"
													onClick={e => {
														e.stopPropagation();
														const newSelected = !comp.selected;
														setCompetencies(prev =>
															prev.map(c =>
																c.id === comp.id
																	? {
																			...c,
																			selected: newSelected,
																			level: newSelected ? c.level || "" : "",
																	  }
																	: c
															)
														);
														if (!newSelected && activeLevelDropdown === comp.id) {
															setActiveLevelDropdown(null);
														}
													}}
													className={`p-1 rounded transition-colors ${
														comp.selected ? "text-[#1D7A8C]" : "text-gray-400"
													}`}
												>
													<HiOutlineCheck className="w-5 h-5" />
												</button>
												<button
													type="button"
													onClick={e => {
														e.stopPropagation();
														if (comp.selected) {
															setActiveLevelDropdown(
																activeLevelDropdown === comp.id ? null : comp.id
															);
														}
													}}
													className={`p-1 rounded transition-colors ${
														comp.selected
															? "text-[#1D7A8C]"
															: "text-gray-300 cursor-not-allowed"
													}`}
													disabled={!comp.selected}
												>
													<HiOutlineChevronDown
														className={`w-4 h-4 ${comp.selected ? "" : "opacity-50"}`}
													/>
												</button>

												{/* Level Selection Popover */}
												{activeLevelDropdown === comp.id && comp.selected && (
													<div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[140px]">
														<div className="space-y-1">
															{["Beginner", "Intermediate", "Advanced"].map(level => {
																const levelLower = level.toLowerCase();
																const isSelected = comp.level === levelLower;
																return (
																	<button
																		key={level}
																		type="button"
																		onClick={e => {
																			e.stopPropagation();
																			handleCompetencyLevelChange(
																				comp.id,
																				levelLower
																			);
																			setActiveLevelDropdown(null);
																		}}
																		className={`w-full text-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
																			isSelected
																				? levelLower === "beginner"
																					? "bg-orange-100 text-orange-600"
																					: levelLower === "intermediate"
																					? "bg-blue-100 text-blue-600"
																					: "bg-green-100 text-green-700"
																				: levelLower === "beginner"
																				? "bg-orange-100 text-orange-600 hover:bg-orange-200"
																				: levelLower === "intermediate"
																				? "bg-blue-100 text-blue-600 hover:bg-blue-200"
																				: "bg-green-100 text-green-700 hover:bg-green-200"
																		}`}
																	>
																		{level}
																	</button>
																);
															})}
														</div>
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Completion Percentage Section */}
					<div>
						<h4 className="text-lg font-semibold text-[#1D7A8C] mb-6  pl-3">
							{t("profile.qualifications.sections.completion")}
						</h4>
						<div className="flex items-center gap-4">
							<input
								type="range"
								min="0"
								max="100"
								value={qualificationForm.completionPercentage || 0}
								onChange={e =>
									setQualificationForm(prev => ({
										...prev,
										completionPercentage: parseInt(e.target.value),
									}))
								}
								className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1D7A8C]"
							/>
							<span className="text-lg font-semibold text-[#1D7A8C] min-w-[60px] text-right">
								{qualificationForm.completionPercentage || 0}%
							</span>
						</div>
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
