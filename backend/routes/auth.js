const router = require('express').Router();
const passport = require('passport');
const { register, login, logout, googleCallback } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);

// Google OAuth
router.get('/google', (req, res, next) => {
    if (!passport._strategies.google) {
        return res.status(501).json({ success: false, message: 'Google OAuth not configured' });
    }
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});
router.get('/google/callback', (req, res, next) => {
    if (!passport._strategies.google) {
        return res.status(501).json({ success: false, message: 'Google OAuth not configured' });
    }
    passport.authenticate('google', { failureRedirect: `${frontendUrl()}/login?error=oauth`, session: false })(req, res, next);
}, googleCallback);

// Facebook OAuth
router.get('/facebook', (req, res, next) => {
    if (!passport._strategies.facebook) {
        return res.status(501).json({ success: false, message: 'Facebook OAuth not configured' });
    }
    passport.authenticate('facebook', { scope: ['email'], session: false })(req, res, next);
});
router.get('/facebook/callback', (req, res, next) => {
    if (!passport._strategies.facebook) {
        return res.status(501).json({ success: false, message: 'Facebook OAuth not configured' });
    }
    passport.authenticate('facebook', { failureRedirect: `${frontendUrl()}/login?error=oauth`, session: false })(req, res, next);
}, googleCallback);

module.exports = router;
