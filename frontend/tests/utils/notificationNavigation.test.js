import { resolveNotificationNavigationTarget } from '../../src/utils/notificationNavigation';

describe('resolveNotificationNavigationTarget', () => {
  test('rewrites legacy dashboard link to role-specific route', () => {
    const target = resolveNotificationNavigationTarget(
      { type: 'new_match_available', link: '/dashboard?tab=tentative' },
      'researcher'
    );

    expect(target).toBe('/dashboard/researcher?tab=projects&projectsTab=tentative');
  });

  test('keeps valid project applications route intact', () => {
    const target = resolveNotificationNavigationTarget(
      { type: 'application_received', link: '/projects/123/applications' },
      'nonprofit'
    );

    expect(target).toBe('/projects/123/applications');
  });

  test('maps legacy admin project review links to admin dashboard', () => {
    const target = resolveNotificationNavigationTarget(
      { type: 'project_submitted_for_review', link: '/admin/projects/44' },
      'admin'
    );

    expect(target).toBe('/admin');
  });

  test('maps missing system announcement links to notifications center', () => {
    const target = resolveNotificationNavigationTarget(
      { type: 'system_announcement', link: null },
      'researcher'
    );

    expect(target).toBe('/notifications');
  });

  test('maps project deleted events to projects list view for nonprofits', () => {
    const target = resolveNotificationNavigationTarget(
      { type: 'project_deleted', link: '/projects' },
      'nonprofit'
    );

    expect(target).toBe('/dashboard/nonprofit?tab=projects');
  });

  test('falls back safely when milestone notification has invalid project metadata', () => {
    const target = resolveNotificationNavigationTarget(
      { type: 'milestone_overdue', metadata: { project_id: null } },
      'nonprofit'
    );

    expect(target).toBe('/dashboard/nonprofit?tab=projects');
  });

  test('routes message notifications to a specific thread when thread metadata is present', () => {
    const target = resolveNotificationNavigationTarget(
      { type: 'message_received', metadata: { thread_id: 42 } },
      'researcher'
    );

    expect(target).toBe('/messages?thread=42');
  });
});
