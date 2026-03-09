const UserStats = require('../models/UserStats');
const StatsService = require('../services/StatsService');
const axios = require('axios');

// Helper for Hugging Face Inference
const callHuggingFace = async (prompt) => {
    try {
        if (!process.env.HUGGING_FACE_API_KEY) {
            console.warn('MISSING HUGGING_FACE_API_KEY: Returning mock insights.');
            return ["Track your protein intake to improve muscle recovery.", "Try increasing your daily steps by 10% next week."];
        }

        const response = await axios.post(
            'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
            { inputs: prompt },
            { headers: { Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}` } }
        );

        // Simple parsing for Mistral instruct format
        const text = response.data[0]?.generated_text || "";
        return text.split('\n').filter(line => line.length > 20).slice(0, 2);
    } catch (err) {
        console.error('HF API Error:', err.message);
        return ["Stay hydrated and keep up the great work!", "Focus on consistency to see long-term progress."];
    }
};

// GET /api/stats — Get aggregated stats for the dashboard
const getStats = async (req, res, next) => {
    try {
        let stats = await UserStats.findOne({ userId: req.user._id });
        if (!stats) {
            stats = await StatsService.recalculateAll(req.user._id);
        }
        res.json({ success: true, stats });
    } catch (err) {
        next(err);
    }
};

// GET /api/stats/insights — Generate AI fitness insights
const getInsights = async (req, res, next) => {
    try {
        const stats = await UserStats.findOne({ userId: req.user._id });
        if (!stats) return res.status(404).json({ success: false, message: 'No stats found. log some activity first.' });

        // Check cache (1 hour)
        if (stats.aiInsightCache?.timestamp && (new Date() - stats.aiInsightCache.timestamp < 3600000)) {
            return res.json({ success: true, insights: stats.aiInsightCache.insights });
        }

        const metricsJson = JSON.stringify({
            totalWorkouts: stats.totalWorkouts,
            streak: stats.currentStreak,
            avgPosture: stats.avgPostureScore,
            totalCals: stats.totalCaloriesBurned,
            totalSteps: stats.totalSteps,
            avgHeartRate: stats.avgHeartRate
        });

        const prompt = `Generate 2 concise motivational and analytical fitness insights based on this user data: ${metricsJson}. Analyze steps, heart rate, workouts, and posture. Short and professional.`;
        const insights = await callHuggingFace(prompt);

        stats.aiInsightCache = { insights, timestamp: new Date() };
        await stats.save();

        res.json({ success: true, insights });
    } catch (err) {
        next(err);
    }
};

// POST /api/stats/refresh — Force recalculate
const refreshStats = async (req, res, next) => {
    try {
        const stats = await StatsService.recalculateAll(req.user._id);
        res.json({ success: true, stats });
    } catch (err) {
        next(err);
    }
};

module.exports = { getStats, getInsights, refreshStats };
