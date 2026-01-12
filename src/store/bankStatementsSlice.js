import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Reconciliation status options
export const RECONCILIATION_STATUS_OPTIONS = [
	{ value: "", label: "All Statuses" },
	{ value: "UNRECONCILED", label: "Unreconciled" },
	{ value: "PARTIALLY_RECONCILED", label: "Partially Reconciled" },
	{ value: "RECONCILED", label: "Reconciled" },
];

// Fetch bank statements with optional filters
export const fetchBankStatements = createAsyncThunk(
	"bankStatements/fetchAll",
	async (
		{ page = 1, page_size = 20, bank_account, reconciliation_status, date_from, date_to } = {},
		{ rejectWithValue }
	) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);
			if (bank_account) params.append("bank_account", bank_account);
			if (reconciliation_status) params.append("reconciliation_status", reconciliation_status);
			if (date_from) params.append("date_from", date_from);
			if (date_to) params.append("date_to", date_to);

			const response = await api.get(`/finance/cash/statements/?${params.toString()}`);
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
			return rejectWithValue(error.response?.data || { message: "Failed to fetch bank statements" });
		}
	}
);

// Fetch single bank statement by ID
export const fetchBankStatementById = createAsyncThunk("bankStatements/fetchById", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/finance/cash/statements/${id}/`);
		return response.data?.data ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || "Failed to fetch statement details");
	}
});

// Create a new bank statement
export const createBankStatement = createAsyncThunk(
	"bankStatements/create",
	async (statementData, { rejectWithValue }) => {
		try {
			const response = await api.post("/finance/cash/statements/", statementData);
			return response.data?.data ?? response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || { message: "Failed to create bank statement" });
		}
	}
);

// Update an existing bank statement
export const updateBankStatement = createAsyncThunk(
	"bankStatements/update",
	async ({ id, data }, { rejectWithValue }) => {
		try {
			const response = await api.patch(`/finance/cash/statements/${id}/`, data);
			return response.data?.data ?? response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || { message: "Failed to update bank statement" });
		}
	}
);

// Delete a bank statement
export const deleteBankStatement = createAsyncThunk("bankStatements/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/finance/cash/statements/${id}/`);
		return id;
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to delete bank statement" });
	}
});

// Download template
export const downloadStatementTemplate = createAsyncThunk(
	"bankStatements/downloadTemplate",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/finance/cash/statements/download_template/", {
				responseType: "blob",
			});

			// Create blob link to download
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement("a");
			link.href = url;

			// Try to get filename from Content-Disposition header
			const contentDisposition = response.headers["content-disposition"];
			let filename = "bank_statement_template.xlsx";
			if (contentDisposition) {
				const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
				if (filenameMatch && filenameMatch[1]) {
					filename = filenameMatch[1].replace(/['"]/g, "");
				}
			}

			link.setAttribute("download", filename);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);

			return { success: true };
		} catch (error) {
			return rejectWithValue(error.response?.data || { message: "Failed to download template" });
		}
	}
);

// Import preview - validate file before importing
export const importStatementPreview = createAsyncThunk(
	"bankStatements/importPreview",
	async ({ file, bank_account_id }, { rejectWithValue }) => {
		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("bank_account_id", bank_account_id);

			const response = await api.post("/finance/cash/statements/import_preview/", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			return response.data?.data ?? response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || { message: "Failed to validate import file" });
		}
	}
);

// Import statement - actually import the file
export const importStatement = createAsyncThunk(
	"bankStatements/importStatement",
	async ({ file, bank_account_id }, { rejectWithValue }) => {
		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("bank_account_id", bank_account_id);

			const response = await api.post("/finance/cash/statements/import_statement/", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			return response.data?.data ?? response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data || { message: "Failed to import statement" });
		}
	}
);

