const passport = require('passport');

const protect = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Your session is invalid or has expired. Please sign in again.',
            });
        }

        req.user = user;
        return next();
    })(req, res, next);
};

// Admin only
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') return next();
    return res.status(403).json({ success: false, message: 'Admin access required' });
};

module.exports = { protect, adminOnly };
