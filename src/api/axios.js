import axios from "axios";

// Base API URL
const BASE_URL = "http://127.0.0.1:8000";

// Create axios instance with default config
const api = axios.create({
	baseURL: BASE_URL,
	timeout: 30000, // 30 seconds timeout
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor - add auth token and handle requests
api.interceptors.request.use(
	config => {
		// Get token from localStorage (adjust based on your auth implementation)
		const token = localStorage.getItem("authToken");

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	error => {
		return Promise.reject(error);
	}
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
	response => {
		// Return data directly for successful responses
		return response;
	},
	error => {
		// Handle common errors
		if (error.response) {
			const { status, data } = error.response;

			switch (status) {
				case 401:
					// Unauthorized - clear token and redirect to login
					localStorage.removeItem("authToken");
					// Optionally redirect to login page
					// window.location.href = '/auth/login';
					break;

				case 403:
					// Forbidden - user doesn't have permission
					break;

				case 404:
					// Not found
					break;

				case 422:
					// Validation error
					break;

				case 500:
					// Server error
					break;

				default:
					break;
			}

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
