import React from 'react';
import { twMerge } from 'tailwind-merge';

function StatisticsCard({
	title,
	value,
	icon,
	cardClassName = '',
	titleClassName = '',
	valueClassName = '',
	iconClassName = '',
}) {
	return (
		<div
			className={twMerge(
				'bg-white rounded-xl shadow-md px-5 py-4 hover:shadow-lg transition-shadow relative overflow-hidden',
				cardClassName
			)}
		>
			<div className="flex flex-row justify-between items-center">
				<div>
					<p className={twMerge('text-[#4A5565] text-lg font-medium', titleClassName)}>{title}</p>

					<p className={twMerge('text-2xl font-semibold', valueClassName)}>{value}</p>
				</div>

				{/* Render icon only if passed */}
				{icon && (
					<div className={twMerge('p-3 rounded-lg flex items-center justify-center', iconClassName)}>
						{icon}
					</div>
				)}
			</div>
		</div>
	);
}

export default StatisticsCard;
