import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/client';

const messageOf = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.';

export const restoreSession = createAsyncThunk(
  'auth/restore',
  async (_, { rejectWithValue }) => {
    try {
      return (await api.get('/auth/me')).data.user;
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  }
);

export const signIn = createAsyncThunk(
  'auth/login',
  async (values, { rejectWithValue }) => {
    try {
      return (await api.post('/auth/login', values)).data.user;
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (values, { rejectWithValue }) => {
    try {
      return (await api.post('/auth/register', values)).data.user;
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      return rejectWithValue(messageOf(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',

  initialState: {
    user: null,
    status: 'idle',
    initialized: false,
    error: null,
  },

  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.status = 'loading';
      })

      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'idle';
        state.initialized = true;
      })

      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.status = 'idle';
        state.initialized = true;
      })

      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'idle';
        state.error = null;
      })

      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'idle';
        state.error = null;
      })

      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
      })

      .addMatcher(
        (action) =>
          action.type.endsWith('/pending') &&
          (action.type.startsWith('auth/login') ||
            action.type.startsWith('auth/register') ||
            action.type.startsWith('auth/logout')),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )

      .addMatcher(
        (action) =>
          action.type.endsWith('/rejected') &&
          (action.type.startsWith('auth/login') ||
            action.type.startsWith('auth/register') ||
            action.type.startsWith('auth/logout')),
        (state, action) => {
          state.status = 'idle';
          state.error = action.payload;
        }
      );
  },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer;
