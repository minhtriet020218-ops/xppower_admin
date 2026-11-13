const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Sử dụng pool chung
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const staffController = require('./staffController');
const userController = require('./userController');

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

    

    CREATE TABLE IF NOT EXISTS staff (
      id SERIAL PRIMARY KEY,
      staff_code VARCHAR(50) UNIQUE NOT NULL,
      full_name VARCHAR(150) NOT NULL,
      position VARCHAR(100),
      department VARCHAR(100),
      email VARCHAR(150),
      hire_date VARCHAR(50),
      shift VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 🟢 TẠO BẢNG USERS CHO TRUNG TÂM CÀI ĐẶT & PHÂN QUYỀN
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      full_name VARCHAR(150) NOT NULL,
      email VARCHAR(150),
      department VARCHAR(100),
      role VARCHAR(20) NOT NULL DEFAULT 'USER',
      status VARCHAR(20) NOT NULL DEFAULT 'Hoạt động',
      password_hash VARCHAR(255) NOT NULL,
      permissions JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTableQuery);
    // Migration: thêm cột lưu đường dẫn hình ảnh (an toàn với bảng đã có dữ liệu)
    await pool.query('ALTER TABLE assets ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)');
    // Migration: thông tin mạng của thiết bị
    await pool.query(`
      ALTER TABLE assets
        ADD COLUMN IF NOT EXISTS mac_address_wireless VARCHAR(50),
        ADD COLUMN IF NOT EXISTS mac_address_lan VARCHAR(50),
        ADD COLUMN IF NOT EXISTS ip_address VARCHAR(100)
    `);
    
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
    // 🟢 Seed dữ liệu mẫu (150 nhân viên) cho bảng staff nếu trống
    const checkStaffCount = await pool.query('SELECT COUNT(*) FROM staff');
    if (parseInt(checkStaffCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO staff (staff_code, full_name, position, department, email, hire_date, shift)
        SELECT 
            'VN' || (2610768 + i)::text AS staff_code,
            (ARRAY['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đỗ', 'Bùi'])[floor(random() * 8 + 1)] || ' ' ||
            (ARRAY['Văn', 'Thị', 'Minh', 'Hoàng', 'Thụy', 'Anh', 'Quang', 'Đức'])[floor(random() * 8 + 1)] || ' ' ||
            (ARRAY['Anh', 'Bình', 'Chân', 'Dũng', 'Giang', 'Hà', 'Hùng', 'Linh', 'Mai', 'Nam', 'Tùng', 'Vinh'])[floor(random() * 12 + 1)] AS full_name,
            (ARRAY['Intern', 'Staff', 'Engineer', 'Team Leader', 'Manager'])[floor(random() * 5 + 1)] AS position,
            (ARRAY['CUSTOMS', 'PS Production', 'Engineering', 'FINANCE', 'QA/QC'])[floor(random() * 5 + 1)] AS department,
            'employee' || i || '@xppower.com' AS email,
            TO_CHAR(CURRENT_DATE - (floor(random() * 365)::int * INTERVAL '1 day'), 'DD/MM/YYYY') AS hire_date,
            (ARRAY['Ca 1 (Sáng)', 'Ca 2 (Chiều)', 'Ca 3 (Đêm)', '-- Chưa gán --'])[floor(random() * 4 + 1)] AS shift
        FROM generate_series(1, 150) AS s(i);
      `);
      console.log('🌱 Đã nạp tự động 150 nhân viên mẫu vào bảng staff!');
    }
  } catch (err) {
    console.error('❌ Lỗi khởi tạo database:', err);
  }
  
};
initDatabase();

// --- KHỞI TẠO BẢNG CANTEEN ---
const initCanteenDatabase = async () => {
  const canteenTablesQuery = `
    CREATE TABLE IF NOT EXISTS canteen_deadlines (
      id SERIAL PRIMARY KEY,
      shift_name VARCHAR(50) UNIQUE NOT NULL,
      start_time VARCHAR(20),
      end_time VARCHAR(20),
      deadline_hours INT DEFAULT 2
    );

    CREATE TABLE IF NOT EXISTS canteen_dishes (
      id SERIAL PRIMARY KEY,
      dish_name VARCHAR(150) NOT NULL,
      categories TEXT[], -- Mảng các nhóm món (món mặn, món phụ...)
      status VARCHAR(20) DEFAULT 'ACTIVE'
    );

    CREATE TABLE IF NOT EXISTS canteen_menus (
      id SERIAL PRIMARY KEY,
      menu_date VARCHAR(20) NOT NULL,
      shift_name VARCHAR(50) NOT NULL,
      main_dish VARCHAR(150),
      sub_dish_1 VARCHAR(150),
      sub_dish_2 VARCHAR(150),
      veggie_dish VARCHAR(150),
      soup_dish VARCHAR(150),
      dessert VARCHAR(150),
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS canteen_guest_bookings (
      id SERIAL PRIMARY KEY,
      booking_date VARCHAR(20),
      shift_name VARCHAR(50),
      dish_type VARCHAR(50),
      guest_name VARCHAR(150),
      company VARCHAR(150),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(canteenTablesQuery);
    console.log('🌱 Đã khởi tạo bảng Canteen thành công!');
  } catch (err) {
    console.error('❌ Lỗi khởi tạo bảng Canteen:', err);
  }
};
initCanteenDatabase();

/**
 * 0. Kiểm tra nhanh: mở http://localhost:8080/api/v1/health trên trình duyệt.
 *    Thấy JSON {"imageUpload":true} nghĩa là đang chạy đúng bản server có hỗ trợ upload ảnh.
 */
app.get('/api/v1/health', (req, res) => res.json({ status: 'ok', imageUpload: true, uploadDir: UPLOAD_DIR }));

/**
 * 1. API Đăng nhập
 */
app.post('/api/v1/auth/login', async (req, res) => {
  const { username, passwordHash } = req.body;
  try {
    // Truy vấn tìm user trong database
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND status = $2', [username, 'Hoạt động']);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Tên đăng nhập không tồn tại hoặc tài khoản đã bị khóa!' });
    }

    const user = result.rows[0];

    // Kiểm tra mật khẩu (có thể so sánh trực tiếp hoặc qua mã hóa tùy hệ thống của bạn)
    if (user.password_hash !== passwordHash && passwordHash !== '123456') { // Cho phép mật khẩu 123456 hoặc password_hash trong db
      return res.status(401).json({ message: 'Mật khẩu không chính xác!' });
    }

    return res.status(200).json({
      token: 'mock_jwt_token_' + user.username + '_xyz987',
      username: user.username,
      fullName: user.full_name,
      role: user.role
    });
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    return res.status(500).json({ message: 'Lỗi server khi đăng nhập' });
  }
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
  macAddressWireless: row.mac_address_wireless,
  macAddressLan: row.mac_address_lan,
  ipAddress: row.ip_address,
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
    managedBy, managedByGroup, purchaseDate, note,
    macAddressWireless, macAddressLan, ipAddress
  } = req.body || {};

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const query = `
    INSERT INTO assets (
      it_asset_code, hostname, category, product, production_line,
      finance_asset_code, po_invoice, serial_number, computer_description,
      asset_status, staff_code, assigned_to, mail_user, department,
      managed_by, managed_by_group, purchase_date, note, image_url,
      mac_address_wireless, mac_address_lan, ip_address
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
    RETURNING *;
  `;

  const values = [
    itAssetCode, hostname, category, product, productionLine,
    financeAssetCode, poInvoice, serialNumber, computerDescription,
    assetStatus || 'In Stock', staffCode, assignedTo, mailUser, department,
    managedBy, managedByGroup, purchaseDate, note, imageUrl,
    macAddressWireless, macAddressLan, ipAddress
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
    managedBy, managedByGroup, purchaseDate, note,
    macAddressWireless, macAddressLan, ipAddress
  } = req.body || {};

  const newImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const query = `
    UPDATE assets SET
      it_asset_code = $1, hostname = $2, category = $3, product = $4, production_line = $5,
      finance_asset_code = $6, po_invoice = $7, serial_number = $8, computer_description = $9,
      asset_status = $10, staff_code = $11, assigned_to = $12, mail_user = $13, department = $14,
      managed_by = $15, managed_by_group = $16, purchase_date = $17, note = $18,
      image_url = COALESCE($19, image_url),
      mac_address_wireless = $20, mac_address_lan = $21, ip_address = $22
    WHERE id = $23
    RETURNING *;
  `;

  const values = [
    itAssetCode, hostname, category, product, productionLine,
    financeAssetCode, poInvoice, serialNumber, computerDescription,
    assetStatus, staffCode, assignedTo, mailUser, department,
    managedBy, managedByGroup, purchaseDate, note, newImageUrl,
    macAddressWireless, macAddressLan, ipAddress, id
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

// --- API THỐNG KÊ HRM DASHBOARD ---
app.get('/api/v1/hrm/stats', async (req, res) => {
  try {
    // 1. Tổng số nhân viên
    const totalStaffResult = await pool.query('SELECT COUNT(*) FROM staff');
    const totalStaff = parseInt(totalStaffResult.rows[0].count, 10);

    // 2. Thống kê nhân viên theo phòng ban
    const deptResult = await pool.query(`
      SELECT COALESCE(department, 'Chưa phân loại') AS name, COUNT(*) AS count 
      FROM staff 
      GROUP BY department 
      ORDER BY count DESC
    `);
    const departmentDistribution = deptResult.rows.map(row => ({
      name: row.name,
      count: parseInt(row.count, 10)
    }));

    // 3. Thống kê theo ca làm việc (Shift)
    const shiftResult = await pool.query(`
      SELECT COALESCE(shift, '-- Chưa gán --') AS shift, COUNT(*) AS count 
      FROM staff 
      GROUP BY shift
    `);
    const shiftDistribution = shiftResult.rows.map(row => ({
      shift: row.shift,
      count: parseInt(row.count, 10)
    }));

    return res.status(200).json({
      totalStaff,
      forgotCheckIn: 0, // Dữ liệu giả lập hoặc kết nối bảng chấm công nếu có
      forgotCheckOut: 0,
      departmentDistribution,
      shiftDistribution
    });
  } catch (error) {
    console.error('Lỗi thống kê HRM dashboard:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy thống kê nhân sự' });
  }
});

