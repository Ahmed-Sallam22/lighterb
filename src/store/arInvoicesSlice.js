import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://lightidea.org:8007/api';

// Fetch AR invoices
export const fetchARInvoices = createAsyncThunk(
  'arInvoices/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/ar/invoices/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to fetch AR invoices';
      return rejectWithValue(errorMessage);
    }
  }
);

// Create AR invoice
export const createARInvoice = createAsyncThunk(
  'arInvoices/create',
  async (invoiceData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/ar/invoices/`, invoiceData);
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
          errorMessage = errorData.message || errorData.error || errorData.detail || 'Failed to create AR invoice';
        }
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(error.message || 'Failed to create AR invoice');
    }
  }
);

// Update AR invoice
export const updateARInvoice = createAsyncThunk(
  'arInvoices/update',
  async ({ id, invoiceData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/ar/invoices/${id}/`, invoiceData);
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
          errorMessage = errorData.message || errorData.error || errorData.detail || 'Failed to update AR invoice';
        }
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(error.message || 'Failed to update AR invoice');
    }
  }
);

// Delete AR invoice
export const deleteARInvoice = createAsyncThunk(
  'arInvoices/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/ar/invoices/${id}/`);
      return id;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to delete AR invoice';
      return rejectWithValue(errorMessage);
    }
  }
);

// Submit AR invoice for approval
export const submitARInvoiceForApproval = createAsyncThunk(
  'arInvoices/submitForApproval',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/ar/invoices/${id}/submit-for-approval/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to submit AR invoice for approval';
      return rejectWithValue(errorMessage);
    }
  }
);

// Reverse AR invoice
export const reverseARInvoice = createAsyncThunk(
  'arInvoices/reverse',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/ar/invoices/${id}/reverse/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to reverse AR invoice';
      return rejectWithValue(errorMessage);
    }
  }
);

// Post AR invoice to GL
export const postARInvoiceToGL = createAsyncThunk(
  'arInvoices/postGL',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/ar/invoices/${id}/post-gl/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to post AR invoice to GL';
      return rejectWithValue(errorMessage);
    }
  }
);

const arInvoicesSlice = createSlice({
  name: 'arInvoices',
  initialState: {
    invoices: [],
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
      // Fetch AR invoices
      .addCase(fetchARInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchARInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchARInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create AR invoice
      .addCase(createARInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createARInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices.push(action.payload);
      })
      .addCase(createARInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update AR invoice
      .addCase(updateARInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateARInvoice.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.invoices.findIndex((invoice) => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(updateARInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete AR invoice
      .addCase(deleteARInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteARInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = state.invoices.filter((invoice) => invoice.id !== action.payload);
      })
      .addCase(deleteARInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit for approval
      .addCase(submitARInvoiceForApproval.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitARInvoiceForApproval.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.invoices.findIndex((invoice) => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(submitARInvoiceForApproval.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reverse invoice
      .addCase(reverseARInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reverseARInvoice.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.invoices.findIndex((invoice) => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(reverseARInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Post to GL
      .addCase(postARInvoiceToGL.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postARInvoiceToGL.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.invoices.findIndex((invoice) => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(postARInvoiceToGL.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = arInvoicesSlice.actions;
export default arInvoicesSlice.reducer;