const bankStatementsSlice = createSlice({
	name: "bankStatements",
	initialState: {
		statements: [],
		selectedStatement: null,
		loading: false,
		error: null,
		count: 0,
		page: 1,
		pageSize: 20,
		hasNext: false,
		hasPrevious: false,
		actionLoading: false,
		importLoading: false,
		importPreviewData: null,
	},
	reducers: {
		clearError: state => {
			state.error = null;
		},
		clearSelectedStatement: state => {
			state.selectedStatement = null;
		},
		setPage: (state, action) => {
			state.page = action.payload;
		},
		clearStatements: state => {
			state.statements = [];
			state.count = 0;
			state.page = 1;
		},
		clearImportPreview: state => {
			state.importPreviewData = null;
		},
	},
	extraReducers: builder => {
		// Fetch Bank Statements
		builder
			.addCase(fetchBankStatements.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchBankStatements.fulfilled, (state, action) => {
				state.loading = false;
				state.statements = action.payload.results || [];
				state.count = action.payload.count;
				state.page = action.payload.page;
				state.pageSize = action.payload.pageSize;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchBankStatements.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload?.message || "Failed to fetch bank statements";
			});

		// Fetch Bank Statement By ID
		builder
			.addCase(fetchBankStatementById.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchBankStatementById.fulfilled, (state, action) => {
				state.loading = false;
				state.selectedStatement = action.payload;
			})
			.addCase(fetchBankStatementById.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Create Bank Statement
		builder
			.addCase(createBankStatement.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(createBankStatement.fulfilled, (state, action) => {
				state.actionLoading = false;
				state.statements.unshift(action.payload);
				state.count += 1;
			})
			.addCase(createBankStatement.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to create bank statement";
			});

		// Update Bank Statement
		builder
			.addCase(updateBankStatement.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(updateBankStatement.fulfilled, (state, action) => {
				state.actionLoading = false;
				const index = state.statements.findIndex(s => s.id === action.payload.id);
				if (index !== -1) {
					state.statements[index] = action.payload;
				}
				if (state.selectedStatement?.id === action.payload.id) {
					state.selectedStatement = action.payload;
				}
			})
			.addCase(updateBankStatement.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to update bank statement";
			});

		// Delete Bank Statement
		builder
			.addCase(deleteBankStatement.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(deleteBankStatement.fulfilled, (state, action) => {
				state.actionLoading = false;
				state.statements = state.statements.filter(s => s.id !== action.payload);
				state.count -= 1;
			})
			.addCase(deleteBankStatement.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to delete bank statement";
			});

		// Download Template
		builder
			.addCase(downloadStatementTemplate.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(downloadStatementTemplate.fulfilled, state => {
				state.actionLoading = false;
			})
			.addCase(downloadStatementTemplate.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to download template";
			});

		// Import Preview
		builder
			.addCase(importStatementPreview.pending, state => {
				state.importLoading = true;
				state.error = null;
				state.importPreviewData = null;
			})
			.addCase(importStatementPreview.fulfilled, (state, action) => {
				state.importLoading = false;
				state.importPreviewData = action.payload;
			})
			.addCase(importStatementPreview.rejected, (state, action) => {
				state.importLoading = false;
				state.error = action.payload?.message || "Failed to validate import file";
			});

		// Import Statement
		builder
			.addCase(importStatement.pending, state => {
				state.importLoading = true;
				state.error = null;
			})
			.addCase(importStatement.fulfilled, (state, action) => {
				state.importLoading = false;
				state.importPreviewData = null;
				// Add the imported statement to the list
				if (action.payload) {
					state.statements.unshift(action.payload);
					state.count += 1;
				}
			})
			.addCase(importStatement.rejected, (state, action) => {
				state.importLoading = false;
				state.error = action.payload?.message || "Failed to import statement";
			});
	},
});

export const { clearError, clearSelectedStatement, setPage, clearStatements, clearImportPreview } =
	bankStatementsSlice.actions;
export default bankStatementsSlice.reducer;
