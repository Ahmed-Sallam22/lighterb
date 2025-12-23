import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch all job roles with pagination
export const fetchJobRoles = createAsyncThunk(
	"jobRoles/fetchAll",
	async ({ page = 1, page_size = 20, search = "" } = {}, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);
			if (search) params.append("search", search);

			const response = await api.get(`/core/job_roles/job-roles/?${params.toString()}`);
			// Handle nested data structure: { status, message, data: { count, results, ... } }
			const data = response.data?.data ?? response.data;
			return {
				results: data?.results ?? (Array.isArray(data) ? data : []),
				count: data?.count ?? 0,
				next: data?.next ?? null,
				previous: data?.previous ?? null,
			};
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Failed to fetch job roles";
			return rejectWithValue(errorMessage);
		}
	}
);

// Fetch available pages for permissions
export const fetchPages = createAsyncThunk("jobRoles/fetchPages", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/core/job_roles/pages/");
		const data = response.data?.data ?? response.data;
		return data?.results ?? (Array.isArray(data) ? data : []);
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch pages";
		return rejectWithValue(errorMessage);
	}
});

// Create job role with pages
export const createJobRoleWithPages = createAsyncThunk(
	"jobRoles/createWithPages",
	async (roleData, { rejectWithValue }) => {
		try {
			const response = await api.post("/core/job_roles/job-roles/with-pages/", roleData);
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
						errorData.message || errorData.error || errorData.detail || "Failed to create job role";
				}
				return rejectWithValue(errorMessage);
			}
			return rejectWithValue(error.message || "Failed to create job role");
		}
	}
);

// Create job role (legacy)
export const createJobRole = createAsyncThunk("jobRoles/create", async (roleData, { rejectWithValue }) => {
	try {
		const response = await api.post("/core/job_roles/job-roles/", roleData);
		return response.data;
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
				errorMessage = errorData.message || errorData.error || errorData.detail || "Failed to create job role";
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to create job role");
	}
});

// Update job role
export const updateJobRole = createAsyncThunk("jobRoles/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.put(`/api/job-roles/${id}/`, data);
		return response.data;
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
				errorMessage = errorData.message || errorData.error || errorData.detail || "Failed to update job role";
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to update job role");
	}
});

// Delete job role
export const deleteJobRole = createAsyncThunk("jobRoles/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/api/job-roles/${id}/`);
		return id;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to delete job role";
		return rejectWithValue(errorMessage);
	}
});

const initialState = {
	roles: [],
	pages: [],
	loading: false,
	pagesLoading: false,
	error: null,
	creating: false,
	updating: false,
	deleting: false,
	actionError: null,
	// Pagination state
	count: 0,
	page: 1,
	hasNext: false,
	hasPrevious: false,
};

const jobRolesSlice = createSlice({
	name: "jobRoles",
	initialState,
	reducers: {
		clearError: state => {
			state.error = null;
			state.actionError = null;
		},
		setPage: (state, action) => {
			state.page = action.payload;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch
			.addCase(fetchJobRoles.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchJobRoles.fulfilled, (state, action) => {
				state.loading = false;
				state.roles = Array.isArray(action.payload.results) ? action.payload.results : [];
				state.count = action.payload.count ?? 0;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchJobRoles.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch Pages
			.addCase(fetchPages.pending, state => {
				state.pagesLoading = true;
			})
			.addCase(fetchPages.fulfilled, (state, action) => {
				state.pagesLoading = false;
				state.pages = Array.isArray(action.payload) ? action.payload : [];
			})
			.addCase(fetchPages.rejected, (state, action) => {
				state.pagesLoading = false;
				state.error = action.payload;
			})
			// Create with Pages
			.addCase(createJobRoleWithPages.pending, state => {
				state.creating = true;
				state.actionError = null;
			})
			.addCase(createJobRoleWithPages.fulfilled, (state, action) => {
				state.creating = false;
				if (action.payload) {
					state.roles.unshift(action.payload);
				}
			})
			.addCase(createJobRoleWithPages.rejected, (state, action) => {
				state.creating = false;
				state.actionError = action.payload;
			})
			// Create
			.addCase(createJobRole.pending, state => {
				state.creating = true;
				state.actionError = null;
			})
			.addCase(createJobRole.fulfilled, (state, action) => {
				state.creating = false;
				state.roles.push(action.payload);
			})
			.addCase(createJobRole.rejected, (state, action) => {
				state.creating = false;
				state.actionError = action.payload;
			})
			// Update
			.addCase(updateJobRole.pending, state => {
				state.updating = true;
				state.actionError = null;
			})
			.addCase(updateJobRole.fulfilled, (state, action) => {
				state.updating = false;
				const index = state.roles.findIndex(role => role.id === action.payload.id);
				if (index !== -1) {
					state.roles[index] = action.payload;
				}
			})
			.addCase(updateJobRole.rejected, (state, action) => {
				state.updating = false;
				state.actionError = action.payload;
			})
			// Delete
			.addCase(deleteJobRole.pending, state => {
				state.deleting = true;
				state.actionError = null;
			})
			.addCase(deleteJobRole.fulfilled, (state, action) => {
				state.deleting = false;
				state.roles = state.roles.filter(role => role.id !== action.payload);
			})
			.addCase(deleteJobRole.rejected, (state, action) => {
				state.deleting = false;
				state.actionError = action.payload;
			});
	},
});

export const { clearError, setPage } = jobRolesSlice.actions;
export default jobRolesSlice.reducer;
