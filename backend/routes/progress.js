const router = require('express').Router();
const { getProgress, addProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getProgress);
router.post('/', protect, addProgress);

module.exports = router;
