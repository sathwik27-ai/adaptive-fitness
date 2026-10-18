const DRAFT_PREFIX = 'adaptive-fitness:onboarding:';

export function getOnboardingDraftKey(userId) {
    return userId ? `${DRAFT_PREFIX}${userId}` : null;
}

export function loadOnboardingDraft(storage, key) {
    if (!key) return null;
    const serialized = storage.getItem(key);
    if (!serialized) return null;

    try {
        const draft = JSON.parse(serialized);
        if (
            !draft
            || !Number.isInteger(draft.step)
            || draft.step < 0
            || draft.step > 3
            || !draft.formData
            || typeof draft.formData !== 'object'
            || !Array.isArray(draft.equipment)
        ) {
            storage.removeItem(key);
            return null;
        }
        return draft;
    } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
        storage.removeItem(key);
        return null;
    }
}

export function saveOnboardingDraft(storage, key, draft) {
    if (key) storage.setItem(key, JSON.stringify(draft));
}

export function clearOnboardingDraft(storage, key) {
    if (key) storage.removeItem(key);
}
