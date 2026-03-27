import { STATUS_MAP } from "../constants/AdminGiftConstants";

export function FormatIDR(val) {
  if (!val) return "—";
  return "Rp " + Number(val).toLocaleString("id-ID");
}

export function StatusBadge({ status }) {
  const { label, cls } = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}
    >
      {label}
    </span>
  );
}

export function TypeBadge({ type }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
        type === "bank_transfer"
          ? "bg-blue-50 text-blue-600 border-blue-100"
          : "bg-purple-50 text-purple-600 border-purple-100"
      }`}
    >
      {type === "bank_transfer" ? "🏦 Transfer" : "🎁 Hadiah Fisik"}
    </span>
  );
}
