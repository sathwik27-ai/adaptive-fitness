const User = require('../models/User');
const Meal = require('../models/Meal');
const Workout = require('../models/Workout');
const { generateWorkoutSchedule } = require('../utils/planGenerator');
const mongoose = require('mongoose');

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
        if (!mongoose.isValidObjectId(id) || !['workout', 'meal'].includes(type)) {
            return res.status(400).json({ success: false, message: 'A valid item and saved type are required.' });
        }

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        const isMeal = type === 'meal';
        const field = isMeal ? 'savedMeals' : 'savedWorkouts';
        const Item = isMeal ? Meal : Workout;
        const idx = user[field].findIndex((savedId) => savedId.equals(id));
        if (idx === -1) {
            let item = await Item.findById(id).select('_id');
            if (!item && isMeal) {
                const { name, calories, protein, carbs, fats, ingredients, instructions } = req.body.meal || {};
                if (typeof name !== 'string' || !name.trim()) {
                    return res.status(400).json({ success: false, message: 'Meal details are required to save this meal.' });
                }
                item = await Meal.findOneAndUpdate(
                    { _id: id },
                    {
                        $setOnInsert: {
                            name: name.trim(),
                            calories: Number(calories) || 0,
                            protein: Number(protein) || 0,
                            carbs: Number(carbs) || 0,
                            fats: Number(fats) || 0,
                            ingredients: Array.isArray(ingredients) ? ingredients.map(String) : [],
                            instructions: typeof instructions === 'string' ? instructions : '',
                        },
                    },
                    { upsert: true, returnDocument: 'after', runValidators: true },
                ).select('_id');
            }
            if (!item) return res.status(404).json({ success: false, message: 'Workout not found.' });
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
