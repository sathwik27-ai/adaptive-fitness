const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        algorithm: 'HS256',
    });
};

const getTokenCookieOptions = () => {
    const isSecureDeployment = process.env.NODE_ENV === 'production'
        || process.env.RENDER === 'true'
        || /^https:\/\//i.test(process.env.RENDER_EXTERNAL_URL || '');
    return {
        httpOnly: true,
        secure: isSecureDeployment,
        sameSite: isSecureDeployment ? 'none' : 'lax',
        path: '/',
    };
};

const setTokenCookie = (res, token) => {
    res.cookie('token', token, {
        ...getTokenCookieOptions(),
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

const clearTokenCookie = (res) => {
    res.clearCookie('token', getTokenCookieOptions());
};

module.exports = { generateToken, getTokenCookieOptions, setTokenCookie, clearTokenCookie };
