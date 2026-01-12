import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Match status options
export const MATCH_STATUS_OPTIONS = [
	{ value: "", label: "All Statuses" },
	{ value: "MATCHED", label: "Matched" },
	{ value: "PARTIAL", label: "Partial" },
	{ value: "UNMATCHED", label: "Unmatched" },
	{ value: "MANUAL", label: "Manual" },
];

// Match type options
export const MATCH_TYPE_OPTIONS = [
	{ value: "", label: "All Types" },
	{ value: "EXACT", label: "Exact" },
	{ value: "AMOUNT_DATE", label: "Amount & Date" },
	{ value: "REFERENCE", label: "Reference" },
	{ value: "DESCRIPTION", label: "Description" },
	{ value: "MANUAL", label: "Manual" },
];

// Fetch matches with optional filters
export const fetchMatches = createAsyncThunk(
	"matches/fetchAll",
	async (
		{ page = 1, page_size = 20, statement_line, payment, match_status, match_type } = {},
		{ rejectWithValue }
	) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);
			if (statement_line) params.append("statement_line", statement_line);
			if (payment) params.append("payment", payment);
			if (match_status) params.append("match_status", match_status);
			if (match_type) params.append("match_type", match_type);

			const response = await api.get(`/finance/cash/matches/?${params.toString()}`);
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
			return rejectWithValue(error.response?.data || { message: "Failed to fetch matches" });
		}
	}
);

// Create a new match
export const createMatch = createAsyncThunk("matches/create", async (matchData, { rejectWithValue }) => {
	try {
		const response = await api.post("/finance/cash/matches/", matchData);
		return response.data?.data ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to create match" });
	}
});

// Update an existing match
export const updateMatch = createAsyncThunk("matches/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.patch(`/finance/cash/matches/${id}/`, data);
		return response.data?.data ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to update match" });
	}
});

// Delete a match
export const deleteMatch = createAsyncThunk("matches/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/finance/cash/matches/${id}/`);
		return id;
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to delete match" });
	}
});

// Fetch match by ID with full details
export const fetchMatchById = createAsyncThunk("matches/fetchById", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/finance/cash/matches/${id}/`);
		return response.data?.data ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to fetch match details" });
	}
});

// Fetch unreconciled payments for reconciliation modal
export const fetchUnreconciledPayments = createAsyncThunk(
	"matches/fetchUnreconciledPayments",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/finance/payments/?reconciliation_status=UNRECONCILED");
			const data = response.data?.data ?? response.data;
			return data?.results ?? data ?? [];
		} catch (error) {
			return rejectWithValue(error.response?.data || { message: "Failed to fetch unreconciled payments" });
		}
	}
);

// Fetch unreconciled statement lines for reconciliation modal
export const fetchUnreconciledStatementLines = createAsyncThunk(
	"matches/fetchUnreconciledStatementLines",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/finance/cash/statement-lines/?reconciliation_status=UNRECONCILED");
			const data = response.data?.data ?? response.data;
			return data?.results ?? data ?? [];
		} catch (error) {
			return rejectWithValue(error.response?.data || { message: "Failed to fetch unreconciled statement lines" });
		}
	}
);

const matchesSlice = createSlice({
	name: "matches",
	initialState: {
		matches: [],
		loading: false,
		error: null,
		count: 0,
		page: 1,
		pageSize: 20,
		hasNext: false,
		hasPrevious: false,
		actionLoading: false,
		// Selected match details
		selectedMatch: null,
		loadingDetails: false,
		// Reconciliation modal data
		unreconciledPayments: [],
		unreconciledStatementLines: [],
		loadingPayments: false,
		loadingStatementLines: false,
	},
	reducers: {
		clearError: state => {
			state.error = null;
		},
		setPage: (state, action) => {
			state.page = action.payload;
		},
		clearMatches: state => {
			state.matches = [];
			state.count = 0;
			state.page = 1;
		},
		clearReconciliationData: state => {
			state.unreconciledPayments = [];
			state.unreconciledStatementLines = [];
		},
		clearSelectedMatch: state => {
			state.selectedMatch = null;
		},
	},
	extraReducers: builder => {
		// Fetch Matches
		builder
			.addCase(fetchMatches.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchMatches.fulfilled, (state, action) => {
				state.loading = false;
				state.matches = action.payload.results || [];
				state.count = action.payload.count;
				state.page = action.payload.page;
				state.pageSize = action.payload.pageSize;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchMatches.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload?.message || "Failed to fetch matches";
			});

		// Create Match
		builder
			.addCase(createMatch.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(createMatch.fulfilled, (state, action) => {
				state.actionLoading = false;
				state.matches.unshift(action.payload);
				state.count += 1;
			})
			.addCase(createMatch.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to create match";
			});

		// Update Match
		builder
			.addCase(updateMatch.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(updateMatch.fulfilled, (state, action) => {
				state.actionLoading = false;
				const index = state.matches.findIndex(m => m.id === action.payload.id);
				if (index !== -1) {
					state.matches[index] = action.payload;
				}
			})
			.addCase(updateMatch.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to update match";
			});

		// Delete Match
		builder
			.addCase(deleteMatch.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(deleteMatch.fulfilled, (state, action) => {
				state.actionLoading = false;
				state.matches = state.matches.filter(m => m.id !== action.payload);
				state.count -= 1;
			})
			.addCase(deleteMatch.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to delete match";
			});
		// Fetch Match By ID
		builder
			.addCase(fetchMatchById.pending, state => {
				state.loadingDetails = true;
				state.error = null;
			})
			.addCase(fetchMatchById.fulfilled, (state, action) => {
				state.loadingDetails = false;
				state.selectedMatch = action.payload;
			})
			.addCase(fetchMatchById.rejected, (state, action) => {
				state.loadingDetails = false;
				state.error = action.payload?.message || "Failed to fetch match details";
			});
		// Fetch Unreconciled Payments
		builder
			.addCase(fetchUnreconciledPayments.pending, state => {
				state.loadingPayments = true;
			})
			.addCase(fetchUnreconciledPayments.fulfilled, (state, action) => {
				state.loadingPayments = false;
				state.unreconciledPayments = action.payload;
			})
			.addCase(fetchUnreconciledPayments.rejected, (state, action) => {
				state.loadingPayments = false;
				state.error = action.payload?.message || "Failed to fetch unreconciled payments";
			});

		// Fetch Unreconciled Statement Lines
		builder
			.addCase(fetchUnreconciledStatementLines.pending, state => {
				state.loadingStatementLines = true;
			})
			.addCase(fetchUnreconciledStatementLines.fulfilled, (state, action) => {
				state.loadingStatementLines = false;
				state.unreconciledStatementLines = action.payload;
			})
			.addCase(fetchUnreconciledStatementLines.rejected, (state, action) => {
				state.loadingStatementLines = false;
				state.error = action.payload?.message || "Failed to fetch unreconciled statement lines";
			});
	},
});

export const { clearError, setPage, clearMatches, clearReconciliationData, clearSelectedMatch } = matchesSlice.actions;
export default matchesSlice.reducer;
