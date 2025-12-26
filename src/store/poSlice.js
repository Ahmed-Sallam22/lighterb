import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch POs
export const fetchPOs = createAsyncThunk(
	"po/fetchAll",
	async ({ page = 1, page_size = 20, search, status } = {}, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);

			if (search) params.append("search", search);
			if (status) params.append("status", status);

			const response = await api.get(`/procurement/po/?${params.toString()}`);
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
				"Failed to fetch purchase orders";
			return rejectWithValue(errorMessage);
		}
	}
);

// Fetch single PO details
export const fetchPODetails = createAsyncThunk("po/fetchDetails", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/procurement/po/${id}/`);
		return response.data?.data ?? response.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch PO details";
		return rejectWithValue(errorMessage);
	}
});

// Delete PO
export const deletePO = createAsyncThunk("po/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/procurement/po/${id}/`);
		return id;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to delete purchase order";
		return rejectWithValue(errorMessage);
	}
});

// Submit PO for approval
export const submitPOForApproval = createAsyncThunk("po/submitForApproval", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/procurement/po/${id}/submit-for-approval/`);
		return response.data?.data ?? response.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to submit PO for approval";
		return rejectWithValue(errorMessage);
	}
});

// Confirm PO
export const confirmPO = createAsyncThunk("po/confirm", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/procurement/po/${id}/confirm/`);
		return response.data?.data ?? response.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to confirm purchase order";
		return rejectWithValue(errorMessage);
	}
});

// Cancel PO
export const cancelPO = createAsyncThunk("po/cancel", async ({ id, reason }, { rejectWithValue }) => {
	try {
		const response = await api.post(`/procurement/po/${id}/cancel/`, { reason });
		return response.data?.data ?? response.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to cancel purchase order";
		return rejectWithValue(errorMessage);
	}
});

const poSlice = createSlice({
	name: "po",
	initialState: {
		poList: [],
		currentPO: null,
		count: 0,
		page: 1,
		pageSize: 20,
		hasNext: false,
		hasPrevious: false,
		loading: false,
		detailsLoading: false,
		error: null,
	},
	reducers: {
		clearError: state => {
			state.error = null;
		},
		setPage: (state, action) => {
			state.page = action.payload;
		},
		clearCurrentPO: state => {
			state.currentPO = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch POs
			.addCase(fetchPOs.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchPOs.fulfilled, (state, action) => {
				state.loading = false;
				state.poList = action.payload.results || [];
				state.count = action.payload.count;
				state.page = action.payload.page;
				state.pageSize = action.payload.pageSize;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchPOs.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch PO details
			.addCase(fetchPODetails.pending, state => {
				state.detailsLoading = true;
				state.error = null;
			})
			.addCase(fetchPODetails.fulfilled, (state, action) => {
				state.detailsLoading = false;
				state.currentPO = action.payload;
			})
			.addCase(fetchPODetails.rejected, (state, action) => {
				state.detailsLoading = false;
				state.error = action.payload;
			})
			// Delete PO
			.addCase(deletePO.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deletePO.fulfilled, (state, action) => {
				state.loading = false;
				state.poList = state.poList.filter(po => po.id !== action.payload);
			})
			.addCase(deletePO.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Submit for approval
			.addCase(submitPOForApproval.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(submitPOForApproval.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.poList.findIndex(po => po.id === action.payload.id);
				if (index !== -1) {
					state.poList[index] = { ...state.poList[index], ...action.payload };
				}
			})
			.addCase(submitPOForApproval.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Confirm PO
			.addCase(confirmPO.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(confirmPO.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.poList.findIndex(po => po.id === action.payload.id);
				if (index !== -1) {
					state.poList[index] = { ...state.poList[index], ...action.payload };
				}
			})
			.addCase(confirmPO.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Cancel PO
			.addCase(cancelPO.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(cancelPO.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.poList.findIndex(po => po.id === action.payload.id);
				if (index !== -1) {
					state.poList[index] = { ...state.poList[index], ...action.payload };
				}
			})
			.addCase(cancelPO.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { clearError, setPage, clearCurrentPO } = poSlice.actions;
export default poSlice.reducer;
