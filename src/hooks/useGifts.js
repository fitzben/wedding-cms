import { useState, useCallback } from "react";
import { apiClient } from "../services/apiClient";

export default function useGifts() {
  const [gifts, setGifts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const fetchGifts = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        ...params.filters,
      }).toString();
      const res = await apiClient.get(`/api/admin/gifts?${q}`);
      setGifts(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 20, total: 0 });
    } catch (err) {
      console.error("Failed to fetch gifts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/admin/gifts/summary");
      setSummary(res);
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  }, []);

  const createGift = useCallback(async (body) => {
    return apiClient.post("/api/admin/gifts", body);
  }, []);

  const updateGift = useCallback(async (id, body) => {
    return apiClient.put(`/api/admin/gifts/${id}`, body);
  }, []);

  const deleteGift = useCallback(async (id) => {
    return apiClient.delete(`/api/admin/gifts/${id}`);
  }, []);

  return {
    gifts,
    summary,
    loading,
    pagination,
    fetchGifts,
    fetchSummary,
    createGift,
    updateGift,
    deleteGift,
  };
}
