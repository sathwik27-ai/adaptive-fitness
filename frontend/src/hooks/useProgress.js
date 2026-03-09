import { useGetProgressQuery, useAddProgressMutation } from '../services/apiSlice';

// Hook for progress chart data
export function useProgress(params = {}) {
    const { data, isLoading } = useGetProgressQuery(params);
    const [addProgress, { isLoading: isAdding }] = useAddProgressMutation();

    const entries = data?.entries || [];
    const latestEntry = entries.at(-1) || {};

    const weightData = entries.map(e => ({
        date: new Date(e.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        weight: e.weight,
    }));
    const calorieData = entries.map(e => ({
        date: new Date(e.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        calories: e.caloriesBurned,
    }));

    return {
        entries,
        latestEntry,
        weightData,
        calorieData,
        addProgress,
        isLoading,
        isAdding,
    };
}
