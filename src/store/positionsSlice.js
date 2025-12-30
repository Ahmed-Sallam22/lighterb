import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch positions with pagination
export const fetchPositions = createAsyncThunk("positions/fetchPositions", async (params = {}, { rejectWithValue }) => {
	try {
		const response = await api.get("/hr/work_structures/positions/", { params });
		const data = response.data?.data || response.data;
		return {
			results: data.results || data || [],
			count: data.count || 0,
			next: data.next,
			previous: data.previous,
		};
	} catch (error) {
		return rejectWithValue(error.message || "Failed to fetch positions");
	}
});

// Create a new position
export const createPosition = createAsyncThunk(
	"positions/createPosition",
	async (positionData, { rejectWithValue }) => {
		try {
			const response = await api.post("/hr/work_structures/positions/", positionData);
			return response.data?.data || response.data;
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.message || "Failed to create position");
		}
	}
);

// Update a position
export const updatePosition = createAsyncThunk(
	"positions/updatePosition",
	async ({ id, data }, { rejectWithValue }) => {
		try {
			const response = await api.patch(`/hr/work_structures/positions/${id}/`, data);
			return response.data?.data || response.data;
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.message || "Failed to update position");
		}
	}
);

// Delete a position
export const deletePosition = createAsyncThunk("positions/deletePosition", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/hr/work_structures/positions/${id}/`);
		return id;
	} catch (error) {
		return rejectWithValue(error.message || "Failed to delete position");
	}
});

// Fetch position history
export const fetchPositionHistory = createAsyncThunk(
	"positions/fetchPositionHistory",
	async (positionId, { rejectWithValue }) => {
		try {
			const response = await api.get(`/hr/work_structures/positions/${positionId}/history/`);
			const data = response.data?.data || response.data;
			return {
				results: data.results || data || [],
				count: data.count || 0,
			};
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch position history");
		}
	}
);

// Fetch position hierarchy tree by business group
export const fetchPositionHierarchy = createAsyncThunk(
	"positions/fetchPositionHierarchy",
	async (businessGroupId, { rejectWithValue }) => {
		try {
			const response = await api.get("/hr/work_structures/positions/hierarchy/", {
				params: { bg: businessGroupId },
			});
			const data = response.data?.data || response.data;
			return data || [];
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch position hierarchy");
		}
	}
);

// Fetch direct reports for a position
export const fetchPositionDirectReports = createAsyncThunk(
	"positions/fetchPositionDirectReports",
	async (positionId, { rejectWithValue }) => {
		try {
			const response = await api.get(`/hr/work_structures/positions/${positionId}/direct-reports/`);
			const data = response.data?.data || response.data;
			return data || [];
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch direct reports");
		}
	}
);

const positionsSlice = createSlice({
	name: "positions",
	initialState: {
		positions: [],
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
		treeData: [],
		treeLoading: false,
		directReports: [],
		directReportsLoading: false,
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
			// Fetch positions
			.addCase(fetchPositions.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchPositions.fulfilled, (state, action) => {
				state.loading = false;
				state.positions = action.payload.results;
				state.count = action.payload.count;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchPositions.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Create position
			.addCase(createPosition.pending, state => {
				state.creating = true;
				state.actionError = null;
			})
			.addCase(createPosition.fulfilled, (state, action) => {
				state.creating = false;
				state.positions.unshift(action.payload);
				state.count += 1;
			})
			.addCase(createPosition.rejected, (state, action) => {
				state.creating = false;
				state.actionError = action.payload;
			})

			// Update position
			.addCase(updatePosition.pending, state => {
				state.updating = true;
				state.actionError = null;
			})
			.addCase(updatePosition.fulfilled, (state, action) => {
				state.updating = false;
				const index = state.positions.findIndex(p => p.id === action.payload.id);
				if (index !== -1) {
					state.positions[index] = action.payload;
				}
			})
			.addCase(updatePosition.rejected, (state, action) => {
				state.updating = false;
				state.actionError = action.payload;
			})

			// Delete position
			.addCase(deletePosition.pending, state => {
				state.deleting = true;
				state.actionError = null;
			})
			.addCase(deletePosition.fulfilled, (state, action) => {
				state.deleting = false;
				state.positions = state.positions.filter(p => p.id !== action.payload);
				state.count -= 1;
			})
			.addCase(deletePosition.rejected, (state, action) => {
				state.deleting = false;
				state.actionError = action.payload;
			})

			// Fetch position hierarchy
			.addCase(fetchPositionHierarchy.pending, state => {
				state.treeLoading = true;
			})
			.addCase(fetchPositionHierarchy.fulfilled, (state, action) => {
				state.treeLoading = false;
				state.treeData = action.payload;
			})
			.addCase(fetchPositionHierarchy.rejected, (state, action) => {
				state.treeLoading = false;
				state.error = action.payload;
			})

			// Fetch direct reports
			.addCase(fetchPositionDirectReports.pending, state => {
				state.directReportsLoading = true;
			})
			.addCase(fetchPositionDirectReports.fulfilled, (state, action) => {
				state.directReportsLoading = false;
				state.directReports = action.payload;
			})
			.addCase(fetchPositionDirectReports.rejected, (state, action) => {
				state.directReportsLoading = false;
				state.error = action.payload;
			});
	},
});

export const { setPage, clearError } = positionsSlice.actions;
export default positionsSlice.reducer;
