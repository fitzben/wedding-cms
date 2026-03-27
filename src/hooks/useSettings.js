import { useState, useEffect, useRef } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Module-level cache — persists across renders and navigations within the same session
// Shared between all useSettings() callers so only one fetch happens per session
let _cache = null;
let _promise = null;

function fetchSettings() {
  if (_cache) return Promise.resolve(_cache);
  if (_promise) return _promise;

  _promise = fetch(`${BASE_URL}/api/settings`)
    .then(r => r.json())
    .then(data => {
      _cache = data.settings || data || {};
      _promise = null;
      return _cache;
    })
    .catch(() => {
      _promise = null;
      return {};
    });

  return _promise;
}

/**
 * useSettings — fetch public settings once per session.
 * Only use in pages/components that actually need it (e.g. Home.jsx).
 * Does NOT require SettingsProvider — standalone hook.
 */
export default function useSettings() {
  const [settings, setSettings] = useState(_cache || null);
  const [loading, setLoading] = useState(!_cache);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (_cache) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSettings(_cache);
      setLoading(false);
      return;
    }
    fetchSettings().then(data => {
      if (mounted.current) {
        setSettings(data);
        setLoading(false);
      }
    });
    return () => { mounted.current = false; };
  }, []);

  return { settings: settings || {}, loading };
}