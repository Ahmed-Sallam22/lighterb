import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch all jobs with pagination and filters
export const fetchJobs = createAsyncThunk(
	"jobs/fetchAll",
	async (
		{ page = 1, page_size = 25, search = "", business_group = "", category = "", family = "" } = {},
		{ rejectWithValue }
	) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);
			if (search) params.append("search", search);
			if (business_group) params.append("business_group", business_group);
			if (category) params.append("category", category);
			if (family) params.append("family", family);

			const response = await api.get(`/hr/work_structures/jobs/?${params.toString()}`);
			const data = response.data?.data ?? response.data;
			return {
				results: data?.results ?? (Array.isArray(data) ? data : []),
				count: data?.count ?? 0,
				next: data?.next ?? null,
				previous: data?.previous ?? null,
			};
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Failed to fetch jobs";
			return rejectWithValue(errorMessage);
		}
	}
);

// Fetch single job by ID
export const fetchJob = createAsyncThunk("jobs/fetchOne", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/hr/work_structures/jobs/${id}/`);
		return response.data?.data ?? response.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch job";
		return rejectWithValue(errorMessage);
	}
});

// Create a new job
export const createJob = createAsyncThunk("jobs/create", async (jobData, { rejectWithValue }) => {
	try {
		const response = await api.post("/hr/work_structures/jobs/", jobData);
		return response.data?.data ?? response.data;
	} catch (error) {
		if (error.response?.data) {
			const errorData = error.response.data;
			let errorMessage = "";

			if (typeof errorData === "object" && !errorData.message && !errorData.error && !errorData.detail) {
				const fieldErrors = Object.entries(errorData)
					.map(([field, messages]) => {
						const messageText = Array.isArray(messages) ? messages.join(", ") : messages;
						return `${field}: ${messageText}`;
					})
					.join(" | ");
				errorMessage = fieldErrors;
			} else {
				errorMessage = errorData.message || errorData.error || errorData.detail || "Failed to create job";
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to create job");
	}
});

// Update a job (PATCH)
export const updateJob = createAsyncThunk("jobs/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.patch(`/hr/work_structures/jobs/${id}/`, data);
		return response.data?.data ?? response.data;
	} catch (error) {
		if (error.response?.data) {
			const errorData = error.response.data;
			let errorMessage = "";

			if (typeof errorData === "object" && !errorData.message && !errorData.error && !errorData.detail) {
				const fieldErrors = Object.entries(errorData)
					.map(([field, messages]) => {
						const messageText = Array.isArray(messages) ? messages.join(", ") : messages;
						return `${field}: ${messageText}`;
					})
					.join(" | ");
				errorMessage = fieldErrors;
			} else {
				errorMessage = errorData.message || errorData.error || errorData.detail || "Failed to update job";
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to update job");
	}
});

// Delete a job
export const deleteJob = createAsyncThunk("jobs/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/hr/work_structures/jobs/${id}/`);
		return id;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to delete job";
		return rejectWithValue(errorMessage);
	}
});

