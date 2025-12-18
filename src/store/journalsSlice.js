import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

// Async thunks for Journal Entries
export const fetchJournals = createAsyncThunk("journals/fetchAll", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get("/finance/gl/journal-entries/");
		return response.data?.data?.results ?? response.data?.results ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || "Failed to fetch journals");
	}
});

// Fetch single journal entry by ID with full details (lines)
export const fetchJournalById = createAsyncThunk("journals/fetchById", async (id, { rejectWithValue }) => {
	try {
		const response = await api.get(`/finance/gl/journal-entries/${id}/`);
		return response.data?.data ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || "Failed to fetch journal details");
	}
});

export const createJournal = createAsyncThunk("journals/create", async (journalData, { rejectWithValue }) => {
	try {
		const response = await api.post("/finance/gl/journal-entries/save/", journalData);
		return response.data?.data ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || "Failed to create journal");
	}
});

export const updateJournal = createAsyncThunk("journals/update", async ({ id, data }, { rejectWithValue }) => {
	try {
		// Include the ID in the data for update
		const updateData = { ...data, id };
		const response = await api.put("/finance/gl/journal-entries/save/", updateData);
		return response.data?.data ?? response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || "Failed to update journal");
	}
});

export const deleteJournal = createAsyncThunk("journals/delete", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/journals/${id}/`);
		return id;
	} catch (error) {
		return rejectWithValue(error.response?.data || "Failed to delete journal");
	}
});

export const postJournal = createAsyncThunk("journals/post", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/journals/${id}/post/`);
		return response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || "Failed to post journal");
	}
});

export const reverseJournal = createAsyncThunk("journals/reverse", async (id, { rejectWithValue }) => {
	try {
		const response = await api.post(`/journals/${id}/reverse/`);
		return response.data;
	} catch (error) {
		return rejectWithValue(error.response?.data || "Failed to reverse journal");
	}
});

const journalsSlice = createSlice({
	name: "journals",
	initialState: {
		journals: [],
		selectedJournal: null,
		loading: false,
		error: null,
	},
	reducers: {
		clearError: state => {
			state.error = null;
		},
		clearSelectedJournal: state => {
			state.selectedJournal = null;
		},
	},
	extraReducers: builder => {
		// Fetch Journals
		builder
			.addCase(fetchJournals.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchJournals.fulfilled, (state, action) => {
				state.loading = false;
				state.journals = action.payload;
			})
			.addCase(fetchJournals.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Fetch Journal By ID
		builder
			.addCase(fetchJournalById.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchJournalById.fulfilled, (state, action) => {
				state.loading = false;
				state.selectedJournal = action.payload;
			})
			.addCase(fetchJournalById.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Create Journal
		builder
			.addCase(createJournal.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(createJournal.fulfilled, (state, action) => {
				state.loading = false;
				state.journals.push(action.payload);
			})
			.addCase(createJournal.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Update Journal
		builder
			.addCase(updateJournal.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateJournal.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.journals.findIndex(journal => journal.id === action.payload.id);
				if (index !== -1) {
					state.journals[index] = action.payload;
				}
			})
			.addCase(updateJournal.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Delete Journal
		builder
			.addCase(deleteJournal.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteJournal.fulfilled, (state, action) => {
				state.loading = false;
				state.journals = state.journals.filter(journal => journal.id !== action.payload);
			})
			.addCase(deleteJournal.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Post Journal
		builder
			.addCase(postJournal.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(postJournal.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.journals.findIndex(journal => journal.id === action.payload.id);
				if (index !== -1) {
					state.journals[index] = action.payload;
				}
			})
			.addCase(postJournal.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});

		// Reverse Journal
		builder
			.addCase(reverseJournal.pending, state => {
				state.loading = true;
				state.error = null;
			})
			.addCase(reverseJournal.fulfilled, (state, action) => {
				state.loading = false;
				// Add the reversed journal entry
				state.journals.push(action.payload);
			})
			.addCase(reverseJournal.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const { clearError, clearSelectedJournal } = journalsSlice.actions;
export default journalsSlice.reducer;
