import { useState, useCallback } from "react";
import { apiClient } from "../services/apiClient";

export default function useGiftRegistry() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/admin/gifts/registry");
      setItems(res.items || res.data || []);
    } catch (err) {
      console.error("Failed to fetch registry items:", err);
      return { error: err.message };
    } finally {
      setLoading(false);
    }
    return { ok: true };
  }, []);

  const createItem = useCallback(async (body) => {
    return apiClient.post("/api/admin/gifts/registry", body);
  }, []);

  const updateItem = useCallback(async (id, body) => {
    return apiClient.put(`/api/admin/gifts/registry/${id}`, body);
  }, []);

  const deleteItem = useCallback(async (id) => {
    return apiClient.delete(`/api/admin/gifts/registry/${id}`);
  }, []);

  const fetchClaims = useCallback(async (id) => {
    return apiClient.get(`/api/admin/gifts/registry/${id}`);
  }, []);

  return {
    items,
    loading,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    fetchClaims,
  };
}
