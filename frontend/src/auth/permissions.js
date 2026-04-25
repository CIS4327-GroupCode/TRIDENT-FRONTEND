export const ROLES = {
  RESEARCHER: 'researcher',
  NONPROFIT: 'nonprofit',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

export const ROLE_DEFAULT_ROUTES = {
  [ROLES.RESEARCHER]: '/dashboard/researcher',
  [ROLES.NONPROFIT]: '/dashboard/nonprofit',
  [ROLES.ADMIN]: '/admin',
  [ROLES.SUPER_ADMIN]: '/admin'
};

export const ROLE_PERMISSIONS = {
  [ROLES.RESEARCHER]: {
    canViewDashboard: true,
    canViewAdminPanel: false,
    canManageSettings: true,
    canViewMessages: true,
    canViewAgreements: true,
    canCreateAgreements: false,
    canSaveProjects: true,
    canManageProjects: false,
    canInviteResearchers: false,
    canApplyToProjects: true,
    canSubmitRatings: true,
    canModerateContent: false,
    canManageUsers: false,
    canCreateAdmin: false,
    canViewResearcherProfile: true
  },
  [ROLES.NONPROFIT]: {
    canViewDashboard: true,
    canViewAdminPanel: false,
    canManageSettings: true,
    canViewMessages: true,
    canViewAgreements: true,
    canCreateAgreements: true,
    canSaveProjects: false,
    canManageProjects: true,
    canInviteResearchers: true,
    canApplyToProjects: false,
    canSubmitRatings: true,
    canModerateContent: false,
    canManageUsers: false,
    canCreateAdmin: false,
    canViewResearcherProfile: true
  },
  [ROLES.ADMIN]: {
    canViewDashboard: false,
    canViewAdminPanel: true,
    canManageSettings: true,
    canViewMessages: true,
    canViewAgreements: true,
    canCreateAgreements: false,
    canSaveProjects: false,
    canManageProjects: false,
    canInviteResearchers: false,
    canApplyToProjects: false,
    canSubmitRatings: false,
    canModerateContent: true,
    canManageUsers: true,
    canCreateAdmin: false,
    canViewResearcherProfile: true
  },
  [ROLES.SUPER_ADMIN]: {
    canViewDashboard: false,
    canViewAdminPanel: true,
    canManageSettings: true,
    canViewMessages: true,
    canViewAgreements: true,
    canCreateAgreements: false,
    canSaveProjects: false,
    canManageProjects: false,
    canInviteResearchers: false,
    canApplyToProjects: false,
    canSubmitRatings: false,
    canModerateContent: true,
    canManageUsers: true,
    canCreateAdmin: true,
    canViewResearcherProfile: true
  }
};

export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  return Boolean(ROLE_PERMISSIONS[role]?.[permission]);
}

export function getPermissions(role) {
  return ROLE_PERMISSIONS[role] || {};
}

export function getDefaultRouteForRole(role) {
  return ROLE_DEFAULT_ROUTES[role] || '/';
}
