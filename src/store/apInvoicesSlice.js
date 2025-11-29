import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://lightidea.org:8007/api';

// Fetch AP invoices
export const fetchAPInvoices = createAsyncThunk(
  'apInvoices/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/ap/invoices/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to fetch AP invoices';
      return rejectWithValue(errorMessage);
    }
  }
);

// Create AP invoice
export const createAPInvoice = createAsyncThunk(
  'apInvoices/create',
  async (invoiceData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/ap/invoices/`, invoiceData);
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
          errorMessage = errorData.message || errorData.error || errorData.detail || 'Failed to create AP invoice';
        }
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(error.message || 'Failed to create AP invoice');
    }
  }
);

// Update AP invoice
export const updateAPInvoice = createAsyncThunk(
  'apInvoices/update',
  async ({ id, invoiceData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/ap/invoices/${id}/`, invoiceData);
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
          errorMessage = errorData.message || errorData.error || errorData.detail || 'Failed to update AP invoice';
        }
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(error.message || 'Failed to update AP invoice');
    }
  }
);

// Delete AP invoice
export const deleteAPInvoice = createAsyncThunk(
  'apInvoices/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/ap/invoices/${id}/`);
      return id;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to delete AP invoice';
      return rejectWithValue(errorMessage);
    }
  }
);

// Submit AP invoice for approval
export const submitAPInvoiceForApproval = createAsyncThunk(
  'apInvoices/submitForApproval',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/ap/invoices/${id}/submit-for-approval/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to submit AP invoice for approval';
      return rejectWithValue(errorMessage);
    }
  }
);

// Reverse AP invoice
export const reverseAPInvoice = createAsyncThunk(
  'apInvoices/reverse',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/ap/invoices/${id}/reverse/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to reverse AP invoice';
      return rejectWithValue(errorMessage);
    }
  }
);

// Post AP invoice to GL
export const postAPInvoiceToGL = createAsyncThunk(
  'apInvoices/postGL',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/ap/invoices/${id}/post-gl/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to post AP invoice to GL';
      return rejectWithValue(errorMessage);
    }
  }
);

// Three-way match AP invoice
export const threeWayMatchAPInvoice = createAsyncThunk(
  'apInvoices/threeWayMatch',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/ap/invoices/${id}/three-way-match/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to perform three-way match';
      return rejectWithValue(errorMessage);
    }
  }
);

const apInvoicesSlice = createSlice({
  name: 'apInvoices',
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
      // Fetch AP invoices
      .addCase(fetchAPInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAPInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchAPInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create AP invoice
      .addCase(createAPInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAPInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices.push(action.payload);
      })
      .addCase(createAPInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update AP invoice
      .addCase(updateAPInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAPInvoice.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.invoices.findIndex((invoice) => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(updateAPInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete AP invoice
      .addCase(deleteAPInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAPInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = state.invoices.filter((invoice) => invoice.id !== action.payload);
      })
      .addCase(deleteAPInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit for approval
      .addCase(submitAPInvoiceForApproval.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAPInvoiceForApproval.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.invoices.findIndex((invoice) => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(submitAPInvoiceForApproval.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reverse invoice
      .addCase(reverseAPInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reverseAPInvoice.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.invoices.findIndex((invoice) => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(reverseAPInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Post to GL
      .addCase(postAPInvoiceToGL.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postAPInvoiceToGL.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.invoices.findIndex((invoice) => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(postAPInvoiceToGL.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Three-way match
      .addCase(threeWayMatchAPInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(threeWayMatchAPInvoice.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.invoices.findIndex((invoice) => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(threeWayMatchAPInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = apInvoicesSlice.actions;
export default apInvoicesSlice.reducer;
