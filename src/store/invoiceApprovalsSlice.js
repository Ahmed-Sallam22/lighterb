import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch all invoice approvals

// Fetch pending AP invoice approvals
export const fetchAPPendingApprovals = createAsyncThunk(
	"invoiceApprovals/fetchAPPendingApprovals",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/finance/invoice/ap/pending-approvals/");
			console.log("AP Pending Approvals Response:", response);
			// Handle response shape: { status, message, data: { count, next, previous, results } }
			const results = response.data?.data?.results || response.data?.results || response.data?.data || [];
			const dataArray = Array.isArray(results) ? results : [];
			return dataArray.map(item => ({ ...item, invoice_type: "AP" }));
		} catch (error) {
			console.error("AP Pending Approvals Error:", error.response?.data || error.message);
			return rejectWithValue(
				error.response?.data?.message || error.response?.data?.detail || "Failed to fetch AP pending approvals"
			);
		}
	}
);

// Fetch pending AR invoice approvals
export const fetchARPendingApprovals = createAsyncThunk(
	"invoiceApprovals/fetchARPendingApprovals",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/finance/invoice/ar/pending-approvals/");
			console.log("AR Pending Approvals Response:", response);
			// Handle response shape: { status, message, data: { count, next, previous, results } }
			const results = response.data?.data?.results || response.data?.results || response.data?.data || [];
			const dataArray = Array.isArray(results) ? results : [];
			return dataArray.map(item => ({ ...item, invoice_type: "AR" }));
		} catch (error) {
			console.error("AR Pending Approvals Error:", error.response?.data || error.message);
			return rejectWithValue(
				error.response?.data?.message || error.response?.data?.detail || "Failed to fetch AR pending approvals"
			);
		}
	}
);

// Fetch pending One-Time Supplier invoice approvals
export const fetchOTSPendingApprovals = createAsyncThunk(
	"invoiceApprovals/fetchOTSPendingApprovals",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/finance/invoice/one-time-supplier/pending-approvals/");
			console.log("OTS Pending Approvals Response:", response);
			// Handle response shape: { status, message, data: { count, next, previous, results } }
			const results = response.data?.data?.results || response.data?.results || response.data?.data || [];
			const dataArray = Array.isArray(results) ? results : [];
			return dataArray.map(item => ({ ...item, invoice_type: "OTS" }));
		} catch (error) {
			console.error("OTS Pending Approvals Error:", error.response?.data || error.message);
			return rejectWithValue(
				error.response?.data?.message ||
					error.response?.data?.detail ||
					"Failed to fetch One-Time Supplier pending approvals"
			);
		}
	}
);

// Fetch pending Payment approvals
export const fetchPaymentPendingApprovals = createAsyncThunk(
	"invoiceApprovals/fetchPaymentPendingApprovals",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/finance/payments/pending-approvals/");
			console.log("Payment Pending Approvals Response:", response);
			// Handle response shape: { status, message, data: { count, next, previous, results } }
			const results = response.data?.data?.results || response.data?.results || response.data?.data || [];
			const dataArray = Array.isArray(results) ? results : [];
			return dataArray.map(item => ({ ...item, invoice_type: "PAYMENT" }));
		} catch (error) {
			console.error("Payment Pending Approvals Error:", error.response?.data || error.message);
			return rejectWithValue(
				error.response?.data?.message ||
					error.response?.data?.detail ||
					"Failed to fetch Payment pending approvals"
			);
		}
	}
);

// Fetch all pending approvals (combines AP, AR, OTS, Payment)
export const fetchAllPendingApprovals = createAsyncThunk(
	"invoiceApprovals/fetchAllPendingApprovals",
	async (_, { dispatch, rejectWithValue }) => {
		try {
			const [apResult, arResult, otsResult, paymentResult] = await Promise.allSettled([
				dispatch(fetchAPPendingApprovals()).unwrap(),
				dispatch(fetchARPendingApprovals()).unwrap(),
				dispatch(fetchOTSPendingApprovals()).unwrap(),
				dispatch(fetchPaymentPendingApprovals()).unwrap(),
			]);

			console.log("All pending results:", { apResult, arResult, otsResult, paymentResult });

			const apData = apResult.status === "fulfilled" ? apResult.value : [];
			const arData = arResult.status === "fulfilled" ? arResult.value : [];
			const otsData = otsResult.status === "fulfilled" ? otsResult.value : [];
			const paymentData = paymentResult.status === "fulfilled" ? paymentResult.value : [];

			const combined = [...apData, ...arData, ...otsData, ...paymentData];
			console.log("Combined pending approvals:", combined);
			return combined;
		} catch (_error) {
			console.error("fetchAllPendingApprovals error:", _error);
			return rejectWithValue("Failed to fetch pending approvals");
		}
	}
);

