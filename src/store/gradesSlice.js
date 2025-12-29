import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch grades with pagination
export const fetchGrades = createAsyncThunk("grades/fetchGrades", async (params = {}, { rejectWithValue }) => {
	try {
		const response = await api.get("/hr/work_structures/grades/", { params });
		const data = response.data?.data || response.data;
		return {
			results: data.results || data || [],
			count: data.count || 0,
			next: data.next,
			previous: data.previous,
		};
	} catch (error) {
		return rejectWithValue(error.message || "Failed to fetch grades");
	}
});

// Fetch single grade with rates
export const fetchGradeById = createAsyncThunk("grades/fetchGradeById", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/hr/work_structures/grades/${id}/`);
		return response.data?.data || response.data;
	} catch (error) {
		return rejectWithValue(error.message || "Failed to fetch grade");
	}
});

// Create a new grade
export const createGrade = createAsyncThunk("grades/createGrade", async (gradeData, { rejectWithValue }) => {
	try {
		const response = await api.post("/hr/work_structures/grades/", gradeData);
		return response.data?.data || response.data;
	} catch (error) {
		if (error.data) {
			return rejectWithValue(error.data);
		}
		return rejectWithValue(error.message || "Failed to create grade");
	}
});

// Update a grade (PATCH - code and business_group are read-only)
export const updateGrade = createAsyncThunk("grades/updateGrade", async ({ id, data }, { rejectWithValue }) => {
	try {
		const response = await api.patch(`/hr/work_structures/grades/${id}/`, data);
		return response.data?.data || response.data;
	} catch (error) {
		if (error.data) {
			return rejectWithValue(error.data);
		}
		return rejectWithValue(error.message || "Failed to update grade");
	}
});

// Delete a grade
export const deleteGrade = createAsyncThunk("grades/deleteGrade", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/hr/work_structures/grades/${id}/`);
		return id;
	} catch (error) {
		return rejectWithValue(error.message || "Failed to delete grade");
	}
});

// Fetch grade rates for a specific grade
export const fetchGradeRates = createAsyncThunk("grades/fetchGradeRates", async (gradeId, { rejectWithValue }) => {
	try {
		const response = await api.get(`/hr/work_structures/grades/${gradeId}/rates/`);
		const data = response.data?.data || response.data;
		return {
			gradeId,
			rates: Array.isArray(data) ? data : data.results || [],
		};
	} catch (error) {
		return rejectWithValue(error.message || "Failed to fetch grade rates");
	}
});

// Create a grade rate
export const createGradeRate = createAsyncThunk(
	"grades/createGradeRate",
	async ({ gradeId, data }, { rejectWithValue }) => {
		try {
			const response = await api.post(`/hr/work_structures/grades/${gradeId}/rates/`, data);
			return {
				gradeId,
				rate: response.data?.data || response.data,
			};
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.message || "Failed to create grade rate");
		}
	}
);

// Update a grade rate
export const updateGradeRate = createAsyncThunk(
	"grades/updateGradeRate",
	async ({ gradeId, rateId, data }, { rejectWithValue }) => {
		try {
			const response = await api.patch(`/hr/work_structures/grades/${gradeId}/rates/${rateId}/`, data);
			return {
				gradeId,
				rate: response.data?.data || response.data,
			};
		} catch (error) {
			if (error.data) {
				return rejectWithValue(error.data);
			}
			return rejectWithValue(error.message || "Failed to update grade rate");
		}
	}
);

// Delete a grade rate
export const deleteGradeRate = createAsyncThunk(
	"grades/deleteGradeRate",
	async ({ gradeId, rateId }, { rejectWithValue }) => {
		try {
			await api.delete(`/hr/work_structures/grades/${gradeId}/rates/${rateId}/`);
			return { gradeId, rateId };
		} catch (error) {
			return rejectWithValue(error.message || "Failed to delete grade rate");
		}
	}
);

// Fetch grade history (includes rates history)
export const fetchGradeHistory = createAsyncThunk("grades/fetchGradeHistory", async (gradeId, { rejectWithValue }) => {
	try {
		const response = await api.get(`/hr/work_structures/grades/${gradeId}/history/`);
		const data = response.data?.data || response.data;
		return {
			results: data.results || data || [],
			count: data.count || 0,
		};
	} catch (error) {
		return rejectWithValue(error.message || "Failed to fetch grade history");
	}
});

