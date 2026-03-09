import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        credentials: 'include', // Send HTTP-only cookies
    }),
    tagTypes: ['User', 'Workouts', 'WorkoutLogs', 'Diet', 'FoodLogs', 'Progress', 'PostureLogs', 'Stats'],
    endpoints: (builder) => ({
        // Auth
        register: builder.mutation({ query: (body) => ({ url: '/auth/register', method: 'POST', body }) }),
        login: builder.mutation({ query: (body) => ({ url: '/auth/login', method: 'POST', body }) }),
        logout: builder.mutation({ query: () => ({ url: '/auth/logout', method: 'POST' }) }),

        // User
        getMe: builder.query({ query: () => '/users/me', providesTags: ['User'] }),
        updateMe: builder.mutation({ query: (body) => ({ url: '/users/me', method: 'PATCH', body }), invalidatesTags: ['User'] }),
        toggleSaved: builder.mutation({ query: (body) => ({ url: '/users/me/saved', method: 'PATCH', body }), invalidatesTags: ['User'] }),

        // Workouts
        getWorkouts: builder.query({ query: (params) => ({ url: '/workouts', params }), providesTags: ['Workouts'] }),
        getWorkout: builder.query({ query: (id) => `/workouts/${id}` }),
        logWorkout: builder.mutation({ query: (body) => ({ url: '/workouts/log', method: 'POST', body }), invalidatesTags: ['WorkoutLogs', 'Progress'] }),
        getWorkoutLogs: builder.query({ query: () => '/workouts/logs', providesTags: ['WorkoutLogs'] }),
        createWorkout: builder.mutation({
            query: (formData) => ({ url: '/workouts', method: 'POST', body: formData }),
            invalidatesTags: ['Workouts'],
        }),
        deleteWorkout: builder.mutation({
            query: (id) => ({ url: `/workouts/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Workouts'],
        }),

        // Diet
        generateDiet: builder.mutation({ query: (body) => ({ url: '/diet/generate', method: 'POST', body }), invalidatesTags: ['Diet'] }),
        getDiet: builder.query({ query: () => '/diet', providesTags: ['Diet'] }),
        swapMeal: builder.mutation({ query: (body) => ({ url: '/diet/swap-meal', method: 'PATCH', body }), invalidatesTags: ['Diet'] }),
        saveDiet: builder.mutation({ query: () => ({ url: '/diet/save', method: 'POST' }), invalidatesTags: ['Diet'] }),
        logFood: builder.mutation({ query: (body) => ({ url: '/diet/log', method: 'POST', body }), invalidatesTags: ['FoodLogs'] }),
        getFoodLogs: builder.query({ query: (params) => ({ url: '/diet/log', params }), providesTags: ['FoodLogs'] }),

        // Progress
        getProgress: builder.query({ query: (params) => ({ url: '/progress', params }), providesTags: ['Progress'] }),
        addProgress: builder.mutation({ query: (body) => ({ url: '/progress', method: 'POST', body }), invalidatesTags: ['Progress'] }),

        // Posture
        savePostureSession: builder.mutation({ query: (body) => ({ url: '/posture/session', method: 'POST', body }), invalidatesTags: ['PostureLogs', 'User', 'Stats'] }),
        getPostureHistory: builder.query({ query: () => '/posture/history', providesTags: ['PostureLogs'] }),

        // Stats & AI
        getStats: builder.query({ query: () => '/stats', providesTags: ['Stats'] }),
        getInsights: builder.query({ query: () => '/stats/insights', providesTags: ['Stats'] }),
        refreshStats: builder.mutation({ query: () => ({ url: '/stats/refresh', method: 'POST' }), invalidatesTags: ['Stats'] }),

        // Health & Google Fit
        getGoogleFitAuth: builder.query({ query: () => '/health/google-fit/auth' }),
        syncHealth: builder.mutation({ query: () => ({ url: '/health/sync', method: 'POST' }), invalidatesTags: ['Stats'] }),
    }),
});

export const {
    useRegisterMutation, useLoginMutation, useLogoutMutation,
    useGetMeQuery, useUpdateMeMutation, useToggleSavedMutation,
    useGetWorkoutsQuery, useGetWorkoutQuery, useLogWorkoutMutation, useGetWorkoutLogsQuery,
    useCreateWorkoutMutation, useDeleteWorkoutMutation,
    useGenerateDietMutation, useGetDietQuery, useSwapMealMutation, useSaveDietMutation, useLogFoodMutation, useGetFoodLogsQuery,
    useGetProgressQuery, useAddProgressMutation,
    useSavePostureSessionMutation, useGetPostureHistoryQuery,
    useGetStatsQuery, useGetInsightsQuery, useRefreshStatsMutation,
    useGetGoogleFitAuthQuery, useSyncHealthMutation,
} = apiSlice;

