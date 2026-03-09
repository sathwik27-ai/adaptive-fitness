const router = require('express').Router();
const { connectGoogleFit, googleFitCallback, syncHealthData } = require('../controllers/healthController');
const { protect } = require('../middleware/auth');

router.get('/google-fit/auth', protect, connectGoogleFit);
router.get('/google-fit/callback', googleFitCallback);
router.post('/sync', protect, syncHealthData);

module.exports = router;
