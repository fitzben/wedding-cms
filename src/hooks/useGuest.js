import { useState, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MIN_LOADING_MS = 1500;

export default function useGuest(slug) {
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const started = Date.now();

    const finish = (data) => {
      const elapsed = Date.now() - started;
      const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
      setTimeout(() => {
        if (data !== undefined) setGuest(data);
        setLoading(false);
      }, remaining);
    };

    if (!slug) {
      finish(null);
      return;
    }

    const cacheKey = `guest_${slug}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const data = JSON.parse(cached);
        finish(data);
        return;
      } catch {
        localStorage.removeItem(cacheKey);
      }
    }

    fetch(`${BASE_URL}/api/guests/slug/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        finish(data);
      })
      .catch(() => {
        finish(null);
      });
  }, [slug]);

  return { guest, loading };
}
