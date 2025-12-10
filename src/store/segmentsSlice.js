import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// Async thunks for Segment Types
export const fetchSegmentTypes = createAsyncThunk(
  'segments/fetchTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/segment/types/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch segment types');
    }
  }
);

export const createSegmentType = createAsyncThunk(
  'segments/createType',
  async (typeData, { rejectWithValue }) => {
    try {
      const response = await api.post('/segment/types/', typeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create segment type');
    }
  }
);

export const updateSegmentType = createAsyncThunk(
  'segments/updateType',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/segment/types/${id}/`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update segment type');
    }
  }
);

export const deleteSegmentType = createAsyncThunk(
  'segments/deleteType',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/segment/types/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete segment type');
    }
  }
);

// Async thunks for Segment Values
export const fetchSegmentValues = createAsyncThunk(
  'segments/fetchValues',
  async ({ segment_type = '', node_type = '', is_active = '' } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (segment_type) params.append('segment_type', segment_type);
      if (node_type) params.append('node_type', node_type);
      if (is_active !== '') params.append('is_active', is_active);
      
      const response = await api.get(`/segment/values/?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch segment values');
    }
  }
);

export const createSegmentValue = createAsyncThunk(
  'segments/createValue',
  async (valueData, { rejectWithValue }) => {
    try {
      const response = await api.post('/segment/values/', valueData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create segment value');
    }
  }
);

export const updateSegmentValue = createAsyncThunk(
  'segments/updateValue',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/segment/values/${id}/`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update segment value');
    }
  }
);

export const deleteSegmentValue = createAsyncThunk(
  'segments/deleteValue',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/segment/values/${id}/`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete segment value');
    }
  }
);

const segmentsSlice = createSlice({
  name: 'segments',
  initialState: {
    types: [],
    values: [],
    loading: false,
    error: null,
    typesLoading: false,
    valuesLoading: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Segment Types
    builder
      .addCase(fetchSegmentTypes.pending, (state) => {
        state.typesLoading = true;
        state.error = null;
      })
      .addCase(fetchSegmentTypes.fulfilled, (state, action) => {
        state.typesLoading = false;
        state.types = action.payload;
      })
      .addCase(fetchSegmentTypes.rejected, (state, action) => {
        state.typesLoading = false;
        state.error = action.payload;
      });

    // Create Segment Type
    builder
      .addCase(createSegmentType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSegmentType.fulfilled, (state, action) => {
        state.loading = false;
        state.types.push(action.payload);
      })
      .addCase(createSegmentType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Segment Type
    builder
      .addCase(updateSegmentType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSegmentType.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.types.findIndex((type) => type.segment_id === action.payload.segment_id);
        if (index !== -1) {
          state.types[index] = action.payload;
        }
      })
      .addCase(updateSegmentType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Segment Type
    builder
      .addCase(deleteSegmentType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSegmentType.fulfilled, (state, action) => {
        state.loading = false;
        state.types = state.types.filter((type) => type.segment_id !== action.payload);
      })
      .addCase(deleteSegmentType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Segment Values
    builder
      .addCase(fetchSegmentValues.pending, (state) => {
        state.valuesLoading = true;
        state.error = null;
      })
      .addCase(fetchSegmentValues.fulfilled, (state, action) => {
        state.valuesLoading = false;
        state.values = action.payload;
      })
      .addCase(fetchSegmentValues.rejected, (state, action) => {
        state.valuesLoading = false;
        state.error = action.payload;
      });

    // Create Segment Value
    builder
      .addCase(createSegmentValue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSegmentValue.fulfilled, (state, action) => {
        state.loading = false;
        state.values.push(action.payload);
      })
      .addCase(createSegmentValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Segment Value
    builder
      .addCase(updateSegmentValue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSegmentValue.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.values.findIndex((value) => value.id === action.payload.id);
        if (index !== -1) {
          state.values[index] = action.payload;
        }
      })
      .addCase(updateSegmentValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Segment Value
    builder
      .addCase(deleteSegmentValue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSegmentValue.fulfilled, (state, action) => {
        state.loading = false;
        state.values = state.values.filter((value) => value.id !== action.payload);
      })
      .addCase(deleteSegmentValue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = segmentsSlice.actions;
export default segmentsSlice.reducer;
