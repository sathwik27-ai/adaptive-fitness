export function shouldClearSession(result, wasAuthenticated) {
    return wasAuthenticated
        && result.error?.status === 401
        && result.error.data?.code === 'SESSION_INVALID';
}
