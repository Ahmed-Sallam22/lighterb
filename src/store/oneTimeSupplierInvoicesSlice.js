import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch One-Time Supplier invoices
export const fetchOneTimeSupplierInvoices = createAsyncThunk(
	"oneTimeSupplierInvoices/fetchAll",
	async ({ page = 1, page_size = 20 } = {}, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);

			const response = await api.get(`/finance/invoice/one-time-supplier/?${params.toString()}`);
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
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Failed to fetch One-Time Supplier invoices";
			return rejectWithValue(errorMessage);
		}
	}
);

// Create One-Time Supplier invoice
export const createOneTimeSupplierInvoice = createAsyncThunk(
	"oneTimeSupplierInvoices/create",
	async (invoiceData, { rejectWithValue }) => {
		try {
			console.log("Creating One-Time Supplier invoice:", invoiceData);
			const response = await api.post("/finance/invoice/one-time-supplier/", invoiceData);
			console.log("One-Time Supplier invoice response:", response.data);
			return response.data?.data ?? response.data;
		} catch (error) {
			console.error("One-Time Supplier invoice creation error:", error);
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
						errorMessage = fieldErrors || "Failed to create One-Time Supplier invoice";
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
					errorMessage = fieldErrors || "Failed to create One-Time Supplier invoice";
				} else {
					errorMessage = String(errorData) || "Failed to create One-Time Supplier invoice";
				}
				return rejectWithValue(errorMessage);
			}
			return rejectWithValue(error.message || "Failed to create One-Time Supplier invoice");
		}
	}
);

// Fetch single One-Time Supplier invoice
export const fetchOneTimeSupplierInvoice = createAsyncThunk(
	"oneTimeSupplierInvoices/fetchOne",
	async (id, { rejectWithValue }) => {
		try {
			const response = await api.get(`/finance/invoice/one-time-supplier/${id}/`);
			return response.data?.data ?? response.data;
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Failed to fetch One-Time Supplier invoice";
			return rejectWithValue(errorMessage);
		}
	}
);

// Delete One-Time Supplier invoice
export const deleteOneTimeSupplierInvoice = createAsyncThunk(
	"oneTimeSupplierInvoices/delete",
	async (id, { rejectWithValue }) => {
		try {
			await api.delete(`/finance/invoice/one-time-supplier/${id}/`);
			return id;
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Failed to delete One-Time Supplier invoice";
			return rejectWithValue(errorMessage);
		}
	}
);

const oneTimeSupplierInvoicesSlice = createSlice({
	name: "oneTimeSupplierInvoices",
	initialState: {
		invoices: [],
		currentInvoice: null,
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
		clearCurrentInvoice: state => {
			state.currentInvoice = null;
		},
	},
	extraReducers: builder => {
		const getId = inv => inv?.invoice_id ?? inv?.id;

		builder
			// Fetch One-Time Supplier invoices
			.addCase(fetchOneTimeSupplierInvoices.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchOneTimeSupplierInvoices.fulfilled, (state, action) => {
				state.loading = false;
				state.invoices = action.payload.results || [];
				state.count = action.payload.count;
				state.page = action.payload.page;
				state.pageSize = action.payload.pageSize;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchOneTimeSupplierInvoices.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Create One-Time Supplier invoice
			.addCase(createOneTimeSupplierInvoice.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(createOneTimeSupplierInvoice.fulfilled, (state, action) => {
				state.loading = false;
				state.invoices.push(action.payload);
			})
			.addCase(createOneTimeSupplierInvoice.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch single One-Time Supplier invoice
			.addCase(fetchOneTimeSupplierInvoice.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchOneTimeSupplierInvoice.fulfilled, (state, action) => {
				state.loading = false;
				state.currentInvoice = action.payload;
			})
			.addCase(fetchOneTimeSupplierInvoice.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Delete One-Time Supplier invoice
			.addCase(deleteOneTimeSupplierInvoice.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteOneTimeSupplierInvoice.fulfilled, (state, action) => {
				state.loading = false;
				state.invoices = state.invoices.filter(invoice => getId(invoice) !== action.payload);
			})
			.addCase(deleteOneTimeSupplierInvoice.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { clearError, setPage, clearCurrentInvoice } = oneTimeSupplierInvoicesSlice.actions;
export default oneTimeSupplierInvoicesSlice.reducer;
