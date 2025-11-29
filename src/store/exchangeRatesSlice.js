import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://lightidea.org:8007/api';

// Fetch exchange rates with filters
export const fetchExchangeRates = createAsyncThunk(
  'exchangeRates/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      
      // Add filters if they exist
      if (filters.from_currency) params.append('from_currency', filters.from_currency);
      if (filters.to_currency) params.append('to_currency', filters.to_currency);
      if (filters.rate_type) params.append('rate_type', filters.rate_type);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      
      const response = await axios.get(`${BASE_URL}/fx/rates/?${params.toString()}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to fetch exchange rates';
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch all currencies for dropdown
export const fetchCurrencies = createAsyncThunk(
  'exchangeRates/fetchCurrencies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/currencies/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to fetch currencies';
      return rejectWithValue(errorMessage);
    }
  }
);

// Create exchange rate (by ID)
export const createExchangeRate = createAsyncThunk(
  'exchangeRates/create',
  async (rateData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/fx/rates/`, rateData);
      return response.data;
    } catch (error) {
      // Enhanced error handling for field-specific errors
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = '';

        // Check for field-specific errors
        if (typeof errorData === 'object' && !errorData.message && !errorData.error && !errorData.detail) {
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]) => {
              const messageText = Array.isArray(messages) ? messages.join(', ') : messages;
              return `${field}: ${messageText}`;
            })
            .join(' | ');
          errorMessage = fieldErrors;
        } else {
          errorMessage = errorData.message || errorData.error || errorData.detail || 'Failed to create exchange rate';
        }
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(error.message || 'Failed to create exchange rate');
    }
  }
);

// Create exchange rate by currency codes
export const createExchangeRateByCode = createAsyncThunk(
  'exchangeRates/createByCode',
  async (rateData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/fx/create-rate/`, rateData);
      return response.data;
    } catch (error) {
      // Enhanced error handling for field-specific errors
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = '';

        // Check for field-specific errors
        if (typeof errorData === 'object' && !errorData.message && !errorData.error && !errorData.detail) {
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]) => {
              const messageText = Array.isArray(messages) ? messages.join(', ') : messages;
              return `${field}: ${messageText}`;
            })
            .join(' | ');
          errorMessage = fieldErrors;
        } else {
          errorMessage = errorData.message || errorData.error || errorData.detail || 'Failed to create exchange rate';
        }
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(error.message || 'Failed to create exchange rate');
    }
  }
);

// Update exchange rate
export const updateExchangeRate = createAsyncThunk(
  'exchangeRates/update',
  async ({ id, rateData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/fx/rates/${id}/`, rateData);
      return response.data;
    } catch (error) {
      // Enhanced error handling for field-specific errors
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = '';

        // Check for field-specific errors
        if (typeof errorData === 'object' && !errorData.message && !errorData.error && !errorData.detail) {
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]) => {
              const messageText = Array.isArray(messages) ? messages.join(', ') : messages;
              return `${field}: ${messageText}`;
            })
            .join(' | ');
          errorMessage = fieldErrors;
        } else {
          errorMessage = errorData.message || errorData.error || errorData.detail || 'Failed to update exchange rate';
        }
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(error.message || 'Failed to update exchange rate');
    }
  }
);

// Delete exchange rate
export const deleteExchangeRate = createAsyncThunk(
  'exchangeRates/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/fx/rates/${id}/`);
      return id;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to delete exchange rate';
      return rejectWithValue(errorMessage);
    }
  }
);

// Convert currency
export const convertCurrency = createAsyncThunk(
  'exchangeRates/convert',
  async (conversionData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/fx/convert/`, conversionData);
      return response.data;
    } catch (error) {
      // Enhanced error handling for field-specific errors
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = '';

        // Check for field-specific errors
        if (typeof errorData === 'object' && !errorData.message && !errorData.error && !errorData.detail) {
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]) => {
              const messageText = Array.isArray(messages) ? messages.join(', ') : messages;
              return `${field}: ${messageText}`;
            })
            .join(' | ');
          errorMessage = fieldErrors;
        } else {
          errorMessage = errorData.message || errorData.error || errorData.detail || 'Failed to convert currency';
        }
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(error.message || 'Failed to convert currency');
    }
  }
);

const exchangeRatesSlice = createSlice({
  name: 'exchangeRates',
  initialState: {
    rates: [],
    currencies: [],
    loading: false,
    error: null,
    conversionResult: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearConversionResult: (state) => {
      state.conversionResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch exchange rates
      .addCase(fetchExchangeRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.loading = false;
        state.rates = action.payload;
      })
      .addCase(fetchExchangeRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch currencies
      .addCase(fetchCurrencies.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchCurrencies.fulfilled, (state, action) => {
        state.currencies = action.payload;
      })
      .addCase(fetchCurrencies.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Create exchange rate
      .addCase(createExchangeRate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExchangeRate.fulfilled, (state, action) => {
        state.loading = false;
        state.rates.push(action.payload);
      })
      .addCase(createExchangeRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create exchange rate by code
      .addCase(createExchangeRateByCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExchangeRateByCode.fulfilled, (state, action) => {
        state.loading = false;
        state.rates.push(action.payload);
      })
      .addCase(createExchangeRateByCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update exchange rate
      .addCase(updateExchangeRate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExchangeRate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.rates.findIndex((rate) => rate.id === action.payload.id);
        if (index !== -1) {
          state.rates[index] = action.payload;
        }
      })
      .addCase(updateExchangeRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete exchange rate
      .addCase(deleteExchangeRate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExchangeRate.fulfilled, (state, action) => {
        state.loading = false;
        state.rates = state.rates.filter((rate) => rate.id !== action.payload);
      })
      .addCase(deleteExchangeRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Convert currency
      .addCase(convertCurrency.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.conversionResult = null;
      })
      .addCase(convertCurrency.fulfilled, (state, action) => {
        state.loading = false;
        state.conversionResult = action.payload;
      })
      .addCase(convertCurrency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearConversionResult } = exchangeRatesSlice.actions;
export default exchangeRatesSlice.reducer;
