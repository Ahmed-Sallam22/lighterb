import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch all users (admin only)
export const fetchUsers = createAsyncThunk("users/fetchAll", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/accounts/admin/users/");
		return response.data.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch users";
		return rejectWithValue(errorMessage);
	}
});

// Fetch user by ID
export const fetchUserById = createAsyncThunk("users/fetchById", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/accounts/admin/users/${id}/`);
		return response.data.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch user details";
		return rejectWithValue(errorMessage);
	}
});

// Create user
export const createUser = createAsyncThunk("users/create", async (userData, { rejectWithValue }) => {
	try {
		const response = await api.post("/accounts/admin/users/", userData);
		return response.data.data;
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
				errorMessage = errorData.message || errorData.error || errorData.detail || "Failed to create user";
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to create user");
	}
});

// Update user (PATCH - only user_type and job_role can be changed)
export const updateUser = createAsyncThunk("users/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.patch(`/accounts/admin/users/${id}/`, data);
		return response.data.data;
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
				errorMessage = errorData.message || errorData.error || errorData.detail || "Failed to update user";
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to update user");
	}
});

// Delete user
export const deleteUser = createAsyncThunk("users/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/accounts/admin/users/${id}/`);
		return id;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to delete user";
		return rejectWithValue(errorMessage);
	}
});

const usersSlice = createSlice({
	name: "users",
	initialState: {
		users: [],
		count: 0,
		selectedUser: null,
		loading: false,
		error: null,
	},
	reducers: {
		clearError: state => {
			state.error = null;
		},
		clearSelectedUser: state => {
			state.selectedUser = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch all users
			.addCase(fetchUsers.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchUsers.fulfilled, (state, action) => {
				state.loading = false;
				state.users = action.payload.users || [];
				state.count = action.payload.count || 0;
			})
			.addCase(fetchUsers.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch user by ID
			.addCase(fetchUserById.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchUserById.fulfilled, (state, action) => {
				state.loading = false;
				state.selectedUser = action.payload;
			})
			.addCase(fetchUserById.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Create user
			.addCase(createUser.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(createUser.fulfilled, (state, action) => {
				state.loading = false;
				state.users.push(action.payload);
				state.count += 1;
			})
			.addCase(createUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Update user
			.addCase(updateUser.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateUser.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.users.findIndex(u => u.id === action.payload.id);
				if (index !== -1) {
					state.users[index] = action.payload;
				}
			})
			.addCase(updateUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Delete user
			.addCase(deleteUser.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteUser.fulfilled, (state, action) => {
				state.loading = false;
				state.users = state.users.filter(u => u.id !== action.payload);
				state.count -= 1;
			})
			.addCase(deleteUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { clearError, clearSelectedUser } = usersSlice.actions;
export default usersSlice.reducer;
