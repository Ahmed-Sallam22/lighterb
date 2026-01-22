import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";
import { useLocale } from "../hooks/useLocale";
import { HiOfficeBuilding, HiViewGrid, HiTrendingUp } from "react-icons/hi";
import { IoPeople, IoPerson } from "react-icons/io5";

import PageHeader from "../components/shared/PageHeader";
import RequisitionsHeadIcon from "../ui/icons/RequisitionsHeadIcon";
import LocationIcon from "../assets/location.svg?react";
import Building from "../assets/building.svg?react";
import BagIcon from "../assets/bag.svg?react";
import JobIcon from "../assets/bag.svg?react";
import { fetchOrganizations } from "../store/organizationsSlice";
import { fetchLocations } from "../store/locationsSlice";
import { fetchGrades } from "../store/gradesSlice";
import { fetchPositions } from "../store/positionsSlice";
import { fetchJobs } from "../store/jobsSlice";

const WorkforceManagementPage = () => {
	const { t } = useTranslation();
	usePageTitle(t("workforceManagement.title"));
	const { locale } = useLocale();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const isRTL = locale === "AR";

	// Get counts from Redux store
	const { count: organizationsCount } = useSelector(state => state.organizations);
	const { count: locationsCount } = useSelector(state => state.locations);
	const { count: gradesCount } = useSelector(state => state.grades);
	const { count: positionsCount } = useSelector(state => state.positions);
	const { count: jobsCount } = useSelector(state => state.jobs);

	// Fetch counts on component mount
	useEffect(() => {
		dispatch(fetchOrganizations({ page: 1, page_size: 1 }));
		dispatch(fetchLocations({ page: 1, page_size: 1 }));
		dispatch(fetchGrades({ page: 1, page_size: 1 }));
		dispatch(fetchPositions({ page: 1, page_size: 1 }));
		dispatch(fetchJobs({ page: 1, page_size: 1 }));
	}, [dispatch]);

	const workStructureCards = [
		{
			id: "enterprise-business-groups",
			title: t("workStructure.cards.organizations.title"),
			description: t("workStructure.cards.organizations.description"),
			icon: HiOfficeBuilding,
			total: organizationsCount || 0,
			route: "/organizations",
			bgColor: "bg-[#1D7A8C]",
		},
		{
			id: "locations",
			title: t("workStructure.cards.locations.title"),
			description: t("workStructure.cards.locations.description"),
			icon: LocationIcon,
			total: locationsCount || 0,
			route: "/locations",
			bgColor: "bg-[#1D7A8C]",
		},

		{
			id: "positions",
			title: t("workStructure.cards.positions.title"),
			description: t("workStructure.cards.positions.description"),
			icon: BagIcon,
			total: positionsCount || 0,
			route: "/positions",
			bgColor: "bg-[#1D7A8C]",
		},
		{
			id: "grades-rates",
			title: t("workStructure.cards.gradesRates.title"),
			description: t("workStructure.cards.gradesRates.description"),
			icon: HiTrendingUp,
			total: gradesCount || 0,
			route: "/grades-and-rates",
			bgColor: "bg-[#1D7A8C]",
		},
		{
			id: "jobs",
			title: t("workStructure.cards.jobs.title"),
			description: t("workStructure.cards.jobs.description"),
			icon: JobIcon,
			total: jobsCount || 0,
			route: "/jobs",
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
				title={t("workforceManagement.title")}
				subtitle={t("workforceManagement.subtitle")}
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

export default WorkforceManagementPage;
