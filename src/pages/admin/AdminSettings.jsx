import { useState, useEffect, useCallback } from 'react';

// ─── API ─────────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const API = {
  getSettings: () =>
    fetch(`${BASE_URL}/api/admin/settings`, { headers: getHeaders() }).then(r => r.json()),
  saveSettings: (body) =>
    fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(r => r.json()),

  getUsers: () =>
    fetch(`${BASE_URL}/api/admin/users`, { headers: getHeaders() }).then(r => r.json()),
  createUser: (body) =>
    fetch(`${BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(r => r.json()),
  updateUser: (id, body) =>
    fetch(`${BASE_URL}/api/admin/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(r => r.json()),
  deleteUser: (id) =>
    fetch(`${BASE_URL}/api/admin/users/${id}`, { method: 'DELETE', headers: getHeaders() }),

  changePassword: (body) =>
    fetch(`${BASE_URL}/api/admin/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(r => r.json()),
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto border
          ${t.type === 'success' ? 'bg-gray-900 text-white border-gray-700' : ''}
          ${t.type === 'error'   ? 'bg-red-900 text-red-100 border-red-700' : ''}
          ${t.type === 'info'    ? 'bg-blue-900 text-blue-100 border-blue-700' : ''}
        `}>
          {t.type === 'success' && <span className="text-emerald-400">✓</span>}
          {t.type === 'error'   && <span className="text-red-400">✕</span>}
          {t.type === 'info'    && <span className="text-blue-300">ℹ</span>}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────
function Label({ children, optional }) {
  return (
    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
      {children}
      {optional && <span className="ml-1.5 text-gray-300 font-normal normal-case tracking-normal">optional</span>}
    </label>
  );
}
function Input({ error, ...props }) {
  return (
    <input
      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all
        ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 bg-white'}`}
      {...props}
    />
  );
}
function Textarea({ ...props }) {
  return (
    <textarea
      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-gray-400 focus:ring-2 focus:ring-gray-100 resize-none bg-white"
      {...props}
    />
  );
}
function Select({ children, ...props }) {
  return (
    <select
      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-gray-400 focus:ring-2 focus:ring-gray-100 bg-white"
      {...props}
    >
      {children}
    </select>
  );
}
function SaveButton({ saving, onClick, label = 'Save Changes' }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm disabled:opacity-60"
    >
      {saving
        ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</>
        : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>{label}</>
      }
    </button>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
      <div>
        <div className="text-sm font-semibold text-gray-800">{label}</div>
        {description && <div className="text-xs text-gray-400 mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none
          ${checked ? 'bg-gray-900' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
          ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({ title, description, children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────
const ROLE_STYLES = {
  admin:   'bg-red-50 text-red-600 border-red-100',
  partner: 'bg-rose-50 text-rose-600 border-rose-100',
  parents: 'bg-amber-50 text-amber-600 border-amber-100',
};
function RoleBadge({ role }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${ROLE_STYLES[role] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
      {role}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: WEDDING INFO
// ═══════════════════════════════════════════════════════════════════════════════
function TabWedding({ settings, onChange, onSave, saving }) {
  const f = (key) => ({
    value: settings[key] ?? '',
    onChange: (e) => onChange(key, e.target.value),
  });

  return (
    <div className="space-y-5">
      {/* Couple */}
      <SectionCard title="Couple Information" description="Names shown on the invitation">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Bride Full Name</Label><Input placeholder="e.g. Anastasia Putri" {...f('bride_name')} /></div>
          <div><Label>Groom Full Name</Label><Input placeholder="e.g. Budi Santoso" {...f('groom_name')} /></div>
          <div><Label>Bride Nickname</Label><Input placeholder="e.g. Ana" {...f('bride_nickname')} /></div>
          <div><Label>Groom Nickname</Label><Input placeholder="e.g. Budi" {...f('groom_nickname')} /></div>
          <div className="md:col-span-2">
            <Label optional>Couple Quote / Caption</Label>
            <Textarea rows={2} placeholder="e.g. And they lived happily ever after..." {...f('couple_quote')} />
          </div>
        </div>
      </SectionCard>

      {/* Holy Matrimony */}
      <SectionCard title="Holy Matrimony" description="Church / religious ceremony details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Venue Name</Label><Input placeholder="e.g. GKI Pondok Indah" {...f('hm_venue_name')} /></div>
          <div><Label>Date</Label><Input type="date" {...f('hm_date')} /></div>
          <div><Label>Start Time</Label><Input type="time" {...f('hm_time_start')} /></div>
          <div><Label>End Time</Label><Input type="time" {...f('hm_time_end')} /></div>
          <div className="md:col-span-2"><Label>Full Address</Label><Textarea rows={2} placeholder="e.g. Jl. Metro Pondok Indah No.1, Jakarta Selatan" {...f('hm_address')} /></div>
          <div className="md:col-span-2"><Label optional>Google Maps URL</Label><Input placeholder="https://maps.google.com/..." {...f('hm_maps_url')} /></div>
        </div>
      </SectionCard>

      {/* Resepsi */}
      <SectionCard title="Resepsi" description="Reception ceremony details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Venue Name</Label><Input placeholder="e.g. Ballroom The Ritz Carlton" {...f('resepsi_venue_name')} /></div>
          <div><Label>Date</Label><Input type="date" {...f('resepsi_date')} /></div>
          <div><Label>Start Time</Label><Input type="time" {...f('resepsi_time_start')} /></div>
          <div><Label>End Time</Label><Input type="time" {...f('resepsi_time_end')} /></div>
          <div className="md:col-span-2"><Label>Full Address</Label><Textarea rows={2} placeholder="e.g. Jl. MH Thamrin No.1, Jakarta Pusat" {...f('resepsi_address')} /></div>
          <div className="md:col-span-2"><Label optional>Google Maps URL</Label><Input placeholder="https://maps.google.com/..." {...f('resepsi_maps_url')} /></div>
        </div>
      </SectionCard>

      {/* Countdown */}
      <SectionCard title="Countdown Timer" description="Which event date the countdown targets">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Countdown Target</Label>
            <Select value={settings.countdown_target ?? 'resepsi'} onChange={e => onChange('countdown_target', e.target.value)}>
              <option value="hm">Holy Matrimony</option>
              <option value="resepsi">Resepsi</option>
            </Select>
          </div>
          <div><Label optional>Override Countdown Date</Label><Input type="datetime-local" {...f('countdown_override_date')} /></div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton saving={saving} onClick={onSave} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: FEATURES
// ═══════════════════════════════════════════════════════════════════════════════
function TabFeatures({ settings, onChange, onSave, saving }) {
  const toggle = (key) => onChange(key, !settings[key]);

  return (
    <div className="space-y-5">
      <SectionCard title="Feature Toggles" description="Turn features on or off for all guests">
        <Toggle
          checked={!!settings.rsvp_enabled}
          onChange={() => toggle('rsvp_enabled')}
          label="RSVP"
          description="Allow guests to confirm their attendance"
        />
        <Toggle
          checked={!!settings.wishes_enabled}
          onChange={() => toggle('wishes_enabled')}
          label="Ucapan & Doa"
          description="Allow guests to send messages and wishes"
        />
        <Toggle
          checked={!!settings.gift_enabled}
          onChange={() => toggle('gift_enabled')}
          label="Amplop Digital / Gift"
          description="Show bank account and gift registry info"
        />
      </SectionCard>

      <SectionCard
        title="Maintenance Mode"
        description="Temporarily take the invitation offline"
        action={
          settings.maintenance_mode
            ? <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">ACTIVE</span>
            : null
        }
      >
        <Toggle
          checked={!!settings.maintenance_mode}
          onChange={() => toggle('maintenance_mode')}
          label="Maintenance Mode"
          description="Guests will see a 'Coming soon' page instead of the invitation"
        />
        {settings.maintenance_mode && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
            ⚠️ Maintenance mode is <strong>ON</strong>. Your invitation is currently offline for all guests.
          </div>
        )}
        <div className="mt-4">
          <Label optional>Maintenance Message</Label>
          <Textarea
            rows={2}
            placeholder="e.g. We're preparing something special. Please check back soon!"
            value={settings.maintenance_message ?? ''}
            onChange={e => onChange('maintenance_message', e.target.value)}
          />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton saving={saving} onClick={onSave} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: USERS
// ═══════════════════════════════════════════════════════════════════════════════
const ROLES = ['admin', 'partner', 'parents'];
const EMPTY_USER = { name: '', email: '', password: '', role: 'parents' };

function UserModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY_USER);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const isEdit = !!initial;

  useEffect(() => {
    if (open) {
      setForm(initial ? { name: initial.name || '', email: initial.email || '', password: '', role: initial.role || 'parents' } : EMPTY_USER);
      setErrors({});
    }
  }, [open, initial]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!isEdit && !form.password.trim()) e.password = 'Required';
    if (form.password && form.password.length < 6) e.password = 'Min 6 characters';
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try { await onSave(form); onClose(); } finally { setSaving(false); }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-100 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{isEdit ? 'Edit User' : 'Add New User'}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{isEdit ? 'Update user information' : 'Create an admin account'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div><Label>Full Name</Label>
            <Input placeholder="e.g. Budi Santoso" value={form.name} error={errors.name}
              onChange={e => { setForm(p => ({...p, name: e.target.value})); setErrors(p => ({...p, name: ''})); }} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div><Label>Email</Label>
            <Input type="email" placeholder="e.g. budi@example.com" value={form.email} error={errors.email}
              onChange={e => { setForm(p => ({...p, email: e.target.value})); setErrors(p => ({...p, email: ''})); }} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div><Label>{isEdit ? 'New Password' : 'Password'}{isEdit && <span className="ml-1.5 text-gray-300 font-normal normal-case tracking-normal">leave blank to keep current</span>}</Label>
            <Input type="password" placeholder="••••••••" value={form.password} error={errors.password}
              onChange={e => { setForm(p => ({...p, password: e.target.value})); setErrors(p => ({...p, password: ''})); }} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <div><Label>Role</Label>
            <Select value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))}>
              <option value="admin">Admin — Full access</option>
              <option value="partner">Partner — Can view & manage guests</option>
              <option value="parents">Parents — View only</option>
            </Select>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">Cancel</button>
          <SaveButton saving={saving} onClick={submit} label={isEdit ? 'Save Changes' : 'Create User'} />
        </div>
      </div>
    </div>
  );
}

function TabUsers({ push }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const data = await API.getUsers(); setUsers(data.users || data || []); }
    catch { push('Failed to load users', 'error'); }
    finally { setLoading(false); }
  }, [push]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (form) => {
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    if (editUser) {
      const res = await API.updateUser(editUser.id, payload);
      if (res.error) { push(res.error, 'error'); return; }
      push('User updated', 'success');
    } else {
      const res = await API.createUser(payload);
      if (res.error) { push(res.error, 'error'); return; }
      push('User created', 'success');
    }
    load();
  };

  const handleDelete = async (user) => {
    const res = await API.deleteUser(user.id);
    if (!res.ok && res.status !== 204) { push('Failed to delete user', 'error'); return; }
    push('User removed', 'success');
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm mx-4 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Remove User</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to remove <strong>{confirmDelete.name}</strong>? They will lose all admin access.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600">Remove</button>
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
              onClick={() => { setEditUser(null); setModalOpen(true); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              Add User
            </button>
          }
        >
          <div className="mb-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-2"><RoleBadge role="admin" /><span>Full access — can change settings, manage guests, and manage users</span></div>
            <div className="flex items-center gap-2"><RoleBadge role="partner" /><span>Can view and manage guests, cannot change settings or users</span></div>
            <div className="flex items-center gap-2"><RoleBadge role="parents" /><span>View only — can see guest list and RSVPs but cannot edit</span></div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Loading users…
            </div>
          ) : (
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {(u.name || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{u.name || '—'}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={u.role} />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditUser(u); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button onClick={() => setConfirmDelete(u)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="py-8 text-center text-gray-400 text-sm">No users found.</div>
              )}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: WHATSAPP
// ═══════════════════════════════════════════════════════════════════════════════
const WA_VARIABLES = ['{nama}', '{link}', '{tanggal_hm}', '{tanggal_resepsi}', '{venue_resepsi}'];

function TabWhatsApp({ settings, onChange, onSave, saving }) {
  const insertVar = (v) => {
    onChange('wa_template', (settings.wa_template || '') + v);
  };

  return (
    <div className="space-y-5">
      <SectionCard title="WhatsApp Blast Template" description="Template pesan yang dikirim ke setiap tamu">
        <div className="mb-3">
          <Label>Available Variables</Label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {WA_VARIABLES.map(v => (
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
          placeholder={`Halo {nama},\n\nKami dengan penuh sukacita mengundang kamu ke pernikahan kami.\n\n📅 Resepsi: {tanggal_resepsi}\n📍 Venue: {venue_resepsi}\n\nSilakan konfirmasi kehadiranmu di:\n{link}\n\nTerima kasih 🙏`}
          value={settings.wa_template ?? ''}
          onChange={e => onChange('wa_template', e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-2">
          Klik variabel di atas untuk menyisipkannya ke template. Variabel akan diganti otomatis saat blast dikirim.
        </p>
      </SectionCard>

      <SectionCard title="Preview" description="Contoh pesan yang akan diterima tamu">
        <div className="bg-[#ECE5DD] rounded-xl p-4 min-h-[120px]">
          <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm max-w-xs text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {(settings.wa_template || '').replace('{nama}', 'Budi Santoso').replace('{link}', 'https://undangan.com/invite/budi').replace('{tanggal_hm}', '12 Juli 2025').replace('{tanggal_resepsi}', '12 Juli 2025').replace('{venue_resepsi}', 'Ballroom The Ritz Carlton') || <span className="text-gray-400 italic">Template kosong</span>}
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton saving={saving} onClick={onSave} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: SECURITY
// ═══════════════════════════════════════════════════════════════════════════════
function TabSecurity({ push }) {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.current_password) e.current_password = 'Required';
    if (!form.new_password) e.new_password = 'Required';
    if (form.new_password.length < 8) e.new_password = 'Min 8 characters';
    if (form.new_password !== form.confirm_password) e.confirm_password = 'Passwords do not match';
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const res = await API.changePassword({ current_password: form.current_password, new_password: form.new_password });
      if (res.error) { push(res.error, 'error'); return; }
      push('Password changed successfully', 'success');
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } finally { setSaving(false); }
  };

  const f = (key) => ({
    value: form[key],
    error: !!errors[key],
    onChange: (e) => { setForm(p => ({...p, [key]: e.target.value})); setErrors(p => ({...p, [key]: ''})); },
  });

  return (
    <div className="space-y-5">
      <SectionCard title="Change Password" description="Update your admin login password">
        <div className="space-y-4 max-w-sm">
          <div><Label>Current Password</Label><Input type="password" placeholder="••••••••" {...f('current_password')} />{errors.current_password && <p className="text-red-500 text-xs mt-1">{errors.current_password}</p>}</div>
          <div><Label>New Password</Label><Input type="password" placeholder="••••••••" {...f('new_password')} />{errors.new_password && <p className="text-red-500 text-xs mt-1">{errors.new_password}</p>}</div>
          <div><Label>Confirm New Password</Label><Input type="password" placeholder="••••••••" {...f('confirm_password')} />{errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>}</div>
        </div>
        <div className="mt-5">
          <SaveButton saving={saving} onClick={submit} label="Change Password" />
        </div>
      </SectionCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: 'wedding',   label: 'Wedding',   icon: '💍' },
  { id: 'features',  label: 'Features',  icon: '⚙️' },
  { id: 'users',     label: 'Users',     icon: '👥' },
  { id: 'whatsapp',  label: 'WhatsApp',  icon: '💬' },
  { id: 'security',  label: 'Security',  icon: '🔒' },
];

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('wedding');
  const [settings, setSettings] = useState({});
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toasts, push } = useToast();

  // Load settings
  useEffect(() => {
    (async () => {
      try {
        const data = await API.getSettings();
        setSettings(data.settings || data || {});
      } catch {
        push('Failed to load settings', 'error');
      } finally {
        setLoadingSettings(false);
      }
    })();
  }, []);

  const handleChange = (key, value) => setSettings(p => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await API.saveSettings(settings);
      if (res.error) { push(res.error, 'error'); return; }
      push('Settings saved successfully', 'success');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Toast toasts={toasts} />
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-0 border-b border-gray-100">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-400 text-sm mt-0.5">Configure your wedding invitation application</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-px">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all
                  ${activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
                  }`}
              >
                <span className="text-base leading-none">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-8">
          {loadingSettings ? (
            <div className="py-16 flex items-center justify-center text-gray-400 gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Loading settings…
            </div>
          ) : (
            <>
              {activeTab === 'wedding'  && <TabWedding  settings={settings} onChange={handleChange} onSave={handleSave} saving={saving} />}
              {activeTab === 'features' && <TabFeatures settings={settings} onChange={handleChange} onSave={handleSave} saving={saving} />}
              {activeTab === 'users'    && <TabUsers    push={push} />}
              {activeTab === 'whatsapp' && <TabWhatsApp settings={settings} onChange={handleChange} onSave={handleSave} saving={saving} />}
              {activeTab === 'security' && <TabSecurity push={push} />}
            </>
          )}
        </div>
      </div>
    </>
  );
};
