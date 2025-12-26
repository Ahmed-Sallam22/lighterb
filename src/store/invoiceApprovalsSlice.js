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

// Fetch pending Catalog PR approvals
export const fetchCatalogPRPendingApprovals = createAsyncThunk(
	"invoiceApprovals/fetchCatalogPRPendingApprovals",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/procurement/pr/catalog/pending-approvals/");
			console.log("Catalog PR Pending Approvals Response:", response);
			const results = response.data?.data?.results || response.data?.results || response.data?.data || [];
			const dataArray = Array.isArray(results) ? results : [];
			return dataArray.map(item => ({ ...item, pr_type: "CATALOG" }));
		} catch (error) {
			console.error("Catalog PR Pending Approvals Error:", error.response?.data || error.message);
			return rejectWithValue(
				error.response?.data?.message ||
					error.response?.data?.detail ||
					"Failed to fetch Catalog PR pending approvals"
			);
		}
	}
);

// Fetch pending PO approvals
export const fetchPOPendingApprovals = createAsyncThunk(
	"invoiceApprovals/fetchPOPendingApprovals",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/procurement/po/pending-approvals/");
			console.log("PO Pending Approvals Response:", response);
			const results = response.data?.data?.results || response.data?.results || response.data?.data || [];
			const dataArray = Array.isArray(results) ? results : [];
			return dataArray;
		} catch (error) {
			console.error("PO Pending Approvals Error:", error.response?.data || error.message);
			return rejectWithValue(
				error.response?.data?.message || error.response?.data?.detail || "Failed to fetch PO pending approvals"
			);
		}
	}
);

// Approve PO using approval-action endpoint
export const approvePO = createAsyncThunk(
	"invoiceApprovals/approvePO",
	async ({ id, comments }, { rejectWithValue }) => {
		try {
			const response = await api.post(`/procurement/po/${id}/approval-action/`, {
				action: "approve",
				comments: comments || "Approved",
			});
			return { ...response.data, id };
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || error.response?.data?.detail || "Failed to approve PO"
			);
		}
	}
);

// Reject PO using approval-action endpoint
export const rejectPO = createAsyncThunk("invoiceApprovals/rejectPO", async ({ id, comments }, { rejectWithValue }) => {
	try {
		const response = await api.post(`/procurement/po/${id}/approval-action/`, {
			action: "REJECT",
			comments: comments || "Rejected",
		});
		return { ...response.data, id };
	} catch (error) {
		return rejectWithValue(error.response?.data?.message || error.response?.data?.detail || "Failed to reject PO");
	}
});

// Fetch pending Non-Catalog PR approvals
export const fetchNonCatalogPRPendingApprovals = createAsyncThunk(
	"invoiceApprovals/fetchNonCatalogPRPendingApprovals",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/procurement/pr/non-catalog/pending-approvals/");
			console.log("Non-Catalog PR Pending Approvals Response:", response);
			const results = response.data?.data?.results || response.data?.results || response.data?.data || [];
			const dataArray = Array.isArray(results) ? results : [];
			return dataArray.map(item => ({ ...item, pr_type: "NON_CATALOG" }));
		} catch (error) {
			console.error("Non-Catalog PR Pending Approvals Error:", error.response?.data || error.message);
			return rejectWithValue(
				error.response?.data?.message ||
					error.response?.data?.detail ||
					"Failed to fetch Non-Catalog PR pending approvals"
			);
		}
	}
);

// Fetch pending Service PR approvals
export const fetchServicePRPendingApprovals = createAsyncThunk(
	"invoiceApprovals/fetchServicePRPendingApprovals",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/procurement/pr/service/pending-approvals/");
			console.log("Service PR Pending Approvals Response:", response);
			const results = response.data?.data?.results || response.data?.results || response.data?.data || [];
			const dataArray = Array.isArray(results) ? results : [];
			return dataArray.map(item => ({ ...item, pr_type: "SERVICE" }));
		} catch (error) {
			console.error("Service PR Pending Approvals Error:", error.response?.data || error.message);
			return rejectWithValue(
				error.response?.data?.message ||
					error.response?.data?.detail ||
					"Failed to fetch Service PR pending approvals"
			);
		}
	}
);

// Fetch all pending procurement approvals (combines Catalog, Non-Catalog, Service)
export const fetchAllProcurementPendingApprovals = createAsyncThunk(
	"invoiceApprovals/fetchAllProcurementPendingApprovals",
	async (_, { dispatch, rejectWithValue }) => {
		try {
			const [catalogResult, nonCatalogResult, serviceResult] = await Promise.allSettled([
				dispatch(fetchCatalogPRPendingApprovals()).unwrap(),
				dispatch(fetchNonCatalogPRPendingApprovals()).unwrap(),
				dispatch(fetchServicePRPendingApprovals()).unwrap(),
			]);

			console.log("All procurement pending results:", { catalogResult, nonCatalogResult, serviceResult });

			const catalogData = catalogResult.status === "fulfilled" ? catalogResult.value : [];
			const nonCatalogData = nonCatalogResult.status === "fulfilled" ? nonCatalogResult.value : [];
			const serviceData = serviceResult.status === "fulfilled" ? serviceResult.value : [];

			const combined = [...catalogData, ...nonCatalogData, ...serviceData];
			console.log("Combined procurement pending approvals:", combined);
			return combined;
		} catch (_error) {
			console.error("fetchAllProcurementPendingApprovals error:", _error);
			return rejectWithValue("Failed to fetch procurement pending approvals");
		}
	}
);

