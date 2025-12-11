import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch all customers
export const fetchCustomers = createAsyncThunk("customers/fetchAll", async (filters = {}, { rejectWithValue }) => {
	try {
		const params = new URLSearchParams();
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== "" && value !== null && value !== undefined) {
				params.append(key, value);
			}
		});
		const queryString = params.toString();
		const url = queryString ? `/finance/bp/customers/?${queryString}` : "/finance/bp/customers/";
		const response = await api.get(url);
		return response.data.data.results;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch customers";
		return rejectWithValue(errorMessage);
	}
});
// Fetch active customers
export const fetchActiveCustomers = createAsyncThunk("customers/fetchActive", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/finance/bp/customers/active/");
		return response.data.data.results;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch active customers";
		return rejectWithValue(errorMessage);
	}
});

// Fetch customer by ID
export const fetchCustomerById = createAsyncThunk("customers/fetchById", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/finance/bp/customers/${id}/`);
		return response.data.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch customer details";
		return rejectWithValue(errorMessage);
	}
});

// Create customer
export const createCustomer = createAsyncThunk("customers/create", async (customerData, { rejectWithValue }) => {
	try {
		const response = await api.post("/finance/bp/customers/", customerData);
		return response.data.data;
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
				errorMessage = errorData.message || errorData.error || errorData.detail || "Failed to create customer";
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to create customer");
	}
});

// Update customer
export const updateCustomer = createAsyncThunk("customers/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.put(`/finance/bp/customers/${id}/`, data);
		return response.data.data;
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
				errorMessage = errorData.message || errorData.error || errorData.detail || "Failed to update customer";
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to update customer");
	}
});

// Delete customer
export const deleteCustomer = createAsyncThunk("customers/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/finance/bp/customers/${id}/`);
		return id;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to delete customer";
		return rejectWithValue(errorMessage);
	}
});
// Toggle customer active status
export const toggleCustomerActive = createAsyncThunk("customers/toggleActive", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/finance/bp/customers/${id}/toggle-active/`);
		return response.data.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to toggle active status";
		return rejectWithValue(errorMessage);
	}
});
const customersSlice = createSlice({
	name: "customers",
	initialState: {
		customers: [],
		loading: false,
		error: null,
	},
	reducers: {
		clearError: state => {
			state.error = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch customers
			.addCase(fetchCustomers.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCustomers.fulfilled, (state, action) => {
				state.loading = false;
				state.customers = action.payload;
			})
			.addCase(fetchCustomers.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Create customer
			.addCase(createCustomer.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(createCustomer.fulfilled, (state, action) => {
				state.loading = false;
				state.customers.push(action.payload);
			})
			.addCase(createCustomer.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Update customer
			.addCase(updateCustomer.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateCustomer.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.customers.findIndex(customer => customer.id === action.payload.id);
				if (index !== -1) {
					state.customers[index] = action.payload;
				}
			})
			.addCase(updateCustomer.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Delete customer
			.addCase(deleteCustomer.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteCustomer.fulfilled, (state, action) => {
				state.loading = false;
				state.customers = state.customers.filter(customer => customer.id !== action.payload);
			})
			.addCase(deleteCustomer.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Toggle customer active
			.addCase(toggleCustomerActive.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(toggleCustomerActive.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.customers.findIndex(customer => customer.id === action.payload.id);
				if (index !== -1) {
					state.customers[index].is_active = action.payload.is_active;
				}
			})
			.addCase(toggleCustomerActive.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { clearError } = customersSlice.actions;
export default customersSlice.reducer;
