const Progress = require('../models/Progress');
const StatsService = require('../services/StatsService');

// GET /api/progress — all entries for charts
const getProgress = async (req, res, next) => {
    try {
        const { from, to } = req.query;
        const filter = { userId: req.user._id };
        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to) filter.date.$lte = new Date(to);
        }
        const entries = await Progress.find(filter).sort('date').limit(90);
        res.json({ success: true, entries });
    } catch (err) {
        next(err);
    }
};

// POST /api/progress — add a new entry
const addProgress = async (req, res, next) => {
    try {
        const { weight, bodyFat, measurements, steps, activeMinutes, sleepHours, caloriesBurned } = req.body;
        const values = { weight, bodyFat, steps, activeMinutes, sleepHours, caloriesBurned };
        const suppliedValues = Object.values(values).filter((value) => value !== undefined && value !== null && value !== '');
        if (suppliedValues.length === 0 && !measurements) {
            return res.status(400).json({ success: false, message: 'Enter at least one progress metric.' });
        }
        if (suppliedValues.some((value) => !Number.isFinite(Number(value)) || Number(value) < 0)) {
            return res.status(400).json({ success: false, message: 'Progress metrics must be valid non-negative numbers.' });
        }

        const entry = await Progress.create({
            userId: req.user._id,
            weight, bodyFat, measurements, steps, activeMinutes, sleepHours, caloriesBurned,
        });
        const stats = await StatsService.triggerRefresh(req.user._id);
        res.status(201).json({ success: true, message: 'Progress saved', entry, stats });
    } catch (err) {
        next(err);
    }
};

module.exports = { getProgress, addProgress };
