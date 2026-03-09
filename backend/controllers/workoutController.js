const Workout = require('../models/Workout');
const WorkoutLog = require('../models/WorkoutLog');
const { uploadToCloudinary } = require('../middleware/upload');
const StatsService = require('../services/StatsService');

// GET /api/workouts — list with filters
const getWorkouts = async (req, res, next) => {
    try {
        const { type, level, equipment, search } = req.query;
        const filter = { isPublished: true };
        if (type) filter.type = type;
        if (level) filter.level = level;
        if (equipment) filter.equipment = { $in: equipment.split(',') };
        if (search) filter.title = { $regex: search, $options: 'i' };

        const workouts = await Workout.find(filter).select('-exercises');
        res.json({ success: true, count: workouts.length, workouts });
    } catch (err) {
        next(err);
    }
};

// GET /api/workouts/logs — user's workout history
const getWorkoutLogs = async (req, res, next) => {
    try {
        const logs = await WorkoutLog.find({ userId: req.user._id })
            .sort('-completedAt')
            .limit(50)
            .populate('workoutId', 'title type duration thumbnail calories');
        res.json({ success: true, logs });
    } catch (err) {
        next(err);
    }
};

// GET /api/workouts/:id — single workout with exercises
const getWorkoutById = async (req, res, next) => {
    try {
        const workout = await Workout.findById(req.params.id);
        if (!workout) return res.status(404).json({ success: false, message: 'Workout not found' });
        res.json({ success: true, workout });
    } catch (err) {
        next(err);
    }
};

// POST /api/workouts — admin create workout
const createWorkout = async (req, res, next) => {
    try {
        const data = { ...req.body };

        // Parse JSON arrays sent as strings from FormData
        if (typeof data.equipment === 'string') data.equipment = JSON.parse(data.equipment);
        if (typeof data.targetMuscles === 'string') data.targetMuscles = JSON.parse(data.targetMuscles);
        if (typeof data.tags === 'string') data.tags = JSON.parse(data.tags);
        if (typeof data.exercises === 'string') data.exercises = JSON.parse(data.exercises);

        // Upload thumbnail to Cloudinary if provided
        if (req.file) {
            data.thumbnail = await uploadToCloudinary(req.file.buffer, 'workouts');
        }

        const workout = await Workout.create(data);
        res.status(201).json({ success: true, workout });
    } catch (err) {
        next(err);
    }
};

// PUT /api/workouts/:id — admin update workout
const updateWorkout = async (req, res, next) => {
    try {
        const data = { ...req.body };
        if (typeof data.equipment === 'string') data.equipment = JSON.parse(data.equipment);
        if (typeof data.targetMuscles === 'string') data.targetMuscles = JSON.parse(data.targetMuscles);
        if (typeof data.tags === 'string') data.tags = JSON.parse(data.tags);
        if (typeof data.exercises === 'string') data.exercises = JSON.parse(data.exercises);

        if (req.file) {
            data.thumbnail = await uploadToCloudinary(req.file.buffer, 'workouts');
        }

        const workout = await Workout.findByIdAndUpdate(req.params.id, data, { new: true });
        if (!workout) return res.status(404).json({ success: false, message: 'Workout not found' });
        res.json({ success: true, workout });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/workouts/:id — admin delete workout
const deleteWorkout = async (req, res, next) => {
    try {
        const workout = await Workout.findByIdAndDelete(req.params.id);
        if (!workout) return res.status(404).json({ success: false, message: 'Workout not found' });
        res.json({ success: true, message: 'Workout deleted' });
    } catch (err) {
        next(err);
    }
};

// POST /api/workouts/log — log a completed session
const logWorkout = async (req, res, next) => {
    try {
        const { workoutId, durationMins, caloriesBurned, exercises, notes } = req.body;
        const log = await WorkoutLog.create({
            userId: req.user._id,
            workoutId,
            durationMins,
            caloriesBurned,
            exercises,
            notes,
        });

        // Award Badges
        const User = require('../models/User');
        const user = await User.findById(req.user._id);
        const logCount = await WorkoutLog.countDocuments({ userId: req.user._id });

        if (logCount === 1 && !user.badges.some(b => b.badgeId === 'first_workout')) {
            user.badges.push({ badgeId: 'first_workout' });
        }
        if (logCount === 10 && !user.badges.some(b => b.badgeId === '10_workouts')) {
            user.badges.push({ badgeId: '10_workouts' });
        }
        await user.save();
        await StatsService.triggerRefresh(req.user._id);

        res.status(201).json({ success: true, log, badges: user.badges });
    } catch (err) {
        next(err);
    }
};

module.exports = { getWorkouts, getWorkoutById, getWorkoutLogs, logWorkout, createWorkout, updateWorkout, deleteWorkout };

