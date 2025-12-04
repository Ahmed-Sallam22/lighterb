import { useEffect } from 'react';

export const useSidebarLockScroll = isOpen => {
	useEffect(() => {
		const originalOverflow = document.body.style.overflow;
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		}
		return () => {
			document.body.style.overflow = originalOverflow;
		};
	}, [isOpen]);
};
