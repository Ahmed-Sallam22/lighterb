import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Fetch person types
export const fetchPersonTypes = createAsyncThunk(
	"personTypes/fetchPersonTypes",
	async (params = {}, { rejectWithValue }) => {
		try {
			const response = await api.get("/hr/person/types/", { params: { ...params } });
			const data = response.data?.data || response.data;
			return Array.isArray(data) ? data : data.results || [];
		} catch (error) {
			return rejectWithValue(error.message || "Failed to fetch person types");
		}
	}
);

const personTypesSlice = createSlice({
	name: "personTypes",
	initialState: {
		personTypes: [],
		loading: false,
		error: null,
	},
	reducers: {
		clearPersonTypes: state => {
			state.personTypes = [];
			state.error = null;
		},
	},
	extraReducers: builder => {
		builder
			.addCase(fetchPersonTypes.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchPersonTypes.fulfilled, (state, action) => {
				state.loading = false;
				state.personTypes = action.payload;
			})
			.addCase(fetchPersonTypes.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { clearPersonTypes } = personTypesSlice.actions;
export default personTypesSlice.reducer;
