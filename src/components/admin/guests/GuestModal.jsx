import { useState, useEffect, useRef } from "react";
import {
  CATEGORIES,
  PRIORITIES,
  IMPORTANCES,
  INVITE_TYPES,
  EMPTY_FORM,
  EVENT_ACCESS_OPTIONS,
} from "./constants";

function getSimilarGuests(firstName, lastName, allGuests = [], currentId = null) {
  if (!firstName.trim() && !lastName.trim()) return [];
  const normalize = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const input = normalize(`${firstName} ${lastName}`);
  return allGuests.filter((g) => {
    if (g.id === currentId) return false;
    const name = normalize(g.display_name || `${g.first_name || ""} ${g.last_name || ""}`);
    if (!name) return false;
    if (input === name || input.includes(name) || name.includes(input)) return true;
    const bigrams = (s) => { const b = new Set(); for (let i = 0; i < s.length - 1; i++) b.add(s.slice(i, i+2)); return b; };
    const b1 = bigrams(input), b2 = bigrams(name);
    const inter = [...b1].filter(x => b2.has(x)).length;
    return (2 * inter) / (b1.size + b2.size) > 0.6;
  });
}

export function GuestModal({ open, onClose, onSave, initial, groups, allGuests, adminUsers }) {
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

  const similarGuests = getSimilarGuests(form.first_name, form.last_name, allGuests, initial?.id);

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

          {similarGuests.length > 0 && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5 mb-1.5">
                ⚠️ Nama serupa ditemukan — pastikan bukan duplikat:
              </p>
              <ul className="space-y-1">
                {similarGuests.slice(0, 3).map((g) => (
                  <li key={g.id} className="text-xs text-amber-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    {g.display_name || `${g.first_name} ${g.last_name}`}
                    {g.created_by && (() => {
                      const creator = adminUsers.find(u => u.id === g.created_by);
                      return creator ? (
                        <span className="text-xs text-gray-400">· {creator.name}</span>
                      ) : null;
                    })()}
                  </li>
                ))}
              </ul>
            </div>
          )}

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
              value={form.guest_group_id}
              onChange={(ev) => {
                setForm((p) => ({ ...p, guest_group_id: ev.target.value, event_access_override: "" }));
              }}
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
            {form.guest_group_id ? (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-500">
                <span>🔗</span>
                <span>Ikut Grup — akses ditentukan oleh grup yang dipilih</span>
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {EVENT_ACCESS_OPTIONS.filter(({ hint }) => !hint).map(({ value, label, icon }) => (
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
                    {icon} {label}
                  </label>
                ))}
              </div>
            )}
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
