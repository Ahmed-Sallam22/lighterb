import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineAcademicCap } from "react-icons/hi";

import PageHeader from "../components/shared/PageHeader";
import Button from "../components/shared/Button";
import SlideUpModal from "../components/shared/SlideUpModal";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import Table from "../components/shared/Table";
import CompetenceDetailsIcon from "../assets/icons/CompetencedetailsIcon";
import ValidityPeriodIcon from "../assets/icons/ValidityPeriodIcon";
import JudjeIcon from "../assets/icons/JudjeIcon";

const COMPETENCIES_DATA = [
	{
		id: 1,
		competency: "Communication",
		proficiencyLevel: "Beginner",
		proficiencyColor: "bg-orange-100 text-orange-700",
		source: "Self Assessment",
		validFrom: "01-Jan-2025",
		validTo: "No Expiration",
	},
	{
		id: 2,
		competency: "Teamwork",
		proficiencyLevel: "Advanced",
		proficiencyColor: "bg-green-100 text-green-700",
		source: "Manager Assessment",
		validFrom: "01-Jan-2025",
		validTo: "01-Jan-2025",
	},
];

const CompetenciesPage = () => {
	const { t } = useTranslation();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [noExpiration, setNoExpiration] = useState(false);
	const [formData, setFormData] = useState({
		competence: "",
		proficiencyLevel: "",
		source: "",
		dateFrom: "",
		dateTo: "",
	});

	useEffect(() => {
		document.title = `${t("competencies.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	const competenceOptions = [
		{ value: "", label: t("competencies.fields.competence") },
		{ value: "communication", label: "Communication" },
		{ value: "teamwork", label: "Teamwork" },
		{ value: "leadership", label: "Leadership" },
		{ value: "problemSolving", label: "Problem Solving" },
		{ value: "timeManagement", label: "Time Management" },
	];

	const proficiencyOptions = [
		{ value: "", label: t("competencies.fields.proficiencyLevel") },
		{ value: "beginner", label: "Beginner" },
		{ value: "intermediate", label: "Intermediate" },
		{ value: "advanced", label: "Advanced" },
		{ value: "expert", label: "Expert" },
	];

	const sourceOptions = [
		{ value: "", label: t("competencies.fields.source") },
		{ value: "selfAssessment", label: "Self Assessment" },
		{ value: "managerAssessment", label: "Manager Assessment" },
		{ value: "peerReview", label: "Peer Review" },
		{ value: "training", label: "Training" },
	];

	const handleInputChange = (name, value) => {
		setFormData(prev => ({
			...prev,
			[name]: value,
		}));
	};

	const handleNoExpirationChange = checked => {
		setNoExpiration(checked);
		if (checked) {
			setFormData(prev => ({
				...prev,
				dateTo: "",
			}));
		}
	};

	const handleSubmit = () => {
		console.log("Form data:", formData, "No expiration:", noExpiration);
		setIsModalOpen(false);
		// Reset form
		setFormData({
			competence: "",
			proficiencyLevel: "",
			source: "",
			dateFrom: "",
			dateTo: "",
		});
		setNoExpiration(false);
	};

	const renderProficiencyLevel = (level, row) => {
		return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${row.proficiencyColor}`}>{level}</span>;
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<PageHeader
				icon={<JudjeIcon />}
				title={t("competencies.title")}
				subtitle={t("competencies.subtitle")}
				cla
			/>

			<div className="px-6 py-8">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-[#1D7A8C]">{t("competencies.sectionTitle")}</h2>
					<Button
						onClick={() => setIsModalOpen(true)}
						title={t("competencies.buttons.addCompetencies")}
						className="px-4"
					/>
				</div>

				<div className="bg-white rounded-2xl shadow-lg p-4">
					<Table
						columns={[
							{
								header: t("competencies.table.competency"),
								accessor: "competency",
								render: value => <span className="font-medium text-gray-900">{value}</span>,
							},
							{
								header: t("competencies.table.proficiencyLevel"),
								accessor: "proficiencyLevel",
								render: renderProficiencyLevel,
							},
							{
								header: t("competencies.table.source"),
								accessor: "source",
								render: value => <span className="text-gray-700">{value}</span>,
							},
							{
								header: t("competencies.table.validFrom"),
								accessor: "validFrom",
								render: value => <span className="text-gray-700">{value}</span>,
							},
							{
								header: t("competencies.table.validTo"),
								accessor: "validTo",
								render: value => <span className="text-gray-700">{value}</span>,
							},
						]}
						data={COMPETENCIES_DATA}
						emptyMessage={t("competencies.table.empty")}
						className="shadow-none"
						showDeleteButton={() => false}
						showEditButton={() => false}
						showViewButton={() => false}
					/>
				</div>
			</div>

			<SlideUpModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title={t("competencies.modal.title")}
				maxWidth="700px"
			>
				<div className="space-y-8">
					{/* Competence Details Section */}
					<div>
						<h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide flex items-center gap-2">
							<CompetenceDetailsIcon />
							{t("competencies.modal.sections.competenceDetails")}
						</h3>
						<div className="space-y-4">
							<FloatingLabelSelect
								label={t("competencies.fields.competence") + " *"}
								name="competence"
								options={competenceOptions}
								value={formData.competence}
								onChange={value => handleInputChange("competence", value)}
							/>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FloatingLabelSelect
									label={t("competencies.fields.proficiencyLevel") + " *"}
									name="proficiencyLevel"
									options={proficiencyOptions}
									value={formData.proficiencyLevel}
									onChange={value => handleInputChange("proficiencyLevel", value)}
								/>
								<FloatingLabelSelect
									label={t("competencies.fields.source") + " *"}
									name="source"
									options={sourceOptions}
									value={formData.source}
									onChange={value => handleInputChange("source", value)}
								/>
							</div>
						</div>
					</div>

					{/* Validity Period Section */}
					<div>
						<h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wide flex items-center gap-2">
							<ValidityPeriodIcon />
							{t("competencies.modal.sections.validityPeriod")}
						</h3>
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FloatingLabelInput
									label={t("competencies.fields.dateFrom")}
									name="dateFrom"
									type="date"
									value={formData.dateFrom}
									onChange={e => handleInputChange("dateFrom", e.target.value)}
								/>
								<div className="space-y-2">
									<FloatingLabelInput
										label={t("competencies.fields.dateTo")}
										name="dateTo"
										type="date"
										value={formData.dateTo}
										onChange={e => handleInputChange("dateTo", e.target.value)}
										disabled={noExpiration}
									/>
									<div className="flex items-center gap-2">
										<input
											type="checkbox"
											id="noExpiration"
											checked={noExpiration}
											onChange={e => handleNoExpirationChange(e.target.checked)}
											className="w-4 h-4 text-[#1D7A8C] bg-white border-gray-300 rounded focus:ring-[#1D7A8C] focus:ring-2 accent-[#1D7A8C]" 
											
										/>
										<label htmlFor="noExpiration" className="text-sm text-gray-700 cursor-pointer">
											{t("competencies.fields.noExpiration")}
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-end gap-3 pt-6">
					<Button
						onClick={() => setIsModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-none"
					/>
					<Button onClick={handleSubmit} title={t("common.add")} />
				</div>
			</SlideUpModal>
		</div>
	);
};

export default CompetenciesPage;
