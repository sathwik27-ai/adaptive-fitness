import { createSlice } from '@reduxjs/toolkit';

const dietSlice = createSlice({
    name: 'diet',
    initialState: {
        preferences: null,
        generatedPlan: null,
    },
    reducers: {
        setPreferences: (state, action) => { state.preferences = action.payload; },
        setGeneratedPlan: (state, action) => { state.generatedPlan = action.payload; },
        clearDiet: (state) => { state.preferences = null; state.generatedPlan = null; },
    },
});

export const { setPreferences, setGeneratedPlan, clearDiet } = dietSlice.actions;
export default dietSlice.reducer;
