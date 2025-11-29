import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://lightidea.org:8007/api';

// Fetch all currencies
export const fetchCurrencies = createAsyncThunk(
  'currencies/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/currencies/`);
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
      console.log('Creating currency with data:', currencyData);
      const response = await axios.post(`${BASE_URL}/currencies/`, currencyData);
      console.log('Currency created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating currency:', error.response?.data || error.message);
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
      console.log('Updating currency:', id, data);
      const response = await axios.put(`${BASE_URL}/currencies/${id}/`, data);
      console.log('Currency updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating currency:', error.response?.data || error.message);
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
      console.log('Deleting currency:', id);
      await axios.delete(`${BASE_URL}/currencies/${id}/`);
      console.log('Currency deleted successfully');
      return id;
    } catch (error) {
      console.error('Error deleting currency:', error.response?.data || error.message);
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
