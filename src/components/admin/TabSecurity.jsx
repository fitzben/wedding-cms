// ═══════════════════════════════════════════════════════════════════════════════
// TAB: SECURITY

import { useState } from "react";
import { API } from "../../pages/admin";
import { Input, Label, SaveButton, SectionCard } from "./components";

// ═══════════════════════════════════════════════════════════════════════════════
export function TabSecurity({ push }) {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.current_password) e.current_password = "Required";
    if (!form.new_password) e.new_password = "Required";
    if (form.new_password.length < 8) e.new_password = "Min 8 characters";
    if (form.new_password !== form.confirm_password)
      e.confirm_password = "Passwords do not match";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSaving(true);
    try {
      const res = await API.changePassword({
        current_password: form.current_password,
        new_password: form.new_password,
      });
      if (res.error) {
        push(res.error, "error");
        return;
      }
      push("Password changed successfully", "success");
      setForm({ current_password: "", new_password: "", confirm_password: "" });
    } finally {
      setSaving(false);
    }
  };

  const f = (key) => ({
    value: form[key],
    error: !!errors[key],
    onChange: (e) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
      setErrors((p) => ({ ...p, [key]: "" }));
    },
  });

  return (
    <div className="space-y-5">
      <SectionCard
        title="Change Password"
        description="Update your admin login password"
      >
        <div className="space-y-4 max-w-sm">
          <div>
            <Label>Current Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              {...f("current_password")}
            />
            {errors.current_password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.current_password}
              </p>
            )}
          </div>
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              {...f("new_password")}
            />
            {errors.new_password && (
              <p className="text-red-500 text-xs mt-1">{errors.new_password}</p>
            )}
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              {...f("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirm_password}
              </p>
            )}
          </div>
        </div>
        <div className="mt-5">
          <SaveButton
            saving={saving}
            onClick={submit}
            label="Change Password"
          />
        </div>
      </SectionCard>
    </div>
  );
}
