import { useState, useEffect, useRef } from "react";

export function NotesModal({ open, guest, onClose, onSave, readOnly }) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue(guest?.notes || "");
      // Focus the textarea after modal opens (only if not readOnly)
      if (!readOnly) {
        setTimeout(() => {
          textareaRef.current?.focus();
          // Place cursor at the end of the text
          if (textareaRef.current) {
            const length = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(length, length);
          }
        }, 50);
      }
    }
  }, [open, guest, readOnly]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(value);
      onClose();
    } catch (err) {
      // Parent component handles errors or logs them
    } finally {
      setSaving(false);
    }
  };

  if (!open || !guest) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 leading-none">
              {readOnly ? "Catatan Tamu (View)" : "Catatan Tamu"}
            </h3>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              {guest.display_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
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

        {/* Body */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
            {readOnly ? "Catatan / Keterangan" : "Tulis Catatan / Keterangan"}
          </label>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={readOnly ? "Tidak ada catatan." : "Contoh: Teman kantor SD, VIP table 3, dll..."}
            rows={4}
            className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 resize-none font-medium text-gray-700 bg-gray-50/50 transition-all"
            disabled={saving || readOnly}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            {readOnly ? "Tutup" : "Batal"}
          </button>
          {!readOnly && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold disabled:opacity-50 transition-all shadow-sm min-w-[90px]"
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Menyimpan…
                </>
              ) : (
                "Simpan"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
