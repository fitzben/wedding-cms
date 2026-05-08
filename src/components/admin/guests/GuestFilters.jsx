export function GuestFilters({
  showFilters,
  filters,
  setFilter,
  clearFilters,
  activeFilterCount,
  groups,
  adminUsers,
}) {
  return (
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
            {
              label: "Status Undangan",
              key: "invite_status",
              custom: [
                { v: "pending", l: "⏳ Pending" },
                { v: "sent", l: "✓ Terkirim" },
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
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Dibuat Oleh
            </label>
            <select
              value={filters.created_by ?? ""}
              onChange={(e) => setFilter("created_by", e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-gray-400 outline-none transition-all w-full"
            >
              <option value="">Semua</option>
              {adminUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
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

          {/* Invite Status */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Status Undangan
            </label>
            <select
              value={filters.invite_status}
              onChange={(e) => setFilter("invite_status", e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-gray-400 outline-none transition-all"
            >
              <option value="">Semua</option>
              <option value="pending">⏳ Pending</option>
              <option value="sent">✓ Terkirim</option>
            </select>
          </div>

          {/* Dibuat Oleh */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Dibuat Oleh
            </label>
            <select
              value={filters.created_by ?? ""}
              onChange={(e) => setFilter("created_by", e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-gray-400 outline-none transition-all"
            >
              <option value="">Semua</option>
              {adminUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
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
  );
}
