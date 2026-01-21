import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch organizations with pagination
export const fetchOrganizations = createAsyncThunk(
	"organizations/fetchOrganizations",
	async (params = {}, { rejectWithValue }) => {
		try {
			const response = await api.get("/hr/work_structures/organizations/", { params });
			const data = response.data?.data || response.data;
			return {
				results: data.results || data || [],
				count: data.count || 0,
				next: data.next,
				previous: data.previous,
			};
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch organizations");
		}
	}
);

// Fetch single organization
export const fetchOrganization = createAsyncThunk(
	"organizations/fetchOrganization",
	async (id, { rejectWithValue }) => {
		try {
			const response = await api.get(`/hr/work_structures/organizations/${id}/`);
			return response.data?.data || response.data;
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch organization");
		}
	}
);

// Fetch organization hierarchy
export const fetchOrganizationHierarchy = createAsyncThunk(
	"organizations/fetchOrganizationHierarchy",
	async (id, { rejectWithValue }) => {
		try {
			const response = await api.get(`/hr/work_structures/organizations/${id}/hierarchy/`);
			return response.data?.data || response.data;
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch organization hierarchy");
		}
	}
);

// Create a new organization
export const createOrganization = createAsyncThunk(
	"organizations/createOrganization",
	async (organizationData, { rejectWithValue }) => {
		try {
			const response = await api.post("/hr/work_structures/organizations/", organizationData);
			return response.data?.data || response.data;
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.message || "Failed to create organization");
		}
	}
);

// Update an organization
export const updateOrganization = createAsyncThunk(
	"organizations/updateOrganization",
	async ({ id, data }, { rejectWithValue }) => {
		try {
			const response = await api.patch(`/hr/work_structures/organizations/${id}/`, data);
			return response.data?.data || response.data;
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.message || "Failed to update organization");
		}
	}
);

// Delete an organization
export const deleteOrganization = createAsyncThunk(
	"organizations/deleteOrganization",
	async (id, { rejectWithValue }) => {
		try {
			await api.delete(`/hr/work_structures/organizations/${id}/`);
			return id;
		} catch (error) {
			return rejectWithValue(error.message || "Failed to delete organization");
		}
	}
);

// Fetch business groups only (organizations with is_business_group = true)
export const fetchBusinessGroupsFromOrganizations = createAsyncThunk(
	"organizations/fetchBusinessGroups",
	async (params = {}, { rejectWithValue }) => {
		try {
			const response = await api.get("/hr/work_structures/organizations/", {
				params: { ...params, is_business_group: true },
			});
			const data = response.data?.data || response.data;
			return {
				results: data.results || data || [],
				count: data.count || 0,
				next: data.next,
				previous: data.previous,
			};
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch business groups");
		}
	}
);

// Fetch departments only (organizations with is_business_group = false)
export const fetchDepartmentsFromOrganizations = createAsyncThunk(
	"organizations/fetchDepartments",
	async (params = {}, { rejectWithValue }) => {
		try {
			const response = await api.get("/hr/work_structures/organizations/", {
				params: { ...params, is_business_group: false },
			});
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

// Fetch organization classifications from lookups API
export const fetchOrgClassifications = createAsyncThunk(
	"organizations/fetchOrgClassifications",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/core/lookups/values/?lookup_type=ORG_CLASSIFICATION");
			return response.data?.data || response.data || [];
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch organization classifications");
		}
	}
);

// Fetch organization names from lookups API
export const fetchOrgNames = createAsyncThunk("organizations/fetchOrgNames", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/core/lookups/values/?lookup_type=ORGANIZATION_NAME");
		return response.data?.data || response.data || [];
	} catch (error) {
		return rejectWithValue(error.message || "Failed to fetch organization names");
	}
});

