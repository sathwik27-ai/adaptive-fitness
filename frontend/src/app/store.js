import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '../services/apiSlice';
import authReducer from '../features/authSlice';
import workoutReducer from '../features/workoutSlice';
import dietReducer from '../features/dietSlice';

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer,
        workout: workoutReducer,
        diet: dietReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
});
