export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH_TOKEN: '/api/v1/auth/refresh',
  },
  DASHBOARD: {
    GET_STATS: '/api/v1/dashboard/stats',
  },
  ASSETS: {
    GET_LIST: '/api/v1/assets',
    GET_BY_ID: (id: string) => `/api/v1/assets/${id}`,
  },
} as const;