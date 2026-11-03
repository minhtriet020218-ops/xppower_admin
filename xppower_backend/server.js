const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// --- CẤU HÌNH UPLOAD HÌNH ẢNH TÀI SẢN ---
const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Tên file là UUID ngẫu nhiên (không dùng tên gốc) nên có thể cache vô thời hạn
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d', immutable: true }));

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const IMAGE_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    // Đuôi file lấy theo mimetype đã whitelist, không tin tên file do client gửi
    filename: (req, file, cb) => cb(null, crypto.randomUUID() + IMAGE_EXTENSIONS[file.mimetype]),
  }),
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (IMAGE_EXTENSIONS[file.mimetype]) return cb(null, true);
    cb(new Error('Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF!'));
  },
});

// Middleware nhận 1 file ở field "image" (tùy chọn). Request JSON thông thường vẫn đi qua bình thường.
const uploadImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (!err) return next();
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Ảnh vượt quá 5MB!' : err.message;
    return res.status(400).json({ message });
  });
};

// Xóa file ảnh trên đĩa (best-effort). Chỉ xóa trong thư mục uploads, chống path traversal.
const removeImageFile = async (imageUrl) => {
  if (typeof imageUrl !== 'string' || !imageUrl.startsWith('/uploads/')) return;
  try {
    await fs.promises.unlink(path.join(UPLOAD_DIR, path.basename(imageUrl)));
  } catch (_) { /* file không còn tồn tại thì bỏ qua */ }
};

// --- CẤU HÌNH KẾT NỐI POSTGREYSQL ---
const pool = new Pool({
  user: 'postgres',         // Tên user của bạn (mặc định thường là postgres)
  host: 'localhost',
  database: 'xppower_db',   // Tên database bạn vừa tạo
  password: '062462862',         // ⚠️ Đổi thành mật khẩu PostgreSQL của bạn
  port: 5432,               // Cổng mặc định của PostgreSQL
});

pool.connect()
  .then(() => console.log('✅ Đã kết nối thành công với PostgreSQL! Dữ liệu được lưu vĩnh viễn.'))
  .catch(err => console.error('❌ Lỗi kết nối PostgreSQL:', err));

