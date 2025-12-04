import React from "react";
import { HiChevronRight, HiChevronLeft } from "react-icons/hi";

const NavigationBar = ({ routes, activeRoute, onRouteClick, scrollContainerRef, onScroll, isRTL, t }) => {
	return (
		<div className="my-7 relative">
			<div className="flex items-center gap-3">
				<button
					onClick={() => onScroll(isRTL ? "right" : "left")}
					className="shrink-0 p-2 border border-white/20 bg-white/10 text-white rounded-full transition-all duration-300 transform backdrop-blur-md hover:bg-white/20 hover:border-white/40 hover:scale-110"
					aria-label={t("common.scrollLeft")}
				>
					{isRTL ? (
						<HiChevronRight className="w-5 h-5 text-[#48C1F0]" />
					) : (
						<HiChevronLeft className="w-5 h-5 text-[#48C1F0]" />
					)}
				</button>

				<div
					ref={scrollContainerRef}
					className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4 py-4"
					style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
				>
					{routes.map((route, index) => (
						<button
							key={index}
							onClick={() => onRouteClick(route.key)}
							className={`px-6 py-3 rounded-lg whitespace-nowrap border text-sm font-semibold tracking-wide transition-all duration-300 transform backdrop-blur-md shadow-lg ${
								activeRoute === route.key
									? "border-[#48C1F0] bg-[#48C1F0]/20 text-white scale-105 shadow-[0_0_20px_rgba(72,193,240,0.4)]"
									: "border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 hover:-translate-y-0.5"
							}`}
						>
							{route.name}
						</button>
					))}
				</div>

				<button
					onClick={() => onScroll(isRTL ? "left" : "right")}
					className="shrink-0 p-2 border border-white/20 bg-white/10 text-white rounded-full transition-all duration-300 transform backdrop-blur-md hover:bg-white/20 hover:border-white/40 hover:scale-110"
					aria-label={t("common.scrollRight")}
				>
					{isRTL ? (
						<HiChevronLeft className="w-5 h-5 text-[#48C1F0]" />
					) : (
						<HiChevronRight className="w-5 h-5 text-[#48C1F0]" />
					)}
				</button>
			</div>
		</div>
	);
};

export default NavigationBar;
