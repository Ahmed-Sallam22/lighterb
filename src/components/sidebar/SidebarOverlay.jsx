import React from 'react';

const SidebarOverlay = ({ isOpen, onClose }) => {
	return (
		<div
			className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
				isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
			}`}
			onClick={onClose}
			aria-hidden="true"
		/>
	);
};

export default SidebarOverlay;
