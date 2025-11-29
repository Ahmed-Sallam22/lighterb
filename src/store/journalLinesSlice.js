import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://lightidea.org:8007/api';

// Fetch journal lines with filters
export const fetchJournalLines = createAsyncThunk(
  'journalLines/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      
      // Add filters if they exist
      if (filters.account_code) params.append('account_code', filters.account_code);
      if (filters.account_name) params.append('account_name', filters.account_name);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.posted !== undefined && filters.posted !== '') params.append('posted', filters.posted);
      if (filters.entry_id) params.append('entry_id', filters.entry_id);
      
      const response = await axios.get(`${BASE_URL}/journal-lines/?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch journal lines' });
    }
  }
);

const journalLinesSlice = createSlice({
  name: 'journalLines',
  initialState: {
    lines: [],
    loading: false,
    error: null,
    statistics: {
      totalLines: 0,
      totalDebits: 0,
      totalCredits: 0,
      postedLines: 0,
      draftLines: 0,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch journal lines
      .addCase(fetchJournalLines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJournalLines.fulfilled, (state, action) => {
        state.loading = false;
        state.lines = action.payload;
        
        // Calculate statistics
        state.statistics.totalLines = action.payload.length;
        state.statistics.totalDebits = action.payload.reduce((sum, line) => {
          return sum + (parseFloat(line.debit) || 0);
        }, 0);
        state.statistics.totalCredits = action.payload.reduce((sum, line) => {
          return sum + (parseFloat(line.credit) || 0);
        }, 0);
        state.statistics.postedLines = action.payload.filter(line => line.entry?.posted).length;
        state.statistics.draftLines = action.payload.filter(line => !line.entry?.posted).length;
      })
      .addCase(fetchJournalLines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch journal lines';
      });
  },
});

export const { clearError } = journalLinesSlice.actions;
export default journalLinesSlice.reducer;
