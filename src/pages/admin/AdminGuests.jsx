import { useState, useEffect, useRef, useCallback } from 'react';
import * as authService from '../../services/authService';

// ─── API helpers ────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const API = {
  list: (page, limit, search, showDeleted = false, filters = {}) => {
    const params = new URLSearchParams({
      page, limit,
      search: encodeURIComponent(search),
      show_deleted: showDeleted,
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.importance ? { importance: filters.importance } : {}),
      ...(filters.guest_group_id ? { guest_group_id: filters.guest_group_id } : {}),
      ...(filters.invitation_type ? { invitation_type: filters.invitation_type } : {}),
    });
    return fetch(`${BASE_URL}/api/admin/guests?${params}`, { headers: getHeaders() }).then(r => r.json());
  },

  create: (body) =>
    fetch(`${BASE_URL}/api/admin/guests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(r => r.json()),

  update: (id, body) =>
    fetch(`${BASE_URL}/api/admin/guests/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(r => r.json()),

  remove: (id) =>
    fetch(`${BASE_URL}/api/admin/guests/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }),
};

const GroupAPI = {
  list: () =>
    fetch(`${BASE_URL}/api/admin/guest-groups`, { headers: getHeaders() }).then(r => r.json()),
  create: (body) =>
    fetch(`${BASE_URL}/api/admin/guest-groups`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
};

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto
            transition-all duration-300
            ${t.type === 'success' ? 'bg-emerald-900 text-emerald-100 border border-emerald-700' : ''}
            ${t.type === 'error' ? 'bg-red-900 text-red-100 border border-red-700' : ''}
            ${t.type === 'info' ? 'bg-gray-800 text-gray-100 border border-gray-600' : ''}
          `}
        >
          {t.type === 'success' && <span>✓</span>}
          {t.type === 'error' && <span>✕</span>}
          {t.type === 'info' && <span>ℹ</span>}
          {t.message}
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  }, []);
  return { toasts, push };
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm mx-4 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all shadow-sm
              ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-900 hover:bg-gray-800'}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Guest Modal (Create / Edit) ─────────────────────────────────────────────
const CATEGORIES = ['friend', 'family', 'colleague'];
const PRIORITIES = ['low', 'medium', 'high'];
const IMPORTANCES = ['normal', 'vip', 'vvip'];
const INVITE_TYPES = [
  { value: 'digital', label: 'Digital' },
  { value: 'physical', label: 'Fisik' },
  { value: 'both', label: 'Digital + Fisik' },
];
const EMPTY_FORM = {
  first_name: '', last_name: '', phone_number: '',
  category: 'friend', pax_allowed: 1,
  priority: 'medium', importance: 'normal',
  notes: '',
  guest_group_id: '',
  invitation_type: 'digital',
};

