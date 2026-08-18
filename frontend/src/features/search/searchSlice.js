import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/client';

export const searchMedia = createAsyncThunk(
  'search/media',
  async (query, { rejectWithValue }) => {
    try {
      return (await api.get('/media/search', { params: { query } })).data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Search failed.'
      );
    }
  }
);

const searchSlice = createSlice({
  name: 'search',

  initialState: {
    query: '',
    results: [],
    status: 'idle',
    error: null,
    hasSearched: false,
  },

  reducers: {
    clearSearch: (state) => {
      state.query = '';
      state.results = [];
      state.error = null;
      state.hasSearched = false;
      state.status = 'idle';
    },
  },

  extraReducers: (builder) =>
    builder
      .addCase(searchMedia.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })

      .addCase(searchMedia.fulfilled, (state, action) => {
        state.status = 'idle';
        state.query = action.payload.query;
        state.results = action.payload.media;
        state.hasSearched = true;
      })

      .addCase(searchMedia.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload;
        state.hasSearched = true;
      }),
});

export const { clearSearch } = searchSlice.actions;

export default searchSlice.reducer;
