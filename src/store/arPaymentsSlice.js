import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch AR payments
export const fetchARPayments = createAsyncThunk(
	"arPayments/fetchAll",
	async (
		{
			page = 1,
			page_size = 20,
			approval_status,
			business_partner_id,
			currency_id,
			date_from,
			date_to,
			has_allocations,
		} = {},
		{ rejectWithValue }
	) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);

			// Add optional filter parameters
			if (approval_status) params.append("approval_status", approval_status);
			if (business_partner_id) params.append("business_partner_id", business_partner_id);
			if (currency_id) params.append("currency_id", currency_id);
			if (date_from) params.append("date_from", date_from);
			if (date_to) params.append("date_to", date_to);
			if (has_allocations !== undefined && has_allocations !== "")
				params.append("has_allocations", has_allocations);

			const response = await api.get(`/finance/payments/?${params.toString()}`);
			const data = response.data?.data ?? response.data;
			return {
				results: data?.results ?? (Array.isArray(data) ? data : []),
				count: data?.count ?? 0,
				next: data?.next ?? null,
				previous: data?.previous ?? null,
				page,
				pageSize: page_size,
			};
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Failed to fetch AR payments";
			return rejectWithValue(errorMessage);
		}
	}
);

// Create AR payment
export const createARPayment = createAsyncThunk("arPayments/create", async (paymentData, { rejectWithValue }) => {
	try {
		const response = await api.post("//finance/payments/", paymentData);
		return response.data;
	} catch (error) {
		if (error.response?.data) {
			const errorData = error.response.data;
			let errorMessage = "";

			if (typeof errorData === "object" && !errorData.message && !errorData.error && !errorData.detail) {
				const fieldErrors = Object.entries(errorData)
					.map(([field, messages]) => {
						const messageText = Array.isArray(messages) ? messages.join(", ") : messages;
						return `${field}: ${messageText}`;
					})
					.join(" | ");
				errorMessage = fieldErrors;
			} else {
				errorMessage =
					errorData.message || errorData.error || errorData.detail || "Failed to create AR payment";
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to create AR payment");
	}
});

// Post AR payment
export const postARPayment = createAsyncThunk("arPayments/post", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`//finance/payments/${id}/post/`);
		return response.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to post AR payment";
		return rejectWithValue(errorMessage);
	}
});

// Submit AR payment for approval
export const submitARPaymentForApproval = createAsyncThunk(
	"arPayments/submitForApproval",
	async (id, { rejectWithValue }) => {
		try {
			const response = await api.post(`/finance/payments/${id}/submit-for-approval/`);
			return response.data?.data ?? response.data;
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Failed to submit payment for approval";
			return rejectWithValue(errorMessage);
		}
	}
);

// Post AR payment to GL
export const postARPaymentToGL = createAsyncThunk("arPayments/postToGL", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/finance/payments/${id}/post-to-gl/`);
		return response.data?.data ?? response.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to post payment to GL";
		return rejectWithValue(errorMessage);
	}
});

// Update AR payment
export const updateARPayment = createAsyncThunk("arPayments/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.put(`//finance/payments/${id}/`, data);
		return response.data;
	} catch (error) {
		if (error.response?.data) {
			const errorData = error.response.data;
			let errorMessage = "";

			if (typeof errorData === "object" && !errorData.message && !errorData.error && !errorData.detail) {
				const fieldErrors = Object.entries(errorData)
					.map(([field, messages]) => {
						const messageText = Array.isArray(messages) ? messages.join(", ") : messages;
						return `${field}: ${messageText}`;
					})
					.join(" | ");
				errorMessage = fieldErrors;
			} else {
				errorMessage =
					errorData.message || errorData.error || errorData.detail || "Failed to update AR payment";
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to update AR payment");
	}
});

// Delete AR payment
export const deleteARPayment = createAsyncThunk("arPayments/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/finance/payments/${id}/`);
		return id;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to delete AR payment";
		return rejectWithValue(errorMessage);
	}
});

const arPaymentsSlice = createSlice({
	name: "arPayments",
	initialState: {
		payments: [],
		// Pagination state
		count: 0,
		page: 1,
		pageSize: 20,
		hasNext: false,
		hasPrevious: false,
		loading: false,
		error: null,
	},
	reducers: {
		clearError: state => {
			state.error = null;
		},
		setPage: (state, action) => {
			state.page = action.payload;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch AR payments
			.addCase(fetchARPayments.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchARPayments.fulfilled, (state, action) => {
				state.loading = false;
				state.payments = action.payload.results || [];
				state.count = action.payload.count;
				state.page = action.payload.page;
				state.pageSize = action.payload.pageSize;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchARPayments.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Create AR payment
			.addCase(createARPayment.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(createARPayment.fulfilled, (state, action) => {
				state.loading = false;
				state.payments.push(action.payload);
			})
			.addCase(createARPayment.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Update AR payment
			.addCase(updateARPayment.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateARPayment.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.payments.findIndex(payment => payment.id === action.payload.id);
				if (index !== -1) {
					state.payments[index] = action.payload;
				}
			})
			.addCase(updateARPayment.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Delete AR payment
			.addCase(deleteARPayment.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteARPayment.fulfilled, (state, action) => {
				state.loading = false;
				state.payments = state.payments.filter(payment => payment.id !== action.payload);
			})
			.addCase(deleteARPayment.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Post AR payment
			.addCase(postARPayment.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(postARPayment.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.payments.findIndex(payment => payment.id === action.payload.id);
				if (index !== -1) {
					state.payments[index] = action.payload;
				}
			})
			.addCase(postARPayment.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Submit for approval
			.addCase(submitARPaymentForApproval.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(submitARPaymentForApproval.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.payments.findIndex(payment => payment.id === action.payload.id);
				if (index !== -1) {
					state.payments[index] = { ...state.payments[index], ...action.payload };
				}
			})
			.addCase(submitARPaymentForApproval.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Post to GL
			.addCase(postARPaymentToGL.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(postARPaymentToGL.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.payments.findIndex(payment => payment.id === action.payload.id);
				if (index !== -1) {
					state.payments[index] = { ...state.payments[index], ...action.payload };
				}
			})
			.addCase(postARPaymentToGL.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { clearError, setPage } = arPaymentsSlice.actions;
export default arPaymentsSlice.reducer;
