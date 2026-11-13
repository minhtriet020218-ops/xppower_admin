const pool = require('./db');

async function seedUsers() {
  try {
    console.log('🔄 Đang tạo dữ liệu mẫu user dạng VNxxxxxxx...');

    // Tạo tài khoản Admin đặc biệt
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
      JSON.stringify([])
    ]);

    // Tạo ngẫu nhiên các user với định dạng username là VN + 7 chữ số (VD: VN0348934)
    for (let i = 1; i <= 20; i++) {
      // Tạo chuỗi số ngẫu nhiên 7 chữ số giống ý bạn (VD: VN0348934)
      const randomNum = Math.floor(1000000 + Math.random() * 9000000);
      const username = `VN${randomNum}`; 
      const fullName = `Nhân Viên Test ${i}`;
      const email = `${username.toLowerCase()}@xppower.com`;
      const role = i <= 3 ? 'ADMIN' : 'USER'; // 3 user đầu tiên sẽ có quyền ADMIN để bạn test đăng nhập

      await pool.query(`
        INSERT INTO users (username, full_name, email, department, role, status, password_hash, permissions)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (username) DO NOTHING;
      `, [
        username,
        fullName,
        email,
        'PS Production',
        role,
        'Hoạt động',
        '123456', // Mật khẩu mặc định là 123456
        JSON.stringify([])
      ]);
    }

    console.log('✅ Đã tạo xong các user mẫu (bao gồm cả Admin mang định dạng VNxxxxxxx)!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi seed user:', err);
    process.exit(1);
  }
}

seedUsers();