const gradesSlice = createSlice({
	name: "grades",
	initialState: {
		grades: [],
		selectedGrade: null,
		gradeRates: [],
		loading: false,
		ratesLoading: false,
		error: null,
		count: 0,
		page: 1,
		hasNext: false,
		hasPrevious: false,
		creating: false,
		updating: false,
		deleting: false,
		rateCreating: false,
		rateUpdating: false,
		rateDeleting: false,
		actionError: null,
	},
	reducers: {
		setPage: (state, action) => {
			state.page = action.payload;
		},
		setSelectedGrade: (state, action) => {
			state.selectedGrade = action.payload;
			state.gradeRates = action.payload?.rates || [];
		},
		clearSelectedGrade: state => {
			state.selectedGrade = null;
			state.gradeRates = [];
		},
		clearError: state => {
			state.error = null;
			state.actionError = null;
		},
	},
	extraReducers: builder => {
		builder
			// Fetch grades
			.addCase(fetchGrades.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchGrades.fulfilled, (state, action) => {
				state.loading = false;
				state.grades = action.payload.results;
				state.count = action.payload.count;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchGrades.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Fetch grade by ID
			.addCase(fetchGradeById.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchGradeById.fulfilled, (state, action) => {
				state.loading = false;
				state.selectedGrade = action.payload;
				state.gradeRates = action.payload?.rates || [];
			})
			.addCase(fetchGradeById.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Create grade
			.addCase(createGrade.pending, state => {
				state.creating = true;
				state.actionError = null;
			})
			.addCase(createGrade.fulfilled, (state, action) => {
				state.creating = false;
				state.grades.unshift(action.payload);
				state.count += 1;
			})
			.addCase(createGrade.rejected, (state, action) => {
				state.creating = false;
				state.actionError = action.payload;
			})

			// Update grade
			.addCase(updateGrade.pending, state => {
				state.updating = true;
				state.actionError = null;
			})
			.addCase(updateGrade.fulfilled, (state, action) => {
				state.updating = false;
				const index = state.grades.findIndex(g => g.id === action.payload.id);
				if (index !== -1) {
					state.grades[index] = action.payload;
				}
				if (state.selectedGrade?.id === action.payload.id) {
					state.selectedGrade = action.payload;
				}
			})
			.addCase(updateGrade.rejected, (state, action) => {
				state.updating = false;
				state.actionError = action.payload;
			})

			// Delete grade
			.addCase(deleteGrade.pending, state => {
				state.deleting = true;
				state.actionError = null;
			})
			.addCase(deleteGrade.fulfilled, (state, action) => {
				state.deleting = false;
				state.grades = state.grades.filter(g => g.id !== action.payload);
				state.count -= 1;
				if (state.selectedGrade?.id === action.payload) {
					state.selectedGrade = null;
					state.gradeRates = [];
				}
			})
			.addCase(deleteGrade.rejected, (state, action) => {
				state.deleting = false;
				state.actionError = action.payload;
			})

			// Fetch grade rates
			.addCase(fetchGradeRates.pending, state => {
				state.ratesLoading = true;
			})
			.addCase(fetchGradeRates.fulfilled, (state, action) => {
				state.ratesLoading = false;
				state.gradeRates = action.payload.rates;
			})
			.addCase(fetchGradeRates.rejected, (state, action) => {
				state.ratesLoading = false;
				state.actionError = action.payload;
			})

			// Create grade rate
			.addCase(createGradeRate.pending, state => {
				state.rateCreating = true;
				state.actionError = null;
			})
			.addCase(createGradeRate.fulfilled, (state, action) => {
				state.rateCreating = false;
				state.gradeRates.push(action.payload.rate);
				// Also update the rates in grades list if this grade exists
				const gradeIndex = state.grades.findIndex(g => g.id === action.payload.gradeId);
				if (gradeIndex !== -1 && state.grades[gradeIndex].rates) {
					state.grades[gradeIndex].rates.push(action.payload.rate);
				}
			})
			.addCase(createGradeRate.rejected, (state, action) => {
				state.rateCreating = false;
				state.actionError = action.payload;
			})

			// Update grade rate
			.addCase(updateGradeRate.pending, state => {
				state.rateUpdating = true;
				state.actionError = null;
			})
			.addCase(updateGradeRate.fulfilled, (state, action) => {
				state.rateUpdating = false;
				const rateIndex = state.gradeRates.findIndex(r => r.id === action.payload.rate.id);
				if (rateIndex !== -1) {
					state.gradeRates[rateIndex] = action.payload.rate;
				}
			})
			.addCase(updateGradeRate.rejected, (state, action) => {
				state.rateUpdating = false;
				state.actionError = action.payload;
			})

			// Delete grade rate
			.addCase(deleteGradeRate.pending, state => {
				state.rateDeleting = true;
				state.actionError = null;
			})
			.addCase(deleteGradeRate.fulfilled, (state, action) => {
				state.rateDeleting = false;
				state.gradeRates = state.gradeRates.filter(r => r.id !== action.payload.rateId);
			})
			.addCase(deleteGradeRate.rejected, (state, action) => {
				state.rateDeleting = false;
				state.actionError = action.payload;
			});
	},
});

export const { setPage, setSelectedGrade, clearSelectedGrade, clearError } = gradesSlice.actions;
export default gradesSlice.reducer;
