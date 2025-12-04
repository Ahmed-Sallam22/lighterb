import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useEffect } from 'react';

function BodyDirectionController() {
	const { i18n } = useTranslation();

	useEffect(() => {
		const isRTL = i18n.language === 'ar';

		document.body.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
		document.body.classList.toggle('rtl', isRTL);
		document.body.classList.toggle('ltr', !isRTL);
	}, [i18n.language]);

	return null;
}

export function I18nProvider({ children }) {
	return (
		<I18nextProvider i18n={i18n}>
			<BodyDirectionController />
			{children}
		</I18nextProvider>
	);
}
