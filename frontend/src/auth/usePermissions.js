import { useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { ROLES, getPermissions, hasPermission } from './permissions';

export function usePermissions() {
  const { user, isAuthenticated } = useAuth();
  const role = user?.role;

  const permissions = useMemo(() => getPermissions(role), [role]);

  const can = useCallback(
    (permission) => hasPermission(role, permission),
    [role]
  );

  const isAdmin = role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;

  return {
    role,
    can,
    permissions,
    isAdmin,
    isAuthenticated
  };
}

export default usePermissions;
