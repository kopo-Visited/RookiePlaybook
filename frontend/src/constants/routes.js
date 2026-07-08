export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  DOC: {
    LIST: '/doc',
    DEPT: '/doc/dept/:dept',
    DEPT_PATH: dept => `/doc/dept/${dept}`,
    DETAIL: id => `/doc/${id}`,
  },
  QNA: {
    LIST: '/qna',
  },
  EDU: {
    LIST: '/edu',
  },
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    DOC: '/admin/doc',
    QNA: '/admin/qna',
    EDU: '/admin/edu',
    INQUIRY: '/admin/inquiry',
    SETTINGS: '/admin/settings',
  },
};
