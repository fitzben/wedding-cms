export const CATEGORIES = ["friend", "family", "colleague"];
export const PRIORITIES = ["low", "medium", "high"];
export const IMPORTANCES = ["normal", "vip", "vvip"];
export const INVITE_TYPES = [
  { value: "digital", label: "Digital" },
  { value: "physical", label: "Fisik" },
  { value: "both", label: "Digital + Fisik" },
];
export const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  phone_number: "",
  category: "friend",
  pax_allowed: 1,
  priority: "medium",
  importance: "normal",
  notes: "",
  guest_group_id: "",
  invitation_type: "digital",
  event_access_override: "", // '' = inherit from group
  enable_display_name: false,
  display_name: "",
};
export const EVENT_ACCESS_OPTIONS = [
  { value: "", label: "Ikut Group", icon: "↩️", hint: true },
  { value: "both", label: "HM + Resepsi", icon: "🎊" },
  { value: "hm_only", label: "HM Only", icon: "⛪" },
  { value: "resepsi_only", label: "Resepsi Only", icon: "🥂" },
];
