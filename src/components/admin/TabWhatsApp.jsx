// ═══════════════════════════════════════════════════════════════════════════════
// TAB: WHATSAPP

import { Label, SaveButton, SectionCard, Textarea } from "./components";

// ═══════════════════════════════════════════════════════════════════════════════
const WA_VARIABLES = [
  "{nama}",
  "{link}",
  "{tanggal_hm}",
  "{tanggal_resepsi}",
  "{venue_resepsi}",
  "{venue_holy_matrimony}",
];

export function TabWhatsApp({ settings, onChange, onSave, saving }) {
  const insertVar = (v) => {
    onChange("wa_template", (settings.wa_template || "") + v);
  };

  return (
    <div className="space-y-5">
      <SectionCard
        title="WhatsApp Blast Template"
        description="Template pesan yang dikirim ke setiap tamu"
      >
        <div className="mb-3">
          <Label>Available Variables</Label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {WA_VARIABLES.map((v) => (
              <button
                key={v}
                onClick={() => insertVar(v)}
                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-900 hover:text-white text-gray-600 rounded-lg text-xs font-mono font-semibold transition-all border border-gray-200 hover:border-gray-900"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <Label>Message Template</Label>
        <Textarea
          rows={10}
          placeholder={`Halo {nama},\n\nKami dengan penuh sukacita mengundang kamu ke pernikahan kami.\n\n📅 Holy Matrimony: {tanggal_hm}\n📍 Venue: {venue_holy_matrimony}\n\n📅 Resepsi: {tanggal_resepsi}\n📍 Venue: {venue_resepsi}\n\nSilakan konfirmasi kehadiranmu di:\n{link}\n\nTerima kasih 🙏`}
          value={settings.wa_template ?? ""}
          onChange={(e) => onChange("wa_template", e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-2">
          Klik variabel di atas untuk menyisipkannya ke template. Variabel akan
          diganti otomatis saat blast dikirim.
        </p>
      </SectionCard>

      <SectionCard
        title="Preview"
        description="Contoh pesan yang akan diterima tamu"
      >
        <div className="bg-[#ECE5DD] rounded-xl p-4 min-h-[120px]">
          <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm max-w-xs text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {(settings.wa_template || "")
              .replace("{nama}", "Budi Santoso")
              .replace("{link}", "https://undangan.com/invite/budi")
              .replace("{tanggal_hm}", "12 Juli 2025")
              .replace("{tanggal_resepsi}", "12 Juli 2025")
              .replace("{venue_resepsi}", "Ballroom The Ritz Carlton")
              .replace("{venue_holy_matrimony}", "Gereja Santa Maria") || (
              <span className="text-gray-400 italic">Template kosong</span>
            )}
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton saving={saving} onClick={onSave} />
      </div>
    </div>
  );
}
