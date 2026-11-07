const { Pool } = require('pg');

// Kết nối PostgreSQL (sử dụng thông tin cấu hình database xppower_bd của bạn)
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'xppower_bd',
  password: '062462862', // Thay bằng mật khẩu database của bạn
  port: 5432,
});

// 1. Lấy danh sách nhân viên
exports.getStaffList = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM staff ORDER BY id DESC');
    // Map lại tên cột database sang chuẩn camelCase cho Frontend dễ đọc
    const staffList = result.rows.map(row => ({
      id: String(row.id),
      staffCode: row.staff_code,
      fullName: row.full_name,
      position: row.position,
      department: row.department,
      email: row.email,
      hireDate: row.hire_date,
      shift: row.shift
    }));
    res.json(staffList);
  } catch (err) {
    console.error('Lỗi lấy danh sách nhân viên:', err);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// 2. Thêm mới nhân viên
exports.createStaff = async (req, res) => {
  const { staffCode, fullName, position, department, email, hireDate, shift } = req.body;
  try {
    const query = `
      INSERT INTO staff (staff_code, full_name, position, department, email, hire_date, shift)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [staffCode, fullName, position, department, email, hireDate, shift || '-- Chưa gán --'];
    const result = await pool.query(query, values);
    const newRow = result.rows[0];

    res.status(201).json({
      id: String(newRow.id),
      staffCode: newRow.staff_code,
      fullName: newRow.full_name,
      position: newRow.position,
      department: newRow.department,
      email: newRow.email,
      hireDate: newRow.hire_date,
      shift: newRow.shift
    });
  } catch (err) {
    console.error('Lỗi thêm nhân viên:', err);
    res.status(500).json({ message: 'Không thể thêm nhân viên (Có thể trùng mã NV)' });
  }
};

// 3. Cập nhật thông tin / gán ca nhân viên
exports.updateStaff = async (req, res) => {
  const { id } = req.params;
  const { staffCode, fullName, position, department, email, hireDate, shift } = req.body;
  try {
    const query = `
      UPDATE staff 
      SET staff_code = $1, full_name = $2, position = $3, department = $4, email = $5, hire_date = $6, shift = $7
      WHERE id = $8 RETURNING *;
    `;
    const values = [staffCode, fullName, position, department, email, hireDate, shift, id];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    const updated = result.rows[0];
    res.json({
      id: String(updated.id),
      staffCode: updated.staff_code,
      fullName: updated.full_name,
      position: updated.position,
      department: updated.department,
      email: updated.email,
      hireDate: updated.hire_date,
      shift: updated.shift
    });
  } catch (err) {
    console.error('Lỗi cập nhật nhân viên:', err);
    res.status(500).json({ message: 'Lỗi cập nhật dữ liệu' });
  }
};

// 4. Xóa nhân viên
exports.deleteStaff = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM staff WHERE id = $1', [id]);
    res.json({ message: 'Đã xóa nhân viên thành công' });
  } catch (err) {
    console.error('Lỗi xóa nhân viên:', err);
    res.status(500).json({ message: 'Lỗi khi xóa nhân viên' });
  }
};