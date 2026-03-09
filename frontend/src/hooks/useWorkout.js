import { useGetWorkoutsQuery, useGetWorkoutQuery, useLogWorkoutMutation, useGetWorkoutLogsQuery } from '../services/apiSlice';

// Hook for workout library with filtering
export function useWorkoutLibrary(params = {}) {
    const { data, isLoading, isError } = useGetWorkoutsQuery(params);
    return {
        workouts: data?.workouts || [],
        count: data?.count || 0,
        isLoading,
        isError,
    };
}

// Hook for a single workout detail
export function useWorkoutDetail(id) {
    const { data, isLoading, isError } = useGetWorkoutQuery(id, { skip: !id });
    return {
        workout: data?.workout || null,
        isLoading,
        isError,
    };
}

// Hook for logging a workout session
export function useLogWorkout() {
    const [logWorkout, { isLoading }] = useLogWorkoutMutation();
    return { logWorkout, isLoading };
}

// Hook for user's workout history
export function useWorkoutHistory() {
    const { data, isLoading } = useGetWorkoutLogsQuery();
    return {
        logs: data?.logs || [],
        totalCalories: data?.logs?.reduce((s, l) => s + (l.caloriesBurned || 0), 0) || 0,
        isLoading,
    };
}
