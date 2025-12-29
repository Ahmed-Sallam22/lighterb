import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch business groups with pagination
export const fetchBusinessGroups = createAsyncThunk(
	"businessGroups/fetchBusinessGroups",
	async (params = {}, { rejectWithValue }) => {
		try {
			const response = await api.get("/hr/work_structures/business-groups/", { params });
			const data = response.data?.data || response.data;
			return {
				results: data.results || data || [],
				count: data.count || 0,
				next: data.next,
				previous: data.previous,
			};
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch business groups");
		}
	}
);

// Create a new business group
export const createBusinessGroup = createAsyncThunk(
	"businessGroups/createBusinessGroup",
	async (businessGroupData, { rejectWithValue }) => {
		try {
			const response = await api.post("/hr/work_structures/business-groups/", businessGroupData);
			return response.data?.data || response.data;
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.message || "Failed to create business group");
		}
	}
);

// Update a business group
export const updateBusinessGroup = createAsyncThunk(
	"businessGroups/updateBusinessGroup",
	async ({ id, data }, { rejectWithValue }) => {
		try {
			const response = await api.patch(`/hr/work_structures/business-groups/${id}/`, data);
			return response.data?.data || response.data;
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.message || "Failed to update business group");
		}
	}
);

// Delete a business group
export const deleteBusinessGroup = createAsyncThunk(
	"businessGroups/deleteBusinessGroup",
	async (id, { rejectWithValue }) => {
		try {
			await api.delete(`/hr/work_structures/business-groups/${id}/`);
			return id;
		} catch (error) {
			return rejectWithValue(error.message || "Failed to delete business group");
		}
	}
);

// Fetch business group history
export const fetchBusinessGroupHistory = createAsyncThunk(
	"businessGroups/fetchBusinessGroupHistory",
	async (businessGroupId, { rejectWithValue }) => {
		try {
			const response = await api.get(`/hr/work_structures/business-groups/${businessGroupId}/history/`);
			const data = response.data?.data || response.data;
			return {
				results: data.results || data || [],
				count: data.count || 0,
			};
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch business group history");
		}
	}
);

const businessGroupsSlice = createSlice({
	name: "businessGroups",
	initialState: {
		businessGroups: [],
		loading: false,
		error: null,
		count: 0,
		page: 1,
		hasNext: false,
		hasPrevious: false,
		creating: false,
		updating: false,
		deleting: false,
		actionError: null,
	},
	reducers: {
		setPage: (state, action) => {
			state.page = action.payload;
		},
		clearError: state => {
			state.error = null;
			state.actionError = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch business groups
			.addCase(fetchBusinessGroups.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchBusinessGroups.fulfilled, (state, action) => {
				state.loading = false;
				state.businessGroups = action.payload.results;
				state.count = action.payload.count;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchBusinessGroups.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Create business group
			.addCase(createBusinessGroup.pending, state => {
				state.creating = true;
				state.actionError = null;
			})
			.addCase(createBusinessGroup.fulfilled, (state, action) => {
				state.creating = false;
				state.businessGroups.unshift(action.payload);
				state.count += 1;
			})
			.addCase(createBusinessGroup.rejected, (state, action) => {
				state.creating = false;
				state.actionError = action.payload;
			})

			// Update business group
			.addCase(updateBusinessGroup.pending, state => {
				state.updating = true;
				state.actionError = null;
			})
			.addCase(updateBusinessGroup.fulfilled, (state, action) => {
				state.updating = false;
				const index = state.businessGroups.findIndex(bg => bg.id === action.payload.id);
				if (index !== -1) {
					state.businessGroups[index] = action.payload;
				}
			})
			.addCase(updateBusinessGroup.rejected, (state, action) => {
				state.updating = false;
				state.actionError = action.payload;
			})

			// Delete business group
			.addCase(deleteBusinessGroup.pending, state => {
				state.deleting = true;
				state.actionError = null;
			})
			.addCase(deleteBusinessGroup.fulfilled, (state, action) => {
				state.deleting = false;
				state.businessGroups = state.businessGroups.filter(bg => bg.id !== action.payload);
				state.count -= 1;
			})
			.addCase(deleteBusinessGroup.rejected, (state, action) => {
				state.deleting = false;
				state.actionError = action.payload;
			});
	},
});

export const { setPage, clearError } = businessGroupsSlice.actions;
export default businessGroupsSlice.reducer;
