import {
  CategoryBadge,
  PriorityBadge,
  ImportanceBadge,
  InvitationTypeBadge,
  EventAccessBadge,
} from "./GuestBadges";

export function GuestTable({
  guests,
  loading,
  selected,
  allSelected,
  toggleAll,
  toggleOne,
  openEdit,
  handleDelete,
  handleRestore,
  handleMarkInvited,
  openWhatsApp,
  openCopyMenu,
  showDeleted,
  isAdmin,
  groups,
  search,
  openCreate,
}) {
  return (
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
  );
}
