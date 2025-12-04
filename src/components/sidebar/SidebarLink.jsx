import React from 'react';
import { Link } from 'react-router';

const SidebarLink = ({ link, onClose }) => {
	const content = (
		<span className="flex items-center gap-2 rounded-lg px-3 py-3 text-white transition-all duration-200 hover:bg-white/10">
			<span className="flex items-center justify-center rounded-full bg-white/5 p-2">{link.icon}</span>
			<span className="text-lg font-medium">{link.label}</span>
		</span>
	);

	return link.path ? (
		<Link to={link.path} onClick={onClose} className="block">
			{content}
		</Link>
	) : (
		<button type="button" className="w-full text-left" onClick={onClose}>
			{content}
		</button>
	);
};

export default SidebarLink;
