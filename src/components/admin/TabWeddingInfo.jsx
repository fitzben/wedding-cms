// ═══════════════════════════════════════════════════════════════════════════════
// TAB: WEDDING INFO

import {
  Input,
  Label,
  SaveButton,
  SectionCard,
  Select,
  Textarea,
} from "./components";

// ═══════════════════════════════════════════════════════════════════════════════
export function TabWedding({ settings, onChange, onSave, saving }) {
  const f = (key) => ({
    value: settings[key] ?? "",
    onChange: (e) => onChange(key, e.target.value),
  });

  return (
    <div className="space-y-5">
      {/* Couple */}
      <SectionCard
        title="Couple Information"
        description="Names shown on the invitation"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Bride Full Name</Label>
            <Input placeholder="e.g. Anastasia Putri" {...f("bride_name")} />
          </div>
          <div>
            <Label>Groom Full Name</Label>
            <Input placeholder="e.g. Budi Santoso" {...f("groom_name")} />
          </div>
          <div>
            <Label>Bride Nickname</Label>
            <Input placeholder="e.g. Ana" {...f("bride_nickname")} />
          </div>
          <div>
            <Label>Groom Nickname</Label>
            <Input placeholder="e.g. Budi" {...f("groom_nickname")} />
          </div>
          <div className="md:col-span-2">
            <Label optional>Couple Quote / Caption</Label>
            <Textarea
              rows={2}
              placeholder="e.g. And they lived happily ever after..."
              {...f("couple_quote")}
            />
          </div>
        </div>
      </SectionCard>

      {/* Social & Family */}
      <SectionCard
        title="Social & Family"
        description="Instagram handles and parental information"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em]">
                Bride's Side
              </h4>
              <div>
                <Label optional>Instagram Handle</Label>
                <Input placeholder="@username" {...f("bride_instagram")} />
              </div>
              <div>
                <Label>Father's Name</Label>
                <Input placeholder="Full Name" {...f("bride_father")} />
              </div>
              <div>
                <Label>Mother's Name</Label>
                <Input placeholder="Full Name" {...f("bride_mother")} />
              </div>
              <div>
                <Label>Child Position</Label>
                <Input
                  placeholder="e.g. Putri Pertama"
                  {...f("bride_child_order")}
                />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">
                Groom's Side
              </h4>
              <div>
                <Label optional>Instagram Handle</Label>
                <Input placeholder="@username" {...f("groom_instagram")} />
              </div>
              <div>
                <Label>Father's Name</Label>
                <Input placeholder="Full Name" {...f("groom_father")} />
              </div>
              <div>
                <Label>Mother's Name</Label>
                <Input placeholder="Full Name" {...f("groom_mother")} />
              </div>
              <div>
                <Label>Child Position</Label>
                <Input
                  placeholder="e.g. Putra Kedua"
                  {...f("groom_child_order")}
                />
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Holy Matrimony */}
      <SectionCard
        title="Holy Matrimony"
        description="Church / religious ceremony details"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Venue Name</Label>
            <Input
              placeholder="e.g. GKI Pondok Indah"
              {...f("hm_venue_name")}
            />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" {...f("hm_date")} />
          </div>
          <div>
            <Label>Start Time</Label>
            <Input type="time" {...f("hm_time_start")} />
          </div>
          <div>
            <Label>End Time</Label>
            <Input type="time" {...f("hm_time_end")} />
          </div>
          <div className="md:col-span-2">
            <Label>Full Address</Label>
            <Textarea
              rows={2}
              placeholder="e.g. Jl. Metro Pondok Indah No.1, Jakarta Selatan"
              {...f("hm_address")}
            />
          </div>
          <div className="md:col-span-2">
            <Label optional>Google Maps URL</Label>
            <Input
              placeholder="https://maps.google.com/..."
              {...f("hm_maps_url")}
            />
          </div>
        </div>
      </SectionCard>

      {/* Resepsi */}
      <SectionCard title="Resepsi" description="Reception ceremony details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Venue Name</Label>
            <Input
              placeholder="e.g. Ballroom The Ritz Carlton"
              {...f("resepsi_venue_name")}
            />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" {...f("resepsi_date")} />
          </div>
          <div>
            <Label>Start Time</Label>
            <Input type="time" {...f("resepsi_time_start")} />
          </div>
          <div>
            <Label>End Time</Label>
            <Input type="time" {...f("resepsi_time_end")} />
          </div>
          <div className="md:col-span-2">
            <Label>Full Address</Label>
            <Textarea
              rows={2}
              placeholder="e.g. Jl. MH Thamrin No.1, Jakarta Pusat"
              {...f("resepsi_address")}
            />
          </div>
          <div className="md:col-span-2">
            <Label optional>Google Maps URL</Label>
            <Input
              placeholder="https://maps.google.com/..."
              {...f("resepsi_maps_url")}
            />
          </div>
        </div>
      </SectionCard>

      {/* Bank Accounts */}
      <SectionCard
        title="Bank Accounts & Gift"
        description="Details for the digital envelope"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label optional>Bride Bank Name</Label>
            <Input placeholder="e.g. BCA" {...f("bride_bank_name")} />
          </div>
          <div>
            <Label optional>Groom Bank Name</Label>
            <Input placeholder="e.g. Mandiri" {...f("groom_bank_name")} />
          </div>

          <div>
            <Label optional>Bride Account Number</Label>
            <Input placeholder="e.g. 12345678" {...f("bride_bank_account")} />
          </div>
          <div>
            <Label optional>Groom Account Number</Label>
            <Input placeholder="e.g. 098765432" {...f("groom_bank_account")} />
          </div>

          <div>
            <Label optional>Bride Account Name</Label>
            <Input
              placeholder="e.g. 12345678"
              {...f("bride_bank_account_name")}
            />
          </div>
          <div>
            <Label optional>Groom Account Name</Label>
            <Input
              placeholder="e.g. 098765432"
              {...f("groom_bank_account_name")}
            />
          </div>
        </div>
      </SectionCard>

      {/* Countdown */}
      <SectionCard
        title="Countdown Timer"
        description="Which event date the countdown targets"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Countdown Target</Label>
            <Select
              value={settings.countdown_target ?? "resepsi"}
              onChange={(e) => onChange("countdown_target", e.target.value)}
            >
              <option value="hm">Holy Matrimony</option>
              <option value="resepsi">Resepsi</option>
            </Select>
          </div>
          <div>
            <Label optional>Override Countdown Date</Label>
            <Input type="datetime-local" {...f("countdown_override_date")} />
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton saving={saving} onClick={onSave} />
      </div>
    </div>
  );
}
