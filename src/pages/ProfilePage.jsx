import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";
import {
	HiOutlineUser,
	HiOutlineEye,
	HiOutlinePencilAlt,
	HiOutlineChevronDown,
	HiOutlineCheck,
	HiOutlineBookmark,
} from "react-icons/hi";
import ProfileIcon from "../assets/profile.svg?react";
import CustomTable from "../components/shared/CustomTable";
import PageHeader from "../components/shared/PageHeader";
import Button from "../components/shared/Button";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import SlideUpModal from "../components/shared/SlideUpModal";
import Toggle from "../components/shared/Toggle";
import Table from "../components/shared/Table";
import userImage from "../assets/userimage.png";

// Slices
import { fetchAddresses, createAddress, updateAddress } from "../store/addressesSlice";
import { fetchLookupValues } from "../store/lookupsSlice";

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

const CONTACTS_DATA = [
	{
		id: 1,
		email: "ahmed@company.com",
		phone: "01012345678",
		address: "25 Abbas El Akkad St., Nasr city, Cairo, Egypt",
		addressType: "Home",
		lastUpdate: "2025-03-01",
	},
	{
		id: 2,
		email: "ahmed.old@mail.com",
		phone: "01198765432",
		address: "12 El Tayaran St., Heliopolis Cairo, Egypt",
		addressType: "Home",
		lastUpdate: "2022-01-15",
	},
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
	usePageTitle(t("profile.title"));

	// State for profile data
	const [activeTab, setActiveTab] = useState("general");
	const [isViewProfileModalOpen, setIsViewProfileModalOpen] = useState(false);
	const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

	// Selectors
	const { addresses, loading: loadingAddresses } = useSelector(state => state.addresses);
	const { lookupValues } = useSelector(state => state.lookups);

	// Local lookups state derived from Redux
	const [localLookups, setLocalLookups] = useState({
		addressTypes: [],
		countries: [],
		cities: [],
	});

	// build addresstypes options to use it at its floating select
	const addressTypeOptions = useMemo(() => {
		return (lookupValues?.ADDRESS_TYPE || []).map((item) => ({
			value: item.id,
			label: item.name,
		}));
	}, [lookupValues]);

	const countriesTypeOptions = useMemo(() => {
		console.log("test here",lookupValues);
		return (lookupValues?.COUNTRY || []).map((item) => ({
			value: item.id,
			label: item.name,
		}));

	}, [lookupValues]);

	const citiesTypeOptions = useMemo(() => {
		return (lookupValues?.CITY || []).map((item) => ({
			value: item.id,
			label: item.name,
		}));
	}, [lookupValues]);


	const PERSON_ID = 4; // Hardcoded for now

	const [profileForm, setProfileForm] = useState({
		firstNameEn: "Ahmed",
		middleNameEn: "Mohamed",
		lastNameEn: "Ali",
		gender: "male",
		maritalStatus: "single",
		firstNameAr: "أحمد",
		middleNameAr: "محمد",
		lastNameAr: "علي",
		address: "12 El Tayaran St.,Heliopolis, Cairo, Egypt",
		addressType: "Home",
	});

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

	// Qualification modals
	const [isQualificationModalOpen, setIsQualificationModalOpen] = useState(false);
	const [isViewQualificationModalOpen, setIsViewQualificationModalOpen] = useState(false);
	const [isEditQualificationModalOpen, setIsEditQualificationModalOpen] = useState(false);
	const [selectedQualification, setSelectedQualification] = useState(null);
	const [qualificationForm, setQualificationForm] = useState(QUALIFICATION_INITIAL_STATE);
	const [competencies, setCompetencies] = useState(COMPETENCIES_LIST);
	const [isCompetenciesOpen, setIsCompetenciesOpen] = useState(false);

	// Address Modals
	const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
	const [isEditAddressModalOpen, setIsEditAddressModalOpen] = useState(false);
	const [selectedAddress, setSelectedAddress] = useState(null);
	const [addressForm, setAddressForm] = useState({
		addressId: null,
		email: "",
		isEmailMain: false,
		phone: "",
		isPhoneMain: false,
		address: "",
		isAddressMain: false,
		addressType: "",
		isAddressTypeMain: false,
		countryId: "",
		cityId: "",
		lastUpdate: "",
		isLastUpdateMain: false,
	});

	// Emergency Modals
	const [isAddEmergencyModalOpen, setIsAddEmergencyModalOpen] = useState(false);
	const [isEditEmergencyModalOpen, setIsEditEmergencyModalOpen] = useState(false);
	const [selectedEmergency, setSelectedEmergency] = useState(null);
	const [emergencyForm, setEmergencyForm] = useState({
		name: "",
		phone: "",
		relationship: "",
		contactType: "",
	});

	const [activeLevelDropdown, setActiveLevelDropdown] = useState(null);
	const levelDropdownRef = React.useRef(null);


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
		{ id: "general", label: t("profile.tabs.general") },
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

	const handleViewQualification = qualification => {
		setSelectedQualification(qualification);
		setIsViewQualificationModalOpen(true);
	};

	const handleEditQualification = qualification => {
		setSelectedQualification(qualification);
		setQualificationForm(prev => ({
			...prev,
			qualificationTitle: qualification.qualification,
			qualificationType: qualification.type.toLowerCase(),
			status: qualification.status === "valid" || qualification.status === "active",
			gradeScore: "",
			awardingEntity: qualification.issuer,
		}));
		setIsEditQualificationModalOpen(true);
	};

	const handleAddAddress = () => {
		setAddressForm({
			email: "",
			isEmailMain: false,
			phone: "",
			isPhoneMain: false,
			address: "",
			isAddressMain: false,
			addressType: "",
			isAddressTypeMain: false,
			lastUpdate: "",
			isLastUpdateMain: false,
		});
		setIsAddAddressModalOpen(true);
	};


	const handleAddEmergency = () => {
		setEmergencyForm({
			name: "",
			phone: "",
			relationship: "",
			contactType: "",
		});
		setIsAddEmergencyModalOpen(true);
	};

	const handleEditEmergency = contact => {
		setSelectedEmergency(contact);
		// Note: The hardcoded data 'CONTACTS_DATA' has structure issues (layout in original code vs simple array). 
		// Assuming we map correctly in render.
		// For now simple mapping:
		setEmergencyForm({
			name: contact.name || "Mona Ahmed", // fallback as data might be mocked/hardcoded in render
			phone: contact.phone || "01055544321",
			relationship: contact.relationship || "Wife",
			contactType: contact.contactType || "Family",
		});
		setIsEditEmergencyModalOpen(true);
	};

	const renderStatusBadge = status => {
		const isActive = status === "active";
		return (
			<span
				className={`px-3 py-1 rounded-full text-xs font-semibold ${isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
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

	const latestContactId = useMemo(() => {
		if (!CONTACTS_DATA.length) return null;

		return CONTACTS_DATA.reduce((latest, contact) => {
			const currentTime = new Date(contact.lastUpdate).getTime();

			if (!latest) {
				return contact;
			}

			const latestTime = new Date(latest.lastUpdate).getTime();
			return currentTime > latestTime ? contact : latest;
		}, null)?.id;
	}, []);

	useEffect(() => {
		// Fetch Addresses
		if (PERSON_ID) {
			dispatch(fetchAddresses(PERSON_ID));
		}

		// Fetch initial Lookups
		dispatch(fetchLookupValues({ lookupType: "ADDRESS_TYPE" }));
		dispatch(fetchLookupValues({ lookupType: "COUNTRY" }));
	}, [dispatch, PERSON_ID]);

	// Sync Redux lookup values to local state for easier usage (optional, but requested in plan)
	useEffect(() => {
		if (lookupValues) {
			setLocalLookups(prev => ({
				...prev,
				addressTypes: lookupValues["ADDRESS_TYPE"] || [],
				countries: lookupValues["COUNTRY"] || [],
				cities: lookupValues["CITY"] || [],
			}));
		}
	}, [lookupValues]);

	useEffect(() => {
		console.log(localLookups);
	}, [localLookups]);

	// Fetch Cities when Country changes
	// Fetch Cities when Country changes
	const handleCountryChange = (countryId) => {
		setAddressForm(prev => ({ ...prev, countryId, cityId: "" })); // Reset city when country changes
		if (countryId) {
			dispatch(fetchLookupValues({ lookupType: "CITY", parent: countryId }));
		} else {
			setLocalLookups(prev => ({ ...prev, cities: [] }));
		}
	};

	const handleAddAddressSubmit = async () => {
		const payload = {
			person: PERSON_ID,
			address_type: addressForm.addressType,
			country: addressForm.countryId,
			city: addressForm.cityId,
			street: addressForm.address,
			email: addressForm.email,
			phone: addressForm.phone,
			is_primary: addressForm.isAddressMain,
			// Add other fields as needed by backend
		};
		const result = await dispatch(createAddress(payload));
		if (createAddress.fulfilled.match(result)) {
			setIsAddAddressModalOpen(false);
			// Reset form handled by opening
		}
	};

	const handleEditAddressSubmit = async () => {
		const payload = {
			person: PERSON_ID, // Might be needed for validation
			address_type: addressForm.addressType,
			country: addressForm.countryId,
			city: addressForm.cityId,
			street: addressForm.address,
			email: addressForm.email,
			phone: addressForm.phone,
			is_primary: addressForm.isAddressMain,
		};
		const result = await dispatch(updateAddress({ id: addressForm.addressId, data: payload }));
		if (updateAddress.fulfilled.match(result)) {
			setIsEditAddressModalOpen(false);
		}
	};

	const openAddAddressModal = () => {
		setAddressForm({
			addressId: null,
			email: "", isEmailMain: false,
			phone: "", isPhoneMain: false,
			address: "", isAddressMain: false,
			addressType: "", isAddressTypeMain: false,
			countryId: "", cityId: "",
			lastUpdate: "", isLastUpdateMain: false,
		});
		setIsAddAddressModalOpen(true);
	};

	const handleEditAddress = (row) => {
		setAddressForm({
			addressId: row.id,
			email: row.email || "",
			isEmailMain: row.is_primary || false, // Assuming mapping
			phone: row.phone || "",
			address: row.street || "",
			addressType: row.address_type?.id || row.address_type, // Handle object or ID
			countryId: row.country?.id || row.country,
			cityId: row.city?.id || row.city,
			lastUpdate: row.updated_at ? row.updated_at.split('T')[0] : "",
		});
		if (row.country?.id || row.country) {
			dispatch(fetchLookupValues({ lookupType: "CITY", parent: row.country?.id || row.country }));
		}
		setIsEditAddressModalOpen(true);
	};

	const formatContactDate = dateString => {
		if (!dateString) return "";
		const date = new Date(dateString);
		if (Number.isNaN(date.getTime())) return dateString;

		return date
			.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			})
			.replace(/ /g, "-");
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<PageHeader
				icon={<ProfileIcon className="w-8 h-8 text-[#D3D3D3]" />}
				title={t("profile.title")}
				subtitle={t("profile.subtitle")}
			/>

			<div className="px-6 py-8">
				<div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-6">
					{/* Personal Information Sidebar */}
					<aside className="bg-white rounded-2xl shadow-lg p-4">
						<h3 className="text-lg font-semibold text-[#1D7A8C]">{t("profile.personalInformation")}</h3>
						<div className="mt-4 flex items-center justify-center">
							<img src={userImage} alt="Ahmed Ali" className="w-60 h-50  rounded-lg object-cover" />
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
												className={`flex items-center gap-3 pb-2 border-b-2 transition-colors whitespace-nowrap ${isActive
													? "border-[#1D7A8C] text-[#1D7A8C]"
													: "border-transparent text-gray-500 hover:text-gray-700"
													}`}
											>
												<span
													className={`w-2 h-2 rounded-full ${isActive ? "bg-[#1D7A8C]" : "bg-gray-300"
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

						{activeTab === "general" && (
							<div className="space-y-6">
								{/* Personal Information (English) */}
								<div className="bg-white rounded-2xl shadow-lg p-6">

									<CustomTable
										title={t("profile.general.personalInfoEn")}
										className="shadow-none"
										columns={[
											{
												header: t("profile.general.labels.firstNameEn"),
												accessor: "firstNameEn",
												render: value => <span className="text-sm text-gray-700">{value}</span>,
											},
											{
												header: t("profile.general.labels.middleNameEn"),
												accessor: "middleNameEn",
												render: value => <span className="text-sm text-gray-700">{value}</span>,
											},
											{
												header: t("profile.general.labels.lastNameEn"),
												accessor: "lastNameEn",
												render: value => <span className="text-sm text-gray-700">{value}</span>,
											},
											{
												header: t("profile.general.fields.gender"),
												accessor: "gender",
												render: value => (
													<span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
														{value === "male" ? "Male" : "Female"}
													</span>
												),
											},
											{
												header: t("profile.general.fields.maritalStatus"),
												accessor: "maritalStatus",
												render: value => (
													<span className="text-sm text-gray-700">
														{value.charAt(0).toUpperCase() + value.slice(1)}
													</span>
												),
											},
										]}
										data={[profileForm]}
									/>
								</div>

								{/* Personal Information (Arabic) */}
								<div className="bg-white rounded-2xl shadow-lg p-6">

									<div dir="rtl">
										<CustomTable
											title=
											{t("profile.general.personalInfoAr")}
											className="shadow-none"
											columns={[
												{
													header: t("profile.general.labels.firstNameAr"),
													accessor: "firstNameAr",
													render: value => <span className="text-sm text-gray-700">{value}</span>,
												},
												{
													header: t("profile.general.labels.middleNameAr"),
													accessor: "middleNameAr",
													render: value => <span className="text-sm text-gray-700">{value}</span>,
												},
												{
													header: t("profile.general.labels.lastNameAr"),
													accessor: "lastNameAr",
													render: value => <span className="text-sm text-gray-700">{value}</span>,
												},
											]}
											data={[profileForm]}
										/>
									</div>
								</div>

								{/* Address */}
								<div className="bg-white rounded-2xl shadow-lg p-6">

									<CustomTable
										title={t("profile.general.address")}
										className="shadow-none"
										columns={[
											{
												header: t("profile.general.fields.address"),
												accessor: "address",
												render: value => <span className="text-sm text-gray-700">{value}</span>,
											},
											{
												header: t("profile.general.fields.addressType"),
												accessor: "addressType",
												render: value => <span className="text-sm text-gray-700">{value}</span>,
											},
										]}
										data={[profileForm]}
									/>
								</div>

								<div className="flex justify-end gap-3 mt-6">
									<Button
										onClick={() => setIsViewProfileModalOpen(true)}
										title={t("common.view")}
										className="bg-white text-[#1D7A8C] border border-[#1D7A8C] hover:bg-gray-50"
									/>
									<Button
										onClick={() => setIsEditProfileModalOpen(true)}
										title={t("profile.modals.editAssignment").replace("Assignment", "Profile")}
									/>
								</div>
							</div>
						)}

						{activeTab === "assignment" && (
							<div className="bg-white rounded-2xl shadow-lg p-6">

								<CustomTable
									title={t("profile.assignment.detailsTitle")}
									className="shadow-none"
									columns={[
										{
											header: t("profile.assignment.fields.title"),
											accessor: "title",
											render: value => <span className="text-gray-700">{value}</span>,
										},
										{
											header: t("profile.assignment.fields.assignmentType"),
											accessor: "type",
											render: value => <span className="text-gray-700">{value}</span>,
										},
										{
											header: t("profile.assignment.fields.effectiveFrom"),
											accessor: "effectiveFrom",
											render: value => <span className="text-gray-700">{value}</span>,
										},
										{
											header: t("profile.status"),
											accessor: "status",
											render: value => renderStatusBadge(value),
										},
									]}
									data={ASSIGNMENT_DATA}
									onView={handleViewAssignment}
									onEdit={handleEditAssignment}
								/>
							</div>
						)}

						{activeTab === "contacts" && (
							<div className="space-y-6">
								{/* Address & Communication */}
								<div className="bg-transparent rounded-2xl shadow-sm pb-6">
									<div className="overflow-x-auto">
										<CustomTable
											title={t("profile.contacts.addressTitle")}
											className="shadow-none rounded-none"
											hasLatestVersion={true}
											isClosed={false}
											columns={[
												{
													header: t("profile.contacts.table.email"),
													accessor: "email", // Use "email" if available, dynamically fetched data doesn't seem to have email in the example?
													render: value => <span>{value || "N/A"}</span>,
												},
												{
													header: t("profile.contacts.table.phone"),
													accessor: "phone", // Same for phone
													render: value => <span>{value || "N/A"}</span>,
												},
												{
													header: t("profile.contacts.table.address"),
													accessor: "street", // Mapped from "street"
													render: (_, row) => (
														<span className="text-gray-700">
															{row.street}
															{row.city_name && `, ${row.city_name}`}
															{row.country_name && `, ${row.country_name}`}
														</span>
													),
												},
												{
													header: t("profile.contacts.table.addressType"),
													accessor: "address_type_name",
													render: value => <span>{value}</span>,
												},
												{
													header: t("profile.contacts.table.lastUpdate"),
													accessor: "updated_at",
													render: value => (
														<span className="text-gray-700">
															{formatContactDate(value)}
														</span>
													),
												},
												{
													header: t("profile.contacts.table.action"),
													accessor: "action",
													render: (_, row) => (
														<button
															onClick={() => handleEditAddress(row)}
															className="text-gray-400 hover:text-gray-600 p-1"
														>
															<HiOutlinePencilAlt className="w-5 h-5" />
														</button>
													),
												},
											]}
											data={addresses}
											emptyMessage={loadingAddresses ? "Loading..." : "No addresses found"}
										/>
									</div>
									<div className="flex justify-end pr-6 mt-4">
										<Button
											onClick={openAddAddressModal}
											title={t("common.add")}
											className="bg-white text-[#1D7A8C] border border-[#1D7A8C] hover:bg-gray-50 px-6"
										/>
									</div>
								</div>

								{/* Emergency / Family Contacts */}
								<div className="bg-transparent rounded-2xl pb-6 shadow-lg">
									<CustomTable
										title={t("profile.contacts.familyTitle")}
										className="shadow-none rounded-none"
										hasLatestVersion={false}
										isClosed={false}
										columns={[
											{
												header: t("profile.contacts.table.name"),
												accessor: "name",
												render: value => <span className="text-gray-700">{value}</span>,
											},
											{
												header: t("profile.contacts.table.phone"),
												accessor: "phone",
												render: value => <span className="text-gray-700">{value}</span>,
											},
											{
												header: t("profile.contacts.table.relationship"),
												accessor: "relationship",
												render: value => <span className="text-gray-700">{value}</span>,
											},
											{
												header: t("profile.contacts.table.contactType"),
												accessor: "contactType",
												render: value => <span className="text-gray-700">{value}</span>,
											},
											{
												header: t("profile.contacts.table.action"),
												accessor: "action",
												render: (_, row) => (
													<button
														onClick={() => handleEditEmergency(row)}
														className="text-gray-400 hover:text-gray-600 p-1"
													>
														<HiOutlinePencilAlt className="w-5 h-5" />
													</button>
												),
											},
										]}
										data={[
											{
												id: 1,
												name: "Mona Ahmed",
												phone: "01055544321",
												relationship: "Wife",
												contactType: "Family",
											},
											{
												id: 2,
												name: "Ali Ahmed",
												phone: "01233322111",
												relationship: "Brother",
												contactType: "Emergency",
											},
										]}
									/>
									<div className="flex justify-end pr-6 mt-4">
										<Button
											onClick={handleAddEmergency}
											title={t("common.add")}
											className="bg-white text-[#1D7A8C] border border-[#1D7A8C] hover:bg-gray-50 px-6"
										/>
									</div>
								</div>
							</div>
						)}

						{activeTab === "qualifications" && (
							<div className="space-y-4">
								<div className="bg-white rounded-2xl shadow-lg p-6">
									<CustomTable
										className="shadow-none"
										title={t("profile.qualifications.title")}
										columns={[
											{
												header: t("profile.qualifications.table.type"),
												accessor: "type",
												render: value => <span className="text-sm text-gray-700">{value}</span>,
											},
											{
												header: t("profile.qualifications.table.qualification"),
												accessor: "qualification",
												render: value => <span className="text-sm text-gray-700">{value}</span>,
											},
											{
												header: t("profile.qualifications.table.issuer"),
												accessor: "issuer",
												render: value => <span className="text-sm text-gray-700">{value}</span>,
											},
											{
												header: t("profile.qualifications.table.year"),
												accessor: "year",
												render: value => <span className="text-sm text-gray-700">{value}</span>,
											},
											{
												header: t("profile.qualifications.table.status"),
												accessor: "status",
												render: value => renderQualificationStatus(value),
											},
										]}
										data={QUALIFICATION_DATA}
										onView={handleViewQualification}
										onEdit={handleEditQualification}
									/>
								</div>

								<div className="bg-white rounded-2xl shadow-lg p-4 flex items-center justify-end">
									<Button
										onClick={() => setIsQualificationModalOpen(true)}
										title={t("profile.qualifications.actions.add")}
									/>
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

			{/* View Profile Modal */}
			<SlideUpModal
				isOpen={isViewProfileModalOpen}
				onClose={() => setIsViewProfileModalOpen(false)}
				title={t("common.view") + " Profile"}
				maxWidth="760px"
			>
				<div className="py-6 space-y-6">
					<div>
						<h4 className="text-base font-semibold text-[#1D7A8C] mb-4">
							{t("profile.general.personalInfoEn")}
						</h4>
						<div className="border-t border-gray-200 pt-4 space-y-3">
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">{t("profile.general.fields.firstName")}</span>
								<span className="text-sm font-medium text-gray-900">{profileForm.firstNameEn}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">{t("profile.general.fields.middleName")}</span>
								<span className="text-sm font-medium text-gray-900">{profileForm.middleNameEn}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">{t("profile.general.fields.lastName")}</span>
								<span className="text-sm font-medium text-gray-900">{profileForm.lastNameEn}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">{t("profile.general.fields.gender")}</span>
								<span className="text-sm font-medium text-[#1D7A8C] uppercase">{profileForm.gender}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">{t("profile.general.fields.maritalStatus")}</span>
								<span className="text-sm font-medium text-[#1D7A8C]">
									{profileForm.maritalStatus.charAt(0).toUpperCase() + profileForm.maritalStatus.slice(1)}
								</span>
							</div>
						</div>
					</div>

					<div>
						<h4 className="text-base font-semibold text-[#1D7A8C] mb-4">
							{t("profile.general.personalInfoAr")}
						</h4>
						<div className="border-t border-gray-200 pt-4 space-y-3" dir="rtl">
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">{t("profile.general.labels.firstNameAr")}</span>
								<span className="text-sm font-medium text-gray-900">{profileForm.firstNameAr}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">{t("profile.general.labels.middleNameAr")}</span>
								<span className="text-sm font-medium text-gray-900">{profileForm.middleNameAr}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">{t("profile.general.labels.lastNameAr")}</span>
								<span className="text-sm font-medium text-gray-900">{profileForm.lastNameAr}</span>
							</div>
						</div>
					</div>

					<div>
						<h4 className="text-base font-semibold text-[#1D7A8C] mb-4">
							{t("profile.general.address")}
						</h4>
						<div className="border-t border-gray-200 pt-4 space-y-3">
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">{t("profile.general.fields.address")}</span>
								<span className="text-sm font-medium text-gray-900">{profileForm.address}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-500">{t("profile.general.fields.addressType")}</span>
								<span className="text-sm font-medium text-gray-900">{profileForm.addressType}</span>
							</div>
						</div>
					</div>
				</div>
				<div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
					<Button
						onClick={() => setIsViewProfileModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
				</div>
			</SlideUpModal>

			{/* Edit Profile Modal */}
			<SlideUpModal
				isOpen={isEditProfileModalOpen}
				onClose={() => setIsEditProfileModalOpen(false)}
				title="Edit Profile"
				maxWidth="760px"
			>
				<div className="py-6 space-y-6">
					<div>
						<h4 className="text-sm font-bold text-gray-700 uppercase mb-4">
							{t("profile.general.personalInfoEn").toUpperCase()}
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("profile.general.fields.firstName")}
								value={profileForm.firstNameEn}
								onChange={e => setProfileForm(prev => ({ ...prev, firstNameEn: e.target.value }))}
							/>
							<FloatingLabelInput
								label={t("profile.general.fields.middleName")}
								value={profileForm.middleNameEn}
								onChange={e => setProfileForm(prev => ({ ...prev, middleNameEn: e.target.value }))}
							/>
							<FloatingLabelInput
								label={t("profile.general.fields.lastName")}
								className="md:col-span-2"
								value={profileForm.lastNameEn}
								onChange={e => setProfileForm(prev => ({ ...prev, lastNameEn: e.target.value }))}
							/>
							<FloatingLabelSelect
								label={t("profile.general.fields.gender")}
								value={profileForm.gender}
								onChange={e => setProfileForm(prev => ({ ...prev, gender: e.target.value }))}
								options={[
									{ value: "male", label: "Male" },
									{ value: "female", label: "Female" },
								]}
							/>
							<FloatingLabelSelect
								label={t("profile.general.fields.maritalStatus")}
								value={profileForm.maritalStatus}
								onChange={e => setProfileForm(prev => ({ ...prev, maritalStatus: e.target.value }))}
								options={[
									{ value: "single", label: "Single" },
									{ value: "married", label: "Married" },
								]}
							/>
						</div>
					</div>

					<div>
						<h4 className="text-sm font-bold text-gray-700 uppercase mb-4">
							{t("profile.general.personalInfoAr").toUpperCase()}
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
							<FloatingLabelInput
								label={t("profile.general.labels.firstNameAr")}
								value={profileForm.firstNameAr}
								onChange={e => setProfileForm(prev => ({ ...prev, firstNameAr: e.target.value }))}
							/>
							<FloatingLabelInput
								label={t("profile.general.labels.middleNameAr")}
								value={profileForm.middleNameAr}
								onChange={e => setProfileForm(prev => ({ ...prev, middleNameAr: e.target.value }))}
							/>
							<FloatingLabelInput
								label={t("profile.general.labels.lastNameAr")}
								className="md:col-span-2"
								value={profileForm.lastNameAr}
								onChange={e => setProfileForm(prev => ({ ...prev, lastNameAr: e.target.value }))}
							/>
						</div>
					</div>

					<div>
						<h4 className="text-sm font-bold text-gray-700 uppercase mb-4">
							{t("profile.general.address").toUpperCase()}
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("profile.general.fields.address")}
								value={profileForm.address}
								onChange={e => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
							/>
							<FloatingLabelSelect
								label={t("profile.general.fields.addressType")}
								value={profileForm.addressType}
								onChange={e => setProfileForm(prev => ({ ...prev, addressType: e.target.value }))}
								options={[
									{ value: "Home", label: "Home" },
									{ value: "Office", label: "Office" },
								]}
							/>
						</div>
					</div>
				</div>
				<div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
					<Button
						onClick={() => setIsEditProfileModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
					<Button
						onClick={() => setIsEditProfileModalOpen(false)}
						title={t("common.edit")}
					/>
				</div>
			</SlideUpModal>

			{/* View Assignment Modal */}
			<SlideUpModal
				isOpen={isViewAssignmentModalOpen}
				onClose={() => setIsViewAssignmentModalOpen(false)}
				title={t("profile.modals.viewAssignment")}
				maxWidth="560px"
			>
				{selectedAssignment && (
					<div className="py-6">
						<h4 className="text-base font-semibold text-[#1D7A8C] mb-4">
							{t("profile.modals.assignmentDetails")}
						</h4>
						<div className="border-t border-gray-200 pt-4 space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">{t("profile.assignment.fields.title")}</span>
								<span className="text-sm font-medium text-gray-900">{selectedAssignment.title}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">
									{t("profile.assignment.fields.assignmentType")}
								</span>
								<span className="text-sm font-medium text-gray-900">{selectedAssignment.type}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">
									{t("profile.assignment.fields.effectiveFrom")}
								</span>
								<span className="text-sm font-medium text-gray-900">
									{selectedAssignment.effectiveFrom}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">
									{t("profile.assignment.fields.assignmentStatus")}
								</span>
								{renderStatusBadge(selectedAssignment.status)}
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
				<div className="py-6 space-y-4">
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
					</div>
					<div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
						<label className="text-sm text-gray-600">{t("profile.assignment.fields.status")}</label>
						<Toggle
							enabled={editAssignmentForm.status === true || editAssignmentForm.status === "active"}
							onChange={enabled => setEditAssignmentForm(prev => ({ ...prev, status: enabled }))}
						/>
					</div>
				</div>
				<div className="flex items-center justify-end gap-3 py-4 border-t border-gray-200 mt-2">
					<Button
						onClick={() => setIsEditAssignmentModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
					<Button
						onClick={() => setIsEditAssignmentModalOpen(false)}
						title={t("common.edit")}
						className="shadow-none px-8"
					/>
				</div>
			</SlideUpModal>

			{/* View Qualification Modal */}
			<SlideUpModal
				isOpen={isViewQualificationModalOpen}
				onClose={() => setIsViewQualificationModalOpen(false)}
				title="View Qualification"
				maxWidth="760px"
			>
				{selectedQualification && (
					<div className="py-6">
						<h4 className="text-base font-semibold text-[#1D7A8C] mb-4">Qualification Details</h4>
						<div className="border-t border-gray-200 pt-4 space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">{t("profile.qualifications.table.type")}</span>
								<span className="text-sm font-medium text-gray-900">{selectedQualification.type}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">
									{t("profile.qualifications.table.qualification")}
								</span>
								<span className="text-sm font-medium text-gray-900">
									{selectedQualification.qualification}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">
									{t("profile.qualifications.table.issuer")}
								</span>
								<span className="text-sm font-medium text-gray-900">
									{selectedQualification.issuer}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">{t("profile.qualifications.table.year")}</span>
								<span className="text-sm font-medium text-[#1D7A8C]">{selectedQualification.year}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">
									{t("profile.qualifications.fields.status")}
								</span>
								{renderQualificationStatus(selectedQualification.status)}
							</div>
						</div>
					</div>
				)}
				<div className="flex items-center justify-end gap-3 py-4 border-t border-gray-200 mt-4">
					<Button
						onClick={() => setIsViewQualificationModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
				</div>
			</SlideUpModal>

			{/* Edit Qualification Modal (compact, like design) */}
			<SlideUpModal
				isOpen={isEditQualificationModalOpen}
				onClose={() => setIsEditQualificationModalOpen(false)}
				title="Edit Qualification"
				maxWidth="760px"
			>
				<div className="py-6 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelSelect
							label={t("profile.qualifications.table.type")}
							name="qualificationType"
							value={qualificationForm.qualificationType}
							onChange={handleQualificationChange}
							options={qualificationTypeOptions}
						/>
						<FloatingLabelInput
							label={t("profile.qualifications.table.qualification")}
							name="qualificationTitle"
							value={qualificationForm.qualificationTitle}
							onChange={handleQualificationChange}
						/>
						<FloatingLabelInput
							label={t("profile.qualifications.table.year")}
							name="year"
							value={selectedQualification?.year || ""}
							onChange={() => { }}
							disabled
						/>
						<FloatingLabelInput
							label={t("profile.qualifications.table.issuer")}
							name="awardingEntity"
							value={qualificationForm.awardingEntity}
							onChange={handleQualificationChange}
						/>
					</div>
					<div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
						<label className="text-sm text-gray-600">{t("profile.qualifications.fields.status")}</label>
						<Toggle
							enabled={qualificationForm.status === true}
							onChange={enabled => setQualificationForm(prev => ({ ...prev, status: enabled }))}
							className="py-1"
						/>
					</div>
				</div>
				<div className="flex items-center justify-end gap-3 py-4 border-t border-gray-200 mt-2">
					<Button
						onClick={() => setIsEditQualificationModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
					<Button
						onClick={() => setIsEditQualificationModalOpen(false)}
						title={t("common.edit")}
						className="shadow-none px-8"
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
														if (comp.selected) {
															setActiveLevelDropdown(
																activeLevelDropdown === comp.id ? null : comp.id
															);
														}
													}}
													className={`w-6 h-6 flex items-center justify-center rounded-md border transition-colors ${comp.selected
														? "border-[#1D7A8C] bg-white text-[#1D7A8C]"
														: "border-gray-300 bg-white text-gray-300 cursor-not-allowed"
														}`}
													disabled={!comp.selected}
												>
													<HiOutlineChevronDown className="w-3.5 h-3.5" />
												</button>
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
													className={`w-6 h-6 flex items-center justify-center rounded-md border transition-colors ${comp.selected
														? "border-[#1D7A8C] bg-[#1D7A8C] text-white"
														: "border-[#1D7A8C] bg-white text-[#1D7A8C]"
														}`}
												>
													<HiOutlineCheck className="w-4 h-4" />
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
																		className={`w-full text-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${isSelected
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
					<Button onClick={() => setIsQualificationModalOpen(false)} title={t("common.cancel")} />
					<Button onClick={handleQualificationSubmit} title={t("common.add")} className="shadow-none" />
				</div>
			</SlideUpModal>

			{/* Add Address Modal */}
			<SlideUpModal
				isOpen={isAddAddressModalOpen}
				onClose={() => setIsAddAddressModalOpen(false)}
				title={t("profile.contacts.modals.addAddress")}
				maxWidth="760px"
			>
				<div className="py-6 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("profile.contacts.table.email")}
							name="email"
							value={addressForm.email}
							onChange={e => setAddressForm(prev => ({ ...prev, email: e.target.value }))}
						/>
						<FloatingLabelInput
							label={t("profile.contacts.table.phone")}
							name="phone"
							value={addressForm.phone}
							onChange={e => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.addressType")}
							name="addressType"
							value={addressForm.addressType}
							onChange={e => setAddressForm(prev => ({ ...prev, addressType: e.target.value }))}
							options={addressTypeOptions}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.country")}
							name="country"
							value={addressForm.countryId}
							onChange={e => handleCountryChange(e.target.value)}
							options={countriesTypeOptions}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.city")}
							name="city"
							value={addressForm.cityId}
							onChange={e => setAddressForm(prev => ({ ...prev, cityId: e.target.value }))}
							options={citiesTypeOptions}
						/>
						<FloatingLabelInput
							label={t("profile.contacts.table.address")}
							name="address"
							value={addressForm.address}
							onChange={e => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
						/>
					</div>
				</div>
				<div className="flex justify-end pt-4 border-t border-gray-200 mt-2 gap-3">
					<Button
						onClick={() => setIsAddAddressModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
					<Button
						onClick={handleAddAddressSubmit}
						title={t("common.add")}
						className="shadow-none px-8"
					/>
				</div>
			</SlideUpModal>

			{/* Edit Address Modal */}
			<SlideUpModal
				isOpen={isEditAddressModalOpen}
				onClose={() => setIsEditAddressModalOpen(false)}
				title={t("profile.contacts.modals.editAddress")}
				maxWidth="760px"
			>
				<div className="py-6 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("profile.contacts.table.email")}
							name="email"
							value={addressForm.email}
							onChange={e => setAddressForm(prev => ({ ...prev, email: e.target.value }))}
						/>
						<FloatingLabelInput
							label={t("profile.contacts.table.phone")}
							name="phone"
							value={addressForm.phone}
							onChange={e => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.addressType")}
							name="addressType"
							value={addressForm.addressType}
							onChange={e => setAddressForm(prev => ({ ...prev, addressType: e.target.value }))}
							options={localLookups.addressTypes.map(t => ({ value: t.id, label: t.nameEn }))}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.country")}
							name="country"
							value={addressForm.countryId}
							onChange={e => handleCountryChange(e.target.value)}
							options={localLookups.countries.map(c => ({ value: c.id, label: c.nameEn }))}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.city")}
							name="city"
							value={addressForm.cityId}
							onChange={e => setAddressForm(prev => ({ ...prev, cityId: e.target.value }))}
							options={localLookups.cities.map(c => ({ value: c.id, label: c.nameEn }))}
						/>
						<FloatingLabelInput
							label={t("profile.contacts.table.address")}
							name="address"
							value={addressForm.address}
							onChange={e => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
						/>
					</div>
				</div>
				<div className="flex justify-end pt-4 border-t border-gray-200 mt-2 gap-3">
					<Button
						onClick={() => setIsEditAddressModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
					<Button
						onClick={handleEditAddressSubmit}
						title={t("common.edit")}
						className="shadow-none px-8"
					/>
				</div>
			</SlideUpModal>

			{/* Add Emergency Modal */}
			<SlideUpModal
				isOpen={isAddEmergencyModalOpen}
				onClose={() => setIsAddEmergencyModalOpen(false)}
				title={t("profile.contacts.modals.addEmergency")}
				maxWidth="760px"
			>
				<div className="py-6 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("profile.contacts.table.name")}
							value={emergencyForm.name}
							onChange={e => setEmergencyForm(prev => ({ ...prev, name: e.target.value }))}
						/>
						<FloatingLabelInput
							label={t("profile.contacts.table.phone")}
							value={emergencyForm.phone}
							onChange={e => setEmergencyForm(prev => ({ ...prev, phone: e.target.value }))}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.relationship")}
							value={emergencyForm.relationship}
							onChange={e => setEmergencyForm(prev => ({ ...prev, relationship: e.target.value }))}
							options={[
								{ value: "Wife", label: "Wife" },
								{ value: "Brother", label: "Brother" },
								{ value: "Father", label: "Father" },
							]}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.contactType")}
							value={emergencyForm.contactType}
							onChange={e => setEmergencyForm(prev => ({ ...prev, contactType: e.target.value }))}
							options={[
								{ value: "Family", label: "Family" },
								{ value: "Emergency", label: "Emergency" },
							]}
						/>
					</div>
				</div>
				<div className="flex justify-end pt-4 border-t border-gray-200 mt-2 gap-3">
					<Button
						onClick={() => setIsAddEmergencyModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
					<Button
						onClick={() => setIsAddEmergencyModalOpen(false)}
						title={t("common.add")}
						className="shadow-none px-8"
					/>
				</div>
			</SlideUpModal>

			{/* Edit Emergency Modal */}
			<SlideUpModal
				isOpen={isEditEmergencyModalOpen}
				onClose={() => setIsEditEmergencyModalOpen(false)}
				title={t("profile.contacts.modals.editEmergency")}
				maxWidth="760px"
			>
				<div className="py-6 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("profile.contacts.table.name")}
							value={emergencyForm.name}
							onChange={e => setEmergencyForm(prev => ({ ...prev, name: e.target.value }))}
						/>
						<FloatingLabelInput
							label={t("profile.contacts.table.phone")}
							value={emergencyForm.phone}
							onChange={e => setEmergencyForm(prev => ({ ...prev, phone: e.target.value }))}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.relationship")}
							value={emergencyForm.relationship}
							onChange={e => setEmergencyForm(prev => ({ ...prev, relationship: e.target.value }))}
							options={[
								{ value: "Wife", label: "Wife" },
								{ value: "Brother", label: "Brother" },
								{ value: "Father", label: "Father" },
							]}
						/>
						<FloatingLabelSelect
							label={t("profile.contacts.table.contactType")}
							value={emergencyForm.contactType}
							onChange={e => setEmergencyForm(prev => ({ ...prev, contactType: e.target.value }))}
							options={[
								{ value: "Family", label: "Family" },
								{ value: "Emergency", label: "Emergency" },
							]}
						/>
					</div>
				</div>
				<div className="flex justify-end pt-4 border-t border-gray-200 mt-2 gap-3">
					<Button
						onClick={() => setIsEditEmergencyModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 shadow-none px-6"
					/>
					<Button
						onClick={() => setIsEditEmergencyModalOpen(false)}
						title={t("common.edit")}
						className="shadow-none px-8"
					/>
				</div>
			</SlideUpModal>
		</div>
	);
};

export default ProfilePage;
