// ═══════════════════════════════════════════════════════════════════════════════
// TAB: USERS

import { useCallback, useEffect, useState } from "react";
import {
  Input,
  Label,
  RoleBadge,
  SaveButton,
  SectionCard,
  Select,
} from "./components";
import { API } from "../../pages/admin";
import LogoLoader from "../LogoLoader";
import * as authService from "../../services/authService";

// ═══════════════════════════════════════════════════════════════════════════════
const MENU_RESOURCES = [
  { key: "dashboard", label: "Dashboard",  icon: "🏠" },
  { key: "guests",    label: "Guests",     icon: "👥" },
  { key: "groups",    label: "Groups",     icon: "🗂️" },
  { key: "rsvp",      label: "RSVP",       icon: "📋" },
  { key: "wishes",    label: "Wishes",     icon: "💌" },
  { key: "journey",   label: "Journey",    icon: "📍" },
  { key: "gallery",   label: "Gallery",    icon: "🖼️" },
  { key: "gifts",     label: "Gifts",      icon: "🎁" },
  { key: "settings",  label: "Settings",   icon: "⚙️", isParent: true },
];

const SETTINGS_TABS = [
  { key: "settings.wedding",    label: "Wedding",     icon: "💍" },
  { key: "settings.features",   label: "Features",    icon: "🔧" },
  { key: "settings.users",      label: "Users",       icon: "👤" },
  { key: "settings.whatsapp",   label: "WhatsApp",    icon: "💬" },
  { key: "settings.livestream", label: "Live Stream", icon: "📺" },
  { key: "settings.dresscode",  label: "Dress Code",  icon: "👗" },
  { key: "settings.security",   label: "Security",    icon: "🔒" },
];

