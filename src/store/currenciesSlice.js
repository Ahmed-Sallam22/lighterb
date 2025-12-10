import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// Fetch all currencies
export const fetchCurrencies = createAsyncThunk(
  'currencies/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/currencies/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch currencies' });
    }
  }
);

// Create a new currency
export const createCurrency = createAsyncThunk(
  'currencies/create',
  async (currencyData, { rejectWithValue }) => {
    try {
      const response = await api.post('/currencies/', currencyData);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      
      // Handle field-specific errors
      if (errorData && typeof errorData === 'object') {
        return rejectWithValue(errorData);
      }
      
      return rejectWithValue({ message: error.message || 'Failed to create currency' });
    }
  }
);

// Update a currency
export const updateCurrency = createAsyncThunk(
  'currencies/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/currencies/${id}/`, data);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      
      // Handle field-specific errors
      if (errorData && typeof errorData === 'object') {
        return rejectWithValue(errorData);
      }
      
      return rejectWithValue({ message: error.message || 'Failed to update currency' });
    }
  }
);

// Delete a currency
export const deleteCurrency = createAsyncThunk(
  'currencies/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/currencies/${id}/`);
      return id;
    } catch (error) {
      const errorData = error.response?.data;
      
      // Handle field-specific errors
      if (errorData && typeof errorData === 'object') {
        return rejectWithValue(errorData);
      }
      
      return rejectWithValue({ message: error.message || 'Failed to delete currency' });
    }
  }
);

const currenciesSlice = createSlice({
  name: 'currencies',
  initialState: {
    currencies: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch currencies
      .addCase(fetchCurrencies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrencies.fulfilled, (state, action) => {
        state.loading = false;
        state.currencies = action.payload;
      })
      .addCase(fetchCurrencies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch currencies';
      })
      
      // Create currency
      .addCase(createCurrency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCurrency.fulfilled, (state, action) => {
        state.loading = false;
        state.currencies.push(action.payload);
      })
      .addCase(createCurrency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create currency';
      })
      
      // Update currency
      .addCase(updateCurrency.pending, (state) => {
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
        state.error = action.payload?.message || 'Failed to update currency';
      })
      
      // Delete currency
      .addCase(deleteCurrency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCurrency.fulfilled, (state, action) => {
        state.loading = false;
        state.currencies = state.currencies.filter(c => c.id !== action.payload);
      })
      .addCase(deleteCurrency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete currency';
      });
  },
});

export const { clearError } = currenciesSlice.actions;
export default currenciesSlice.reducer;
