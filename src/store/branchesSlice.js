import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch branches with optional filters
export const fetchBranches = createAsyncThunk(
	"branches/fetchAll",
	async ({ page = 1, page_size = 20, bank, is_active } = {}, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);
			if (bank) params.append("bank", bank);
			if (is_active !== undefined && is_active !== "") params.append("is_active", is_active);

			const response = await api.get(`/finance/cash/branches/?${params.toString()}`);
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
			return rejectWithValue(error.response?.data || { message: "Failed to fetch branches" });
		}
	}
);

// Fetch single branch by ID
export const fetchBranchById = createAsyncThunk("branches/fetchById", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/finance/cash/branches/${id}/`);
		return response.data?.data ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || "Failed to fetch branch details");
	}
});

// Create a new branch
export const createBranch = createAsyncThunk("branches/create", async (branchData, { rejectWithValue }) => {
	try {
		const response = await api.post("/finance/cash/branches/", branchData);
		return response.data?.data ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to create branch" });
	}
});

// Update an existing branch
export const updateBranch = createAsyncThunk("branches/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.put(`/finance/cash/branches/${id}/`, data);
		return response.data?.data ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to update branch" });
	}
});

// Delete a branch
export const deleteBranch = createAsyncThunk("branches/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/finance/cash/branches/${id}/`);
		return id;
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to delete branch" });
	}
});

// Activate a branch
export const activateBranch = createAsyncThunk("branches/activate", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/finance/cash/branches/${id}/activate/`);
		return { id, data: response.data?.data ?? response.data };
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to activate branch" });
	}
});

// Deactivate a branch
export const deactivateBranch = createAsyncThunk("branches/deactivate", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/finance/cash/branches/${id}/deactivate/`);
		return { id, data: response.data?.data ?? response.data };
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to deactivate branch" });
	}
});

const branchesSlice = createSlice({
	name: "branches",
	initialState: {
		branches: [],
		selectedBranch: null,
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
		clearSelectedBranch: state => {
			state.selectedBranch = null;
		},
		setPage: (state, action) => {
			state.page = action.payload;
		},
		clearBranches: state => {
			state.branches = [];
			state.count = 0;
			state.page = 1;
		},
	},
	extraReducers: builder => {
		// Fetch Branches
		builder
			.addCase(fetchBranches.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchBranches.fulfilled, (state, action) => {
				state.loading = false;
				state.branches = action.payload.results || [];
				state.count = action.payload.count;
				state.page = action.payload.page;
				state.pageSize = action.payload.pageSize;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchBranches.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload?.message || "Failed to fetch branches";
			});

		// Fetch Branch By ID
		builder
			.addCase(fetchBranchById.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchBranchById.fulfilled, (state, action) => {
				state.loading = false;
				state.selectedBranch = action.payload;
			})
			.addCase(fetchBranchById.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Create Branch
		builder
			.addCase(createBranch.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(createBranch.fulfilled, (state, action) => {
				state.actionLoading = false;
				state.branches.unshift(action.payload);
				state.count += 1;
			})
			.addCase(createBranch.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to create branch";
			});

		// Update Branch
		builder
			.addCase(updateBranch.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(updateBranch.fulfilled, (state, action) => {
				state.actionLoading = false;
				const index = state.branches.findIndex(b => b.id === action.payload.id);
				if (index !== -1) {
					state.branches[index] = action.payload;
				}
				if (state.selectedBranch?.id === action.payload.id) {
					state.selectedBranch = action.payload;
				}
			})
			.addCase(updateBranch.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to update branch";
			});

		// Delete Branch
		builder
			.addCase(deleteBranch.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(deleteBranch.fulfilled, (state, action) => {
				state.actionLoading = false;
				state.branches = state.branches.filter(b => b.id !== action.payload);
				state.count -= 1;
			})
			.addCase(deleteBranch.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to delete branch";
			});

		// Activate Branch
		builder
			.addCase(activateBranch.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(activateBranch.fulfilled, (state, action) => {
				state.actionLoading = false;
				const index = state.branches.findIndex(b => b.id === action.payload.id);
				if (index !== -1) {
					state.branches[index].is_active = true;
				}
				if (state.selectedBranch?.id === action.payload.id) {
					state.selectedBranch.is_active = true;
				}
			})
			.addCase(activateBranch.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to activate branch";
			});

		// Deactivate Branch
		builder
			.addCase(deactivateBranch.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(deactivateBranch.fulfilled, (state, action) => {
				state.actionLoading = false;
				const index = state.branches.findIndex(b => b.id === action.payload.id);
				if (index !== -1) {
					state.branches[index].is_active = false;
				}
				if (state.selectedBranch?.id === action.payload.id) {
					state.selectedBranch.is_active = false;
				}
			})
			.addCase(deactivateBranch.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to deactivate branch";
			});
	},
});

export const { clearError, clearSelectedBranch, setPage, clearBranches } = branchesSlice.actions;
export default branchesSlice.reducer;
