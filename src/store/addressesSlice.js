import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch addresses by person ID
export const fetchAddresses = createAsyncThunk(
	"addresses/fetchByPersonId",
	async (personId, { rejectWithValue }) => {
		try {
			const response = await api.get(`hr/person/addresses/?person=${personId}`);
			// Handle standard response format
			const data = response.data?.data ?? response.data;
			return {
				results: data?.results ?? (Array.isArray(data) ? data : []),
				count: data?.count ?? 0,
			};
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Failed to fetch addresses";
			return rejectWithValue(errorMessage);
		}
	}
);

// Create a new address
export const createAddress = createAsyncThunk("addresses/create", async (addressData, { rejectWithValue }) => {
	try {
        // The endpoint is likely expecting POST /hr/person/addresses/
		const response = await api.post("/hr/person/addresses/", addressData);
		return response.data?.data ?? response.data;
	} catch (error) {
		if (error.response?.data) {
            const errorData = error.response.data;
			let errorMessage = errorData.message || errorData.error || errorData.detail || "Failed to create address";
            // Map field errors if present
            if (typeof errorData === "object" && !errorMessage) {
                 errorMessage = Object.entries(errorData)
					.map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
					.join(" | ");
            }
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to create address");
	}
});

// Update an existing address
export const updateAddress = createAsyncThunk("addresses/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.put(`/hr/person/addresses/${id}/`, data);
		return response.data?.data ?? response.data;
	} catch (error) {
		if (error.response?.data) {
			const errorData = error.response.data;
			let errorMessage = errorData.message || errorData.error || errorData.detail || "Failed to update address";
			if (typeof errorData === "object" && !errorMessage) {
				errorMessage = Object.entries(errorData)
					.map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
					.join(" | ");
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to update address");
	}
});

const initialState = {
	addresses: [],
	loading: false,
	creating: false,
	updating: false,
	error: null,
	actionError: null,
};

const addressesSlice = createSlice({
	name: "addresses",
	initialState,
	reducers: {
		clearActionError: state => {
			state.actionError = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch addresses
			.addCase(fetchAddresses.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchAddresses.fulfilled, (state, action) => {
				state.loading = false;
				state.addresses = action.payload.results;
			})
			.addCase(fetchAddresses.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Create address
			.addCase(createAddress.pending, state => {
				state.creating = true;
				state.actionError = null;
			})
			.addCase(createAddress.fulfilled, (state, action) => {
				state.creating = false;
				// Optimistically add to list or let parent re-fetch
                // Assuming backend returns the created object
				if(action.payload) {
                    state.addresses.unshift(action.payload);
                }
			})
			.addCase(createAddress.rejected, (state, action) => {
				state.creating = false;
				state.actionError = action.payload;
			})
			// Update address
			.addCase(updateAddress.pending, state => {
				state.updating = true;
				state.actionError = null;
			})
			.addCase(updateAddress.fulfilled, (state, action) => {
				state.updating = false;
				const index = state.addresses.findIndex(addr => addr.id === action.payload.id);
				if (index !== -1) {
					state.addresses[index] = action.payload;
				}
			})
			.addCase(updateAddress.rejected, (state, action) => {
				state.updating = false;
				state.actionError = action.payload;
			});
	},
});

export const { clearActionError } = addressesSlice.actions;
export default addressesSlice.reducer;
