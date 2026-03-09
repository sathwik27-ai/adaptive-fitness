const User = require('../models/User');
const { generateToken, setTokenCookie } = require('../utils/tokenHelper');
const { sendWelcomeEmail } = require('../utils/emailHelper');

// POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }
        const exists = await User.findOne({ email });
        if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

        const user = await User.create({ name, email, password });
        const token = generateToken(user._id);
        setTokenCookie(res, token);

        // Non-blocking welcome email
        sendWelcomeEmail(user.email, user.name).catch(() => { });

        res.status(201).json({
            success: true,
            user: { _id: user._id, name: user.name, email: user.email, onboardingComplete: user.onboardingComplete },
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const token = generateToken(user._id);
        setTokenCookie(res, token);

        res.json({
            success: true,
            user: { _id: user._id, name: user.name, email: user.email, onboardingComplete: user.onboardingComplete },
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
    const redirectUrl = req.user.onboardingComplete
        ? `${process.env.FRONTEND_URL}/dashboard`
        : `${process.env.FRONTEND_URL}/onboarding`;
    res.redirect(redirectUrl);
};

module.exports = { register, login, logout, googleCallback };
