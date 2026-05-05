import { useState } from "react";

function stripTitlesAndInitials(name) {
  return name
    .replace(
      /\b(pdt\.?|rev\.?|dr\.?|drs\.?|ir\.?|prof\.?|bpk\.?|ibu?\.?|ust\.?|hj?\.?|kh\.?|mgr\.?|rm\.?|sr\.?|br\.?)\b/gi,
      "",
    )
    .replace(
      /\b[A-Z][a-z]*\.(Th|Fil|Div|Kom|Si|Pd|Hum|Sos|H|E|T|Ak|IP|Gz|Farm|Ked)\b/g,
      "",
    )
    .replace(/\b[A-Z]{1,2}\.\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getCoreName(g) {
  const raw = g.display_name || `${g.first_name || ""} ${g.last_name || ""}`;
  return stripTitlesAndInitials(raw).toLowerCase().trim();
}

function nameSimilarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.95;

  const tokensA = new Set(a.split(" ").filter((t) => t.length > 1));
  const tokensB = new Set(b.split(" ").filter((t) => t.length > 1));
  const tokenInter = [...tokensA].filter((t) => tokensB.has(t)).length;
  const tokenScore = (2 * tokenInter) / (tokensA.size + tokensB.size);

  const bigrams = (s) => {
    const set = new Set();
    for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
    return set;
  };
  const b1 = bigrams(a),
    b2 = bigrams(b);
  const bigramInter = [...b1].filter((x) => b2.has(x)).length;
  const bigramScore = (2 * bigramInter) / (b1.size + b2.size);

  return Math.max(tokenScore, bigramScore);
}

// eslint-disable-next-line react-refresh/only-export-components
export function findAllDuplicateGroups(guests, dismissedPairs = new Set()) {
  const groups = [];
  const visited = new Set();

  for (let i = 0; i < guests.length; i++) {
    if (visited.has(guests[i].id) || guests[i].is_verified) continue;
    const group = [guests[i]];
    const coreI = getCoreName(guests[i]);

    for (let j = i + 1; j < guests.length; j++) {
      if (visited.has(guests[j].id) || guests[j].is_verified) continue;
      const pairKey = [guests[i].id, guests[j].id].sort().join(":");
      if (dismissedPairs.has(pairKey)) continue;

      const coreJ = getCoreName(guests[j]);
      if (nameSimilarity(coreI, coreJ) >= 0.6) {
        group.push(guests[j]);
        visited.add(guests[j].id);
      }
    }

    if (group.length > 1) {
      visited.add(guests[i].id);
      groups.push(group);
    }
  }

  return groups;
}

export function DuplicateWarningPanel({
  groups,
  onDelete,
  adminUsers,
  handleMarkVerified,
}) {
  const [expanded, setExpanded] = useState(true);
  const [dismissedPairs, setDismissedPairs] = useState(() => {
    try {
      const stored = localStorage.getItem("guest_dismissed_pairs");
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set(); // localStorage unavailable
    }
  });

  const activeGroups = groups
    .map((group) => {
      const filtered = group.filter((g, i) => {
        return group.some((other, j) => {
          if (i === j) return false;
          const pairKey = [g.id, other.id].sort().join(":");
          return !dismissedPairs.has(pairKey);
        });
      });
      return filtered;
    })
    .filter((group) => group.length >= 2);

  const handleAcceptGroup = (group) => {
    const ids = group.map((g) => g.id);
    handleMarkVerified(ids);
    setDismissedPairs((prev) => {
      const next = new Set(prev);
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          next.add([group[i].id, group[j].id].sort().join(":"));
        }
      }
      try {
        localStorage.setItem(
          "guest_dismissed_pairs",
          JSON.stringify([...next]),
        );
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  if (!activeGroups.length) return null;
  const totalDupes = activeGroups.reduce((acc, g) => acc + g.length, 0);

  return (
    <div className="mx-4 md:mx-8 mb-4 rounded-2xl border border-amber-200 bg-amber-50 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-base">⚠️</span>
          <span className="text-sm font-semibold text-amber-800">
            {activeGroups.length} grup nama mirip ditemukan ({totalDupes} tamu)
          </span>
          <span className="text-xs text-amber-500 font-normal hidden sm:inline">
            — cek potensi duplikat
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-amber-400 transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-amber-100 pt-3">
          {activeGroups.map((group, gi) => (
            <div
              key={gi}
              className="bg-white rounded-xl border border-amber-100 overflow-hidden"
            >
              <div className="px-3 py-2 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700">
                  Grup {gi + 1} — {group.length} nama serupa
                </span>
                <button
                  onClick={() => handleAcceptGroup(group)}
                  className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1"
                  title="Tandai semua di grup ini sebagai orang berbeda"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Accept semua
                </button>
              </div>

              <div className="divide-y divide-gray-50">
                {group.map((g) => {
                  const creator = adminUsers?.find(
                    (u) => u.id === g.created_by,
                  );
                  const undismissedPairs = group.filter((other) => {
                    if (other.id === g.id) return false;
                    return !dismissedPairs.has(
                      [g.id, other.id].sort().join(":"),
                    );
                  });

                  return (
                    <div
                      key={g.id}
                      className="flex items-start justify-between px-3 py-2.5 gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {g.display_name || `${g.first_name} ${g.last_name}`}
                        </div>
                        <div className="text-xs text-gray-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                          <span>{g.phone_number || "—"}</span>
                          {creator && <span>· {creator.name}</span>}
                          <span className="capitalize">· {g.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                        <a
                          href={`/invite/${g.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs font-semibold hover:bg-gray-200 transition-all"
                        >
                          Preview
                        </a>
                        {undismissedPairs.length >= 1 && (
                          <button
                            onClick={() => {
                              handleMarkVerified([g.id]);
                              setDismissedPairs((prev) => {
                                const next = new Set(prev);
                                undismissedPairs.forEach((other) => {
                                  next.add([g.id, other.id].sort().join(":"));
                                });
                                try {
                                  localStorage.setItem(
                                    "guest_dismissed_pairs",
                                    JSON.stringify([...next]),
                                  );
                                } catch {
                                  /* ignore */
                                }
                                return next;
                              });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-semibold border border-emerald-100 hover:bg-emerald-100 transition-all"
                            title="Beda orang, jangan tampilkan lagi"
                          >
                            Accept
                          </button>
                        )}
                        <button
                          onClick={() =>
                            onDelete(
                              g.id,
                              g.display_name ||
                                `${g.first_name} ${g.last_name}`,
                            )
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-semibold border border-red-100 hover:bg-red-100 transition-all"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {dismissedPairs.size > 0 && (
            <button
              onClick={() => {
                setDismissedPairs(new Set());
                try {
                  localStorage.removeItem("guest_dismissed_pairs");
                } catch {
                  /* ignore */
                }
              }}
              className="text-xs text-amber-500 hover:text-amber-700 underline underline-offset-2"
            >
              Reset {dismissedPairs.size} pasangan yang sudah di-accept
            </button>
          )}
        </div>
      )}
    </div>
  );
}
