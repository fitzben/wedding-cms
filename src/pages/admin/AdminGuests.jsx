import { useState, useEffect, useRef } from "react";
import useAdminGuests from "../../hooks/admin/useAdminGuests";
import { Toast } from "../../components/admin/components";

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger }) {
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
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all shadow-sm
              ${danger ? "bg-red-500 hover:bg-red-600" : "bg-gray-900 hover:bg-gray-800"}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Guest Modal (Create / Edit) ─────────────────────────────────────────────
const CATEGORIES = ["friend", "family", "colleague"];
const PRIORITIES = ["low", "medium", "high"];
const IMPORTANCES = ["normal", "vip", "vvip"];
const INVITE_TYPES = [
  { value: "digital", label: "Digital" },
  { value: "physical", label: "Fisik" },
  { value: "both", label: "Digital + Fisik" },
];
const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  phone_number: "",
  category: "friend",
  pax_allowed: 1,
  priority: "medium",
  importance: "normal",
  notes: "",
  guest_group_id: "",
  invitation_type: "digital",
  event_access_override: "", // '' = inherit from group
  enable_display_name: false,
  display_name: "",
};

const EVENT_ACCESS_OPTIONS = [
  { value: "", label: "Ikut Group", icon: "↩️", hint: true },
  { value: "both", label: "HM + Resepsi", icon: "🎊" },
  { value: "hm_only", label: "HM Only", icon: "⛪" },
  { value: "resepsi_only", label: "Resepsi Only", icon: "🥂" },
];

