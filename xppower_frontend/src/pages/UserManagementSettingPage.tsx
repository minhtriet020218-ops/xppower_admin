import React, { useState } from 'react';

interface TabPermission {
  tabName: string;
  permission: 'View + Edit' | 'View only' | 'Không được phép';
}

interface User {
  id: string;
  username: string;
  fullName: string;
  department: string;
  role: 'ADMIN' | 'USER';
  status: 'Hoạt động' | 'Đã khóa';
}

export const UserManagementSettingPage: React.FC = () => {
  // State form tạo/sửa người dùng
  const [employeeCode, setEmployeeCode] = useState('VN2612246');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('••••••••••••••••');
  const [isAdmin, setIsAdmin] = useState(false);

  // State ma trận phân quyền theo tab
  const [permissions, setPermissions] = useState<TabPermission[]>([
    { tabName: 'Trang chủ', permission: 'View + Edit' },
    { tabName: 'Quản lý tài sản', permission: 'View + Edit' },
    { tabName: 'Trang cá nhân', permission: 'View + Edit' },
    { tabName: 'Cài đặt', permission: 'View only' },
    { tabName: 'HRM', permission: 'View + Edit' },
    { tabName: 'Production', permission: 'View + Edit' },
    { tabName: 'Canteen', permission: 'Không được phép' },
  ]);

  // State tìm kiếm và danh sách users
  const [searchKeyword, setSearchKeyword] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: '23/02/2006',
      fullName: 'TRẦN THỊ KIM NGÂN',
      department: 'PS Production O...',
      role: 'USER',
      status: 'Hoạt động',
    },
  ]);

  const handlePermissionChange = (index: number, newPerm: TabPermission['permission']) => {
    const updated = [...permissions];
    updated[index].permission = newPerm;
    setPermissions(updated);
  };

  const handleCreateUser = () => {
    // Logic tạo user mới đẩy vào mảng users
    const newUser: User = {
      id: Date.now().toString(),
      username: employeeCode,
      fullName: fullName || 'Chưa cập nhật',
      department: department || 'Chưa phân bổ',
      role: isAdmin ? 'ADMIN' : 'USER',
      status: 'Hoạt động',
    };
    setUsers([...users, newUser]);
    alert('Đã tạo người dùng thành công!');
  };

  return (
    <div className="d-flex min-vh-100 bg-light font-sans">
      {/* Sidebar Cài đặt */}
      <aside className="text-white p-3 d-flex flex-column" style={{ width: '260px', backgroundColor: '#1E2337' }}>
        <div className="fw-bold fs-6 mb-4 d-flex align-items-center gap-2 px-2">
          <span>⚙️</span> Trung tâm cài đặt
        </div>
        <div className="list-group list-group-flush gap-2">
          <button className="list-group-item list-group-item-action border-0 rounded-3 py-2 px-3 text-white d-flex align-items-center gap-2 shadow-sm" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
            👥 Người dùng & quyền
          </button>
          <button className="list-group-item list-group-item-action border-0 rounded-3 py-2 px-3 text-white bg-transparent">
            🏢 Chi nhánh
          </button>
          <button className="list-group-item list-group-item-action border-0 rounded-3 py-2 px-3 text-white bg-transparent">
            📜 Lịch sử hệ thống
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1 p-4 overflow-auto">
        <div className="card border-0 shadow-sm p-4 mb-4 rounded-4 bg-white">
          <h4 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2">
            👥 Quản lý người dùng
          </h4>

          {/* Form Tạo người dùng mới */}
          <div className="mb-4">
            <h6 className="fw-bold text-secondary mb-3">Tạo người dùng mới</h6>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label small text-muted fw-bold">Mã nhân viên</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={employeeCode} 
                  onChange={(e) => setEmployeeCode(e.target.value)} 
                />
                <div className="form-text text-muted" style={{ fontSize: '11px' }}>
                  Sẽ dùng làm username đăng nhập. Nếu mã có sẵn trong quản lý tài sản sẽ tự động điền thông tin.
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label small text-muted fw-bold">Họ và tên</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="VD: Nguyễn Văn A" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small text-muted fw-bold">Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="VD: nva@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small text-muted fw-bold">Phòng ban</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Chọn hoặc tạo mới phòng ban" 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-md-3">
                <label className="form-label small text-muted fw-bold">Mật khẩu</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="form-text text-muted" style={{ fontSize: '11px' }}>Có thể đổi sau khi đăng nhập</div>
              </div>
            </div>
          </div>

          {/* Phân quyền theo tab */}
          <div className="mb-4">
            <h6 className="fw-bold text-secondary mb-3">Phân quyền theo tab</h6>
            <div className="card border p-3 rounded-3 bg-light">
              <span className="fw-bold small text-muted mb-3 d-block">Ma trận phân quyền chi tiết</span>
              
              <div className="table-responsive bg-white rounded-3 border">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="py-2 px-3">Tab/Chức năng</th>
                      <th className="py-2 px-3 text-end">Quyền hạn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3">{item.tabName}</td>
                        <td className="py-2 px-3 text-end">
                          <select 
                            className={`form-select form-select-sm d-inline-block w-auto fw-bold text-center ${
                              item.permission === 'View + Edit' ? 'bg-success-subtle text-success border-success' :
                              item.permission === 'View only' ? 'bg-warning-subtle text-warning border-warning' :
                              'bg-danger-subtle text-danger border-danger'
                            }`}
                            value={item.permission}
                            disabled={isAdmin}
                            onChange={(e) => handlePermissionChange(idx, e.target.value as TabPermission['permission'])}
                          >
                            <option value="View + Edit">View + Edit</option>
                            <option value="View only">View only</option>
                            <option value="Không được phép">Không được phép</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Chú thích quyền hạn */}
              <div className="d-flex align-items-center gap-4 mt-3 small text-muted">
                <span className="fw-bold">Chú thích quyền hạn:</span>
                <span className="badge bg-success-subtle text-success border border-success px-2 py-1">View + Edit</span> Xem và chỉnh sửa
                <span className="badge bg-warning-subtle text-warning border border-warning px-2 py-1">View only</span> Chỉ xem
                <span className="badge bg-danger-subtle text-danger border border-danger px-2 py-1">Không được phép</span> Không có quyền truy cập
              </div>
            </div>
          </div>

          {/* Admin Checkbox */}
          <div className="form-check mb-4">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="adminCheck" 
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            <label className="form-check-label fw-bold text-danger" htmlFor="adminCheck">
              Admin (Toàn quyền hệ thống)
            </label>
            <div className="form-text text-muted" style={{ fontSize: '11px' }}>
              Khi chọn Admin sẽ bỏ qua tất cả dropdown ở trên
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-3">
            <button className="btn btn-primary px-4 fw-bold shadow-sm" onClick={handleCreateUser}>
              Tạo người dùng
            </button>
            <button className="btn btn-primary px-4 fw-bold shadow-sm" style={{ backgroundColor: '#2563eb' }}>
              Tạo user từ nhân viên HRM
            </button>
            <button className="btn btn-danger px-4 fw-bold shadow-sm">
              Xóa tất cả users
            </button>
          </div>
        </div>

        {/* Danh sách người dùng (Phần dưới trang chung) */}
        <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
          <h5 className="fw-bold mb-3 text-dark">Danh sách người dùng</h5>

          {/* Thanh tìm kiếm & phân trang */}
          <div className="row g-3 align-items-center mb-4">
            <div className="col-md-5">
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Tìm theo mã nhân viên / email" 
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                <button className="btn btn-primary px-3" type="button">
                  🔍 Tìm
                </button>
              </div>
            </div>
            <div className="col-md-7 d-flex justify-content-end align-items-center gap-2">
              <span className="small text-muted">Hiển thị</span>
              <select 
                className="form-select form-select-sm w-auto" 
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="small text-muted">dòng/trang</span>
            </div>
          </div>

          {/* Bảng danh sách */}
          <div className="table-responsive rounded-3 border">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-3">Username</th>
                  <th className="py-3 px-3">Tên đầy đủ</th>
                  <th className="py-3 px-3">Phòng ban</th>
                  <th className="py-3 px-3">Quyền</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-3 text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 px-3 fw-semibold">{u.username}</td>
                    <td className="py-3 px-3">{u.fullName}</td>
                    <td className="py-3 px-3 text-muted">{u.department}</td>
                    <td className="py-3 px-3">
                      <span className="badge bg-secondary px-2 py-1">{u.role}</span>
                    </td>
                    <td className="py-3 px-3 text-success fw-semibold">{u.status}</td>
                    <td className="py-3 px-3 text-end">
                      <button className="btn btn-sm btn-primary px-3 fw-bold d-inline-flex align-items-center gap-1 shadow-sm">
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};