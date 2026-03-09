import { useGetDietQuery, useGenerateDietMutation, useSwapMealMutation, useLogFoodMutation, useGetFoodLogsQuery } from '../services/apiSlice';

// Hook for the user's current diet profile + generated plan
export function useDietProfile() {
    const { data, isLoading, isFetching } = useGetDietQuery();
    return {
        profile: data?.profile || null,
        plan: data?.profile?.generatedPlan || null,
        target: data?.profile?.dailyCalorieTarget || 2000,
        isLoading,
        isFetching,
    };
}

// Hook for generating a new meal plan
export function useGenerateDiet() {
    const [generate, { isLoading }] = useGenerateDietMutation();
    return { generate, isLoading };
}

// Hook for swapping a meal
export function useSwapMeal() {
    const [swapMeal, { isLoading }] = useSwapMealMutation();
    return { swapMeal, isLoading };
}

// Hook for food diary
export function useFoodDiary(params = {}) {
    const { data, isLoading } = useGetFoodLogsQuery(params);
    const [logFood] = useLogFoodMutation();
    const todayLog = data?.logs?.[0] || null;
    return {
        todayLog,
        consumed: todayLog?.totalCalories || 0,
        logFood,
        isLoading,
    };
}
