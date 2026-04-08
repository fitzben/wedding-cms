// ═══════════════════════════════════════════════════════════════════════════════
// TAB: WHATSAPP

import { Label, SaveButton, SectionCard, Textarea } from "./components";

// ═══════════════════════════════════════════════════════════════════════════════
const WA_VARIABLES = [
  "{nama}",
  "{link}",
  "{tanggal_hm}",
  "{waktu_hm}",
  "{venue_holy_matrimony}",
  "{hm_maps_url}",
  "{tanggal_resepsi}",
  "{waktu_resepsi}",
  "{venue_resepsi}",
  "{resepsi_maps_url}",
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
              .replace("{tanggal_hm}", "Minggu, 31 Mei 2026\n09.00 - 11.00 WIB")
              .replace("{waktu_hm}", "09.00 - 11.00 WIB")
              .replace("{tanggal_resepsi}", "Minggu, 31 Mei 2026\n12.00 - 15.00 WIB")
              .replace("{waktu_resepsi}", "12.00 - 15.00 WIB")
              .replace("{venue_resepsi}", "Ballroom The Ritz Carlton")
              .replace("{venue_holy_matrimony}", "Gereja Santa Maria")
              .replace("{hm_maps_url}", "https://maps.google.com")
              .replace("{resepsi_maps_url}", "https://maps.google.com") || (
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
