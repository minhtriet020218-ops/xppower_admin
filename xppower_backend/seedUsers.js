// xppower_backend/seedUsers.js
const pool = require('./db');

const departments = ['PS Production', 'Engineering', 'FINANCE', 'CUSTOMS', 'QA/QC', 'Canteen', 'HRM'];
const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Đặng', 'Bùi'];
const middleNames = ['Văn', 'Thị', 'Hữu', 'Đình', 'Công', 'Ngọc', 'Minh', 'Thanh', 'Xuân', 'Hoài'];
const lastNames = ['An', 'Bình', 'Cường', 'Dũng', 'Hà', 'Hùng', 'Khang', 'Long', 'Nam', 'Phúc', 'Quân', 'Sơn', 'Tùng', 'Vinh', 'Yến', 'Ngân'];

const defaultPermissions = [
  { tabName: 'Trang chủ', permission: 'View + Edit' },
  { tabName: 'Quản lý tài sản', permission: 'View + Edit' },
  { tabName: 'Trang cá nhân', permission: 'View + Edit' },
  { tabName: 'Cài đặt', permission: 'View only' },
  { tabName: 'HRM', permission: 'View + Edit' },
  { tabName: 'Production', permission: 'View + Edit' },
  { tabName: 'Canteen', permission: 'Không được phép' }
];

async function seedUsers() {
  try {
    console.log('🔄 Đang tạo 50 user mẫu vào PostgreSQL...');

    // Tạo tài khoản Admin mặc định đầu tiên
    await pool.query(`
      INSERT INTO users (username, full_name, email, department, role, status, password_hash, permissions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (username) DO NOTHING;
    `, [
      'admin', 
      'Quản Trị Viên Hệ Thống', 
      'admin@xppower.com', 
      'IT Department', 
      'ADMIN', 
      'Hoạt động', 
      '123456', 
      JSON.stringify(defaultPermissions)
    ]);

    // Tạo ngẫu nhiên 49 user tiếp theo
    for (let i = 1; i <= 49; i++) {
      const staffCode = 'VN' + String(2612000 + i);
      const fullName = `${firstNames[i % firstNames.length]} ${middleNames[i % middleNames.length]} ${lastNames[i % lastNames.length]}`;
      const email = `${staffCode.toLowerCase()}@xppower.com`;
      const department = departments[i % departments.length];
      const role = i <= 5 ? 'ADMIN' : 'USER'; // 5 user đầu là Admin, còn lại là User
      const status = i === 13 ? 'Đã khóa' : 'Hoạt động'; // Giả lập 1 user bị khóa

      await pool.query(`
        INSERT INTO users (username, full_name, email, department, role, status, password_hash, permissions)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (username) DO NOTHING;
      `, [
        staffCode,
        fullName,
        email,
        department,
        role,
        status,
        '123456',
        JSON.stringify(defaultPermissions)
      ]);
    }

    console.log('✅ Đã tạo thành công 50 user mẫu vào database!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi seed user:', err);
    process.exit(1);
  }
}

seedUsers();