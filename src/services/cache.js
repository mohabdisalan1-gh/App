const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCached(key) {
    const item = cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
    }

    return item.value;
}

export function setCached(key, value) {
    cache.set(key, {
        value,
        expiry: Date.now() + CACHE_DURATION
    });
}

export function clearCache(keyPrefix) {
    if (!keyPrefix) {
        cache.clear();
        return;
    }
    for (const key of cache.keys()) {
        if (key.startsWith(keyPrefix)) {
            cache.delete(key);
        }
    }
}
