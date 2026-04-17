import { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import * as authService from '../../services/authService';

// Module-level cache — keyed by role to avoid cross-role contamination
const _cache = {};

export default function usePermissions() {
  const user = authService.getAdminUser();
  const isAdmin = user?.role === 'admin';
  const role = user?.role;

  const [permissions, setPermissions] = useState(() => _cache[role] || null);
  const [loading, setLoading] = useState(!isAdmin && !_cache[role]);

  useEffect(() => {
    // admin always has full access — no fetch needed
    if (isAdmin) {
      setLoading(false);
      return;
    }

    // Already cached for this role
    if (_cache[role]) {
      setPermissions(_cache[role]);
      setLoading(false);
      return;
    }

    setLoading(true);
    apiClient.get('/api/admin/permissions')
      .then(res => {
        const perms = res.permissions?.[role] || {};
        _cache[role] = perms; // cache only on success
        setPermissions(perms);
      })
      .catch(() => {
        // Do NOT cache on failure — allow retry on next render
        setPermissions({});
      })
      .finally(() => setLoading(false));
  }, [role, isAdmin]);

  const can = (resource) => {
    // admin always can
    if (isAdmin) return true;
    // while loading, show all items to prevent flicker
    // (backend will still enforce real access control)
    if (loading) return true;
    if (!permissions) return true;
    return permissions[resource] === true;
  };

  return { can, permissions, loading, isAdmin };
}
