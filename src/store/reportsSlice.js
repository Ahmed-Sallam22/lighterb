import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// Fetch Trial Balance Report
export const fetchTrialBalance = createAsyncThunk(
  'reports/fetchTrialBalance',
  async ({ dateFrom = '', dateTo = '', fileType = '' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (fileType) params.append('file_type', fileType);

      const response = await api.get(`/reports/trial-balance/?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trial balance');
    }
  }
);

// Fetch AR Aging Report
export const fetchARAgingReport = createAsyncThunk(
  'reports/fetchARAgingReport',
  async ({ asOf = '', fileType = '' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (asOf) params.append('as_of', asOf);
      if (fileType) params.append('file_type', fileType);

      const response = await api.get(`/reports/ar-aging/?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch AR aging report');
    }
  }
);

// Fetch AP Aging Report
export const fetchAPAgingReport = createAsyncThunk(
  'reports/fetchAPAgingReport',
  async ({ asOf = '', fileType = '' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (asOf) params.append('as_of', asOf);
      if (fileType) params.append('file_type', fileType);

      const response = await api.get(`/reports/ap-aging/?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch AP aging report');
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    trialBalance: {
      data: [],
      downloadLinks: null,
      loading: false,
      error: null,
    },
    arAging: {
      data: null,
      downloadLinks: null,
      loading: false,
      error: null,
    },
    apAging: {
      data: null,
      downloadLinks: null,
      loading: false,
      error: null,
    },
  },
  reducers: {
    clearReportData: (state, action) => {
      const reportType = action.payload;
      if (state[reportType]) {
        state[reportType].data = reportType === 'trialBalance' ? [] : null;
        state[reportType].error = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Trial Balance
    builder
      .addCase(fetchTrialBalance.pending, (state) => {
        state.trialBalance.loading = true;
        state.trialBalance.error = null;
      })
      .addCase(fetchTrialBalance.fulfilled, (state, action) => {
        state.trialBalance.loading = false;
        state.trialBalance.data = action.payload.data;
        state.trialBalance.downloadLinks = action.payload.download_links;
      })
      .addCase(fetchTrialBalance.rejected, (state, action) => {
        state.trialBalance.loading = false;
        state.trialBalance.error = action.payload;
      });

    // AR Aging
    builder
      .addCase(fetchARAgingReport.pending, (state) => {
        state.arAging.loading = true;
        state.arAging.error = null;
      })
      .addCase(fetchARAgingReport.fulfilled, (state, action) => {
        state.arAging.loading = false;
        state.arAging.data = action.payload.data;
        state.arAging.downloadLinks = action.payload.download_links;
      })
      .addCase(fetchARAgingReport.rejected, (state, action) => {
        state.arAging.loading = false;
        state.arAging.error = action.payload;
      });

    // AP Aging
    builder
      .addCase(fetchAPAgingReport.pending, (state) => {
        state.apAging.loading = true;
        state.apAging.error = null;
      })
      .addCase(fetchAPAgingReport.fulfilled, (state, action) => {
        state.apAging.loading = false;
        state.apAging.data = action.payload.data;
        state.apAging.downloadLinks = action.payload.download_links;
      })
      .addCase(fetchAPAgingReport.rejected, (state, action) => {
        state.apAging.loading = false;
        state.apAging.error = action.payload;
      });
  },
});

export const { clearReportData } = reportsSlice.actions;
export default reportsSlice.reducer;