// Create invoice approval
export const createInvoiceApproval = createAsyncThunk(
	"invoiceApprovals/createInvoiceApproval",
	async (approvalData, { rejectWithValue }) => {
		try {
			const response = await api.post("/invoice-approvals/", approvalData);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || "Failed to create invoice approval");
		}
	}
);

// Update invoice approval
export const updateInvoiceApproval = createAsyncThunk(
	"invoiceApprovals/updateInvoiceApproval",
	async ({ id, approvalData }, { rejectWithValue }) => {
		try {
			const response = await api.put(`/invoice-approvals/${id}/`, approvalData);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || "Failed to update invoice approval");
		}
	}
);

// Delete invoice approval
export const deleteInvoiceApproval = createAsyncThunk(
	"invoiceApprovals/deleteInvoiceApproval",
	async (id, { rejectWithValue }) => {
		try {
			await api.delete(`/invoice-approvals/${id}/`);
			return id;
		} catch (error) {
			return rejectWithValue(error.response?.data || "Failed to delete invoice approval");
		}
	}
);

// Approve invoice using approval-action endpoint
export const approveInvoice = createAsyncThunk(
	"invoiceApprovals/approveInvoice",
	async ({ id, invoiceType, comment }, { rejectWithValue }) => {
		try {
			// Determine the correct endpoint based on invoice type
			let endpoint;
			if (invoiceType === "AP") {
				endpoint = `/finance/invoice/ap/${id}/approval-action/`;
			} else if (invoiceType === "AR") {
				endpoint = `/finance/invoice/ar/${id}/approval-action/`;
			} else if (invoiceType === "OTS") {
				endpoint = `/finance/invoice/one-time-supplier/${id}/approval-action/`;
			} else if (invoiceType === "PAYMENT") {
				endpoint = `/finance/payments/${id}/approval-action/`;
			} else {
				endpoint = `/finance/invoice/ap/${id}/approval-action/`;
			}

			const response = await api.post(endpoint, {
				action: "approve",
				comment: comment || "Approved",
			});
			return { ...response.data, id, invoiceType };
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || error.response?.data?.detail || "Failed to approve invoice"
			);
		}
	}
);

// Reject invoice using approval-action endpoint
export const rejectInvoice = createAsyncThunk(
	"invoiceApprovals/rejectInvoice",
	async ({ id, invoiceType, comment }, { rejectWithValue }) => {
		try {
			// Determine the correct endpoint based on invoice type
			let endpoint;
			if (invoiceType === "AP") {
				endpoint = `/finance/invoice/ap/${id}/approval-action/`;
			} else if (invoiceType === "AR") {
				endpoint = `/finance/invoice/ar/${id}/approval-action/`;
			} else if (invoiceType === "OTS") {
				endpoint = `/finance/invoice/one-time-supplier/${id}/approval-action/`;
			} else if (invoiceType === "PAYMENT") {
				endpoint = `/finance/payments/${id}/approval-action/`;
			} else {
				endpoint = `/finance/invoice/ap/${id}/approval-action/`;
			}

			const response = await api.post(endpoint, {
				action: "reject",
				comment: comment || "Rejected",
			});
			return { ...response.data, id, invoiceType };
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || error.response?.data?.detail || "Failed to reject invoice"
			);
		}
	}
);

