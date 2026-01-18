import { useEffect } from 'react';

const SITE_NAME = "LightERP";

export const usePageTitle = (pageTitle) => {
  useEffect(() => {
    const previousTitle = document.title;
    // Format: "Site Name - Page Title"
    document.title = pageTitle ? `${SITE_NAME} - ${pageTitle}` : SITE_NAME;

    return () => {
      document.title = previousTitle;
    };
  }, [pageTitle]);
};
