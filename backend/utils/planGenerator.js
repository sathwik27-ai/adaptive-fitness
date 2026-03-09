/**
 * planGenerator.js
 * Server-side workout plan generator.
 * Takes a user's onboarding profile and returns a structured workout schedule
 * (rules-based v1 — no external API required).
 */

const WORKOUT_DAYS_BY_GOAL = {
    'weight-loss': 5,
    'muscle-gain': 4,
    'endurance': 5,
    'maintenance': 3,
};

const TYPE_BY_GOAL = {
    'weight-loss': ['hiit', 'cardio', 'strength'],
    'muscle-gain': ['strength', 'strength', 'strength', 'cardio'],
    'endurance': ['cardio', 'cardio', 'hiit', 'yoga'],
    'maintenance': ['strength', 'cardio', 'yoga'],
};

const LEVEL_MAP = {
    beginner: 'beginner',
    intermediate: 'intermediate',
    advanced: 'advanced',
};

/**
 * generateWorkoutSchedule
 * @param {Object} profile - User profile from onboarding
 * @returns {Object} weeklySchedule
 */
const generateWorkoutSchedule = (profile) => {
    const { goal = 'maintenance', fitnessLevel = 'beginner', timePerWorkout = 30 } = profile || {};
    const daysPerWeek = WORKOUT_DAYS_BY_GOAL[goal] || 3;
    const types = TYPE_BY_GOAL[goal] || ['strength', 'cardio', 'yoga'];
    const level = LEVEL_MAP[fitnessLevel] || 'beginner';

    const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const schedule = {};

    // Spread workout days evenly across the week
    const selectedDays = WEEK_DAYS.slice(0, daysPerWeek);
    selectedDays.forEach((day, idx) => {
        schedule[day] = {
            type: types[idx % types.length],
            level,
            duration: timePerWorkout,
            rest: false,
        };
    });

    // Remaining days are rest/active recovery
    WEEK_DAYS.filter(d => !selectedDays.includes(d)).forEach(day => {
        schedule[day] = { rest: true, suggestion: 'Active recovery — light walk or stretching' };
    });

    return { goal, level, daysPerWeek, schedule };
};

module.exports = { generateWorkoutSchedule };
