import React from 'react';
import { MdClose } from 'react-icons/md';
import logo from '../../constants';

const SidebarHeader = ({ onClose }) => {
	return (
		<div className="flex items-center justify-between px-6 py-4 border-b border-white/15">
			<img src={logo} alt="Light ERP Logo" className="w-32 h-auto" />
			<button
				onClick={onClose}
				className="rounded-full border border-white/30 p-1 text-white transition hover:bg-white/10"
				aria-label="Close sidebar"
			>
				<MdClose className="w-4 h-4" />
			</button>
		</div>
	);
};

export default SidebarHeader;
