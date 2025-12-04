import React from "react";
import SearchButton from "./SearchButton";
import LanguageToggle from "./LanguageToggle";
import HomeButton from "./HomeButton";
import UserProfile from "./UserProfile";

const NavbarRight = ({ locale, onLocaleToggle, onNavigateHome }) => {
	return (
		<div className="flex items-center gap-6 justify-center">
			<SearchButton />
			<LanguageToggle locale={locale} onToggle={onLocaleToggle} />
			<HomeButton onNavigateHome={onNavigateHome} />
			<UserProfile />
		</div>
	);
};

export default NavbarRight;
