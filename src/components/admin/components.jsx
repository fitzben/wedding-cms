// ─── Shared UI primitives ─────────────────────────────────────────────────────
export function Label({ children, optional }) {
  return (
    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
      {children}
      {optional && (
        <span className="ml-1.5 text-gray-300 font-normal normal-case tracking-normal">
          optional
        </span>
      )}
    </label>
  );
}
export function Input({ error, ...props }) {
  return (
    <input
      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all
        ${error ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 bg-white"}`}
      {...props}
    />
  );
}
export function Textarea({ ...props }) {
  return (
    <textarea
      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-gray-400 focus:ring-2 focus:ring-gray-100 resize-none bg-white"
      {...props}
    />
  );
}
export function Select({ children, ...props }) {
  return (
    <select
      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-gray-400 focus:ring-2 focus:ring-gray-100 bg-white"
      {...props}
    >
      {children}
    </select>
  );
}
export function SaveButton({ saving, onClick, label = "Save Changes" }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm disabled:opacity-60"
    >
      {saving ? (
        <>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
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
          Saving…
        </>
      ) : (
        <>
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
              d="M5 13l4 4L19 7"
            />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
      <div>
        <div className="text-sm font-semibold text-gray-800">{label}</div>
        {description && (
          <div className="text-xs text-gray-400 mt-0.5">{description}</div>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none
          ${checked ? "bg-gray-900" : "bg-gray-200"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
          ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
export function SectionCard({ title, description, children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          {description && (
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
export const ROLE_STYLES = {
  admin: "bg-red-50 text-red-600 border-red-100",
  partner: "bg-rose-50 text-rose-600 border-rose-100",
  parents: "bg-amber-50 text-amber-600 border-amber-100",
};
export function RoleBadge({ role }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${ROLE_STYLES[role] || "bg-gray-50 text-gray-500 border-gray-200"}`}
    >
      {role}
    </span>
  );
}

export function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto border
          ${t.type === "success" ? "bg-gray-900 text-white border-gray-700" : ""}
          ${t.type === "error" ? "bg-red-900 text-red-100 border-red-700" : ""}
          ${t.type === "info" ? "bg-blue-50 text-blue-700 border-blue-100" : ""}
        `}
        >
          {t.type === "success" && <span className="text-emerald-400">✓</span>}
          {t.type === "error" && <span className="text-red-400">✕</span>}
          {t.type === "info" && <span className="text-blue-400">ℹ</span>}
          {t.message}
        </div>
      ))}
    </div>
  );
}
