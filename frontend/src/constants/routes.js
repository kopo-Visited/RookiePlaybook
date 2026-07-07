export const ROUTES = {
  LOGIN: '/login',
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
    DOC: '/admin/doc',
  },
};
