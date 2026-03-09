const WorkoutLog = require('../models/WorkoutLog');
const FoodLog = require('../models/FoodLog');
const Progress = require('../models/Progress');
const PostureSession = require('../models/PostureSession');
const UserStats = require('../models/UserStats');
const User = require('../models/User');
const HealthMetric = require('../models/HealthMetric');

class StatsService {
    /**
     * Complete recalculation of all metrics for a user.
     * Use sparingly (e.g., first login of the day or force refresh).
     */
    static async recalculateAll(userId) {
        const [workouts, foodLogs, progressEntries, postureSessions, healthMetrics] = await Promise.all([
            WorkoutLog.find({ userId }).populate('workoutId'),
            FoodLog.find({ userId }),
            Progress.find({ userId }).sort('date'),
            PostureSession.find({ userId }),
            HealthMetric.find({ userId }).sort('date')
        ]);

        // 1. Basic Aggregates
        const totalWorkouts = workouts.length;
        const totalCaloriesWorkouts = workouts.reduce((sum, l) => sum + (l.caloriesBurned || 0), 0);
        const totalCaloriesHealth = healthMetrics.reduce((sum, m) => sum + (m.caloriesBurned || 0), 0);

        const manualSteps = progressEntries.reduce((sum, e) => sum + (e.steps || 0), 0);
        const healthSteps = healthMetrics.reduce((sum, m) => sum + (m.steps || 0), 0);
        const totalSteps = manualSteps + healthSteps;

        const totalPostureSessions = postureSessions.length;
        const avgPosture = postureSessions.length > 0
            ? Math.round(postureSessions.reduce((sum, s) => sum + s.avgScore, 0) / postureSessions.length)
            : 100;

        const avgHeartRate = healthMetrics.length > 0
            ? Math.round(healthMetrics.reduce((sum, m) => sum + m.avgHeartRate, 0) / healthMetrics.length)
            : 0;

        // 2. Streak Calculation (Workout logs)
        let streak = 0;
        const sortedDates = [...new Set(workouts.map(l => new Date(l.completedAt).toISOString().split('T')[0]))].sort().reverse();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (sortedDates.length > 0) {
            // Only start counting if they worked out today or yesterday
            if (sortedDates[0] === today || sortedDates[0] === yesterday) {
                streak = 1;
                for (let i = 0; i < sortedDates.length - 1; i++) {
                    const current = new Date(sortedDates[i]);
                    const next = new Date(sortedDates[i + 1]);
                    const diff = (current - next) / (1000 * 60 * 60 * 24);
                    if (diff === 1) streak++;
                    else break;
                }
            }
        }

        // 3. Weekly Calories (Bar Chart) - Merge Workout + Health
        const weeklyCalories = this._generateWeeklyBucket(workouts, healthMetrics);

        // 4. Workout Distribution (Pie Chart)
        const workoutDistribution = this._getDistribution(workouts);

        // 5. Weight, Steps & HeartRate Trends
        const weightTrend = progressEntries.filter(e => e.weight).map(e => ({ date: e.date, weight: e.weight }));

        // Merge steps from progressEntries and healthMetrics
        const stepsTrend = this._mergeDailySteps(progressEntries, healthMetrics);

        // Heart Rate Trend
        const heartRateTrend = healthMetrics.filter(m => m.avgHeartRate > 0).map(m => ({ date: m.date, bpm: m.avgHeartRate }));

        // 6. Posture & Workout Trends
        const postureTrend = this._getDailyAverage(postureSessions, 'avgScore', 'date');
        const workoutTrend = this._getDailySum(workouts, 'durationMins', 'completedAt');

        // 7. Update UserStats User
        return await UserStats.findOneAndUpdate(
            { userId },
            {
                totalWorkouts,
                totalCaloriesBurned: totalCaloriesWorkouts + totalCaloriesHealth,
                currentStreak: streak,
                totalSteps,
                avgPostureScore: avgPosture,
                totalPostureSessions,
                avgHeartRate,
                weeklyCalories,
                weightTrend,
                stepsTrend,
                postureTrend,
                workoutTrend,
                heartRateTrend,
                workoutDistribution,
                lastRecalculated: new Date()
            },
            { upsert: true, returnDocument: 'after' }
        );
    }

    static _generateWeeklyBucket(workouts, healthMetrics = []) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const bucket = days.map(day => ({ day, calories: 0 }));
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);

        workouts.forEach(l => {
            const date = new Date(l.completedAt);
            if (date >= startOfWeek) {
                const dayIndex = date.getDay();
                bucket[dayIndex].calories += (l.caloriesBurned || 0);
            }
        });

        healthMetrics.forEach(m => {
            const date = new Date(m.date);
            if (date >= startOfWeek) {
                const dayIndex = date.getDay();
                bucket[dayIndex].calories += (m.caloriesBurned || 0);
            }
        });

        return bucket;
    }

    static _mergeDailySteps(progressEntries, healthMetrics) {
        const groups = {};
        progressEntries.forEach(e => {
            const d = new Date(e.date).toISOString().split('T')[0];
            groups[d] = (groups[d] || 0) + (e.steps || 0);
        });
        healthMetrics.forEach(m => {
            const d = new Date(m.date).toISOString().split('T')[0];
            groups[d] = (groups[d] || 0) + (m.steps || 0);
        });
        return Object.entries(groups)
            .map(([date, steps]) => ({ date: new Date(date), steps }))
            .sort((a, b) => a.date - b.date);
    }

    static _getDistribution(workouts) {
        const counts = {};
        workouts.forEach(l => {
            const type = l.workoutId?.type || 'Other';
            counts[type] = (counts[type] || 0) + 1;
        });
        return Object.entries(counts).map(([type, count]) => ({ type, count }));
    }

    static _getDailySum(items, valField, dateField) {
        const groups = {};
        items.forEach(item => {
            const dateStr = new Date(item[dateField]).toISOString().split('T')[0];
            groups[dateStr] = (groups[dateStr] || 0) + (item[valField] || 0);
        });
        return Object.entries(groups)
            .map(([date, val]) => ({ date: new Date(date), duration: val }))
            .sort((a, b) => a.date - b.date);
    }

    static _getDailyAverage(items, valField, dateField) {
        const groups = {};
        items.forEach(item => {
            const dateStr = new Date(item[dateField]).toISOString().split('T')[0];
            if (!groups[dateStr]) groups[dateStr] = { sum: 0, count: 0 };
            groups[dateStr].sum += (item[valField] || 0);
            groups[dateStr].count += 1;
        });
        return Object.entries(groups)
            .map(([date, data]) => ({ date: new Date(date), score: Math.round(data.sum / data.count) }))
            .sort((a, b) => a.date - b.date);
    }

    // Incremental Triggers (Faster than full recalculate)
    static async triggerRefresh(userId) {
        return await this.recalculateAll(userId);
    }
}

module.exports = StatsService;
