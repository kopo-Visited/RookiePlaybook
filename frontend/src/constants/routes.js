export const ROUTES = {
  LOGIN: '/login',
  DOC: {
    LIST: '/doc',
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
