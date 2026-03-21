class ApiCache {
  constructor() {
    this.cache = new Map();
    this.pending = new Map();
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  set(key, data, ttlMs = 60000) { // Default 1 minute
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // De-duplication: if a request for this key is already in progress, return that promise
  async fetch(key, fetcher, ttlMs = 60000) {
    const cached = this.get(key);
    if (cached) return cached;

    if (this.pending.has(key)) {
      return this.pending.get(key);
    }

    const promise = fetcher().then(data => {
      this.set(key, data, ttlMs);
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
