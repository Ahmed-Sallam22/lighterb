import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_STORAGE_KEY } from '../constants';

export const useLocale = () => {
	const { i18n } = useTranslation();

	const locale = i18n.language === 'ar' ? 'AR' : 'EN';

	const setLocale = useCallback(
		nextLocale => {
			const nextLang = nextLocale === 'AR' ? 'ar' : 'en';

			i18n.changeLanguage(nextLang);
			localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);
		},
		[i18n]
	);

	return { locale, setLocale };
};
