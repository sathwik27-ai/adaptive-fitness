import assert from 'node:assert/strict';
import test from 'node:test';
import { PRODUCTION_API_BASE_URL, resolveApiBaseUrl } from './apiConfig.js';

const localLocation = { protocol: 'http:', hostname: 'localhost' };

test('uses the configured production API URL without duplicating /api', () => {
    assert.equal(
        resolveApiBaseUrl('https://adaptive-fitness-viux.onrender.com/api/', true, localLocation),
        PRODUCTION_API_BASE_URL,
    );
});

test('falls back to the deployed API in production when Vercel has no build variable', () => {
    assert.equal(resolveApiBaseUrl('', true, localLocation), PRODUCTION_API_BASE_URL);
});

test('keeps the same-host local development API fallback', () => {
    assert.equal(
        resolveApiBaseUrl(undefined, false, { protocol: 'http:', hostname: '127.0.0.1' }),
        'http://127.0.0.1:5000/api',
    );
});

test('rejects a duplicated API path instead of sending malformed requests', () => {
    assert.throws(
        () => resolveApiBaseUrl('https://api.example.com/api/api', true, localLocation),
        /only one \/api path segment/,
    );
});

test('rejects insecure API URLs in production', () => {
    assert.throws(
        () => resolveApiBaseUrl('http://api.example.com/api', true, localLocation),
        /must use HTTPS in production/,
    );
});
