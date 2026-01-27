import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch all contracts with optional filters
export const fetchContracts = createAsyncThunk(
	"contracts/fetchAll",
	async ({ person, page = 1, page_size = 25, ...filters } = {}, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);
			if (person) params.append("person", person);
			Object.entries(filters).forEach(([key, value]) => {
				if (value) params.append(key, value);
			});

			const response = await api.get(`/hr/person/contracts/?${params.toString()}`);
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
				"Failed to fetch contracts";
			return rejectWithValue(errorMessage);
		}
	}
);

// Fetch single contract by ID
export const fetchContractById = createAsyncThunk("contracts/fetchById", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/hr/person/contracts/${id}/`);
		return response.data?.data ?? response.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch contract";
		return rejectWithValue(errorMessage);
	}
});

// Create contract
export const createContract = createAsyncThunk("contracts/create", async (contractData, { rejectWithValue }) => {
	try {
		const response = await api.post("/hr/person/contracts/", contractData);
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
				errorMessage = errorData.message || errorData.error || errorData.detail || "Failed to create contract";
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to create contract");
	}
});

// Update contract (PATCH)
export const updateContract = createAsyncThunk("contracts/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.patch(`/hr/person/contracts/${id}/`, data);
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
				errorMessage = errorData.message || errorData.error || errorData.detail || "Failed to update contract";
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to update contract");
	}
});

// Delete contract
export const deleteContract = createAsyncThunk("contracts/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/hr/person/contracts/${id}/`);
		return id;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to delete contract";
		return rejectWithValue(errorMessage);
	}
});

const contractsSlice = createSlice({
	name: "contracts",
	initialState: {
		contracts: [],
		selectedContract: null,
		loading: false,
		creating: false,
		updating: false,
		deleting: false,
		error: null,
		count: 0,
		next: null,
		previous: null,
	},
	reducers: {
		clearSelectedContract: state => {
			state.selectedContract = null;
		},
		clearError: state => {
			state.error = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch Contracts
			.addCase(fetchContracts.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchContracts.fulfilled, (state, action) => {
				state.loading = false;
				state.contracts = action.payload.results;
				state.count = action.payload.count;
				state.next = action.payload.next;
				state.previous = action.payload.previous;
			})
			.addCase(fetchContracts.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Fetch Contract By ID
			.addCase(fetchContractById.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchContractById.fulfilled, (state, action) => {
				state.loading = false;
				state.selectedContract = action.payload;
			})
			.addCase(fetchContractById.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Create Contract
			.addCase(createContract.pending, state => {
				state.creating = true;
				state.error = null;
			})
			.addCase(createContract.fulfilled, (state, action) => {
				state.creating = false;
				state.contracts.push(action.payload);
				state.count += 1;
			})
			.addCase(createContract.rejected, (state, action) => {
				state.creating = false;
				state.error = action.payload;
			})
			// Update Contract
			.addCase(updateContract.pending, state => {
				state.updating = true;
				state.error = null;
			})
			.addCase(updateContract.fulfilled, (state, action) => {
				state.updating = false;
				const index = state.contracts.findIndex(c => c.id === action.payload.id);
				if (index !== -1) {
					state.contracts[index] = action.payload;
				}
				if (state.selectedContract?.id === action.payload.id) {
					state.selectedContract = action.payload;
				}
			})
			.addCase(updateContract.rejected, (state, action) => {
				state.updating = false;
				state.error = action.payload;
			})
			// Delete Contract
			.addCase(deleteContract.pending, state => {
				state.deleting = true;
				state.error = null;
			})
			.addCase(deleteContract.fulfilled, (state, action) => {
				state.deleting = false;
				state.contracts = state.contracts.filter(c => c.id !== action.payload);
				state.count -= 1;
			})
			.addCase(deleteContract.rejected, (state, action) => {
				state.deleting = false;
				state.error = action.payload;
			});
	},
});

export const { clearSelectedContract, clearError } = contractsSlice.actions;
export default contractsSlice.reducer;
