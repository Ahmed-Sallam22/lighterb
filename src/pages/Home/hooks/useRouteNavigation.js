import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { cardNavigationMap } from "../constants/cardsNavigationMap";

export const useRouteNavigation = (cardsData, routes) => {
	const navigate = useNavigate();
	const [activeRoute, setActiveRoute] = useState("Dashboard");
	const [isAnimating, setIsAnimating] = useState(false);
	const timeoutRef = useRef(null);

	const handleCardClick = (cardKey, currentActiveRoute) => {
		if (currentActiveRoute === "Journal") {
			if (cardKey === "Journal Entries") {
				navigate("/journal/entries");
			} else if (cardKey === "Journal Lines") {
				navigate("/journal/lines");
			}
		}

		if (currentActiveRoute === "Dashboard") {
			if (cardNavigationMap[cardKey]) {
				navigate(cardNavigationMap[cardKey]);
			}
		}

		if (currentActiveRoute === "Procurement") {
			if (cardKey === "Procurement Dashboard" || cardKey === "Procurement") {
				navigate("/procurement");
			} else if (cardKey === "Catalog Reference") {
				navigate("/procurement/catalog");
			}
		}
	};

	const handleRouteClick = routeKey => {
		const hasChildren = cardsData[routeKey] && cardsData[routeKey].length > 0;

		if (hasChildren) {
			if (routeKey !== activeRoute) {
				setIsAnimating(true);
				setActiveRoute(routeKey);

				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}

				timeoutRef.current = setTimeout(() => {
					setIsAnimating(false);
					timeoutRef.current = null;
				}, 300);
			}
		} else {
			const route = routes.find(r => r.key === routeKey);
			if (route?.path) navigate(route.path);
		}
	};

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return {
		activeRoute,
		isAnimating,
		handleCardClick,
		handleRouteClick,
	};
};
