import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch employees with filters
export const fetchEmployees = createAsyncThunk(
	"employees/fetchAll",
	async (
		{
			as_of_date = "ALL",
			status = "ALL",
			page = 1,
			page_size = 25,
			employee_number = "",
			name = "",
			business_group = "",
			department = "",
		} = {},
		{ rejectWithValue }
	) => {
		try {
			const params = new URLSearchParams();
			params.append("as_of_date", as_of_date);
			params.append("status", status);
			params.append("page", page);
			params.append("page_size", page_size);
			if (employee_number) params.append("employee_number", employee_number);
			if (name) params.append("name", name);
			if (business_group) params.append("business_group", business_group);
			if (department) params.append("department", department);

			const response = await api.get(`/hr/person/employees/?${params.toString()}`);
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
				"Failed to fetch employees";
			return rejectWithValue(errorMessage);
		}
	}
);

// Create a new employee
export const createEmployee = createAsyncThunk("employees/create", async (employeeData, { rejectWithValue }) => {
	try {
		const response = await api.post("/hr/person/employees/", employeeData);
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
				errorMessage = errorData.message || errorData.error || errorData.detail || "Failed to create employee";
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to create employee");
	}
});

// Fetch single employee by ID
export const fetchEmployeeById = createAsyncThunk("employees/fetchById", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/hr/person/employees/${id}/`);
		return response.data?.data ?? response.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch employee";
		return rejectWithValue(errorMessage);
	}
});

// Update employee (PATCH)
export const updateEmployee = createAsyncThunk("employees/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.patch(`/hr/person/employees/${id}/`, data);
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
				errorMessage = errorData.message || errorData.error || errorData.detail || "Failed to update employee";
			}
			return rejectWithValue(errorMessage);
		}
		return rejectWithValue(error.message || "Failed to update employee");
	}
});

// Delete employee
export const deleteEmployee = createAsyncThunk("employees/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/hr/person/employees/${id}/`);
		return id;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to delete employee";
		return rejectWithValue(errorMessage);
	}
});

const initialState = {
	employees: [],
	selectedEmployee: null,
	loading: false,
	loadingEmployee: false,
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

const employeesSlice = createSlice({
	name: "employees",
	initialState,
	reducers: {
		setPage: (state, action) => {
			state.page = action.payload;
		},
		clearError: state => {
			state.error = null;
			state.actionError = null;
		},
		clearSelectedEmployee: state => {
			state.selectedEmployee = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch all employees
			.addCase(fetchEmployees.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchEmployees.fulfilled, (state, action) => {
				state.loading = false;
				state.employees = action.payload.results;
				state.count = action.payload.count;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchEmployees.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Create employee
			.addCase(createEmployee.pending, state => {
				state.creating = true;
				state.actionError = null;
			})
			.addCase(createEmployee.fulfilled, (state, action) => {
				state.creating = false;
				state.employees.unshift(action.payload);
				state.count += 1;
			})
			.addCase(createEmployee.rejected, (state, action) => {
				state.creating = false;
				state.actionError = action.payload;
			})
			// Fetch single employee
			.addCase(fetchEmployeeById.pending, state => {
				state.loadingEmployee = true;
				state.actionError = null;
			})
			.addCase(fetchEmployeeById.fulfilled, (state, action) => {
				state.loadingEmployee = false;
				state.selectedEmployee = action.payload;
			})
			.addCase(fetchEmployeeById.rejected, (state, action) => {
				state.loadingEmployee = false;
				state.actionError = action.payload;
			})
			// Update employee
			.addCase(updateEmployee.pending, state => {
				state.updating = true;
				state.actionError = null;
			})
			.addCase(updateEmployee.fulfilled, (state, action) => {
				state.updating = false;
				state.selectedEmployee = action.payload;
				const index = state.employees.findIndex(emp => emp.id === action.payload.id);
				if (index !== -1) {
					state.employees[index] = action.payload;
				}
			})
			.addCase(updateEmployee.rejected, (state, action) => {
				state.updating = false;
				state.actionError = action.payload;
			})
			// Delete employee
			.addCase(deleteEmployee.pending, state => {
				state.deleting = true;
				state.actionError = null;
			})
			.addCase(deleteEmployee.fulfilled, (state, action) => {
				state.deleting = false;
				state.employees = state.employees.filter(emp => emp.id !== action.payload);
				state.count -= 1;
			})
			.addCase(deleteEmployee.rejected, (state, action) => {
				state.deleting = false;
				state.actionError = action.payload;
			});
	},
});

export const { setPage, clearError, clearSelectedEmployee } = employeesSlice.actions;
export default employeesSlice.reducer;
