import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch all assignments with optional filters
export const fetchAssignments = createAsyncThunk(
	"assignments/fetchAll",
	async ({ person, page = 1, page_size = 25, ...filters } = {}, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);
			if (person) params.append("person", person);
			Object.entries(filters).forEach(([key, value]) => {
				if (value) params.append(key, value);
			});

			const response = await api.get(`/hr/person/assignments/?${params.toString()}`);
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
				"Failed to fetch assignments";
			return rejectWithValue(errorMessage);
		}
	}
);

// Fetch primary assignment for a person
export const fetchPrimaryAssignment = createAsyncThunk(
	"assignments/fetchPrimary",
	async (personId, { rejectWithValue }) => {
		try {
			const response = await api.get(`/hr/person/assignments/primary/${personId}/`);
			return response.data?.data ?? response.data;
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Failed to fetch primary assignment";
			return rejectWithValue(errorMessage);
		}
	}
);

// Fetch single assignment by ID
export const fetchAssignmentById = createAsyncThunk("assignments/fetchById", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/hr/person/assignments/${id}/`);
		return response.data?.data ?? response.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch assignment";
		return rejectWithValue(errorMessage);
	}
});

// Create assignment
export const createAssignment = createAsyncThunk("assignments/create", async (assignmentData, { rejectWithValue }) => {
	try {
		const response = await api.post("/hr/person/assignments/", assignmentData);
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
					errorData.message || errorData.error || errorData.detail || "Failed to create assignment";
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to create assignment");
	}
});

// Update assignment (PATCH)
export const updateAssignment = createAsyncThunk("assignments/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.patch(`/hr/person/assignments/${id}/`, data);
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
					errorData.message || errorData.error || errorData.detail || "Failed to update assignment";
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to update assignment");
	}
});

// Delete assignment
export const deleteAssignment = createAsyncThunk("assignments/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/hr/person/assignments/${id}/`);
		return id;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to delete assignment";
		return rejectWithValue(errorMessage);
	}
});

// Fetch lookups for assignments
export const fetchAssignmentActionReasons = createAsyncThunk(
	"assignments/fetchActionReasons",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/core/lookups/values/?lookup_type=Assignment Action Reason");
			const data = response.data?.data ?? response.data;
			return data?.results ?? (Array.isArray(data) ? data : []);
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch action reasons");
		}
	}
);

export const fetchAssignmentStatuses = createAsyncThunk("assignments/fetchStatuses", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/core/lookups/values/?lookup_type=Assignment Status");
		const data = response.data?.data ?? response.data;
		return data?.results ?? (Array.isArray(data) ? data : []);
	} catch (error) {
		return rejectWithValue(error.message || "Failed to fetch assignment statuses");
	}
});

export const fetchProbationPeriods = createAsyncThunk(
	"assignments/fetchProbationPeriods",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/core/lookups/values/?lookup_type=Probation Period");
			const data = response.data?.data ?? response.data;
			return data?.results ?? (Array.isArray(data) ? data : []);
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch probation periods");
		}
	}
);

export const fetchNoticePeriods = createAsyncThunk("assignments/fetchNoticePeriods", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/core/lookups/values/?lookup_type=Notice Period");
		const data = response.data?.data ?? response.data;
		return data?.results ?? (Array.isArray(data) ? data : []);
	} catch (error) {
		return rejectWithValue(error.message || "Failed to fetch notice periods");
	}
});

const initialState = {
	assignments: [],
	currentAssignment: null,
	primaryAssignment: null,
	loading: false,
	loadingAssignment: false,
	creating: false,
	updating: false,
	deleting: false,
	error: null,
	actionError: null,
	count: 0,
	page: 1,
	hasNext: false,
	hasPrevious: false,
	// Lookups
	actionReasons: [],
	assignmentStatuses: [],
	probationPeriods: [],
	noticePeriods: [],
};

const assignmentsSlice = createSlice({
	name: "assignments",
	initialState,
	reducers: {
		setPage: (state, action) => {
			state.page = action.payload;
		},
		clearError: state => {
			state.error = null;
			state.actionError = null;
		},
		clearCurrentAssignment: state => {
			state.currentAssignment = null;
		},
		clearPrimaryAssignment: state => {
			state.primaryAssignment = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch all assignments
			.addCase(fetchAssignments.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchAssignments.fulfilled, (state, action) => {
				state.loading = false;
				state.assignments = action.payload.results;
				state.count = action.payload.count;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchAssignments.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch primary assignment
			.addCase(fetchPrimaryAssignment.pending, state => {
				state.loadingAssignment = true;
				state.actionError = null;
			})
			.addCase(fetchPrimaryAssignment.fulfilled, (state, action) => {
				state.loadingAssignment = false;
				state.primaryAssignment = action.payload;
			})
			.addCase(fetchPrimaryAssignment.rejected, (state, action) => {
				state.loadingAssignment = false;
				state.actionError = action.payload;
			})
			// Fetch single assignment
			.addCase(fetchAssignmentById.pending, state => {
				state.loadingAssignment = true;
				state.actionError = null;
			})
			.addCase(fetchAssignmentById.fulfilled, (state, action) => {
				state.loadingAssignment = false;
				state.currentAssignment = action.payload;
			})
			.addCase(fetchAssignmentById.rejected, (state, action) => {
				state.loadingAssignment = false;
				state.actionError = action.payload;
			})
			// Create assignment
			.addCase(createAssignment.pending, state => {
				state.creating = true;
				state.actionError = null;
			})
			.addCase(createAssignment.fulfilled, (state, action) => {
				state.creating = false;
				state.assignments.unshift(action.payload);
				state.count += 1;
			})
			.addCase(createAssignment.rejected, (state, action) => {
				state.creating = false;
				state.actionError = action.payload;
			})
			// Update assignment
			.addCase(updateAssignment.pending, state => {
				state.updating = true;
				state.actionError = null;
			})
			.addCase(updateAssignment.fulfilled, (state, action) => {
				state.updating = false;
				state.currentAssignment = action.payload;
				const index = state.assignments.findIndex(a => a.id === action.payload.id);
				if (index !== -1) {
					state.assignments[index] = action.payload;
				}
			})
			.addCase(updateAssignment.rejected, (state, action) => {
				state.updating = false;
				state.actionError = action.payload;
			})
			// Delete assignment
			.addCase(deleteAssignment.pending, state => {
				state.deleting = true;
				state.actionError = null;
			})
			.addCase(deleteAssignment.fulfilled, (state, action) => {
				state.deleting = false;
				state.assignments = state.assignments.filter(a => a.id !== action.payload);
				state.count -= 1;
			})
			.addCase(deleteAssignment.rejected, (state, action) => {
				state.deleting = false;
				state.actionError = action.payload;
			})
			// Lookups
			.addCase(fetchAssignmentActionReasons.fulfilled, (state, action) => {
				state.actionReasons = action.payload;
			})
			.addCase(fetchAssignmentStatuses.fulfilled, (state, action) => {
				state.assignmentStatuses = action.payload;
			})
			.addCase(fetchProbationPeriods.fulfilled, (state, action) => {
				state.probationPeriods = action.payload;
			})
			.addCase(fetchNoticePeriods.fulfilled, (state, action) => {
				state.noticePeriods = action.payload;
			});
	},
});

export const { setPage, clearError, clearCurrentAssignment, clearPrimaryAssignment } = assignmentsSlice.actions;
export default assignmentsSlice.reducer;
