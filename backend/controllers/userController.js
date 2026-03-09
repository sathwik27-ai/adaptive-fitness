const User = require('../models/User');
const { generateWorkoutSchedule } = require('../utils/planGenerator');

// GET /api/users/me
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('savedWorkouts', 'title type duration level thumbnail')
            .populate('savedMeals', 'name calories protein carbs fats thumbnail');
        res.json({ success: true, user });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/users/me
const updateMe = async (req, res, next) => {
    try {
        const allowedFields = ['name', 'avatar', 'profile', 'onboardingComplete'];
        const updates = {};
        allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

        // Generate workout schedule when onboarding is completed
        if (updates.onboardingComplete === true && updates.profile) {
            updates.workoutPlan = generateWorkoutSchedule(updates.profile);
            // Award badge
            const user = await User.findById(req.user._id);
            if (!user.badges.some(b => b.badgeId === 'onboarding_complete')) {
                updates.$push = { badges: { badgeId: 'onboarding_complete' } };
            }
        }

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            returnDocument: 'after', runValidators: true,
        }).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/users/me/saved — toggle bookmark
const toggleSaved = async (req, res, next) => {
    try {
        const { id, type } = req.body;
        const user = await User.findById(req.user._id);
        const field = type === 'meal' ? 'savedMeals' : 'savedWorkouts';

        const idx = user[field].indexOf(id);
        if (idx === -1) {
            user[field].push(id);
        } else {
            user[field].splice(idx, 1);
        }
        await user.save();
        res.json({ success: true, savedWorkouts: user.savedWorkouts, savedMeals: user.savedMeals });
    } catch (err) {
        next(err);
    }
};

module.exports = { getMe, updateMe, toggleSaved };

