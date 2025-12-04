import React from 'react';
import SidebarLink from './SidebarLink';

const SidebarNavigation = ({ links, onClose }) => {
	return (
		<nav className="px-4 py-1">
			{links.map(link => (
				<SidebarLink key={link.label} link={link} onClose={onClose} />
			))}
		</nav>
	);
};

export default SidebarNavigation;
