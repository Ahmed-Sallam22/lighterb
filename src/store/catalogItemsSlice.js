import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

export const fetchCatalogItems = createAsyncThunk("catalogItems/fetch", async (params = {}, { rejectWithValue }) => {
	try {
		const response = await api.get("/procurement/catalog/items/");
		return response.data?.data || response.data?.results || response.data || [];
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to fetch catalog items" });
	}
});

export const searchCatalogItems = createAsyncThunk("catalogItems/search", async (query, { rejectWithValue }) => {
	try {
		const response = await api.get(`/procurement/catalog/items/search/?q=${encodeURIComponent(query)}`);
		return response.data?.data || response.data?.results || response.data || [];
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to search catalog items" });
	}
});

export const createCatalogItem = createAsyncThunk("catalogItems/create", async (payload, { rejectWithValue }) => {
	try {
		const response = await api.post("/procurement/catalog/items/", payload);
		return response.data?.data || response.data;
	} catch (error) {
		if (error.data) {
			return rejectWithValue(error.data);
		}
		return rejectWithValue(error.response?.data || { message: "Failed to create catalog item" });
	}
});

export const updateCatalogItem = createAsyncThunk("catalogItems/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.put(`/procurement/catalog/items/${id}/`, data);
		return response.data?.data || response.data;
	} catch (error) {
		if (error.data) {
			return rejectWithValue(error.data);
		}
		return rejectWithValue(error.response?.data || { message: "Failed to update catalog item" });
	}
});

export const deleteCatalogItem = createAsyncThunk("catalogItems/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/procurement/catalog/items/${id}/`);
		return id;
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to delete catalog item" });
	}
});

const catalogItemsSlice = createSlice({
	name: "catalogItems",
	initialState: {
		items: [],
		loading: false,
		error: null,
		creating: false,
		updating: false,
		deleting: false,
		actionError: null,
	},
	reducers: {
		clearCatalogErrors: state => {
			state.error = null;
			state.actionError = null;
		},
	},
	extraReducers: builder => {
		builder
			.addCase(fetchCatalogItems.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCatalogItems.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload;
			})
			.addCase(fetchCatalogItems.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload?.message || "Failed to fetch catalog items";
			})
			// Search catalog items
			.addCase(searchCatalogItems.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(searchCatalogItems.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload;
			})
			.addCase(searchCatalogItems.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload?.message || "Failed to search catalog items";
			})
			// Create catalog item
			.addCase(createCatalogItem.pending, state => {
				state.creating = true;
				state.actionError = null;
			})
			.addCase(createCatalogItem.fulfilled, (state, action) => {
				state.creating = false;
				state.items.unshift(action.payload);
			})
			.addCase(createCatalogItem.rejected, (state, action) => {
				state.creating = false;
				state.actionError = action.payload?.message || action.payload || "Failed to create catalog item";
			})
			// Update catalog item
			.addCase(updateCatalogItem.pending, state => {
				state.updating = true;
				state.actionError = null;
			})
			.addCase(updateCatalogItem.fulfilled, (state, action) => {
				state.updating = false;
				const idx = state.items.findIndex(item => item.id === action.payload.id);
				if (idx !== -1) {
					state.items[idx] = action.payload;
				}
			})
			.addCase(updateCatalogItem.rejected, (state, action) => {
				state.updating = false;
				state.actionError = action.payload?.message || action.payload || "Failed to update catalog item";
			})
			// Delete catalog item
			.addCase(deleteCatalogItem.pending, state => {
				state.deleting = true;
				state.actionError = null;
			})
			.addCase(deleteCatalogItem.fulfilled, (state, action) => {
				state.deleting = false;
				state.items = state.items.filter(item => item.id !== action.payload);
			})
			.addCase(deleteCatalogItem.rejected, (state, action) => {
				state.deleting = false;
				state.actionError = action.payload?.message || action.payload || "Failed to delete catalog item";
			});
	},
});

export const { clearCatalogErrors } = catalogItemsSlice.actions;
export default catalogItemsSlice.reducer;
