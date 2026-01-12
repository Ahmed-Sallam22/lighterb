import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch all payment types with optional filters
export const fetchPaymentTypes = createAsyncThunk(
	"paymentTypes/fetchAll",
	async ({ page = 1, page_size = 20, is_active } = {}, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);
			if (is_active !== undefined && is_active !== "") params.append("is_active", is_active);

			const response = await api.get(`/finance/cash/payment-types/?${params.toString()}`);
			const data = response.data?.data ?? response.data;
			return {
				results: data?.results ?? data ?? [],
				count: data?.count ?? 0,
				next: data?.next ?? null,
				previous: data?.previous ?? null,
				page,
				pageSize: page_size,
			};
		} catch (error) {
			return rejectWithValue(error.response?.data || { message: "Failed to fetch payment types" });
		}
	}
);

// Fetch single payment type by ID
export const fetchPaymentTypeById = createAsyncThunk("paymentTypes/fetchById", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/finance/cash/payment-types/${id}/`);
		return response.data?.data ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || "Failed to fetch payment type details");
	}
});

// Create a new payment type
export const createPaymentType = createAsyncThunk(
	"paymentTypes/create",
	async (paymentTypeData, { rejectWithValue }) => {
		try {
			const response = await api.post("/finance/cash/payment-types/", paymentTypeData);
			return response.data?.data ?? response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || { message: "Failed to create payment type" });
		}
	}
);

// Update an existing payment type
export const updatePaymentType = createAsyncThunk("paymentTypes/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.put(`/finance/cash/payment-types/${id}/`, data);
		return response.data?.data ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to update payment type" });
	}
});

// Delete a payment type
export const deletePaymentType = createAsyncThunk("paymentTypes/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/finance/cash/payment-types/${id}/`);
		return id;
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to delete payment type" });
	}
});

// Activate a payment type
export const activatePaymentType = createAsyncThunk("paymentTypes/activate", async (id, { rejectWithValue }) => {
	try {
		const response = await api.patch(`/finance/cash/payment-types/${id}/`, {
			is_active: true,
		});
		return { id, data: response.data?.data ?? response.data };
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to activate payment type" });
	}
});

// Deactivate a payment type
export const deactivatePaymentType = createAsyncThunk("paymentTypes/deactivate", async (id, { rejectWithValue }) => {
	try {
		const response = await api.patch(`/finance/cash/payment-types/${id}/`, {
			is_active: false,
		});
		return { id, data: response.data?.data ?? response.data };
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to deactivate payment type" });
	}
});

const paymentTypesSlice = createSlice({
	name: "paymentTypes",
	initialState: {
		paymentTypes: [],
		selectedPaymentType: null,
		loading: false,
		error: null,
		count: 0,
		page: 1,
		pageSize: 20,
		hasNext: false,
		hasPrevious: false,
		actionLoading: false,
	},
	reducers: {
		clearError: state => {
			state.error = null;
		},
		clearSelectedPaymentType: state => {
			state.selectedPaymentType = null;
		},
		setPage: (state, action) => {
			state.page = action.payload;
		},
	},
	extraReducers: builder => {
		// Fetch Payment Types
		builder
			.addCase(fetchPaymentTypes.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchPaymentTypes.fulfilled, (state, action) => {
				state.loading = false;
				state.paymentTypes = action.payload.results || [];
				state.count = action.payload.count;
				state.page = action.payload.page;
				state.pageSize = action.payload.pageSize;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchPaymentTypes.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload?.message || "Failed to fetch payment types";
			});

		// Fetch Payment Type By ID
		builder
			.addCase(fetchPaymentTypeById.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchPaymentTypeById.fulfilled, (state, action) => {
				state.loading = false;
				state.selectedPaymentType = action.payload;
			})
			.addCase(fetchPaymentTypeById.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Create Payment Type
		builder
			.addCase(createPaymentType.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(createPaymentType.fulfilled, (state, action) => {
				state.actionLoading = false;
				state.paymentTypes.unshift(action.payload);
				state.count += 1;
			})
			.addCase(createPaymentType.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to create payment type";
			});

		// Update Payment Type
		builder
			.addCase(updatePaymentType.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(updatePaymentType.fulfilled, (state, action) => {
				state.actionLoading = false;
				const index = state.paymentTypes.findIndex(pt => pt.id === action.payload.id);
				if (index !== -1) {
					state.paymentTypes[index] = action.payload;
				}
				if (state.selectedPaymentType?.id === action.payload.id) {
					state.selectedPaymentType = action.payload;
				}
			})
			.addCase(updatePaymentType.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to update payment type";
			});

		// Delete Payment Type
		builder
			.addCase(deletePaymentType.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(deletePaymentType.fulfilled, (state, action) => {
				state.actionLoading = false;
				state.paymentTypes = state.paymentTypes.filter(pt => pt.id !== action.payload);
				state.count -= 1;
			})
			.addCase(deletePaymentType.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to delete payment type";
			});

		// Activate Payment Type
		builder
			.addCase(activatePaymentType.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(activatePaymentType.fulfilled, (state, action) => {
				state.actionLoading = false;
				const index = state.paymentTypes.findIndex(pt => pt.id === action.payload.id);
				if (index !== -1) {
					state.paymentTypes[index].is_active = true;
				}
				if (state.selectedPaymentType?.id === action.payload.id) {
					state.selectedPaymentType.is_active = true;
				}
			})
			.addCase(activatePaymentType.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to activate payment type";
			});

		// Deactivate Payment Type
		builder
			.addCase(deactivatePaymentType.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(deactivatePaymentType.fulfilled, (state, action) => {
				state.actionLoading = false;
				const index = state.paymentTypes.findIndex(pt => pt.id === action.payload.id);
				if (index !== -1) {
					state.paymentTypes[index].is_active = false;
				}
				if (state.selectedPaymentType?.id === action.payload.id) {
					state.selectedPaymentType.is_active = false;
				}
			})
			.addCase(deactivatePaymentType.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to deactivate payment type";
			});
	},
});

export const { clearError, clearSelectedPaymentType, setPage } = paymentTypesSlice.actions;
export default paymentTypesSlice.reducer;