function GuestModal({ open, onClose, onSave, initial, groups }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const firstRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(initial ? {
        first_name: initial.first_name || initial.display_name?.split(' ')[0] || '',
        last_name: initial.last_name || initial.display_name?.split(' ').slice(1).join(' ') || '',
        phone_number: initial.phone_number || '',
        category: initial.category || 'friend',
        pax_allowed: initial.pax_allowed || 1,
        priority: initial.priority || 'medium',
        importance: initial.importance || 'normal',
        notes: initial.notes || '',
        guest_group_id: initial.guest_group_id || '',
        invitation_type: initial.invitation_type || 'digital',
      } : EMPTY_FORM);
      setErrors({});
      setTimeout(() => firstRef.current?.focus(), 80);
    }
  }, [open, initial]);

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = 'Required';
    if (!form.last_name.trim()) e.last_name = 'Required';
    if (!form.phone_number.trim()) e.phone_number = 'Required';
    if (form.pax_allowed < 1 || form.pax_allowed > 20) e.pax_allowed = '1–20';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (ev) => {
      let val = ev.target.value;
      if (key === 'phone_number' && val.startsWith('0')) {
        val = '62' + val.substring(1);
      }
      setForm(p => ({ ...p, [key]: val }));
      setErrors(p => ({ ...p, [key]: '' }));
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {initial ? 'Edit Guest' : 'Add New Guest'}
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {initial ? 'Update guest information' : 'Fill in the details below'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">First Name</label>
              <input
                ref={firstRef}
                {...field('first_name')}
                placeholder="e.g. Budi"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none
                  ${errors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100'}`}
              />
              {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Last Name</label>
              <input
                {...field('last_name')}
                placeholder="e.g. Santoso"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none
                  ${errors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100'}`}
              />
              {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Phone Number</label>
            <input
              {...field('phone_number')}
              placeholder="e.g. 628123456789"
              type="tel"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none
                ${errors.phone_number ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100'}`}
            />
            <p className="text-gray-400 text-xs mt-1">Nomor hp dengan awalan 0 otomatis diubah menjadi 62</p>
            {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Category</label>
              <select
                {...field('category')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all bg-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Pax Allowed</label>
              <input
                type="number"
                min={1} max={20}
                {...field('pax_allowed')}
                onChange={e => {
                  setForm(p => ({ ...p, pax_allowed: parseInt(e.target.value) || 1 }));
                  setErrors(p => ({ ...p, pax_allowed: '' }));
                }}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none
                  ${errors.pax_allowed ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100'}`}
              />
              {errors.pax_allowed && <p className="text-red-500 text-xs mt-1">{errors.pax_allowed}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Priority</label>
              <select
                {...field('priority')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all bg-white"
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Importance</label>
              <select
                {...field('importance')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all bg-white"
              >
                {IMPORTANCES.map(i => (
                  <option key={i} value={i}>{i.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Guest Group */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Guest Group
              <span className="ml-1.5 text-gray-300 font-normal normal-case tracking-normal">opsional</span>
            </label>
            <select
              {...field('guest_group_id')}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all bg-white"
            >
              <option value="">— Tidak ada group —</option>
              {(groups || []).map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Invitation Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Jenis Undangan</label>
            <div className="flex gap-2 flex-wrap">
              {INVITE_TYPES.map(({ value, label }) => (
                <label
                  key={value}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium cursor-pointer transition-all select-none
                    ${form.invitation_type === value
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                >
                  <input
                    type="radio"
                    name="invitation_type"
                    value={value}
                    checked={form.invitation_type === value}
                    onChange={() => setForm(p => ({ ...p, invitation_type: value }))}
                    className="sr-only"
                  />
                  {value === 'digital' && '📱'}
                  {value === 'physical' && '✉️'}
                  {value === 'both' && '📱✉️'}
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Notes / Keterangan
              <span className="ml-1.5 text-gray-300 font-normal normal-case tracking-normal">opsional</span>
            </label>
            <textarea
              {...field('notes')}
              placeholder="e.g. Keluarga dari pihak mempelai wanita, butuh kursi roda..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 pb-7 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm disabled:opacity-60 flex items-center gap-2"
          >
            {saving && (
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Guest'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Category Badge ───────────────────────────────────────────────────────────
function CategoryBadge({ value }) {
  const map = {
    family: 'bg-purple-50 text-purple-600 border-purple-100',
    colleague: 'bg-blue-50 text-blue-600 border-blue-100',
    friend: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };
  const cls = map[value] || map.friend;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${cls}`}>
      {value || 'Friend'}
    </span>
  );
}

// ─── Priority Badge ───────────────────────────────────────────────────────────
function PriorityBadge({ value }) {
  const map = {
    high: { cls: 'bg-red-50 text-red-600 border-red-100', icon: '↑' },
    medium: { cls: 'bg-amber-50 text-amber-600 border-amber-100', icon: '→' },
    low: { cls: 'bg-gray-50 text-gray-500 border-gray-200', icon: '↓' },
  };
  const { cls, icon } = map[value] || map.medium;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${cls}`}>
      <span className="text-[10px] leading-none">{icon}</span>
      {value || 'Medium'}
    </span>
  );
}

// ─── Importance Badge ─────────────────────────────────────────────────────────
function ImportanceBadge({ value }) {
  const map = {
    vvip: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    vip: 'bg-orange-50 text-orange-600 border-orange-100',
    normal: 'bg-gray-50 text-gray-500 border-gray-200',
  };
  const cls = map[value] || map.normal;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${cls}`}>
      {value || 'Normal'}
    </span>
  );
}

// ─── Export CSV ───────────────────────────────────────────────────────────────
function exportCSV(guests) {
  const header = ['Name', 'Slug', 'Phone', 'Category', 'Pax', 'Priority', 'Importance', 'Notes'];
  const rows = guests.map(g => [
    `"${g.display_name || ''}"`,
    g.slug || '',
    g.phone_number || '',
    g.category || 'friend',
    g.pax_allowed || 1,
    g.priority || 'medium',
    g.importance || 'normal',
    `"${(g.notes || '').replace(/"/g, '""')}"`,
  ]);
  const csv = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'guests.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Component ───────────────────────────────────────────────────────────
const EMPTY_FILTERS = { category: '', priority: '', importance: '', guest_group_id: '', invitation_type: '' };

export const AdminGuests = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [groups, setGroups] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 10;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editGuest, setEditGuest] = useState(null);

  // Bulk
  const [selected, setSelected] = useState(new Set());

  // Confirm
  const [confirm, setConfirm] = useState({ open: false });

  const { toasts, push } = useToast();

  const user = authService.getAdminUser();
  const isAdmin = user?.role === 'admin';

  // ── Load groups once ──
  useEffect(() => {
    GroupAPI.list().then(r => setGroups(r.groups || [])).catch(() => { });
  }, []);

  // ── Debounced search ──
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== searchInput) { setSearch(searchInput); setPage(1); }
    }, 500);
    return () => clearTimeout(t);
  }, [searchInput, search]);

  // ── Fetch ──
  const fetchGuests = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await API.list(page, limit, search, showDeleted, filters);
      setGuests(result.data || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load guests');
    } finally {
      setLoading(false);
    }
  }, [page, search, showDeleted, filters]);

  useEffect(() => { fetchGuests(); }, [fetchGuests]);

  // ── Clear selection when page/search/showDeleted/filters changes ──
  useEffect(() => { setSelected(new Set()); }, [page, search, showDeleted, filters]);

  const setFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPage(1);
  };
  const clearFilters = () => { setFilters(EMPTY_FILTERS); setPage(1); };
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const totalPages = Math.ceil(total / limit);

  // ── Handlers ──
  const openCreate = () => { setEditGuest(null); setModalOpen(true); };
  const openEdit = (g) => { setEditGuest(g); setModalOpen(true); };

  const handleSave = async (form) => {
    if (editGuest) {
      const updated = await API.update(editGuest.id, form);
      if (updated.error) { push(updated.error, 'error'); return; }
      push('Guest updated successfully', 'success');
    } else {
      const created = await API.create(form);
      if (created.error) { push(created.error, 'error'); return; }
      push('Guest added successfully', 'success');
    }
    fetchGuests();
  };

  const handleDelete = (id, name) => {
    setConfirm({
      open: true,
      title: 'Delete Guest',
      message: `Are you sure you want to remove "${name}"? This cannot be undone.`,
      danger: true,
      onConfirm: async () => {
        setConfirm({ open: false });
        const res = await API.remove(id);
        if (!res.ok && res.status !== 204) { push('Failed to delete guest', 'error'); return; }
        push('Guest deleted', 'success');
        fetchGuests();
      },
    });
  };

  const handleBulkDelete = () => {
    if (!selected.size) return;
    setConfirm({
      open: true,
      title: `Delete ${selected.size} Guest${selected.size > 1 ? 's' : ''}`,
      message: `This will permanently delete ${selected.size} selected guest${selected.size > 1 ? 's' : ''}. This cannot be undone.`,
      danger: true,
      onConfirm: async () => {
        setConfirm({ open: false });
        await Promise.all([...selected].map(id => API.remove(id)));
        push(`${selected.size} guests deleted`, 'success');
        setSelected(new Set());
        fetchGuests();
      },
    });
  };

  const copyLink = (slug) => {
    const url = `${window.location.origin}/invite/${slug}`;
    navigator.clipboard.writeText(url).then(() => push('Invitation link copied!', 'info'));
  };

  // ── Select all (current page) ──
  const allSelected = guests.length > 0 && guests.every(g => selected.has(g.id));
  const toggleAll = () => {
    if (allSelected) {
      setSelected(prev => { const s = new Set(prev); guests.forEach(g => s.delete(g.id)); return s; });
    } else {
      setSelected(prev => { const s = new Set(prev); guests.forEach(g => s.add(g.id)); return s; });
    }
  };
  const toggleOne = (id) => {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  return (
    <>
      <Toast toasts={toasts} />

      <ConfirmDialog
        {...confirm}
        onCancel={() => setConfirm({ open: false })}
      />

      <GuestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editGuest}
        groups={groups}
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        {/* ── Header ── */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Guests</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {total} tamu{activeFilterCount > 0 ? ` · ${activeFilterCount} filter aktif` : ''}{showDeleted ? ' · menampilkan yang dihapus' : ''}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search guests…"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all w-52"
                />
              </div>

              {/* Show Deleted Toggle */}
              <button
                onClick={() => { setShowDeleted(v => !v); setPage(1); }}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all
                  ${showDeleted
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                title={showDeleted ? 'Showing deleted guests — click to show active' : 'Show deleted guests'}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {showDeleted ? 'Deleted' : 'Active'}
              </button>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(v => !v)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all
                  ${showFilters || activeFilterCount > 0
                    ? 'bg-gray-900 border-gray-900 text-white'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filter
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white text-gray-900 text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Export */}
              <button
                onClick={() => exportCSV(guests)}
                title="Export current page to CSV"
                className="flex items-center gap-1.5 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                CSV
              </button>

              {/* Bulk delete */}
              {selected.size > 0 && isAdmin && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-100 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete {selected.size}
                </button>
              )}

              {/* Add guest */}
              {isAdmin && !showDeleted && (
                <button
                  onClick={openCreate}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Guest
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className={`border-b border-gray-100 overflow-hidden transition-all duration-200 ${showFilters ? 'max-h-48' : 'max-h-0'}`}>
          <div className="px-8 py-4 flex flex-wrap gap-3 items-end bg-gray-50/50">

            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Category</label>
              <select
                value={filters.category}
                onChange={e => setFilter('category', e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-gray-400 outline-none transition-all"
              >
                <option value="">Semua</option>
                {['friend', 'family', 'colleague'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Priority</label>
              <select
                value={filters.priority}
                onChange={e => setFilter('priority', e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-gray-400 outline-none transition-all"
              >
                <option value="">Semua</option>
                {['low', 'medium', 'high'].map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Importance */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Importance</label>
              <select
                value={filters.importance}
                onChange={e => setFilter('importance', e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-gray-400 outline-none transition-all"
              >
                <option value="">Semua</option>
                {['normal', 'vip', 'vvip'].map(i => (
                  <option key={i} value={i}>{i.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Guest Group */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Group</label>
              <select
                value={filters.guest_group_id}
                onChange={e => setFilter('guest_group_id', e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-gray-400 outline-none transition-all max-w-[180px]"
              >
                <option value="">Semua Group</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Invitation Type */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Jenis Undangan</label>
              <select
                value={filters.invitation_type}
                onChange={e => setFilter('invitation_type', e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:border-gray-400 outline-none transition-all"
              >
                <option value="">Semua</option>
                <option value="digital">📱 Digital</option>
                <option value="physical">✉️ Fisik</option>
                <option value="both">📱✉️ Keduanya</option>
              </select>
            </div>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-all self-end"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reset filter
              </button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="p-8">
          {error && (
            <div className="mb-5 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
              {error}
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Name</th>
                  <th className="py-3.5 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Phone</th>
                  <th className="py-3.5 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Group</th>
                  <th className="py-3.5 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Category</th>
                  <th className="py-3.5 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Priority</th>
                  <th className="py-3.5 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Importance</th>
                  <th className="py-3.5 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-center">Pax</th>
                  <th className="py-3.5 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Undangan</th>
                  <th className="py-3.5 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Notes</th>
                  <th className="py-3.5 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">{isAdmin ? 'Actions' : 'Links'}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="11" className="py-14 text-center text-gray-400">
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading guests…
                      </span>
                    </td>
                  </tr>
                ) : guests.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="py-14 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">
                          {search ? `No guests found for "${search}"` : 'No guests yet. Add your first one!'}
                        </span>
                        {!search && (
                          <button onClick={openCreate} className="mt-1 text-sm font-semibold text-gray-900 underline underline-offset-2 hover:no-underline transition-all">
                            Add Guest →
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  guests.map((guest) => {
                    const groupName = groups.find(g => g.id === guest.guest_group_id)?.name;
                    const isDeleted = !!guest.deleted_at;
                    return (
                      <tr
                        key={guest.id}
                        className={`border-b border-gray-50 transition-colors group
                        ${isDeleted ? 'bg-red-50/40 opacity-60' : selected.has(guest.id) ? 'bg-gray-50' : 'hover:bg-gray-50/60'}`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={selected.has(guest.id)}
                            onChange={() => toggleOne(guest.id)}
                            className="w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
                          />
                        </td>

                        {/* Name + slug */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900 flex items-center gap-2">
                            {guest.display_name}
                            {isDeleted && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-500 border border-red-200">
                                deleted
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5 font-mono">{guest.slug}</div>
                        </td>

                        {/* Phone */}
                        <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                          {guest.phone_number || <span className="text-gray-300">—</span>}
                        </td>

                        {/* Group */}
                        <td className="py-3.5 px-4">
                          {groupName
                            ? <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">{groupName}</span>
                            : <span className="text-gray-300">—</span>}
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <CategoryBadge value={guest.category} />
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-4">
                          <PriorityBadge value={guest.priority} />
                        </td>

                        {/* Importance */}
                        <td className="py-3.5 px-4">
                          <ImportanceBadge value={guest.importance} />
                        </td>

                        {/* Pax */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200">
                            {guest.pax_allowed}
                          </span>
                        </td>

                        {/* Invitation Type */}
                        <td className="py-3.5 px-4">
                          {guest.invitation_type === 'both' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-600 border border-violet-100">
                              📱✉️ Keduanya
                            </span>
                          )}
                          {guest.invitation_type === 'digital' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-100">
                              📱 Digital
                            </span>
                          )}
                          {guest.invitation_type === 'physical' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border-amber-100">
                              ✉️ Fisik
                            </span>
                          )}
                          {!guest.invitation_type && <span className="text-gray-300">—</span>}
                        </td>

                        {/* Notes */}
                        <td className="py-3.5 px-4 max-w-[180px]">
                          {guest.notes ? (
                            <span
                              className="text-xs text-gray-500 line-clamp-2 leading-relaxed"
                              title={guest.notes}
                            >
                              {guest.notes}
                            </span>
                          ) : (
                            <span className="text-gray-200">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!isDeleted && (
                              <>
                                {/* Copy link */}
                                <button
                                  onClick={() => copyLink(guest.slug)}
                                  title="Copy invitation link"
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>

                                {/* Preview */}
                                <a
                                  href={`/invite/${guest.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Preview invitation"
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>

                                {/* Edit (Admin Only) */}
                                {isAdmin && (
                                  <button
                                    onClick={() => openEdit(guest)}
                                    title="Edit guest"
                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                )}

                                {/* Delete (Admin Only) */}
                                {isAdmin && (
                                  <button
                                    onClick={() => handleDelete(guest.id, guest.display_name)}
                                    title="Delete guest"
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 gap-4">
              <div>
                Showing{' '}
                <span className="font-bold text-gray-900">{(page - 1) * limit + 1}</span>
                {' '}–{' '}
                <span className="font-bold text-gray-900">{Math.min(page * limit, total)}</span>
                {' '}of{' '}
                <span className="font-bold text-gray-900">{total}</span> guests
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                  className="px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold"
                >
                  ««
                </button>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Prev
                </button>
                <span className="px-4 py-2 text-xs font-bold text-gray-700">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-1"
                >
                  Next
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                  className="px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold"
                >
                  »»
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
