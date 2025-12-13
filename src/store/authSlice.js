import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../api/axios";
import authService from "../services/authService";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Register user
export const registerUser = createAsyncThunk(
	"auth/register",
	async (userData, { rejectWithValue }) => {
		try {
			const response = await axios.post(`${BASE_URL}/auth/register/`, {
				email: userData.email,
				name: userData.name,
				phone_number: userData.phone_number,
				password: userData.password,
				confirm_password: userData.confirm_password,
			});

			const data = response.data?.data ?? response.data;

			// Save tokens and user data (remember = true for new registrations)
			if (data.tokens) {
				authService.saveTokens(data.tokens.access, data.tokens.refresh, true);
			}
			if (data.user) {
				authService.saveUser(data.user);
			}

			return data;
		} catch (error) {
			if (error.response?.data) {
				const errorData = error.response.data;
				let errorMessage = "";

				if (typeof errorData === "object" && !errorData.message && !errorData.error && !errorData.detail) {
					const fieldErrors = Object.entries(errorData)
						.map(([field, messages]) => {
							const messageText = Array.isArray(messages) ? messages.join(", ") : messages;
							return `${field}: ${messageText}`;
						})
						.join(" | ");
					errorMessage = fieldErrors;
				} else {
					errorMessage =
						errorData.message || errorData.error || errorData.detail || "Registration failed";
				}
				return rejectWithValue(errorMessage);
			}
			return rejectWithValue(error.message || "Registration failed");
		}
	}
);

// Login user
export const loginUser = createAsyncThunk(
	"auth/login",
	async ({ email, password, rememberMe = false }, { rejectWithValue }) => {
		try {
			const response = await axios.post(`${BASE_URL}/auth/login/`, {
				email,
				password,
			});

			const data = response.data?.data ?? response.data;

			// Save tokens based on remember me preference
			if (data.tokens) {
				authService.saveTokens(data.tokens.access, data.tokens.refresh, rememberMe);
			}
			if (data.user) {
				authService.saveUser(data.user);
			}

			return { ...data, rememberMe };
		} catch (error) {
			if (error.response?.data) {
				const errorData = error.response.data;
				let errorMessage = "";

				if (typeof errorData === "object" && !errorData.message && !errorData.error && !errorData.detail) {
					const fieldErrors = Object.entries(errorData)
						.map(([field, messages]) => {
							const messageText = Array.isArray(messages) ? messages.join(", ") : messages;
							return `${field}: ${messageText}`;
						})
						.join(" | ");
					errorMessage = fieldErrors;
				} else {
					errorMessage =
						errorData.message || errorData.error || errorData.detail || "Login failed";
				}
				return rejectWithValue(errorMessage);
			}
			return rejectWithValue(error.message || "Login failed");
		}
	}
);

// Refresh token
export const refreshAccessToken = createAsyncThunk(
	"auth/refreshToken",
	async (_, { rejectWithValue }) => {
		try {
			const refreshToken = authService.getRefreshToken();

			if (!refreshToken) {
				return rejectWithValue("No refresh token available");
			}

			const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
				refresh: refreshToken,
			});

			const data = response.data?.data ?? response.data;
			const newAccessToken = data.access || data.accessToken;

			if (newAccessToken) {
				authService.updateAccessToken(newAccessToken);
			}

			return data;
		} catch (error) {
			// Clear auth data on refresh failure
			authService.clearAuth();
			
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Token refresh failed";
			return rejectWithValue(errorMessage);
		}
	}
);

// Change password
export const changePassword = createAsyncThunk(
	"auth/changePassword",
	async ({ old_password, new_password, confirm_password }, { rejectWithValue }) => {
		try {
			const response = await api.post(`/auth/change-password/`, {
				old_password,
				new_password,
				confirm_password,
			});

			return response.data?.data ?? response.data;
		} catch (error) {
			if (error.response?.data) {
				const errorData = error.response.data;
				let errorMessage = "";

				if (typeof errorData === "object" && !errorData.message && !errorData.error && !errorData.detail) {
					const fieldErrors = Object.entries(errorData)
						.map(([field, messages]) => {
							const messageText = Array.isArray(messages) ? messages.join(", ") : messages;
							return `${field}: ${messageText}`;
						})
						.join(" | ");
					errorMessage = fieldErrors;
				} else {
					errorMessage =
						errorData.message || errorData.error || errorData.detail || "Failed to change password";
				}
				return rejectWithValue(errorMessage);
			}
			return rejectWithValue(error.message || "Failed to change password");
		}
	}
);

// Logout user
export const logoutUser = createAsyncThunk(
	"auth/logout",
	async () => {
		try {
			const refreshToken = authService.getRefreshToken();
			
			// Call backend logout endpoint with refresh token
			if (refreshToken) {
				try {
					await axios.post(`${BASE_URL}/auth/logout/`, {
						refresh: refreshToken,
					});
				} catch (logoutError) {
					// Continue with logout even if API call fails
					console.warn('Logout API call failed:', logoutError);
				}
			}
			
			// Clear all auth data from storage
			authService.clearAuth();
			return null;
		} catch {
			// Clear auth even if something goes wrong
			authService.clearAuth();
			return null;
		}
	}
);

// Initialize auth state from storage
const getInitialState = () => {
	const user = authService.getUser();
	const isAuthenticated = authService.isAuthenticated();

	return {
		user: user,
		isAuthenticated: isAuthenticated,
		loading: false,
		error: null,
		registrationSuccess: false,
	};
};

const authSlice = createSlice({
	name: "auth",
	initialState: getInitialState(),
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
		clearRegistrationSuccess: (state) => {
			state.registrationSuccess = false;
		},
		// Check and update auth state from storage
		checkAuth: (state) => {
			state.user = authService.getUser();
			state.isAuthenticated = authService.isAuthenticated();
		},
	},
	extraReducers: (builder) => {
		builder
			// Register
			.addCase(registerUser.pending, (state) => {
				state.loading = true;
				state.error = null;
				state.registrationSuccess = false;
			})
			.addCase(registerUser.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload.user;
				state.isAuthenticated = true;
				state.registrationSuccess = true;
			})
			.addCase(registerUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
				state.registrationSuccess = false;
			})
			// Login
			.addCase(loginUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(loginUser.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload.user;
				state.isAuthenticated = true;
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
				state.isAuthenticated = false;
			})
			// Refresh token
			.addCase(refreshAccessToken.pending, (state) => {
				state.loading = true;
			})
			.addCase(refreshAccessToken.fulfilled, (state) => {
				state.loading = false;
			})
			.addCase(refreshAccessToken.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
				state.isAuthenticated = false;
				state.user = null;
			})
			// Logout
			.addCase(logoutUser.pending, (state) => {
				state.loading = true;
			})
			.addCase(logoutUser.fulfilled, (state) => {
				state.loading = false;
				state.user = null;
				state.isAuthenticated = false;
				state.error = null;
			})
			.addCase(logoutUser.rejected, (state) => {
				state.loading = false;
				state.user = null;
				state.isAuthenticated = false;
			})
			// Change password
			.addCase(changePassword.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(changePassword.fulfilled, (state) => {
				state.loading = false;
			})
			.addCase(changePassword.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { clearError, clearRegistrationSuccess, checkAuth } = authSlice.actions;
export default authSlice.reducer;