function PermissionManager({ push }) {
  const [permissions, setPermissions] = useState(null);
  const [activeRole, setActiveRole] = useState("partner");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.getPermissions()
      .then((res) => setPermissions(res.permissions || {}))
      .catch(() => push("Failed to load permissions", "error"))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (resource) => {
    setPermissions((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [resource]: !prev[activeRole]?.[resource],
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await API.updatePermissions({
        role: activeRole,
        permissions: permissions[activeRole] || {},
      });
      if (res.error) {
        push(res.error, "error");
        return;
      }
      push(`Permissions for ${activeRole} saved`, "success");
    } finally {
      setSaving(false);
    }
  };

  const rolePerms = permissions?.[activeRole] || {};

  return (
    <SectionCard
      title="Role Permissions"
      description="Atur menu dan fitur apa yang bisa diakses setiap role"
    >
      {/* Role Tabs */}
      <div className="flex gap-2 mb-5">
        {["partner", "parents"].map((role) => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border
              ${activeRole === role
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}
          >
            <RoleBadge role={role} />
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-6 flex justify-center">
          <LogoLoader size={40} text="Loading..." textClassName="text-gray-400 text-xs" />
        </div>
      ) : (
        <div className="space-y-1">
          {MENU_RESOURCES.map(({ key, label, icon, isParent }) => (
            <div key={key}>
              <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-2.5 text-sm font-medium text-gray-700">
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
                <button
                  onClick={() => toggle(key)}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none
                    ${rolePerms[key] ? "bg-gray-900" : "bg-gray-200"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                      ${rolePerms[key] ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>

              {/* Settings sub-tabs — tampilkan jika settings toggle ON */}
              {isParent && rolePerms[key] && (
                <div className="ml-6 mt-1 mb-2 space-y-1 border-l-2 border-gray-100 pl-3">
                  {SETTINGS_TABS.map(({ key: tabKey, label: tabLabel, icon: tabIcon }) => (
                    <div
                      key={tabKey}
                      className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <span>{tabIcon}</span>
                        <span>{tabLabel}</span>
                      </div>
                      <button
                        onClick={() => toggle(tabKey)}
                        className={`relative w-9 h-4 rounded-full transition-colors duration-200 focus:outline-none
                          ${rolePerms[tabKey] ? "bg-gray-700" : "bg-gray-200"}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200
                            ${rolePerms[tabKey] ? "translate-x-4" : "translate-x-0"}`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="pt-4 flex justify-end">
            <SaveButton saving={saving} onClick={handleSave} label="Save Permissions" />
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
const ROLES = ["admin", "partner", "parents"];
const EMPTY_USER = { name: "", email: "", password: "", role: "parents" };

export function UserModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY_USER);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const isEdit = !!initial;

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name || "",
              email: initial.email || "",
              password: "",
              role: initial.role || "parents",
            }
          : EMPTY_USER,
      );
      setErrors({});
    }
  }, [open, initial]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (!isEdit && !form.password.trim()) e.password = "Required";
    if (form.password && form.password.length < 6)
      e.password = "Min 6 characters";
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
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-100 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {isEdit ? "Edit User" : "Add New User"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit ? "Update user information" : "Create an admin account"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input
              placeholder="e.g. Budi Santoso"
              value={form.name}
              error={errors.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }));
                setErrors((p) => ({ ...p, name: "" }));
              }}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="e.g. budi@example.com"
              value={form.email}
              error={errors.email}
              onChange={(e) => {
                setForm((p) => ({ ...p, email: e.target.value }));
                setErrors((p) => ({ ...p, email: "" }));
              }}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <Label>
              {isEdit ? "New Password" : "Password"}
              {isEdit && (
                <span className="ml-1.5 text-gray-300 font-normal normal-case tracking-normal">
                  leave blank to keep current
                </span>
              )}
            </Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={form.password}
              error={errors.password}
              onChange={(e) => {
                setForm((p) => ({ ...p, password: e.target.value }));
                setErrors((p) => ({ ...p, password: "" }));
              }}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
          <div>
            <Label>Role</Label>
            <Select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            >
              <option value="admin">Admin — Full access</option>
              <option value="partner">
                Partner — Can view & manage guests
              </option>
              <option value="parents">Parents — View only</option>
            </Select>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <SaveButton
            saving={saving}
            onClick={submit}
            label={isEdit ? "Save Changes" : "Create User"}
          />
        </div>
      </div>
    </div>
  );
}

export function TabUsers({ push }) {
  const currentUser = authService.getAdminUser();
  const isAdmin = currentUser?.role === "admin";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await API.getUsers();
      setUsers(data.users || data || []);
    } catch {
      push("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (form) => {
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    if (editUser) {
      const res = await API.updateUser(editUser.id, payload);
      if (res.error) {
        push(res.error, "error");
        return;
      }
      push("User updated", "success");
    } else {
      const res = await API.createUser(payload);
      if (res.error) {
        push(res.error, "error");
        return;
      }
      push("User created", "success");
    }
    load();
  };

  const handleDelete = async (user) => {
    const res = await API.deleteUser(user.id);
    if (!res.ok && res.status !== 204) {
      push("Failed to delete user", "error");
      return;
    }
    push("User removed", "success");
    setConfirmDelete(null);
    load();
  };

  return (
    <>
      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editUser}
      />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm mx-4 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Remove User
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to remove{" "}
              <strong>{confirmDelete.name}</strong>? They will lose all admin
              access.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <SectionCard
          title="Admin Users"
          description="Manage who has access to this admin panel"
          action={
            <button
              onClick={() => {
                setEditUser(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm"
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
              Add User
            </button>
          }
        >
          <div className="mb-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-2">
              <RoleBadge role="admin" />
              <span>
                Full access — can change settings, manage guests, and manage
                users
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RoleBadge role="partner" />
              <span>
                Can view and manage guests, cannot change settings or users
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RoleBadge role="parents" />
              <span>
                View only — can see guest list and RSVPs but cannot edit
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-8 flex items-center justify-center">
              <LogoLoader
                text="Loading users…"
                size={52}
                textClassName="text-gray-400 font-light italic text-sm"
              />
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {(u.name || u.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {u.name || "—"}
                      </div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={u.role} />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditUser(u);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => setConfirmDelete(u)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="py-8 text-center text-gray-400 text-sm">
                  No users found.
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {isAdmin && <PermissionManager push={push} />}
      </div>
    </>
  );
}
