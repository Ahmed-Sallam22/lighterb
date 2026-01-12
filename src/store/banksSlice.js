import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch all banks with optional filters
export const fetchBanks = createAsyncThunk(
	"banks/fetchAll",
	async ({ page = 1, page_size = 20, country, is_active } = {}, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);
			if (country) params.append("country", country);
			if (is_active !== undefined && is_active !== "") params.append("is_active", is_active);

			const response = await api.get(`/finance/cash/banks/?${params.toString()}`);
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
			return rejectWithValue(error.response?.data || { message: "Failed to fetch banks" });
		}
	}
);

// Fetch single bank by ID
export const fetchBankById = createAsyncThunk("banks/fetchById", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/finance/cash/banks/${id}/`);
		return response.data?.data ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || "Failed to fetch bank details");
	}
});

// Create a new bank
export const createBank = createAsyncThunk("banks/create", async (bankData, { rejectWithValue }) => {
	try {
		const response = await api.post("/finance/cash/banks/", bankData);
		return response.data?.data ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to create bank" });
	}
});

// Update an existing bank
export const updateBank = createAsyncThunk("banks/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.put(`/finance/cash/banks/${id}/`, data);
		return response.data?.data ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to update bank" });
	}
});

// Delete a bank
export const deleteBank = createAsyncThunk("banks/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/finance/cash/banks/${id}/`);
		return id;
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to delete bank" });
	}
});

// Activate a bank
export const activateBank = createAsyncThunk("banks/activate", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/finance/cash/banks/${id}/activate/`);
		return { id, data: response.data?.data ?? response.data };
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to activate bank" });
	}
});

// Deactivate a bank
export const deactivateBank = createAsyncThunk("banks/deactivate", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/finance/cash/banks/${id}/deactivate/`);
		return { id, data: response.data?.data ?? response.data };
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to deactivate bank" });
	}
});

const banksSlice = createSlice({
	name: "banks",
	initialState: {
		banks: [],
		selectedBank: null,
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
		clearSelectedBank: state => {
			state.selectedBank = null;
		},
		setPage: (state, action) => {
			state.page = action.payload;
		},
	},
	extraReducers: builder => {
		// Fetch Banks
		builder
			.addCase(fetchBanks.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchBanks.fulfilled, (state, action) => {
				state.loading = false;
				state.banks = action.payload.results || [];
				state.count = action.payload.count;
				state.page = action.payload.page;
				state.pageSize = action.payload.pageSize;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchBanks.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload?.message || "Failed to fetch banks";
			});

		// Fetch Bank By ID
		builder
			.addCase(fetchBankById.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchBankById.fulfilled, (state, action) => {
				state.loading = false;
				state.selectedBank = action.payload;
			})
			.addCase(fetchBankById.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Create Bank
		builder
			.addCase(createBank.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(createBank.fulfilled, (state, action) => {
				state.actionLoading = false;
				state.banks.unshift(action.payload);
				state.count += 1;
			})
			.addCase(createBank.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to create bank";
			});

		// Update Bank
		builder
			.addCase(updateBank.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(updateBank.fulfilled, (state, action) => {
				state.actionLoading = false;
				const index = state.banks.findIndex(b => b.id === action.payload.id);
				if (index !== -1) {
					state.banks[index] = action.payload;
				}
				if (state.selectedBank?.id === action.payload.id) {
					state.selectedBank = action.payload;
				}
			})
			.addCase(updateBank.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to update bank";
			});

		// Delete Bank
		builder
			.addCase(deleteBank.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(deleteBank.fulfilled, (state, action) => {
				state.actionLoading = false;
				state.banks = state.banks.filter(b => b.id !== action.payload);
				state.count -= 1;
			})
			.addCase(deleteBank.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to delete bank";
			});

		// Activate Bank
		builder
			.addCase(activateBank.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(activateBank.fulfilled, (state, action) => {
				state.actionLoading = false;
				const index = state.banks.findIndex(b => b.id === action.payload.id);
				if (index !== -1) {
					state.banks[index].is_active = true;
				}
				if (state.selectedBank?.id === action.payload.id) {
					state.selectedBank.is_active = true;
				}
			})
			.addCase(activateBank.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to activate bank";
			});

		// Deactivate Bank
		builder
			.addCase(deactivateBank.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(deactivateBank.fulfilled, (state, action) => {
				state.actionLoading = false;
				const index = state.banks.findIndex(b => b.id === action.payload.id);
				if (index !== -1) {
					state.banks[index].is_active = false;
				}
				if (state.selectedBank?.id === action.payload.id) {
					state.selectedBank.is_active = false;
				}
			})
			.addCase(deactivateBank.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to deactivate bank";
			});
	},
});

export const { clearError, clearSelectedBank, setPage } = banksSlice.actions;
export default banksSlice.reducer;
