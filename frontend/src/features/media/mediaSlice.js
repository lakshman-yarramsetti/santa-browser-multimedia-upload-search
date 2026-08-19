import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/client';

const messageOf = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request) return 'Unable to reach the server. Please check your connection and try again.';
  return 'Something went wrong. Please try again later.';
};


export const fetchLibrary = createAsyncThunk('media/list', async (_, { rejectWithValue }) => { try { return (await api.get('/media')).data.media; } catch (error) { return rejectWithValue(messageOf(error)); } });
export const uploadMedia = createAsyncThunk('media/upload', async ({ file, tags }, { rejectWithValue }) => {
  const debugUploadId = `upload-debug-${Date.now()}`;

  try {
    console.info('[upload-debug] upload function started', {
      debugUploadId,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
    });

    const body = new FormData();
    body.append('file', file);
    body.append('tags', tags);

    console.info('[upload-debug] FormData created', { debugUploadId });
    console.info('[upload-debug] request started', { debugUploadId });

    const response = await api.post('/media/upload', body, {
      headers: { 'X-Debug-Upload-ID': debugUploadId },
    });

    console.info('[upload-debug] request fulfilled', {
      debugUploadId,
      status: response.status,
    });

    return response.data.media;
  } catch (error) {
    console.info('[upload-debug] request failed', {
      debugUploadId,
      message: error.message,
      code: error.code,
      hasRequest: Boolean(error.request),
      status: error.response?.status,
    });

    return rejectWithValue(messageOf(error));
  }
});
export const fetchMedia = createAsyncThunk('media/detail', async (id, { rejectWithValue }) => { try { return (await api.get(`/media/${id}`)).data.media; } catch (error) { return rejectWithValue(messageOf(error)); } });
export const recordView = createAsyncThunk('media/view', async (id, { rejectWithValue }) => { try { return (await api.post(`/media/${id}/view`)).data.media; } catch (error) { return rejectWithValue(messageOf(error)); } });

const mediaSlice = createSlice({
  name: 'media',
  initialState: { items: [], selected: null, status: 'idle', error: null },
  reducers: { clearMediaError: (state) => { state.error = null; }, clearSelectedMedia: (state) => { state.selected = null; } },
  extraReducers: (builder) => { builder
    .addCase(fetchLibrary.fulfilled, (state, action) => { state.items = action.payload; state.status = 'idle'; })
    .addCase(uploadMedia.fulfilled, (state, action) => { state.items.unshift(action.payload); state.status = 'idle'; })
    .addCase(fetchMedia.fulfilled, (state, action) => { state.selected = action.payload; state.status = 'idle'; })
    .addCase(recordView.fulfilled, (state, action) => { state.selected = action.payload; const index = state.items.findIndex((item) => item._id === action.payload._id); if (index !== -1) state.items[index] = action.payload; })
    .addMatcher((action) => action.type.startsWith('media/') && action.type.endsWith('/pending') && !action.type.startsWith('media/view'), (state) => { state.status = 'loading'; state.error = null; })
    .addMatcher((action) => action.type.startsWith('media/') && action.type.endsWith('/rejected') && !action.type.startsWith('media/view'), (state, action) => { state.status = 'idle'; state.error = action.payload; });
  },
});

export const { clearMediaError, clearSelectedMedia } = mediaSlice.actions;
export default mediaSlice.reducer;