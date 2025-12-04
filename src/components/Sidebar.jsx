import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../hooks/useLocale';
import { getSidebarLinks } from '../constants/sidebarLinks';
import { useSidebarLockScroll } from './sidebar/hooks/useSidebarLockScroll';
import SidebarOverlay from './sidebar/SidebarOverlay';
import SidebarHeader from './sidebar/SidebarHeader';
import SidebarNavigation from './sidebar/SidebarNavigation';

const Sidebar = ({ isOpen, onClose }) => {
	const { t } = useTranslation();
	const { locale } = useLocale();
	const isRTL = locale === 'AR';

	const sidebarLinks = getSidebarLinks(t);
	useSidebarLockScroll(isOpen);

	return (
		<>
			<SidebarOverlay isOpen={isOpen} onClose={onClose} />
			<aside
				className={`fixed top-0 z-50 h-full w-72 transform overflow-y-auto bg-gradient-to-b from-[#1f9ec0] via-[#167398] to-[#0c3b4c] shadow-2xl transition-all duration-500 ease-in-out ${
					isRTL ? 'right-0' : 'left-0'
				} ${isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}`}
				aria-label="Sidebar navigation"
			>
				<SidebarHeader onClose={onClose} />
				<SidebarNavigation links={sidebarLinks} onClose={onClose} />
			</aside>
		</>
	);
};

export default Sidebar;
