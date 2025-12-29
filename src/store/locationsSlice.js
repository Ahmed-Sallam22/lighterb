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

const locationsSlice = createSlice({
	name: "locations",
	initialState: {
		locations: [],
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
			});
	},
});

export const { setPage, clearError } = locationsSlice.actions;
export default locationsSlice.reducer;
