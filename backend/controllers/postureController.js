const PostureSession = require('../models/PostureSession');
const User = require('../models/User');
const StatsService = require('../services/StatsService');

// POST /api/posture/session — save a posture session summary
const saveSession = async (req, res, next) => {
    try {
        const { avgScore, duration, correctionsTriggered, angles } = req.body;

        const session = await PostureSession.create({
            userId: req.user._id,
            avgScore,
            duration,
            correctionsTriggered,
            angles,
        });

        // Badge: 5 posture sessions
        const count = await PostureSession.countDocuments({ userId: req.user._id });
        if (count >= 5) {
            const user = await User.findById(req.user._id);
            if (!user.badges.some(b => b.badgeId === 'posture_5sessions')) {
                user.badges.push({ badgeId: 'posture_5sessions' });
                await user.save();
            }
        }
        await StatsService.triggerRefresh(req.user._id);

        res.status(201).json({ success: true, session, totalSessions: count });
    } catch (err) {
        next(err);
    }
};

// GET /api/posture/history — get posture session history
const getHistory = async (req, res, next) => {
    try {
        const sessions = await PostureSession.find({ userId: req.user._id })
            .sort('-date')
            .limit(50);
        res.json({ success: true, sessions });
    } catch (err) {
        next(err);
    }
};

module.exports = { saveSession, getHistory };
