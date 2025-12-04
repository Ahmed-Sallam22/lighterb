import React, { useRef } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { HiBookOpen } from "react-icons/hi";
import QuickActionsPanel from "../../components/shared/QuickActionsPanel";
import { QUICK_ACTIONS } from "../../constants/quickActions";
import { useLocale } from "../../hooks/useLocale";
import { getCardsData } from "./constants/cardsData";
import { getHomeRoutes } from "./constants/routes";
import { useScrollNavigation } from "./hooks/useScrollNavigation";
import { useRouteNavigation } from "./hooks/useRouteNavigation";
import HomeBackground from "./components/HomeBackground";
import HomeHeader from "./components/HomeHeader";
import NavigationBar from "./components/NavigationBar";
import CardsGrid from "./components/CardsGrid";

const Home = () => {
	const scrollContainerRef = useRef(null);
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { locale } = useLocale();
	const isRTL = locale === "AR";

	const routes = getHomeRoutes(t);
	const cardsData = getCardsData(t);

	const { scroll } = useScrollNavigation(scrollContainerRef);
	const { activeRoute, isAnimating, handleCardClick, handleRouteClick } = useRouteNavigation(cardsData, routes);

	const createCardIcon = () => <HiBookOpen className="w-7 h-7 text-[#D3D3D3]" />;

	const quickActionItems = QUICK_ACTIONS.map(action => ({
		id: action.id,
		label: t(action.labelKey),
		description: t(action.descriptionKey),
	}));

	const cards = (cardsData[activeRoute] || cardsData.Dashboard).map(card => ({
		...card,
		icon: createCardIcon(),
	}));

	const handleQuickActionClick = action => {
		navigate(`/quick-actions/${action.id}`);
	};

	return (
		<section className="min-h-screen relative overflow-hidden bg-[#031b28] py-8 px-6 text-white">
			<HomeBackground />

			<div className="relative mx-auto">
				<HomeHeader title={t("home.title")} />

				<NavigationBar
					routes={routes}
					activeRoute={activeRoute}
					onRouteClick={handleRouteClick}
					scrollContainerRef={scrollContainerRef}
					onScroll={scroll}
					isRTL={isRTL}
					t={t}
				/>

				<CardsGrid
					cards={cards}
					activeRoute={activeRoute}
					isAnimating={isAnimating}
					onCardClick={cardKey => handleCardClick(cardKey, activeRoute)}
				/>

				<div className="mt-12">
					<QuickActionsPanel
						title={t("home.quickActions")}
						actions={quickActionItems}
						onActionClick={handleQuickActionClick}
					/>
				</div>
			</div>
		</section>
	);
};

export default Home;
