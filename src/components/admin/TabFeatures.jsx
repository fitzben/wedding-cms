// ═══════════════════════════════════════════════════════════════════════════════
// TAB: FEATURES

import { Label, SaveButton, SectionCard, Textarea, Toggle } from "./components";

// ═══════════════════════════════════════════════════════════════════════════════
export function TabFeatures({ settings, onChange, onSave, saving }) {
  const toggle = (key) => onChange(key, !settings[key]);

  return (
    <div className="space-y-5">
      <SectionCard
        title="Feature Toggles"
        description="Turn features on or off for all guests"
      >
        <Toggle
          checked={!!settings.rsvp_enabled}
          onChange={() => toggle("rsvp_enabled")}
          label="RSVP"
          description="Allow guests to confirm their attendance"
        />
        <Toggle
          checked={!!settings.wishes_enabled}
          onChange={() => toggle("wishes_enabled")}
          label="Ucapan & Doa"
          description="Allow guests to send messages and wishes"
        />
        <Toggle
          checked={!!settings.gift_enabled}
          onChange={() => toggle("gift_enabled")}
          label="Amplop Digital / Gift"
          description="Show bank account and gift registry info"
        />
      </SectionCard>

      <SectionCard
        title="Maintenance Mode"
        description="Temporarily take the invitation offline"
        action={
          settings.maintenance_mode ? (
            <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
              ACTIVE
            </span>
          ) : null
        }
      >
        <Toggle
          checked={!!settings.maintenance_mode}
          onChange={() => toggle("maintenance_mode")}
          label="Maintenance Mode"
          description="Guests will see a 'Coming soon' page instead of the invitation"
        />
        {settings.maintenance_mode && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
            ⚠️ Maintenance mode is <strong>ON</strong>. Your invitation is
            currently offline for all guests.
          </div>
        )}
        <div className="mt-4">
          <Label optional>Maintenance Message</Label>
          <Textarea
            rows={2}
            placeholder="e.g. We're preparing something special. Please check back soon!"
            value={settings.maintenance_message ?? ""}
            onChange={(e) => onChange("maintenance_message", e.target.value)}
          />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton saving={saving} onClick={onSave} />
      </div>
    </div>
  );
}
