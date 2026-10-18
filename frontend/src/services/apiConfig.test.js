import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { PRODUCTION_API_BASE_URL, PRODUCTION_API_ORIGIN, resolveApiBaseUrl } from './apiConfig.js';

const productionLocation = {
    protocol: 'https:',
    hostname: 'adaptive-fitness-seven.vercel.app',
    origin: 'https://adaptive-fitness-seven.vercel.app',
};

test('routes production API calls through the same-origin proxy', () => {
    assert.equal(
        resolveApiBaseUrl(`${PRODUCTION_API_ORIGIN}/api/`, true, productionLocation),
        PRODUCTION_API_BASE_URL,
    );
});

test('uses the same-origin proxy when the Vercel API variable is unset', () => {
    assert.equal(resolveApiBaseUrl('', true, productionLocation), PRODUCTION_API_BASE_URL);
});

test('accepts a relative /api production setting', () => {
    assert.equal(resolveApiBaseUrl('/api', true, productionLocation), PRODUCTION_API_BASE_URL);
});

test('keeps the same-host local development API fallback', () => {
    assert.equal(
        resolveApiBaseUrl(undefined, false, { protocol: 'http:', hostname: '127.0.0.1', origin: 'http://127.0.0.1:5173' }),
        'http://127.0.0.1:5000/api',
    );
});

test('rejects a duplicated API path instead of sending malformed requests', () => {
    assert.throws(
        () => resolveApiBaseUrl('https://api.example.com/api/api', true, productionLocation),
        /only one \/api path segment/,
    );
});

test('rejects insecure API URLs in production', () => {
    assert.throws(
        () => resolveApiBaseUrl('http://api.example.com/api', true, productionLocation),
        /must use HTTPS in production/,
    );
});

test('rewrites API requests to Render before the SPA fallback', () => {
    const config = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'));
    assert.deepEqual(config.rewrites[0], {
        source: '/api/:path*',
        destination: `${PRODUCTION_API_ORIGIN}/api/:path*`,
    });
    assert.deepEqual(config.rewrites[1], {
        source: '/(.*)',
        destination: '/index.html',
    });
});
