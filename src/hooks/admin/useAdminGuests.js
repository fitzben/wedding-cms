import { useState, useEffect, useCallback } from "react";
import * as authService from "../../services/authService";
import { apiCache } from "../../services/apiCache";
import { apiClient } from "../../services/apiClient";

const limit = 10;

const API = {
  list: (page, limit, search, showDeleted = false, filters = {}) => {
    const params = new URLSearchParams({
      page,
      limit,
      search: encodeURIComponent(search),
      show_deleted: showDeleted,
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.importance ? { importance: filters.importance } : {}),
      ...(filters.guest_group_id
        ? { guest_group_id: filters.guest_group_id }
        : {}),
      ...(filters.invitation_type
        ? { invitation_type: filters.invitation_type }
        : {}),
    });
    if (filters.created_by) params.set("created_by", filters.created_by);
    const qs = params.toString();
    const cacheKey = `adminguests_${qs}`;
    return apiCache.fetch(cacheKey, () =>
      apiClient.get(`/api/admin/guests?${qs}`),
    );
  },

  create: (body) => apiClient.post("/api/admin/guests", body),
  update: (id, body) => apiClient.put(`/api/admin/guests/${id}`, body),
  remove: (id) => apiClient.delete(`/api/admin/guests/${id}`),
  restore: (id) => apiClient.post(`/api/admin/guests/${id}/restore`),
  markInvited: (id, status = "sent") =>
    apiClient.patch(`/api/admin/guests/${id}/mark-invited`, { status }),
  getSettings: () => apiClient.get("/api/admin/settings"),
};

// Invalidate ALL guest list cache entries so the next fetch always hits the network
const invalidateGuestCache = (slug = null) => {
  const cache = apiCache._cache || apiCache.cache;
  if (cache && typeof cache.forEach === "function") {
    const keysToDelete = [];
    cache.forEach((_, key) => {
      if (key.startsWith("adminguests_")) keysToDelete.push(key);
    });
    keysToDelete.forEach((k) => apiCache.delete(k));
  }
  if (slug) {
    apiCache.delete(`guest_${slug}`);
  }
};

const GroupAPI = {
  list: () =>
    apiCache.fetch("adminguestgroups_all", () =>
      apiClient.get("/api/admin/guest-groups"),
    ),
};

function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(
      () => setToasts((p) => p.filter((t) => t.id !== id)),
      3200,
    );
  }, []);
  return { toasts, push };
}

const EMPTY_FILTERS = {
  category: "",
  priority: "",
  importance: "",
  guest_group_id: "",
  invitation_type: "",
  created_by: "",
};

