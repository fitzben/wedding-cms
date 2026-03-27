import { useState } from "react";
import {
  ConvertToWebImage,
  Input,
  Label,
  SaveButton,
  SectionCard,
  Textarea,
} from "./components";
import { apiClient } from "../../services/apiClient";

// ─── Journey Item Modal ───────────────────────────────────────────────────────
function JourneyItemModal({ item, onSave, onClose, push }) {
  const [form, setForm] = useState(
    item
      ? {
          date: item.date,
          title: item.title,
          desc: item.desc || "",
          photo_url: item.photo_url || "",
          bg: item.bg || "from-[#3d0510] to-[#960c23]",
        }
      : {
          date: "",
          title: "",
          desc: "",
          photo_url: "",
          bg: "from-[#3d0510] to-[#960c23]",
        },
  );
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      let finalFile = file;
      try {
        finalFile = await ConvertToWebImage(file);
      } catch (err) {
        console.error("Failed to convert image", err);
      }

      const { upload_url, public_url } = await apiClient.post(
        "/api/admin/gallery/upload-url",
        {
          filename: finalFile.name,
          content_type: finalFile.type,
          section_id: "journey",
        },
      );

      await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": finalFile.type },
        body: finalFile,
      });

      setForm((p) => ({ ...p, photo_url: public_url }));
      push("Photo uploaded successfully", "success");
    } catch (err) {
      console.error(err);
      push("Failed to upload photo", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">
            {item ? "Edit Journey Card" : "New Journey Card"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <Label>Date / Period</Label>
            <Input
              placeholder="e.g. December 2021"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            />
          </div>
          <div>
            <Label>Event Title</Label>
            <Input
              placeholder="e.g. First Meeting"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>Description / Short Story</Label>
            <Textarea
              placeholder="Describe this moment..."
              rows={3}
              value={form.desc}
              onChange={(e) => setForm((p) => ({ ...p, desc: e.target.value }))}
            />
          </div>

          <div>
            <Label>Photo</Label>
            <div className="flex items-center gap-4">
              {form.photo_url && (
                <img
                  src={form.photo_url}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-100"
                  alt="Preview"
                />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="journey-photo-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="journey-photo-upload"
                  className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl py-3 px-4 cursor-pointer hover:border-gray-400 transition-all ${uploading ? "opacity-50 cursor-wait" : ""}`}
                >
                  <span className="text-xs font-medium text-gray-600">
                    {uploading
                      ? "Uploading..."
                      : form.photo_url
                        ? "Change Photo"
                        : "Upload Photo"}
                  </span>
                </label>
              </div>
            </div>
            {form.photo_url && (
              <button
                onClick={() => setForm((p) => ({ ...p, photo_url: "" }))}
                className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-2 hover:underline"
              >
                Remove Photo
              </button>
            )}
          </div>

          {!form.photo_url && (
            <div>
              <Label>Gradient Background (Tailwind classes)</Label>
              <Input
                placeholder="e.g. from-[#3d0510] to-[#960c23]"
                value={form.bg}
                onChange={(e) => setForm((p) => ({ ...p, bg: e.target.value }))}
              />
              <p className="text-[10px] text-gray-400 mt-1 italic">
                Only used if no photo is uploaded.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.date || !form.title}
            className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            {item ? "Update Card" : "Add Card"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Tab Component ───────────────────────────────────────────────────────
export function TabOurJourney({
  items,
  journeyBackground,
  onBackgroundChange,
  onSaveBackground,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onReorder,
  saving,
  push,
}) {
  const [modal, setModal] = useState({ open: false, item: null });

  const handleOpenAdd = () => setModal({ open: true, item: null });
  const handleOpenEdit = (item) => setModal({ open: true, item });

  const handleSaveItem = (form) => {
    if (modal.item) {
      onEditItem(modal.item.id, form);
    } else {
      onAddItem(form);
    }
    setModal({ open: false, item: null });
  };

  const handleDelete = (item) => {
    if (confirm("Are you sure you want to delete this card?")) {
      onDeleteItem(item.id);
    }
  };

  const handleMove = (index, direction) => {
    const newItems = [...items];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newItems.length) return;
    [newItems[index], newItems[newIndex]] = [
      newItems[newIndex],
      newItems[index],
    ];
    onReorder(newItems);
  };

  return (
    <div className="space-y-5">
      {/* Background — saved to settings */}
      <SectionCard
        title="Section Appearance"
        description="Customize the look of the Journey section"
      >
        <div className="space-y-4">
          <div>
            <Label>Section Background Color or Image URL</Label>
            <Input
              placeholder="e.g. #ffffff or https://..."
              value={journeyBackground}
              onChange={(e) => onBackgroundChange(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <SaveButton saving={saving} onClick={onSaveBackground} />
        </div>
      </SectionCard>

      {/* Cards — saved to journey API */}
      <SectionCard
        title="Journey Cards"
        description="The story of your relationship in chronological order"
        action={
          <button
            onClick={handleOpenAdd}
            className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-1.5"
          >
            <span>+</span> Add Card
          </button>
        }
      >
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-gray-100 rounded-2xl text-center">
              <p className="text-gray-400 text-sm">
                No cards yet. Start adding your story!
              </p>
            </div>
          ) : (
            items.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                  {item.photo_url ? (
                    <img
                      src={item.photo_url}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${item.bg}`}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-400 truncate">{item.date}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => handleMove(i, -1)}
                    disabled={i === 0}
                    className="p-1.5 text-gray-400 hover:text-gray-900 disabled:opacity-20"
                    title="Move Up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMove(i, 1)}
                    disabled={i === items.length - 1}
                    className="p-1.5 text-gray-400 hover:text-gray-900 disabled:opacity-20"
                    title="Move Down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-gray-400 hover:text-blue-600"
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1.5 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      {modal.open && (
        <JourneyItemModal
          item={modal.item}
          onSave={handleSaveItem}
          onClose={() => setModal({ open: false, item: null })}
          push={push}
        />
      )}
    </div>
  );
}
