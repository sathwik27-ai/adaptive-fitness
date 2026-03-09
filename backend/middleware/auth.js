const passport = require('passport');

// Authenticate using JWT (HTTP-only cookie)
const protect = passport.authenticate('jwt', { session: false });

// Admin only
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') return next();
    return res.status(403).json({ success: false, message: 'Admin access required' });
};

module.exports = { protect, adminOnly };
