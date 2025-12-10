import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// Fetch AP payments
export const fetchAPPayments = createAsyncThunk(
  'apPayments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/ap/payments/');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to fetch AP payments';
      return rejectWithValue(errorMessage);
    }
  }
);

// Create AP payment
export const createAPPayment = createAsyncThunk(
  'apPayments/create',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/ap/payments/', paymentData);
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
          errorMessage = errorData.message || errorData.error || errorData.detail || 'Failed to create AP payment';
        }
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(error.message || 'Failed to create AP payment');
    }
  }
);

// Post AP payment
export const postAPPayment = createAsyncThunk(
  'apPayments/post',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/ap/payments/${id}/post/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to post AP payment';
      return rejectWithValue(errorMessage);
    }
  }
);

// Update AP payment
export const updateAPPayment = createAsyncThunk(
  'apPayments/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/ap/payments/${id}/`, data);
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
          errorMessage = errorData.message || errorData.error || errorData.detail || 'Failed to update AP payment';
        }
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(error.message || 'Failed to update AP payment');
    }
  }
);

// Delete AP payment
export const deleteAPPayment = createAsyncThunk(
  'apPayments/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/ap/payments/${id}/`);
      return id;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to delete AP payment';
      return rejectWithValue(errorMessage);
    }
  }
);

const apPaymentsSlice = createSlice({
  name: 'apPayments',
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
      // Fetch AP payments
      .addCase(fetchAPPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAPPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchAPPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create AP payment
      .addCase(createAPPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAPPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments.push(action.payload);
      })
      .addCase(createAPPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update AP payment
      .addCase(updateAPPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAPPayment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payments.findIndex((payment) => payment.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
      })
      .addCase(updateAPPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete AP payment
      .addCase(deleteAPPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAPPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = state.payments.filter((payment) => payment.id !== action.payload);
      })
      .addCase(deleteAPPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Post AP payment
      .addCase(postAPPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postAPPayment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payments.findIndex((payment) => payment.id === action.payload.id);
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
      })
      .addCase(postAPPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = apPaymentsSlice.actions;
export default apPaymentsSlice.reducer;
