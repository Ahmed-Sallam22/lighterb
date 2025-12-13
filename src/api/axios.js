import axios from "axios";
import authService from "../services/authService";

// Base API URL - use proxy in development, direct URL in production
const BASE_URL = import.meta.env.VITE_BASE_URL;

// Create axios instance with default config
const api = axios.create({
	baseURL: BASE_URL,
	timeout: 30000, // 30 seconds timeout
	headers: {
		"Content-Type": "application/json",
	},
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

// Request interceptor - add auth token and handle requests
api.interceptors.request.use(
	config => {
		// Get token from authService (handles both session and cookies)
		const token = authService.getAccessToken();

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	error => {
		return Promise.reject(error);
	}
);

// Response interceptor - handle errors globally and refresh token
api.interceptors.response.use(
	response => {
		// Return data directly for successful responses
		return response;
	},
	async error => {
		const originalRequest = error.config;

		// Handle 401 errors with token refresh
		if (error.response?.status === 401 && !originalRequest._retry) {
			// Check if this is a login/register request - don't try to refresh for these
			if (originalRequest.url?.includes('/auth/login') || 
				originalRequest.url?.includes('/auth/register') ||
				originalRequest.url?.includes('/auth/token/refresh')) {
				return Promise.reject(error);
			}

			if (isRefreshing) {
				// If already refreshing, queue this request
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						return api(originalRequest);
					})
					.catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			const refreshToken = authService.getRefreshToken();

			if (!refreshToken || !authService.hasValidRefreshToken()) {
				// No valid refresh token, clear auth and redirect
				authService.clearAuth();
				isRefreshing = false;
				window.location.href = '/auth/login';
				return Promise.reject(error);
			}

			try {
				const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
					refresh: refreshToken,
				});

				const data = response.data?.data ?? response.data;
				const newAccessToken = data.access || data.accessToken;

				if (newAccessToken) {
					authService.updateAccessToken(newAccessToken);
					originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
					processQueue(null, newAccessToken);
					return api(originalRequest);
				}
			} catch (refreshError) {
				processQueue(refreshError, null);
				authService.clearAuth();
				window.location.href = '/auth/login';
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		// Handle other common errors
		if (error.response) {
			const { status, data } = error.response;

			// Create a standardized error object
			const errorMessage =
				data?.message || data?.error || data?.detail || (typeof data === "string" ? data : "An error occurred");

			return Promise.reject({
				status,
				message: errorMessage,
				data,
			});
		}

		// Network error or timeout
		if (error.code === "ECONNABORTED") {
			return Promise.reject({
				status: 408,
				message: "Request timeout. Please try again.",
			});
		}

		return Promise.reject({
			status: 0,
			message: error.message || "Network error. Please check your connection.",
		});
	}
);

// Export the configured instance
export default api;

// Export base URL for cases where it's needed
export { BASE_URL };