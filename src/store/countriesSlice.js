import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch all countries
export const fetchCountries = createAsyncThunk(
	"countries/fetchCountries",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/finance/core/countries/");
			return response.data?.data?.results || response.data?.results || response.data || [];
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch countries");
		}
	}
);

// Create a new country
export const createCountry = createAsyncThunk(
	"countries/createCountry",
	async (countryData, { rejectWithValue }) => {
		try {
			const response = await api.post("/finance/core/countries/", countryData);
			return response.data?.data || response.data;
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.message || "Failed to create country");
		}
	}
);

// Update an existing country
export const updateCountry = createAsyncThunk(
	"countries/updateCountry",
	async ({ id, data }, { rejectWithValue }) => {
		try {
			const response = await api.put(`/finance/core/countries/${id}/`, data);
			return response.data?.data || response.data;
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.message || "Failed to update country");
		}
	}
);

// Delete a country
export const deleteCountry = createAsyncThunk(
	"countries/deleteCountry",
	async (id, { rejectWithValue }) => {
		try {
			await api.delete(`/finance/core/countries/${id}/`);
			return id;
		} catch (error) {
			return rejectWithValue(error.message || "Failed to delete country");
		}
	}
);

const countriesSlice = createSlice({
	name: "countries",
	initialState: {
		countries: [],
		loading: false,
		error: null,
		creating: false,
		updating: false,
		deleting: false,
		actionError: null,
	},
	reducers: {
		clearError: state => {
			state.error = null;
			state.actionError = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch countries
			.addCase(fetchCountries.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCountries.fulfilled, (state, action) => {
				state.loading = false;
				state.countries = action.payload;
			})
			.addCase(fetchCountries.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Create country
			.addCase(createCountry.pending, state => {
				state.creating = true;
				state.actionError = null;
			})
			.addCase(createCountry.fulfilled, (state, action) => {
				state.creating = false;
				state.countries.push(action.payload);
			})
			.addCase(createCountry.rejected, (state, action) => {
				state.creating = false;
				state.actionError = action.payload;
			})

			// Update country
			.addCase(updateCountry.pending, state => {
				state.updating = true;
				state.actionError = null;
			})
			.addCase(updateCountry.fulfilled, (state, action) => {
				state.updating = false;
				const index = state.countries.findIndex(c => c.id === action.payload.id);
				if (index !== -1) {
					state.countries[index] = action.payload;
				}
			})
			.addCase(updateCountry.rejected, (state, action) => {
				state.updating = false;
				state.actionError = action.payload;
			})

			// Delete country
			.addCase(deleteCountry.pending, state => {
				state.deleting = true;
				state.actionError = null;
			})
			.addCase(deleteCountry.fulfilled, (state, action) => {
				state.deleting = false;
				state.countries = state.countries.filter(c => c.id !== action.payload);
			})
			.addCase(deleteCountry.rejected, (state, action) => {
				state.deleting = false;
				state.actionError = action.payload;
			});
	},
});

export const { clearError } = countriesSlice.actions;
export default countriesSlice.reducer;
