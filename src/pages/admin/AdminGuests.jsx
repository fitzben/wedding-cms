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
import { NotesModal } from "../../components/admin/guests/NotesModal";

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
    handleSetLimit,
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
    handleMarkVerified,
    handleUpdatePax,
    handleUpdateNotes,
    handleBulkDelete,
    handleDelete,
    handleRestore,
    copyLink,
    copyLinkWithMessage,
    openWhatsApp,
    handleMarkInvited,
    handleExportAll,
    handleImportCSV,
    totalPages,
    toasts,
    confirm,
    setConfirm,
    isAdmin,
    adminUsers,
    allGuestNames,
    waBlastQueue,
    waBlastIndex,
    waBlastOpen,
    setWaBlastOpen,
    startWaBlast,
    waBlastNext,
    waBlastSkip,
  } = useAdminGuests();

  const [importProgress, setImportProgress] = useState(null);

  // ── Notes modal state ──
  const [notesModal, setNotesModal] = useState({ open: false, guest: null });

  const openNotesModal = (guest) => {
    setNotesModal({ open: true, guest });
  };
  const closeNotesModal = () => {
    setNotesModal({ open: false, guest: null });
  };
  const handleSaveNotes = async (newNotes) => {
    await handleUpdateNotes(notesModal.guest.id, newNotes);
  };

  const handleImportWithProgress = async (file) => {
    setImportProgress({ status: 'uploading', result: null });
    try {
      setImportProgress({ status: 'processing', result: null });
      const result = await handleImportCSV(file);
      setImportProgress({ status: 'done', result });
    } catch (err) {
      setImportProgress({ status: 'error', result: { error: err?.message || 'Gagal import' } });
    }
  };

  const duplicateGroups = findAllDuplicateGroups(allGuestNames);

  const handleDownloadTemplate = () => {
    import("xlsx").then((XLSX) => {
      const templateHeaders = [
        "first_name", "last_name", "display_name", "phone_number",
        "pax_allowed", "category", "priority", "importance",
        "invitation_type", "guest_group_name", "notes",
      ];

      const exampleData = [
        {
          first_name: "John",
          last_name: "Doe",
          display_name: "John & Jane Doe",
          phone_number: "6281234567890",
          pax_allowed: 2,
          category: "friend",
          priority: "medium",
          importance: "normal",
          invitation_type: "digital",
          guest_group_name: groups[0]?.name || "",
          notes: "Contoh dengan nomor HP — bisa di-WA blast",
        },
        {
          first_name: "Jane",
          last_name: "Smith",
          display_name: "Jane Smith",
          phone_number: "",
          pax_allowed: 1,
          category: "friend",
          priority: "medium",
          importance: "normal",
          invitation_type: "digital",
          guest_group_name: "",
          notes: "Contoh tanpa nomor HP — share via IG/link",
        },
      ];

      const sheet1 = XLSX.utils.json_to_sheet(exampleData, {
        header: templateHeaders,
      });

      sheet1["!cols"] = [
        { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 18 },
        { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
        { wch: 16 }, { wch: 25 }, { wch: 35 },
      ];

      // Sheet 2: Referensi
      const refData = [];
      refData.push({ Kolom: "first_name", Keterangan: "WAJIB — nama depan" });
      refData.push({ Kolom: "last_name", Keterangan: "WAJIB — nama belakang" });
      refData.push({ Kolom: "display_name", Keterangan: "Opsional — nama yang tampil di undangan" });
      refData.push({ Kolom: "phone_number", Keterangan: "Opsional — format 628xxx. Kosongkan jika tidak ada" });
      refData.push({ Kolom: "", Keterangan: "" });
      refData.push({ Kolom: "category", Keterangan: "friend / colleague / family (default: friend)" });
      refData.push({ Kolom: "priority", Keterangan: "low / medium / high (default: medium)" });
      refData.push({ Kolom: "importance", Keterangan: "normal / vip / vvip (default: normal)" });
      refData.push({ Kolom: "invitation_type", Keterangan: "digital / physical / both (default: digital)" });
      refData.push({ Kolom: "", Keterangan: "" });

      const sheet2 = XLSX.utils.json_to_sheet(refData, {
        header: ["Kolom", "Keterangan"],
      });

      // Tambah tabel guest groups
      const groupStartRow = refData.length + 2;
      XLSX.utils.sheet_add_aoa(sheet2, [
        ["guest_group_name — Pilih salah satu:"],
        ...(groups.length > 0
          ? groups.map(g => [g.name])
          : [["(belum ada grup — buat dulu di menu Groups)"]]
        ),
        [""],
        ["Kosongkan jika tamu tidak masuk grup manapun"],
      ], { origin: { r: groupStartRow, c: 0 } });

      sheet2["!cols"] = [{ wch: 20 }, { wch: 45 }];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet1, "Template Input");
      XLSX.utils.book_append_sheet(workbook, sheet2, "Referensi");

      XLSX.writeFile(workbook, "template_upload_guests.xlsx");
    });
  };

  const [copyMenu, setCopyMenu] = useState(null); // { guest, x, y } or null
  const openCopyMenu = (e, guest) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCopyMenu({ guest, x: rect.right, y: rect.bottom + 4 });
  };

  return (
    <>
      <Toast toasts={toasts} />

      {/* Import Progress Modal */}
      {importProgress && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 border border-gray-100 overflow-hidden">

            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-50">
              <h3 className="text-base font-bold text-gray-900">Import Tamu</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {importProgress.status === 'uploading' && 'Mengunggah file...'}
                {importProgress.status === 'processing' && 'Memproses data tamu...'}
                {importProgress.status === 'done' && 'Import selesai!'}
                {importProgress.status === 'error' && 'Import gagal'}
              </p>
            </div>

            <div className="px-6 py-5">
              {/* Loading state */}
              {(importProgress.status === 'uploading' || importProgress.status === 'processing') && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="relative w-16 h-16">
                    <svg className="animate-spin w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <svg className="animate-spin w-16 h-16 text-gray-900 absolute inset-0" fill="none" viewBox="0 0 24 24">
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">
                      {importProgress.status === 'uploading' ? 'Mengunggah file...' : 'Memproses baris data...'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Mohon tunggu, jangan tutup halaman ini</p>
                  </div>
                  {/* Animated progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-gray-900 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              )}

              {/* Success state */}
              {importProgress.status === 'done' && importProgress.result && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Import berhasil</p>
                      <p className="text-xs text-gray-400">Data sudah ditambahkan ke daftar tamu</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-emerald-600">
                        {importProgress.result.success ?? 0}
                      </div>
                      <div className="text-xs text-emerald-600 font-medium mt-0.5">Berhasil</div>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-red-500">
                        {importProgress.result.failed ?? 0}
                      </div>
                      <div className="text-xs text-red-500 font-medium mt-0.5">Dilewati</div>
                    </div>
                  </div>

                  {/* Errors detail */}
                  {importProgress.result.errors?.length > 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 max-h-32 overflow-y-auto">
                      <p className="text-xs font-semibold text-amber-700 mb-1.5">Detail baris yang dilewati:</p>
                      {importProgress.result.errors.map((e, i) => (
                        <p key={i} className="text-xs text-amber-600 leading-relaxed">{e}</p>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setImportProgress(null)}
                    className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all"
                  >
                    Selesai
                  </button>
                </div>
              )}

              {/* Error state */}
              {importProgress.status === 'error' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Import gagal</p>
                      <p className="text-xs text-red-500 mt-0.5">
                        {importProgress.result?.error || 'Terjadi kesalahan saat import'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setImportProgress(null)}
                    className="w-full py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {waBlastOpen && waBlastQueue.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm mx-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-gray-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>💬</span>
                <span className="text-sm font-semibold">WA Blast</span>
                <span className="text-xs text-gray-400">
                  {waBlastIndex + 1} / {waBlastQueue.length}
                </span>
              </div>
              <button
                onClick={() => setWaBlastOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-gray-100">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${((waBlastIndex + 1) / waBlastQueue.length) * 100}%` }}
              />
            </div>

            {/* Current guest */}
            <div className="px-4 py-3">
              <div className="text-xs text-gray-400 mb-1">Sedang dikirim ke:</div>
              <div className="font-semibold text-gray-900 text-sm">
                {waBlastQueue[waBlastIndex]?.display_name ||
                  `${waBlastQueue[waBlastIndex]?.first_name} ${waBlastQueue[waBlastIndex]?.last_name}`}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {waBlastQueue[waBlastIndex]?.phone_number}
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={() => {
                  openWhatsApp(waBlastQueue[waBlastIndex]);
                }}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <span>📤</span> Buka WhatsApp
              </button>
              <button
                onClick={() => waBlastNext(true)}
                className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-all"
              >
                {waBlastIndex < waBlastQueue.length - 1 ? "✓ Terkirim, Lanjut" : "✓ Selesai"}
              </button>
              <button
                onClick={waBlastSkip}
                className="px-3 py-2.5 border border-gray-200 text-gray-500 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-all"
                title="Lewati tamu ini"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

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

      <NotesModal
        open={notesModal.open}
        guest={notesModal.guest}
        onClose={closeNotesModal}
        onSave={handleSaveNotes}
        readOnly={!isAdmin}
      />

      <GuestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editGuest}
        groups={groups}
        allGuests={allGuestNames}
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

              {/* Export current page */}
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

              {/* Export all guests */}
              <button
                onClick={handleExportAll}
                title="Export semua tamu ke CSV"
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
                Export All
              </button>

              {/* Download Template */}
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                title="Download template CSV dengan referensi master data dan daftar grup"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Template
              </button>

              {/* Import CSV */}
              {isAdmin && (
                <label
                  title="Import tamu dari CSV"
                  className="flex items-center gap-1.5 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>
                  Import CSV
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImportWithProgress(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}

              {/* WA Blast */}
              {isAdmin && (
                <button
                  onClick={() => startWaBlast(guests)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 border border-emerald-200 bg-emerald-50 rounded-xl text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-all"
                  title="Kirim WA ke semua tamu yang belum diundang"
                >
                  <span>💬</span>
                  WA Blast
                </button>
              )}

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
          handleMarkVerified={handleMarkVerified}
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
            handleUpdatePax={handleUpdatePax}
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
            openNotesModal={openNotesModal}
          />

          <GuestCards
            guests={guests}
            loading={loading}
            selected={selected}
            allSelected={allSelected}
            toggleAll={toggleAll}
            toggleOne={toggleOne}
            openEdit={openEdit}
            handleUpdatePax={handleUpdatePax}
            handleDelete={handleDelete}
            handleRestore={handleRestore}
            handleMarkInvited={handleMarkInvited}
            openWhatsApp={openWhatsApp}
            copyLink={copyLink}
            copyLinkWithMessage={copyLinkWithMessage}
            showDeleted={showDeleted}
            isAdmin={isAdmin}
            groups={groups}
            search={search}
            openCreate={openCreate}
            openNotesModal={openNotesModal}
          />

          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <div className="mt-4 px-4 md:px-0 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Limit:</span>
                  <select
                    value={limit}
                    onChange={(e) => handleSetLimit(parseInt(e.target.value))}
                    className="bg-white border border-gray-200 rounded-lg text-xs font-bold px-2 py-1 outline-none focus:ring-2 focus:ring-gray-100"
                  >
                    {[10, 25, 50, 100].map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-px h-4 bg-gray-100" />
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
