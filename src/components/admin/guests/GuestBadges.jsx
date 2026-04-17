export function CategoryBadge({ value }) {
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

export function PriorityBadge({ value }) {
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

export function ImportanceBadge({ value }) {
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

export function InvitationTypeBadge({ value }) {
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

export function EventAccessBadge({ access, isOverride = false }) {
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

export function exportCSV(guests) {
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
