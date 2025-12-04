import { useState, useEffect } from "react";

export const useScrollNavigation = scrollContainerRef => {
	const [, setCanScrollLeft] = useState(false);
	const [, setCanScrollRight] = useState(false);

	const updateScrollButtons = () => {
		if (!scrollContainerRef.current) return;
		const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
		const maxScrollLeft = scrollWidth - clientWidth - 1;
		setCanScrollLeft(scrollLeft > 1);
		setCanScrollRight(scrollLeft < maxScrollLeft);
	};

	const scroll = direction => {
		if (scrollContainerRef.current) {
			const scrollAmount = 200;
			scrollContainerRef.current.scrollBy({
				left: direction === "right" ? scrollAmount : -scrollAmount,
				behavior: "smooth",
			});
		}
	};

	useEffect(() => {
		const container = scrollContainerRef.current;
		updateScrollButtons();

		if (!container) return;

		container.addEventListener("scroll", updateScrollButtons, { passive: true });
		window.addEventListener("resize", updateScrollButtons);

		return () => {
			container.removeEventListener("scroll", updateScrollButtons);
			window.removeEventListener("resize", updateScrollButtons);
		};
	}, []);

	return { scroll };
};
