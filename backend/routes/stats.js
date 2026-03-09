const router = require('express').Router();
const { getStats, getInsights, refreshStats } = require('../controllers/statsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getStats);
router.get('/insights', protect, getInsights);
router.post('/refresh', protect, refreshStats);

module.exports = router;