// Delegate invoice using approval-action endpoint
export const delegateInvoice = createAsyncThunk(
	"invoiceApprovals/delegateInvoice",
	async ({ id, invoiceType, targetUserId, comment }, { rejectWithValue }) => {
		try {
			// Determine the correct endpoint based on invoice type
			let endpoint;
			if (invoiceType === "AP") {
				endpoint = `/finance/invoice/ap/${id}/approval-action/`;
			} else if (invoiceType === "AR") {
				endpoint = `/finance/invoice/ar/${id}/approval-action/`;
			} else if (invoiceType === "OTS") {
				endpoint = `/finance/invoice/one-time-supplier/${id}/approval-action/`;
			} else if (invoiceType === "PAYMENT") {
				endpoint = `/finance/payments/${id}/approval-action/`;
			} else {
				endpoint = `/finance/invoice/ap/${id}/approval-action/`;
			}

			const response = await api.post(endpoint, {
				action: "delegate",
				target_user_id: targetUserId,
				comment: comment || "Delegated for review",
			});
			return { ...response.data, id, invoiceType };
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || error.response?.data?.detail || "Failed to delegate invoice"
			);
		}
	}
);

const invoiceApprovalsSlice = createSlice({
	name: "invoiceApprovals",
	initialState: {
		approvals: [],
		pendingApprovals: [],
		apPendingApprovals: [],
		arPendingApprovals: [],
		otsPendingApprovals: [],
		paymentPendingApprovals: [],
		loading: false,
		error: null,
	},
	reducers: {},
	extraReducers: builder => {
		builder

			.addCase(fetchAPPendingApprovals.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchAPPendingApprovals.fulfilled, (state, action) => {
				state.loading = false;
				state.apPendingApprovals = action.payload;
			})
			.addCase(fetchAPPendingApprovals.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch AR pending approvals
			.addCase(fetchARPendingApprovals.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchARPendingApprovals.fulfilled, (state, action) => {
				state.loading = false;
				state.arPendingApprovals = action.payload;
			})
			.addCase(fetchARPendingApprovals.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch OTS pending approvals
			.addCase(fetchOTSPendingApprovals.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchOTSPendingApprovals.fulfilled, (state, action) => {
				state.loading = false;
				state.otsPendingApprovals = action.payload;
			})
			.addCase(fetchOTSPendingApprovals.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch Payment pending approvals
			.addCase(fetchPaymentPendingApprovals.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchPaymentPendingApprovals.fulfilled, (state, action) => {
				state.loading = false;
				state.paymentPendingApprovals = action.payload;
			})
			.addCase(fetchPaymentPendingApprovals.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch all pending approvals
			.addCase(fetchAllPendingApprovals.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchAllPendingApprovals.fulfilled, (state, action) => {
				state.loading = false;
				state.pendingApprovals = action.payload;
			})
			.addCase(fetchAllPendingApprovals.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Create invoice approval
			.addCase(createInvoiceApproval.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(createInvoiceApproval.fulfilled, (state, action) => {
				state.loading = false;
				state.approvals.push(action.payload);
			})
			.addCase(createInvoiceApproval.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Update invoice approval
			.addCase(updateInvoiceApproval.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateInvoiceApproval.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.approvals.findIndex(approval => approval.id === action.payload.id);
				if (index !== -1) {
					state.approvals[index] = action.payload;
				}
			})
			.addCase(updateInvoiceApproval.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Delete invoice approval
			.addCase(deleteInvoiceApproval.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteInvoiceApproval.fulfilled, (state, action) => {
				state.loading = false;
				state.approvals = state.approvals.filter(approval => approval.id !== action.payload);
			})
			.addCase(deleteInvoiceApproval.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Approve invoice
			.addCase(approveInvoice.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(approveInvoice.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.approvals.findIndex(approval => approval.id === action.payload.id);
				if (index !== -1) {
					state.approvals[index] = action.payload;
				}
			})
			.addCase(approveInvoice.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Reject invoice
			.addCase(rejectInvoice.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(rejectInvoice.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.approvals.findIndex(approval => approval.id === action.payload.id);
				if (index !== -1) {
					state.approvals[index] = action.payload;
				}
			})
			.addCase(rejectInvoice.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Delegate invoice
			.addCase(delegateInvoice.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(delegateInvoice.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.approvals.findIndex(approval => approval.id === action.payload.id);
				if (index !== -1) {
					state.approvals[index] = action.payload;
				}
			})
			.addCase(delegateInvoice.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export default invoiceApprovalsSlice.reducer;