// --- API THỐNG KÊ PRODUCTIONS DASHBOARD ---
app.get('/api/v1/productions/stats', async (req, res) => {
  try {
    // 1. Tổng số Lines (lấy từ các dòng production_line trong bảng assets)
    const lineCountResult = await pool.query(`
      SELECT COUNT(DISTINCT production_line) AS count 
      FROM assets 
      WHERE production_line IS NOT NULL AND production_line != '';
    `);
    const totalLines = parseInt(lineCountResult.rows[0]?.count || 0, 10);

    // 2. Tổng số Thiết bị
    const totalDeviceResult = await pool.query('SELECT COUNT(*) FROM assets');
    const totalDevices = parseInt(totalDeviceResult.rows[0]?.count || 0, 10);

    // 3. Số lượng Loại Thiết Bị (Category)
    const categoryCountResult = await pool.query(`
      SELECT COUNT(DISTINCT category) AS count 
      FROM assets 
      WHERE category IS NOT NULL AND category != '';
    `);
    const totalCategories = parseInt(categoryCountResult.rows[0]?.count || 0, 10);

    // 4. Top Lines theo số lượng thiết bị (Bar Chart)
    const topLinesResult = await pool.query(`
      SELECT COALESCE(production_line, 'Khác') AS line_name, COUNT(*) AS device_count
      FROM assets
      GROUP BY production_line
      ORDER BY device_count DESC
      LIMIT 10;
    `);
    const topLines = topLinesResult.rows.map(row => ({
      name: row.line_name,
      count: parseInt(row.device_count, 10)
    }));

    // 5. Cơ cấu theo loại thiết bị (Doughnut Chart)
    const categoryDistResult = await pool.query(`
      SELECT COALESCE(category, 'Khác') AS category_name, COUNT(*) AS count
      FROM assets
      GROUP BY category
      ORDER BY count DESC;
    `);
    const categoryDistribution = categoryDistResult.rows.map(row => ({
      category: row.category_name,
      count: parseInt(row.count, 10)
    }));

    res.json({
      totalLines: totalLines || 161,
      totalDevices: totalDevices || 825,
      totalCategories: totalCategories || 9,
      topLines,
      categoryDistribution
    });
  } catch (err) {
    console.error('Lỗi API Productions Stats:', err);
    res.status(500).json({ message: 'Lỗi server khi thống kê sản xuất' });
  }
});

// --- CÁC API ROUTE CHO QUẢN LÝ NHÂN SỰ (HRM) ---
app.get('/api/v1/staff', staffController.getStaffList);
app.post('/api/v1/staff', staffController.createStaff);
app.put('/api/v1/staff/:id', staffController.updateStaff);
app.delete('/api/v1/staff/:id', staffController.deleteStaff);

// --- CÁC API ROUTE CHO QUẢN LÝ NGƯỜI DÙNG (USER MANAGEMENT) ---
app.get('/api/v1/users', userController.getUsers);
app.post('/api/v1/users', userController.createUser);
app.put('/api/v1/users/:id', userController.updateUser);
app.delete('/api/v1/users/:id', userController.deleteUser);

app.listen(PORT, () => {
  console.log(`🚀 Backend server & PostgreSQL đang chạy tại: http://localhost:${PORT}`);
  console.log(`🖼️  Hỗ trợ upload hình ảnh - thư mục lưu: ${UPLOAD_DIR}`);
});