import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch all AR periods with optional filters and pagination
export const fetchARPeriods = createAsyncThunk(
	"arPeriods/fetchAll",
	async ({ page = 1, page_size = 20, state = "", fiscal_year = "" } = {}, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);
			if (state) params.append("state", state);
			if (fiscal_year) params.append("fiscal_year", fiscal_year);

			const response = await api.get(`/finance/period/ar-periods/?${params.toString()}`);
			const data = response.data?.data || response.data?.results || response.data;
			return {
				periods: Array.isArray(data) ? data : data.results || [],
				count: response.data?.count || data?.count || (Array.isArray(data) ? data.length : 0),
				hasNext: !!response.data?.next || !!data?.next,
				hasPrevious: !!response.data?.previous || !!data?.previous,
			};
		} catch (error) {
			return rejectWithValue(error.response?.data || "Failed to fetch AR periods");
		}
	}
);

// Fetch single AR period by ID
export const fetchARPeriod = createAsyncThunk("arPeriods/fetchOne", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/finance/period/ar-periods/${id}/`);
		return response.data?.data || response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || "Failed to fetch AR period");
	}
});

// Open an AR period
export const openARPeriod = createAsyncThunk("arPeriods/open", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/finance/period/ar-periods/${id}/open/`);
		return { id, data: response.data?.data || response.data };
	} catch (error) {
		const errorData = error.response?.data || error.data || error;
		const errorMessage = errorData?.message || errorData?.error || "Failed to open AR period";
		return rejectWithValue(errorMessage);
	}
});

// Close an AR period
export const closeARPeriod = createAsyncThunk("arPeriods/close", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/finance/period/ar-periods/${id}/close/`);
		return { id, data: response.data?.data || response.data };
	} catch (error) {
		const errorData = error.response?.data || error.data || error;
		const errorMessage = errorData?.message || errorData?.error || "Failed to close AR period";
		return rejectWithValue(errorMessage);
	}
});

const arPeriodsSlice = createSlice({
	name: "arPeriods",
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
		// Fetch All AR Periods
		builder
			.addCase(fetchARPeriods.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchARPeriods.fulfilled, (state, action) => {
				state.loading = false;
				state.periods = action.payload.periods;
				state.count = action.payload.count;
				state.hasNext = action.payload.hasNext;
				state.hasPrevious = action.payload.hasPrevious;
			})
			.addCase(fetchARPeriods.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Fetch Single AR Period
		builder
			.addCase(fetchARPeriod.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchARPeriod.fulfilled, (state, action) => {
				state.loading = false;
				state.selectedPeriod = action.payload;
			})
			.addCase(fetchARPeriod.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Open AR Period
		builder
			.addCase(openARPeriod.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(openARPeriod.fulfilled, (state, action) => {
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
			.addCase(openARPeriod.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload;
			});

		// Close AR Period
		builder
			.addCase(closeARPeriod.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(closeARPeriod.fulfilled, (state, action) => {
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
			.addCase(closeARPeriod.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload;
			});
	},
});

export const { clearError, clearSelectedPeriod, setPage } = arPeriodsSlice.actions;
export default arPeriodsSlice.reducer;
