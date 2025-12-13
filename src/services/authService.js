// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';
const REMEMBER_ME_KEY = 'rememberMe';

// Cookie utilities
const setCookie = (name, value, days = 7) => {
	const expires = new Date();
	expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
	document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure`;
};

const getCookie = (name) => {
	const nameEQ = `${name}=`;
	const ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
};

const removeCookie = (name) => {
	document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Auth Service
const authService = {
	// Check if user chose "remember me"
	isRememberMe: () => {
		return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
	},

	// Set remember me preference
	setRememberMe: (remember) => {
		if (remember) {
			localStorage.setItem(REMEMBER_ME_KEY, 'true');
		} else {
			localStorage.removeItem(REMEMBER_ME_KEY);
		}
	},

	// Save tokens based on remember me preference
	saveTokens: (accessToken, refreshToken, rememberMe = false) => {
		authService.setRememberMe(rememberMe);

		if (rememberMe) {
			// Save to cookies (persistent)
			setCookie(ACCESS_TOKEN_KEY, accessToken, 1); // 1 day for access token
			setCookie(REFRESH_TOKEN_KEY, refreshToken, 7); // 7 days for refresh token
		} else {
			// Save to sessionStorage (cleared on browser close)
			sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
			sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
		}
	},

	// Get access token
	getAccessToken: () => {
		if (authService.isRememberMe()) {
			return getCookie(ACCESS_TOKEN_KEY);
		}
		return sessionStorage.getItem(ACCESS_TOKEN_KEY);
	},

	// Get refresh token
	getRefreshToken: () => {
		if (authService.isRememberMe()) {
			return getCookie(REFRESH_TOKEN_KEY);
		}
		return sessionStorage.getItem(REFRESH_TOKEN_KEY);
	},

	// Update access token (after refresh)
	updateAccessToken: (accessToken) => {
		if (authService.isRememberMe()) {
			setCookie(ACCESS_TOKEN_KEY, accessToken, 1);
		} else {
			sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
		}
	},

	// Save user data
	saveUser: (user) => {
		const userStr = JSON.stringify(user);
		if (authService.isRememberMe()) {
			localStorage.setItem(USER_KEY, userStr);
		} else {
			sessionStorage.setItem(USER_KEY, userStr);
		}
	},

	// Get user data
	getUser: () => {
		let userStr;
		if (authService.isRememberMe()) {
			userStr = localStorage.getItem(USER_KEY);
		} else {
			userStr = sessionStorage.getItem(USER_KEY);
		}
		
		if (userStr) {
			try {
				return JSON.parse(userStr);
			} catch {
				return null;
			}
		}
		return null;
	},

	// Clear all auth data (logout)
	clearAuth: () => {
		// Clear cookies
		removeCookie(ACCESS_TOKEN_KEY);
		removeCookie(REFRESH_TOKEN_KEY);

		// Clear sessionStorage
		sessionStorage.removeItem(ACCESS_TOKEN_KEY);
		sessionStorage.removeItem(REFRESH_TOKEN_KEY);
		sessionStorage.removeItem(USER_KEY);

		// Clear localStorage
		localStorage.removeItem(USER_KEY);
		localStorage.removeItem(REMEMBER_ME_KEY);
	},

	// Check if user is authenticated
	isAuthenticated: () => {
		const token = authService.getAccessToken();
		if (!token) return false;

		// Check if token is expired (optional - basic JWT decode)
		try {
			const payload = JSON.parse(atob(token.split('.')[1]));
			const exp = payload.exp * 1000; // Convert to milliseconds
			return Date.now() < exp;
		} catch {
			return false;
		}
	},

	// Check if refresh token is valid
	hasValidRefreshToken: () => {
		const refreshToken = authService.getRefreshToken();
		if (!refreshToken) return false;

		try {
			const payload = JSON.parse(atob(refreshToken.split('.')[1]));
			const exp = payload.exp * 1000;
			return Date.now() < exp;
		} catch {
			return false;
		}
	},
};

export default authService;
