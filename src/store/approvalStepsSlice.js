import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://lightidea.org:8007/api';

// Fetch approval steps
export const fetchApprovalSteps = createAsyncThunk(
  'approvalSteps/fetchApprovalSteps',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/procurement/approvals/steps`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch approval steps' });
    }
  }
);

// Approve a step
export const approveStep = createAsyncThunk(
  'approvalSteps/approveStep',
  async ({ id, comments }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/procurement/approvals/steps/${id}/approve/`,
        { comments: comments || '' }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to approve step' });
    }
  }
);

// Reject a step
export const rejectStep = createAsyncThunk(
  'approvalSteps/rejectStep',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/procurement/approvals/steps/${id}/reject/`,
        { reason: reason || '' }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to reject step' });
    }
  }
);

const approvalStepsSlice = createSlice({
  name: 'approvalSteps',
  initialState: {
    steps: [],
    loading: false,
    error: null,
    actionLoading: false,
    actionError: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch approval steps
      .addCase(fetchApprovalSteps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApprovalSteps.fulfilled, (state, action) => {
        state.loading = false;
        state.steps = action.payload;
      })
      .addCase(fetchApprovalSteps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch approval steps';
      })
      // Approve step
      .addCase(approveStep.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(approveStep.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(approveStep.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload?.message || 'Failed to approve step';
      })
      // Reject step
      .addCase(rejectStep.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })
      .addCase(rejectStep.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(rejectStep.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload?.message || 'Failed to reject step';
      });
  },
});

export const { clearError } = approvalStepsSlice.actions;
export default approvalStepsSlice.reducer;
