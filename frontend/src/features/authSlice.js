import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: { user: null, isAuthenticated: false, isInitialized: false },
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isInitialized = true;
        },
        clearCredentials: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isInitialized = true;
        },
        setInitialized: (state) => {
            state.isInitialized = true;
        },
    },
});

export const { setCredentials, clearCredentials, setInitialized } = authSlice.actions;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthInitialized = (state) => state.auth.isInitialized;
export default authSlice.reducer;