// --- TỰ ĐỘNG TẠO BẢNG ASSETS NẾU CHƯA TỒN TẠI ---
const initDatabase = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS assets (
      id SERIAL PRIMARY KEY,
      it_asset_code VARCHAR(255) UNIQUE NOT NULL,
      hostname VARCHAR(255),
      category VARCHAR(255),
      product VARCHAR(255),
      production_line VARCHAR(255),
      finance_asset_code VARCHAR(255),
      po_invoice VARCHAR(255),
      serial_number VARCHAR(255),
      computer_description TEXT,
      asset_status VARCHAR(50) DEFAULT 'In Stock',
      staff_code VARCHAR(255),
      assigned_to VARCHAR(255),
      mail_user VARCHAR(255),
      department VARCHAR(255),
      managed_by VARCHAR(255),
      managed_by_group VARCHAR(255),
      purchase_date VARCHAR(255),
      note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTableQuery);
    // Migration: thêm cột lưu đường dẫn hình ảnh (an toàn với bảng đã có dữ liệu)
    await pool.query('ALTER TABLE assets ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)');
    
    // Kiểm tra nếu bảng chưa có dữ liệu thì tiến hành seed dữ liệu mẫu
    const checkCount = await pool.query('SELECT COUNT(*) FROM assets');
    if (parseInt(checkCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO assets (
          it_asset_code, hostname, category, product, production_line,
          finance_asset_code, po_invoice, serial_number, computer_description,
          asset_status, staff_code, assigned_to, department
        ) VALUES 
        ('ASSET-1215', 'PC-VN-01', 'Laptop', 'Dell Vostro', 'PS Production', 'TOOL-01', 'PO-991', '5KSGHB3', 'Dell Vostro 3400, i7', 'In Stock', 'VN2612246', 'Nguyen Van A', 'PS Production'),
        ('ASSET-1216', 'PC-VN-02', 'Monitor', 'Dell UltraSharp', 'ENG-PS-IDL', 'TOOL-02', 'PO-992', '7X99LP2', 'Man hinh 24 inch', 'In Use', 'VN2612247', 'Tran Van B', 'ENG-PS-IDL'),
        ('ASSET-1217', 'PC-VN-03', 'Desktop', 'HP ProDesk', 'IE-IDL', 'TOOL-03', 'PO-993', 'MXL239', 'HP ProDesk 400', 'In Use', 'VN2612248', 'Le Thi C', 'IE-IDL');
      `);
      console.log('🌱 Đã nạp dữ liệu mẫu thành công vào xppower_db!');
    }
  } catch (err) {
    console.error('❌ Lỗi khởi tạo database:', err);
  }
};
initDatabase();

/**
 * 0. Kiểm tra nhanh: mở http://localhost:8080/api/v1/health trên trình duyệt.
 *    Thấy JSON {"imageUpload":true} nghĩa là đang chạy đúng bản server có hỗ trợ upload ảnh.
 */
app.get('/api/v1/health', (req, res) => res.json({ status: 'ok', imageUpload: true, uploadDir: UPLOAD_DIR }));

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

// Map dòng DB (snake_case) sang DTO của Frontend (camelCase)
const mapAssetRow = (row) => ({
  id: row.id.toString(),
  itAssetCode: row.it_asset_code,
  hostname: row.hostname,
  category: row.category,
  product: row.product,
  productionLine: row.production_line,
  financeAssetCode: row.finance_asset_code,
  poInvoice: row.po_invoice,
  serialNumber: row.serial_number,
  computerDescription: row.computer_description,
  assetStatus: row.asset_status,
  staffCode: row.staff_code,
  assignedTo: row.assigned_to,
  mailUser: row.mail_user,
  department: row.department,
  managedBy: row.managed_by,
  managedByGroup: row.managed_by_group,
  purchaseDate: row.purchase_date,
  note: row.note,
  imageUrl: row.image_url,
});

/**
 * 2. API Lấy danh sách tài sản: GET /api/v1/assets
 */
app.get('/api/v1/assets', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assets ORDER BY created_at DESC');
    return res.status(200).json(result.rows.map(mapAssetRow));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server khi lấy danh sách tài sản' });
  }
});

/**
 * 3. API Tạo mới tài sản: POST /api/v1/assets
 *    Nhận JSON hoặc multipart/form-data (kèm file ở field "image").
 *    imageUrl luôn do server quyết định, không nhận từ client.
 */
app.post('/api/v1/assets', uploadImage, async (req, res) => {
  const {
    itAssetCode, hostname, category, product, productionLine,
    financeAssetCode, poInvoice, serialNumber, computerDescription,
    assetStatus, staffCode, assignedTo, mailUser, department,
    managedBy, managedByGroup, purchaseDate, note
  } = req.body || {};

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const query = `
    INSERT INTO assets (
      it_asset_code, hostname, category, product, production_line,
      finance_asset_code, po_invoice, serial_number, computer_description,
      asset_status, staff_code, assigned_to, mail_user, department,
      managed_by, managed_by_group, purchase_date, note, image_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    RETURNING *;
  `;

  const values = [
    itAssetCode, hostname, category, product, productionLine,
    financeAssetCode, poInvoice, serialNumber, computerDescription,
    assetStatus || 'In Stock', staffCode, assignedTo, mailUser, department,
    managedBy, managedByGroup, purchaseDate, note, imageUrl
  ];

  try {
    const result = await pool.query(query, values);
    return res.status(201).json(mapAssetRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    await removeImageFile(imageUrl); // không để lại file mồ côi khi tạo thất bại
    return res.status(400).json({ message: 'Lỗi khi tạo mới tài sản (Mã tài sản có thể bị trùng)' });
  }
});

/**
 * 4. API Cập nhật tài sản: PUT /api/v1/assets/:id
 *    Có file mới -> thay ảnh và xóa ảnh cũ. Không có file -> giữ nguyên ảnh hiện tại.
 */
app.put('/api/v1/assets/:id', uploadImage, async (req, res) => {
  const { id } = req.params;
  const {
    itAssetCode, hostname, category, product, productionLine,
    financeAssetCode, poInvoice, serialNumber, computerDescription,
    assetStatus, staffCode, assignedTo, mailUser, department,
    managedBy, managedByGroup, purchaseDate, note
  } = req.body || {};

  const newImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const query = `
    UPDATE assets SET
      it_asset_code = $1, hostname = $2, category = $3, product = $4, production_line = $5,
      finance_asset_code = $6, po_invoice = $7, serial_number = $8, computer_description = $9,
      asset_status = $10, staff_code = $11, assigned_to = $12, mail_user = $13, department = $14,
      managed_by = $15, managed_by_group = $16, purchase_date = $17, note = $18,
      image_url = COALESCE($19, image_url)
    WHERE id = $20
    RETURNING *;
  `;

  const values = [
    itAssetCode, hostname, category, product, productionLine,
    financeAssetCode, poInvoice, serialNumber, computerDescription,
    assetStatus, staffCode, assignedTo, mailUser, department,
    managedBy, managedByGroup, purchaseDate, note, newImageUrl, id
  ];

  try {
    const old = await pool.query('SELECT image_url FROM assets WHERE id = $1', [id]);
    if (old.rows.length === 0) {
      await removeImageFile(newImageUrl);
      return res.status(404).json({ message: 'Không tìm thấy tài sản cần sửa!' });
    }

    const result = await pool.query(query, values);
    if (newImageUrl) await removeImageFile(old.rows[0].image_url); // dọn ảnh cũ sau khi update thành công
    return res.status(200).json(mapAssetRow(result.rows[0]));
  } catch (error) {
    console.error(error);
    await removeImageFile(newImageUrl);
    return res.status(400).json({ message: 'Lỗi khi cập nhật tài sản' });
  }
});

/**
 * 5. API Xóa tài sản: DELETE /api/v1/assets
 */
app.delete('/api/v1/assets', async (req, res) => {
  const { ids } = req.body || {};
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: 'Danh sách ID không hợp lệ!' });
  }

  try {
    // Chuyển mảng string id thành số để xóa an toàn trong PostgreSQL
    const intIds = ids.map(i => parseInt(i, 10)).filter(Number.isInteger);
    const old = await pool.query('SELECT image_url FROM assets WHERE id = ANY($1::int[])', [intIds]);
    await pool.query('DELETE FROM assets WHERE id = ANY($1::int[])', [intIds]);
    await Promise.all(old.rows.map(r => removeImageFile(r.image_url)));
    return res.status(200).json({ message: 'Xóa thành công các tài sản đã chọn', deletedIds: ids });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi khi xóa tài sản từ cơ sở dữ liệu' });
  }
});

/**
 * 6. API Thống kê Dashboard
 */
/**
 * 6. API Thống kê Dashboard lấy số liệu thực tế từ PostgreSQL
 */
app.get('/api/v1/dashboard/stats', async (req, res) => {
  try {
    const totalResult = await pool.query('SELECT COUNT(*) FROM assets');
    const totalAssets = parseInt(totalResult.rows[0].count, 10);

    const activeResult = await pool.query("SELECT COUNT(*) FROM assets WHERE asset_status = 'In Use'");
    const activeAssets = parseInt(activeResult.rows[0].count, 10);

    const deptResult = await pool.query(`
      SELECT COALESCE(department, 'Chưa phân loại') AS name, COUNT(*) AS count 
      FROM assets 
      GROUP BY department 
      ORDER BY count DESC
    `);
    const departmentDistribution = deptResult.rows.map(row => ({
      name: row.name,
      count: parseInt(row.count, 10)
    }));

    const statusResult = await pool.query(`
      SELECT COALESCE(asset_status, 'In Stock') AS status, COUNT(*) AS count 
      FROM assets 
      GROUP BY asset_status
    `);
    const statusDistribution = statusResult.rows.map(row => ({
      status: row.status,
      count: parseInt(row.count, 10)
    }));

    const typeResult = await pool.query(`
      SELECT COALESCE(category, 'Khác') AS type, COUNT(*) AS count 
      FROM assets 
      GROUP BY category
    `);
    const typeDistribution = typeResult.rows.map(row => ({
      type: row.type,
      count: parseInt(row.count, 10)
    }));

    return res.status(200).json({
      totalAssets,
      activeAssets,
      departmentsCount: departmentDistribution.length,
      deviceTypesCount: typeDistribution.length,
      departmentDistribution,
      statusDistribution,
      typeDistribution
    });
  } catch (error) {
    console.error('Lỗi thống kê dashboard:', error);
    return res.status(500).json({ message: 'Lỗi server khi thống kê dashboard' });
  }
});

// Bắt mọi lỗi chưa được xử lý: ghi log chi tiết ở terminal, trả JSON để Frontend hiển thị được
app.use((err, req, res, next) => {
  console.error('❌ Lỗi chưa xử lý:', err);
  res.status(err.status || 500).json({ message: 'Lỗi hệ thống, vui lòng xem log của backend.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server & PostgreSQL đang chạy tại: http://localhost:${PORT}`);
  console.log(`🖼️  Hỗ trợ upload hình ảnh - thư mục lưu: ${UPLOAD_DIR}`);
});