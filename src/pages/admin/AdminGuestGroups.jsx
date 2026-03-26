import { useState, useEffect, useRef, useCallback } from "react";
import * as authService from "../../services/authService";
import { apiClient } from "../../services/apiClient";

const API = {
  list: () => apiClient.get("/api/admin/guest-groups"),
  create: (body) => apiClient.post("/api/admin/guest-groups", body),
  update: (id, body) => apiClient.put(`/api/admin/guest-groups/${id}`, body),
  remove: (id) => apiClient.delete(`/api/admin/guest-groups/${id}`),
  guestCount: (groupId) =>
    apiClient
      .get(`/api/admin/guests?guest_group_id=${groupId}&limit=1`)
      .then((d) => d.total || 0)
      .catch(() => 0),
};

// ─── Toast ───────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
  }, []);
  return { toasts, push };
}
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto transition-all duration-300
          ${t.type === "success" ? "bg-emerald-900 text-emerald-100 border border-emerald-700" : ""}
          ${t.type === "error" ? "bg-red-900 text-red-100 border border-red-700" : ""}
          ${t.type === "info" ? "bg-gray-800 text-gray-100 border border-gray-600" : ""}`}
        >
          {t.type === "success" && <span>✓</span>}
          {t.type === "error" && <span>✕</span>}
          {t.type === "info" && <span>ℹ</span>}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm mx-4 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all shadow-sm"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Group Modal ──────────────────────────────────────────────────────────────
const EMPTY_FORM = { name: "", description: "", default_event_access: "both" };

function GroupModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const nameRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name || "",
              description: initial.description || "",
              default_event_access: initial.default_event_access || "both",
            }
          : EMPTY_FORM,
      );
      setError("");
      setTimeout(() => nameRef.current?.focus(), 80);
    }
  }, [open, initial]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Nama group harus diisi");
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {initial ? "Edit Group" : "Tambah Guest Group"}
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {initial
                ? "Ubah nama atau deskripsi group"
                : "Contoh: Keluarga Mama, Rekan Kerja Papa"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Nama Group <span className="text-red-400">*</span>
            </label>
            <input
              ref={nameRef}
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }));
                setError("");
              }}
              placeholder="e.g. Keluarga Mama, Rekan Kerja Papa"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Deskripsi
              <span className="ml-1.5 text-gray-300 font-normal normal-case tracking-normal">
                opsional
              </span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="e.g. Saudara dan keluarga dari pihak ibu mempelai wanita"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Event Access */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Akses Acara
              <span className="ml-1.5 text-gray-300 font-normal normal-case tracking-normal">
                default untuk semua anggota group
              </span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "both", label: "HM + Resepsi", icon: "🎊" },
                { value: "hm_only", label: "HM Only", icon: "⛪" },
                { value: "resepsi_only", label: "Resepsi Only", icon: "🥂" },
              ].map(({ value, label, icon }) => (
                <label
                  key={value}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium cursor-pointer transition-all select-none
                    ${
                      form.default_event_access === value
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <input
                    type="radio"
                    name="default_event_access"
                    value={value}
                    checked={form.default_event_access === value}
                    onChange={() =>
                      setForm((p) => ({ ...p, default_event_access: value }))
                    }
                    className="sr-only"
                  />
                  {icon} {label}
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Tamu dalam group ini akan diundang sesuai pilihan ini, kecuali ada
              override per-tamu.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 pb-7 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm disabled:opacity-60 flex items-center gap-2"
          >
            {saving && (
              <svg
                className="animate-spin w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
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
            )}
            {saving
              ? "Menyimpan…"
              : initial
                ? "Simpan Perubahan"
                : "Tambah Group"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const AdminGuestGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editGroup, setEditGroup] = useState(null);
  const [confirm, setConfirm] = useState({ open: false });
  const { toasts, push } = useToast();

  const user = authService.getAdminUser();
  const isAdmin = user?.role === "admin" || user?.role === "parents";

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await API.list();
      setGroups(r.groups || []);
    } catch {
      setError("Gagal memuat data group");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const openCreate = () => {
    setEditGroup(null);
    setModalOpen(true);
  };
  const openEdit = (g) => {
    setEditGroup(g);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    if (editGroup) {
      const res = await API.update(editGroup.id, form);
      if (res.error) throw new Error(res.error);
      push("Group berhasil diperbarui", "success");
    } else {
      const res = await API.create(form);
      if (res.error) throw new Error(res.error);
      push("Group berhasil ditambahkan", "success");
    }
    fetchGroups();
  };

  const handleDelete = (group) => {
    setConfirm({
      open: true,
      title: "Hapus Group",
      message: `Yakin hapus group "${group.name}"? Tamu yang terdaftar di group ini tidak akan ikut terhapus.`,
      onConfirm: async () => {
        setConfirm({ open: false });
        const res = await API.remove(group.id);
        if (!res.ok && res.status !== 204) {
          push("Gagal menghapus group", "error");
          return;
        }
        push("Group dihapus", "success");
        fetchGroups();
      },
    });
  };

  return (
    <>
      <Toast toasts={toasts} />
      <ConfirmDialog
        {...confirm}
        onCancel={() => setConfirm({ open: false })}
      />
      <GroupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editGroup}
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Guest Groups</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {groups.length} group · Kelompokkan tamu berdasarkan hubungan
                atau asal
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={openCreate}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Tambah Group
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-16 flex items-center justify-center text-gray-400">
              <span className="inline-flex items-center gap-2 text-sm">
                <svg
                  className="animate-spin w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
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
                Memuat groups…
              </span>
            </div>
          ) : groups.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-4 text-gray-400">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-600">
                  Belum ada guest group
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Buat group untuk mengelompokkan tamu
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={openCreate}
                  className="mt-1 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm"
                >
                  Tambah Group Pertama →
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isAdmin={isAdmin}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}

              {/* Add new card shortcut */}
              {isAdmin && (
                <button
                  onClick={openCreate}
                  className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50/50 transition-all min-h-[120px]"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-sm font-semibold">Tambah Group</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─── Group Card ───────────────────────────────────────────────────────────────
function GroupCard({ group, isAdmin, onEdit, onDelete }) {
  const [count, setCount] = useState(null);

  useEffect(() => {
    API.guestCount(group.id).then(setCount);
  }, [group.id]);

  // Generate a consistent soft color from name
  const colors = [
    "bg-indigo-50 border-indigo-100 text-indigo-700",
    "bg-violet-50 border-violet-100 text-violet-700",
    "bg-sky-50 border-sky-100 text-sky-700",
    "bg-emerald-50 border-emerald-100 text-emerald-700",
    "bg-amber-50 border-amber-100 text-amber-700",
    "bg-rose-50 border-rose-100 text-rose-700",
    "bg-teal-50 border-teal-100 text-teal-700",
    "bg-orange-50 border-orange-100 text-orange-700",
  ];
  const colorIdx =
    group.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
    colors.length;
  const colorCls = colors[colorIdx];

  return (
    <div className="group flex flex-col gap-3 p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-md hover:border-gray-200 transition-all">
      {/* Icon + Name */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${colorCls}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{group.name}</p>
            {group.description && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                {group.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {isAdmin && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => onEdit(group)}
              title="Edit group"
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={() => onDelete(group)}
              title="Hapus group"
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Guest count + event access */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-50 gap-2">
        <div className="flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span className="text-xs text-gray-500">
            {count === null ? (
              <span className="text-gray-300">Menghitung…</span>
            ) : (
              <>
                <span className="font-bold text-gray-700">{count}</span> tamu
              </>
            )}
          </span>
        </div>
        <EventAccessBadge access={group.default_event_access} />
      </div>
    </div>
  );
}

// ─── Event Access Badge ───────────────────────────────────────────────────────
function EventAccessBadge({ access }) {
  const map = {
    both: {
      label: "HM + Resepsi",
      cls: "bg-indigo-50 text-indigo-600 border-indigo-100",
      icon: "🎊",
    },
    hm_only: {
      label: "HM Only",
      cls: "bg-sky-50 text-sky-600 border-sky-100",
      icon: "⛪",
    },
    resepsi_only: {
      label: "Resepsi Only",
      cls: "bg-rose-50 text-rose-600 border-rose-100",
      icon: "🥂",
    },
  };
  const { label, cls, icon } = map[access] || map.both;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cls}`}
    >
      {icon} {label}
    </span>
  );
}
