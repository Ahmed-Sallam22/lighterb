import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch all currencies
export const fetchCurrencies = createAsyncThunk("currencies/fetchAll", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/finance/core/currencies/");
		return response.data.data.results;
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to fetch currencies" });
	}
});

// Create a new currency
export const createCurrency = createAsyncThunk("currencies/create", async (currencyData, { rejectWithValue }) => {
	try {
		const response = await api.post("/finance/core/currencies/", currencyData);
		return response.data.data;
	} catch (error) {
		const errorData = error.response?.data;

		// Handle field-specific errors
		if (errorData && typeof errorData === "object") {
			return rejectWithValue(errorData);
		}

		return rejectWithValue({ message: error.message || "Failed to create currency" });
	}
});

// Update a currency
export const updateCurrency = createAsyncThunk("currencies/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.put(`/finance/core/currencies/${id}/`, data);
		return response.data.data;
	} catch (error) {
		const errorData = error.response?.data;

		// Handle field-specific errors
		if (errorData && typeof errorData === "object") {
			return rejectWithValue(errorData);
		}

		return rejectWithValue({ message: error.message || "Failed to update currency" });
	}
});

// Delete a currency
export const deleteCurrency = createAsyncThunk("currencies/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/finance/core/currencies/${id}/`);
		return id;
	} catch (error) {
		const errorData = error.response?.data;

		// Handle field-specific errors
		if (errorData && typeof errorData === "object") {
			return rejectWithValue(errorData);
		}

		return rejectWithValue({ message: error.message || "Failed to delete currency" });
	}
});

// Convert currency to base
export const convertToBaseCurrency = createAsyncThunk(
	"currencies/convertToBase",
	async ({ id, amount }, { rejectWithValue }) => {
		try {
			const response = await api.post(`/finance/core/currencies/${id}/convert-to-base/`, { amount });
			return response.data.data;
		} catch (error) {
			const errorData = error.response?.data;

			if (errorData && typeof errorData === "object") {
				return rejectWithValue(errorData);
			}

			return rejectWithValue({ message: error.message || "Failed to convert currency" });
		}
	}
);

// Toggle currency active status
export const toggleCurrencyActive = createAsyncThunk("currencies/toggleActive", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/finance/core/currencies/${id}/toggle-active/`);
		return response.data.data;
	} catch (error) {
		const errorData = error.response?.data;

		if (errorData && typeof errorData === "object") {
			return rejectWithValue(errorData);
		}

		return rejectWithValue({ message: error.message || "Failed to toggle active status" });
	}
});

const currenciesSlice = createSlice({
	name: "currencies",
	initialState: {
		currencies: [],
		loading: false,
		error: null,
	},
	reducers: {
		clearError: state => {
			state.error = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch currencies
			.addCase(fetchCurrencies.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCurrencies.fulfilled, (state, action) => {
				state.loading = false;
				state.currencies = action.payload;
			})
			.addCase(fetchCurrencies.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload?.message || "Failed to fetch currencies";
			})

			// Create currency
			.addCase(createCurrency.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(createCurrency.fulfilled, (state, action) => {
				state.loading = false;
				state.currencies.push(action.payload);
			})
			.addCase(createCurrency.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload?.message || "Failed to create currency";
			})

			// Update currency
			.addCase(updateCurrency.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateCurrency.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.currencies.findIndex(c => c.id === action.payload.id);
				if (index !== -1) {
					state.currencies[index] = action.payload;
				}
			})
			.addCase(updateCurrency.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload?.message || "Failed to update currency";
			})

			// Delete currency
			.addCase(deleteCurrency.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteCurrency.fulfilled, (state, action) => {
				state.loading = false;
				state.currencies = state.currencies.filter(c => c.id !== action.payload);
			})
			.addCase(deleteCurrency.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload?.message || "Failed to delete currency";
			})

			// Toggle currency active
			.addCase(toggleCurrencyActive.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(toggleCurrencyActive.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.currencies.findIndex(c => c.id === action.payload.id);
				if (index !== -1) {
					state.currencies[index].is_active = action.payload.is_active;
				}
			})
			.addCase(toggleCurrencyActive.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload?.message || "Failed to toggle active status";
			});
	},
});

export const { clearError } = currenciesSlice.actions;
export default currenciesSlice.reducer;
