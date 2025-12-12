import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// Async thunks for Tax Rates
export const fetchTaxRates = createAsyncThunk(
  'taxRates/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/finance/core/tax-rates/');
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch tax rates');
    }
  }
);

export const createTaxRate = createAsyncThunk(
  'taxRates/create',
  async (taxRateData, { rejectWithValue }) => {
    try {
      const response = await api.post('/finance/core/tax-rates/', taxRateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create tax rate');
    }
  }
);

export const updateTaxRate = createAsyncThunk(
  'taxRates/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/finance/core/tax-rates/${id}/`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update tax rate');
    }
  }
);

export const deleteTaxRate = createAsyncThunk(
  'taxRates/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/finance/core/tax-rates/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete tax rate');
    }
  }
);

// Seed presets
export const seedTaxPresets = createAsyncThunk(
  'taxRates/seedPresets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/tax/seed-presets/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to seed tax presets');
    }
  }
);

// Corporate Tax endpoints
export const fetchCorporateAccrual = createAsyncThunk(
  'taxRates/corporateAccrual',
  async ({ country, date_from, date_to }, { rejectWithValue }) => {
    try {
      const response = await api.post('/tax/corporate-accrual/', {
        country,
        date_from,
        date_to,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch corporate accrual');
    }
  }
);

export const fetchCorporateBreakdown = createAsyncThunk(
  'taxRates/corporateBreakdown',
  async ({ date_from, date_to }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (date_from) params.append('date_from', date_from);
      if (date_to) params.append('date_to', date_to);
      
      const response = await api.get(`/tax/corporate-breakdown/?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch corporate breakdown');
    }
  }
);

export const corporateFiling = createAsyncThunk(
  'taxRates/corporateFiling',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tax/corporate-filing/${id}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to file corporate tax');
    }
  }
);

export const corporateFile = createAsyncThunk(
  'taxRates/corporateFile',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tax/corporate-file/${id}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to file corporate tax');
    }
  }
);

export const corporateReverse = createAsyncThunk(
  'taxRates/corporateReverse',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tax/corporate-reverse/${id}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to reverse corporate tax');
    }
  }
);

const taxRatesSlice = createSlice({
  name: 'taxRates',
  initialState: {
    taxRates: [],
    corporateAccrual: null,
    corporateBreakdown: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Tax Rates
    builder
      .addCase(fetchTaxRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaxRates.fulfilled, (state, action) => {
        state.loading = false;
        state.taxRates = action.payload;
      })
      .addCase(fetchTaxRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Tax Rate
    builder
      .addCase(createTaxRate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTaxRate.fulfilled, (state, action) => {
        state.loading = false;
        state.taxRates.push(action.payload);
      })
      .addCase(createTaxRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Tax Rate
    builder
      .addCase(updateTaxRate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaxRate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.taxRates.findIndex((rate) => rate.id === action.payload.id);
        if (index !== -1) {
          state.taxRates[index] = action.payload;
        }
      })
      .addCase(updateTaxRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Tax Rate
    builder
      .addCase(deleteTaxRate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTaxRate.fulfilled, (state, action) => {
        state.loading = false;
        state.taxRates = state.taxRates.filter((rate) => rate.id !== action.payload);
      })
      .addCase(deleteTaxRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Seed Presets
    builder
      .addCase(seedTaxPresets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(seedTaxPresets.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(seedTaxPresets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Corporate Accrual
    builder
      .addCase(fetchCorporateAccrual.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCorporateAccrual.fulfilled, (state, action) => {
        state.loading = false;
        state.corporateAccrual = action.payload;
      })
      .addCase(fetchCorporateAccrual.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Corporate Breakdown
    builder
      .addCase(fetchCorporateBreakdown.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCorporateBreakdown.fulfilled, (state, action) => {
        state.loading = false;
        state.corporateBreakdown = action.payload;
      })
      .addCase(fetchCorporateBreakdown.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Corporate Filing
    builder
      .addCase(corporateFiling.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(corporateFiling.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(corporateFiling.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Corporate File
    builder
      .addCase(corporateFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(corporateFile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(corporateFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Corporate Reverse
    builder
      .addCase(corporateReverse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(corporateReverse.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(corporateReverse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = taxRatesSlice.actions;
export default taxRatesSlice.reducer;
