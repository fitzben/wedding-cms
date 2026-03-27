import { useState, useEffect, useCallback } from "react";

import useGifts from "../../hooks/useGifts";
import { Toast } from "../../components/admin/components";
import { FormatIDR } from "../../utils/helpers";
import {
  GiftModal,
  GiftRow,
  RegistryTab,
  SummaryCards,
} from "../../components/admin/AdminGifts";

// ─── Toast ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const AdminGifts = () => {
  const [tab, setTab] = useState("log"); // 'log' | 'registry'
  const {
    gifts,
    summary,
    loading,
    pagination,
    fetchGifts,
    fetchSummary,
    createGift,
    updateGift,
    deleteGift,
  } = useGifts();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ type: "", status: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editGift, setEditGift] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const limit = 20;
  const { toasts, push } = useToast();

  const loadGifts = useCallback(async () => {
    await fetchGifts({
      page,
      limit,
      filters: Object.fromEntries(Object.entries(filter).filter(([, v]) => v)),
    });
  }, [page, filter, limit, fetchGifts]);

  useEffect(() => {
    loadGifts();
  }, [loadGifts]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleSave = async (form) => {
    try {
      if (editGift) {
        await updateGift(editGift.id, form);
      } else {
        await createGift(form);
      }
      push(editGift ? "Gift updated" : "Gift logged", "success");
      setModalOpen(false);
      setEditGift(null);
      loadGifts();
      fetchSummary();
    } catch (err) {
      push(err.message || "Failed to save", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGift(confirmDel.id);
      push("Gift removed", "success");
      setConfirmDel(null);
      loadGifts();
      fetchSummary();
    } catch (err) {
      push(err.message || "Failed to delete", "error");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateGift(id, { status });
      push("Status updated", "success");
      loadGifts();
      fetchSummary();
    } catch (err) {
      push(err.message || "Failed to update status", "error");
    }
  };

  const total = pagination?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Toast toasts={toasts} />
      <GiftModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditGift(null);
        }}
        onSave={handleSave}
        initial={editGift}
      />
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmDel(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm mx-4 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete Gift
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Remove gift from <strong>{confirmDel.sender_name}</strong>? This
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDel(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* ── Tab Bar ── */}
        <div className="px-6 md:px-8 pt-6 pb-0 border-b border-gray-100">
          <div className="flex items-end gap-1 mb-[-1px]">
            {[
              {
                id: "log",
                label: "🏦 Gift Log",
                sub: "Transfer & hadiah masuk",
              },
              {
                id: "registry",
                label: "🎁 Gift Registry",
                sub: "Wishlist & claim tamu",
              },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-5 py-3 text-sm font-semibold rounded-t-xl border-x border-t transition-all ${
                  tab === t.id
                    ? "bg-white border-gray-100 text-gray-900 border-b-white -mb-px z-10"
                    : "bg-gray-50 border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        {tab === "registry" ? (
          <RegistryTab />
        ) : (
          <>
            {/* Header */}
            <div className="px-6 md:px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gifts Log</h1>
                <p className="text-gray-400 text-sm mt-0.5">
                  {total} gift{total !== 1 ? "s" : ""} · Transfer & hadiah fisik
                </p>
              </div>
              <button
                onClick={() => {
                  setEditGift(null);
                  setModalOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm"
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
                Log Gift
              </button>
            </div>

            <div className="p-6 md:p-8">
              <SummaryCards summary={summary} />

              {/* Filters */}
              <div className="flex gap-3 mb-5 flex-wrap">
                <select
                  value={filter.type}
                  onChange={(e) => {
                    setFilter((p) => ({ ...p, type: e.target.value }));
                    setPage(1);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 bg-white text-gray-700"
                >
                  <option value="">All Types</option>
                  <option value="bank_transfer">Transfer Bank</option>
                  <option value="physical">Hadiah Fisik</option>
                </select>
                <select
                  value={filter.status}
                  onChange={(e) => {
                    setFilter((p) => ({ ...p, status: e.target.value }));
                    setPage(1);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 bg-white text-gray-700"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Table */}
              {/* ── Desktop Table ── */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="py-3.5 px-5 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                        Type
                      </th>
                      <th className="py-3.5 px-5 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                        From
                      </th>
                      <th className="py-3.5 px-5 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                        Detail
                      </th>
                      <th className="py-3.5 px-5 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3.5 px-5 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="py-3.5 px-5 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="py-14 text-center text-gray-400"
                        >
                          <span className="inline-flex items-center gap-2">
                            <svg
                              className="animate-spin w-4 h-4"
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
                            Loading gifts…
                          </span>
                        </td>
                      </tr>
                    ) : gifts.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="py-14 text-center text-gray-400"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <span className="text-4xl">🎁</span>
                            <p className="text-sm font-medium text-gray-500">
                              No gifts logged yet
                            </p>
                            <button
                              onClick={() => setModalOpen(true)}
                              className="text-sm font-semibold text-gray-900 underline underline-offset-2"
                            >
                              Log first gift →
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      gifts.map((g) => (
                        <GiftRow
                          key={g.id}
                          gift={g}
                          onEdit={(g) => {
                            setEditGift(g);
                            setModalOpen(true);
                          }}
                          onDelete={(g) => setConfirmDel(g)}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile Card List ── */}
              <div className="md:hidden space-y-4">
                {loading ? (
                  <div className="py-10 text-center text-gray-400">
                    Loading gifts...
                  </div>
                ) : gifts.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 italic">
                    No gifts logged yet.
                  </div>
                ) : (
                  gifts.map((g) => (
                    <div
                      key={g.id}
                      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl border ${g.type === "bank_transfer" ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-purple-50 border-purple-100 text-purple-600"}`}
                          >
                            {g.type === "bank_transfer" ? "🏦" : "🎁"}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 leading-tight">
                              {g.sender_name}
                            </h3>
                            <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">
                              {g.received_date || "No Date"}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={g.status} />
                      </div>

                      <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 mb-4">
                        {g.type === "bank_transfer" ? (
                          <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase mb-1 tracking-widest">
                              Amount & Bank
                            </p>
                            <p className="text-lg font-black text-gray-900 tracking-tight">
                              {FormatIDR(g.amount)}
                            </p>
                            <p className="text-xs text-gray-500 font-semibold">
                              {g.bank_name}
                              {g.account_number ? ` · ${g.account_number}` : ""}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase mb-1 tracking-widest">
                              Product Detail
                            </p>
                            <p className="text-sm font-bold text-gray-900 leading-snug">
                              {g.product_name}
                            </p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                              {g.product_category}
                            </p>
                            {g.product_link && (
                              <a
                                href={g.product_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 font-bold underline mt-2 block italic"
                              >
                                View Link →
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {g.notes && (
                        <div className="mb-4 text-xs italic text-gray-500 leading-relaxed px-1">
                          "{g.notes}"
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-50 px-1">
                        {g.status !== "confirmed" && (
                          <button
                            onClick={() =>
                              handleStatusChange(g.id, "confirmed")
                            }
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100"
                          >
                            Confirm
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditGift(g);
                            setModalOpen(true);
                          }}
                          className="p-2.5 bg-gray-50 text-gray-600 rounded-xl border border-gray-200"
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
                          onClick={() => setConfirmDel(g)}
                          className="p-2.5 bg-red-50 text-red-500 rounded-xl border border-red-100"
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
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
                  <span>
                    Showing {(page - 1) * limit + 1}–
                    {Math.min(page * limit, pagination?.total || 0)} of{" "}
                    {pagination?.total || 0}
                  </span>
                  <div className="flex gap-1">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 font-semibold text-gray-700"
                    >
                      ← Prev
                    </button>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 font-semibold text-gray-700"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};
