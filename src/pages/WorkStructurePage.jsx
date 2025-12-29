import React from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useLocale } from "../hooks/useLocale";
import { HiOfficeBuilding, HiLocationMarker, HiViewGrid, HiBriefcase, HiTrendingUp } from "react-icons/hi";
import PageHeader from "../components/shared/PageHeader";
import RequisitionsHeadIcon from "../ui/icons/RequisitionsHeadIcon";

const WorkStructurePage = () => {
	const { t } = useTranslation();
	const { locale } = useLocale();
	const navigate = useNavigate();
	const isRTL = locale === "AR";

	const workStructureCards = [
		{
			id: "enterprise-business-groups",
			title: t("workStructure.cards.businessGroups.title"),
			description: t("workStructure.cards.businessGroups.description"),
			icon: HiOfficeBuilding,
			total: 5,
			route: "/enterprise-business-groups",
			bgColor: "bg-[#1D7A8C]",
		},
		{
			id: "locations",
			title: t("workStructure.cards.locations.title"),
			description: t("workStructure.cards.locations.description"),
			icon: HiLocationMarker,
			total: 12,
			route: "/locations",
			bgColor: "bg-[#1D7A8C]",
		},
		{
			id: "departments",
			title: t("workStructure.cards.departments.title"),
			description: t("workStructure.cards.departments.description"),
			icon: HiViewGrid,
			total: 5,
			route: "/departments",
			bgColor: "bg-[#1D7A8C]",
		},
		{
			id: "positions",
			title: t("workStructure.cards.positions.title"),
			description: t("workStructure.cards.positions.description"),
			icon: HiBriefcase,
			total: 5,
			route: "/positions",
			bgColor: "bg-[#1D7A8C]",
		},
		{
			id: "grades-rates",
			title: t("workStructure.cards.gradesRates.title"),
			description: t("workStructure.cards.gradesRates.description"),
			icon: HiTrendingUp,
			total: 5,
			route: "/grades-and-rates",
			bgColor: "bg-[#1D7A8C]",
		},
	];

	const handleCardClick = route => {
		navigate(route);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header Section */}
			<PageHeader
				title={t("workStructure.title")}
				subtitle={t("workStructure.subtitle")}
				icon={<RequisitionsHeadIcon width={32} height={30} className="text-[#28819C]" />}
			/>

			{/* Cards Grid Section */}
			<div className="max-w-7xl mx-auto px-6 py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{workStructureCards.map(card => {
						const IconComponent = card.icon;
						return (
							<div
								key={card.id}
								onClick={() => handleCardClick(card.route)}
								className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 cursor-pointer group"
							>
								<div className="flex items-start justify-between mb-4">
									<div
										className={`${card.bgColor} rounded-lg p-3 group-hover:scale-105 transition-transform duration-200`}
									>
										<IconComponent className="w-6 h-6 text-white" />
									</div>
									<div className={`text-right ${isRTL ? "text-left" : "text-right"}`}>
										<div className="text-3xl font-bold text-gray-800">{card.total}</div>
										<div className="text-sm text-gray-500">{t("workStructure.total")}</div>
									</div>
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-[#1D7A8C] transition-colors duration-200">
										{card.title}
									</h3>
									<p className="text-sm text-gray-600 leading-relaxed">{card.description}</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default WorkStructurePage;
