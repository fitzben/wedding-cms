import { useState, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export function useJourney() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/journey`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setItems(data.items || []))
      .catch((err) => {
        console.error("Failed to load journey data", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return { items, loading, error };
}