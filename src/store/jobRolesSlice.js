import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// Fetch all job roles
export const fetchJobRoles = createAsyncThunk(
  'jobRoles/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/core/job_roles/job-roles/');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to fetch job roles';
      return rejectWithValue(errorMessage);
    }
  }
);

// Create job role
export const createJobRole = createAsyncThunk(
  'jobRoles/create',
  async (roleData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/job-roles/', roleData);
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
          errorMessage = errorData.message || errorData.error || errorData.detail || 'Failed to create job role';
        }
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(error.message || 'Failed to create job role');
    }
  }
);

// Update job role
export const updateJobRole = createAsyncThunk(
  'jobRoles/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/job-roles/${id}/`, data);
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
          errorMessage = errorData.message || errorData.error || errorData.detail || 'Failed to update job role';
        }
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(error.message || 'Failed to update job role');
    }
  }
);

// Delete job role
export const deleteJobRole = createAsyncThunk(
  'jobRoles/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/job-roles/${id}/`);
      return id;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to delete job role';
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  roles: [],
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
  actionError: null,
};

const jobRolesSlice = createSlice({
  name: 'jobRoles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchJobRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = Array.isArray(action.payload) ? action.payload : action.payload.results || [];
      })
      .addCase(fetchJobRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createJobRole.pending, (state) => {
        state.creating = true;
        state.actionError = null;
      })
      .addCase(createJobRole.fulfilled, (state, action) => {
        state.creating = false;
        state.roles.push(action.payload);
      })
      .addCase(createJobRole.rejected, (state, action) => {
        state.creating = false;
        state.actionError = action.payload;
      })
      // Update
      .addCase(updateJobRole.pending, (state) => {
        state.updating = true;
        state.actionError = null;
      })
      .addCase(updateJobRole.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.roles.findIndex(role => role.id === action.payload.id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(updateJobRole.rejected, (state, action) => {
        state.updating = false;
        state.actionError = action.payload;
      })
      // Delete
      .addCase(deleteJobRole.pending, (state) => {
        state.deleting = true;
        state.actionError = null;
      })
      .addCase(deleteJobRole.fulfilled, (state, action) => {
        state.deleting = false;
        state.roles = state.roles.filter(role => role.id !== action.payload);
      })
      .addCase(deleteJobRole.rejected, (state, action) => {
        state.deleting = false;
        state.actionError = action.payload;
      });
  },
});

export const { clearError } = jobRolesSlice.actions;
export default jobRolesSlice.reducer;
