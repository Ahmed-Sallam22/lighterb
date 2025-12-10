import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// Fetch all invoice approvals
export const fetchInvoiceApprovals = createAsyncThunk(
  'invoiceApprovals/fetchInvoiceApprovals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/invoice-approvals/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch invoice approvals');
    }
  }
);

// Create invoice approval
export const createInvoiceApproval = createAsyncThunk(
  'invoiceApprovals/createInvoiceApproval',
  async (approvalData, { rejectWithValue }) => {
    try {
      const response = await api.post('/invoice-approvals/', approvalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create invoice approval');
    }
  }
);

// Update invoice approval
export const updateInvoiceApproval = createAsyncThunk(
  'invoiceApprovals/updateInvoiceApproval',
  async ({ id, approvalData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/invoice-approvals/${id}/`, approvalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update invoice approval');
    }
  }
);

// Delete invoice approval
export const deleteInvoiceApproval = createAsyncThunk(
  'invoiceApprovals/deleteInvoiceApproval',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/invoice-approvals/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete invoice approval');
    }
  }
);

// Approve invoice
export const approveInvoice = createAsyncThunk(
  'invoiceApprovals/approveInvoice',
  async ({ id, approvalData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/invoice-approvals/${id}/approve/`, approvalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to approve invoice');
    }
  }
);

// Reject invoice
export const rejectInvoice = createAsyncThunk(
  'invoiceApprovals/rejectInvoice',
  async ({ id, approvalData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/invoice-approvals/${id}/reject/`, approvalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to reject invoice');
    }
  }
);

const invoiceApprovalsSlice = createSlice({
  name: 'invoiceApprovals',
  initialState: {
    approvals: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch invoice approvals
      .addCase(fetchInvoiceApprovals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceApprovals.fulfilled, (state, action) => {
        state.loading = false;
        state.approvals = action.payload;
      })
      .addCase(fetchInvoiceApprovals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create invoice approval
      .addCase(createInvoiceApproval.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvoiceApproval.fulfilled, (state, action) => {
        state.loading = false;
        state.approvals.push(action.payload);
      })
      .addCase(createInvoiceApproval.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update invoice approval
      .addCase(updateInvoiceApproval.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInvoiceApproval.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.approvals.findIndex((approval) => approval.id === action.payload.id);
        if (index !== -1) {
          state.approvals[index] = action.payload;
        }
      })
      .addCase(updateInvoiceApproval.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete invoice approval
      .addCase(deleteInvoiceApproval.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInvoiceApproval.fulfilled, (state, action) => {
        state.loading = false;
        state.approvals = state.approvals.filter((approval) => approval.id !== action.payload);
      })
      .addCase(deleteInvoiceApproval.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve invoice
      .addCase(approveInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveInvoice.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.approvals.findIndex((approval) => approval.id === action.payload.id);
        if (index !== -1) {
          state.approvals[index] = action.payload;
        }
      })
      .addCase(approveInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reject invoice
      .addCase(rejectInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectInvoice.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.approvals.findIndex((approval) => approval.id === action.payload.id);
        if (index !== -1) {
          state.approvals[index] = action.payload;
        }
      })
      .addCase(rejectInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default invoiceApprovalsSlice.reducer;
