import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch AP payments
export const fetchAPPayments = createAsyncThunk(
	"apPayments/fetchAll",
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
				"Failed to fetch AP payments";
			return rejectWithValue(errorMessage);
		}
	}
);

// Fetch single AP payment details
export const fetchAPPaymentDetails = createAsyncThunk(
	"apPayments/fetchDetails",
	async (id, { rejectWithValue }) => {
		try {
			const response = await api.get(`/finance/payments/${id}/`);
			const paymentData = response.data?.data ?? response.data;

			// Transform GL entry lines to match form structure
			const transformedPayment = {
				...paymentData,
				gl_entry: paymentData.gl_entry_details ? {
					date: paymentData.gl_entry_details.date,
					currency_id: paymentData.gl_entry_details.currency_id,
					memo: paymentData.gl_entry_details.memo,
					lines: paymentData.gl_entry_details.lines?.map(line => ({
						id: line.id,
						amount: line.amount,
						type: line.type,
						segments: line.segment_combination?.segments?.map(seg => ({
							segment_type_id: seg.segment_type_id,
							segment_code: seg.segment_code,
						})) || [],
					})) || [],
				} : null,
			};

			return transformedPayment;
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Failed to fetch payment details";
			return rejectWithValue(errorMessage);
		}
	}
);

// Create AP payment
export const createAPPayment = createAsyncThunk("apPayments/create", async (paymentData, { rejectWithValue }) => {
	try {
		const response = await api.post("/finance/payments/", paymentData);
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
					errorData.message || errorData.error || errorData.detail || "Failed to create AP payment";
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to create AP payment");
	}
});

// Post AP payment
export const postAPPayment = createAsyncThunk("apPayments/post", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/finance/payments/${id}/post/`);
		return response.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to post AP payment";
		return rejectWithValue(errorMessage);
	}
});

// Submit AP payment for approval
export const submitAPPaymentForApproval = createAsyncThunk(
	"apPayments/submitForApproval",
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

// Post AP payment to GL
export const postAPPaymentToGL = createAsyncThunk("apPayments/postToGL", async (id, { rejectWithValue }) => {
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

// Update AP payment
export const updateAPPayment = createAsyncThunk("apPayments/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.put(`/finance/payments/${id}/`, data);
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
					errorData.message || errorData.error || errorData.detail || "Failed to update AP payment";
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to update AP payment");
	}
});

// Delete AP payment
export const deleteAPPayment = createAsyncThunk("apPayments/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/finance/payments/${id}/`);
		return id;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to delete AP payment";
		return rejectWithValue(errorMessage);
	}
});

const apPaymentsSlice = createSlice({
	name: "apPayments",
	initialState: {
		payments: [],
		currentPayment: null, // For storing fetched payment details
		// Pagination state
		count: 0,
		page: 1,
		pageSize: 20,
		hasNext: false,
		hasPrevious: false,
		loading: false,
		detailsLoading: false, // Separate loading state for details
		error: null,
	},
	reducers: {
		clearError: state => {
			state.error = null;
		},
		setPage: (state, action) => {
			state.page = action.payload;
		},
		clearCurrentPayment: state => {
			state.currentPayment = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch AP payments
			.addCase(fetchAPPayments.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchAPPayments.fulfilled, (state, action) => {
				state.loading = false;
				state.payments = action.payload.results || [];
				state.count = action.payload.count;
				state.page = action.payload.page;
				state.pageSize = action.payload.pageSize;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchAPPayments.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch payment details
			.addCase(fetchAPPaymentDetails.pending, state => {
				state.detailsLoading = true;
				state.error = null;
			})
			.addCase(fetchAPPaymentDetails.fulfilled, (state, action) => {
				state.detailsLoading = false;
				state.currentPayment = action.payload;
			})
			.addCase(fetchAPPaymentDetails.rejected, (state, action) => {
				state.detailsLoading = false;
				state.error = action.payload;
			})
			// Create AP payment
			.addCase(createAPPayment.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(createAPPayment.fulfilled, (state, action) => {
				state.loading = false;
				state.payments.push(action.payload);
			})
			.addCase(createAPPayment.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Update AP payment
			.addCase(updateAPPayment.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateAPPayment.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.payments.findIndex(payment => payment.id === action.payload.id);
				if (index !== -1) {
					state.payments[index] = action.payload;
				}
			})
			.addCase(updateAPPayment.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Delete AP payment
			.addCase(deleteAPPayment.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteAPPayment.fulfilled, (state, action) => {
				state.loading = false;
				state.payments = state.payments.filter(payment => payment.id !== action.payload);
			})
			.addCase(deleteAPPayment.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Post AP payment
			.addCase(postAPPayment.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(postAPPayment.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.payments.findIndex(payment => payment.id === action.payload.id);
				if (index !== -1) {
					state.payments[index] = action.payload;
				}
			})
			.addCase(postAPPayment.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Submit for approval
			.addCase(submitAPPaymentForApproval.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(submitAPPaymentForApproval.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.payments.findIndex(payment => payment.id === action.payload.id);
				if (index !== -1) {
					state.payments[index] = { ...state.payments[index], ...action.payload };
				}
			})
			.addCase(submitAPPaymentForApproval.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Post to GL
			.addCase(postAPPaymentToGL.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(postAPPaymentToGL.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.payments.findIndex(payment => payment.id === action.payload.id);
				if (index !== -1) {
					state.payments[index] = { ...state.payments[index], ...action.payload };
				}
			})
			.addCase(postAPPaymentToGL.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { clearError, setPage, clearCurrentPayment } = apPaymentsSlice.actions;
export default apPaymentsSlice.reducer;