// Approve procurement PR using approval-action endpoint
export const approveProcurementPR = createAsyncThunk(
	"invoiceApprovals/approveProcurementPR",
	async ({ id, prType, comments }, { rejectWithValue }) => {
		try {
			let endpoint;
			if (prType === "CATALOG") {
				endpoint = `/procurement/pr/catalog/${id}/approval-action/`;
			} else if (prType === "NON_CATALOG") {
				endpoint = `/procurement/pr/non-catalog/${id}/approval-action/`;
			} else if (prType === "SERVICE") {
				endpoint = `/procurement/pr/service/${id}/approval-action/`;
			} else {
				endpoint = `/procurement/pr/catalog/${id}/approval-action/`;
			}

			const response = await api.post(endpoint, {
				action: "approve",
				comments: comments || "Approved",
			});
			return { ...response.data, id, prType };
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || error.response?.data?.detail || "Failed to approve procurement request"
			);
		}
	}
);

// Reject procurement PR using approval-action endpoint
export const rejectProcurementPR = createAsyncThunk(
	"invoiceApprovals/rejectProcurementPR",
	async ({ id, prType, comments }, { rejectWithValue }) => {
		try {
			let endpoint;
			if (prType === "CATALOG") {
				endpoint = `/procurement/pr/catalog/${id}/approval-action/`;
			} else if (prType === "NON_CATALOG") {
				endpoint = `/procurement/pr/non-catalog/${id}/approval-action/`;
			} else if (prType === "SERVICE") {
				endpoint = `/procurement/pr/service/${id}/approval-action/`;
			} else {
				endpoint = `/procurement/pr/catalog/${id}/approval-action/`;
			}

			const response = await api.post(endpoint, {
				action: "reject",
				comments: comments || "Rejected",
			});
			return { ...response.data, id, prType };
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || error.response?.data?.detail || "Failed to reject procurement request"
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
		// Procurement approvals
		procurementPendingApprovals: [],
		catalogPRPendingApprovals: [],
		nonCatalogPRPendingApprovals: [],
		servicePRPendingApprovals: [],
		// PO approvals
		poPendingApprovals: [],
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
			})
			// Fetch Catalog PR pending approvals
			.addCase(fetchCatalogPRPendingApprovals.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCatalogPRPendingApprovals.fulfilled, (state, action) => {
				state.loading = false;
				state.catalogPRPendingApprovals = action.payload;
			})
			.addCase(fetchCatalogPRPendingApprovals.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch Non-Catalog PR pending approvals
			.addCase(fetchNonCatalogPRPendingApprovals.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchNonCatalogPRPendingApprovals.fulfilled, (state, action) => {
				state.loading = false;
				state.nonCatalogPRPendingApprovals = action.payload;
			})
			.addCase(fetchNonCatalogPRPendingApprovals.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch Service PR pending approvals
			.addCase(fetchServicePRPendingApprovals.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchServicePRPendingApprovals.fulfilled, (state, action) => {
				state.loading = false;
				state.servicePRPendingApprovals = action.payload;
			})
			.addCase(fetchServicePRPendingApprovals.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch all procurement pending approvals
			.addCase(fetchAllProcurementPendingApprovals.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchAllProcurementPendingApprovals.fulfilled, (state, action) => {
				state.loading = false;
				state.procurementPendingApprovals = action.payload;
			})
			.addCase(fetchAllProcurementPendingApprovals.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Approve procurement PR
			.addCase(approveProcurementPR.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(approveProcurementPR.fulfilled, (state, action) => {
				state.loading = false;
				// Remove the approved PR from the pending list
				state.procurementPendingApprovals = state.procurementPendingApprovals.filter(
					pr => pr.pr_id !== action.payload.id
				);
			})
			.addCase(approveProcurementPR.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Reject procurement PR
			.addCase(rejectProcurementPR.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(rejectProcurementPR.fulfilled, (state, action) => {
				state.loading = false;
				// Remove the rejected PR from the pending list
				state.procurementPendingApprovals = state.procurementPendingApprovals.filter(
					pr => pr.pr_id !== action.payload.id
				);
			})
			.addCase(rejectProcurementPR.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch PO pending approvals
			.addCase(fetchPOPendingApprovals.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchPOPendingApprovals.fulfilled, (state, action) => {
				state.loading = false;
				state.poPendingApprovals = action.payload;
			})
			.addCase(fetchPOPendingApprovals.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Approve PO
			.addCase(approvePO.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(approvePO.fulfilled, (state, action) => {
				state.loading = false;
				// Remove the approved PO from the pending list
				state.poPendingApprovals = state.poPendingApprovals.filter(po => po.po_id !== action.payload.id);
			})
			.addCase(approvePO.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Reject PO
			.addCase(rejectPO.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(rejectPO.fulfilled, (state, action) => {
				state.loading = false;
				// Remove the rejected PO from the pending list
				state.poPendingApprovals = state.poPendingApprovals.filter(po => po.po_id !== action.payload.id);
			})
			.addCase(rejectPO.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export default invoiceApprovalsSlice.reducer;
