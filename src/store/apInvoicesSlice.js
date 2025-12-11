import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// Fetch AP invoices
export const fetchAPInvoices = createAsyncThunk(
  'apInvoices/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/finance/invoice/ap/');
      return response.data?.data?.results ?? response.data?.results ?? response.data;
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
      console.log('Creating AP invoice:', invoiceData);
      const response = await api.post('/finance/invoice/ap/', invoiceData);
      console.log('AP invoice response:', response.data);
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error('AP invoice creation error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = '';

        // Check if error is wrapped in data object
        if (errorData.data && typeof errorData.data === 'object') {
          const nestedErrors = errorData.data;
          if (nestedErrors.message) {
            errorMessage = nestedErrors.message;
          } else {
            const fieldErrors = Object.entries(nestedErrors)
              .map(([field, messages]) => {
                const messageText = Array.isArray(messages) ? messages.join(', ') : String(messages);
                return `${field}: ${messageText}`;
              })
              .join(' | ');
            errorMessage = fieldErrors || 'Failed to create AP invoice';
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'object') {
          const fieldErrors = Object.entries(errorData)
            .map(([field, messages]) => {
              const messageText = Array.isArray(messages) ? messages.join(', ') : String(messages);
              return `${field}: ${messageText}`;
            })
            .join(' | ');
          errorMessage = fieldErrors || 'Failed to create AP invoice';
        } else {
          errorMessage = String(errorData) || 'Failed to create AP invoice';
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
      const response = await api.put(`/finance/invoice/ap/${id}/`, invoiceData);
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
      await api.delete(`/finance/invoice/ap/${id}/`);
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
      const response = await api.post(`/finance/invoice/ap/${id}/submit-for-approval/`);
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
      const response = await api.post(`/finance/invoice/ap/${id}/reverse/`);
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
      const response = await api.post(`/finance/invoice/ap/${id}/post-gl/`);
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
      const response = await api.post(`/finance/invoice/ap/${id}/three-way-match/`);
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
    const getId = (inv) => inv?.invoice_id ?? inv?.id;
    const findIndexById = (state, payload) => state.invoices.findIndex((invoice) => getId(invoice) === getId(payload));

    builder
      // Fetch AP invoices
      .addCase(fetchAPInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAPInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload || [];
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
        const index = findIndexById(state, action.payload);
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
        const index = findIndexById(state, action.payload);
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
        const index = findIndexById(state, action.payload);
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
        const index = findIndexById(state, action.payload);
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
