import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Async thunk to fetch accounts
export const fetchAccounts = createAsyncThunk("accounts/fetchAccounts", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/finance/gl/accounts/");
		const data = response.data?.data?.results ?? response.data?.data ?? response.data?.results ?? response.data;
		return Array.isArray(data) ? data : [];
	} catch (error) {
		return rejectWithValue(error.response?.data || "Failed to fetch accounts");
	}
});

const accountsSlice = createSlice({
	name: "accounts",
	initialState: {
		accounts: [],
		loading: false,
		error: null,
	},
	reducers: {},
	extraReducers: builder => {
		builder
			// Fetch Accounts
			.addCase(fetchAccounts.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchAccounts.fulfilled, (state, action) => {
				state.loading = false;
				state.accounts = action.payload;
			})
			.addCase(fetchAccounts.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export default accountsSlice.reducer;
