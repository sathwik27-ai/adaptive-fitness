const router = require('express').Router();
const { saveSession, getHistory } = require('../controllers/postureController');
const { protect } = require('../middleware/auth');

router.post('/session', protect, saveSession);
router.get('/history', protect, getHistory);

module.exports = router;
