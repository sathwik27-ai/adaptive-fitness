import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldClearSession } from './authErrors.js';

test('clears an established session only for an explicit invalid-session response', () => {
    assert.equal(shouldClearSession({
        error: { status: 401, data: { code: 'SESSION_INVALID' } },
    }, true), true);
});

test('does not clear auth for other 401 responses such as rejected credentials', () => {
    assert.equal(shouldClearSession({
        error: { status: 401, data: { message: 'Invalid credentials' } },
    }, true), false);
});

test('does not let an unauthenticated session probe clear a newer login', () => {
    assert.equal(shouldClearSession({
        error: { status: 401, data: { code: 'SESSION_INVALID' } },
    }, false), false);
});

test('does not clear auth for non-authentication failures', () => {
    assert.equal(shouldClearSession({
        error: { status: 500, data: { message: 'Plan generation failed' } },
    }, true), false);
});
