import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch GRN list
export const fetchGRNs = createAsyncThunk(
	"grn/fetchAll",
	async ({ page = 1, page_size = 20, search, receipt_type } = {}, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams();
			params.append("page", page);
			params.append("page_size", page_size);

			if (search) params.append("search", search);
			if (receipt_type) params.append("receipt_type", receipt_type);

			const response = await api.get(`/procurement/receiving/?${params.toString()}`);
			const data = response.data?.data ?? response.data;
			return {
				results: data?.results ?? (Array.isArray(data) ? data : []),
				count: data?.count ?? 0,
				next: data?.next ?? null,
				previous: data?.previous ?? null,
				page,
				pageSize: page_size,
			};
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Failed to fetch goods receipt notes";
			return rejectWithValue(errorMessage);
		}
	}
);

// Fetch single GRN details
export const fetchGRNDetails = createAsyncThunk("grn/fetchDetails", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/procurement/receiving/${id}/`);
		return response.data?.data ?? response.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch GRN details";
		return rejectWithValue(errorMessage);
	}
});

// Delete GRN
export const deleteGRN = createAsyncThunk("grn/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/procurement/receiving/${id}/`);
		return id;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to delete goods receipt note";
		return rejectWithValue(errorMessage);
	}
});

// Fetch available POs for receiving (CONFIRMED or PARTIALLY_RECEIVED)
export const fetchAvailablePOsForReceiving = createAsyncThunk(
	"grn/fetchAvailablePOs",
	async (_, { rejectWithValue }) => {
		try {
			const response = await api.get("/procurement/po/?status=CONFIRMED&status=PARTIALLY_RECEIVED");
			const data = response.data?.data ?? response.data;
			return data?.results ?? (Array.isArray(data) ? data : []);
		} catch (error) {
			const errorMessage =
				error.response?.data?.message ||
				error.response?.data?.error ||
				error.response?.data?.detail ||
				error.message ||
				"Failed to fetch available purchase orders";
			return rejectWithValue(errorMessage);
		}
	}
);

// Fetch PO details for receiving
export const fetchPODetailsForReceiving = createAsyncThunk("grn/fetchPODetails", async (poId, { rejectWithValue }) => {
	try {
		const response = await api.get(`/procurement/po/${poId}/`);
		return response.data?.data ?? response.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch PO details";
		return rejectWithValue(errorMessage);
	}
});

// Fetch current user profile
export const fetchUserProfile = createAsyncThunk("grn/fetchUserProfile", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/accounts/profile/");
		return response.data?.data ?? response.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to fetch user profile";
		return rejectWithValue(errorMessage);
	}
});

// Create GRN
export const createGRN = createAsyncThunk("grn/create", async (payload, { rejectWithValue }) => {
	try {
		const response = await api.post("/procurement/receiving/", payload);
		return response.data?.data ?? response.data;
	} catch (error) {
		const errorMessage =
			error.response?.data?.message ||
			error.response?.data?.error ||
			error.response?.data?.detail ||
			error.message ||
			"Failed to create Goods Receipt Note";
		return rejectWithValue(errorMessage);
	}
});

const initialState = {
	// GRN list
	grnList: [],
	loading: false,
	error: null,
	count: 0,
	page: 1,
	hasNext: false,
	hasPrevious: false,

	// Current GRN details
	currentGRN: null,
	detailsLoading: false,
	detailsError: null,

	// Available POs for receiving
	availablePOs: [],
	loadingAvailablePOs: false,
	availablePOsError: null,

	// Selected PO details
	selectedPO: null,
	loadingPODetails: false,
	poDetailsError: null,

	// User profile
	userProfile: null,
	loadingUserProfile: false,
	userProfileError: null,

	// Create GRN
	creating: false,
	createError: null,
	createSuccess: false,
};

const grnSlice = createSlice({
	name: "grn",
	initialState,
	reducers: {
		setPage: (state, action) => {
			state.page = action.payload;
		},
		clearCurrentGRN: state => {
			state.currentGRN = null;
			state.detailsError = null;
		},
		clearSelectedPO: state => {
			state.selectedPO = null;
			state.poDetailsError = null;
		},
		clearCreateStatus: state => {
			state.creating = false;
			state.createError = null;
			state.createSuccess = false;
		},
		resetGRNState: () => initialState,
	},
	extraReducers: builder => {
		builder
			// Fetch GRN list
			.addCase(fetchGRNs.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchGRNs.fulfilled, (state, action) => {
				state.loading = false;
				state.grnList = action.payload.results;
				state.count = action.payload.count;
				state.page = action.payload.page;
				state.hasNext = !!action.payload.next;
				state.hasPrevious = !!action.payload.previous;
			})
			.addCase(fetchGRNs.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Fetch GRN details
			.addCase(fetchGRNDetails.pending, state => {
				state.detailsLoading = true;
				state.detailsError = null;
			})
			.addCase(fetchGRNDetails.fulfilled, (state, action) => {
				state.detailsLoading = false;
				state.currentGRN = action.payload;
			})
			.addCase(fetchGRNDetails.rejected, (state, action) => {
				state.detailsLoading = false;
				state.detailsError = action.payload;
			})

			// Delete GRN
			.addCase(deleteGRN.pending, state => {
				state.loading = true;
			})
			.addCase(deleteGRN.fulfilled, (state, action) => {
				state.loading = false;
				state.grnList = state.grnList.filter(grn => grn.id !== action.payload);
				state.count = Math.max(0, state.count - 1);
			})
			.addCase(deleteGRN.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})

			// Fetch available POs
			.addCase(fetchAvailablePOsForReceiving.pending, state => {
				state.loadingAvailablePOs = true;
				state.availablePOsError = null;
			})
			.addCase(fetchAvailablePOsForReceiving.fulfilled, (state, action) => {
				state.loadingAvailablePOs = false;
				state.availablePOs = action.payload;
			})
			.addCase(fetchAvailablePOsForReceiving.rejected, (state, action) => {
				state.loadingAvailablePOs = false;
				state.availablePOsError = action.payload;
			})

			// Fetch PO details
			.addCase(fetchPODetailsForReceiving.pending, state => {
				state.loadingPODetails = true;
				state.poDetailsError = null;
			})
			.addCase(fetchPODetailsForReceiving.fulfilled, (state, action) => {
				state.loadingPODetails = false;
				state.selectedPO = action.payload;
			})
			.addCase(fetchPODetailsForReceiving.rejected, (state, action) => {
				state.loadingPODetails = false;
				state.poDetailsError = action.payload;
				state.selectedPO = null;
			})

			// Fetch user profile
			.addCase(fetchUserProfile.pending, state => {
				state.loadingUserProfile = true;
				state.userProfileError = null;
			})
			.addCase(fetchUserProfile.fulfilled, (state, action) => {
				state.loadingUserProfile = false;
				state.userProfile = action.payload;
			})
			.addCase(fetchUserProfile.rejected, (state, action) => {
				state.loadingUserProfile = false;
				state.userProfileError = action.payload;
			})

			// Create GRN
			.addCase(createGRN.pending, state => {
				state.creating = true;
				state.createError = null;
				state.createSuccess = false;
			})
			.addCase(createGRN.fulfilled, state => {
				state.creating = false;
				state.createSuccess = true;
			})
			.addCase(createGRN.rejected, (state, action) => {
				state.creating = false;
				state.createError = action.payload;
				state.createSuccess = false;
			});
	},
});

export const { setPage, clearCurrentGRN, clearSelectedPO, clearCreateStatus, resetGRNState } = grnSlice.actions;
export default grnSlice.reducer;
