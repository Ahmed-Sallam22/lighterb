import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Helper to extract error message
const extractErrorMessage = (error, defaultMsg) => {
	if (error.response?.data) {
		const errorData = error.response.data;
		if (typeof errorData === "object" && !errorData.message && !errorData.error && !errorData.detail) {
			const fieldErrors = Object.entries(errorData)
				.map(([field, messages]) => {
					const messageText = Array.isArray(messages) ? messages.join(", ") : messages;
					return `${field}: ${messageText}`;
				})
				.join(" | ");
			if (fieldErrors) return fieldErrors;
		}
		return errorData.message || errorData.error || errorData.detail || defaultMsg;
	}
	return error.message || defaultMsg;
};

// Fetch all suppliers
export const fetchSuppliers = createAsyncThunk("suppliers/fetchAll", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/finance/bp/suppliers/");
		const payload = response.data?.data ?? response.data;
		return payload?.results ?? payload ?? [];
	} catch (error) {
		return rejectWithValue(extractErrorMessage(error, "Failed to fetch suppliers"));
	}
});

// Fetch active suppliers only
export const fetchActiveSuppliers = createAsyncThunk("suppliers/fetchActive", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/finance/bp/suppliers/active/");
		const payload = response.data?.data ?? response.data;
		return payload?.results ?? payload ?? [];
	} catch (error) {
		return rejectWithValue(extractErrorMessage(error, "Failed to fetch active suppliers"));
	}
});

// Fetch supplier by ID
export const fetchSupplierById = createAsyncThunk("suppliers/fetchById", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/finance/bp/suppliers/${id}/`);
		const payload = response.data?.data ?? response.data;
		return payload;
	} catch (error) {
		return rejectWithValue(extractErrorMessage(error, "Failed to fetch supplier"));
	}
});

// Create supplier
export const createSupplier = createAsyncThunk("suppliers/create", async (supplierData, { rejectWithValue }) => {
	try {
		const response = await api.post("/finance/bp/suppliers/", supplierData);
		const payload = response.data?.data ?? response.data;
		return payload;
	} catch (error) {
		return rejectWithValue(extractErrorMessage(error, "Failed to create supplier"));
	}
});

// Update supplier
export const updateSupplier = createAsyncThunk(
	"suppliers/update",
	async ({ id, supplierData }, { rejectWithValue }) => {
		try {
			const response = await api.put(`/finance/bp/suppliers/${id}/`, supplierData);
			const payload = response.data?.data ?? response.data;
			return payload;
		} catch (error) {
			return rejectWithValue(extractErrorMessage(error, "Failed to update supplier"));
		}
	}
);

// Delete supplier
export const deleteSupplier = createAsyncThunk("suppliers/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/finance/bp/suppliers/${id}/`);
		return id;
	} catch (error) {
		return rejectWithValue(extractErrorMessage(error, "Failed to delete supplier"));
	}
});

// Toggle supplier active status
export const toggleSupplierActive = createAsyncThunk("suppliers/toggleActive", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/finance/bp/suppliers/${id}/toggle-active/`);
		const payload = response.data?.data ?? response.data;
		return payload;
	} catch (error) {
		return rejectWithValue(extractErrorMessage(error, "Failed to toggle supplier status"));
	}
});

const suppliersSlice = createSlice({
	name: "suppliers",
	initialState: {
		suppliers: [],
		selectedSupplier: null,
		loading: false,
		error: null,
	},
	reducers: {
		clearError: state => {
			state.error = null;
		},
		clearSelectedSupplier: state => {
			state.selectedSupplier = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch all suppliers
			.addCase(fetchSuppliers.pending, state => {
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
			// Fetch active suppliers
			.addCase(fetchActiveSuppliers.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchActiveSuppliers.fulfilled, (state, action) => {
				state.loading = false;
				state.suppliers = action.payload;
			})
			.addCase(fetchActiveSuppliers.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch supplier by ID
			.addCase(fetchSupplierById.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchSupplierById.fulfilled, (state, action) => {
				state.loading = false;
				state.selectedSupplier = action.payload;
			})
			.addCase(fetchSupplierById.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Create supplier
			.addCase(createSupplier.pending, state => {
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
			.addCase(updateSupplier.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateSupplier.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.suppliers.findIndex(s => s.id === action.payload.id);
				if (index !== -1) {
					state.suppliers[index] = action.payload;
				}
				state.selectedSupplier = action.payload;
			})
			.addCase(updateSupplier.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Delete supplier
			.addCase(deleteSupplier.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteSupplier.fulfilled, (state, action) => {
				state.loading = false;
				state.suppliers = state.suppliers.filter(s => s.id !== action.payload);
			})
			.addCase(deleteSupplier.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Toggle active
			.addCase(toggleSupplierActive.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(toggleSupplierActive.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.suppliers.findIndex(s => s.id === action.payload.id);
				if (index !== -1) {
					state.suppliers[index] = action.payload;
				}
			})
			.addCase(toggleSupplierActive.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { clearError, clearSelectedSupplier } = suppliersSlice.actions;
export default suppliersSlice.reducer;
