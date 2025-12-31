import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch all default combinations with optional filters
export const fetchDefaultCombinations = createAsyncThunk(
	"defaultCombinations/fetchAll",
	async (filters = {}, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== "" && value !== null && value !== undefined) {
					params.append(key, value);
				}
			});
			const queryString = params.toString();
			const url = queryString
				? `/finance/default-combinations/?${queryString}`
				: "/finance/default-combinations/";
			const response = await api.get(url);
			return response.data?.data || response.data?.results || response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || "Failed to fetch default combinations");
		}
	}
);

// Fetch single default combination by ID
export const fetchDefaultCombination = createAsyncThunk(
	"defaultCombinations/fetchOne",
	async (id, { rejectWithValue }) => {
		try {
			const response = await api.get(`/finance/default-combinations/${id}/`);
			return response.data?.data || response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || "Failed to fetch default combination");
		}
	}
);

// Create a new default combination
export const createDefaultCombination = createAsyncThunk(
	"defaultCombinations/create",
	async (data, { rejectWithValue }) => {
		try {
			const response = await api.post("/finance/default-combinations/", data);
			return response.data?.data || response.data;
		} catch (error) {
			const errorData = error.response?.data || error.data || error;
			const errorMessage = errorData?.message || errorData?.error || "Failed to create default combination";
			return rejectWithValue(errorMessage);
		}
	}
);

// Update an existing default combination
export const updateDefaultCombination = createAsyncThunk(
	"defaultCombinations/update",
	async ({ id, data }, { rejectWithValue }) => {
		try {
			const response = await api.patch(`/finance/default-combinations/${id}/`, data);
			return response.data?.data || response.data;
		} catch (error) {
			const errorData = error.response?.data || error.data || error;
			const errorMessage = errorData?.message || errorData?.error || "Failed to update default combination";
			return rejectWithValue(errorMessage);
		}
	}
);

// Delete a default combination
export const deleteDefaultCombination = createAsyncThunk(
	"defaultCombinations/delete",
	async (id, { rejectWithValue }) => {
		try {
			await api.delete(`/finance/default-combinations/${id}/`);
			return id;
		} catch (error) {
			const errorData = error.response?.data || error.data || error;
			const errorMessage = errorData?.message || errorData?.error || "Failed to delete default combination";
			return rejectWithValue(errorMessage);
		}
	}
);

const defaultCombinationsSlice = createSlice({
	name: "defaultCombinations",
	initialState: {
		combinations: [],
		selectedCombination: null,
		loading: false,
		error: null,
	},
	reducers: {
		clearError: state => {
			state.error = null;
		},
		clearSelectedCombination: state => {
			state.selectedCombination = null;
		},
	},
	extraReducers: builder => {
		// Fetch All Default Combinations
		builder
			.addCase(fetchDefaultCombinations.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchDefaultCombinations.fulfilled, (state, action) => {
				state.loading = false;
				state.combinations = action.payload;
			})
			.addCase(fetchDefaultCombinations.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Fetch Single Default Combination
		builder
			.addCase(fetchDefaultCombination.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchDefaultCombination.fulfilled, (state, action) => {
				state.loading = false;
				state.selectedCombination = action.payload;
			})
			.addCase(fetchDefaultCombination.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Create Default Combination
		builder
			.addCase(createDefaultCombination.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(createDefaultCombination.fulfilled, (state, action) => {
				state.loading = false;
				state.combinations.push(action.payload);
			})
			.addCase(createDefaultCombination.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Update Default Combination
		builder
			.addCase(updateDefaultCombination.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateDefaultCombination.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.combinations.findIndex(c => c.id === action.payload.id);
				if (index !== -1) {
					state.combinations[index] = action.payload;
				}
			})
			.addCase(updateDefaultCombination.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Delete Default Combination
		builder
			.addCase(deleteDefaultCombination.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteDefaultCombination.fulfilled, (state, action) => {
				state.loading = false;
				state.combinations = state.combinations.filter(c => c.id !== action.payload);
			})
			.addCase(deleteDefaultCombination.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { clearError, clearSelectedCombination } = defaultCombinationsSlice.actions;
export default defaultCombinationsSlice.reducer;
