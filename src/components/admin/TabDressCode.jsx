// ═══════════════════════════════════════════════════════════════════════════════
// TAB: DRESS CODE

import { useState } from "react";
import { Input, Label, SaveButton, SectionCard, Textarea } from "./components";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function uploadDressCodePhoto(file, token) {
  const res = await fetch(`${BASE_URL}/api/admin/dresscode/upload-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      filename: file.name,
      content_type: file.type,
    }),
  });
  if (!res.ok) throw new Error("Failed to get upload URL");
  const { upload_url, public_url, key } = await res.json();

  await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  return { public_url, key };
}

async function deleteDressCodePhoto(key, token) {
  await fetch(`${BASE_URL}/api/admin/dresscode/delete-photo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ key }),
  });
}

// ─── Dress code photo upload ──────────────────────────────────────────────────
function DressCodePhotoUpload({ photos, onChange }) {
  const [uploading, setUploading] = useState(false);
  const MAX_PHOTOS = 6;

  const getToken = () => localStorage.getItem("token") || "";

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_PHOTOS - photos.length;
    const toUpload = files.slice(0, remaining);
    if (!toUpload.length) return;

    setUploading(true);
    try {
      const uploaded = await Promise.all(
        toUpload.map((file) => uploadDressCodePhoto(file, getToken()))
      );
      onChange([...photos, ...uploaded]);
    } catch {
      alert("Gagal upload foto. Coba lagi.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = async (index) => {
    const photo = photos[index];
    try {
      await deleteDressCodePhoto(photo.key, getToken());
    } catch { /* ignore — remove from UI anyway */ }
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo, i) => (
            <div key={i} className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-100">
              <img
                src={photo.public_url}
                alt={`Dress code reference ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                <button
                  onClick={() => handleRemove(i)}
                  className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center transition-all shadow-md"
                  title="Hapus foto"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                {i + 1}
              </div>
            </div>
          ))}

          {photos.length < MAX_PHOTOS && (
            <label className="relative aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-gray-300 hover:bg-gray-100 transition-all">
              {uploading ? (
                <svg className="animate-spin w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  <svg className="w-6 h-6 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs text-gray-400">Tambah foto</span>
                  <span className="text-[10px] text-gray-300 mt-0.5">{photos.length}/{MAX_PHOTOS}</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      )}

      {photos.length === 0 && (
        <label className="flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 cursor-pointer hover:border-gray-300 hover:bg-gray-100 transition-all">
          {uploading ? (
            <svg className="animate-spin w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <>
              <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-400 font-medium">Upload foto referensi dress code</p>
              <p className="text-xs text-gray-300 mt-1">Maks. {MAX_PHOTOS} foto · JPG, PNG, WebP</p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}

// ─── Color swatch card ────────────────────────────────────────────────────────
function ColorSwatch({ color, onRemove }) {
  // Determine if hex is light (for text contrast)
  // const isLight = (hex) => {
  //   const c = hex.replace("#", "");
  //   const r = parseInt(c.slice(0, 2), 16);
  //   const g = parseInt(c.slice(2, 4), 16);
  //   const b = parseInt(c.slice(4, 6), 16);
  //   return (r * 299 + g * 587 + b * 114) / 1000 > 160;
  // };

  // const light = isLight(color.hex || "#ffffff");

  return (
    <div
      className="group relative flex flex-col items-center gap-2 p-3 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-all"
      style={{ minWidth: 90 }}
    >
      {/* Color circle */}
      <div
        className="w-14 h-14 rounded-full border border-black/10 shadow-inner relative flex items-center justify-center"
        style={{ background: color.hex }}
      >
        {/* Remove button */}
        <button
          onClick={() => onRemove(color.id)}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          title="Hapus warna"
        >
          ×
        </button>
      </div>

      {/* Hex code */}
      <span className="text-[10px] font-mono text-gray-500 tracking-wide">
        {color.hex.toUpperCase()}
      </span>

      {/* Label */}
      {color.label && (
        <span className="text-[10px] text-gray-400 text-center leading-tight max-w-[80px] truncate">
          {color.label}
        </span>
      )}
    </div>
  );
}

// ─── Add color form ───────────────────────────────────────────────────────────
function AddColorForm({ onAdd }) {
  const [hex, setHex] = useState("#C9A84C");
  const [label, setLabel] = useState("");

  const handleAdd = () => {
    if (!hex) return;
    onAdd({ id: Date.now(), hex, label: label.trim() });
    setLabel("");
  };

  return (
    <div className="flex items-end gap-3 flex-wrap">
      {/* Color picker */}
      <div>
        <Label>Pilih Warna</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
            style={{ padding: "2px" }}
          />
          <input
            type="text"
            value={hex}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setHex(v);
            }}
            maxLength={7}
            className="w-24 px-3 py-2 rounded-xl border border-gray-200 text-sm font-mono outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 bg-white uppercase"
          />
        </div>
      </div>

      {/* Label */}
      <div className="flex-1 min-w-[140px]">
        <Label optional>Nama Warna</Label>
        <Input
          placeholder="e.g. Dusty Rose, Navy Blue"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
      </div>

      {/* Add button */}
      <button
        onClick={handleAdd}
        disabled={hex.length !== 7}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm disabled:opacity-40 mb-0.5"
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
        Tambah
      </button>
    </div>
  );
}

// ─── Palette preview ──────────────────────────────────────────────────────────
function PalettePreview({ colors }) {
  if (!colors.length) return null;

  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden">
      {/* Color strips */}
      <div className="flex h-16">
        {colors.map((c) => (
          <div
            key={c.id}
            className="flex-1 transition-all duration-300"
            style={{ background: c.hex }}
            title={c.label || c.hex}
          />
        ))}
      </div>
      {/* Labels row */}
      <div className="flex bg-white border-t border-gray-50">
        {colors.map((c) => (
          <div key={c.id} className="flex-1 py-2 px-1 text-center">
            <div
              className="w-3 h-3 rounded-full mx-auto mb-1 border border-black/10"
              style={{ background: c.hex }}
            />
            {c.label && (
              <p className="text-[9px] text-gray-400 truncate">{c.label}</p>
            )}
            <p className="text-[9px] font-mono text-gray-300">
              {c.hex.toUpperCase()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export function TabDressCode({ settings, onChange, onSave, saving }) {
  // Colors stored as JSON string in settings: dress_code_colors = '[{id,hex,label}]'
  const parseColors = () => {
    try {
      return JSON.parse(settings.dress_code_colors || "[]");
    } catch {
      return [];
    }
  };

  const colors = parseColors();

  const parsePhotos = () => {
    try {
      return JSON.parse(settings.dress_code_photos || "[]");
    } catch { return []; }
  };
  const photos = parsePhotos();

  const handlePhotosChange = (updated) => {
    onChange("dress_code_photos", JSON.stringify(updated));
  };

  const persistColors = (updated) => {
    onChange("dress_code_colors", JSON.stringify(updated));
  };

  const handleAdd = (newColor) => {
    persistColors([...colors, newColor]);
  };

  const handleRemove = (id) => {
    persistColors(colors.filter((c) => c.id !== id));
  };

  const f = (key) => ({
    value: settings[key] ?? "",
    onChange: (e) => onChange(key, e.target.value),
  });

  return (
    <div className="space-y-5">
      {/* Color Palette */}
      <SectionCard
        title="Color Palette"
        description="Warna dress code yang akan ditampilkan di halaman undangan"
      >
        <div className="space-y-5">
          {/* Add form */}
          <AddColorForm onAdd={handleAdd} />

          {/* Current palette */}
          {colors.length > 0 ? (
            <div className="space-y-4">
              <Label>Palette Saat Ini ({colors.length} warna)</Label>
              <div className="flex flex-wrap gap-3">
                {colors.map((c) => (
                  <ColorSwatch key={c.id} color={c} onRemove={handleRemove} />
                ))}
              </div>

              {/* Visual strip preview */}
              <div>
                <Label>Preview</Label>
                <PalettePreview colors={colors} />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-sm text-gray-400 font-medium">
                Belum ada warna ditambahkan
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Pilih warna dan klik Tambah untuk mulai membangun palette
              </p>
            </div>
          )}

          {/* Reset all */}
          {colors.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => persistColors([])}
                className="text-xs text-red-400 hover:text-red-600 transition-colors font-medium"
              >
                Reset semua warna
              </button>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Foto Referensi */}
      <SectionCard
        title="Foto Referensi"
        description="Contoh pakaian yang bisa ditampilkan ke tamu (maks. 6 foto)"
      >
        <DressCodePhotoUpload
          photos={photos}
          onChange={handlePhotosChange}
        />
      </SectionCard>

      {/* Notes */}
      <SectionCard
        title="Catatan Dress Code"
        description="Instruksi atau catatan tambahan untuk tamu"
      >
        <div className="space-y-4">
          <div>
            <Label optional>Tema / Label</Label>
            <Input
              placeholder="e.g. Formal Elegant, Garden Party Chic"
              {...f("dress_code_theme")}
            />
          </div>
          <div>
            <Label optional>Catatan untuk Tamu</Label>
            <Textarea
              rows={3}
              placeholder="e.g. We kindly request our guests to wear colors that are soft and elegant. Please avoid wearing white and deep black."
              {...f("dress_code_notes")}
            />
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton saving={saving} onClick={onSave} />
      </div>
    </div>
  );
}
