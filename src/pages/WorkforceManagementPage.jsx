import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";
import { HiOfficeBuilding, HiViewGrid, HiTrendingUp } from "react-icons/hi";
import { IoPeople, IoPerson } from "react-icons/io5";

import PageHeader from "../components/shared/PageHeader";
import RequisitionsHeadIcon from "../ui/icons/RequisitionsHeadIcon";
import LocationIcon from "../assets/location.svg?react";
import Building from "../assets/building.svg?react";
import BagIcon from "../assets/bag.svg?react";
import JobIcon from "../assets/bag.svg?react";
import { fetchEmployees } from "../store/employeesSlice";


const WorkforceManagementPage = () => {
	const { t } = useTranslation();
	usePageTitle(t("workforceManagement.title"));
	const navigate = useNavigate();
	const dispatch = useDispatch();

	// Get counts from Redux store

	const { count: employeesCount } = useSelector(state => state.employees);
	// Fetch counts on component mount
	useEffect(() => {

		dispatch(fetchEmployees({ page: 1, page_size: 1 }));
	}, [dispatch]);

	const workStructureCards = [
		{
					id: "Employees",
					title: t("workStructure.cards.employees.title"),
					description: t("workStructure.cards.employees.description"),
					icon: IoPeople,
					total: employeesCount || 0,
					route: "/employee-search",
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
