class ApiCache {
  constructor() {
    this.cache = new Map();
    this.pending = new Map();
  }

  get(key) {
    // 1. Check memory cache
    const item = this.cache.get(key);
    if (item) {
      if (Date.now() > item.expiry) {
        this.cache.delete(key);
      } else {
        return item.data;
      }
    }

    // 2. Check localStorage if enabled for this key
    const persistent = localStorage.getItem(`api_cache_${key}`);
    if (persistent) {
      try {
        const { data, expiry } = JSON.parse(persistent);
        if (Date.now() > expiry) {
          localStorage.removeItem(`api_cache_${key}`);
          return null;
        }
        // Also populate memory cache for faster subsequent access
        this.cache.set(key, { data, expiry });
        return data;
      } catch (e) {
        localStorage.removeItem(`api_cache_${key}`);
      }
    }

    return null;
  }

  set(key, data, ttlMs = 60000, useLocalStorage = false) { // Default 1 minute
    const expiry = Date.now() + ttlMs;
    const item = { data, expiry };

    // Set in memory
    this.cache.set(key, item);

    // Set in localStorage if requested
    if (useLocalStorage) {
      localStorage.setItem(`api_cache_${key}`, JSON.stringify(item));
    }
  }

  delete(key) {
    this.cache.delete(key);
    localStorage.removeItem(`api_cache_${key}`);
  }

  clear() {
    this.cache.clear();
    // Only clear localStorage items that we managed
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('api_cache_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // De-duplication: if a request for this key is already in progress, return that promise
  async fetch(key, fetcher, options = {}) {
    // Standardize options
    const ttlMs = typeof options === 'number' ? options : (options.ttlMs || 60000);
    const useLocalStorage = options.useLocalStorage || false;

    const cached = this.get(key);
    if (cached) return cached;

    if (this.pending.has(key)) {
      return this.pending.get(key);
    }

    const promise = fetcher().then(data => {
      this.set(key, data, ttlMs, useLocalStorage);
      this.pending.delete(key);
      return data;
    }).catch(err => {
      this.pending.delete(key);
      throw err;
    });

    this.pending.set(key, promise);
    return promise;
  }
}

export const apiCache = new ApiCache();