const organizationsSlice = createSlice({
	name: "organizations",
	initialState: {
		organizations: [],
		businessGroups: [],
		departments: [],
		currentOrganization: null,
		hierarchy: null,
		loading: false,
		error: null,
		count: 0,
		businessGroupsCount: 0,
		departmentsCount: 0,
		page: 1,
		hasNext: false,
		hasPrevious: false,
		creating: false,
		updating: false,
		deleting: false,
		actionError: null,
		hierarchyLoading: false,
		hierarchyError: null,
		// Lookups
		orgClassifications: [],
		orgNames: [],
		lookupsLoading: false,
	},
	reducers: {
		setPage: (state, action) => {
			state.page = action.payload;
		},
		clearError: state => {
			state.error = null;
			state.actionError = null;
			state.hierarchyError = null;
		},
		clearCurrentOrganization: state => {
			state.currentOrganization = null;
		},
		clearHierarchy: state => {
			state.hierarchy = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch organizations
			.addCase(fetchOrganizations.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchOrganizations.fulfilled, (state, action) => {
				state.loading = false;
				state.organizations = action.payload.results;
				state.count = action.payload.count;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchOrganizations.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Fetch single organization
			.addCase(fetchOrganization.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchOrganization.fulfilled, (state, action) => {
				state.loading = false;
				state.currentOrganization = action.payload;
			})
			.addCase(fetchOrganization.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Fetch organization hierarchy
			.addCase(fetchOrganizationHierarchy.pending, state => {
				state.hierarchyLoading = true;
				state.hierarchyError = null;
			})
			.addCase(fetchOrganizationHierarchy.fulfilled, (state, action) => {
				state.hierarchyLoading = false;
				state.hierarchy = action.payload;
			})
			.addCase(fetchOrganizationHierarchy.rejected, (state, action) => {
				state.hierarchyLoading = false;
				state.hierarchyError = action.payload;
			})

			// Create organization
			.addCase(createOrganization.pending, state => {
				state.creating = true;
				state.actionError = null;
			})
			.addCase(createOrganization.fulfilled, (state, action) => {
				state.creating = false;
				state.organizations.unshift(action.payload);
				state.count += 1;
				// Also add to appropriate list
				if (action.payload.is_business_group) {
					state.businessGroups.unshift(action.payload);
					state.businessGroupsCount += 1;
				} else {
					state.departments.unshift(action.payload);
					state.departmentsCount += 1;
				}
			})
			.addCase(createOrganization.rejected, (state, action) => {
				state.creating = false;
				state.actionError = action.payload;
			})

			// Update organization
			.addCase(updateOrganization.pending, state => {
				state.updating = true;
				state.actionError = null;
			})
			.addCase(updateOrganization.fulfilled, (state, action) => {
				state.updating = false;
				const index = state.organizations.findIndex(o => o.id === action.payload.id);
				if (index !== -1) {
					state.organizations[index] = action.payload;
				}
				// Also update in appropriate list
				if (action.payload.is_business_group) {
					const bgIndex = state.businessGroups.findIndex(bg => bg.id === action.payload.id);
					if (bgIndex !== -1) {
						state.businessGroups[bgIndex] = action.payload;
					}
				} else {
					const deptIndex = state.departments.findIndex(d => d.id === action.payload.id);
					if (deptIndex !== -1) {
						state.departments[deptIndex] = action.payload;
					}
				}
			})
			.addCase(updateOrganization.rejected, (state, action) => {
				state.updating = false;
				state.actionError = action.payload;
			})

			// Delete organization
			.addCase(deleteOrganization.pending, state => {
				state.deleting = true;
				state.actionError = null;
			})
			.addCase(deleteOrganization.fulfilled, (state, action) => {
				state.deleting = false;
				const org = state.organizations.find(o => o.id === action.payload);
				state.organizations = state.organizations.filter(o => o.id !== action.payload);
				state.count -= 1;
				// Also remove from appropriate list
				if (org?.is_business_group) {
					state.businessGroups = state.businessGroups.filter(bg => bg.id !== action.payload);
					state.businessGroupsCount -= 1;
				} else {
					state.departments = state.departments.filter(d => d.id !== action.payload);
					state.departmentsCount -= 1;
				}
			})
			.addCase(deleteOrganization.rejected, (state, action) => {
				state.deleting = false;
				state.actionError = action.payload;
			})

			// Fetch business groups
			.addCase(fetchBusinessGroupsFromOrganizations.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchBusinessGroupsFromOrganizations.fulfilled, (state, action) => {
				state.loading = false;
				state.businessGroups = action.payload.results;
				state.businessGroupsCount = action.payload.count;
			})
			.addCase(fetchBusinessGroupsFromOrganizations.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Fetch departments
			.addCase(fetchDepartmentsFromOrganizations.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchDepartmentsFromOrganizations.fulfilled, (state, action) => {
				state.loading = false;
				state.departments = action.payload.results;
				state.departmentsCount = action.payload.count;
			})
			.addCase(fetchDepartmentsFromOrganizations.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Fetch organization classifications
			.addCase(fetchOrgClassifications.pending, state => {
				state.lookupsLoading = true;
			})
			.addCase(fetchOrgClassifications.fulfilled, (state, action) => {
				state.lookupsLoading = false;
				state.orgClassifications = action.payload;
			})
			.addCase(fetchOrgClassifications.rejected, (state, action) => {
				state.lookupsLoading = false;
				state.error = action.payload;
			})

			// Fetch organization names
			.addCase(fetchOrgNames.pending, state => {
				state.lookupsLoading = true;
			})
			.addCase(fetchOrgNames.fulfilled, (state, action) => {
				state.lookupsLoading = false;
				state.orgNames = action.payload;
			})
			.addCase(fetchOrgNames.rejected, (state, action) => {
				state.lookupsLoading = false;
				state.error = action.payload;
			});
	},
});

export const { setPage, clearError, clearCurrentOrganization, clearHierarchy } = organizationsSlice.actions;
export default organizationsSlice.reducer;
