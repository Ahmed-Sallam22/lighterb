import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch all UOMs with optional filters
export const fetchUOMs = createAsyncThunk("uom/fetchUOMs", async (params = {}, { rejectWithValue }) => {
	try {
		const queryParams = new URLSearchParams();

		if (params.search) queryParams.append("search", params.search);
		if (params.is_active !== undefined && params.is_active !== "") {
			queryParams.append("is_active", params.is_active);
		}
		if (params.uom_type && params.uom_type !== "all") {
			queryParams.append("uom_type", params.uom_type);
		}

		const queryString = queryParams.toString();
		const url = `/procurement/catalog/uom/${queryString ? `?${queryString}` : ""}`;

		const response = await api.get(url);
		return response.data?.data || response.data?.results || response.data || [];
	} catch (error) {
		return rejectWithValue(error.message || "Failed to fetch units of measure");
	}
});

// Create a new UOM
export const createUOM = createAsyncThunk("uom/createUOM", async (uomData, { rejectWithValue }) => {
	try {
		const response = await api.post("/procurement/catalog/uom/", uomData);
		return response.data?.data || response.data;
	} catch (error) {
		if (error.data) {
			return rejectWithValue(error.data);
		}
		return rejectWithValue(error.message || "Failed to create unit of measure");
	}
});

// Update an existing UOM
export const updateUOM = createAsyncThunk("uom/updateUOM", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.put(`/procurement/catalog/uom/${id}/`, data);
		return response.data?.data || response.data;
	} catch (error) {
		if (error.data) {
			return rejectWithValue(error.data);
		}
		return rejectWithValue(error.message || "Failed to update unit of measure");
	}
});

// Delete a UOM
export const deleteUOM = createAsyncThunk("uom/deleteUOM", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/procurement/catalog/uom/${id}/`);
		return id;
	} catch (error) {
		return rejectWithValue(error.message || "Failed to delete unit of measure");
	}
});

// Toggle UOM active status
export const toggleUOMActive = createAsyncThunk("uom/toggleUOMActive", async (id, { getState, rejectWithValue }) => {
	try {
		const state = getState();
		const uom = state.uom.uoms.find(u => u.id === id);
		if (!uom) {
			return rejectWithValue("UOM not found");
		}

		const response = await api.put(`/procurement/catalog/uom/${id}/`, {
			...uom,
			is_active: !uom.is_active,
		});
		return response.data?.data || response.data;
	} catch (error) {
		if (error.data) {
			return rejectWithValue(error.data);
		}
		return rejectWithValue(error.message || "Failed to toggle UOM status");
	}
});

const uomSlice = createSlice({
	name: "uom",
	initialState: {
		uoms: [],
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
			// Fetch UOMs
			.addCase(fetchUOMs.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchUOMs.fulfilled, (state, action) => {
				state.loading = false;
				state.uoms = action.payload;
			})
			.addCase(fetchUOMs.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Create UOM
			.addCase(createUOM.pending, state => {
				state.creating = true;
				state.actionError = null;
			})
			.addCase(createUOM.fulfilled, (state, action) => {
				state.creating = false;
				state.uoms.push(action.payload);
			})
			.addCase(createUOM.rejected, (state, action) => {
				state.creating = false;
				state.actionError = action.payload;
			})

			// Update UOM
			.addCase(updateUOM.pending, state => {
				state.updating = true;
				state.actionError = null;
			})
			.addCase(updateUOM.fulfilled, (state, action) => {
				state.updating = false;
				const index = state.uoms.findIndex(u => u.id === action.payload.id);
				if (index !== -1) {
					state.uoms[index] = action.payload;
				}
			})
			.addCase(updateUOM.rejected, (state, action) => {
				state.updating = false;
				state.actionError = action.payload;
			})

			// Delete UOM
			.addCase(deleteUOM.pending, state => {
				state.deleting = true;
				state.actionError = null;
			})
			.addCase(deleteUOM.fulfilled, (state, action) => {
				state.deleting = false;
				state.uoms = state.uoms.filter(u => u.id !== action.payload);
			})
			.addCase(deleteUOM.rejected, (state, action) => {
				state.deleting = false;
				state.actionError = action.payload;
			})

			// Toggle UOM Active
			.addCase(toggleUOMActive.pending, state => {
				state.updating = true;
				state.actionError = null;
			})
			.addCase(toggleUOMActive.fulfilled, (state, action) => {
				state.updating = false;
				const index = state.uoms.findIndex(u => u.id === action.payload.id);
				if (index !== -1) {
					state.uoms[index] = action.payload;
				}
			})
			.addCase(toggleUOMActive.rejected, (state, action) => {
				state.updating = false;
				state.actionError = action.payload;
			});
	},
});

export const { clearError } = uomSlice.actions;
export default uomSlice.reducer;
