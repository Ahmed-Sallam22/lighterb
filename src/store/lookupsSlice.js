import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch all lookup types
export const fetchLookupTypes = createAsyncThunk("lookups/fetchLookupTypes", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/core/lookups/");
		return response.data?.data || response.data || [];
	} catch (error) {
		return rejectWithValue(error.message || "Failed to fetch lookup types");
	}
});

// Fetch lookup values by lookup type code
export const fetchLookupValues = createAsyncThunk(
	"lookups/fetchLookupValues",
	async ({ lookupType, parent = null }, { rejectWithValue }) => {
		try {
			let url = `/core/lookups/values/?lookup_type=${lookupType}`;
			if (parent) {
				url += `&parent=${parent}`;
			}
			const response = await api.get(url);
			const values = response.data?.data || response.data || [];
			return { lookupType, parent, values };
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch lookup values");
		}
	}
);

// Fetch multiple lookup types at once
export const fetchMultipleLookupValues = createAsyncThunk(
	"lookups/fetchMultipleLookupValues",
	async (lookupTypes, { rejectWithValue }) => {
		try {
			const promises = lookupTypes.map(async type => {
				const response = await api.get(`/core/lookups/values/?lookup_type=${type}`);
				return {
					lookupType: type,
					values: response.data?.data || response.data || [],
				};
			});
			const results = await Promise.all(promises);
			return results;
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch lookup values");
		}
	}
);

const lookupsSlice = createSlice({
	name: "lookups",
	initialState: {
		// All lookup types metadata
		lookupTypes: [],
		// Cache of lookup values by lookup type code
		// e.g., { COUNTRY: [...], CITY: [...], GENDER: [...] }
		lookupValues: {},
		// Cache for child lookups (e.g., cities of a country)
		// e.g., { "CITY_1000": [...] } where 1000 is the parent id
		childLookupValues: {},
		// Loading states
		loading: false,
		loadingValues: false,
		error: null,
	},
	reducers: {
		clearError: state => {
			state.error = null;
		},
		clearLookupValues: (state, action) => {
			if (action.payload) {
				delete state.lookupValues[action.payload];
			} else {
				state.lookupValues = {};
			}
		},
		clearChildLookupValues: (state, action) => {
			if (action.payload) {
				const { lookupType, parent } = action.payload;
				const key = `${lookupType}_${parent}`;
				delete state.childLookupValues[key];
			} else {
				state.childLookupValues = {};
			}
		},
	},
	extraReducers: builder => {
		builder
			// Fetch lookup types
			.addCase(fetchLookupTypes.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchLookupTypes.fulfilled, (state, action) => {
				state.loading = false;
				state.lookupTypes = action.payload;
			})
			.addCase(fetchLookupTypes.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Fetch lookup values
			.addCase(fetchLookupValues.pending, state => {
				state.loadingValues = true;
				state.error = null;
			})
			.addCase(fetchLookupValues.fulfilled, (state, action) => {
				state.loadingValues = false;
				const { lookupType, parent, values } = action.payload;
				if (parent) {
					// Store in childLookupValues with key like "CITY_1000"
					const key = `${lookupType}_${parent}`;
					state.childLookupValues[key] = values;
				} else {
					// Store in main lookupValues
					state.lookupValues[lookupType] = values;
				}
			})
			.addCase(fetchLookupValues.rejected, (state, action) => {
				state.loadingValues = false;
				state.error = action.payload;
			})

			// Fetch multiple lookup values
			.addCase(fetchMultipleLookupValues.pending, state => {
				state.loadingValues = true;
				state.error = null;
			})
			.addCase(fetchMultipleLookupValues.fulfilled, (state, action) => {
				state.loadingValues = false;
				action.payload.forEach(({ lookupType, values }) => {
					state.lookupValues[lookupType] = values;
				});
			})
			.addCase(fetchMultipleLookupValues.rejected, (state, action) => {
				state.loadingValues = false;
				state.error = action.payload;
			});
	},
});

export const { clearError, clearLookupValues, clearChildLookupValues } = lookupsSlice.actions;
export default lookupsSlice.reducer;
