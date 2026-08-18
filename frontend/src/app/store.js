import { configureStore } from '@reduxjs/toolkit';

import authReducer from '../features/auth/authSlice';

import mediaReducer from '../features/media/mediaSlice';

import searchReducer from '../features/search/searchSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    media: mediaReducer,
    search: searchReducer,
  },
});