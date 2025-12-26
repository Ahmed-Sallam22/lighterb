import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// PR Type endpoints mapping
const PR_TYPE_ENDPOINTS = {
	Catalog: "/procurement/pr/catalog/",
	"Non-Catalog": "/procurement/pr/non-catalog/",
	Service: "/procurement/pr/service/",
};

// Create a new requisition
export const createRequisition = createAsyncThunk(
	"requisitions/create",
	async ({ prType, data }, { rejectWithValue }) => {
		try {
			const endpoint = PR_TYPE_ENDPOINTS[prType];
			if (!endpoint) {
				return rejectWithValue({ message: "Invalid PR type" });
			}
			const response = await api.post(endpoint, data);
			return { ...(response.data?.data || response.data), pr_type: prType };
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.response?.data || { message: "Failed to create requisition" });
		}
	}
);

// Fetch all requisitions from all 3 endpoints
export const fetchAllRequisitions = createAsyncThunk(
	"requisitions/fetchAll",
	async ({ page = 1, page_size = 20, status, priority, search } = {}, { rejectWithValue }) => {
		try {
			const buildParams = () => {
				const params = new URLSearchParams();
				params.append("page", page);
				params.append("page_size", page_size);
				if (status && status !== "all") params.append("status", status);
				if (priority) params.append("priority", priority);
				if (search) params.append("search", search);
				return params.toString();
			};

			const queryString = buildParams();

			// Fetch from all 3 endpoints in parallel
			const [catalogRes, nonCatalogRes, serviceRes] = await Promise.all([
				api.get(`${PR_TYPE_ENDPOINTS.Catalog}?${queryString}`),
				api.get(`${PR_TYPE_ENDPOINTS["Non-Catalog"]}?${queryString}`),
				api.get(`${PR_TYPE_ENDPOINTS.Service}?${queryString}`),
			]);

			const extractData = res => res.data?.data || res.data;

			const catalogData = extractData(catalogRes);
			const nonCatalogData = extractData(nonCatalogRes);
			const serviceData = extractData(serviceRes);

			// Add pr_type to each item
			const catalogItems = (catalogData?.results || []).map(item => ({ ...item, pr_type: "Catalog" }));
			const nonCatalogItems = (nonCatalogData?.results || []).map(item => ({ ...item, pr_type: "Non-Catalog" }));
			const serviceItems = (serviceData?.results || []).map(item => ({ ...item, pr_type: "Service" }));

			// Combine all results
			const allResults = [...catalogItems, ...nonCatalogItems, ...serviceItems];

			// Sort by date descending
			allResults.sort((a, b) => new Date(b.date) - new Date(a.date));

			const totalCount = (catalogData?.count || 0) + (nonCatalogData?.count || 0) + (serviceData?.count || 0);

			return {
				results: allResults,
				count: totalCount,
				catalogCount: catalogData?.count || 0,
				nonCatalogCount: nonCatalogData?.count || 0,
				serviceCount: serviceData?.count || 0,
				page,
				pageSize: page_size,
				hasNext: catalogData?.next || nonCatalogData?.next || serviceData?.next,
				hasPrevious: catalogData?.previous || nonCatalogData?.previous || serviceData?.previous,
			};
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch requisitions");
		}
	}
);

// Fetch requisitions by type (for specific type view)
export const fetchRequisitionsByType = createAsyncThunk(
	"requisitions/fetchByType",
	async ({ prType, page = 1, page_size = 20, status, priority, search } = {}, { rejectWithValue }) => {
		try {
			const endpoint = PR_TYPE_ENDPOINTS[prType];
			if (!endpoint) {
				return rejectWithValue({ message: "Invalid PR type" });
			}

			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);
			if (status && status !== "all") params.append("status", status);
			if (priority) params.append("priority", priority);
			if (search) params.append("search", search);

			const response = await api.get(`${endpoint}?${params.toString()}`);
			const data = response.data?.data || response.data;

			return {
				results: (data?.results || []).map(item => ({ ...item, pr_type: prType })),
				count: data?.count || 0,
				next: data?.next,
				previous: data?.previous,
				page,
				pageSize: page_size,
			};
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch requisitions");
		}
	}
);

// Fetch single requisition
export const fetchRequisitionById = createAsyncThunk(
	"requisitions/fetchById",
	async ({ prType, id }, { rejectWithValue }) => {
		try {
			const endpoint = PR_TYPE_ENDPOINTS[prType];
			if (!endpoint) {
				return rejectWithValue({ message: "Invalid PR type" });
			}
			const response = await api.get(`${endpoint}${id}/`);
			return { ...(response.data?.data || response.data), pr_type: prType };
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch requisition");
		}
	}
);

// Update a requisition
export const updateRequisition = createAsyncThunk(
	"requisitions/update",
	async ({ id, prType, data }, { rejectWithValue }) => {
		try {
			const endpoint = PR_TYPE_ENDPOINTS[prType];
			if (!endpoint) {
				return rejectWithValue({ message: "Invalid PR type" });
			}
			const response = await api.put(`${endpoint}${id}/`, data);
			return { ...(response.data?.data || response.data), pr_type: prType };
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.response?.data || { message: "Failed to update requisition" });
		}
	}
);

