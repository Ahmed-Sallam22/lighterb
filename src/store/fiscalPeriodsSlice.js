import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch all periods with optional filters
export const fetchPeriods = createAsyncThunk("fiscalPeriods/fetchAll", async (filters = {}, { rejectWithValue }) => {
	try {
		const params = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== "" && value !== null && value !== undefined) {
				params.append(key, value);
			}
		});
		const queryString = params.toString();
		const url = queryString ? `/finance/period/periods/?${queryString}` : "/finance/period/periods/";
		const response = await api.get(url);
		return response.data?.data || response.data?.results || response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || "Failed to fetch periods");
	}
});

// Fetch single period by ID
export const fetchPeriod = createAsyncThunk("fiscalPeriods/fetchOne", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/finance/period/periods/${id}/`);
		return response.data?.data || response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || "Failed to fetch period");
	}
});

// Create a new period
export const createPeriod = createAsyncThunk("fiscalPeriods/create", async (data, { rejectWithValue }) => {
	try {
		const response = await api.post("/finance/period/periods/", data);
		return response.data?.data || response.data;
	} catch (error) {
		const errorData = error.response?.data || error.data || error;
		const errorMessage = errorData?.message || errorData?.error || "Failed to create period";
		return rejectWithValue(errorMessage);
	}
});

// Update an existing period
export const updatePeriod = createAsyncThunk("fiscalPeriods/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.put(`/finance/period/periods/${id}/`, data);
		return response.data?.data || response.data;
	} catch (error) {
		const errorData = error.response?.data || error.data || error;
		const errorMessage = errorData?.message || errorData?.error || "Failed to update period";
		return rejectWithValue(errorMessage);
	}
});

// Delete a period
export const deletePeriod = createAsyncThunk("fiscalPeriods/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/finance/period/periods/${id}/`);
		return id;
	} catch (error) {
		const errorData = error.response?.data || error.data || error;
		const errorMessage = errorData?.message || errorData?.error || "Failed to delete period";
		return rejectWithValue(errorMessage);
	}
});

// Generate preview of periods
export const generatePeriodsPreview = createAsyncThunk(
	"fiscalPeriods/generatePreview",
	async (data, { rejectWithValue }) => {
		try {
			const response = await api.post("/finance/period/periods/generate-preview/", data);
			return response.data?.data || response.data;
		} catch (error) {
			const errorData = error.response?.data || error.data || error;
			const errorMessage = errorData?.message || errorData?.error || "Failed to generate periods preview";
			return rejectWithValue(errorMessage);
		}
	}
);

// Bulk save periods
export const bulkSavePeriods = createAsyncThunk("fiscalPeriods/bulkSave", async (periods, { rejectWithValue }) => {
	try {
		const response = await api.post("/finance/period/periods/bulk-save/", { periods });
		return response.data?.data || response.data;
	} catch (error) {
		const errorData = error.response?.data || error.data || error;
		const errorMessage = errorData?.message || errorData?.error || "Failed to save periods";
		return rejectWithValue(errorMessage);
	}
});

const fiscalPeriodsSlice = createSlice({
	name: "fiscalPeriods",
	initialState: {
		periods: [],
		selectedPeriod: null,
		previewData: null,
		loading: false,
		previewLoading: false,
		error: null,
	},
	reducers: {
		clearError: state => {
			state.error = null;
		},
		clearSelectedPeriod: state => {
			state.selectedPeriod = null;
		},
		clearPreviewData: state => {
			state.previewData = null;
		},
		updatePreviewPeriod: (state, action) => {
			const { index, data } = action.payload;
			if (state.previewData?.periods && state.previewData.periods[index]) {
				state.previewData.periods[index] = { ...state.previewData.periods[index], ...data };
			}
		},
		swapPreviewPeriods: (state, action) => {
			const { fromIndex, toIndex } = action.payload;
			if (state.previewData?.periods) {
				const periods = [...state.previewData.periods];
				if (periods[fromIndex] && periods[toIndex]) {
					// Swap the periods
					const temp = periods[fromIndex];
					periods[fromIndex] = periods[toIndex];
					periods[toIndex] = temp;
					// Update period numbers to reflect new positions
					periods.forEach((period, idx) => {
						period.period_number = idx + 1;
					});
					state.previewData.periods = periods;
				}
			}
		},
	},
	extraReducers: builder => {
		// Fetch All Periods
		builder
			.addCase(fetchPeriods.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchPeriods.fulfilled, (state, action) => {
				state.loading = false;
				state.periods = action.payload;
			})
			.addCase(fetchPeriods.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Fetch Single Period
		builder
			.addCase(fetchPeriod.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchPeriod.fulfilled, (state, action) => {
				state.loading = false;
				state.selectedPeriod = action.payload;
			})
			.addCase(fetchPeriod.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Create Period
		builder
			.addCase(createPeriod.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(createPeriod.fulfilled, (state, action) => {
				state.loading = false;
				state.periods.push(action.payload);
			})
			.addCase(createPeriod.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Update Period
		builder
			.addCase(updatePeriod.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updatePeriod.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.periods.findIndex(p => p.id === action.payload.id);
				if (index !== -1) {
					state.periods[index] = action.payload;
				}
			})
			.addCase(updatePeriod.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Delete Period
		builder
			.addCase(deletePeriod.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deletePeriod.fulfilled, (state, action) => {
				state.loading = false;
				state.periods = state.periods.filter(p => p.id !== action.payload);
			})
			.addCase(deletePeriod.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Generate Preview
		builder
			.addCase(generatePeriodsPreview.pending, state => {
				state.previewLoading = true;
				state.error = null;
			})
			.addCase(generatePeriodsPreview.fulfilled, (state, action) => {
				state.previewLoading = false;
				state.previewData = action.payload;
			})
			.addCase(generatePeriodsPreview.rejected, (state, action) => {
				state.previewLoading = false;
				state.error = action.payload;
			});

		// Bulk Save
		builder
			.addCase(bulkSavePeriods.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(bulkSavePeriods.fulfilled, (state, action) => {
				state.loading = false;
				state.previewData = null;
				// Optionally update periods list
				if (action.payload?.periods) {
					state.periods = action.payload.periods;
				}
			})
			.addCase(bulkSavePeriods.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { clearError, clearSelectedPeriod, clearPreviewData, updatePreviewPeriod, swapPreviewPeriods } =
	fiscalPeriodsSlice.actions;
export default fiscalPeriodsSlice.reducer;
