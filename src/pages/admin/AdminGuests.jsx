import { useState } from "react";
import useAdminGuests from "../../hooks/admin/useAdminGuests";
import { Toast } from "../../components/admin/components";
import { ConfirmDialog } from "../../components/admin/guests/ConfirmDialog";
import { GuestModal } from "../../components/admin/guests/GuestModal";
import {
  DuplicateWarningPanel,
  findAllDuplicateGroups,
} from "../../components/admin/guests/DuplicateWarningPanel";
import { GuestFilters } from "../../components/admin/guests/GuestFilters";
import { GuestTable } from "../../components/admin/guests/GuestTable";
import { GuestCards } from "../../components/admin/guests/GuestCards";
import { exportCSV } from "../../components/admin/guests/GuestBadges";

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
    currentUserId,
    adminUsers,
  } = useAdminGuests();

  const duplicateGroups = findAllDuplicateGroups(guests);

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
          <div
            className="fixed inset-0 z-40"
            onClick={() => setCopyMenu(null)}
          />
          <div
            className="fixed z-50 bg-white border border-gray-100 rounded-xl shadow-xl py-1 w-44"
            style={{ top: copyMenu.y, right: window.innerWidth - copyMenu.x }}
          >
            <button
              onClick={() => {
                copyLink(copyMenu.guest.slug);
                setCopyMenu(null);
              }}
              className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-left"
            >
              <svg
                className="w-3.5 h-3.5 text-gray-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              Link saja
            </button>
            <button
              onClick={() => {
                copyLinkWithMessage(copyMenu.guest);
                setCopyMenu(null);
              }}
              className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-left"
            >
              <svg
                className="w-3.5 h-3.5 text-gray-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
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
        allGuests={guests}
        adminUsers={adminUsers}
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

        <GuestFilters
          showFilters={showFilters}
          filters={filters}
          setFilter={setFilter}
          clearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
          groups={groups}
          adminUsers={adminUsers}
        />

        <DuplicateWarningPanel
          groups={duplicateGroups}
          onDelete={handleDelete}
          adminUsers={adminUsers}
        />

        {/* ── Table ── */}
        <div className="p-0 md:p-8">
          {error && (
            <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
              {error}
            </div>
          )}

          <GuestTable
            guests={guests}
            loading={loading}
            selected={selected}
            allSelected={allSelected}
            toggleAll={toggleAll}
            toggleOne={toggleOne}
            openEdit={openEdit}
            handleDelete={handleDelete}
            handleRestore={handleRestore}
            handleMarkInvited={handleMarkInvited}
            openWhatsApp={openWhatsApp}
            openCopyMenu={openCopyMenu}
            showDeleted={showDeleted}
            isAdmin={isAdmin}
            groups={groups}
            search={search}
            openCreate={openCreate}
          />

          <GuestCards
            guests={guests}
            loading={loading}
            selected={selected}
            allSelected={allSelected}
            toggleAll={toggleAll}
            toggleOne={toggleOne}
            openEdit={openEdit}
            handleDelete={handleDelete}
            handleRestore={handleRestore}
            handleMarkInvited={handleMarkInvited}
            openWhatsApp={openWhatsApp}
            showDeleted={showDeleted}
            isAdmin={isAdmin}
            groups={groups}
            search={search}
            openCreate={openCreate}
          />

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
