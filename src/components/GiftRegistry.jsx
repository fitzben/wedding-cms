import { useState, useEffect } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import useSettings from "../hooks/useSettings";
import { useParams } from "react-router-dom";
import useGuest from "../hooks/useGuest";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const API = {
  list: () => fetch(`${BASE_URL}/api/gifts/registry`).then((r) => r.json()),
  claim: (id, body) =>
    fetch(`${BASE_URL}/api/gifts/registry/${id}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ claimed, needed }) {
  const pct = needed > 0 ? Math.min((claimed / needed) * 100, 100) : 0;
  const isFull = claimed >= needed;
  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-sans font-light text-[10px] text-charcoal/50 tracking-[0.1em] uppercase">
          {isFull ? "Fully Claimed" : `${claimed} / ${needed} diambil`}
        </span>
        {isFull && (
          <span className="font-sans text-[9px] text-maroon bg-maroon/10 border border-maroon/20 px-2 py-0.5 rounded-full tracking-[0.1em] uppercase">
            Penuh
          </span>
        )}
      </div>
      <div className="w-full bg-gold/10 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ${isFull ? "bg-maroon" : "bg-gold"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Claim Modal ──────────────────────────────────────────────────────────────
function ClaimModal({ item, onClose, onSuccess, guestName }) {
  const [form, setForm] = useState({
    claimer_name: guestName,
    message: "",
    quantity: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null); // result after success

  const remaining = item.quantity_needed - item.quantity_claimed;

  const handleSubmit = async () => {
    if (!form.claimer_name.trim()) {
      setError("Nama harus diisi");
      return;
    }
    if (form.quantity < 1 || form.quantity > remaining) {
      setError(`Jumlah harus antara 1 – ${remaining}`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await API.claim(item.id, form);
      if (res.error) {
        setError(res.error);
        return;
      }
      setDone(res);
      onSuccess(item.id, res.quantity_claimed);
    } catch {
      setError("Gagal mengirim, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-[#1a0a08] rounded-t-2xl sm:rounded-2xl border border-gold/20 shadow-2xl overflow-hidden">
        <div className="w-10 h-1 bg-gold/30 rounded-full mx-auto mt-4 sm:hidden" />

        {done ? (
          /* ── Success state ── */
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-2xl">
              🎁
            </div>
            <div>
              <p className="font-serif italic text-2xl text-ivory mb-1">
                Terima kasih!
              </p>
              <p className="font-sans font-light text-[13px] text-ivory/60 leading-relaxed">
                Kamu sudah claim{" "}
                <strong className="text-ivory">{form.quantity}×</strong>{" "}
                {item.name}.
                {done.quantity_claimed < item.quantity_needed && (
                  <>
                    {" "}
                    Masih ada{" "}
                    <strong className="text-gold">
                      {item.quantity_needed - done.quantity_claimed}
                    </strong>{" "}
                    lagi yang bisa diambil orang lain.
                  </>
                )}
                {done.quantity_claimed >= item.quantity_needed && (
                  <>
                    {" "}
                    Item ini sudah{" "}
                    <strong className="text-maroon">fully claimed</strong>.
                  </>
                )}
              </p>
            </div>

            {/* Show shop link after claim */}
            {item.shop_url && (
              <a
                href={item.shop_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-gold text-charcoal font-sans text-[11px] tracking-[0.15em] uppercase px-6 py-3.5 rounded cursor-pointer transition-opacity hover:opacity-90"
              >
                Beli di Marketplace →
              </a>
            )}
            <button
              onClick={onClose}
              className="w-full bg-transparent border border-gold/30 text-ivory/60 font-sans text-[11px] tracking-[0.15em] uppercase px-6 py-3 rounded cursor-pointer"
            >
              Tutup
            </button>
          </div>
        ) : (
          /* ── Form state ── */
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-6">
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg border border-gold/20 flex-shrink-0"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
              <div className="min-w-0">
                <p className="font-serif italic text-xl text-ivory leading-tight">
                  {item.name}
                </p>
                {item.brand && (
                  <p className="font-sans text-[10px] text-gold tracking-[0.15em] uppercase mt-0.5">
                    {item.brand}
                  </p>
                )}
                <p className="font-sans text-[11px] text-ivory/40 mt-1">
                  Sisa:{" "}
                  <span className="text-gold font-semibold">{remaining}</span>{" "}
                  dari {item.quantity_needed}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700/50 text-red-300 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block font-sans text-[10px] text-gold tracking-[0.15em] uppercase mb-1.5">
                  Nama kamu <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.claimer_name}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, claimer_name: e.target.value }));
                    setError("");
                  }}
                  placeholder="Nama lengkap"
                  className="w-full bg-white/5 border border-gold/20 text-ivory placeholder-ivory/30 font-sans text-[13px] px-4 py-3 rounded-lg outline-none focus:border-gold/50 transition-colors"
                />
              </div>

              {/* Quantity — only show if > 1 available */}
              {item.quantity_needed > 1 && (
                <div>
                  <label className="block font-sans text-[10px] text-gold tracking-[0.15em] uppercase mb-1.5">
                    Jumlah yang mau diambil
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          quantity: Math.max(1, p.quantity - 1),
                        }))
                      }
                      className="w-9 h-9 rounded-lg border border-gold/20 text-ivory flex items-center justify-center text-lg hover:border-gold/50 transition-colors"
                    >
                      −
                    </button>
                    <span className="font-serif text-2xl text-ivory w-8 text-center">
                      {form.quantity}
                    </span>
                    <button
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          quantity: Math.min(remaining, p.quantity + 1),
                        }))
                      }
                      className="w-9 h-9 rounded-lg border border-gold/20 text-ivory flex items-center justify-center text-lg hover:border-gold/50 transition-colors"
                    >
                      +
                    </button>
                    <span className="font-sans text-[11px] text-ivory/40 ml-1">
                      maks {remaining}
                    </span>
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block font-sans text-[10px] text-gold tracking-[0.15em] uppercase mb-1.5">
                  Pesan{" "}
                  <span className="text-ivory/30 normal-case tracking-normal font-light">
                    opsional
                  </span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, message: e.target.value }))
                  }
                  placeholder="Tulis pesan untuk pasangan..."
                  rows={2}
                  className="w-full bg-white/5 border border-gold/20 text-ivory placeholder-ivory/30 font-sans text-[13px] px-4 py-3 rounded-lg outline-none focus:border-gold/50 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gold text-charcoal font-sans text-[11px] tracking-[0.15em] uppercase py-3.5 rounded cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Mengirim…" : "Claim Gift 🎁"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-transparent border border-gold/30 text-ivory/60 font-sans text-[11px] tracking-[0.15em] uppercase py-3 rounded cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Gift Card ────────────────────────────────────────────────────────────────
function GiftCard({ item, onClaim }) {
  const [hovered, setHovered] = useState(false);
  const isFull = item.quantity_claimed >= item.quantity_needed;
  const isDesktop = typeof window !== "undefined" && window.innerWidth > 767;

  return (
    <div
      className="group relative"
      style={{
        background: "white",
        border: `1px solid ${hovered && isDesktop ? "rgba(201,168,76,0.7)" : "rgba(201,168,76,0.25)"}`,
        borderRadius: "6px",
        overflow: "hidden",
        transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
        transform: hovered && isDesktop ? "translateY(-6px)" : "",
        boxShadow: hovered && isDesktop ? "0 20px 60px rgba(61,5,16,0.15)" : "",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tag */}
      {item.tag && (
        <div className="absolute top-3 right-3 z-[2] bg-maroon/85 text-ivory font-sans text-[9px] tracking-[0.15em] uppercase px-2.5 py-1 backdrop-blur-sm rounded-sm">
          {item.tag}
        </div>
      )}

      {/* Fully claimed overlay */}
      {isFull && (
        <div className="absolute inset-0 z-[3] bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-2">🎉</div>
            <p className="font-serif italic text-maroon text-lg">
              Fully Claimed
            </p>
            <p className="font-sans font-light text-[11px] text-charcoal/50 mt-1">
              {item.quantity_needed} / {item.quantity_needed} sudah diambil
            </p>
          </div>
        </div>
      )}

      {/* Image */}
      <div className="h-[180px] overflow-hidden relative bg-gradient-to-br from-[#3d0510] to-maroon">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className={`w-full h-full object-cover transition-transform duration-500 block ${hovered && isDesktop ? "scale-[1.08]" : ""}`}
            onError={(e) => (e.target.style.display = "none")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">
            🎁
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {item.brand && (
          <p className="font-sans font-light text-[10px] text-gold tracking-[0.15em] uppercase mb-1">
            {item.brand}
          </p>
        )}
        <h3 className="font-serif italic text-[22px] text-maroon mb-2 font-normal leading-tight">
          {item.name}
        </h3>
        {item.description && (
          <p className="font-sans font-light text-[12px] text-charcoal/65 leading-[1.7] mb-2">
            {item.description}
          </p>
        )}
        {item.price_range && (
          <p className="font-sans font-light text-[11px] text-charcoal/45 mb-3">
            {item.price_range}
          </p>
        )}

        {/* Progress */}
        <ProgressBar
          claimed={item.quantity_claimed}
          needed={item.quantity_needed}
        />

        {/* CTA */}
        {!isFull && (
          <button
            onClick={() => onClaim(item)}
            className="mt-4 w-full font-sans text-[10px] tracking-[0.15em] text-gold bg-transparent border border-gold/40 px-5 py-2.5 cursor-pointer rounded-sm transition-all duration-300 hover:bg-gold/10 hover:border-gold"
          >
            Claim Gift →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const GiftRegistry = () => {
  useScrollReveal();
  const { settings } = useSettings();
  const { guestSlug } = useParams();
  const { guest } = useGuest(guestSlug);
  const guestName = guest?.display_name || "Guest Name";

  const [copiedBank, setCopiedBank] = useState("");
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [claimTarget, setClaimTarget] = useState(null); // item being claimed

  useEffect(() => {
    API.list()
      .then((r) => setItems(r.items || []))
      .catch(() => {})
      .finally(() => setLoadingItems(false));
  }, []);

  const copyAccount = (number, bankId) => {
    navigator.clipboard.writeText(number.replace(/\s/g, "")).then(() => {
      setCopiedBank(bankId);
      setTimeout(() => setCopiedBank(""), 2000);
    });
  };

  // Update quantity_claimed in local state after successful claim
  const handleClaimSuccess = (itemId, newClaimed) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, quantity_claimed: newClaimed } : i,
      ),
    );
  };

  return (
    <>
      <section className="pb-[100px] bg-ivory relative pt-12">
        <div className="max-w-[900px] mx-auto px-6 relative z-10">
          <div className="text-center mb-[60px] flex flex-col items-center justify-center obs-hide obs-up">
            <h2 className="font-script text-[clamp(48px,7vw,80px)] text-maroon leading-none mb-4 font-normal">
              Wedding Gift
            </h2>
            <p className="font-sans font-light text-[14px] text-charcoal/60 italic max-w-md mx-auto">
              Your presence is our greatest gift. But if you wish to bless us
              further:
            </p>
          </div>

          {/* PART 1: Bank Transfer */}
          {(settings?.bride_bank_account || settings?.groom_bank_account) && (
            <div
              className="mb-16 obs-hide obs-up"
              style={{ animationDelay: "100ms" }}
            >
              <p className="text-center font-sans font-light text-[10px] text-gold tracking-[0.3em] uppercase mb-6">
                Bank Transfer
              </p>
              <div className="flex flex-wrap gap-6 justify-center">
                {settings?.bride_bank_account && (
                  <div className="bg-white border border-gold/30 rounded p-[28px_32px] min-w-[240px] relative flex flex-col items-start">
                    <svg
                      className="w-4 h-4 text-gold absolute top-2 left-2"
                      viewBox="0 0 64 64"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    >
                      <path d="M 4,24 L 4,4 L 24,4" />
                      <path d="M 8,20 L 8,8 L 20,8" />
                    </svg>
                    <svg
                      className="w-4 h-4 text-gold absolute top-2 right-2 rotate-90"
                      viewBox="0 0 64 64"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    >
                      <path d="M 4,24 L 4,4 L 24,4" />
                      <path d="M 8,20 L 8,8 L 20,8" />
                    </svg>
                    <svg
                      className="w-4 h-4 text-gold absolute bottom-2 left-2 -rotate-90"
                      viewBox="0 0 64 64"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    >
                      <path d="M 4,24 L 4,4 L 24,4" />
                      <path d="M 8,20 L 8,8 L 20,8" />
                    </svg>
                    <svg
                      className="w-4 h-4 text-gold absolute bottom-2 right-2 rotate-180"
                      viewBox="0 0 64 64"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    >
                      <path d="M 4,24 L 4,4 L 24,4" />
                      <path d="M 8,20 L 8,8 L 20,8" />
                    </svg>
                    <p className="font-sans font-normal text-[11px] text-maroon tracking-[0.15em] uppercase mb-1">
                      {settings.bride_bank_name || "Bank"}
                    </p>
                    <p className="font-serif text-[22px] text-charcoal tracking-[0.05em] mb-1">
                      {settings.bride_bank_account}
                    </p>
                    <p className="font-sans font-light text-[12px] text-charcoal/60 mb-4">
                      {settings.bride_bank_account_name}
                    </p>
                    <button
                      onClick={() =>
                        copyAccount(settings.bride_bank_account, "bride")
                      }
                      className={`font-sans font-light text-[10px] tracking-[0.15em] uppercase transition-colors cursor-pointer rounded-sm p-[6px_16px] border
                        ${copiedBank === "bride" ? "text-maroon border-maroon" : "text-gold border-gold/40 hover:bg-gold/10"}`}
                    >
                      {copiedBank === "bride" ? "COPIED ✓" : "Copy Number"}
                    </button>
                  </div>
                )}

                {settings?.groom_bank_account && (
                  <div className="bg-white border border-gold/30 rounded p-[28px_32px] min-w-[240px] relative flex flex-col items-start">
                    <svg
                      className="w-4 h-4 text-gold absolute top-2 left-2"
                      viewBox="0 0 64 64"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    >
                      <path d="M 4,24 L 4,4 L 24,4" />
                      <path d="M 8,20 L 8,8 L 20,8" />
                    </svg>
                    <svg
                      className="w-4 h-4 text-gold absolute top-2 right-2 rotate-90"
                      viewBox="0 0 64 64"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    >
                      <path d="M 4,24 L 4,4 L 24,4" />
                      <path d="M 8,20 L 8,8 L 20,8" />
                    </svg>
                    <svg
                      className="w-4 h-4 text-gold absolute bottom-2 left-2 -rotate-90"
                      viewBox="0 0 64 64"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    >
                      <path d="M 4,24 L 4,4 L 24,4" />
                      <path d="M 8,20 L 8,8 L 20,8" />
                    </svg>
                    <svg
                      className="w-4 h-4 text-gold absolute bottom-2 right-2 rotate-180"
                      viewBox="0 0 64 64"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    >
                      <path d="M 4,24 L 4,4 L 24,4" />
                      <path d="M 8,20 L 8,8 L 20,8" />
                    </svg>
                    <p className="font-sans font-normal text-[11px] text-maroon tracking-[0.15em] uppercase mb-1">
                      {settings.groom_bank_name || "Bank"}
                    </p>
                    <p className="font-serif text-[22px] text-charcoal tracking-[0.05em] mb-1">
                      {settings.groom_bank_account}
                    </p>
                    <p className="font-sans font-light text-[12px] text-charcoal/60 mb-4">
                      {settings.groom_bank_account_name}
                    </p>
                    <button
                      onClick={() =>
                        copyAccount(settings.groom_bank_account, "groom")
                      }
                      className={`font-sans font-light text-[10px] tracking-[0.15em] uppercase transition-colors cursor-pointer rounded-sm p-[6px_16px] border
                        ${copiedBank === "groom" ? "text-maroon border-maroon" : "text-gold border-gold/40 hover:bg-gold/10"}`}
                    >
                      {copiedBank === "groom" ? "COPIED ✓" : "Copy Number"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PART 2: Gift Registry */}
          <div className="mt-[60px]">
            <p className="text-center font-sans font-light text-[10px] text-gold tracking-[0.3em] uppercase mb-2">
              Gift Registry
            </p>
            <h3 className="font-serif italic text-[28px] text-maroon text-center mb-10">
              Things We'd Love
            </h3>

            {loadingItems ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded border border-gold/10 overflow-hidden animate-pulse"
                  >
                    <div className="h-[180px] bg-gold/5" />
                    <div className="p-5 space-y-2">
                      <div className="h-3 bg-gold/10 rounded w-1/3" />
                      <div className="h-6 bg-gold/10 rounded w-3/4" />
                      <div className="h-2 bg-gold/10 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className="text-center font-sans font-light text-[13px] text-charcoal/40 italic py-12">
                Gift registry belum tersedia.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {items.map((item) => (
                  <GiftCard
                    key={item.id}
                    item={item}
                    onClaim={setClaimTarget}
                  />
                ))}
              </div>
            )}
          </div>

          <p className="font-sans font-light text-charcoal/45 text-center mt-12 obs-hide obs-up">
            For inquiries: +62 878-7737-3812
          </p>
        </div>
      </section>

      {/* Claim Modal */}
      {claimTarget && (
        <ClaimModal
          item={claimTarget}
          onClose={() => setClaimTarget(null)}
          onSuccess={handleClaimSuccess}
          guestName={guestName}
        />
      )}
    </>
  );
};

export default GiftRegistry;
