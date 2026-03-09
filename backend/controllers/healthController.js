const GoogleFitService = require('../services/googleFitService');
const HealthMetric = require('../models/HealthMetric');
const StatsService = require('../services/StatsService');

// @desc    Connect Google Fit (Get Auth URL)
// @route   GET /api/health/google-fit/auth
const connectGoogleFit = (req, res) => {
    // Pass user ID as state to identify them in the callback if cookies are blocked
    const url = GoogleFitService.getAuthUrl(req.user._id.toString());
    res.json({ success: true, url });
};

// @desc    Google Fit Callback (Save Tokens)
// @route   GET /api/health/google-fit/callback
const googleFitCallback = async (req, res, next) => {
    try {
        const { code, state } = req.query;
        if (!code) return res.status(400).json({ success: false, message: 'No code provided' });

        // Identify user: either via req.user (middleware) or via state fallback
        let user = req.user;
        if (!user && state) {
            const User = require('../models/User'); // Ensure User model is available
            user = await User.findById(state);
        }

        if (!user) return res.status(401).json({ success: false, message: 'Unauthorized: User not found' });

        const tokens = await GoogleFitService.getTokens(code);

        user.googleFitTokens = {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: new Date(tokens.expiry_date),
        };
        await user.save();

        // Initial Sync
        const { steps, heartRate, calories } = await GoogleFitService.syncDailyData(user);

        await HealthMetric.findOneAndUpdate(
            { userId: user._id, date: new Date().setHours(0, 0, 0, 0) },
            { steps, avgHeartRate: heartRate, caloriesBurned: calories, lastSyncedAt: new Date() },
            { upsert: true }
        );

        await StatsService.triggerRefresh(user._id);

        // Redirect back to profile or dashboard
        const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${redirectUrl}/profile?googleFit=success`);
    } catch (err) {
        next(err);
    }
};

// @desc    Sync Health Data manually
// @route   POST /api/health/sync
const syncHealthData = async (req, res, next) => {
    try {
        if (!req.user.googleFitTokens?.refreshToken) {
            return res.status(400).json({ success: false, message: 'Google Fit not connected' });
        }

        const { steps, heartRate, calories } = await GoogleFitService.syncDailyData(req.user);

        const metric = await HealthMetric.findOneAndUpdate(
            { userId: req.user._id, date: new Date().setHours(0, 0, 0, 0) },
            { steps, avgHeartRate: heartRate, caloriesBurned: calories, lastSyncedAt: new Date() },
            { upsert: true, returnDocument: 'after' }
        );

        await StatsService.triggerRefresh(req.user._id);

        res.json({ success: true, metric });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    connectGoogleFit,
    googleFitCallback,
    syncHealthData
};
