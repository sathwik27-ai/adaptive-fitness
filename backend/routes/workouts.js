const router = require('express').Router();
const {
    getWorkouts, getWorkoutById, getWorkoutLogs, logWorkout,
    createWorkout, updateWorkout, deleteWorkout
} = require('../controllers/workoutController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Order matters: specific paths before parametric
router.get('/logs', protect, getWorkoutLogs);
router.get('/', getWorkouts);
router.get('/:id', getWorkoutById);
router.post('/log', protect, logWorkout);

// Admin CRUD (protected — in a full app, add admin role check)
router.post('/', protect, adminOnly, upload.single('thumbnail'), createWorkout);
router.put('/:id', protect, adminOnly, upload.single('thumbnail'), updateWorkout);
router.delete('/:id', protect, adminOnly, deleteWorkout);

module.exports = router;
