import React from "react";

const CardsGrid = ({ cards, activeRoute, isAnimating, onCardClick }) => {
	return (
		<div
			className={`grid grid-cols-1 md:grid-cols-2 ${
				cards.length > 2 ? "lg:grid-cols-4" : "lg:grid-cols-2"
			} gap-6 transition-all duration-500 ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
		>
			{cards.map((card, index) => (
				<div
					key={`${activeRoute}-${index}`}
					onClick={() => {
						if (card.isDisabled) return;
						onCardClick(card.key);
					}}
					className={`rounded-xl border py-6 px-3 shadow-xl transition-all duration-500 ${
						card.isDisabled
							? "bg-[#1E5F72]/60 border-white/5 cursor-not-allowed opacity-70"
							: "border-white/10 bg-[#28819C]/30 cursor-pointer animate-fadeInUp transform hover:-translate-y-2 hover:bg-white/20 hover:shadow-[0_10px_30px_rgba(72,193,240,0.3)]"
					}`}
					style={card.isDisabled ? undefined : { animationDelay: `${index * 50}ms` }}
				>
					<div className="flex flex-row items-center gap-4">
						{/* Icon */}
						<div className="shrink-0 transition-transform duration-300 hover:scale-110">{card.icon}</div>

						{/* Border */}
						<div className="shrink-0 w-px h-20 bg-[#7A9098] opacity-50"></div>

						{/* Title and Description */}
						<div className="flex-1">
							<h2 className="text-white font-semibold text-lg mb-1 transition-colors duration-300">
								{card.title}
							</h2>
							<p className="text-white/80 text-sm leading-relaxed">{card.description}</p>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

export default CardsGrid;
