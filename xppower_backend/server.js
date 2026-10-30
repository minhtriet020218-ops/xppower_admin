const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080; // Khớp với baseUrl trong AxiosClient.ts của frontend

// Middleware cấu hình CORS và phân tích JSON
app.use(cors());
app.use(express.json());

/**
 * 1. API Đăng nhập
 * Endpoint: POST /api/v1/auth/login
 */
app.post('/api/v1/auth/login', (req, res) => {
  const { username, passwordHash } = req.body;

  // Kiểm tra tài khoản (Sau này bạn có thể thay thế bằng kết nối Database thực tế như MySQL/MongoDB)
  if (username === 'admin' && (passwordHash === 'admin123' || passwordHash)) {
    return res.status(200).json({
      token: 'mock_jwt_token_from_real_backend_xyz987',
      username: username
    });
  }

  return res.status(401).json({
    message: 'Tên đăng nhập hoặc mật khẩu không chính xác!'
  });
});

/**
 * 2. API Lấy thống kê Dashboard
 * Endpoint: GET /api/v1/dashboard/stats
 */
app.get('/api/v1/dashboard/stats', (req, res) => {
  const dashboardStats = {
    totalAssets: 2198,
    activeAssets: 2112,
    departmentsCount: 30,
    deviceTypesCount: 5,
    departmentDistribution: [
      { name: 'PS Production', count: 558 },
      { name: 'Không xác định', count: 323 },
      { name: 'ENG-PS-IDL', count: 261 },
      { name: 'IE-IDL', count: 180 },
      { name: 'NPI-IDL', count: 100 },
      { name: 'PMC', count: 68 },
      { name: 'PP/Cable-PS Off', count: 63 },
      { name: 'HVHP-PS Off', count: 51 },
      { name: 'FINANCE', count: 51 },
      { name: 'FACILITY', count: 46 },
      { name: 'P&O', count: 40 },
      { name: 'Engineering', count: 29 },
      { name: 'TRO', count: 25 },
      { name: 'Quality', count: 24 },
      { name: 'ENG-Mags', count: 24 },
      { name: 'QA-HVHP', count: 18 },
      { name: 'EMCO-PS', count: 18 },
      { name: 'HVHP & RF Project', count: 17 },
      { name: 'EMCO-ENG-PS', count: 16 },
      { name: 'P&O IDL', count: 15 },
      { name: 'WH-DL OU', count: 15 },
      { name: 'Category Sourcing HVHP', count: 15 },
      { name: 'Production', count: 15 },
      { name: 'Global Planning', count: 14 },
      { name: 'Component Engineering', count: 14 },
      { name: 'QA-Mags', count: 13 },
      { name: 'EMCO-QA', count: 12 },
      { name: 'Mags Production Off', count: 12 },
      { name: 'Operations', count: 10 },
      { name: 'WH-DL OU2', count: 10 }
    ],
    statusDistribution: [
      { status: 'In Stock', count: 180 },
      { status: 'In Use', count: 1635 },
      { status: 'Damaged', count: 45 },
      { status: 'Không xác định', count: 465 },
      { status: 'Write off', count: 20 },
      { status: 'Retired', count: 15 },
      { status: 'Backup', count: 10 }
    ],
    typeDistribution: [
      { type: 'Laptop', count: 611 },
      { type: 'Monitor', count: 822 },
      { type: 'Network Device', count: 369 },
      { type: 'Desktop', count: 100 },
      { type: 'Scanner', count: 45 }
    ]
  };

  return res.status(200).json(dashboardStats);
});

// Khởi động server lắng nghe tại cổng 8080
app.listen(PORT, () => {
  console.log(`🚀 Backend server đang chạy mượt mà tại: http://localhost:${PORT}`);
});