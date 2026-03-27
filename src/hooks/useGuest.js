import { useState, useEffect } from "react";
import { apiCache } from "../services/apiCache";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MIN_LOADING_MS = 1500;

export default function useGuest(slug) {
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(!!slug);
  const [notFound, setNotFound] = useState(!slug);

  useEffect(() => {
    if (!slug) return;

    // Defer resetting to avoid synchronous setState in effect warning
    const timer = setTimeout(() => {
      setNotFound(false);
      setLoading(true);
    }, 0);

    const started = Date.now();
    const cacheKey = `guest_${slug}`;
    const TTL_5_MIN = 5 * 60 * 1000;

    apiCache.fetch(cacheKey, () => {
      return fetch(`${BASE_URL}/api/guests/slug/${slug}`)
        .then((res) => {
          if (!res.ok) throw new Error('Guest not found');
          return res.json();
        });
    }, { 
      ttlMs: TTL_5_MIN, 
      useLocalStorage: true 
    })
    .then((data) => {
      const elapsed = Date.now() - started;
      const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
      setTimeout(() => {
        setGuest(data);
        setNotFound(!data);
        setLoading(false);
      }, remaining);
    })
    .catch((err) => {
      console.error('Error fetching guest:', err);
      const elapsed = Date.now() - started;
      const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
      setTimeout(() => {
        setGuest(null);
        setNotFound(true);
        setLoading(false);
      }, remaining);
    });

    return () => clearTimeout(timer);
  }, [slug]);

  return { guest, loading, notFound };
}
