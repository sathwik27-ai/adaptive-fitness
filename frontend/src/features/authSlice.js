import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: { user: null, isAuthenticated: false, isInitialized: false, sessionExpired: false },
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isInitialized = true;
            state.sessionExpired = false;
        },
        clearCredentials: (state, action) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isInitialized = true;
            state.sessionExpired = action.payload?.sessionExpired === true;
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
export const selectSessionExpired = (state) => state.auth.sessionExpired;
export default authSlice.reducer;
