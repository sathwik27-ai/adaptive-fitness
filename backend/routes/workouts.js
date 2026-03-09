const router = require('express').Router();
const {
    getWorkouts, getWorkoutById, getWorkoutLogs, logWorkout,
    createWorkout, updateWorkout, deleteWorkout
} = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Order matters: specific paths before parametric
router.get('/logs', protect, getWorkoutLogs);
router.get('/', getWorkouts);
router.get('/:id', getWorkoutById);
router.post('/log', protect, logWorkout);

// Admin CRUD (protected — in a full app, add admin role check)
router.post('/', protect, upload.single('thumbnail'), createWorkout);
router.put('/:id', protect, upload.single('thumbnail'), updateWorkout);
router.delete('/:id', protect, deleteWorkout);

module.exports = router;
