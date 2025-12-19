import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch workflow templates with pagination and filters
export const fetchWorkflowTemplates = createAsyncThunk(
	"workflowTemplates/fetchAll",
	async ({ page = 1, page_size = 20, is_active, content_type, code } = {}, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);

			// Add optional filter parameters
			if (is_active !== undefined && is_active !== "") {
				params.append("is_active", is_active);
			}
			if (content_type) params.append("content_type", content_type);
			if (code) params.append("code", code);

			const response = await api.get(`/core/approval/workflow-templates/?${params.toString()}`);
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
				"Failed to fetch workflow templates";
			return rejectWithValue(errorMessage);
		}
	}
);

// Fetch single workflow template details
export const fetchWorkflowTemplateDetails = createAsyncThunk(
	"workflowTemplates/fetchDetails",
	async (id, { rejectWithValue }) => {
		try {
			const response = await api.get(`/core/approval/workflow-templates/${id}/`);
			const templateData = response.data?.data ?? response.data;
			return templateData;
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Failed to fetch workflow template details";
			return rejectWithValue(errorMessage);
		}
	}
);

// Create workflow template
export const createWorkflowTemplate = createAsyncThunk(
	"workflowTemplates/create",
	async (templateData, { rejectWithValue }) => {
		try {
			const response = await api.post("/core/approval/workflow-templates/", templateData);
			return response.data?.data ?? response.data;
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Failed to create workflow template";
			return rejectWithValue(errorMessage);
		}
	}
);

// Update workflow template
export const updateWorkflowTemplate = createAsyncThunk(
	"workflowTemplates/update",
	async ({ id, templateData }, { rejectWithValue }) => {
		try {
			const response = await api.put(`/core/approval/workflow-templates/${id}/`, templateData);
			return response.data?.data ?? response.data;
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Failed to update workflow template";
			return rejectWithValue(errorMessage);
		}
	}
);

// Delete workflow template
export const deleteWorkflowTemplate = createAsyncThunk("workflowTemplates/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/core/approval/workflow-templates/${id}/`);
		return id;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to delete workflow template";
		return rejectWithValue(errorMessage);
	}
});

// Fetch content types for workflow templates
export const fetchContentTypes = createAsyncThunk(
	"workflowTemplates/fetchContentTypes",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/core/approval/content-types/");
			const data = response.data?.data ?? response.data;
			return data?.results ?? (Array.isArray(data) ? data : []);
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Failed to fetch content types";
			return rejectWithValue(errorMessage);
		}
	}
);

const initialState = {
	templates: [],
	currentTemplate: null,
	contentTypes: [],
	loading: false,
	detailsLoading: false,
	error: null,
	count: 0,
	page: 1,
	pageSize: 20,
	hasNext: false,
	hasPrevious: false,
};

const workflowTemplatesSlice = createSlice({
	name: "workflowTemplates",
	initialState,
	reducers: {
		setPage: (state, action) => {
			state.page = action.payload;
		},
		clearCurrentTemplate: state => {
			state.currentTemplate = null;
		},
		clearError: state => {
			state.error = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch all templates
			.addCase(fetchWorkflowTemplates.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchWorkflowTemplates.fulfilled, (state, action) => {
				state.loading = false;
				state.templates = action.payload.results;
				state.count = action.payload.count;
				state.page = action.payload.page;
				state.pageSize = action.payload.pageSize;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchWorkflowTemplates.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Fetch single template details
			.addCase(fetchWorkflowTemplateDetails.pending, state => {
				state.detailsLoading = true;
				state.error = null;
			})
			.addCase(fetchWorkflowTemplateDetails.fulfilled, (state, action) => {
				state.detailsLoading = false;
				state.currentTemplate = action.payload;
			})
			.addCase(fetchWorkflowTemplateDetails.rejected, (state, action) => {
				state.detailsLoading = false;
				state.error = action.payload;
			})

			// Create template
			.addCase(createWorkflowTemplate.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(createWorkflowTemplate.fulfilled, (state, action) => {
				state.loading = false;
				state.templates.unshift(action.payload);
				state.count += 1;
			})
			.addCase(createWorkflowTemplate.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Update template
			.addCase(updateWorkflowTemplate.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateWorkflowTemplate.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.templates.findIndex(t => t.id === action.payload.id);
				if (index !== -1) {
					state.templates[index] = action.payload;
				}
				if (state.currentTemplate?.id === action.payload.id) {
					state.currentTemplate = action.payload;
				}
			})
			.addCase(updateWorkflowTemplate.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Delete template
			.addCase(deleteWorkflowTemplate.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteWorkflowTemplate.fulfilled, (state, action) => {
				state.loading = false;
				state.templates = state.templates.filter(t => t.id !== action.payload);
				state.count -= 1;
				if (state.currentTemplate?.id === action.payload) {
					state.currentTemplate = null;
				}
			})
			.addCase(deleteWorkflowTemplate.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Fetch content types
			.addCase(fetchContentTypes.fulfilled, (state, action) => {
				state.contentTypes = action.payload;
			});
	},
});

export const { setPage, clearCurrentTemplate, clearError } = workflowTemplatesSlice.actions;
export default workflowTemplatesSlice.reducer;