export default function useAdminGuests() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [groups, setGroups] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editGuest, setEditGuest] = useState(null);

  // Bulk
  const [selected, setSelected] = useState(new Set());

  // Confirm
  const [confirm, setConfirm] = useState({ open: false });

  // WA template from settings
  const [waTemplate, setWaTemplate] = useState("");
  const [settings, setSettings] = useState({});

  const { toasts, push } = useToast();

  const user = authService.getAdminUser();
  const isAdmin = user?.role === "admin" || user?.role === "parents";
  const currentUserId = user?.user_id || "";

  // ── Load groups + WA template once ──
  useEffect(() => {
    GroupAPI.list()
      .then((r) => setGroups(r.groups || []))
      .catch(() => {});
    apiClient.get("/api/admin/users")
      .then((r) => setAdminUsers(r.users || []))
      .catch(() => {});
    API.getSettings()
      .then((r) => {
        // Expected settings key: wa_invite_template
        // Supports placeholders: {name}, {link}
        setWaTemplate(r.settings?.wa_template || "");
        setSettings(r.settings || {});
      })
      .catch(() => {});
  }, []);

  // ── Auto-fill created_by filter when panel opens ──
  useEffect(() => {
    if (showFilters && !filters.created_by && currentUserId) {
      setFilter("created_by", currentUserId);
    }
  }, [showFilters]);

  // ── Debounced search ──
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== searchInput) {
        setSearch(searchInput);
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [searchInput, search]);

  // ── Fetch ──
  const fetchGuests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await API.list(
        page,
        limit,
        search,
        showDeleted,
        filters,
      );
      setGuests(result.data || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load guests");
    } finally {
      setLoading(false);
    }
  }, [page, search, showDeleted, filters]);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  // ── Clear selection when page/search/showDeleted/filters changes ──
  useEffect(() => {
    setSelected(new Set());
  }, [page, search, showDeleted, filters]);

  const setFilter = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const totalPages = Math.ceil(total / limit);

  // ── Handlers ──
  const openCreate = () => {
    setEditGuest(null);
    setModalOpen(true);
  };

  const openEdit = (g) => {
    setEditGuest(g);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    if (editGuest) {
      const updated = await API.update(editGuest.id, form);
      if (updated.error) {
        push(updated.error, "error");
        return;
      }
      push("Guest updated successfully", "success");
    } else {
      const created = await API.create(form);
      if (created.error) {
        push(created.error, "error");
        return;
      }
      push("Guest added successfully", "success");
    }
    invalidateGuestCache(editGuest?.slug);
    fetchGuests();
  };

  const handleDelete = (id, name) => {
    setConfirm({
      open: true,
      title: "Delete Guest",
      message: `Are you sure you want to remove "${name}"? This cannot be undone.`,
      danger: true,
      onConfirm: async () => {
        setConfirm({ open: false });
        const res = await API.remove(id);
        if (res.error) {
          push("Failed to delete guest", "error");
          return;
        }
        push("Guest deleted", "success");
        invalidateGuestCache();
        fetchGuests();
      },
    });
  };

  const handleRestore = (id, name) => {
    setConfirm({
      open: true,
      title: "Restore Guest",
      message: `Are you sure you want to restore "${name}"?`,
      danger: false,
      onConfirm: async () => {
        setConfirm({ open: false });
        const res = await API.restore(id);
        if (res.error) {
          push("Failed to restore guest", "error");
          return;
        }
        push("Guest restored", "success");
        invalidateGuestCache();
        fetchGuests();
      },
    });
  };

  const handleBulkDelete = () => {
    if (!selected.size) return;
    setConfirm({
      open: true,
      title: `Delete ${selected.size} Guest${selected.size > 1 ? "s" : ""}`,
      message: `This will permanently delete ${
        selected.size
      } selected guest${selected.size > 1 ? "s" : ""}. This cannot be undone.`,
      danger: true,
      onConfirm: async () => {
        setConfirm({ open: false });
        await Promise.all([...selected].map((id) => API.remove(id)));
        push(`${selected.size} guests deleted`, "success");
        setSelected(new Set());
        invalidateGuestCache();
        fetchGuests();
      },
    });
  };

  const copyLink = (slug) => {
    const url = `${window.location.origin}/invite/${slug}`;
    navigator.clipboard
      .writeText(url)
      .then(() => push("Link berhasil disalin!", "info"));
  };

  // Format date string (YYYY-MM-DD) → "Minggu, 31 Mei 2026"
  const formatTanggal = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Format time range (HH:MM, HH:MM) → "08.00 - 10.00 WIB"
  const formatWaktu = (start, end) => {
    const fmt = (t) => (t ? t.replace(":", ".") : "");
    if (!start && !end) return "";
    if (!end) return fmt(start) + " WIB";
    return fmt(start) + " - " + fmt(end) + " WIB";
  };

  // Build the template message text (same logic as WA, for copy)
  const buildMessage = (guest) => {
    const inviteLink = `${window.location.origin}/invite/${guest.slug}`;
    const name = guest.display_name || guest.first_name || "";
    let message = waTemplate || `Halo {nama}, berikut link undangan pernikahan kami: {link}`;
    return message
      .replace(/\{nama\}/gi, name)
      .replace(/\{link\}/gi, inviteLink)
      .replace(/\{tanggal_hm\}/gi, [formatTanggal(settings.hm_date), formatWaktu(settings.hm_time_start, settings.hm_time_end)].filter(Boolean).join("\n"))
      .replace(/\{waktu_hm\}/gi, formatWaktu(settings.hm_time_start, settings.hm_time_end))
      .replace(/\{venue_holy_matrimony\}/gi, settings.hm_venue_name || "")
      .replace(/\{tanggal_resepsi\}/gi, [formatTanggal(settings.resepsi_date), formatWaktu(settings.resepsi_time_start, settings.resepsi_time_end)].filter(Boolean).join("\n"))
      .replace(/\{waktu_resepsi\}/gi, formatWaktu(settings.resepsi_time_start, settings.resepsi_time_end))
      .replace(/\{venue_resepsi\}/gi, settings.resepsi_venue_name || "")
      .replace(/\{hm_maps_url\}/gi, settings.hm_maps_url || "")
      .replace(/\{resepsi_maps_url\}/gi, settings.resepsi_maps_url || "");
  };

  const copyLinkWithMessage = (guest) => {
    const text = buildMessage(guest);
    console.log(text)
    navigator.clipboard
      .writeText(text)
      .then(() => push("Link + pesan berhasil disalin!", "info"));
  };

  // Build WA URL — uses buildMessage helper above
  const openWhatsApp = (guest) => {
    const phone = guest.phone_number?.replace(/\D/g, "");
    if (!phone) {
      push("Nomor HP tidak tersedia", "error");
      return;
    }
    const message = buildMessage(guest);
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  // Mark / unmark invite sent — optimistic update + persist
  const handleMarkInvited = async (guest) => {
    const newStatus = guest.invite_status === "sent" ? "pending" : "sent";
    // Optimistic update
    setGuests((prev) =>
      prev.map((g) =>
        g.id === guest.id ? { ...g, invite_status: newStatus } : g,
      ),
    );

    const res = await API.markInvited(guest.id, newStatus);
    if (res.error) {
      // Revert on failure
      setGuests((prev) =>
        prev.map((g) =>
          g.id === guest.id ? { ...g, invite_status: guest.invite_status } : g,
        ),
      );
      push("Gagal update status undangan", "error");
    } else {
      push(
        newStatus === "sent"
          ? "✓ Ditandai sudah diundang"
          : "Dikembalikan ke pending",
        "success",
      );
      invalidateGuestCache(guest.slug);
    }
  };

  // ── Select all (current page) ──
  const allSelected =
    guests.length > 0 && guests.every((g) => selected.has(g.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const s = new Set(prev);
        guests.forEach((g) => s.delete(g.id));
        return s;
      });
    } else {
      setSelected((prev) => {
        const s = new Set(prev);
        guests.forEach((g) => s.add(g.id));
        return s;
      });
    }
  };

  const toggleOne = (id) => {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  return {
    // data
    guests,
    loading,
    error,
    total,

    // paging/search
    page,
    setPage,
    limit,
    searchInput,
    setSearchInput,
    search,

    // toggles
    showDeleted,
    setShowDeleted,
    showFilters,
    setShowFilters,

    // filters
    groups,
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,

    // computed
    totalPages,

    // selection
    selected,
    allSelected,
    toggleAll,
    toggleOne,

    // modal
    modalOpen,
    setModalOpen,
    editGuest,
    openCreate,
    openEdit,
    handleSave,

    // actions
    handleDelete,
    handleRestore,
    handleBulkDelete,
    openWhatsApp,
    handleMarkInvited,
    copyLink,
    copyLinkWithMessage,

    // toast + confirm
    toasts,
    confirm,
    setConfirm,

    // permissions
    isAdmin,
    currentUserId,
    adminUsers,
  };
}

