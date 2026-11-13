export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    LOGOUT: "/api/v1/auth/logout",
    REFRESH_TOKEN: "/api/v1/auth/refresh",
  },
  DASHBOARD: {
    GET_STATS: "/api/v1/dashboard/stats",
  },
  ASSETS: {
    GET_LIST: "/api/v1/assets",
    GET_BY_ID: (id: string) => `/api/v1/assets/${id}`,
  },
  // Các API cho Trang cá nhân (backend cần bổ sung, xem PersonalService.ts)
  PERSONAL: {
    ATTENDANCE: "/api/v1/personal/attendance",      // GET ?month=YYYY-MM
    LEAVE: "/api/v1/personal/leave-requests",       // GET, POST
    SHIFT_CHANGE: "/api/v1/personal/shift-changes", // GET, POST
    MEAL_ORDERS: "/api/v1/personal/meal-orders",    // GET, POST
  },
} as const;
