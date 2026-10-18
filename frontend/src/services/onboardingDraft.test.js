import assert from 'node:assert/strict';
import test from 'node:test';
import {
    clearOnboardingDraft,
    getOnboardingDraftKey,
    loadOnboardingDraft,
    saveOnboardingDraft,
} from './onboardingDraft.js';

function createStorage() {
    const values = new Map();
    return {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        removeItem: (key) => values.delete(key),
    };
}

test('stores and restores a draft for the authenticated user only', () => {
    const storage = createStorage();
    const key = getOnboardingDraftKey('user-123');
    const draft = {
        step: 3,
        formData: { age: 30, height: 170, goal: 'maintenance' },
        equipment: ['Yoga Mat'],
    };

    saveOnboardingDraft(storage, key, draft);

    assert.equal(getOnboardingDraftKey('user-456'), 'adaptive-fitness:onboarding:user-456');
    assert.deepEqual(loadOnboardingDraft(storage, key), draft);
    assert.equal(loadOnboardingDraft(storage, getOnboardingDraftKey('user-456')), null);
});

test('discards malformed or out-of-range drafts', () => {
    const storage = createStorage();
    const key = getOnboardingDraftKey('user-123');
    storage.setItem(key, JSON.stringify({ step: 9, formData: {}, equipment: [] }));

    assert.equal(loadOnboardingDraft(storage, key), null);
    assert.equal(storage.getItem(key), null);
});

test('clears the draft after onboarding succeeds', () => {
    const storage = createStorage();
    const key = getOnboardingDraftKey('user-123');
    saveOnboardingDraft(storage, key, { step: 0, formData: {}, equipment: [] });

    clearOnboardingDraft(storage, key);

    assert.equal(loadOnboardingDraft(storage, key), null);
});
