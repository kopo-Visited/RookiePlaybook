export const ROUTES = {
  LOGIN: '/login',
  CHANGE_PASSWORD: '/change-password',
  ACCOUNT_UNLOCK: '/account-unlock-request',
  DASHBOARD: '/dashboard',
  DOC: {
    LIST: '/doc',
    DEPT: '/doc/dept/:dept',
    DEPT_PATH: dept => `/doc/dept/${dept}`,
    DETAIL: id => `/doc/${id}`,
  },
  QNA: {
    LIST: '/qna',
    ALL: '/qna/all',
  },
  NOTICE: {
    LIST: '/notice',
  },
  EDU: {
    LIST: '/edu',
    DETAIL: id => `/edu/${id}`,
    VIDEO: (id, stageId) => `/edu/${id}/stages/${stageId}`,
  },
  INQUIRY: '/contact',
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    DOC: '/admin/doc',
    DOC_STALE: '/admin/doc/stale',
    QNA: '/admin/qna',
    EDU: '/admin/edu',
    INQUIRY: '/admin/inquiry',
    SCHEDULE: '/admin/schedule',
    SETTINGS: '/admin/settings',
  },
};
