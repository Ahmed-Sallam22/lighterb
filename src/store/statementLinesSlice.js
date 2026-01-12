import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Transaction type options
export const TRANSACTION_TYPE_OPTIONS = [
	{ value: "", label: "All Types" },
	{ value: "CREDIT", label: "Credit" },
	{ value: "DEBIT", label: "Debit" },
];

// Reconciliation status options for lines
export const LINE_RECONCILIATION_STATUS_OPTIONS = [
	{ value: "", label: "All Statuses" },
	{ value: "UNRECONCILED", label: "Unreconciled" },
	{ value: "RECONCILED", label: "Reconciled" },
];

// Fetch statement lines with optional filters
export const fetchStatementLines = createAsyncThunk(
	"statementLines/fetchAll",
	async (
		{ page = 1, page_size = 20, bank_statement, transaction_type, reconciliation_status } = {},
		{ rejectWithValue }
	) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);
			if (bank_statement) params.append("bank_statement", bank_statement);
			if (transaction_type) params.append("transaction_type", transaction_type);
			if (reconciliation_status) params.append("reconciliation_status", reconciliation_status);

			const response = await api.get(`/finance/cash/statement-lines/?${params.toString()}`);
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
			return rejectWithValue(error.response?.data || { message: "Failed to fetch statement lines" });
		}
	}
);

// Fetch single statement line by ID
export const fetchStatementLineById = createAsyncThunk("statementLines/fetchById", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/finance/cash/statement-lines/${id}/`);
		return response.data?.data ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || "Failed to fetch statement line details");
	}
});

// Delete a statement line
export const deleteStatementLine = createAsyncThunk("statementLines/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/finance/cash/statement-lines/${id}/`);
		return id;
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to delete statement line" });
	}
});

const statementLinesSlice = createSlice({
	name: "statementLines",
	initialState: {
		lines: [],
		selectedLine: null,
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
		clearSelectedLine: state => {
			state.selectedLine = null;
		},
		setPage: (state, action) => {
			state.page = action.payload;
		},
		clearLines: state => {
			state.lines = [];
			state.count = 0;
			state.page = 1;
		},
	},
	extraReducers: builder => {
		// Fetch Statement Lines
		builder
			.addCase(fetchStatementLines.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchStatementLines.fulfilled, (state, action) => {
				state.loading = false;
				state.lines = action.payload.results || [];
				state.count = action.payload.count;
				state.page = action.payload.page;
				state.pageSize = action.payload.pageSize;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchStatementLines.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload?.message || "Failed to fetch statement lines";
			});

		// Fetch Statement Line By ID
		builder
			.addCase(fetchStatementLineById.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(fetchStatementLineById.fulfilled, (state, action) => {
				state.actionLoading = false;
				state.selectedLine = action.payload;
			})
			.addCase(fetchStatementLineById.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload;
			});

		// Delete Statement Line
		builder
			.addCase(deleteStatementLine.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(deleteStatementLine.fulfilled, (state, action) => {
				state.actionLoading = false;
				state.lines = state.lines.filter(l => l.id !== action.payload);
				state.count -= 1;
			})
			.addCase(deleteStatementLine.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to delete statement line";
			});
	},
});

export const { clearError, clearSelectedLine, setPage, clearLines } = statementLinesSlice.actions;
export default statementLinesSlice.reducer;
