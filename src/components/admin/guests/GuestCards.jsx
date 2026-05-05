import {
  CategoryBadge,
  PriorityBadge,
  ImportanceBadge,
  InvitationTypeBadge,
  EventAccessBadge,
} from "./GuestBadges";

export function GuestCards({
  guests,
  loading,
  selected,
  allSelected,
  toggleAll,
  toggleOne,
  openEdit,
  handleUpdatePax,
  handleDelete,
  handleRestore,
  handleMarkInvited,
  openWhatsApp,
  showDeleted,
  isAdmin,
  groups,
  search,
  openCreate,
}) {
  return (
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
                    {isAdmin && !isDeleted ? (
                      <input
                        type="number"
                        min={1}
                        max={20}
                        defaultValue={guest.pax_allowed}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={(e) => {
                          const newPax = parseInt(e.target.value, 10);
                          if (!isNaN(newPax) && newPax !== guest.pax_allowed && newPax > 0) {
                            handleUpdatePax(guest.id, newPax);
                          } else {
                            e.target.value = guest.pax_allowed;
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.target.blur();
                          }
                        }}
                        className="w-10 h-8 rounded-lg bg-gray-100 border border-gray-200 text-center text-xs font-black text-gray-700 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-black text-gray-700">
                        {guest.pax_allowed}
                      </div>
                    )}
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
  );
}
