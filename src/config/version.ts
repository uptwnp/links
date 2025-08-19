export const APP_VERSION = '1.0.1';
export const CACHE_VERSION = `v${APP_VERSION}`;
export const BUILD_TIMESTAMP = new Date().toISOString();

// Force cache refresh when version changes
export const getCacheKey = (key: string) => `${key}_${CACHE_VERSION}`;