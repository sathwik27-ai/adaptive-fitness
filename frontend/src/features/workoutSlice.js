import { createSlice } from '@reduxjs/toolkit';

const workoutSlice = createSlice({
    name: 'workout',
    initialState: {
        filters: { type: '', level: '', search: '' },
        activeSession: null,
    },
    reducers: {
        setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
        clearFilters: (state) => { state.filters = { type: '', level: '', search: '' }; },
        startSession: (state, action) => { state.activeSession = action.payload; },
        endSession: (state) => { state.activeSession = null; },
    },
});

export const { setFilters, clearFilters, startSession, endSession } = workoutSlice.actions;
export default workoutSlice.reducer;
