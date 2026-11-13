// xppower_backend/personalDb.js
// Tạo các bảng cho Trang cá nhân + chấm công vân tay (chạy lại nhiều lần vẫn an toàn).
const pool = require('./db');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// server.js gọi initDatabase() mà không await, nên chờ bảng users có rồi mới tạo bảng có khóa ngoại.
async function waitForUsersTable() {
  for (let i = 0; i < 20; i++) {
    const r = await pool.query("SELECT to_regclass('public.users') AS t");
    if (r.rows[0].t) return;
    await sleep(500);
  }
  throw new Error('Bảng users chưa tồn tại');
}

async function initPersonalTables() {
  try {
    await waitForUsersTable();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS passkey_credentials (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
        credential_id TEXT UNIQUE NOT NULL,
        public_key TEXT NOT NULL,
        counter BIGINT NOT NULL DEFAULT 0,
        transports TEXT[],
        device_label VARCHAR(100),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        last_used_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_passkey_username ON passkey_credentials(username);

      CREATE TABLE IF NOT EXISTS attendance_logs (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
        punched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        method VARCHAR(20) NOT NULL DEFAULT 'passkey',
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        accuracy_m DOUBLE PRECISION,
        ip VARCHAR(64),
        user_agent TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_att_user_time ON attendance_logs(username, punched_at);

      CREATE TABLE IF NOT EXISTS leave_requests (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
        manager_email VARCHAR(150) NOT NULL,
        leader_email VARCHAR(150),
        supervisor_email VARCHAR(150),
        leave_type VARCHAR(30) NOT NULL,
        duration VARCHAR(30) NOT NULL,
        from_date DATE NOT NULL,
        to_date DATE NOT NULL,
        reason VARCHAR(300),
        status VARCHAR(20) NOT NULL DEFAULT 'Chờ duyệt',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_leave_user ON leave_requests(username, created_at DESC);

      CREATE TABLE IF NOT EXISTS shift_change_requests (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
        current_shift VARCHAR(50) NOT NULL,
        desired_shift VARCHAR(50) NOT NULL,
        reason VARCHAR(200) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Chờ duyệt',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_shift_user ON shift_change_requests(username, created_at DESC);

      CREATE TABLE IF NOT EXISTS meal_orders (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
        meal_date DATE NOT NULL,
        shift VARCHAR(50) NOT NULL,
        dish VARCHAR(50) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (username, meal_date)
      );
    `);
    console.log('🌱 Đã khởi tạo bảng Trang cá nhân & chấm công vân tay!');
  } catch (err) {
    console.error('❌ Lỗi khởi tạo bảng Trang cá nhân:', err);
  }
}

module.exports = { initPersonalTables };