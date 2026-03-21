import { useState, useEffect, useCallback } from 'react';

// ─── API ──────────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const API = {
  list: (params = {}) => {
    const q = new URLSearchParams({ page: params.page || 1, limit: params.limit || 20, ...params.filters }).toString();
    return fetch(`${BASE_URL}/api/admin/gifts?${q}`, { headers: getHeaders() }).then(r => r.json());
  },
  create: (body) =>
    fetch(`${BASE_URL}/api/admin/gifts`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(body),
    }).then(r => r.json()),
  update: (id, body) =>
    fetch(`${BASE_URL}/api/admin/gifts/${id}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(body),
    }).then(r => r.json()),
  remove: (id) =>
    fetch(`${BASE_URL}/api/admin/gifts/${id}`, { method: 'DELETE', headers: getHeaders() }),
  getSummary: () =>
    fetch(`${BASE_URL}/api/admin/gifts/summary`, { headers: getHeaders() }).then(r => r.json()),

  // Registry
  registryList: () =>
    fetch(`${BASE_URL}/api/admin/gifts/registry`, { headers: getHeaders() }).then(r => r.json()),
  registryCreate: (body) =>
    fetch(`${BASE_URL}/api/admin/gifts/registry`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(body),
    }).then(r => r.json()),
  registryUpdate: (id, body) =>
    fetch(`${BASE_URL}/api/admin/gifts/registry/${id}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(body),
    }).then(r => r.json()),
  registryDelete: (id) =>
    fetch(`${BASE_URL}/api/admin/gifts/registry/${id}`, { method: 'DELETE', headers: getHeaders() }),
  registryClaims: (id) =>
    fetch(`${BASE_URL}/api/admin/gifts/registry/${id}`, { headers: getHeaders() }).then(r => r.json()),
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
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
        `}>
          {t.type === 'success' ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✕</span>}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BANKS = ['BCA', 'BNI', 'BRI', 'Mandiri', 'CIMB Niaga', 'Permata', 'OVO', 'GoPay', 'DANA', 'ShopeePay', 'Lainnya'];
const PRODUCT_CATS = ['Electronics', 'Home & Living', 'Fashion', 'Voucher', 'Experiences', 'Wishlist', 'Lainnya'];
const STATUS_MAP = {
  pending:   { label: 'Pending',   cls: 'bg-amber-50 text-amber-600 border-amber-100' },
  confirmed: { label: 'Confirmed', cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  rejected:  { label: 'Rejected',  cls: 'bg-red-50 text-red-500 border-red-100' },
};

function formatIDR(val) {
  if (!val) return '—';
  return 'Rp ' + Number(val).toLocaleString('id-ID');
}

function StatusBadge({ status }) {
  const { label, cls } = STATUS_MAP[status] || STATUS_MAP.pending;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>{label}</span>;
}

function TypeBadge({ type }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
      type === 'bank_transfer' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'
    }`}>
      {type === 'bank_transfer' ? '🏦 Transfer' : '🎁 Hadiah Fisik'}
    </span>
  );
}

