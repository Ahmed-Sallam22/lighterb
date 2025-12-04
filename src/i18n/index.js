import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ar from './ar.json';
import { LANGUAGE_STORAGE_KEY } from '../constants';
const FALLBACK_LANGUAGE = 'en';

const getInitialLanguage = () => {
	if (typeof window === 'undefined') {
		return FALLBACK_LANGUAGE;
	}

	try {
		const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
		if (stored === 'ar' || stored === 'en') {
			return stored;
		}
	} catch (error) {
		console.warn('Unable to read persisted language:', error);
	}

	return FALLBACK_LANGUAGE;
};

const resources = {
	en: { translation: en },
	ar: { translation: ar },
};

i18n.use(initReactI18next).init({
	resources,
	lng: getInitialLanguage(),
	fallbackLng: FALLBACK_LANGUAGE,
	interpolation: { escapeValue: false },
});

export default i18n;
