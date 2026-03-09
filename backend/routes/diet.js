const router = require('express').Router();
const { generateDiet, getDiet, swapMeal, savePlan, logFood, getFoodLog } = require('../controllers/dietController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generateDiet);
router.get('/', protect, getDiet);
router.patch('/swap-meal', protect, swapMeal);
router.post('/save', protect, savePlan);
router.post('/log', protect, logFood);
router.get('/log', protect, getFoodLog);

module.exports = router;
