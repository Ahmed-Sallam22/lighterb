import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch all GL periods with optional filters and pagination
export const fetchGLPeriods = createAsyncThunk(
	"glPeriods/fetchAll",
	async ({ page = 1, page_size = 20, state = "", fiscal_year = "" } = {}, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);
			if (state) params.append("state", state);
			if (fiscal_year) params.append("fiscal_year", fiscal_year);

			const response = await api.get(`/finance/period/gl-periods/?${params.toString()}`);
			const data = response.data?.data || response.data?.results || response.data;
			return {
				periods: Array.isArray(data) ? data : data.results || [],
				count: response.data?.count || data?.count || (Array.isArray(data) ? data.length : 0),
				hasNext: !!response.data?.next || !!data?.next,
				hasPrevious: !!response.data?.previous || !!data?.previous,
			};
		} catch (error) {
			return rejectWithValue(error.response?.data || "Failed to fetch GL periods");
		}
	}
);

// Fetch single GL period by ID
export const fetchGLPeriod = createAsyncThunk("glPeriods/fetchOne", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/finance/period/gl-periods/${id}/`);
		return response.data?.data || response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || "Failed to fetch GL period");
	}
});

// Open a GL period
export const openGLPeriod = createAsyncThunk("glPeriods/open", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/finance/period/gl-periods/${id}/open/`);
		return { id, data: response.data?.data || response.data };
	} catch (error) {
		const errorData = error.response?.data || error.data || error;
		const errorMessage = errorData?.message || errorData?.error || "Failed to open GL period";
		return rejectWithValue(errorMessage);
	}
});

// Close a GL period
export const closeGLPeriod = createAsyncThunk("glPeriods/close", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/finance/period/gl-periods/${id}/close/`);
		return { id, data: response.data?.data || response.data };
	} catch (error) {
		const errorData = error.response?.data || error.data || error;
		const errorMessage = errorData?.message || errorData?.error || "Failed to close GL period";
		return rejectWithValue(errorMessage);
	}
});

const glPeriodsSlice = createSlice({
	name: "glPeriods",
	initialState: {
		periods: [],
		selectedPeriod: null,
		loading: false,
		actionLoading: false,
		error: null,
		page: 1,
		count: 0,
		hasNext: false,
		hasPrevious: false,
	},
	reducers: {
		clearError: state => {
			state.error = null;
		},
		clearSelectedPeriod: state => {
			state.selectedPeriod = null;
		},
		setPage: (state, action) => {
			state.page = action.payload;
		},
	},
	extraReducers: builder => {
		// Fetch All GL Periods
		builder
			.addCase(fetchGLPeriods.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchGLPeriods.fulfilled, (state, action) => {
				state.loading = false;
				state.periods = action.payload.periods;
				state.count = action.payload.count;
				state.hasNext = action.payload.hasNext;
				state.hasPrevious = action.payload.hasPrevious;
			})
			.addCase(fetchGLPeriods.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Fetch Single GL Period
		builder
			.addCase(fetchGLPeriod.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchGLPeriod.fulfilled, (state, action) => {
				state.loading = false;
				state.selectedPeriod = action.payload;
			})
			.addCase(fetchGLPeriod.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Open GL Period
		builder
			.addCase(openGLPeriod.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(openGLPeriod.fulfilled, (state, action) => {
				state.actionLoading = false;
				// Update the period state in the list
				const index = state.periods.findIndex(p => p.id === action.payload.id);
				if (index !== -1) {
					state.periods[index].state = "open";
				}
				if (state.selectedPeriod?.id === action.payload.id) {
					state.selectedPeriod.state = "open";
				}
			})
			.addCase(openGLPeriod.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload;
			});

		// Close GL Period
		builder
			.addCase(closeGLPeriod.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(closeGLPeriod.fulfilled, (state, action) => {
				state.actionLoading = false;
				// Update the period state in the list
				const index = state.periods.findIndex(p => p.id === action.payload.id);
				if (index !== -1) {
					state.periods[index].state = "closed";
				}
				if (state.selectedPeriod?.id === action.payload.id) {
					state.selectedPeriod.state = "closed";
				}
			})
			.addCase(closeGLPeriod.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload;
			});
	},
});

export const { clearError, clearSelectedPeriod, setPage } = glPeriodsSlice.actions;
export default glPeriodsSlice.reducer;
