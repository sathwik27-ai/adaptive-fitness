const router = require('express').Router();
const { getMe, updateMe, toggleSaved } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.patch('/me/saved', protect, toggleSaved);

module.exports = router;
