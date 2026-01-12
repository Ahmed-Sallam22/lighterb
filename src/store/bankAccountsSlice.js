import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Account type options
export const ACCOUNT_TYPE_OPTIONS = [
	{ value: "CURRENT", label: "Current Account" },
	{ value: "SAVINGS", label: "Savings Account" },
	{ value: "FIXED_DEPOSIT", label: "Fixed Deposit" },
	{ value: "LOAN", label: "Loan Account" },
	{ value: "OVERDRAFT", label: "Overdraft Account" },
];

// Fetch bank accounts with optional filters
export const fetchBankAccounts = createAsyncThunk(
	"bankAccounts/fetchAll",
	async ({ page = 1, page_size = 20, branch, account_type, is_active, currency } = {}, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);
			if (branch) params.append("branch", branch);
			if (account_type) params.append("account_type", account_type);
			if (is_active !== undefined && is_active !== "") params.append("is_active", is_active);
			if (currency) params.append("currency", currency);

			const response = await api.get(`/finance/cash/accounts/?${params.toString()}`);
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
			return rejectWithValue(error.response?.data || { message: "Failed to fetch bank accounts" });
		}
	}
);

// Fetch single bank account by ID
export const fetchBankAccountById = createAsyncThunk("bankAccounts/fetchById", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/finance/cash/accounts/${id}/`);
		return response.data?.data ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || "Failed to fetch account details");
	}
});

// Create a new bank account
export const createBankAccount = createAsyncThunk("bankAccounts/create", async (accountData, { rejectWithValue }) => {
	try {
		const response = await api.post("/finance/cash/accounts/", accountData);
		return response.data?.data ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to create bank account" });
	}
});

// Update an existing bank account
export const updateBankAccount = createAsyncThunk("bankAccounts/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.put(`/finance/cash/accounts/${id}/`, data);
		return response.data?.data ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to update bank account" });
	}
});

// Delete a bank account
export const deleteBankAccount = createAsyncThunk("bankAccounts/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/finance/cash/accounts/${id}/`);
		return id;
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to delete bank account" });
	}
});

// Update account balance
export const updateAccountBalance = createAsyncThunk(
	"bankAccounts/updateBalance",
	async ({ id, amount, transaction_type, description }, { rejectWithValue }) => {
		try {
			const response = await api.post(`/finance/cash/accounts/${id}/update_balance/`, {
				amount,
				transaction_type,
				description,
			});
			return { id, data: response.data?.data ?? response.data };
		} catch (error) {
			return rejectWithValue(error.response?.data || { message: "Failed to update account balance" });
		}
	}
);

// Freeze an account
export const freezeAccount = createAsyncThunk("bankAccounts/freeze", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/finance/cash/accounts/${id}/freeze/`);
		return { id, data: response.data?.data ?? response.data };
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to freeze account" });
	}
});

// Unfreeze an account
export const unfreezeAccount = createAsyncThunk("bankAccounts/unfreeze", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/finance/cash/accounts/${id}/unfreeze/`);
		return { id, data: response.data?.data ?? response.data };
	} catch (error) {
		return rejectWithValue(error.response?.data || { message: "Failed to unfreeze account" });
	}
});

const bankAccountsSlice = createSlice({
	name: "bankAccounts",
	initialState: {
		accounts: [],
		selectedAccount: null,
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
		clearSelectedAccount: state => {
			state.selectedAccount = null;
		},
		setPage: (state, action) => {
			state.page = action.payload;
		},
		clearAccounts: state => {
			state.accounts = [];
			state.count = 0;
			state.page = 1;
		},
	},
	extraReducers: builder => {
		// Fetch Bank Accounts
		builder
			.addCase(fetchBankAccounts.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchBankAccounts.fulfilled, (state, action) => {
				state.loading = false;
				state.accounts = action.payload.results || [];
				state.count = action.payload.count;
				state.page = action.payload.page;
				state.pageSize = action.payload.pageSize;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchBankAccounts.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload?.message || "Failed to fetch bank accounts";
			});

		// Fetch Bank Account By ID
		builder
			.addCase(fetchBankAccountById.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchBankAccountById.fulfilled, (state, action) => {
				state.loading = false;
				state.selectedAccount = action.payload;
			})
			.addCase(fetchBankAccountById.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Create Bank Account
		builder
			.addCase(createBankAccount.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(createBankAccount.fulfilled, (state, action) => {
				state.actionLoading = false;
				state.accounts.unshift(action.payload);
				state.count += 1;
			})
			.addCase(createBankAccount.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to create bank account";
			});

		// Update Bank Account
		builder
			.addCase(updateBankAccount.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(updateBankAccount.fulfilled, (state, action) => {
				state.actionLoading = false;
				const index = state.accounts.findIndex(a => a.id === action.payload.id);
				if (index !== -1) {
					state.accounts[index] = action.payload;
				}
				if (state.selectedAccount?.id === action.payload.id) {
					state.selectedAccount = action.payload;
				}
			})
			.addCase(updateBankAccount.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to update bank account";
			});

		// Delete Bank Account
		builder
			.addCase(deleteBankAccount.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(deleteBankAccount.fulfilled, (state, action) => {
				state.actionLoading = false;
				state.accounts = state.accounts.filter(a => a.id !== action.payload);
				state.count -= 1;
			})
			.addCase(deleteBankAccount.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to delete bank account";
			});

		// Update Account Balance
		builder
			.addCase(updateAccountBalance.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(updateAccountBalance.fulfilled, (state, action) => {
				state.actionLoading = false;
				// Refresh the account data after balance update
			})
			.addCase(updateAccountBalance.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to update account balance";
			});

		// Freeze Account
		builder
			.addCase(freezeAccount.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(freezeAccount.fulfilled, (state, action) => {
				state.actionLoading = false;
				const index = state.accounts.findIndex(a => a.id === action.payload.id);
				if (index !== -1) {
					state.accounts[index].is_frozen = true;
				}
				if (state.selectedAccount?.id === action.payload.id) {
					state.selectedAccount.is_frozen = true;
				}
			})
			.addCase(freezeAccount.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to freeze account";
			});

		// Unfreeze Account
		builder
			.addCase(unfreezeAccount.pending, state => {
				state.actionLoading = true;
				state.error = null;
			})
			.addCase(unfreezeAccount.fulfilled, (state, action) => {
				state.actionLoading = false;
				const index = state.accounts.findIndex(a => a.id === action.payload.id);
				if (index !== -1) {
					state.accounts[index].is_frozen = false;
				}
				if (state.selectedAccount?.id === action.payload.id) {
					state.selectedAccount.is_frozen = false;
				}
			})
			.addCase(unfreezeAccount.rejected, (state, action) => {
				state.actionLoading = false;
				state.error = action.payload?.message || "Failed to unfreeze account";
			});
	},
});

export const { clearError, clearSelectedAccount, setPage, clearAccounts } = bankAccountsSlice.actions;
export default bankAccountsSlice.reducer;
