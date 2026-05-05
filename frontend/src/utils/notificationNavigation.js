import { ROLES, getDefaultRouteForRole } from '../auth/permissions';

const KNOWN_STATIC_PATHS = new Set([
  '/',
  '/browse',
  '/contact',
  '/faq',
  '/admin',
  '/settings',
  '/messages',
  '/agreements',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/notifications'
]);

const toPositiveInt = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const parseInternalUrl = (value) => {
  if (!value) return null;

  try {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      const url = new URL(value);
      return `${url.pathname}${url.search}${url.hash || ''}`;
    }

    if (!value.startsWith('/')) return null;
    return value;
  } catch {
    return null;
  }
};

const splitPathAndQuery = (value) => {
  const safe = parseInternalUrl(value);
  if (!safe) return { pathname: '', search: '', hash: '' };

  try {
    const url = new URL(`http://local${safe}`);
    return {
      pathname: url.pathname,
      search: url.search,
      hash: url.hash
    };
  } catch {
    return { pathname: '', search: '', hash: '' };
  }
};

const isKnownPath = (value) => {
  const { pathname } = splitPathAndQuery(value);
  if (!pathname) return false;

  if (KNOWN_STATIC_PATHS.has(pathname)) return true;
  if (/^\/dashboard\/(nonprofit|researcher)$/.test(pathname)) return true;
  if (/^\/projects\/\d+$/.test(pathname)) return true;
  if (/^\/projects\/\d+\/milestones$/.test(pathname)) return true;
  if (/^\/projects\/\d+\/applications$/.test(pathname)) return true;
  if (/^\/researcher\/\d+$/.test(pathname)) return true;
  if (/^\/agreements\/\d+$/.test(pathname)) return true;

  return false;
};

const withRoleDashboard = (role, tab) => {
  if (role === ROLES.NONPROFIT || role === ROLES.RESEARCHER) {
    const base = `/dashboard/${role}`;
    return tab ? `${base}?tab=${encodeURIComponent(tab)}` : base;
  }

  return '/admin';
};

const withResearcherProjectsSubtab = (projectsTab) => {
  const base = withRoleDashboard(ROLES.RESEARCHER, 'projects');
  if (!projectsTab) return base;
  return `${base}&projectsTab=${encodeURIComponent(projectsTab)}`;
};

const mapLegacyLink = (rawLink, role) => {
  const normalized = parseInternalUrl(rawLink);
  if (!normalized) return null;

  const { pathname, search, hash } = splitPathAndQuery(normalized);

  if (pathname === '/dashboard') {
    const tab = new URLSearchParams(search).get('tab');

    if (role === ROLES.RESEARCHER) {
      if (tab === 'invitations') return withResearcherProjectsSubtab('invitations');
      if (tab === 'tentative') return withResearcherProjectsSubtab('tentative');
      if (tab === 'agreements') return withResearcherProjectsSubtab('current');
    }

    return withRoleDashboard(role, tab || undefined);
  }

  if (pathname === '/projects') {
    return role === ROLES.NONPROFIT ? '/dashboard/nonprofit?tab=projects' : '/browse';
  }

  if (/^\/admin\/projects\/\d+$/.test(pathname) || pathname === '/admin/logs') {
    return '/admin';
  }

  if (pathname === '/help') {
    return '/contact';
  }

  // Keep valid internal paths as-is.
  if (isKnownPath(normalized)) {
    return `${pathname}${search}${hash || ''}`;
  }

  return null;
};

const fallbackForType = (notification, role) => {
  const type = notification?.type;
  const metadata = notification?.metadata || {};

  const projectId = toPositiveInt(metadata.project_id);
  const agreementId = toPositiveInt(metadata.agreement_id);
  const threadId = toPositiveInt(metadata.thread_id);

  if (type === 'project_deleted') {
    return role === ROLES.NONPROFIT ? '/dashboard/nonprofit?tab=projects' : '/browse';
  }

  if (type?.startsWith('milestone_')) {
    return projectId ? `/projects/${projectId}/milestones` : withRoleDashboard(role, 'projects');
  }

  if (type === 'application_received') {
    if (metadata.invitation) {
      return withResearcherProjectsSubtab('invitations');
    }
    if (metadata.direction === 'sent' && projectId) {
      return `/projects/${projectId}`;
    }
    return projectId ? `/projects/${projectId}/applications` : '/dashboard/nonprofit?tab=applications';
  }

  if (type === 'application_accepted' || type === 'application_rejected' || type === 'project_application') {
    return projectId ? `/projects/${projectId}` : '/dashboard/researcher?tab=projects';
  }

  if (type === 'invitation') {
    return withResearcherProjectsSubtab('invitations');
  }

  if (type?.startsWith('agreement_')) {
    return agreementId ? `/agreements/${agreementId}` : '/agreements';
  }

  if (type === 'message_received') {
    return threadId ? `/messages?thread=${threadId}` : '/messages';
  }

  if (type === 'new_match_available') {
    return withResearcherProjectsSubtab('tentative');
  }

  if (type === 'rating_received' || type === 'rating_moderated') {
    return projectId ? `/browse?project=${projectId}` : '/browse';
  }

  if (type === 'user_suspended' || type === 'security' || type === 'account_status_changed' || type === 'account_verified') {
    return '/settings';
  }

  if (type === 'admin_message' || type === 'system_announcement') {
    return '/notifications';
  }

  if (type?.startsWith('project_')) {
    return projectId ? `/projects/${projectId}` : role === ROLES.NONPROFIT ? '/dashboard/nonprofit?tab=projects' : '/browse';
  }

  return '/notifications';
};

export const resolveNotificationNavigationTarget = (notification, role) => {
  const mappedLink = mapLegacyLink(notification?.link, role);
  if (mappedLink && isKnownPath(mappedLink)) {
    return mappedLink;
  }

  const fallback = fallbackForType(notification, role);
  if (fallback && isKnownPath(fallback)) {
    return fallback;
  }

  const defaultRoute = getDefaultRouteForRole(role);
  return defaultRoute || '/';
};
