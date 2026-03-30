// ═══════════════════════════════════════════════════════════════════════════════
// TAB: DRESS CODE

import { useState } from "react";
import { Input, Label, SaveButton, SectionCard, Textarea } from "./components";

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
              placeholder="e.g. Kami mengharapkan tamu untuk mengenakan warna-warna lembut dan elegan. Hindari warna putih dan hitam pekat."
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