function GuestModal({ open, onClose, onSave, initial, groups }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const firstRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              first_name:
                initial.first_name || initial.display_name?.split(" ")[0] || "",
              last_name:
                initial.last_name ||
                initial.display_name?.split(" ").slice(1).join(" ") ||
                "",
              phone_number: initial.phone_number || "",
              category: initial.category || "friend",
              pax_allowed: initial.pax_allowed || 1,
              priority: initial.priority || "medium",
              importance: initial.importance || "normal",
              notes: initial.notes || "",
              guest_group_id: initial.guest_group_id || "",
              invitation_type: initial.invitation_type || "digital",
              event_access_override: initial.event_access_override || "",
              enable_display_name: initial.enable_display_name || false,
              display_name: initial.display_name || "",
            }
          : EMPTY_FORM,
      );
      setErrors({});
      setTimeout(() => firstRef.current?.focus(), 80);
    }
  }, [open, initial]);

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "Required";
    if (!form.last_name.trim()) e.last_name = "Required";
    if (!form.phone_number.trim()) e.phone_number = "Required";
    if (form.pax_allowed < 1 || form.pax_allowed > 20) e.pax_allowed = "1–20";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (ev) => {
      let val = ev.target.value;
      if (key === "phone_number" && val.startsWith("0")) {
        val = "62" + val.substring(1);
      }
      setForm((p) => ({ ...p, [key]: val }));
      setErrors((p) => ({ ...p, [key]: "" }));
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:max-w-lg md:mx-4 border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Drag handle — mobile only */}
        <div className="md:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        {/* Header */}
        <div className="px-6 pt-4 pb-4 md:px-7 md:pt-7 md:pb-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {initial ? "Edit Guest" : "Add New Guest"}
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {initial
                ? "Update guest information"
                : "Fill in the details below"}
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
        <div className="px-7 py-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                First Name
              </label>
              <input
                ref={firstRef}
                {...field("first_name")}
                placeholder="e.g. Budi"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none
                  ${errors.first_name ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"}`}
              />
              {errors.first_name && (
                <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Last Name
              </label>
              <input
                {...field("last_name")}
                placeholder="e.g. Santoso"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none
                  ${errors.last_name ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"}`}
              />
              {errors.last_name && (
                <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* Custom Display Name Toggle */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between transition-all hover:bg-gray-100/50">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl">
                🏷️
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Custom Display Name?
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Tampilkan nama khusus di undangan
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  enable_display_name: !p.enable_display_name,
                  // Auto-fill if enabling for the first time
                  display_name:
                    !p.enable_display_name && !p.display_name
                      ? `${p.first_name} ${p.last_name}`.trim()
                      : p.display_name,
                }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-offset-2 focus:ring-2 focus:ring-gray-100
                ${form.enable_display_name ? "bg-gray-900" : "bg-gray-200"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${form.enable_display_name ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>

          {/* Conditional Display Name Input */}
          {form.enable_display_name && (
            <div className="pt-2 border-t border-gray-50 mt-2 transition-all duration-300">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Display Name (Untuk Undangan)
              </label>
              <input
                {...field("display_name")}
                placeholder="e.g. Budi Santoso & Partner"
                className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all bg-white
                  ${errors.display_name ? "border-red-300 bg-red-50" : ""}`}
              />
              <p className="text-[11px] text-gray-400 mt-1.5 flex items-start gap-1">
                <span>ℹ️</span> Ini adalah nama yang akan muncul di sambutan
                "Dear, [Name]" di Home.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Phone Number
            </label>
            <input
              {...field("phone_number")}
              placeholder="e.g. 628123456789"
              type="tel"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none
                ${errors.phone_number ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"}`}
            />
            <p className="text-gray-400 text-xs mt-1">
              Nomor hp dengan awalan 0 otomatis diubah menjadi 62
            </p>
            {errors.phone_number && (
              <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Category
              </label>
              <select
                {...field("category")}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Pax Allowed
              </label>
              <input
                type="number"
                min={1}
                max={20}
                {...field("pax_allowed")}
                onChange={(e) => {
                  setForm((p) => ({
                    ...p,
                    pax_allowed: parseInt(e.target.value) || 1,
                  }));
                  setErrors((p) => ({ ...p, pax_allowed: "" }));
                }}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none
                  ${errors.pax_allowed ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"}`}
              />
              {errors.pax_allowed && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.pax_allowed}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Priority
              </label>
              <select
                {...field("priority")}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all bg-white"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Importance
              </label>
              <select
                {...field("importance")}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all bg-white"
              >
                {IMPORTANCES.map((i) => (
                  <option key={i} value={i}>
                    {i.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Guest Group */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Guest Group
              <span className="ml-1.5 text-gray-300 font-normal normal-case tracking-normal">
                opsional
              </span>
            </label>
            <select
              {...field("guest_group_id")}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all bg-white"
            >
              <option value="">— Tidak ada group —</option>
              {(groups || []).map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event Access Override */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Akses Acara
              <span className="ml-1.5 text-gray-300 font-normal normal-case tracking-normal">
                override per-tamu
              </span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {EVENT_ACCESS_OPTIONS.map(({ value, label, icon, hint }) => {
                // Find group default to show hint
                const group = (groups || []).find(
                  (g) => g.id === form.guest_group_id,
                );
                const groupAccess = group?.default_event_access || "both";
                const accessMap = {
                  both: "HM + Resepsi",
                  hm_only: "HM Only",
                  resepsi_only: "Resepsi Only",
                };
                const hintLabel = hint
                  ? `Ikut Group (${accessMap[groupAccess] || "HM + Resepsi"})`
                  : label;
                return (
                  <label
                    key={value}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium cursor-pointer transition-all select-none
                      ${
                        form.event_access_override === value
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <input
                      type="radio"
                      name="event_access_override"
                      value={value}
                      checked={form.event_access_override === value}
                      onChange={() =>
                        setForm((p) => ({ ...p, event_access_override: value }))
                      }
                      className="sr-only"
                    />
                    {icon} {hintLabel}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Invitation Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Jenis Undangan
            </label>
            <div className="flex gap-2 flex-wrap">
              {INVITE_TYPES.map(({ value, label }) => (
                <label
                  key={value}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium cursor-pointer transition-all select-none
                    ${
                      form.invitation_type === value
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <input
                    type="radio"
                    name="invitation_type"
                    value={value}
                    checked={form.invitation_type === value}
                    onChange={() =>
                      setForm((p) => ({ ...p, invitation_type: value }))
                    }
                    className="sr-only"
                  />
                  {value === "digital" && "📱"}
                  {value === "physical" && "✉️"}
                  {value === "both" && "📱✉️"}
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Notes / Keterangan
              <span className="ml-1.5 text-gray-300 font-normal normal-case tracking-normal">
                opsional
              </span>
            </label>
            <textarea
              {...field("notes")}
              placeholder="e.g. Keluarga dari pihak mempelai wanita, butuh kursi roda..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 md:px-7 md:pb-7 flex gap-3 flex-shrink-0 border-t border-gray-50">
          <button
            onClick={onClose}
            className="flex-1 md:flex-none px-5 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
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
            {saving ? "Saving…" : initial ? "Save Changes" : "Add Guest"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Category Badge ───────────────────────────────────────────────────────────
function CategoryBadge({ value }) {
  const map = {
    family: "bg-purple-50 text-purple-600 border-purple-100",
    colleague: "bg-blue-50 text-blue-600 border-blue-100",
    friend: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };
  const cls = map[value] || map.friend;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize border whitespace-nowrap ${cls}`}>
      {value || "Friend"}
    </span>
  );
}

// ─── Priority Badge ───────────────────────────────────────────────────────────
function PriorityBadge({ value }) {
  const map = {
    high: { cls: "bg-red-50 text-red-600 border-red-100", icon: "↑" },
    medium: { cls: "bg-amber-50 text-amber-600 border-amber-100", icon: "→" },
    low: { cls: "bg-gray-50 text-gray-500 border-gray-200", icon: "↓" },
  };
  const { cls, icon } = map[value] || map.medium;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize border whitespace-nowrap ${cls}`}>
      <span className="text-[10px] leading-none">{icon}</span>
      {value || "Medium"}
    </span>
  );
}

// ─── Importance Badge ─────────────────────────────────────────────────────────
function ImportanceBadge({ value }) {
  const map = {
    vvip: "bg-yellow-50 text-yellow-700 border-yellow-200",
    vip: "bg-orange-50 text-orange-600 border-orange-100",
    normal: "bg-gray-50 text-gray-500 border-gray-200",
  };
  const cls = map[value] || map.normal;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border whitespace-nowrap ${cls}`}>
      {value || "Normal"}
    </span>
  );
}

// ─── Invitation Type Badge ────────────────────────────────────────────────────
function InvitationTypeBadge({ value }) {
  const map = {
    digital: {
      cls: "bg-blue-50 text-blue-600 border-blue-100",
      label: "📱 Digital",
    },
    physical: {
      cls: "bg-amber-50 text-amber-600 border-amber-100",
      label: "✉️ Fisik",
    },
    both: {
      cls: "bg-purple-50 text-purple-600 border-purple-100",
      label: "📱✉️ Both",
    },
  };
  const { cls, label } = map[value] || map.digital;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

// ─── Event Access Badge ──────────────────────────────────────────────────────
function EventAccessBadge({ access, isOverride = false }) {
  const map = {
    both: {
      cls: "bg-indigo-50 text-indigo-600 border-indigo-100",
      label: "HM+Resepsi",
      icon: "🎊",
    },
    hm_only: {
      cls: "bg-sky-50 text-sky-600 border-sky-100",
      label: "HM Only",
      icon: "⛪",
    },
    resepsi_only: {
      cls: "bg-rose-50 text-rose-600 border-rose-100",
      label: "Resepsi",
      icon: "🥂",
    },
  };
  const { cls, label, icon } = map[access] || map.both;
  return (
    <span
      title={isOverride ? `${label} (override)` : label}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${cls}`}
    >
      {icon} {label}
      {isOverride && (
        <span className="opacity-50 text-[9px]">*</span>
      )}
    </span>
  );
}

// ─── Export CSV ───────────────────────────────────────────────────────────────
function exportCSV(guests) {
  const header = [
    "Name",
    "Slug",
    "Phone",
    "Category",
    "Pax",
    "Priority",
    "Importance",
    "Notes",
  ];
  const rows = guests.map((g) => [
    `"${g.display_name || ""}"`,
    g.slug || "",
    g.phone_number || "",
    g.category || "friend",
    g.pax_allowed || 1,
    g.priority || "medium",
    g.importance || "normal",
    `"${(g.notes || "").replace(/"/g, '""')}"`,
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "guests.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const AdminGuests = () => {
  const {
    guests,
    loading,
    error,
    total,
    page,
    setPage,
    searchInput,
    setSearchInput,
    search,
    showDeleted,
    setShowDeleted,
    groups,
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,
    showFilters,
    setShowFilters,
    limit,
    selected,
    allSelected,
    toggleAll,
    toggleOne,
    modalOpen,
    setModalOpen,
    editGuest,
    openCreate,
    openEdit,
    handleSave,
    handleBulkDelete,
    handleDelete,
    handleRestore,
    copyLink,
    copyLinkWithMessage,
    openWhatsApp,
    handleMarkInvited,
    totalPages,
    toasts,
    confirm,
    setConfirm,
    isAdmin,
  } = useAdminGuests();

  const [copyMenu, setCopyMenu] = useState(null); // { guest, x, y } or null
  const openCopyMenu = (e, guest) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCopyMenu({ guest, x: rect.right, y: rect.bottom + 4 });
  };

  return (
    <>
      <Toast toasts={toasts} />

      {/* Copy popover — fixed so not clipped by overflow-x-auto */}
      {copyMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setCopyMenu(null)} />
          <div
            className="fixed z-50 bg-white border border-gray-100 rounded-xl shadow-xl py-1 w-44"
            style={{ top: copyMenu.y, right: window.innerWidth - copyMenu.x }}
          >
            <button
              onClick={() => { copyLink(copyMenu.guest.slug); setCopyMenu(null); }}
              className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-left"
            >
              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Link saja
            </button>
            <button
              onClick={() => { copyLinkWithMessage(copyMenu.guest); setCopyMenu(null); }}
              className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-left"
            >
              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Link + Pesan WA
            </button>
          </div>
        </>
      )}

      <ConfirmDialog
        {...confirm}
        onCancel={() => setConfirm({ open: false })}
      />

      <GuestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editGuest}
        groups={groups}
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* ── Header ── */}
        <div className="px-4 pt-5 pb-4 md:p-8 border-b border-gray-100">
          {/* Mobile top row: title + Add button */}
          <div className="flex items-center justify-between mb-3 md:hidden">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Guests</h1>
              <p className="text-gray-400 text-xs mt-0.5">
                {total} tamu
                {activeFilterCount > 0 ? ` · ${activeFilterCount} filter` : ""}
                {showDeleted ? " · deleted" : ""}
              </p>
            </div>
            {isAdmin && !showDeleted && (
              <button
                onClick={openCreate}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm"
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
                Add
              </button>
            )}
          </div>

          {/* Mobile second row: search + icon buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search guests…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all w-full"
              />
            </div>
            {/* Deleted toggle */}
            <button
              onClick={() => {
                setShowDeleted((v) => !v);
                setPage(1);
              }}
              title={showDeleted ? "Show active" : "Show deleted"}
              className={`p-2.5 rounded-xl border flex-shrink-0 transition-all ${showDeleted ? "bg-red-50 border-red-200 text-red-500" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
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
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`relative p-2.5 rounded-xl border flex-shrink-0 transition-all ${showFilters || activeFilterCount > 0 ? "bg-gray-900 border-gray-900 text-white" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
                />
              </svg>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {/* Bulk delete (appears when items selected) */}
            {selected.size > 0 && isAdmin && (
              <button
                onClick={handleBulkDelete}
                className="relative p-2.5 rounded-xl border border-red-100 bg-red-50 text-red-500 flex-shrink-0"
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
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {selected.size}
                </span>
              </button>
            )}
          </div>

          {/* Desktop layout — unchanged */}
          <div className="hidden md:flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Guests</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {total} tamu
                {activeFilterCount > 0
                  ? ` · ${activeFilterCount} filter aktif`
                  : ""}
                {showDeleted ? " · menampilkan yang dihapus" : ""}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search guests…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all w-52"
                />
              </div>

              {/* Show Deleted Toggle */}
              <button
                onClick={() => {
                  setShowDeleted((v) => !v);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all
                  ${
                    showDeleted
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                title={
                  showDeleted
                    ? "Showing deleted guests — click to show active"
                    : "Show deleted guests"
                }
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
                {showDeleted ? "Deleted" : "Active"}
              </button>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all
                  ${
                    showFilters || activeFilterCount > 0
                      ? "bg-gray-900 border-gray-900 text-white"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
                  />
                </svg>
                Filter
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white text-gray-900 text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Export */}
              <button
                onClick={() => exportCSV(guests)}
                title="Export current page to CSV"
                className="flex items-center gap-1.5 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                CSV
              </button>

              {/* Bulk delete */}
              {selected.size > 0 && isAdmin && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-100 transition-all"
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
                  Delete {selected.size}
                </button>
              )}

              {/* Add guest */}
              {isAdmin && !showDeleted && (
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
                  Add Guest
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div
          className={`border-b border-gray-100 overflow-hidden transition-all duration-200 ${showFilters ? "max-h-[500px]" : "max-h-0"}`}
        >
          <div className="px-6 md:px-8 py-4 flex flex-wrap gap-3 items-end bg-gray-50/50">
            {/* Mobile: 2-col grid wrapper */}
            <div className="grid grid-cols-2 gap-3 w-full md:hidden">
              {[
                {
                  label: "Category",
                  key: "category",
                  opts: ["friend", "family", "colleague"],
                },
                {
                  label: "Priority",
                  key: "priority",
                  opts: ["low", "medium", "high"],
                },
                {
                  label: "Importance",
                  key: "importance",
                  opts: ["normal", "vip", "vvip"],
                  upper: true,
                },
                {
                  label: "Jenis Undangan",
                  key: "invitation_type",
                  custom: [
                    { v: "digital", l: "📱 Digital" },
                    { v: "physical", l: "✉️ Fisik" },
                    { v: "both", l: "📱✉️ Keduanya" },
                  ],
                },
              ].map(({ label, key, opts, upper, custom }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {label}
                  </label>
                  <select
                    value={filters[key] ?? ""}
                    onChange={(e) => setFilter(key, e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-gray-400 outline-none transition-all w-full"
                  >
                    <option value="">Semua</option>
                    {custom
                      ? custom.map(({ v, l }) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))
                      : opts.map((o) => (
                          <option key={o} value={o}>
                            {upper
                              ? o.toUpperCase()
                              : o.charAt(0).toUpperCase() + o.slice(1)}
                          </option>
                        ))}
                  </select>
                </div>
              ))}
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Group
                </label>
                <select
                  value={filters.guest_group_id ?? ""}
                  onChange={(e) => setFilter("guest_group_id", e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-gray-400 outline-none transition-all w-full"
                >
                  <option value="">Semua Group</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold"
                >
                  <svg
                    className="w-3.5 h-3.5"
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
                  Reset filter
                </button>
              )}
            </div>

            {/* Desktop: original flex-wrap layout */}
            <div className="hidden md:flex flex-wrap gap-3 items-end w-full">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilter("category", e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-gray-400 outline-none transition-all"
                >
                  <option value="">Semua</option>
                  {["friend", "family", "colleague"].map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilter("priority", e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-gray-400 outline-none transition-all"
                >
                  <option value="">Semua</option>
                  {["low", "medium", "high"].map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Importance */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Importance
                </label>
                <select
                  value={filters.importance}
                  onChange={(e) => setFilter("importance", e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-gray-400 outline-none transition-all"
                >
                  <option value="">Semua</option>
                  {["normal", "vip", "vvip"].map((i) => (
                    <option key={i} value={i}>
                      {i.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Guest Group */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Group
                </label>
                <select
                  value={filters.guest_group_id}
                  onChange={(e) => setFilter("guest_group_id", e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-gray-400 outline-none transition-all max-w-[180px]"
                >
                  <option value="">Semua Group</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Invitation Type */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Jenis Undangan
                </label>
                <select
                  value={filters.invitation_type}
                  onChange={(e) => setFilter("invitation_type", e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-gray-400 outline-none transition-all"
                >
                  <option value="">Semua</option>
                  <option value="digital">📱 Digital</option>
                  <option value="physical">✉️ Fisik</option>
                  <option value="both">📱✉️ Keduanya</option>
                </select>
              </div>

              {/* Clear filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-all self-end"
                >
                  <svg
                    className="w-3.5 h-3.5"
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
                  Reset filter
                </button>
              )}
            </div>
            {/* end desktop filter wrapper */}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="p-0 md:p-8">
          {error && (
            <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
              {error}
            </div>
          )}

          {/* ── Desktop Table ── */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-2.5 px-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Name</th>
                  <th className="py-2.5 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Phone</th>
                  <th className="py-2.5 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Group</th>
                  <th className="py-2.5 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Cat.</th>
                  <th className="py-2.5 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Priority</th>
                  <th className="py-2.5 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">IMP</th>
                  <th className="py-2.5 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">Pax</th>
                  <th className="py-2.5 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Undangan</th>
                  <th className="py-2.5 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Akses</th>
                  <th className="py-2.5 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">Note</th>
                  <th className="py-2.5 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="11"
                      className="py-14 text-center text-gray-400"
                    >
                      <span className="inline-flex items-center gap-2">
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
                        Loading guests…
                      </span>
                    </td>
                  </tr>
                ) : guests.length === 0 ? (
                  <tr>
                    <td
                      colSpan="11"
                      className="py-14 text-center text-gray-400"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <svg
                          className="w-10 h-10 text-gray-200"
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
                        <span className="text-sm">
                          {search
                            ? `No guests found for "${search}"`
                            : "No guests yet. Add your first one!"}
                        </span>
                        {!search && (
                          <button
                            onClick={openCreate}
                            className="mt-1 text-sm font-semibold text-gray-900 underline underline-offset-2 hover:no-underline transition-all"
                          >
                            Add Guest →
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  guests.map((guest) => {
                    const groupName = groups.find(
                      (g) => g.id === guest.guest_group_id,
                    )?.name;
                    const isDeleted = !!guest.deleted_at;
                    return (
                      <tr
                        key={guest.id}
                        className={`border-b border-gray-50 transition-colors group
                        ${isDeleted ? "bg-red-50/40 opacity-60" : selected.has(guest.id) ? "bg-gray-50" : "hover:bg-gray-50/60"}`}
                      >
                        {/* Checkbox */}
                        <td className="py-2 px-3">
                          <input
                            type="checkbox"
                            checked={selected.has(guest.id)}
                            onChange={() => toggleOne(guest.id)}
                            className="w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
                          />
                        </td>

                        {/* Name + slug */}
                        <td className="py-2 px-3 max-w-[160px]">
                          <div className="font-semibold text-gray-900 text-sm flex items-center gap-1.5 flex-wrap leading-tight">
                            <span className="truncate">{guest.display_name}</span>
                            {isDeleted && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-500 border border-red-200 shrink-0">
                                deleted
                              </span>
                            )}
                            {!isDeleted && guest.invite_status === "sent" && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
                                ✓ sent
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5 font-mono truncate">
                            {guest.slug}
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-2 px-3 text-xs text-gray-500 whitespace-nowrap">
                          {guest.phone_number || (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        {/* Group */}
                        <td className="py-2 px-3">
                          {groupName ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] leading-tight font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 inline-block max-w-[100px] break-words">
                              {groupName}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-2 px-3">
                          <CategoryBadge value={guest.category} />
                        </td>

                        {/* Priority */}
                        <td className="py-2 px-3">
                          <PriorityBadge value={guest.priority} />
                        </td>

                        {/* Importance */}
                        <td className="py-2 px-3">
                          <ImportanceBadge value={guest.importance} />
                        </td>

                        {/* Pax */}
                        <td className="py-2 px-3 text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200">
                            {guest.pax_allowed}
                          </span>
                        </td>

                        {/* Undangan */}
                        <td className="py-2 px-3">
                          <InvitationTypeBadge value={guest.invitation_type} />
                        </td>

                        {/* Akses Acara */}
                        <td className="py-2 px-3">
                          <EventAccessBadge
                            access={guest.resolved_event_access || "both"}
                            isOverride={!!guest.event_access_override}
                          />
                        </td>

                        {/* Notes — icon-only with tooltip */}
                        <td className="py-2 px-3 text-center">
                          {guest.notes ? (
                            <span
                              title={guest.notes}
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 border border-amber-200 text-amber-500 cursor-default"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </span>
                          ) : (
                            <span className="text-gray-200">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            {isDeleted ? (
                              isAdmin && (
                                <button
                                  onClick={() =>
                                    handleRestore(guest.id, guest.display_name)
                                  }
                                  title="Restore guest"
                                  className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-all"
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
                                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                  </svg>
                                </button>
                              )
                            ) : (
                              <>
                                {/* WhatsApp */}
                                <button
                                  onClick={() => openWhatsApp(guest)}
                                  title="Kirim undangan via WhatsApp"
                                  className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-all"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                  >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.121.554 4.11 1.523 5.837L.057 23.882a.5.5 0 00.61.61l6.045-1.466A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.7-.497-5.27-1.394l-.38-.22-3.933.954.97-3.934-.24-.392A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                                  </svg>
                                </button>

                                {/* Mark as invited / undo */}
                                <button
                                  onClick={() => handleMarkInvited(guest)}
                                  title={
                                    guest.invite_status === "sent"
                                      ? "Tandai belum diundang"
                                      : "Tandai sudah diundang"
                                  }
                                  className={`p-1.5 rounded-lg transition-all ${
                                    guest.invite_status === "sent"
                                      ? "hover:bg-amber-50 text-emerald-500 hover:text-amber-500"
                                      : "hover:bg-emerald-50 text-gray-400 hover:text-emerald-600"
                                  }`}
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
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </button>

                                {/* Copy — fixed popover */}
                                <button
                                  onClick={(e) => openCopyMenu(e, guest)}
                                  title="Copy link"
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>

                                {/* Preview */}
                                <a
                                  href={`/invite/${guest.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Preview invitation"
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
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </a>

                                {/* Edit (Admin Only) */}
                                {isAdmin && (
                                  <button
                                    onClick={() => openEdit(guest)}
                                    title="Edit guest"
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
                                )}

                                {/* Delete (Admin Only) */}
                                {isAdmin && (
                                  <button
                                    onClick={() =>
                                      handleDelete(guest.id, guest.display_name)
                                    }
                                    title="Delete guest"
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
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Card List ── */}
          <div className="md:hidden px-3 pb-4 space-y-2.5">
            {/* Select-all bar */}
            {!loading && guests.length > 0 && (
              <div className="flex items-center justify-between py-2 px-1">
                <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 accent-gray-900"
                  />
                  Pilih semua
                </label>
                {selected.size > 0 && (
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {selected.size} dipilih
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="py-16 text-center flex flex-col items-center gap-3 text-gray-400">
                <svg
                  className="animate-spin w-6 h-6"
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
                <span className="text-sm">Loading guests…</span>
              </div>
            ) : guests.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center gap-3">
                <svg
                  className="w-12 h-12 text-gray-200"
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
                <p className="text-gray-400 text-sm">
                  {search
                    ? `Tidak ada tamu untuk "${search}"`
                    : "Belum ada tamu."}
                </p>
                {!search && isAdmin && (
                  <button
                    onClick={openCreate}
                    className="text-sm font-semibold text-gray-900 underline underline-offset-2"
                  >
                    Tambah tamu pertama →
                  </button>
                )}
              </div>
            ) : (
              guests.map((guest) => {
                const groupName = groups.find(
                  (g) => g.id === guest.guest_group_id,
                )?.name;
                const isDeleted = !!guest.deleted_at;
                const isSelected = selected.has(guest.id);
                const isSent = guest.invite_status === "sent";

                return (
                  <div
                    key={guest.id}
                    onClick={() => toggleOne(guest.id)}
                    className={`rounded-2xl border transition-all active:scale-[0.99] overflow-hidden
                      ${
                        isDeleted
                          ? "bg-red-50/30 border-red-100 opacity-70"
                          : isSelected
                            ? "bg-gray-50 border-gray-300 shadow-sm"
                            : "bg-white border-gray-100 shadow-sm"
                      }`}
                  >
                    {/* Card body */}
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleOne(guest.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer flex-shrink-0"
                        />

                        {/* Avatar */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border
                          ${isDeleted ? "bg-red-50 border-red-200 text-red-400" : "bg-gray-100 border-gray-200 text-gray-600"}`}
                        >
                          {(guest.display_name || "?").charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-gray-900 text-sm leading-tight">
                              {guest.display_name}
                            </span>
                            {isDeleted && (
                              <span className="text-[9px] font-bold uppercase tracking-wide text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                                deleted
                              </span>
                            )}
                            {!isDeleted && isSent && (
                              <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                ✓ sent
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400">
                              {guest.phone_number || "—"}
                            </span>
                            {groupName && (
                              <>
                                <span className="text-gray-200">·</span>
                                <span className="text-xs text-indigo-500 font-medium truncate max-w-[100px]">
                                  {groupName}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Pax */}
                        <div className="flex-shrink-0 flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-black text-gray-700">
                            {guest.pax_allowed}
                          </div>
                          <span className="text-[9px] text-gray-400 mt-0.5">
                            pax
                          </span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5 mt-3 ml-[52px]">
                        <CategoryBadge value={guest.category} />
                        <PriorityBadge value={guest.priority} />
                        <ImportanceBadge value={guest.importance} />
                        <InvitationTypeBadge value={guest.invitation_type} />
                        <EventAccessBadge
                          access={guest.resolved_event_access || "both"}
                          isOverride={!!guest.event_access_override}
                        />
                      </div>

                      {/* Notes */}
                      {guest.notes && (
                        <p className="mt-2.5 ml-[52px] text-xs italic text-gray-400 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 line-clamp-2">
                          {guest.notes}
                        </p>
                      )}
                    </div>

                    {/* Action bar */}
                    <div
                      className="flex items-center gap-1.5 px-4 py-2.5 border-t border-gray-50 bg-gray-50/40"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isDeleted ? (
                        isAdmin && (
                          <button
                            onClick={() =>
                              handleRestore(guest.id, guest.display_name)
                            }
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Restore
                          </button>
                        )
                      ) : (
                        <>
                          {/* WA */}
                          <button
                            onClick={() => openWhatsApp(guest)}
                            title="Kirim via WhatsApp"
                            className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-50 text-green-600 rounded-xl border border-green-100 text-xs font-semibold"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.121.554 4.11 1.523 5.837L.057 23.882a.5.5 0 00.61.61l6.045-1.466A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.7-.497-5.27-1.394l-.38-.22-3.933.954.97-3.934-.24-.392A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                            </svg>
                            WA
                          </button>
                          {/* Mark invited */}
                          <button
                            onClick={() => handleMarkInvited(guest)}
                            title={
                              isSent ? "Undo sent" : "Tandai sudah diundang"
                            }
                            className={`p-2.5 rounded-xl border transition-all ${isSent ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-100 text-gray-400 border-gray-200"}`}
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
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                          {/* Preview */}
                          <a
                            href={`/invite/${guest.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-gray-100 text-gray-500 rounded-xl border border-gray-200"
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
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => openEdit(guest)}
                                className="p-2.5 bg-gray-100 text-gray-500 rounded-xl border border-gray-200"
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
                                onClick={() =>
                                  handleDelete(guest.id, guest.display_name)
                                }
                                className="p-2.5 bg-red-50 text-red-400 rounded-xl border border-red-100"
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
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <div className="mt-4 px-4 md:px-0 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 gap-4">
              <div>
                Showing{" "}
                <span className="font-bold text-gray-900">
                  {(page - 1) * limit + 1}
                </span>{" "}
                –{" "}
                <span className="font-bold text-gray-900">
                  {Math.min(page * limit, total)}
                </span>{" "}
                of <span className="font-bold text-gray-900">{total}</span>{" "}
                guests
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                  className="px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold"
                >
                  ««
                </button>
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-1"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Prev
                </button>
                <span className="px-4 py-2 text-xs font-bold text-gray-700">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-1"
                >
                  Next
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                  className="px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold"
                >
                  »»
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
