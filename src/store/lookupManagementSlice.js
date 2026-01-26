import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Lookup Types Thunks
export const fetchLookupTypesList = createAsyncThunk(
	"lookupManagement/fetchLookupTypesList",
	async ({ page = 1, pageSize = 25, search = "" }, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", pageSize);
			if (search) params.append("search", search);

			const response = await api.get(`/core/lookups/types/?${params.toString()}`);
			return {
				data: response.data?.data || [],
				count: response.data?.count || response.data?.data?.length || 0,
				page,
			};
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || "Failed to fetch lookup types");
		}
	}
);

export const fetchLookupTypeById = createAsyncThunk(
	"lookupManagement/fetchLookupTypeById",
	async (id, { rejectWithValue }) => {
		try {
			const response = await api.get(`/core/lookups/types/${id}/`);
			return response.data?.data || response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || "Failed to fetch lookup type");
		}
	}
);

export const createLookupType = createAsyncThunk(
	"lookupManagement/createLookupType",
	async (data, { rejectWithValue }) => {
		try {
			const response = await api.post("/core/lookups/types/", data);
			return response.data?.data || response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || "Failed to create lookup type");
		}
	}
);

export const updateLookupType = createAsyncThunk(
	"lookupManagement/updateLookupType",
	async ({ id, data }, { rejectWithValue }) => {
		try {
			const response = await api.put(`/core/lookups/types/${id}/`, data);
			return response.data?.data || response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || "Failed to update lookup type");
		}
	}
);

export const deleteLookupType = createAsyncThunk(
	"lookupManagement/deleteLookupType",
	async (id, { rejectWithValue }) => {
		try {
			await api.delete(`/core/lookups/types/${id}/`);
			return id;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || "Failed to delete lookup type");
		}
	}
);

// Lookup Values Thunks
export const fetchLookupValuesList = createAsyncThunk(
	"lookupManagement/fetchLookupValuesList",
	async ({ page = 1, pageSize = 25, lookupType = "", parentName = "" }, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", pageSize);
			if (lookupType) params.append("lookup_type", lookupType);
			if (parentName) params.append("parent_name", parentName);

			const response = await api.get(`/core/lookups/values/?${params.toString()}`);
			return {
				data: response.data?.data || [],
				count: response.data?.count || response.data?.data?.length || 0,
				page,
			};
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || "Failed to fetch lookup values");
		}
	}
);

export const fetchLookupValueById = createAsyncThunk(
	"lookupManagement/fetchLookupValueById",
	async (id, { rejectWithValue }) => {
		try {
			const response = await api.get(`/core/lookups/values/${id}/`);
			return response.data?.data || response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || "Failed to fetch lookup value");
		}
	}
);

export const createLookupValue = createAsyncThunk(
	"lookupManagement/createLookupValue",
	async (data, { rejectWithValue }) => {
		try {
			const response = await api.post("/core/lookups/values/", data);
			return response.data?.data || response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || "Failed to create lookup value");
		}
	}
);

export const updateLookupValue = createAsyncThunk(
	"lookupManagement/updateLookupValue",
	async ({ id, data }, { rejectWithValue }) => {
		try {
			const response = await api.put(`/core/lookups/values/${id}/`, data);
			return response.data?.data || response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || "Failed to update lookup value");
		}
	}
);

export const deleteLookupValue = createAsyncThunk(
	"lookupManagement/deleteLookupValue",
	async (id, { rejectWithValue }) => {
		try {
			await api.delete(`/core/lookups/values/${id}/`);
			return id;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || "Failed to delete lookup value");
		}
	}
);

