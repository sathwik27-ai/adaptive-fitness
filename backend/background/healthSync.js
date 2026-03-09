const cron = require('node-cron');
const User = require('../models/User');
const HealthMetric = require('../models/HealthMetric');
const GoogleFitService = require('../services/googleFitService');
const StatsService = require('../services/StatsService');

/**
 * Syncs health data for all users who have connected Google Fit.
 * Runs every day at 1:00 AM.
 */
const setupHealthSync = () => {
    // Run at 01:00 every day
    cron.schedule('0 1 * * *', async () => {
        console.log('[Background Sync] Starting daily Google Fit sync...');
        const users = await User.find({ 'googleFitTokens.refreshToken': { $exists: true } });

        for (const user of users) {
            try {
                console.log(`[Background Sync] Syncing user: ${user.email}`);
                const { steps, heartRate, calories } = await GoogleFitService.syncDailyData(user);

                await HealthMetric.findOneAndUpdate(
                    { userId: user._id, date: new Date().setHours(0, 0, 0, 0) },
                    { steps, avgHeartRate: heartRate, caloriesBurned: calories, lastSyncedAt: new Date() },
                    { upsert: true }
                );

                await StatsService.triggerRefresh(user._id);
                user.lastHealthSync = new Date();
                await user.save();
            } catch (err) {
                console.error(`[Background Sync] Failed for user ${user._id}:`, err.message);
            }
        }
    });

    // Run every 6 hours for users who haven't synced in a while
    cron.schedule('0 */6 * * *', async () => {
        console.log('[Background Sync] Starting periodic health sync check...');
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        const users = await User.find({
            'googleFitTokens.refreshToken': { $exists: true },
            $or: [
                { lastHealthSync: { $exists: false } },
                { lastHealthSync: { $lt: sixHoursAgo } }
            ]
        });

        for (const user of users) {
            try {
                const { steps, heartRate, calories } = await GoogleFitService.syncDailyData(user);
                await HealthMetric.findOneAndUpdate(
                    { userId: user._id, date: new Date().setHours(0, 0, 0, 0) },
                    { steps, avgHeartRate: heartRate, caloriesBurned: calories, lastSyncedAt: new Date() },
                    { upsert: true }
                );
                await StatsService.triggerRefresh(user._id);
                user.lastHealthSync = new Date();
                await user.save();
            } catch (err) {
                console.error(`[Background Sync] Periodic sync failed for user ${user._id}:`, err.message);
            }
        }
    });
};

module.exports = setupHealthSync;
