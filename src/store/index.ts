import { configureStore } from '@reduxjs/toolkit';
import destinationReducer from './slices/destinationSlice';
import hotelReducer from './slices/hotelSlice';
import bookingReducer from './slices/bookingSlice';
import packageReducer from './slices/packageSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import { linktravelApi } from './linktravelApi';

export const store = configureStore({
  reducer: {
    [linktravelApi.reducerPath]: linktravelApi.reducer,
    destinations: destinationReducer,
    hotels: hotelReducer,
    booking: bookingReducer,
    packages: packageReducer,
    ui: uiReducer,
    auth: authReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(linktravelApi.middleware),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
