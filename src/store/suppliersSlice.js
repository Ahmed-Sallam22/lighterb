import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'https://lightidea.org:8007/api';

// Fetch all suppliers/vendors
export const fetchSuppliers = createAsyncThunk(
  'suppliers/fetchAll',
  async ({ isActive = '' } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (isActive !== '') params.append('is_active', isActive);
      
      const response = await axios.get(`${BASE_URL}/ap/vendors/?${params.toString()}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to fetch suppliers';
      return rejectWithValue(errorMessage);
    }
  }
);

// Create supplier/vendor
export const createSupplier = createAsyncThunk(
  'suppliers/create',
  async (supplierData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/ap/vendors/`, supplierData);
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
          errorMessage = errorData.message || errorData.error || errorData.detail || 'Failed to create supplier';
        }
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(error.message || 'Failed to create supplier');
    }
  }
);

// Update supplier/vendor
export const updateSupplier = createAsyncThunk(
  'suppliers/update',
  async ({ id, supplierData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/ap/vendors/${id}/`, supplierData);
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
          errorMessage = errorData.message || errorData.error || errorData.detail || 'Failed to update supplier';
        }
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue(error.message || 'Failed to update supplier');
    }
  }
);

// Delete supplier/vendor
export const deleteSupplier = createAsyncThunk(
  'suppliers/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/ap/vendors/${id}/`);
      return id;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to delete supplier';
      return rejectWithValue(errorMessage);
    }
  }
);

// Mark as preferred
export const markPreferred = createAsyncThunk(
  'suppliers/markPreferred',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/ap/vendors/${id}/mark_preferred/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to mark as preferred';
      return rejectWithValue(errorMessage);
    }
  }
);

// Remove preferred
export const removePreferred = createAsyncThunk(
  'suppliers/removePreferred',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/ap/vendors/${id}/remove_preferred/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to remove preferred status';
      return rejectWithValue(errorMessage);
    }
  }
);

// Put on hold
export const putOnHold = createAsyncThunk(
  'suppliers/putOnHold',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/ap/vendors/${id}/put_on_hold/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to put on hold';
      return rejectWithValue(errorMessage);
    }
  }
);

// Remove hold
export const removeHold = createAsyncThunk(
  'suppliers/removeHold',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/ap/vendors/${id}/remove_hold/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to remove hold';
      return rejectWithValue(errorMessage);
    }
  }
);

// Blacklist
export const blacklistSupplier = createAsyncThunk(
  'suppliers/blacklist',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/ap/vendors/${id}/blacklist/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to blacklist supplier';
      return rejectWithValue(errorMessage);
    }
  }
);

// Remove blacklist
export const removeBlacklist = createAsyncThunk(
  'suppliers/removeBlacklist',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/ap/vendors/${id}/remove_blacklist/`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to remove blacklist';
      return rejectWithValue(errorMessage);
    }
  }
);

// Update performance
export const updatePerformance = createAsyncThunk(
  'suppliers/updatePerformance',
  async ({ id, score }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/ap/vendors/${id}/update_performance/`, { performance_score: score });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Failed to update performance';
      return rejectWithValue(errorMessage);
    }
  }
);

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState: {
    suppliers: [],
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
      // Fetch suppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create supplier
      .addCase(createSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers.push(action.payload);
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update supplier
      .addCase(updateSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.suppliers.findIndex((supplier) => supplier.id === action.payload.id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete supplier
      .addCase(deleteSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = state.suppliers.filter((supplier) => supplier.id !== action.payload);
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark preferred
      .addCase(markPreferred.fulfilled, (state, action) => {
        const index = state.suppliers.findIndex((supplier) => supplier.id === action.payload.id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      // Remove preferred
      .addCase(removePreferred.fulfilled, (state, action) => {
        const index = state.suppliers.findIndex((supplier) => supplier.id === action.payload.id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      // Put on hold
      .addCase(putOnHold.fulfilled, (state, action) => {
        const index = state.suppliers.findIndex((supplier) => supplier.id === action.payload.id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      // Remove hold
      .addCase(removeHold.fulfilled, (state, action) => {
        const index = state.suppliers.findIndex((supplier) => supplier.id === action.payload.id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      // Blacklist
      .addCase(blacklistSupplier.fulfilled, (state, action) => {
        const index = state.suppliers.findIndex((supplier) => supplier.id === action.payload.id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      // Remove blacklist
      .addCase(removeBlacklist.fulfilled, (state, action) => {
        const index = state.suppliers.findIndex((supplier) => supplier.id === action.payload.id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      // Update performance
      .addCase(updatePerformance.fulfilled, (state, action) => {
        const index = state.suppliers.findIndex((supplier) => supplier.id === action.payload.id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      });
  },
});

export const { clearError } = suppliersSlice.actions;
export default suppliersSlice.reducer;
