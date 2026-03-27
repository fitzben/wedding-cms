import { useState, useEffect, useCallback } from "react";
import { TabOurJourney } from "../../components/admin/TabOurJourney";
import { apiClient } from "../../services/apiClient";
import { Toast } from "../../components/admin/components";

// ─── API ─────────────────────────────────────────────────────────────────────
const API = {
  // Journey items
  getItems: () => apiClient.get("/api/admin/journey"),
  createItem: (body) => apiClient.post("/api/admin/journey", body),
  updateItem: (id, body) => apiClient.put(`/api/admin/journey/${id}`, body),
  deleteItem: (id) => apiClient.delete(`/api/admin/journey/${id}`),
  reorderItems: (ids) => apiClient.post("/api/admin/journey/reorder", { ids }),

  // journey_background lives in settings
  getSettings: () => apiClient.get("/api/admin/settings"),
  saveSettings: (body) => apiClient.put("/api/admin/settings", body),
};

// ─── Toast Hook ───────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}

export const AdminOurJourney = () => {
  const [items, setItems] = useState([]);
  const [journeyBackground, setJourneyBackground] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toasts, push } = useToast();

  // ─── Load items + background ────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [itemsRes, settingsRes] = await Promise.all([
          API.getItems(),
          API.getSettings(),
        ]);
        setItems(itemsRes.items || []);
        const s = settingsRes.settings || settingsRes || {};
        setJourneyBackground(s.journey_background ?? "");
      } catch (err) {
        console.error(err);
        push("Failed to load journey data", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [push]);

  // ─── Background: save to settings ───────────────────────────────────────
  const handleBackgroundChange = (value) => setJourneyBackground(value);

  const handleSaveBackground = async () => {
    setSaving(true);
    try {
      const res = await API.saveSettings({
        journey_background: journeyBackground,
      });
      if (res.error) {
        push(res.error, "error");
        return;
      }
      push("Background saved", "success");
    } catch (err) {
      console.error(err);
      push("Failed to save background", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Add item ────────────────────────────────────────────────────────────
  const handleAddItem = async (form) => {
    try {
      const created = await API.createItem(form);
      if (created.error) {
        push(created.error, "error");
        return;
      }
      setItems((p) => [...p, created]);
      push("Card added", "success");
    } catch (err) {
      console.error(err);
      push("Failed to add card", "error");
    }
  };

  // ─── Edit item ───────────────────────────────────────────────────────────
  const handleEditItem = async (id, form) => {
    try {
      const updated = await API.updateItem(id, form);
      if (updated.error) {
        push(updated.error, "error");
        return;
      }
      setItems((p) => p.map((item) => (item.id === id ? updated : item)));
      push("Card updated", "success");
    } catch (err) {
      console.error(err);
      push("Failed to update card", "error");
    }
  };

  // ─── Delete item ─────────────────────────────────────────────────────────
  const handleDeleteItem = async (id) => {
    try {
      await API.deleteItem(id);
      setItems((p) => p.filter((item) => item.id !== id));
      push("Card deleted", "success");
    } catch (err) {
      console.error(err);
      push("Failed to delete card", "error");
    }
  };

  // ─── Reorder items ───────────────────────────────────────────────────────
  const handleReorder = async (newItems) => {
    // Optimistic update
    setItems(newItems);
    try {
      await API.reorderItems(newItems.map((i) => i.id));
    } catch (err) {
      console.error(err);
      push("Failed to save order", "error");
    }
  };

  return (
    <>
      <Toast toasts={toasts} />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Our Journey</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Manage your relationship timeline and milestones
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        {loading ? (
          <div className="py-16 flex items-center justify-center text-gray-400 gap-2">
            <svg
              className="animate-spin w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Loading journey data…
          </div>
        ) : (
          <TabOurJourney
            items={items}
            journeyBackground={journeyBackground}
            onBackgroundChange={handleBackgroundChange}
            onSaveBackground={handleSaveBackground}
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onReorder={handleReorder}
            saving={saving}
            push={push}
          />
        )}
      </div>
    </>
  );
};
