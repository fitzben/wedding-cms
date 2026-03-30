// ═══════════════════════════════════════════════════════════════════════════════
// TAB: LIVE STREAMING

import { Input, Label, SaveButton, SectionCard } from "./components";

// ─── Platform detector ────────────────────────────────────────────────────────
function detectPlatform(url = "") {
  if (!url) return null;
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("facebook.com") || url.includes("fb.watch"))
    return "facebook";
  if (url.includes("zoom.us")) return "zoom";
  return "other";
}

function PlatformBadge({ url }) {
  const platform = detectPlatform(url);
  if (!platform) return null;

  const map = {
    youtube: {
      label: "YouTube",
      cls: "bg-red-50 text-red-600 border-red-100",
      icon: "▶",
    },
    instagram: {
      label: "Instagram",
      cls: "bg-pink-50 text-pink-600 border-pink-100",
      icon: "◈",
    },
    facebook: {
      label: "Facebook",
      cls: "bg-blue-50 text-blue-600 border-blue-100",
      icon: "f",
    },
    zoom: {
      label: "Zoom",
      cls: "bg-sky-50 text-sky-600 border-sky-100",
      icon: "Z",
    },
    other: {
      label: "Custom",
      cls: "bg-gray-50 text-gray-500 border-gray-200",
      icon: "↗",
    },
  };

  const { label, cls, icon } = map[platform];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}
    >
      <span className="font-bold">{icon}</span> {label}
    </span>
  );
}

// ─── Embed preview ────────────────────────────────────────────────────────────
function EmbedPreview({ url }) {
  if (!url) return null;

  const platform = detectPlatform(url);

  // Build embed URL from watch URL
  let embedUrl = null;
  if (platform === "youtube") {
    // Handle both youtu.be/ID and youtube.com/watch?v=ID and /live/ID
    const idMatch =
      url.match(/youtu\.be\/([^?&]+)/) ||
      url.match(/[?&]v=([^?&]+)/) ||
      url.match(/\/live\/([^?&]+)/);
    if (idMatch) {
      embedUrl = `https://www.youtube.com/embed/${idMatch[1]}?autoplay=0`;
    }
  } else if (platform === "facebook") {
    embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
  }

  if (!embedUrl) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-xs text-gray-400 font-medium">
          Preview tidak tersedia untuk platform ini.
          <br />
          <span className="text-gray-300">YouTube & Facebook didukung.</span>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm aspect-video w-full">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allowFullScreen
        title="Live stream preview"
        loading="lazy"
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export function TabLiveStream({ settings, onChange, onSave, saving }) {
  const f = (key) => ({
    value: settings[key] ?? "",
    onChange: (e) => onChange(key, e.target.value),
  });

  const streamUrl = settings.stream_url ?? "";
  const embedEnabled = settings.stream_embed_enabled ?? false;

  return (
    <div className="space-y-5">
      {/* Stream Link */}
      <SectionCard
        title="Live Stream Link"
        description="Link yang akan ditampilkan di halaman undangan"
      >
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Stream URL</Label>
              <PlatformBadge url={streamUrl} />
            </div>
            <Input
              placeholder="https://youtube.com/live/..."
              {...f("stream_url")}
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Mendukung YouTube, Instagram Live, Facebook Live, Zoom, atau URL
              lain.
            </p>
          </div>

          <div>
            <Label optional>Judul / Label Tombol</Label>
            <Input
              placeholder="e.g. Saksikan Momen Kami Secara Live"
              {...f("stream_label")}
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Teks yang muncul di atas tombol streaming. Kosongkan untuk pakai
              default.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Schedule */}
      <SectionCard
        title="Jadwal Siaran"
        description="Kapan live stream dimulai dan berakhir"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Tanggal & Jam Mulai</Label>
            <Input type="datetime-local" {...f("stream_start")} />
          </div>
          <div>
            <Label optional>Tanggal & Jam Selesai</Label>
            <Input type="datetime-local" {...f("stream_end")} />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Tombol live stream hanya akan ditampilkan di antara waktu mulai dan
          selesai. Jika kosong, tombol selalu tampil.
        </p>
      </SectionCard>

      {/* Embed toggle */}
      <SectionCard
        title="Embed di Undangan"
        description="Tampilkan player langsung di halaman undangan (hanya untuk YouTube & Facebook)"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Aktifkan embed player
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Tamu dapat menonton langsung tanpa meninggalkan halaman
                undangan.
              </p>
            </div>
            <button
              onClick={() => onChange("stream_embed_enabled", !embedEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none
                ${embedEnabled ? "bg-gray-900" : "bg-gray-200"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
                ${embedEnabled ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </div>

          {/* Live preview */}
          {embedEnabled && streamUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <EmbedPreview url={streamUrl} />
            </div>
          )}

          {embedEnabled && !streamUrl && (
            <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs text-amber-600 font-medium">
                ⚠ Isi Stream URL terlebih dahulu untuk mengaktifkan embed.
              </p>
            </div>
          )}
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton saving={saving} onClick={onSave} />
      </div>
    </div>
  );
}
