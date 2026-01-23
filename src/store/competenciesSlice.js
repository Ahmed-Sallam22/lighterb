import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch competencies with pagination
export const fetchCompetencies = createAsyncThunk(
	"competencies/fetchCompetencies",
	async (params = {}, { rejectWithValue }) => {
		try {
			const response = await api.get("/hr/person/competencies/", { params });
			const data = response.data?.data || response.data;
			return {
				results: data.results || data || [],
				count: data.count || 0,
				next: data.next,
				previous: data.previous,
			};
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch competencies");
		}
	}
);

// Fetch single competency by ID
export const fetchCompetencyById = createAsyncThunk(
	"competencies/fetchCompetencyById",
	async (id, { rejectWithValue }) => {
		try {
			const response = await api.get(`/hr/person/competencies/${id}/`);
			return response.data?.data || response.data;
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch competency");
		}
	}
);

// Create a new competency
export const createCompetency = createAsyncThunk(
	"competencies/createCompetency",
	async (competencyData, { rejectWithValue }) => {
		try {
			const response = await api.post("/hr/person/competencies/", competencyData);
			return response.data?.data || response.data;
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.message || "Failed to create competency");
		}
	}
);

// Update a competency
export const updateCompetency = createAsyncThunk(
	"competencies/updateCompetency",
	async ({ id, data }, { rejectWithValue }) => {
		try {
			const response = await api.patch(`/hr/person/competencies/${id}/`, data);
			return response.data?.data || response.data;
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.message || "Failed to update competency");
		}
	}
);

// Delete a competency
export const deleteCompetency = createAsyncThunk("competencies/deleteCompetency", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/hr/person/competencies/${id}/`);
		return id;
	} catch (error) {
		return rejectWithValue(error.message || "Failed to delete competency");
	}
});

// Fetch competency categories lookup
export const fetchCompetencyCategories = createAsyncThunk(
	"competencies/fetchCompetencyCategories",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/core/lookups/values/?lookup_type=Competency Category");
			return response.data?.data || response.data || [];
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch competency categories");
		}
	}
);

const initialState = {
	competencies: [],
	competencyCategories: [],
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
};

const competenciesSlice = createSlice({
	name: "competencies",
	initialState,
	reducers: {
		setPage: (state, action) => {
			state.page = action.payload;
		},
		clearError: state => {
			state.error = null;
			state.actionError = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch competencies
			.addCase(fetchCompetencies.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCompetencies.fulfilled, (state, action) => {
				state.loading = false;
				state.competencies = action.payload.results;
				state.count = action.payload.count;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchCompetencies.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Fetch competency by ID
			.addCase(fetchCompetencyById.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCompetencyById.fulfilled, state => {
				state.loading = false;
			})
			.addCase(fetchCompetencyById.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Create competency
			.addCase(createCompetency.pending, state => {
				state.creating = true;
				state.actionError = null;
			})
			.addCase(createCompetency.fulfilled, (state, action) => {
				state.creating = false;
				state.competencies.unshift(action.payload);
				state.count += 1;
			})
			.addCase(createCompetency.rejected, (state, action) => {
				state.creating = false;
				state.actionError = action.payload;
			})

			// Update competency
			.addCase(updateCompetency.pending, state => {
				state.updating = true;
				state.actionError = null;
			})
			.addCase(updateCompetency.fulfilled, (state, action) => {
				state.updating = false;
				const index = state.competencies.findIndex(c => c.id === action.payload.id);
				if (index !== -1) {
					state.competencies[index] = action.payload;
				}
			})
			.addCase(updateCompetency.rejected, (state, action) => {
				state.updating = false;
				state.actionError = action.payload;
			})

			// Delete competency
			.addCase(deleteCompetency.pending, state => {
				state.deleting = true;
				state.actionError = null;
			})
			.addCase(deleteCompetency.fulfilled, (state, action) => {
				state.deleting = false;
				state.competencies = state.competencies.filter(c => c.id !== action.payload);
				state.count -= 1;
			})
			.addCase(deleteCompetency.rejected, (state, action) => {
				state.deleting = false;
				state.actionError = action.payload;
			})

			// Fetch competency categories
			.addCase(fetchCompetencyCategories.fulfilled, (state, action) => {
				state.competencyCategories = action.payload;
			});
	},
});

export const { setPage, clearError } = competenciesSlice.actions;
export default competenciesSlice.reducer;