// ─── Summary Cards ────────────────────────────────────────────────────────────
function SummaryCards({ summary }) {
  if (!summary) return null;
  const cards = [
    { label: 'Total Transfer', value: formatIDR(summary.total_amount), sub: `${summary.transfer_count} transaksi`, color: 'bg-blue-50 border-blue-100 text-blue-700' },
    { label: 'Hadiah Fisik',   value: summary.physical_count + ' item', sub: `${summary.physical_confirmed} dikonfirmasi`, color: 'bg-purple-50 border-purple-100 text-purple-700' },
    { label: 'Belum Dicek',    value: summary.pending_count,  sub: 'menunggu konfirmasi', color: 'bg-amber-50 border-amber-100 text-amber-700' },
    { label: 'Dikonfirmasi',   value: summary.confirmed_count, sub: 'sudah dicek', color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map(c => (
        <div key={c.label} className={`rounded-2xl border p-4 ${c.color}`}>
          <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">{c.label}</div>
          <div className="text-xl font-bold">{c.value}</div>
          <div className="text-xs mt-0.5 opacity-60">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Gift Modal ───────────────────────────────────────────────────────────────
const EMPTY_BANK = {
  type: 'bank_transfer', sender_name: '', amount: '', bank_name: 'BCA',
  account_number: '', transfer_date: '', status: 'pending', notes: '',
};
const EMPTY_PHYSICAL = {
  type: 'physical', sender_name: '', status: 'pending', notes: '',
  product_name: '', product_category: 'Lainnya', product_description: '',
  product_link: '', price_range_min: '', price_range_max: '',
};

function GiftModal({ open, onClose, onSave, initial }) {
  const [type, setType]   = useState('bank_transfer');
  const [form, setForm]   = useState(EMPTY_BANK);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const isEdit = !!initial;

  useEffect(() => {
    if (open) {
      if (initial) { setType(initial.type); setForm({ ...initial }); }
      else { setType('bank_transfer'); setForm(EMPTY_BANK); }
      setErrors({});
    }
  }, [open, initial]);

  useEffect(() => {
    if (!isEdit) setForm(type === 'bank_transfer' ? EMPTY_BANK : { ...EMPTY_PHYSICAL });
  }, [type, isEdit]);

  const validate = () => {
    const e = {};
    if (!form.sender_name?.trim()) e.sender_name = 'Required';
    if (type === 'bank_transfer') {
      if (!form.amount || isNaN(form.amount)) e.amount = 'Valid amount required';
    }
    if (type === 'physical' && !form.product_name?.trim()) e.product_name = 'Required';
    return e;
  };

  const f = (key) => ({
    value: form[key] ?? '',
    onChange: (e) => { setForm(p => ({...p, [key]: e.target.value})); setErrors(p => ({...p, [key]: ''})); },
  });

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try { await onSave({ ...form, type }); onClose(); } finally { setSaving(false); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{isEdit ? 'Edit Gift' : 'Log Gift'}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{isEdit ? 'Update gift information' : 'Record a gift received'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-5">
          {/* Type selector */}
          {!isEdit && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: 'bank_transfer', icon: '🏦', label: 'Transfer Bank' },
                { v: 'physical',      icon: '🎁', label: 'Hadiah Fisik' },
              ].map(t => (
                <button key={t.v} onClick={() => setType(t.v)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all
                    ${type === t.v ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                  <span>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
          )}

          {/* Common: sender */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Nama Pengirim</label>
            <input {...f('sender_name')} placeholder="e.g. Budi & Sari Santoso"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all
                ${errors.sender_name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100'}`} />
            {errors.sender_name && <p className="text-red-500 text-xs mt-1">{errors.sender_name}</p>}
          </div>

          {/* BANK TRANSFER FIELDS */}
          {type === 'bank_transfer' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Jumlah (Rp)</label>
                  <input type="number" {...f('amount')} placeholder="e.g. 500000"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all
                      ${errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100'}`} />
                  {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Bank</label>
                  <select {...f('bank_name')} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 bg-white">
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">No. Rekening Pengirim <span className="text-gray-300 font-normal normal-case tracking-normal">optional</span></label>
                  <input {...f('account_number')} placeholder="e.g. 1234567890"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Tanggal Transfer</label>
                  <input type="date" {...f('transfer_date')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100" />
                </div>
              </div>
            </>
          )}

          {/* PHYSICAL GIFT FIELDS */}
          {type === 'physical' && (
            <>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Info Produk</p>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Nama Produk / Hadiah</label>
                  <input {...f('product_name')} placeholder="e.g. Dyson V12 Vacuum"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all bg-white
                      ${errors.product_name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100'}`} />
                  {errors.product_name && <p className="text-red-500 text-xs mt-1">{errors.product_name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Kategori</label>
                  <select {...f('product_category')} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 bg-white">
                    {PRODUCT_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Deskripsi Singkat <span className="text-gray-300 font-normal normal-case tracking-normal">optional</span></label>
                  <textarea {...f('product_description')} rows={2} placeholder="e.g. Warna hitam, model slim"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 resize-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Link Pembelian <span className="text-gray-300 font-normal normal-case tracking-normal">optional</span></label>
                  <input type="url" {...f('product_link')} placeholder="https://tokopedia.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Harga Min (Rp)</label>
                    <input type="number" {...f('price_range_min')} placeholder="e.g. 1000000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Harga Max (Rp)</label>
                    <input type="number" {...f('price_range_max')} placeholder="e.g. 2000000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 bg-white" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Common: Status + Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Status</label>
              <select {...f('status')} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 bg-white">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Received Date</label>
              <input type="date" {...f('received_date')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Notes <span className="text-gray-300 font-normal normal-case tracking-normal">optional</span></label>
            <textarea {...f('notes')} rows={2} placeholder="Catatan tambahan..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-3 border-t border-gray-50 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={submit} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-60">
            {saving
              ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</>
              : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>{isEdit ? 'Save Changes' : 'Log Gift'}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Gift Row ─────────────────────────────────────────────────────────────────
function GiftRow({ gift, onEdit, onDelete, onStatusChange }) {
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors group">
      <td className="py-4 px-5">
        <div className="flex items-center gap-2.5">
          <TypeBadge type={gift.type} />
        </div>
      </td>
      <td className="py-4 px-5">
        <div className="font-semibold text-gray-900 text-sm">{gift.sender_name}</div>
        <div className="text-xs text-gray-400 mt-0.5">{gift.received_date || '—'}</div>
      </td>
      <td className="py-4 px-5">
        {gift.type === 'bank_transfer' ? (
          <div>
            <div className="text-sm font-bold text-gray-900">{formatIDR(gift.amount)}</div>
            <div className="text-xs text-gray-400 mt-0.5">{gift.bank_name}{gift.account_number ? ` · ${gift.account_number}` : ''}</div>
          </div>
        ) : (
          <div>
            <div className="text-sm font-semibold text-gray-900">{gift.product_name}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {gift.product_category}
              {gift.price_range_min && <span> · {formatIDR(gift.price_range_min)}–{formatIDR(gift.price_range_max)}</span>}
            </div>
            {gift.product_link && (
              <a href={gift.product_link} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline mt-0.5 inline-block">View product →</a>
            )}
          </div>
        )}
      </td>
      <td className="py-4 px-5">
        <StatusBadge status={gift.status} />
      </td>
      <td className="py-4 px-5 max-w-[160px]">
        {gift.notes
          ? <span className="text-xs text-gray-500 line-clamp-2" title={gift.notes}>{gift.notes}</span>
          : <span className="text-gray-200">—</span>}
      </td>
      <td className="py-4 px-5">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Quick confirm */}
          {gift.status !== 'confirmed' && (
            <button
              onClick={() => onStatusChange(gift.id, 'confirmed')}
              title="Mark as confirmed"
              className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
            </button>
          )}
          <button onClick={() => onEdit(gift)} title="Edit" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button onClick={() => onDelete(gift)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Registry Item Modal ──────────────────────────────────────────────────────
const EMPTY_REG = {
  name: '', brand: '', description: '', image_url: '', tag: '',
  quantity_needed: 1, price_range: '', shop_url: '', is_active: true,
};
const REG_TAGS = ['Kitchen', 'Home', 'Electronics', 'Fashion', 'Experience', 'Voucher', 'Lainnya'];

function RegistryModal({ open, onClose, onSave, initial }) {
  const [form, setForm]     = useState(EMPTY_REG);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initial ? {
        name:            initial.name            || '',
        brand:           initial.brand           || '',
        description:     initial.description     || '',
        image_url:       initial.image_url       || '',
        tag:             initial.tag             || '',
        quantity_needed: initial.quantity_needed || 1,
        price_range:     initial.price_range     || '',
        shop_url:        initial.shop_url        || '',
        is_active:       initial.is_active !== 0,
      } : EMPTY_REG);
      setErrors({});
    }
  }, [open, initial]);

  const f = (key) => ({
    value: form[key] ?? '',
    onChange: (e) => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: '' })); },
  });

  const submit = async () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (form.quantity_needed < 1) e.quantity_needed = 'Min 1';
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try { await onSave({ ...form, quantity_needed: parseInt(form.quantity_needed) || 1, is_active: form.is_active ? 1 : 0 }); onClose(); }
    finally { setSaving(false); }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{initial ? 'Edit Registry Item' : 'Tambah Registry Item'}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Item yang ditampilkan di halaman publik gift registry</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Nama Item <span className="text-red-400">*</span></label>
              <input {...f('name')} placeholder="e.g. Blender" className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-gray-400'}`} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Brand</label>
              <input {...f('brand')} placeholder="e.g. Philips" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Deskripsi</label>
            <textarea {...f('description')} rows={2} placeholder="Deskripsi singkat..." className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Tag / Kategori</label>
              <select {...f('tag')} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 bg-white">
                <option value="">— Pilih —</option>
                {REG_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Jumlah Dibutuhkan <span className="text-red-400">*</span></label>
              <input type="number" min={1} value={form.quantity_needed}
                onChange={e => { setForm(p => ({ ...p, quantity_needed: parseInt(e.target.value) || 1 })); setErrors(p => ({ ...p, quantity_needed: '' })); }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${errors.quantity_needed ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-gray-400'}`} />
              <p className="text-gray-400 text-xs mt-1">Qty=1 → hanya 1 orang bisa claim</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Estimasi Harga</label>
              <input {...f('price_range')} placeholder="e.g. Rp 500.000 – 1.200.000" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Link Marketplace</label>
              <input {...f('shop_url')} placeholder="https://tokopedia.com/..." className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">URL Foto</label>
            <input {...f('image_url')} placeholder="https://..." className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 transition-all" />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-gray-900' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-5' : ''}`} />
            </button>
            <span className="text-sm text-gray-600 font-medium">{form.is_active ? 'Tampil di halaman publik' : 'Disembunyikan dari publik'}</span>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50">Batal</button>
          <button onClick={submit} disabled={saving} className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 flex items-center gap-2">
            {saving && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
            {saving ? 'Menyimpan…' : initial ? 'Simpan' : 'Tambah'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Claims Drawer ────────────────────────────────────────────────────────────
function ClaimsDrawer({ item, onClose }) {
  const [claims, setClaims]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!item) return;
    setLoading(true);
    API.registryClaims(item.id)
      .then(r => setClaims(r.claims || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [item]);

  if (!item) return null;
  const pct = item.quantity_needed > 0 ? Math.min(Math.round((item.quantity_claimed / item.quantity_needed) * 100), 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">{item.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{claims.length} claim · {pct}% claimed</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 border-b border-gray-50">
          <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1.5">
            <span>{item.quantity_claimed} / {item.quantity_needed} diklaim</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all ${pct >= 100 ? 'bg-red-400' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Claims list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Memuat...</div>
          ) : claims.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-400 text-sm">Belum ada yang claim</p>
            </div>
          ) : (
            claims.map(c => (
              <div key={c.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{c.claimer_name}</p>
                    {c.message && <p className="text-gray-500 text-xs mt-1 leading-relaxed italic">"{c.message}"</p>}
                  </div>
                  <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100">
                    ×{c.quantity}
                  </span>
                </div>
                <p className="text-gray-400 text-[10px] mt-2">{new Date(c.created_at).toLocaleString('id-ID')}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Registry Tab ─────────────────────────────────────────────────────────────
function RegistryTab() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [claimsItem, setClaimsItem] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const { toasts, push } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await API.registryList(); setItems(r.items || []); }
    catch { push('Gagal memuat registry', 'error'); }
    finally { setLoading(false); }
  }, [push]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (form) => {
    const res = editItem ? await API.registryUpdate(editItem.id, form) : await API.registryCreate(form);
    if (res.error) { push(res.error, 'error'); return; }
    push(editItem ? 'Item diperbarui' : 'Item ditambahkan', 'success');
    load();
  };

  const handleDelete = async () => {
    const res = await API.registryDelete(confirmDel.id);
    if (!res.ok && res.status !== 204) { push('Gagal hapus', 'error'); return; }
    push('Item dihapus', 'success');
    setConfirmDel(null);
    load();
  };

  const toggleActive = async (item) => {
    await API.registryUpdate(item.id, { is_active: item.is_active ? 0 : 1 });
    push(item.is_active ? 'Item disembunyikan' : 'Item ditampilkan', 'success');
    load();
  };

  return (
    <>
      <Toast toasts={toasts} />
      <RegistryModal open={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null); }} onSave={handleSave} initial={editItem} />
      <ClaimsDrawer item={claimsItem} onClose={() => setClaimsItem(null)} />
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDel(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm mx-4 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Item</h3>
            <p className="text-gray-500 text-sm mb-6">Hapus <strong>{confirmDel.name}</strong>? Data claim yang sudah ada tidak akan terhapus.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDel(null)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 md:px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gift Registry</h2>
          <p className="text-gray-400 text-sm mt-0.5">{items.length} item · Wishlist yang bisa di-claim tamu</p>
        </div>
        <button
          onClick={() => { setEditItem(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          Tambah Item
        </button>
      </div>

      <div className="p-6 md:p-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-4 text-gray-400">
            <span className="text-5xl">🎁</span>
            <p className="text-sm font-medium text-gray-500">Belum ada item registry</p>
            <button onClick={() => setModalOpen(true)} className="text-sm font-semibold text-gray-900 underline underline-offset-2">Tambah item pertama →</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => {
              const pct      = item.quantity_needed > 0 ? Math.min(Math.round((item.quantity_claimed / item.quantity_needed) * 100), 100) : 0;
              const isFull   = item.quantity_claimed >= item.quantity_needed;
              return (
                <div key={item.id} className={`rounded-2xl border bg-white flex flex-col overflow-hidden transition-all hover:shadow-md ${item.is_active ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-60'}`}>
                  {/* Image or placeholder */}
                  {item.image_url ? (
                    <div className="h-32 overflow-hidden bg-gray-50">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-3xl text-gray-300">🎁</div>
                  )}

                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-gray-900 text-sm leading-tight">{item.name}</p>
                        {item.tag && <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-500">{item.tag}</span>}
                      </div>
                      {item.brand && <p className="text-xs text-gray-400 mt-0.5">{item.brand}</p>}
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span className="font-medium">{item.quantity_claimed} / {item.quantity_needed} diklaim</span>
                        <span className={isFull ? 'text-red-500 font-bold' : 'text-emerald-600 font-bold'}>{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all ${isFull ? 'bg-red-400' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 mt-auto pt-1 flex-wrap">
                      <button
                        onClick={() => setClaimsItem(item)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-100 transition-all"
                        title="Lihat claims"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        {item.quantity_claimed} claim
                      </button>
                      <button
                        onClick={() => toggleActive(item)}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${item.is_active ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'}`}
                        title={item.is_active ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {item.is_active ? 'Aktif' : 'Hidden'}
                      </button>
                      <div className="ml-auto flex gap-1">
                        <button onClick={() => { setEditItem(item); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button onClick={() => setConfirmDel(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const AdminGifts = () => {
  const [tab, setTab]             = useState('log'); // 'log' | 'registry'
  const [gifts, setGifts]         = useState([]);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [filter, setFilter]       = useState({ type: '', status: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editGift, setEditGift]   = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const limit = 20;
  const { toasts, push } = useToast();

  const loadGifts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.list({ page, limit, ...Object.fromEntries(Object.entries(filter).filter(([,v]) => v)) });
      setGifts(res.data || res.gifts || []);
      setTotal(res.total || 0);
    } catch { push('Failed to load gifts', 'error'); }
    finally { setLoading(false); }
  }, [page, filter, push]);

  const loadSummary = useCallback(async () => {
    try { const s = await API.getSummary(); setSummary(s); }
    catch {}
  }, []);

  useEffect(() => { loadGifts(); }, [loadGifts]);
  useEffect(() => { loadSummary(); }, [loadSummary]);

  const handleSave = async (form) => {
    const res = editGift ? await API.update(editGift.id, form) : await API.create(form);
    if (res.error) { push(res.error, 'error'); return; }
    push(editGift ? 'Gift updated' : 'Gift logged', 'success');
    loadGifts(); loadSummary();
  };

  const handleDelete = async () => {
    const res = await API.remove(confirmDel.id);
    if (!res.ok && res.status !== 204) { push('Failed to delete', 'error'); return; }
    push('Gift removed', 'success');
    setConfirmDel(null);
    loadGifts(); loadSummary();
  };

  const handleStatusChange = async (id, status) => {
    await API.update(id, { status });
    push('Status updated', 'success');
    loadGifts(); loadSummary();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Toast toasts={toasts} />
      <GiftModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditGift(null); }}
        onSave={handleSave}
        initial={editGift}
      />
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDel(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm mx-4 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Gift</h3>
            <p className="text-gray-500 text-sm mb-6">Remove gift from <strong>{confirmDel.sender_name}</strong>? This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDel(null)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* ── Tab Bar ── */}
        <div className="px-6 md:px-8 pt-6 pb-0 border-b border-gray-100">
          <div className="flex items-end gap-1 mb-[-1px]">
            {[
              { id: 'log',      label: '🏦 Gift Log',     sub: 'Transfer & hadiah masuk' },
              { id: 'registry', label: '🎁 Gift Registry', sub: 'Wishlist & claim tamu' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-5 py-3 text-sm font-semibold rounded-t-xl border-x border-t transition-all ${
                  tab === t.id
                    ? 'bg-white border-gray-100 text-gray-900 border-b-white -mb-px z-10'
                    : 'bg-gray-50 border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        {tab === 'registry' ? (
          <RegistryTab />
        ) : (
          <>
            {/* Header */}
            <div className="px-6 md:px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gifts Log</h1>
                <p className="text-gray-400 text-sm mt-0.5">{total} gift{total !== 1 ? 's' : ''} · Transfer & hadiah fisik</p>
              </div>
              <button
                onClick={() => { setEditGift(null); setModalOpen(true); }}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                Log Gift
              </button>
            </div>

            <div className="p-6 md:p-8">
              <SummaryCards summary={summary} />

              {/* Filters */}
              <div className="flex gap-3 mb-5 flex-wrap">
                <select value={filter.type} onChange={e => { setFilter(p => ({...p, type: e.target.value})); setPage(1); }}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 bg-white text-gray-700">
                  <option value="">All Types</option>
                  <option value="bank_transfer">Transfer Bank</option>
                  <option value="physical">Hadiah Fisik</option>
                </select>
                <select value={filter.status} onChange={e => { setFilter(p => ({...p, status: e.target.value})); setPage(1); }}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 bg-white text-gray-700">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Table */}
              {/* ── Desktop Table ── */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="py-3.5 px-5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Type</th>
                      <th className="py-3.5 px-5 font-semibold text-gray-600 text-xs uppercase tracking-wider">From</th>
                      <th className="py-3.5 px-5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Detail</th>
                      <th className="py-3.5 px-5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                      <th className="py-3.5 px-5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Notes</th>
                      <th className="py-3.5 px-5 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="6" className="py-14 text-center text-gray-400">
                        <span className="inline-flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                          Loading gifts…
                        </span>
                      </td></tr>
                    ) : gifts.length === 0 ? (
                      <tr><td colSpan="6" className="py-14 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-4xl">🎁</span>
                          <p className="text-sm font-medium text-gray-500">No gifts logged yet</p>
                          <button onClick={() => setModalOpen(true)} className="text-sm font-semibold text-gray-900 underline underline-offset-2">Log first gift →</button>
                        </div>
                      </td></tr>
                    ) : (
                      gifts.map(g => (
                        <GiftRow
                          key={g.id}
                          gift={g}
                          onEdit={(g) => { setEditGift(g); setModalOpen(true); }}
                          onDelete={(g) => setConfirmDel(g)}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile Card List ── */}
              <div className="md:hidden space-y-4">
                {loading ? (
                  <div className="py-10 text-center text-gray-400">Loading gifts...</div>
                ) : gifts.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 italic">No gifts logged yet.</div>
                ) : (
                  gifts.map(g => (
                    <div key={g.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl border ${g.type === 'bank_transfer' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-purple-50 border-purple-100 text-purple-600'}`}>
                            {g.type === 'bank_transfer' ? '🏦' : '🎁'}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 leading-tight">{g.sender_name}</h3>
                            <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{g.received_date || 'No Date'}</p>
                          </div>
                        </div>
                        <StatusBadge status={g.status} />
                      </div>

                      <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 mb-4">
                        {g.type === 'bank_transfer' ? (
                          <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase mb-1 tracking-widest">Amount & Bank</p>
                            <p className="text-lg font-black text-gray-900 tracking-tight">{formatIDR(g.amount)}</p>
                            <p className="text-xs text-gray-500 font-semibold">{g.bank_name}{g.account_number ? ` · ${g.account_number}` : ''}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-[10px] text-gray-400 font-black uppercase mb-1 tracking-widest">Product Detail</p>
                            <p className="text-sm font-bold text-gray-900 leading-snug">{g.product_name}</p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">{g.product_category}</p>
                            {g.product_link && (
                              <a href={g.product_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 font-bold underline mt-2 block italic">View Link →</a>
                            )}
                          </div>
                        )}
                      </div>

                      {g.notes && (
                        <div className="mb-4 text-xs italic text-gray-500 leading-relaxed px-1">
                          "{g.notes}"
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-50 px-1">
                        {g.status !== 'confirmed' && (
                          <button onClick={() => handleStatusChange(g.id, 'confirmed')} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100">
                            Confirm
                          </button>
                        )}
                        <button onClick={() => { setEditGift(g); setModalOpen(true); }} className="p-2.5 bg-gray-50 text-gray-600 rounded-xl border border-gray-200">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => setConfirmDel(g)} className="p-2.5 bg-red-50 text-red-500 rounded-xl border border-red-100">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
                  <span>Showing {(page-1)*limit+1}–{Math.min(page*limit,total)} of {total}</span>
                  <div className="flex gap-1">
                    <button disabled={page===1} onClick={() => setPage(p=>p-1)}
                      className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 font-semibold text-gray-700">← Prev</button>
                    <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)}
                      className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 font-semibold text-gray-700">Next →</button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};
