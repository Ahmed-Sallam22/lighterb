import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch enterprises with pagination
export const fetchEnterprises = createAsyncThunk(
	"enterprises/fetchEnterprises",
	async (params = {}, { rejectWithValue }) => {
		try {
			const response = await api.get("/hr/work_structures/enterprises/", { params });
			const data = response.data?.data || response.data;
			return {
				results: data.results || data || [],
				count: data.count || 0,
				next: data.next,
				previous: data.previous,
			};
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch enterprises");
		}
	}
);

// Create a new enterprise
export const createEnterprise = createAsyncThunk(
	"enterprises/createEnterprise",
	async (enterpriseData, { rejectWithValue }) => {
		try {
			const response = await api.post("/hr/work_structures/enterprises/", enterpriseData);
			return response.data?.data || response.data;
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.message || "Failed to create enterprise");
		}
	}
);

// Update an enterprise
export const updateEnterprise = createAsyncThunk(
	"enterprises/updateEnterprise",
	async ({ id, data }, { rejectWithValue }) => {
		try {
			const response = await api.patch(`/hr/work_structures/enterprises/${id}/`, data);
			return response.data?.data || response.data;
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.message || "Failed to update enterprise");
		}
	}
);

// Delete an enterprise
export const deleteEnterprise = createAsyncThunk("enterprises/deleteEnterprise", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/hr/work_structures/enterprises/${id}/`);
		return id;
	} catch (error) {
		return rejectWithValue(error.message || "Failed to delete enterprise");
	}
});

// Fetch enterprise history (business groups under enterprise)
export const fetchEnterpriseHistory = createAsyncThunk(
	"enterprises/fetchEnterpriseHistory",
	async (enterpriseId, { rejectWithValue }) => {
		try {
			const response = await api.get(`/hr/work_structures/enterprises/${enterpriseId}/history/`);
			const data = response.data?.data || response.data;
			return {
				results: data.results || data || [],
				count: data.count || 0,
			};
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch enterprise history");
		}
	}
);

const enterprisesSlice = createSlice({
	name: "enterprises",
	initialState: {
		enterprises: [],
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
			// Fetch enterprises
			.addCase(fetchEnterprises.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchEnterprises.fulfilled, (state, action) => {
				state.loading = false;
				state.enterprises = action.payload.results;
				state.count = action.payload.count;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchEnterprises.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Create enterprise
			.addCase(createEnterprise.pending, state => {
				state.creating = true;
				state.actionError = null;
			})
			.addCase(createEnterprise.fulfilled, (state, action) => {
				state.creating = false;
				state.enterprises.unshift(action.payload);
				state.count += 1;
			})
			.addCase(createEnterprise.rejected, (state, action) => {
				state.creating = false;
				state.actionError = action.payload;
			})

			// Update enterprise
			.addCase(updateEnterprise.pending, state => {
				state.updating = true;
				state.actionError = null;
			})
			.addCase(updateEnterprise.fulfilled, (state, action) => {
				state.updating = false;
				const index = state.enterprises.findIndex(e => e.id === action.payload.id);
				if (index !== -1) {
					state.enterprises[index] = action.payload;
				}
			})
			.addCase(updateEnterprise.rejected, (state, action) => {
				state.updating = false;
				state.actionError = action.payload;
			})

			// Delete enterprise
			.addCase(deleteEnterprise.pending, state => {
				state.deleting = true;
				state.actionError = null;
			})
			.addCase(deleteEnterprise.fulfilled, (state, action) => {
				state.deleting = false;
				state.enterprises = state.enterprises.filter(e => e.id !== action.payload);
				state.count -= 1;
			})
			.addCase(deleteEnterprise.rejected, (state, action) => {
				state.deleting = false;
				state.actionError = action.payload;
			});
	},
});

export const { setPage, clearError } = enterprisesSlice.actions;
export default enterprisesSlice.reducer;
