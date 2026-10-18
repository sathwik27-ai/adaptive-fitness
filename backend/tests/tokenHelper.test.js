const assert = require('node:assert/strict');
const test = require('node:test');
const { getTokenCookieOptions, setTokenCookie, clearTokenCookie } = require('../utils/tokenHelper');

const environmentKeys = ['NODE_ENV', 'RENDER', 'RENDER_EXTERNAL_URL'];

const withEnvironment = (values, callback) => {
    const original = Object.fromEntries(environmentKeys.map((key) => [key, process.env[key]]));
    for (const key of environmentKeys) {
        if (Object.hasOwn(values, key)) process.env[key] = values[key];
        else delete process.env[key];
    }

    try {
        callback();
    } finally {
        for (const key of environmentKeys) {
            if (original[key] === undefined) delete process.env[key];
            else process.env[key] = original[key];
        }
    }
};

test('uses secure cross-site cookies on Render even when NODE_ENV is unset', () => {
    withEnvironment({ RENDER: 'true', RENDER_EXTERNAL_URL: 'https://adaptive-fitness-viux.onrender.com' }, () => {
        assert.deepEqual(getTokenCookieOptions(), {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
        });
    });
});

test('uses secure cross-site cookies for any configured HTTPS Render URL', () => {
    withEnvironment({ RENDER_EXTERNAL_URL: 'https://service.onrender.com' }, () => {
        assert.equal(getTokenCookieOptions().secure, true);
        assert.equal(getTokenCookieOptions().sameSite, 'none');
    });
});

test('keeps local HTTP cookies compatible with development', () => {
    withEnvironment({ NODE_ENV: 'development' }, () => {
        assert.equal(getTokenCookieOptions().secure, false);
        assert.equal(getTokenCookieOptions().sameSite, 'lax');
    });
});

test('sets and clears the token with matching cookie scope', () => {
    withEnvironment({ NODE_ENV: 'production' }, () => {
        let setCookie;
        let clearCookie;
        setTokenCookie({ cookie: (...args) => { setCookie = args; } }, 'test-token');
        clearTokenCookie({ clearCookie: (...args) => { clearCookie = args; } });

        assert.equal(setCookie[0], 'token');
        assert.equal(setCookie[1], 'test-token');
        assert.equal(setCookie[2].httpOnly, true);
        assert.equal(setCookie[2].secure, true);
        assert.equal(setCookie[2].sameSite, 'none');
        assert.equal(clearCookie[0], 'token');
        assert.deepEqual(clearCookie[1], getTokenCookieOptions());
    });
});