const lookupManagementSlice = createSlice({
	name: "lookupManagement",
	initialState: {
		// Lookup Types
		lookupTypes: [],
		typesLoading: false,
		typesCount: 0,
		typesPage: 1,
		typesHasNext: false,
		typesHasPrevious: false,
		currentLookupType: null,

		// Lookup Values
		lookupValues: [],
		valuesLoading: false,
		valuesCount: 0,
		valuesPage: 1,
		valuesHasNext: false,
		valuesHasPrevious: false,
		currentLookupValue: null,

		// UI States
		creating: false,
		updating: false,
		deleting: false,
		error: null,
		success: null,
	},
	reducers: {
		clearError: state => {
			state.error = null;
		},
		clearSuccess: state => {
			state.success = null;
		},
		clearCurrentLookupType: state => {
			state.currentLookupType = null;
		},
		clearCurrentLookupValue: state => {
			state.currentLookupValue = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch Lookup Types List
			.addCase(fetchLookupTypesList.pending, state => {
				state.typesLoading = true;
				state.error = null;
			})
			.addCase(fetchLookupTypesList.fulfilled, (state, action) => {
				state.typesLoading = false;
				state.lookupTypes = action.payload.data;
				state.typesCount = action.payload.count;
				state.typesPage = action.payload.page;
				state.typesHasNext = action.payload.page * 25 < action.payload.count;
				state.typesHasPrevious = action.payload.page > 1;
			})
			.addCase(fetchLookupTypesList.rejected, (state, action) => {
				state.typesLoading = false;
				state.error = action.payload;
			})

			// Fetch Lookup Type By ID
			.addCase(fetchLookupTypeById.pending, state => {
				state.typesLoading = true;
				state.error = null;
			})
			.addCase(fetchLookupTypeById.fulfilled, (state, action) => {
				state.typesLoading = false;
				state.currentLookupType = action.payload;
			})
			.addCase(fetchLookupTypeById.rejected, (state, action) => {
				state.typesLoading = false;
				state.error = action.payload;
			})

			// Create Lookup Type
			.addCase(createLookupType.pending, state => {
				state.creating = true;
				state.error = null;
			})
			.addCase(createLookupType.fulfilled, (state, action) => {
				state.creating = false;
				state.success = "Lookup type created successfully";
				state.lookupTypes.unshift(action.payload);
			})
			.addCase(createLookupType.rejected, (state, action) => {
				state.creating = false;
				state.error = action.payload;
			})

			// Update Lookup Type
			.addCase(updateLookupType.pending, state => {
				state.updating = true;
				state.error = null;
			})
			.addCase(updateLookupType.fulfilled, (state, action) => {
				state.updating = false;
				state.success = "Lookup type updated successfully";
				const index = state.lookupTypes.findIndex(t => t.id === action.payload.id);
				if (index !== -1) {
					state.lookupTypes[index] = action.payload;
				}
			})
			.addCase(updateLookupType.rejected, (state, action) => {
				state.updating = false;
				state.error = action.payload;
			})

			// Delete Lookup Type
			.addCase(deleteLookupType.pending, state => {
				state.deleting = true;
				state.error = null;
			})
			.addCase(deleteLookupType.fulfilled, (state, action) => {
				state.deleting = false;
				state.success = "Lookup type deleted successfully";
				state.lookupTypes = state.lookupTypes.filter(t => t.id !== action.payload);
			})
			.addCase(deleteLookupType.rejected, (state, action) => {
				state.deleting = false;
				state.error = action.payload;
			})

			// Fetch Lookup Values List
			.addCase(fetchLookupValuesList.pending, state => {
				state.valuesLoading = true;
				state.error = null;
			})
			.addCase(fetchLookupValuesList.fulfilled, (state, action) => {
				state.valuesLoading = false;
				state.lookupValues = action.payload.data;
				state.valuesCount = action.payload.count;
				state.valuesPage = action.payload.page;
				state.valuesHasNext = action.payload.page * 25 < action.payload.count;
				state.valuesHasPrevious = action.payload.page > 1;
			})
			.addCase(fetchLookupValuesList.rejected, (state, action) => {
				state.valuesLoading = false;
				state.error = action.payload;
			})

			// Fetch Lookup Value By ID
			.addCase(fetchLookupValueById.pending, state => {
				state.valuesLoading = true;
				state.error = null;
			})
			.addCase(fetchLookupValueById.fulfilled, (state, action) => {
				state.valuesLoading = false;
				state.currentLookupValue = action.payload;
			})
			.addCase(fetchLookupValueById.rejected, (state, action) => {
				state.valuesLoading = false;
				state.error = action.payload;
			})

			// Create Lookup Value
			.addCase(createLookupValue.pending, state => {
				state.creating = true;
				state.error = null;
			})
			.addCase(createLookupValue.fulfilled, (state, action) => {
				state.creating = false;
				state.success = "Lookup value created successfully";
				state.lookupValues.unshift(action.payload);
			})
			.addCase(createLookupValue.rejected, (state, action) => {
				state.creating = false;
				state.error = action.payload;
			})

			// Update Lookup Value
			.addCase(updateLookupValue.pending, state => {
				state.updating = true;
				state.error = null;
			})
			.addCase(updateLookupValue.fulfilled, (state, action) => {
				state.updating = false;
				state.success = "Lookup value updated successfully";
				const index = state.lookupValues.findIndex(v => v.id === action.payload.id);
				if (index !== -1) {
					state.lookupValues[index] = action.payload;
				}
			})
			.addCase(updateLookupValue.rejected, (state, action) => {
				state.updating = false;
				state.error = action.payload;
			})

			// Delete Lookup Value
			.addCase(deleteLookupValue.pending, state => {
				state.deleting = true;
				state.error = null;
			})
			.addCase(deleteLookupValue.fulfilled, (state, action) => {
				state.deleting = false;
				state.success = "Lookup value deleted successfully";
				state.lookupValues = state.lookupValues.filter(v => v.id !== action.payload);
			})
			.addCase(deleteLookupValue.rejected, (state, action) => {
				state.deleting = false;
				state.error = action.payload;
			});
	},
});

export const { clearError, clearSuccess, clearCurrentLookupType, clearCurrentLookupValue } =
	lookupManagementSlice.actions;
export default lookupManagementSlice.reducer;
