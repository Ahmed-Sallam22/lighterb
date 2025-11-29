import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://lightidea.org:8007/api';

export const fetchCatalogItems = createAsyncThunk(
  'catalogItems/fetch',
  async ({ category = '', supplier = '', active = '' } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append('category', category);
      params.append('supplier', supplier);
      params.append('active', active);

      const response = await axios.get(`${BASE_URL}/procurement/catalog/items/?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch catalog items' });
    }
  }
);

export const createCatalogItem = createAsyncThunk(
  'catalogItems/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/procurement/catalog/items/`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create catalog item' });
    }
  }
);

export const updateCatalogItem = createAsyncThunk(
  'catalogItems/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/procurement/catalog/items/${id}/`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update catalog item' });
    }
  }
);

const catalogItemsSlice = createSlice({
  name: 'catalogItems',
  initialState: {
    items: [],
    loading: false,
    error: null,
    creating: false,
    updating: false,
    actionError: null,
  },
  reducers: {
    clearCatalogErrors: (state) => {
      state.error = null;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCatalogItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCatalogItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch catalog items';
      })
      .addCase(createCatalogItem.pending, (state) => {
        state.creating = true;
        state.actionError = null;
      })
      .addCase(createCatalogItem.fulfilled, (state, action) => {
        state.creating = false;
        state.items.unshift(action.payload);
      })
      .addCase(createCatalogItem.rejected, (state, action) => {
        state.creating = false;
        state.actionError = action.payload?.message || 'Failed to create catalog item';
      })
      .addCase(updateCatalogItem.pending, (state) => {
        state.updating = true;
        state.actionError = null;
      })
      .addCase(updateCatalogItem.fulfilled, (state, action) => {
        state.updating = false;
        const idx = state.items.findIndex((item) => item.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        }
      })
      .addCase(updateCatalogItem.rejected, (state, action) => {
        state.updating = false;
        state.actionError = action.payload?.message || 'Failed to update catalog item';
      });
  },
});

export const { clearCatalogErrors } = catalogItemsSlice.actions;
export default catalogItemsSlice.reducer;
