import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch AR invoices
export const fetchARInvoices = createAsyncThunk(
	"arInvoices/fetchAll",
	async ({ page = 1, page_size = 20 } = {}, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);

			const response = await api.get(`/finance/invoice/ar/?${params.toString()}`);
			const data = response.data?.data ?? response.data;
			return {
				results: data?.results ?? data,
				count: data?.count ?? 0,
				next: data?.next ?? null,
				previous: data?.previous ?? null,
				page,
				pageSize: page_size,
			};
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch AR invoices");
		}
	}
);

// Create AR invoice
export const createARInvoice = createAsyncThunk("arInvoices/create", async (invoiceData, { rejectWithValue }) => {
	try {
		console.log("Creating AR invoice:", invoiceData);
		const response = await api.post("/finance/invoice/ar/", invoiceData);
		console.log("AR invoice response:", response.data);
		return response.data?.data ?? response.data;
	} catch (error) {
		console.error("AR invoice creation error:", error);
		console.error("Error response:", error.response?.data);

		if (error.response?.data) {
			const errorData = error.response.data;
			let errorMessage = "";

			// Check if error is wrapped in data object
			if (errorData.data && typeof errorData.data === "object") {
				const nestedErrors = errorData.data;
				if (nestedErrors.message) {
					errorMessage = nestedErrors.message;
				} else {
					const fieldErrors = Object.entries(nestedErrors)
						.map(([field, messages]) => {
							const messageText = Array.isArray(messages) ? messages.join(", ") : String(messages);
							return `${field}: ${messageText}`;
						})
						.join(" | ");
					errorMessage = fieldErrors || "Failed to create AR invoice";
				}
			} else if (errorData.message) {
				errorMessage = errorData.message;
			} else if (errorData.error) {
				errorMessage = errorData.error;
			} else if (errorData.detail) {
				errorMessage = errorData.detail;
			} else if (typeof errorData === "object") {
				const fieldErrors = Object.entries(errorData)
					.map(([field, messages]) => {
						const messageText = Array.isArray(messages) ? messages.join(", ") : String(messages);
						return `${field}: ${messageText}`;
					})
					.join(" | ");
				errorMessage = fieldErrors || "Failed to create AR invoice";
			} else {
				errorMessage = String(errorData) || "Failed to create AR invoice";
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to create AR invoice");
	}
});

// Update AR invoice
export const updateARInvoice = createAsyncThunk(
	"arInvoices/update",
	async ({ id, invoiceData }, { rejectWithValue }) => {
		try {
			const response = await api.put(`/finance/invoice/ar/${id}/`, invoiceData);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.message || "Failed to update AR invoice");
		}
	}
);

// Delete AR invoice
export const deleteARInvoice = createAsyncThunk("arInvoices/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/finance/invoice/ar/${id}/`);
		return id;
	} catch (error) {
		return rejectWithValue(error.message || "Failed to delete AR invoice");
	}
});

// Submit AR invoice for approval
export const submitARInvoiceForApproval = createAsyncThunk(
	"arInvoices/submitForApproval",
	async (id, { rejectWithValue }) => {
		try {
			const response = await api.post(`/finance/invoice/ar/${id}/submit-for-approval/`);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.message || "Failed to submit AR invoice for approval");
		}
	}
);

// Reverse AR invoice
export const reverseARInvoice = createAsyncThunk("arInvoices/reverse", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/finance/invoice/ar/${id}/reverse/`);
		return response.data;
	} catch (error) {
		return rejectWithValue(error.message || "Failed to reverse AR invoice");
	}
});

// Post AR invoice to GL
export const postARInvoiceToGL = createAsyncThunk("arInvoices/postGL", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/finance/invoice/ar/${id}/post-gl/`);
		return response.data;
	} catch (error) {
		return rejectWithValue(error.message || "Failed to post AR invoice to GL");
	}
});

const arInvoicesSlice = createSlice({
	name: "arInvoices",
	initialState: {
		invoices: [],
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
		const getId = inv => inv?.invoice_id ?? inv?.id;
		const findIndexById = (state, payload) =>
			state.invoices.findIndex(invoice => getId(invoice) === getId(payload));

		builder
			// Fetch AR invoices
			.addCase(fetchARInvoices.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchARInvoices.fulfilled, (state, action) => {
				state.loading = false;
				state.invoices = action.payload.results || [];
				state.count = action.payload.count;
				state.page = action.payload.page;
				state.pageSize = action.payload.pageSize;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchARInvoices.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Create AR invoice
			.addCase(createARInvoice.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(createARInvoice.fulfilled, (state, action) => {
				state.loading = false;
				state.invoices.push(action.payload);
			})
			.addCase(createARInvoice.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Update AR invoice
			.addCase(updateARInvoice.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateARInvoice.fulfilled, (state, action) => {
				state.loading = false;
				const index = findIndexById(state, action.payload);
				if (index !== -1) {
					state.invoices[index] = action.payload;
				}
			})
			.addCase(updateARInvoice.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Delete AR invoice
			.addCase(deleteARInvoice.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteARInvoice.fulfilled, (state, action) => {
				state.loading = false;
				state.invoices = state.invoices.filter(invoice => invoice.id !== action.payload);
			})
			.addCase(deleteARInvoice.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Submit for approval
			.addCase(submitARInvoiceForApproval.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(submitARInvoiceForApproval.fulfilled, (state, action) => {
				state.loading = false;
				const index = findIndexById(state, action.payload);
				if (index !== -1) {
					state.invoices[index] = action.payload;
				}
			})
			.addCase(submitARInvoiceForApproval.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Reverse invoice
			.addCase(reverseARInvoice.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(reverseARInvoice.fulfilled, (state, action) => {
				state.loading = false;
				const index = findIndexById(state, action.payload);
				if (index !== -1) {
					state.invoices[index] = action.payload;
				}
			})
			.addCase(reverseARInvoice.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Post to GL
			.addCase(postARInvoiceToGL.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(postARInvoiceToGL.fulfilled, (state, action) => {
				state.loading = false;
				const index = findIndexById(state, action.payload);
				if (index !== -1) {
					state.invoices[index] = action.payload;
				}
			})
			.addCase(postARInvoiceToGL.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { clearError, setPage } = arInvoicesSlice.actions;
export default arInvoicesSlice.reducer;
