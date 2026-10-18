const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        algorithm: 'HS256',
    });
};

const getTokenCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
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

module.exports = { generateToken, setTokenCookie, clearTokenCookie };
