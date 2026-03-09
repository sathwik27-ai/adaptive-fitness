const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

// Extract JWT from HTTP-only cookie
const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) token = req.cookies['token'];
    return token;
};

// JWT Strategy
passport.use(new JwtStrategy(
    {
        jwtFromRequest: cookieExtractor,
        secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
        try {
            const user = await User.findById(payload.id).select('-password');
            if (!user) return done(null, false);
            return done(null, user);
        } catch (err) {
            return done(err, false);
        }
    }
));

// Google OAuth2 Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id') {
    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ oauthId: profile.id, oauthProvider: 'google' });
                if (!user) {
                    user = await User.create({
                        name: profile.displayName,
                        email: profile.emails?.[0]?.value,
                        oauthProvider: 'google',
                        oauthId: profile.id,
                        avatar: profile.photos?.[0]?.value || '',
                    });
                }
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    ));
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_ID !== 'your-facebook-app-id') {
    passport.use(new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5000/api/auth/facebook/callback',
            profileFields: ['id', 'displayName', 'emails', 'photos'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ oauthId: profile.id, oauthProvider: 'facebook' });
                if (!user) {
                    user = await User.create({
                        name: profile.displayName,
                        email: profile.emails?.[0]?.value,
                        oauthProvider: 'facebook',
                        oauthId: profile.id,
                        avatar: profile.photos?.[0]?.value || '',
                    });
                }
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    ));
}

module.exports = passport;
