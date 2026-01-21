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

// Fetch position titles lookup
export const fetchPositionTitles = createAsyncThunk("positions/fetchPositionTitles", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/core/lookups/values/?lookup_type=POSITION_TITLE");
		return response.data?.data || response.data || [];
	} catch (error) {
		return rejectWithValue(error.message || "Failed to fetch position titles");
	}
});

// Fetch position types lookup
export const fetchPositionTypes = createAsyncThunk("positions/fetchPositionTypes", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/core/lookups/values/?lookup_type=POSITION_TYPE");
		return response.data?.data || response.data || [];
	} catch (error) {
		return rejectWithValue(error.message || "Failed to fetch position types");
	}
});

// Fetch position statuses lookup
export const fetchPositionStatuses = createAsyncThunk(
	"positions/fetchPositionStatuses",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/core/lookups/values/?lookup_type=POSITION_STATUS");
			return response.data?.data || response.data || [];
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch position statuses");
		}
	}
);

// Fetch position categories lookup
export const fetchPositionCategories = createAsyncThunk(
	"positions/fetchPositionCategories",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/core/lookups/values/?lookup_type=POSITION_CATEGORY");
			return response.data?.data || response.data || [];
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch position categories");
		}
	}
);

// Fetch position families lookup
export const fetchPositionFamilies = createAsyncThunk(
	"positions/fetchPositionFamilies",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/core/lookups/values/?lookup_type=POSITION_FAMILY");
			return response.data?.data || response.data || [];
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch position families");
		}
	}
);

// Fetch position sync lookup
export const fetchPositionSyncs = createAsyncThunk("positions/fetchPositionSyncs", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/core/lookups/values/?lookup_type=POSITION_SYNC");
		return response.data?.data || response.data || [];
	} catch (error) {
		return rejectWithValue(error.message || "Failed to fetch position syncs");
	}
});

// Fetch payroll lookup
export const fetchPayrolls = createAsyncThunk("positions/fetchPayrolls", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/core/lookups/values/?lookup_type=PAYROLL");
		return response.data?.data || response.data || [];
	} catch (error) {
		return rejectWithValue(error.message || "Failed to fetch payrolls");
	}
});

// Fetch salary basis lookup
export const fetchSalaryBases = createAsyncThunk("positions/fetchSalaryBases", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/core/lookups/values/?lookup_type=SALARY_BASIS");
		return response.data?.data || response.data || [];
	} catch (error) {
		return rejectWithValue(error.message || "Failed to fetch salary bases");
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
			const response = await api.get(`/hr/work_structures/positions/${positionId}/versions/`);
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
		// Lookups
		positionTitles: [],
		positionTypes: [],
		positionStatuses: [],
		positionCategories: [],
		positionFamilies: [],
		positionSyncs: [],
		payrolls: [],
		salaryBases: [],
		lookupsLoading: false,
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
			})

			// Fetch position titles
			.addCase(fetchPositionTitles.pending, state => {
				state.lookupsLoading = true;
			})
			.addCase(fetchPositionTitles.fulfilled, (state, action) => {
				state.lookupsLoading = false;
				state.positionTitles = action.payload;
			})
			.addCase(fetchPositionTitles.rejected, (state, action) => {
				state.lookupsLoading = false;
				state.error = action.payload;
			})

			// Fetch position types
			.addCase(fetchPositionTypes.pending, state => {
				state.lookupsLoading = true;
			})
			.addCase(fetchPositionTypes.fulfilled, (state, action) => {
				state.lookupsLoading = false;
				state.positionTypes = action.payload;
			})
			.addCase(fetchPositionTypes.rejected, (state, action) => {
				state.lookupsLoading = false;
				state.error = action.payload;
			})

			// Fetch position statuses
			.addCase(fetchPositionStatuses.pending, state => {
				state.lookupsLoading = true;
			})
			.addCase(fetchPositionStatuses.fulfilled, (state, action) => {
				state.lookupsLoading = false;
				state.positionStatuses = action.payload;
			})
			.addCase(fetchPositionStatuses.rejected, (state, action) => {
				state.lookupsLoading = false;
				state.error = action.payload;
			})

			// Fetch position categories
			.addCase(fetchPositionCategories.pending, state => {
				state.lookupsLoading = true;
			})
			.addCase(fetchPositionCategories.fulfilled, (state, action) => {
				state.lookupsLoading = false;
				state.positionCategories = action.payload;
			})
			.addCase(fetchPositionCategories.rejected, (state, action) => {
				state.lookupsLoading = false;
				state.error = action.payload;
			})

			// Fetch position families
			.addCase(fetchPositionFamilies.pending, state => {
				state.lookupsLoading = true;
			})
			.addCase(fetchPositionFamilies.fulfilled, (state, action) => {
				state.lookupsLoading = false;
				state.positionFamilies = action.payload;
			})
			.addCase(fetchPositionFamilies.rejected, (state, action) => {
				state.lookupsLoading = false;
				state.error = action.payload;
			})

			// Fetch position syncs
			.addCase(fetchPositionSyncs.pending, state => {
				state.lookupsLoading = true;
			})
			.addCase(fetchPositionSyncs.fulfilled, (state, action) => {
				state.lookupsLoading = false;
				state.positionSyncs = action.payload;
			})
			.addCase(fetchPositionSyncs.rejected, (state, action) => {
				state.lookupsLoading = false;
				state.error = action.payload;
			})

			// Fetch payrolls
			.addCase(fetchPayrolls.pending, state => {
				state.lookupsLoading = true;
			})
			.addCase(fetchPayrolls.fulfilled, (state, action) => {
				state.lookupsLoading = false;
				state.payrolls = action.payload;
			})
			.addCase(fetchPayrolls.rejected, (state, action) => {
				state.lookupsLoading = false;
				state.error = action.payload;
			})

			// Fetch salary bases
			.addCase(fetchSalaryBases.pending, state => {
				state.lookupsLoading = true;
			})
			.addCase(fetchSalaryBases.fulfilled, (state, action) => {
				state.lookupsLoading = false;
				state.salaryBases = action.payload;
			})
			.addCase(fetchSalaryBases.rejected, (state, action) => {
				state.lookupsLoading = false;
				state.error = action.payload;
			});
	},
});

export const { setPage, clearError } = positionsSlice.actions;
export default positionsSlice.reducer;
