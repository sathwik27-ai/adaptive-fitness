// Date & time formatters
export const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatShortDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric' });
};

// Calorie / number formatters
export const formatCalories = (kcal) => `${Math.round(kcal || 0)} kcal`;

export const formatDuration = (mins) => {
    if (!mins) return '—';
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

// Clamp a number between min and max
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// Capitalise first letter
export const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : '');

// PRD color palette constants
export const CHART_COLORS = {
    orange: '#E59A3A',
    olive: '#4F7C63',
    purple: '#8C6FAE',
    primary: '#2F5D3A',
};

// Badge milestone definitions
export const BADGE_DEFINITIONS = [
    { id: 1, icon: 'badge', label: 'First Workout', desc: 'Complete your first session', threshold: 1, metric: 'workouts' },
    { id: 2, icon: 'badge', label: '10 Workouts', desc: 'Log 10 workout sessions', threshold: 10, metric: 'workouts' },
    { id: 3, icon: 'badge', label: 'badge', label: '30 Workouts', desc: 'Log 30 workout sessions', threshold: 30, metric: 'workouts' },
    { id: 4, icon: 'badge', label: 'Goal Tracker', desc: 'Log 5 weight entries', threshold: 5, metric: 'weight' },
    { id: 5, icon: 'badge', label: 'Consistency King', desc: 'Work out 7 days in a row', threshold: 7, metric: 'streak' },
    { id: 6, icon: 'badge', label: 'Nutrition Init', desc: 'Generate your first diet plan', threshold: 1, metric: 'diet' },
];