// Fetch job versions by code
export const fetchJobVersions = createAsyncThunk("jobs/fetchVersions", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/hr/work_structures/jobs/${id}/versions/`);
		return response.data?.data ?? response.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch job versions";
		return rejectWithValue(errorMessage);
	}
});

// Fetch job categories from lookups API
export const fetchJobCategories = createAsyncThunk("jobs/fetchCategories", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/core/lookups/values/?lookup_type=JOB_CATEGORY");
		return response.data?.data || response.data || [];
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch job categories";
		return rejectWithValue(errorMessage);
	}
});

// Fetch job titles from lookups API
export const fetchJobTitles = createAsyncThunk("jobs/fetchTitles", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/core/lookups/values/?lookup_type=JOB_TITLE");
		return response.data?.data || response.data || [];
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch job titles";
		return rejectWithValue(errorMessage);
	}
});

// Fetch job families from lookups API
export const fetchJobFamilies = createAsyncThunk("jobs/fetchFamilies", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/core/lookups/values/?lookup_type=JOB_FAMILY");
		return response.data?.data || response.data || [];
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch job families";
		return rejectWithValue(errorMessage);
	}
});

// Fetch functional areas from lookups API
export const fetchFunctionalAreas = createAsyncThunk("jobs/fetchFunctionalAreas", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/core/lookups/values/?lookup_type=FUNCTIONAL_AREA");
		return response.data?.data || response.data || [];
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch functional areas";
		return rejectWithValue(errorMessage);
	}
});

// Fetch competencies from lookups API
export const fetchCompetencies = createAsyncThunk("jobs/fetchCompetencies", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/core/lookups/values/?lookup_type=COMPETENCY");
		return response.data?.data || response.data || [];
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch competencies";
		return rejectWithValue(errorMessage);
	}
});

// Fetch proficiency levels from lookups API
export const fetchProficiencyLevels = createAsyncThunk(
	"jobs/fetchProficiencyLevels",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/core/lookups/values/?lookup_type=PROFICIENCY_LEVEL");
			return response.data?.data || response.data || [];
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Failed to fetch proficiency levels";
			return rejectWithValue(errorMessage);
		}
	}
);

// Fetch qualification types from lookups API
export const fetchQualificationTypes = createAsyncThunk(
	"jobs/fetchQualificationTypes",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/core/lookups/values/?lookup_type=QUALIFICATION_TYPE");
			return response.data?.data || response.data || [];
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Failed to fetch qualification types";
			return rejectWithValue(errorMessage);
		}
	}
);

// Fetch qualification titles from lookups API
export const fetchQualificationTitles = createAsyncThunk(
	"jobs/fetchQualificationTitles",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/core/lookups/values/?lookup_type=QUALIFICATION_TITLE");
			return response.data?.data || response.data || [];
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Failed to fetch qualification titles";
			return rejectWithValue(errorMessage);
		}
	}
);

const initialState = {
	jobs: [],
	currentJob: null,
	jobCategories: [],
	jobTitles: [],
	jobFamilies: [],
	functionalAreas: [],
	competencies: [],
	proficiencyLevels: [],
	qualificationTypes: [],
	qualificationTitles: [],
	loading: false,
	detailLoading: false,
	creating: false,
	updating: false,
	deleting: false,
	error: null,
	actionError: null,
	count: 0,
	page: 1,
	hasNext: false,
	hasPrevious: false,
};

const jobsSlice = createSlice({
	name: "jobs",
	initialState,
	reducers: {
		setPage: (state, action) => {
			state.page = action.payload;
		},
		clearError: state => {
			state.error = null;
			state.actionError = null;
		},
		clearCurrentJob: state => {
			state.currentJob = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch all jobs
			.addCase(fetchJobs.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchJobs.fulfilled, (state, action) => {
				state.loading = false;
				state.jobs = action.payload.results;
				state.count = action.payload.count;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchJobs.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch single job
			.addCase(fetchJob.pending, state => {
				state.detailLoading = true;
				state.error = null;
			})
			.addCase(fetchJob.fulfilled, (state, action) => {
				state.detailLoading = false;
				state.currentJob = action.payload;
			})
			.addCase(fetchJob.rejected, (state, action) => {
				state.detailLoading = false;
				state.error = action.payload;
			})
			// Create job
			.addCase(createJob.pending, state => {
				state.creating = true;
				state.actionError = null;
			})
			.addCase(createJob.fulfilled, (state, action) => {
				state.creating = false;
				state.jobs.unshift(action.payload);
				state.count += 1;
			})
			.addCase(createJob.rejected, (state, action) => {
				state.creating = false;
				state.actionError = action.payload;
			})
			// Update job
			.addCase(updateJob.pending, state => {
				state.updating = true;
				state.actionError = null;
			})
			.addCase(updateJob.fulfilled, (state, action) => {
				state.updating = false;
				const index = state.jobs.findIndex(j => j.id === action.payload.id);
				if (index !== -1) {
					state.jobs[index] = action.payload;
				}
				if (state.currentJob?.id === action.payload.id) {
					state.currentJob = action.payload;
				}
			})
			.addCase(updateJob.rejected, (state, action) => {
				state.updating = false;
				state.actionError = action.payload;
			})
			// Delete job
			.addCase(deleteJob.pending, state => {
				state.deleting = true;
				state.actionError = null;
			})
			.addCase(deleteJob.fulfilled, (state, action) => {
				state.deleting = false;
				state.jobs = state.jobs.filter(j => j.id !== action.payload);
				state.count -= 1;
			})
			.addCase(deleteJob.rejected, (state, action) => {
				state.deleting = false;
				state.actionError = action.payload;
			})
			// Fetch job categories
			.addCase(fetchJobCategories.fulfilled, (state, action) => {
				state.jobCategories = action.payload;
			})
			// Fetch job titles
			.addCase(fetchJobTitles.fulfilled, (state, action) => {
				state.jobTitles = action.payload;
			})
			// Fetch job families
			.addCase(fetchJobFamilies.fulfilled, (state, action) => {
				state.jobFamilies = action.payload;
			})
			// Fetch functional areas
			.addCase(fetchFunctionalAreas.fulfilled, (state, action) => {
				state.functionalAreas = action.payload;
			})
			// Fetch competencies
			.addCase(fetchCompetencies.fulfilled, (state, action) => {
				state.competencies = action.payload;
			})
			// Fetch proficiency levels
			.addCase(fetchProficiencyLevels.fulfilled, (state, action) => {
				state.proficiencyLevels = action.payload;
			})
			// Fetch qualification types
			.addCase(fetchQualificationTypes.fulfilled, (state, action) => {
				state.qualificationTypes = action.payload;
			})
			// Fetch qualification titles
			.addCase(fetchQualificationTitles.fulfilled, (state, action) => {
				state.qualificationTitles = action.payload;
			});
	},
});

export const { setPage, clearError, clearCurrentJob } = jobsSlice.actions;
export default jobsSlice.reducer;
