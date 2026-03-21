import { useState, useEffect, useCallback, useRef } from 'react';

// ─── API ──────────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const API = {
  // Sections
  getSections: () =>
    fetch(`${BASE_URL}/api/admin/gallery/sections`, { headers: getHeaders() }).then(r => r.json()),
  createSection: (body) =>
    fetch(`${BASE_URL}/api/admin/gallery/sections`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(r => r.json()),
  updateSection: (id, body) =>
    fetch(`${BASE_URL}/api/admin/gallery/sections/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(r => r.json()),
  deleteSection: (id) =>
    fetch(`${BASE_URL}/api/admin/gallery/sections/${id}`, { method: 'DELETE', headers: getHeaders() }),
  reorderSections: (ids) =>
    fetch(`${BASE_URL}/api/admin/gallery/sections/reorder`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ids }),
    }).then(r => r.json()),

  // Media
  getMedia: (sectionId) =>
    fetch(`${BASE_URL}/api/admin/gallery/media?section_id=${sectionId}`, { headers: getHeaders() }).then(r => r.json()),
  getUploadUrl: (filename, contentType, sectionId) =>
    fetch(`${BASE_URL}/api/admin/gallery/upload-url`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ filename, content_type: contentType, section_id: sectionId }),
    }).then(r => r.json()),
  confirmUpload: (body) =>
    fetch(`${BASE_URL}/api/admin/gallery/media`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(r => r.json()),
  updateMedia: (id, body) =>
    fetch(`${BASE_URL}/api/admin/gallery/media/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(r => r.json()),
  deleteMedia: (id) =>
    fetch(`${BASE_URL}/api/admin/gallery/media/${id}`, { method: 'DELETE', headers: getHeaders() }),
  reorderMedia: (sectionId, ids) =>
    fetch(`${BASE_URL}/api/admin/gallery/media/reorder`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ section_id: sectionId, ids }),
    }).then(r => r.json()),
  setCover: (sectionId, mediaId) =>
    fetch(`${BASE_URL}/api/admin/gallery/sections/${sectionId}/cover`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ media_id: mediaId }),
    }).then(r => r.json()),
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
          ${t.type === 'info'    ? 'bg-blue-50 text-blue-700 border-blue-100' : ''}
        `}>
          {t.type === 'success' && <span className="text-emerald-400">✓</span>}
          {t.type === 'error'   && <span className="text-red-400">✕</span>}
          {t.type === 'info'    && <span className="text-blue-400">ℹ</span>}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm mx-4 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Caption Edit Modal ───────────────────────────────────────────────────────
function CaptionModal({ open, media, onClose, onSave }) {
  const [caption, setCaption] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setCaption(media?.caption || ''); }, [open, media]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">Edit Caption</h3>
        <textarea
          value={caption}
          onChange={e => setCaption(e.target.value)}
          rows={3}
          placeholder="Add a caption..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 resize-none"
          autoFocus
        />
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button
            onClick={async () => { setSaving(true); await onSave(caption); setSaving(false); onClose(); }}
            disabled={saving}
            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Section Modal ────────────────────────────────────────────────────────────
const SECTION_KEYS = [
  { value: 'hero',       label: 'Hero / Cover' },
  { value: 'couple',     label: 'Couple Photos' },
  { value: 'holy_matrimony', label: 'Holy Matrimony' },
  { value: 'resepsi',    label: 'Resepsi' },
  { value: 'gallery',    label: 'Gallery Umum' },
  { value: 'custom',     label: 'Custom' },
];
function SectionModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({ name: '', key: 'gallery', accepts_video: false });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setForm(initial
      ? { name: initial.name, key: initial.key, accepts_video: !!initial.accepts_video }
      : { name: '', key: 'gallery', accepts_video: false }
    );
  }, [open, initial]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">{initial ? 'Edit Section' : 'New Section'}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Section Name</label>
            <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Prewedding Photos"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Section Type</label>
            <select value={form.key} onChange={e => setForm(p => ({...p, key: e.target.value}))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 bg-white">
              {SECTION_KEYS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm(p => ({...p, accepts_video: !p.accepts_video}))}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.accepts_video ? 'bg-gray-900' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.accepts_video ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm text-gray-700 font-medium">Allow video uploads in this section</span>
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button
            onClick={async () => { if (!form.name.trim()) return; setSaving(true); await onSave(form); setSaving(false); onClose(); }}
            disabled={saving || !form.name.trim()}
            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-60"
          >
            {saving ? 'Saving…' : initial ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────
function UploadZone({ section, onUploaded, push }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState([]);
  const inputRef = useRef(null);

  const uploadFile = async (file) => {
    const isVideo = file.type.startsWith('video/');
    if (isVideo && !section.accepts_video) {
      push(`Section "${section.name}" does not accept videos`, 'error');
      return;
    }
    const id = Date.now() + Math.random();
    setProgress(p => [...p, { id, name: file.name, pct: 0, done: false, error: false }]);
    try {
      // 1. Get presigned upload URL
      const { upload_url, public_url, key } = await API.getUploadUrl(file.name, file.type, section.id);

      // 2. Upload directly to R2
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setProgress(p => p.map(x => x.id === id ? { ...x, pct } : x));
          }
        };
        xhr.onload = () => xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`));
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.open('PUT', upload_url);
        // Do not set Content-Type heading if you are using pre-signed URL usually unless required. The browser usually figures it out or it's part of the pre-signed URL itself. But we leave it as originally provided.
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      // 3. Confirm to backend
      await API.confirmUpload({
        section_id: section.id,
        key,
        public_url,
        filename: file.name,
        content_type: file.type,
        size: file.size,
        media_type: isVideo ? 'video' : 'image',
      });

      setProgress(p => p.map(x => x.id === id ? { ...x, pct: 100, done: true } : x));
      setTimeout(() => setProgress(p => p.filter(x => x.id !== id)), 1500);
      onUploaded();
    } catch (err) {
      setProgress(p => p.map(x => x.id === id ? { ...x, error: true } : x));
      push(`Failed to upload ${file.name}`, 'error');
      setTimeout(() => setProgress(p => p.filter(x => x.id !== id)), 3000);
    }
  };

  const handleFiles = async (files) => {
    setUploading(true);
    await Promise.all(Array.from(files).map(uploadFile));
    setUploading(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
      >
        <input ref={inputRef} type="file" multiple accept={section.accepts_video ? 'image/*,video/*' : 'image/*'} className="hidden"
          onChange={e => handleFiles(e.target.files)} />
        <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-gray-500 font-medium">
          Drop {section.accepts_video ? 'photos & videos' : 'photos'} here or <span className="text-gray-900 underline">browse</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {section.accepts_video ? 'JPG, PNG, WebP, MP4, MOV' : 'JPG, PNG, WebP'} · Max 50MB per file
        </p>
      </div>

      {progress.length > 0 && (
        <div className="mt-3 space-y-2">
          {progress.map(p => (
            <div key={p.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-700 truncate">{p.name}</div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div
                    className={`h-1 rounded-full transition-all ${p.error ? 'bg-red-400' : p.done ? 'bg-emerald-500' : 'bg-gray-900'}`}
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              </div>
              <span className={`text-xs font-semibold ${p.error ? 'text-red-500' : p.done ? 'text-emerald-600' : 'text-gray-500'}`}>
                {p.error ? 'Error' : p.done ? 'Done' : `${p.pct}%`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Media Grid ───────────────────────────────────────────────────────────────
function MediaGrid({ section, media, onRefresh, push }) {
  const [dragging, setDragging]   = useState(null);
  const [over, setOver]           = useState(null);
  const [items, setItems]         = useState(media);
  const [captionModal, setCaptionModal] = useState({ open: false, media: null });
  const [confirmDel, setConfirmDel]     = useState(null);

  useEffect(() => { setItems(media); }, [media]);

  // Drag reorder
  const handleDragStart = (id) => setDragging(id);
  const handleDragOver  = (e, id) => { e.preventDefault(); setOver(id); };
  const handleDrop      = async (e, targetId) => {
    e.preventDefault();
    if (!dragging || dragging === targetId) { setDragging(null); setOver(null); return; }
    const from = items.findIndex(i => i.id === dragging);
    const to   = items.findIndex(i => i.id === targetId);
    const reordered = [...items];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setItems(reordered);
    setDragging(null); setOver(null);
    await API.reorderMedia(section.id, reordered.map(i => i.id));
    push('Order saved', 'info');
  };

  const handleDelete = async () => {
    await API.deleteMedia(confirmDel.id);
    push('Media deleted', 'success');
    setConfirmDel(null);
    onRefresh();
  };

  const handleSetCover = async (mediaId) => {
    await API.setCover(section.id, mediaId);
    push('Cover photo set', 'success');
    onRefresh();
  };

  if (items.length === 0) return (
    <p className="text-sm text-gray-400 text-center py-4">No media yet. Upload some files above.</p>
  );

  return (
    <>
      <CaptionModal
        open={captionModal.open}
        media={captionModal.media}
        onClose={() => setCaptionModal({ open: false, media: null })}
        onSave={async (caption) => {
          await API.updateMedia(captionModal.media.id, { caption });
          push('Caption saved', 'success');
          onRefresh();
        }}
      />
      <ConfirmDialog
        open={!!confirmDel}
        title="Delete Media"
        message={`Delete "${confirmDel?.filename}"? This cannot be undone and will remove the file from R2.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(null)}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
        {items.map(item => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(item.id)}
            onDragOver={e => handleDragOver(e, item.id)}
            onDrop={e => handleDrop(e, item.id)}
            className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing
              ${over === item.id ? 'border-gray-900 scale-105' : item.id === section.cover_media_id ? 'border-amber-400' : 'border-transparent hover:border-gray-200'}
            `}
            style={{ aspectRatio: '1' }}
          >
            {item.media_type === 'video' ? (
              <video src={item.public_url} className="w-full h-full object-cover" muted />
            ) : (
              <img src={item.public_url} alt={item.caption || item.filename} className="w-full h-full object-cover" loading="lazy" />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex flex-col justify-between p-2">
              {/* Top badges */}
              <div className="flex items-start justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  {item.media_type === 'video' && (
                    <span className="bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">VIDEO</span>
                  )}
                  {item.id === section.cover_media_id && (
                    <span className="bg-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-md">COVER</span>
                  )}
                </div>
                <button
                  onClick={() => setConfirmDel(item)}
                  className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center hover:bg-red-600 transition-all"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Bottom actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setCaptionModal({ open: true, media: item })}
                  className="flex-1 bg-white/90 hover:bg-white text-gray-800 text-[10px] font-semibold rounded-lg py-1 transition-all"
                >
                  Caption
                </button>
                {item.media_type === 'image' && (
                  <button
                    onClick={() => handleSetCover(item.id)}
                    className="flex-1 bg-amber-400/90 hover:bg-amber-400 text-amber-900 text-[10px] font-semibold rounded-lg py-1 transition-all"
                  >
                    Set Cover
                  </button>
                )}
              </div>
            </div>

            {/* Caption indicator */}
            {item.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 pt-4 pb-1.5 group-hover:hidden">
                <p className="text-white text-[10px] truncate">{item.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Section Panel ────────────────────────────────────────────────────────────
function SectionPanel({ section, onRefresh, onEdit, onDelete, push }) {
  const [expanded, setExpanded] = useState(false);
  const [media, setMedia]       = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  const loadMedia = useCallback(async () => {
    setLoadingMedia(true);
    try { const data = await API.getMedia(section.id); setMedia(data.media || data || []); }
    catch { push('Failed to load media', 'error'); }
    finally { setLoadingMedia(false); }
  }, [section.id, push]);

  useEffect(() => { if (expanded) loadMedia(); }, [expanded, loadMedia]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Section header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-all"
        onClick={() => setExpanded(p => !p)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center cursor-grab">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">{section.name}</div>
            <div className="text-xs text-gray-400">
              {SECTION_KEYS.find(s => s.value === section.key)?.label || section.key}
              {section.accepts_video && <span className="ml-1.5 text-purple-500">· Video allowed</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">{section.media_count ?? 0} items</span>
          <button onClick={() => onEdit(section)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button onClick={() => onDelete(section)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-50 px-5 pb-5 pt-4 space-y-4">
          <UploadZone section={section} onUploaded={() => loadMedia()} push={push} />
          {loadingMedia
            ? <div className="text-center text-gray-400 text-sm py-4">Loading…</div>
            : <MediaGrid section={section} media={media} onRefresh={loadMedia} push={push} />
          }
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const AdminGallery = () => {
  const [sections, setSections]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [sectionModal, setSectionModal] = useState({ open: false, initial: null });
  const [confirmDel, setConfirmDel]     = useState(null);
  const { toasts, push } = useToast();

  const loadSections = useCallback(async () => {
    setLoading(true);
    try { const data = await API.getSections(); setSections(data.sections || data || []); }
    catch { push('Failed to load sections', 'error'); }
    finally { setLoading(false); }
  }, [push]);

  useEffect(() => { loadSections(); }, [loadSections]);

  const handleSaveSection = async (form) => {
    if (sectionModal.initial) {
      const res = await API.updateSection(sectionModal.initial.id, form);
      if (res.error) { push(res.error, 'error'); return; }
      push('Section updated', 'success');
    } else {
      const res = await API.createSection(form);
      if (res.error) { push(res.error, 'error'); return; }
      push('Section created', 'success');
    }
    loadSections();
  };

  const handleDeleteSection = async () => {
    await API.deleteSection(confirmDel.id);
    push('Section deleted', 'success');
    setConfirmDel(null);
    loadSections();
  };

  return (
    <>
      <Toast toasts={toasts} />
      <ConfirmDialog
        open={!!confirmDel}
        title="Delete Section"
        message={`Delete section "${confirmDel?.name}" and all its media? This cannot be undone.`}
        onConfirm={handleDeleteSection}
        onCancel={() => setConfirmDel(null)}
      />
      <SectionModal
        open={sectionModal.open}
        initial={sectionModal.initial}
        onClose={() => setSectionModal({ open: false, initial: null })}
        onSave={handleSaveSection}
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 md:px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {sections.length} section{sections.length !== 1 ? 's' : ''} · Upload and organize photos & videos per section
            </p>
          </div>
          <button
            onClick={() => setSectionModal({ open: true, initial: null })}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            New Section
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8">
          {loading ? (
            <div className="py-16 flex items-center justify-center text-gray-400 gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Loading gallery…
            </div>
          ) : sections.length === 0 ? (
            <div className="py-16 text-center">
              <svg className="w-12 h-12 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 font-medium mb-1">No sections yet</p>
              <p className="text-gray-400 text-sm mb-4">Create a section to start organizing your gallery</p>
              <button onClick={() => setSectionModal({ open: true, initial: null })}
                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800">
                Create First Section
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sections.map(s => (
                <SectionPanel
                  key={s.id}
                  section={s}
                  onRefresh={loadSections}
                  onEdit={(sec) => setSectionModal({ open: true, initial: sec })}
                  onDelete={(sec) => setConfirmDel(sec)}
                  push={push}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
