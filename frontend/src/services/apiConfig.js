export const PRODUCTION_API_BASE_URL = 'https://adaptive-fitness-viux.onrender.com/api';

export function resolveApiBaseUrl(configuredUrl, isProduction, location) {
    const fallback = isProduction
        ? PRODUCTION_API_BASE_URL
        : `${location.protocol}//${location.hostname}:5000/api`;
    const parsed = new URL(configuredUrl?.trim() || fallback);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('VITE_API_BASE_URL must use HTTP or HTTPS.');
    }
    if (isProduction && parsed.protocol !== 'https:') {
        throw new Error('VITE_API_BASE_URL must use HTTPS in production.');
    }

    const pathname = parsed.pathname.replace(/\/+$/, '');
    if (pathname.endsWith('/api/api')) {
        throw new Error('VITE_API_BASE_URL must contain only one /api path segment.');
    }
    if (pathname && !pathname.endsWith('/api')) {
        throw new Error('VITE_API_BASE_URL must point to the API root and end in /api.');
    }

    return `${parsed.origin}${pathname || '/api'}`;
}
