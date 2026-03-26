import { useState, useEffect, useCallback } from "react";
import { TabWedding } from "../../components/admin/TabWeddingInfo";
import { TabFeatures } from "../../components/admin/TabFeatures";
import { TabUsers } from "../../components/admin/TabUsers";
import { TabWhatsApp } from "../../components/admin/TabWhatsApp";
import { TabSecurity } from "../../components/admin/TabSecurity";
import { apiClient } from "../../services/apiClient";

// ─── API ─────────────────────────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
export const API = {
  getSettings: () => apiClient.get("/api/admin/settings"),
  saveSettings: (body) => apiClient.put("/api/admin/settings", body),

  getUsers: () => apiClient.get("/api/admin/users"),
  createUser: (body) => apiClient.post("/api/admin/users", body),
  updateUser: (id, body) => apiClient.put(`/api/admin/users/${id}`, body),
  deleteUser: (id) => apiClient.delete(`/api/admin/users/${id}`),

  changePassword: (body) => apiClient.post("/api/admin/change-password", body),
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto border
          ${t.type === "success" ? "bg-gray-900 text-white border-gray-700" : ""}
          ${t.type === "error" ? "bg-red-900 text-red-100 border-red-700" : ""}
          ${t.type === "info" ? "bg-blue-900 text-blue-100 border-blue-700" : ""}
        `}
        >
          {t.type === "success" && <span className="text-emerald-400">✓</span>}
          {t.type === "error" && <span className="text-red-400">✕</span>}
          {t.type === "info" && <span className="text-blue-300">ℹ</span>}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: "wedding", label: "Wedding", icon: "💍" },
  { id: "features", label: "Features", icon: "⚙️" },
  { id: "users", label: "Users", icon: "👥" },
  { id: "whatsapp", label: "WhatsApp", icon: "💬" },
  { id: "security", label: "Security", icon: "🔒" },
];

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("wedding");
  const [settings, setSettings] = useState({});
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toasts, push } = useToast();

  // Load settings
  useEffect(() => {
    (async () => {
      try {
        const data = await API.getSettings();
        setSettings(data.settings || data || {});
      } catch {
        push("Failed to load settings", "error");
      } finally {
        setLoadingSettings(false);
      }
    })();
  }, []);

  const handleChange = (key, value) =>
    setSettings((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await API.saveSettings(settings);
      if (res.error) {
        push(res.error, "error");
        return;
      }
      push("Settings saved successfully", "success");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Toast toasts={toasts} />
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-0 border-b border-gray-100">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Configure your wedding invitation application
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all
                  ${
                    activeTab === tab.id
                      ? "border-gray-900 text-gray-900"
                      : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
                  }`}
              >
                <span className="text-base leading-none">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-8">
          {loadingSettings ? (
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
              Loading settings…
            </div>
          ) : (
            <>
              {activeTab === "wedding" && (
                <TabWedding
                  settings={settings}
                  onChange={handleChange}
                  onSave={handleSave}
                  saving={saving}
                />
              )}
              {activeTab === "features" && (
                <TabFeatures
                  settings={settings}
                  onChange={handleChange}
                  onSave={handleSave}
                  saving={saving}
                />
              )}
              {activeTab === "users" && <TabUsers push={push} />}
              {activeTab === "whatsapp" && (
                <TabWhatsApp
                  settings={settings}
                  onChange={handleChange}
                  onSave={handleSave}
                  saving={saving}
                />
              )}
              {activeTab === "security" && <TabSecurity push={push} />}
            </>
          )}
        </div>
      </div>
    </>
  );
};
