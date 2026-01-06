import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch all AP periods with optional filters and pagination
export const fetchAPPeriods = createAsyncThunk(
	"apPeriods/fetchAll",
	async ({ page = 1, page_size = 20, state = "", fiscal_year = "" } = {}, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);
			if (state) params.append("state", state);
			if (fiscal_year) params.append("fiscal_year", fiscal_year);

			const response = await api.get(`/finance/period/ap-periods/?${params.toString()}`);
			const data = response.data?.data || response.data?.results || response.data;
			return {
				periods: Array.isArray(data) ? data : data.results || [],
				count: response.data?.count || data?.count || (Array.isArray(data) ? data.length : 0),
				hasNext: !!response.data?.next || !!data?.next,
				hasPrevious: !!response.data?.previous || !!data?.previous,
			};
		} catch (error) {
			return rejectWithValue(error.response?.data || "Failed to fetch AP periods");
		}
	}
);

// Fetch single AP period by ID
export const fetchAPPeriod = createAsyncThunk("apPeriods/fetchOne", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/finance/period/ap-periods/${id}/`);
		return response.data?.data || response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || "Failed to fetch AP period");
	}
});

// Open an AP period
export const openAPPeriod = createAsyncThunk("apPeriods/open", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/finance/period/ap-periods/${id}/open/`);
		return { id, data: response.data?.data || response.data };
	} catch (error) {
		const errorData = error.response?.data || error.data || error;
		const errorMessage = errorData?.message || errorData?.error || "Failed to open AP period";
		return rejectWithValue(errorMessage);
	}
});

// Close an AP period
export const closeAPPeriod = createAsyncThunk("apPeriods/close", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/finance/period/ap-periods/${id}/close/`);
		return { id, data: response.data?.data || response.data };
	} catch (error) {
		const errorData = error.response?.data || error.data || error;
		const errorMessage = errorData?.message || errorData?.error || "Failed to close AP period";
		return rejectWithValue(errorMessage);
	}
});

const apPeriodsSlice = createSlice({
	name: "apPeriods",
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
		// Fetch All AP Periods
		builder
			.addCase(fetchAPPeriods.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchAPPeriods.fulfilled, (state, action) => {
				state.loading = false;
				state.periods = action.payload.periods;
				state.count = action.payload.count;
				state.hasNext = action.payload.hasNext;
				state.hasPrevious = action.payload.hasPrevious;
			})
			.addCase(fetchAPPeriods.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Fetch Single AP Period
		builder
			.addCase(fetchAPPeriod.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchAPPeriod.fulfilled, (state, action) => {
				state.loading = false;
				state.selectedPeriod = action.payload;
			})
			.addCase(fetchAPPeriod.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Open AP Period
		builder
			.addCase(openAPPeriod.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(openAPPeriod.fulfilled, (state, action) => {
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
			.addCase(openAPPeriod.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload;
			});

		// Close AP Period
		builder
			.addCase(closeAPPeriod.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(closeAPPeriod.fulfilled, (state, action) => {
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
			.addCase(closeAPPeriod.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload;
			});
	},
});

export const { clearError, clearSelectedPeriod, setPage } = apPeriodsSlice.actions;
export default apPeriodsSlice.reducer;