// Delete a requisition
export const deleteRequisition = createAsyncThunk(
	"requisitions/delete",
	async ({ prType, id }, { rejectWithValue }) => {
		try {
			const endpoint = PR_TYPE_ENDPOINTS[prType];
			if (!endpoint) {
				return rejectWithValue({ message: "Invalid PR type" });
			}
			await api.delete(`${endpoint}${id}/`);
			return { id, prType };
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || error.message || "Failed to delete requisition");
		}
	}
);

// Submit requisition for approval
export const submitForApproval = createAsyncThunk(
	"requisitions/submitForApproval",
	async ({ prType, id }, { rejectWithValue }) => {
		try {
			const endpoint = PR_TYPE_ENDPOINTS[prType];
			if (!endpoint) {
				return rejectWithValue({ message: "Invalid PR type" });
			}
			const response = await api.post(`${endpoint}${id}/submit-for-approval/`);
			return { ...(response.data?.data || response.data), pr_type: prType, pr_id: id };
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || error.message || "Failed to submit for approval");
		}
	}
);

const requisitionsSlice = createSlice({
	name: "requisitions",
	initialState: {
		requisitions: [],
		currentRequisition: null,
		// Pagination state
		count: 0,
		catalogCount: 0,
		nonCatalogCount: 0,
		serviceCount: 0,
		page: 1,
		pageSize: 20,
		hasNext: false,
		hasPrevious: false,
		// Loading states
		loading: false,
		error: null,
		creating: false,
		updating: false,
		deleting: false,
		submitting: false,
		actionError: null,
	},
	reducers: {
		clearError: state => {
			state.error = null;
			state.actionError = null;
		},
		clearCurrentRequisition: state => {
			state.currentRequisition = null;
		},
		setPage: (state, action) => {
			state.page = action.payload;
		},
		setPageSize: (state, action) => {
			state.pageSize = action.payload;
			state.page = 1; // Reset to first page when page size changes
		},
	},
	extraReducers: builder => {
		builder
			// Fetch all requisitions
			.addCase(fetchAllRequisitions.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchAllRequisitions.fulfilled, (state, action) => {
				state.loading = false;
				state.requisitions = action.payload.results || [];
				state.count = action.payload.count;
				state.catalogCount = action.payload.catalogCount;
				state.nonCatalogCount = action.payload.nonCatalogCount;
				state.serviceCount = action.payload.serviceCount;
				state.page = action.payload.page;
				state.pageSize = action.payload.pageSize;
				state.hasNext = !!action.payload.hasNext;
				state.hasPrevious = !!action.payload.hasPrevious;
			})
			.addCase(fetchAllRequisitions.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Fetch requisitions by type
			.addCase(fetchRequisitionsByType.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchRequisitionsByType.fulfilled, (state, action) => {
				state.loading = false;
				state.requisitions = action.payload.results || [];
				state.count = action.payload.count;
				state.page = action.payload.page;
				state.pageSize = action.payload.pageSize;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchRequisitionsByType.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Fetch requisition by ID
			.addCase(fetchRequisitionById.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchRequisitionById.fulfilled, (state, action) => {
				state.loading = false;
				state.currentRequisition = action.payload;
			})
			.addCase(fetchRequisitionById.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Create requisition
			.addCase(createRequisition.pending, state => {
				state.creating = true;
				state.actionError = null;
			})
			.addCase(createRequisition.fulfilled, (state, action) => {
				state.creating = false;
				state.requisitions.unshift(action.payload);
				state.count += 1;
			})
			.addCase(createRequisition.rejected, (state, action) => {
				state.creating = false;
				state.actionError = action.payload?.message || action.payload || "Failed to create requisition";
			})

			// Update requisition
			.addCase(updateRequisition.pending, state => {
				state.updating = true;
				state.actionError = null;
			})
			.addCase(updateRequisition.fulfilled, (state, action) => {
				state.updating = false;
				const index = state.requisitions.findIndex(r => r.pr_id === action.payload.pr_id);
				if (index !== -1) {
					state.requisitions[index] = action.payload;
				}
			})
			.addCase(updateRequisition.rejected, (state, action) => {
				state.updating = false;
				state.actionError = action.payload?.message || action.payload || "Failed to update requisition";
			})

			// Delete requisition
			.addCase(deleteRequisition.pending, state => {
				state.deleting = true;
				state.actionError = null;
			})
			.addCase(deleteRequisition.fulfilled, (state, action) => {
				state.deleting = false;
				state.requisitions = state.requisitions.filter(r => r.pr_id !== action.payload.id);
				state.count -= 1;
			})
			.addCase(deleteRequisition.rejected, (state, action) => {
				state.deleting = false;
				state.actionError = action.payload?.message || action.payload || "Failed to delete requisition";
			})

			// Submit for approval
			.addCase(submitForApproval.pending, state => {
				state.submitting = true;
				state.actionError = null;
			})
			.addCase(submitForApproval.fulfilled, (state, action) => {
				state.submitting = false;
				const index = state.requisitions.findIndex(r => r.pr_id === action.payload.pr_id);
				if (index !== -1) {
					state.requisitions[index].status = "PENDING_APPROVAL";
				}
			})
			.addCase(submitForApproval.rejected, (state, action) => {
				state.submitting = false;
				state.actionError = action.payload?.message || action.payload || "Failed to submit for approval";
			});
	},
});

export const { clearError, clearCurrentRequisition, setPage, setPageSize } = requisitionsSlice.actions;
export default requisitionsSlice.reducer;
