const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// --- Mock Database tạm thời trên RAM cho Assets ---
let mockAssetsDatabase = [
  {
    id: '1',
    itAssetCode: 'ASSET-1215',
    hostname: 'PC-VN-01',
    category: 'Laptop',
    product: 'Dell Vostro',
    productionLine: 'PS Production',
    financeAssetCode: 'TOOLVN202106-750',
    poInvoice: 'VTG210573PR',
    serialNumber: '5KSGHB3',
    computerDescription: 'Laptop Dell Vostro 3400, i7-1165G7, 16GB RAM, 512 SSD',
    assetStatus: 'In Stock',
    staffCode: 'VN2612246',
  },
  {
    id: '2',
    itAssetCode: 'ASSET-1216',
    hostname: 'PC-VN-02',
    category: 'Monitor',
    product: 'Dell UltraSharp',
    productionLine: 'ENG-PS-IDL',
    financeAssetCode: 'TOOLVN202107-812',
    poInvoice: 'VTG210892PR',
    serialNumber: '7X99LP2',
    computerDescription: 'Màn hình Dell 24 inch P2422H IPS',
    assetStatus: 'In Use',
    staffCode: 'VN2612247',
  },
  {
    id: '3',
    itAssetCode: 'ASSET-1217',
    hostname: 'PC-VN-03',
    category: 'Desktop',
    product: 'HP ProDesk',
    productionLine: 'IE-IDL',
    financeAssetCode: 'TOOLVN202201-104',
    poInvoice: 'VTG220115PR',
    serialNumber: 'MXL2390V8',
    computerDescription: 'Máy tính để bàn HP ProDesk 400 G9 MT, i5-12500',
    assetStatus: 'In Use',
    staffCode: 'VN2612248',
  }
];

/**
 * 1. API Đăng nhập
 */
app.post('/api/v1/auth/login', (req, res) => {
  const { username, passwordHash } = req.body;
  if (username === 'admin' && (passwordHash === 'admin123' || passwordHash)) {
    return res.status(200).json({
      token: 'mock_jwt_token_from_real_backend_xyz987',
      username: username
    });
  }
  return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác!' });
});

/**
 * 2. API Lấy danh sách tài sản: GET /api/v1/assets
 */
app.get('/api/v1/assets', (req, res) => {
  return res.status(200).json(mockAssetsDatabase);
});

/**
 * 3. API Tạo mới tài sản: POST /api/v1/assets
 */
app.post('/api/v1/assets', (req, res) => {
  const newAsset = { id: Date.now().toString(), ...req.body };
  mockAssetsDatabase.unshift(newAsset); // Đưa lên đầu danh sách
  return res.status(201).json(newAsset);
});

/**
 * 4. API Cập nhật tài sản: PUT /api/v1/assets/:id
 */
app.put('/api/v1/assets/:id', (req, res) => {
  const { id } = req.params;
  const index = mockAssetsDatabase.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Không tìm thấy tài sản cần sửa!' });
  }

  mockAssetsDatabase[index] = { ...mockAssetsDatabase[index], ...req.body, id };
  return res.status(200).json(mockAssetsDatabase[index]);
});

/**
 * 5. API Xóa (Thanh lý) tài sản: DELETE /api/v1/assets
 * Nhận vào một mảng chứa danh sách ID cần xóa: { ids: ['1', '2'] }
 */
app.delete('/api/v1/assets', (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Danh sách ID không hợp lệ!' });
  }

  mockAssetsDatabase = mockAssetsDatabase.filter(item => !ids.includes(item.id));
  return res.status(200).json({ message: 'Xóa thành công các tài sản đã chọn', deletedIds: ids });
});

/**
 * 6. API Thống kê Dashboard
 */
app.get('/api/v1/dashboard/stats', (req, res) => {
  // Giữ nguyên phần thống kê dashboard cũ của bạn...
  res.status(200).json({ totalAssets: mockAssetsDatabase.length });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server đang chạy tại: http://localhost:${PORT}`);
});