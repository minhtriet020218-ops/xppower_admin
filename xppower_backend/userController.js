// xppower_backend/userController.js
const pool = require('./db');

// 1. Lấy danh sách toàn bộ user
exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    const users = result.rows.map(row => ({
      id: String(row.id),
      username: row.username,
      fullName: row.full_name,
      email: row.email,
      department: row.department,
      role: row.role,
      status: row.status,
      permissions: row.permissions || []
    }));
    res.json(users);
  } catch (err) {
    console.error('Lỗi lấy danh sách user:', err);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// 2. Thêm mới user
exports.createUser = async (req, res) => {
  const { username, fullName, email, department, role, status, password, permissions } = req.body;
  try {
    const query = `
      INSERT INTO users (username, full_name, email, department, role, status, password_hash, permissions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      username, 
      fullName, 
      email, 
      department, 
      role || 'USER', 
      status || 'Hoạt động', 
      password || '123456', 
      JSON.stringify(permissions || [])
    ];
    
    const result = await pool.query(query, values);
    const row = result.rows[0];

    res.status(201).json({
      id: String(row.id),
      username: row.username,
      fullName: row.full_name,
      email: row.email,
      department: row.department,
      role: row.role,
      status: row.status,
      permissions: row.permissions
    });
  } catch (err) {
    console.error('Lỗi tạo user:', err);
    res.status(500).json({ message: 'Không thể tạo user (Có thể trùng Tên đăng nhập / Mã nhân viên)' });
  }
};

// 3. Cập nhật user
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, fullName, email, department, role, status, permissions } = req.body;
  try {
    const query = `
      UPDATE users 
      SET username = $1, full_name = $2, email = $3, department = $4, role = $5, status = $6, permissions = $7
      WHERE id = $8 RETURNING *;
    `;
    const values = [username, fullName, email, department, role, status, JSON.stringify(permissions), id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const row = result.rows[0];
    res.json({
      id: String(row.id),
      username: row.username,
      fullName: row.full_name,
      email: row.email,
      department: row.department,
      role: row.role,
      status: row.status,
      permissions: row.permissions
    });
  } catch (err) {
    console.error('Lỗi cập nhật user:', err);
    res.status(500).json({ message: 'Lỗi cập nhật dữ liệu' });
  }
};

// 4. Xóa user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Đã xóa người dùng thành công' });
  } catch (err) {
    console.error('Lỗi xóa user:', err);
    res.status(500).json({ message: 'Lỗi khi xóa người dùng' });
  }
};