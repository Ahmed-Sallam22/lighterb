import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch departments with pagination
export const fetchDepartments = createAsyncThunk(
	"departments/fetchDepartments",
	async (params = {}, { rejectWithValue }) => {
		try {
			const response = await api.get("/hr/work_structures/departments/", { params });
			const data = response.data?.data || response.data;
			return {
				results: data.results || data || [],
				count: data.count || 0,
				next: data.next,
				previous: data.previous,
			};
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch departments");
		}
	}
);

// Create a new department
export const createDepartment = createAsyncThunk(
	"departments/createDepartment",
	async (departmentData, { rejectWithValue }) => {
		try {
			const response = await api.post("/hr/work_structures/departments/", departmentData);
			return response.data?.data || response.data;
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.message || "Failed to create department");
		}
	}
);

// Update a department
export const updateDepartment = createAsyncThunk(
	"departments/updateDepartment",
	async ({ id, data }, { rejectWithValue }) => {
		try {
			const response = await api.patch(`/hr/work_structures/departments/${id}/`, data);
			return response.data?.data || response.data;
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.message || "Failed to update department");
		}
	}
);

// Delete a department
export const deleteDepartment = createAsyncThunk("departments/deleteDepartment", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/hr/work_structures/departments/${id}/`);
		return id;
	} catch (error) {
		return rejectWithValue(error.message || "Failed to delete department");
	}
});

// Fetch department history
export const fetchDepartmentHistory = createAsyncThunk(
	"departments/fetchDepartmentHistory",
	async (departmentId, { rejectWithValue }) => {
		try {
			const response = await api.get(`/hr/work_structures/departments/${departmentId}/history/`);
			const data = response.data?.data || response.data;
			return {
				results: data.results || data || [],
				count: data.count || 0,
			};
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch department history");
		}
	}
);

// Fetch department tree by business group
export const fetchDepartmentTree = createAsyncThunk(
	"departments/fetchDepartmentTree",
	async (businessGroupId, { rejectWithValue }) => {
		try {
			const response = await api.get("/hr/work_structures/departments/tree/", {
				params: { bg: businessGroupId },
			});
			const data = response.data?.data || response.data;
			return data || [];
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch department tree");
		}
	}
);

// Fetch department children
export const fetchDepartmentChildren = createAsyncThunk(
	"departments/fetchDepartmentChildren",
	async (departmentId, { rejectWithValue }) => {
		try {
			const response = await api.get(`/hr/work_structures/departments/${departmentId}/children/`);
			const data = response.data?.data || response.data;
			return data || [];
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch department children");
		}
	}
);

// Fetch department parent
export const fetchDepartmentParent = createAsyncThunk(
	"departments/fetchDepartmentParent",
	async (departmentId, { rejectWithValue }) => {
		try {
			const response = await api.get(`/hr/work_structures/departments/${departmentId}/parent/`);
			const data = response.data?.data || response.data;
			return data || null;
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch department parent");
		}
	}
);

const departmentsSlice = createSlice({
	name: "departments",
	initialState: {
		departments: [],
		loading: false,
		error: null,
		count: 0,
		page: 1,
		hasNext: false,
		hasPrevious: false,
		creating: false,
		updating: false,
		deleting: false,
		actionError: null,
		// Tree view state
		treeData: [],
		treeLoading: false,
		treeError: null,
	},
	reducers: {
		setPage: (state, action) => {
			state.page = action.payload;
		},
		clearError: state => {
			state.error = null;
			state.actionError = null;
			state.treeError = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch departments
			.addCase(fetchDepartments.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchDepartments.fulfilled, (state, action) => {
				state.loading = false;
				state.departments = action.payload.results;
				state.count = action.payload.count;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchDepartments.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Create department
			.addCase(createDepartment.pending, state => {
				state.creating = true;
				state.actionError = null;
			})
			.addCase(createDepartment.fulfilled, (state, action) => {
				state.creating = false;
				state.departments.unshift(action.payload);
				state.count += 1;
			})
			.addCase(createDepartment.rejected, (state, action) => {
				state.creating = false;
				state.actionError = action.payload;
			})

			// Update department
			.addCase(updateDepartment.pending, state => {
				state.updating = true;
				state.actionError = null;
			})
			.addCase(updateDepartment.fulfilled, (state, action) => {
				state.updating = false;
				const index = state.departments.findIndex(d => d.id === action.payload.id);
				if (index !== -1) {
					state.departments[index] = action.payload;
				}
			})
			.addCase(updateDepartment.rejected, (state, action) => {
				state.updating = false;
				state.actionError = action.payload;
			})

			// Delete department
			.addCase(deleteDepartment.pending, state => {
				state.deleting = true;
				state.actionError = null;
			})
			.addCase(deleteDepartment.fulfilled, (state, action) => {
				state.deleting = false;
				state.departments = state.departments.filter(d => d.id !== action.payload);
				state.count -= 1;
			})
			.addCase(deleteDepartment.rejected, (state, action) => {
				state.deleting = false;
				state.actionError = action.payload;
			})

			// Fetch department tree
			.addCase(fetchDepartmentTree.pending, state => {
				state.treeLoading = true;
				state.treeError = null;
			})
			.addCase(fetchDepartmentTree.fulfilled, (state, action) => {
				state.treeLoading = false;
				state.treeData = action.payload;
			})
			.addCase(fetchDepartmentTree.rejected, (state, action) => {
				state.treeLoading = false;
				state.treeError = action.payload;
			});
	},
});

export const { setPage, clearError } = departmentsSlice.actions;
export default departmentsSlice.reducer;
