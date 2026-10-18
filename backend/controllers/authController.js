const User = require('../models/User');
const { generateToken, setTokenCookie } = require('../utils/tokenHelper');
const { sendWelcomeEmail } = require('../utils/emailHelper');

// POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body || {};
        if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }
        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedName || !normalizedEmail || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }
        const exists = await User.findOne({ email: normalizedEmail });
        if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

        const user = await User.create({ name: normalizedName, email: normalizedEmail, password });
        const token = generateToken(user._id);
        setTokenCookie(res, token);

        // Non-blocking welcome email
        sendWelcomeEmail(user.email, user.name).catch((err) => {
            console.error('Welcome email failed:', err.message);
        });

        res.status(201).json({
            success: true,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, onboardingComplete: user.onboardingComplete },
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body || {};
        if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user || !user.password) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const token = generateToken(user._id);
        setTokenCookie(res, token);

        res.json({
            success: true,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, onboardingComplete: user.onboardingComplete },
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/logout
const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out' });
};

// GET /api/auth/google/callback (returns token after OAuth success)
const googleCallback = (req, res) => {
    const token = generateToken(req.user._id);
    setTokenCookie(res, token);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = req.user.onboardingComplete
        ? `${frontendUrl}/dashboard`
        : `${frontendUrl}/onboarding`;
    res.redirect(redirectUrl);
};

module.exports = { register, login, logout, googleCallback };
