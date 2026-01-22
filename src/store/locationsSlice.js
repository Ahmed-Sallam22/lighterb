import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch locations with pagination
export const fetchLocations = createAsyncThunk("locations/fetchLocations", async (params = {}, { rejectWithValue }) => {
	try {
		const response = await api.get("/hr/work_structures/locations/", { params });
		const data = response.data?.data || response.data;
		return {
			results: data.results || data || [],
			count: data.count || 0,
			next: data.next,
			previous: data.previous,
		};
	} catch (error) {
		return rejectWithValue(error.message || "Failed to fetch locations");
	}
});

// Fetch single location
export const fetchLocation = createAsyncThunk("locations/fetchLocation", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/hr/work_structures/locations/${id}/`);
		return response.data?.data || response.data;
	} catch (error) {
		return rejectWithValue(error.message || "Failed to fetch location");
	}
});

// Create a new location
export const createLocation = createAsyncThunk(
	"locations/createLocation",
	async (locationData, { rejectWithValue }) => {
		try {
			const response = await api.post("/hr/work_structures/locations/", locationData);
			return response.data?.data || response.data;
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.message || "Failed to create location");
		}
	}
);

// Update a location
export const updateLocation = createAsyncThunk(
	"locations/updateLocation",
	async ({ id, data }, { rejectWithValue }) => {
		try {
			const response = await api.patch(`/hr/work_structures/locations/${id}/`, data);
			return response.data?.data || response.data;
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.message || "Failed to update location");
		}
	}
);

// Delete a location
export const deleteLocation = createAsyncThunk("locations/deleteLocation", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/hr/work_structures/locations/${id}/`);
		return id;
	} catch (error) {
		return rejectWithValue(error.message || "Failed to delete location");
	}
});

// Fetch countries from lookups API
export const fetchCountriesLookup = createAsyncThunk(
	"locations/fetchCountriesLookup",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/core/lookups/values/?lookup_type=Country");
			return response.data?.data || response.data || [];
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch countries");
		}
	}
);

// Fetch cities from lookups API (with parent country)
export const fetchCitiesLookup = createAsyncThunk(
	"locations/fetchCitiesLookup",
	async (countryName, { rejectWithValue }) => {
		try {
			const response = await api.get(`/core/lookups/values/?lookup_type=City&parent_name=${countryName}`);
			return response.data?.data || response.data || [];
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch cities");
		}
	}
);

const locationsSlice = createSlice({
	name: "locations",
	initialState: {
		locations: [],
		currentLocation: null,
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
		// Lookups
		countries: [],
		cities: [],
		countriesLoading: false,
		citiesLoading: false,
	},
	reducers: {
		setPage: (state, action) => {
			state.page = action.payload;
		},
		clearError: state => {
			state.error = null;
			state.actionError = null;
		},
		clearCities: state => {
			state.cities = [];
		},
	},
	extraReducers: builder => {
		builder
			// Fetch locations
			.addCase(fetchLocations.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchLocations.fulfilled, (state, action) => {
				state.loading = false;
				state.locations = action.payload.results;
				state.count = action.payload.count;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchLocations.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch single location
			.addCase(fetchLocation.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchLocation.fulfilled, (state, action) => {
				state.loading = false;
				state.currentLocation = action.payload;
			})
			.addCase(fetchLocation.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Create location
			.addCase(createLocation.pending, state => {
				state.creating = true;
				state.actionError = null;
			})
			.addCase(createLocation.fulfilled, (state, action) => {
				state.creating = false;
				state.locations.unshift(action.payload);
				state.count += 1;
			})
			.addCase(createLocation.rejected, (state, action) => {
				state.creating = false;
				state.actionError = action.payload;
			})

			// Update location
			.addCase(updateLocation.pending, state => {
				state.updating = true;
				state.actionError = null;
			})
			.addCase(updateLocation.fulfilled, (state, action) => {
				state.updating = false;
				const index = state.locations.findIndex(l => l.id === action.payload.id);
				if (index !== -1) {
					state.locations[index] = action.payload;
				}
			})
			.addCase(updateLocation.rejected, (state, action) => {
				state.updating = false;
				state.actionError = action.payload;
			})

			// Delete location
			.addCase(deleteLocation.pending, state => {
				state.deleting = true;
				state.actionError = null;
			})
			.addCase(deleteLocation.fulfilled, (state, action) => {
				state.deleting = false;
				state.locations = state.locations.filter(l => l.id !== action.payload);
				state.count -= 1;
			})
			.addCase(deleteLocation.rejected, (state, action) => {
				state.deleting = false;
				state.actionError = action.payload;
			})

			// Fetch countries lookup
			.addCase(fetchCountriesLookup.pending, state => {
				state.countriesLoading = true;
			})
			.addCase(fetchCountriesLookup.fulfilled, (state, action) => {
				state.countriesLoading = false;
				state.countries = action.payload;
			})
			.addCase(fetchCountriesLookup.rejected, (state, action) => {
				state.countriesLoading = false;
				state.error = action.payload;
			})

			// Fetch cities lookup
			.addCase(fetchCitiesLookup.pending, state => {
				state.citiesLoading = true;
			})
			.addCase(fetchCitiesLookup.fulfilled, (state, action) => {
				state.citiesLoading = false;
				state.cities = action.payload;
			})
			.addCase(fetchCitiesLookup.rejected, (state, action) => {
				state.citiesLoading = false;
				state.error = action.payload;
			});
	},
});

export const { setPage, clearError, clearCities } = locationsSlice.actions;
export default locationsSlice.reducer;
