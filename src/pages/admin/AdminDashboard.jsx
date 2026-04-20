import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../services/apiClient";

// ─── API ──────────────────────────────────────────────────────────────────────
const API = {
  dashboard: () => apiClient.get("/api/admin/dashboard"),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatIDR(val) {
  if (!val) return "Rp 0";
  return "Rp " + Number(val).toLocaleString("id-ID");
}

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Countdown ────────────────────────────────────────────────────────────────
function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();
    const calc = () => {
      const diff = target - Date.now();
      if (diff <= 0)
        return setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          passed: true,
        });
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        passed: false,
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  return timeLeft;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, color, loading }) {
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-3 ${color}`}>
      <div className="flex items-start justify-between">
        <span className="text-2xl">{icon}</span>
        {loading && (
          <svg
            className="animate-spin w-4 h-4 opacity-40"
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
        )}
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight">
          {loading ? (
            <span className="inline-block w-12 h-6 bg-current opacity-10 rounded animate-pulse" />
          ) : (
            value
          )}
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider opacity-60 mt-0.5">
          {label}
        </div>
        {sub && <div className="text-xs opacity-50 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Countdown Block ──────────────────────────────────────────────────────────
function CountdownCard({ settings, loading }) {
  const targetDate =
    settings?.countdown_override_date ||
    (settings?.countdown_target === "hm"
      ? settings?.hm_date
      : settings?.resepsi_date);
  const timeLeft = useCountdown(targetDate);
  const eventName =
    settings?.countdown_target === "hm" ? "Holy Matrimony" : "Resepsi";

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="bg-gray-900 text-white rounded-2xl border border-gray-800 p-6 flex flex-col gap-4">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
          Countdown to
        </div>
        <div className="text-base font-bold">{eventName}</div>
        {targetDate && (
          <div className="text-xs text-gray-400 mt-0.5">
            {formatDate(targetDate)}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex gap-3">
          {["D", "H", "M", "S"].map((u) => (
            <div
              key={u}
              className="flex-1 bg-gray-800 rounded-xl p-3 text-center"
            >
              <div className="text-xl font-bold animate-pulse">--</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{u}</div>
            </div>
          ))}
        </div>
      ) : !targetDate ? (
        <div className="text-sm text-gray-500">
          Set event date in Settings → Wedding
        </div>
      ) : timeLeft?.passed ? (
        <div className="text-emerald-400 font-semibold text-sm">
          🎉 The event has passed!
        </div>
      ) : timeLeft ? (
        <div className="flex gap-2">
          {[
            { v: timeLeft.days, u: "DAYS" },
            { v: timeLeft.hours, u: "HRS" },
            { v: timeLeft.minutes, u: "MIN" },
            { v: timeLeft.seconds, u: "SEC" },
          ].map(({ v, u }) => (
            <div
              key={u}
              className="flex-1 bg-gray-800 rounded-xl p-3 text-center min-w-0"
            >
              <div className="text-2xl font-bold tabular-nums">{pad(v)}</div>
              <div className="text-[10px] text-gray-500 mt-0.5 font-semibold tracking-widest">
                {u}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ─── RSVP Breakdown ───────────────────────────────────────────────────────────
function RSVPBreakdown({ rsvp, loading }) {
  const {
    attending = 0,
    not_attending = 0,
    maybe = 0,
    total_guests = 0,
    total_pax = 0,
    hm_only = 0,
    resepsi_only = 0,
    both_events = 0,
  } = rsvp || {};
  const total = attending + not_attending + maybe;
  const attendPct = total ? Math.round((attending / total) * 100) : 0;

  const bars = [
    {
      label: "Hadir",
      count: attending,
      pct: total ? (attending / total) * 100 : 0,
      color: "bg-emerald-500",
    },
    {
      label: "Tidak Hadir",
      count: not_attending,
      pct: total ? (not_attending / total) * 100 : 0,
      color: "bg-red-400",
    },
    {
      label: "Mungkin",
      count: maybe,
      pct: total ? (maybe / total) * 100 : 0,
      color: "bg-amber-400",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900">RSVP Breakdown</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {total} respons diterima
          </p>
        </div>
        {!loading && total > 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">
              {attendPct}%
            </div>
            <div className="text-xs text-gray-400">hadir</div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : total === 0 ? (
        <div className="text-sm text-gray-400 text-center py-4">
          Belum ada RSVP
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {bars.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                  <span>{b.label}</span>
                  <span className="font-bold text-gray-900">{b.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${b.color} h-2 rounded-full transition-all duration-700`}
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-3 text-center">
            <div className="bg-gray-50 rounded-xl py-2">
              <div className="text-sm font-bold text-gray-900">
                {total_guests}
              </div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">
                Guests responded
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl py-2">
              <div className="text-sm font-bold text-gray-900">{total_pax}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">
                Total pax coming
              </div>
            </div>
          </div>
          {(hm_only > 0 || resepsi_only > 0 || both_events > 0) && (
            <div className="mt-5 pt-4 border-t border-gray-50">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Kehadiran per Acara
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "HM Only", value: hm_only, icon: "⛪", cls: "bg-sky-50 border-sky-100 text-sky-700" },
                  { label: "Keduanya", value: both_events, icon: "🎊", cls: "bg-indigo-50 border-indigo-100 text-indigo-700" },
                  { label: "Resepsi", value: resepsi_only, icon: "🥂", cls: "bg-rose-50 border-rose-100 text-rose-700" },
                ].map(({ label, value, icon, cls }) => (
                  <div key={label} className={`rounded-xl border p-3 text-center ${cls}`}>
                    <div className="text-lg mb-0.5">{icon}</div>
                    <div className="text-xl font-bold">{value}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide opacity-70 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Guest Breakdown ──────────────────────────────────────────────────────────
function GuestBreakdown({ guests, loading }) {
  const {
    by_category = {},
    by_importance = {},
    invite_sent = 0,
    not_sent = 0,
  } = guests || {};

  const catColors = {
    family: "bg-purple-100 text-purple-700",
    colleague: "bg-blue-100 text-blue-700",
    friend: "bg-emerald-100 text-emerald-700",
  };
  const impColors = {
    vvip: "bg-yellow-100 text-yellow-700",
    vip: "bg-orange-100 text-orange-700",
    normal: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-gray-900 mb-5">Guest Breakdown</h3>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {/* By Category */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              By Category
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(by_category).map(([k, v]) => (
                <div
                  key={k}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${catColors[k] || "bg-gray-100 text-gray-600"}`}
                >
                  <span className="capitalize">{k}</span>
                  <span className="font-bold opacity-70">{v}</span>
                </div>
              ))}
              {!Object.keys(by_category).length && (
                <span className="text-xs text-gray-400">—</span>
              )}
            </div>
          </div>

          {/* By Importance */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              By Importance
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(by_importance).map(([k, v]) => (
                <div
                  key={k}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${impColors[k] || "bg-gray-100 text-gray-600"}`}
                >
                  <span className="uppercase">{k}</span>
                  <span className="opacity-70">{v}</span>
                </div>
              ))}
              {!Object.keys(by_importance).length && (
                <span className="text-xs text-gray-400">—</span>
              )}
            </div>
          </div>

          {/* Invite status */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Invite Sent
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-center">
                <div className="text-base font-bold text-emerald-700">
                  {invite_sent}
                </div>
                <div className="text-[10px] text-emerald-600 uppercase tracking-wide">
                  Sent
                </div>
              </div>
              <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-center">
                <div className="text-base font-bold text-gray-600">
                  {not_sent}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                  Pending
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Recent Wishes ────────────────────────────────────────────────────────────
function RecentWishes({ wishes, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900">Ucapan Terbaru</h3>
        {wishes?.length > 0 && (
          <span className="text-xs text-gray-400">{wishes.length} terbaru</span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : !wishes?.length ? (
        <div className="text-sm text-gray-400 text-center py-4">
          Belum ada ucapan
        </div>
      ) : (
        <div className="space-y-3">
          {wishes.slice(0, 5).map((w, i) => (
            <div key={w.id || i} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {(w.name || w.guest_name || "?")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-900 truncate">
                    {w.name || w.guest_name}
                  </span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">
                    {timeAgo(w.created_at)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {w.message || w.wish}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Recent Gifts ─────────────────────────────────────────────────────────────
function RecentGifts({ gifts, giftSummary, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900">Gifts Terbaru</h3>
          {!loading && giftSummary && (
            <p className="text-xs text-gray-400 mt-0.5">
              {formatIDR(giftSummary.total_amount)} total transfer
            </p>
          )}
        </div>
        {!loading && giftSummary?.pending_count > 0 && (
          <span className="text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100 px-2 py-1 rounded-full">
            {giftSummary.pending_count} pending
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : !gifts?.length ? (
        <div className="text-sm text-gray-400 text-center py-4">
          Belum ada gift tercatat
        </div>
      ) : (
        <div className="space-y-2.5">
          {gifts.slice(0, 5).map((g, i) => (
            <div
              key={g.id || i}
              className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-lg flex-shrink-0">
                  {g.type === "bank_transfer" ? "🏦" : "🎁"}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-gray-900 truncate">
                    {g.sender_name}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {timeAgo(g.created_at)}
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                {g.type === "bank_transfer" ? (
                  <div className="text-xs font-bold text-gray-900">
                    {formatIDR(g.amount)}
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-gray-700 max-w-[80px] truncate">
                    {g.product_name}
                  </div>
                )}
                <div
                  className={`text-[10px] font-semibold mt-0.5 ${
                    g.status === "confirmed"
                      ? "text-emerald-600"
                      : g.status === "rejected"
                        ? "text-red-500"
                        : "text-amber-500"
                  }`}
                >
                  {g.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Feature Status ───────────────────────────────────────────────────────────
function FeatureStatus({ settings, loading }) {
  const features = [
    { key: "rsvp_enabled", label: "RSVP", icon: "📋" },
    { key: "wishes_enabled", label: "Ucapan & Doa", icon: "💌" },
    { key: "gift_enabled", label: "Amplop Digital", icon: "🎁" },
    {
      key: "maintenance_mode",
      label: "Maintenance Mode",
      icon: "🔧",
      inverted: true,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-gray-900 mb-4">Feature Status</h3>
      {loading ? (
        <div className="space-y-2">
          {features.map((_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {features.map((f) => {
            const raw = settings?.[f.key];
            const isOn = f.inverted ? !!raw : !!raw;
            const active = f.inverted ? isOn : isOn;
            const badgeCls = f.inverted
              ? active
                ? "bg-red-50 text-red-600 border-red-100"
                : "bg-emerald-50 text-emerald-600 border-emerald-100"
              : active
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-gray-50 text-gray-400 border-gray-100";
            const badgeLabel = f.inverted
              ? active
                ? "ACTIVE"
                : "OFF"
              : active
                ? "ON"
                : "OFF";
            return (
              <div
                key={f.key}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <span>{f.icon}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {f.label}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-wide ${badgeCls}`}
                >
                  {badgeLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Wedding Info Banner ──────────────────────────────────────────────────────
function WeddingBanner({ settings, loading }) {
  const bride = settings?.bride_nickname || settings?.bride_name || "—";
  const groom = settings?.groom_nickname || settings?.groom_name || "—";
  const dateRes = settings?.resepsi_date;
  const venueRes = settings?.resepsi_venue_name;

  if (loading)
    return <div className="h-20 bg-gray-100 rounded-2xl animate-pulse mb-6" />;

  if (!settings?.bride_name) return null;

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl px-7 py-5 mb-6 flex items-center justify-between gap-4 overflow-hidden relative">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="relative">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
          The Wedding of
        </div>
        <div className="text-2xl font-bold">
          {bride} <span className="text-gray-400 font-light">&</span> {groom}
        </div>
      </div>
      {(dateRes || venueRes) && (
        <div className="relative text-right flex-shrink-0">
          {dateRes && (
            <div className="text-sm font-semibold">{formatDate(dateRes)}</div>
          )}
          {venueRes && (
            <div className="text-xs text-gray-400 mt-0.5">{venueRes}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);
  const [lastRsvpCount, setLastRsvpCount] = useState(null);
  const [hasNewRsvp, setHasNewRsvp] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.dashboard();
      if (res.error) {
        setError(res.error);
        return;
      }
      setData(res);
      setLastRefresh(new Date());
      const newCount = res.rsvp?.total || 0;
      if (lastRsvpCount !== null && newCount > lastRsvpCount) {
        setHasNewRsvp(true);
      }
      setLastRsvpCount(newCount);
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [lastRsvpCount]);

  useEffect(() => {
    if (hasNewRsvp) {
      document.title = "🔔 RSVP Baru! — Wedding Admin";
    } else {
      document.title = "Wedding Admin";
    }
    return () => { document.title = "Wedding Admin"; };
  }, [hasNewRsvp]);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  const s = data?.settings || {};
  const g = data?.guests || {};
  const r = data?.rsvp || {};
  const gf = data?.gifts || {};

  const statCards = [
    {
      label: "Total Guests",
      value: g.total ?? 0,
      sub: `${g.total_pax ?? 0} total pax`,
      icon: "👥",
      color: "bg-blue-50 border-blue-100 text-blue-900",
    },
    {
      label: "RSVP Received",
      value: r.total ?? 0,
      sub: `${r.attending ?? 0} hadir · ${r.not_attending ?? 0} tidak`,
      icon: "📋",
      color: "bg-emerald-50 border-emerald-100 text-emerald-900",
    },
    {
      label: "Belum RSVP",
      value: Math.max(0, (g.total ?? 0) - (r.total ?? 0)),
      sub: "tamu belum konfirmasi",
      icon: "⏳",
      color: "bg-amber-50 border-amber-100 text-amber-900",
    },
    {
      label: "Ucapan",
      value: data?.wishes_count ?? 0,
      sub: "pesan diterima",
      icon: "💌",
      color: "bg-rose-50 border-rose-100 text-rose-900",
    },
    {
      label: "Total Gift Transfer",
      value: formatIDR(gf.total_amount),
      sub: `${gf.transfer_count ?? 0} transaksi`,
      icon: "🏦",
      color: "bg-violet-50 border-violet-100 text-violet-900",
    },
    {
      label: "Hadiah Fisik",
      value: gf.physical_count ?? 0,
      sub: `${gf.physical_confirmed ?? 0} dikonfirmasi`,
      icon: "🎁",
      color: "bg-orange-50 border-orange-100 text-orange-900",
    },
    {
      label: "Link Dibuka",
      value: g.visited_count ?? 0,
      sub: `dari ${g.total ?? 0} tamu`,
      icon: "👁️",
      color: "bg-teal-50 border-teal-100 text-teal-900",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Overview undangan pernikahan
              {lastRefresh && (
                <span className="ml-2 text-gray-300">
                  · Updated {timeAgo(lastRefresh)}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
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
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-4 text-red-600 text-sm flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Wedding banner */}
      <WeddingBanner settings={s} loading={loading} />

      {/* RSVP notification banner */}
      {hasNewRsvp && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-emerald-500 text-xl">🔔</span>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Ada RSVP baru masuk!</p>
              <p className="text-xs text-emerald-600">Cek halaman RSVP untuk detail lengkap.</p>
            </div>
          </div>
          <button
            onClick={() => setHasNewRsvp(false)}
            className="text-emerald-400 hover:text-emerald-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((c) => (
          <StatCard key={c.label} {...c} loading={loading} />
        ))}
      </div>

      {/* Countdown + Feature Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CountdownCard settings={s} loading={loading} />
        <FeatureStatus settings={s} loading={loading} />
      </div>

      {/* RSVP + Guest Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RSVPBreakdown rsvp={r} loading={loading} />
        <GuestBreakdown guests={g} loading={loading} />
      </div>

      {/* Recent Wishes + Recent Gifts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentWishes wishes={data?.recent_wishes} loading={loading} />
        <RecentGifts
          gifts={data?.recent_gifts}
          giftSummary={gf}
          loading={loading}
        />
      </div>
    </div>
  );
};
