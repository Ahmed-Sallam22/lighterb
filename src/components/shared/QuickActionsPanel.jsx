import React from 'react';
import PropTypes from 'prop-types';
import { MdSpeed } from 'react-icons/md';

/**
 * Default stopwatch icon used for the Quick Actions header.
 */
export const QuickActionsIcon = React.memo(() => <MdSpeed className="w-[42px] h-[35px] text-[#D3D3D3]" />);

QuickActionsIcon.displayName = 'QuickActionsIcon';

/**
 * QuickActionsPanel Component
 * Shared UI block that renders a titled panel with pill-shaped action buttons.
 */
export const QuickActionsPanel = ({ title, actions, icon, onActionClick }) => {
	const iconContent = icon || <QuickActionsIcon />;

	return (
		<section
			className="rounded-4xl border border-white/10 bg-[#28819C]/30 px-6 py-6 sm:px-8 sm:py-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] "
			aria-label={title}
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
				<div className="flex items-center gap-3">
					<div className="flex items-center justify-center rounded-full">{iconContent}</div>
					<div>
						<h2 className="text-2xl font-semibold text-white">{title}</h2>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{actions.map(action => (
					<button
						key={action.id}
						type="button"
						onClick={() => onActionClick?.(action)}
						className="w-full rounded-full border border-white/30 bg-white/5 py-3 px-6 text-center text-sm font-semibold uppercase tracking-wide text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#48C1F0] hover:bg-[#48C1F0]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#48C1F0]"
						aria-label={action.label}
					>
						{action.label}
					</button>
				))}
			</div>
		</section>
	);
};

QuickActionsPanel.propTypes = {
	title: PropTypes.string,
	subtitle: PropTypes.string,
	actions: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			label: PropTypes.string.isRequired,
		})
	),
	icon: PropTypes.node,
	onActionClick: PropTypes.func,
};

QuickActionsPanel.defaultProps = {
	title: 'Quick Actions',
	subtitle: '',
	actions: [],
	icon: null,
	onActionClick: undefined,
};

export default QuickActionsPanel;
