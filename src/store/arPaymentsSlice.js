import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// Fetch AR payments
export const fetchARPayments = createAsyncThunk(
  'arPayments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/ar/payments/');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to fetch AR payments';
      return rejectWithValue(errorMessage);
    }
  }
);

// Create AR payment
export const createARPayment = createAsyncThunk(
  'arPayments/create',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/ar/payments/', paymentData);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = '';

        if (typeof errorData === 'object' && !errorData.message && !errorData.error && !errorData.detail) {
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]) => {
              const messageText = Array.isArray(messages) ? messages.join(', ') : messages;
              return `${field}: ${messageText}`;
            })
            .join(' | ');
          errorMessage = fieldErrors;
        } else {
          errorMessage = errorData.message || errorData.error || errorData.detail || 'Failed to create AR payment';
        }
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(error.message || 'Failed to create AR payment');
    }
  }
);

// Post AR payment
export const postARPayment = createAsyncThunk(
  'arPayments/post',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/ar/payments/${id}/post/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to post AR payment';
      return rejectWithValue(errorMessage);
    }
  }
);

// Update AR payment
export const updateARPayment = createAsyncThunk(
  'arPayments/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/ar/payments/${id}/`, data);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = '';

        if (typeof errorData === 'object' && !errorData.message && !errorData.error && !errorData.detail) {
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]) => {
              const messageText = Array.isArray(messages) ? messages.join(', ') : messages;
              return `${field}: ${messageText}`;
            })
            .join(' | ');
          errorMessage = fieldErrors;
        } else {
          errorMessage = errorData.message || errorData.error || errorData.detail || 'Failed to update AR payment';
        }
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(error.message || 'Failed to update AR payment');
    }
  }
);

// Delete AR payment
export const deleteARPayment = createAsyncThunk(
  'arPayments/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/ar/payments/${id}/`);
      return id;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to delete AR payment';
      return rejectWithValue(errorMessage);
    }
  }
);

const arPaymentsSlice = createSlice({
  name: 'arPayments',
  initialState: {
    payments: [],
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
      // Fetch AR payments
      .addCase(fetchARPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchARPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchARPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create AR payment
      .addCase(createARPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createARPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments.push(action.payload);
      })
      .addCase(createARPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update AR payment
      .addCase(updateARPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateARPayment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payments.findIndex((payment) => payment.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
      })
      .addCase(updateARPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete AR payment
      .addCase(deleteARPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteARPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = state.payments.filter((payment) => payment.id !== action.payload);
      })
      .addCase(deleteARPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Post AR payment
      .addCase(postARPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postARPayment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payments.findIndex((payment) => payment.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
      })
      .addCase(postARPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = arPaymentsSlice.actions;
export default arPaymentsSlice.reducer;
