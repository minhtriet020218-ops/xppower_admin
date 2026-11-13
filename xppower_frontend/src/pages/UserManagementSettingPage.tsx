import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { UserService, type UserDTO, type TabPermission } from '../services/UserService';

interface UserManagementSettingPageProps {
  onLogout?: () => void;
  onTabChange?: (tab: 'dashboard' | 'assets' | 'department' | 'settings') => void;
}

type SettingTabType = 'users' | 'branches' | 'history' | 'general' | 'security';

export const UserManagementSettingPage: React.FC<UserManagementSettingPageProps> = ({ onLogout, onTabChange }) => {
  const [activeTab, setActiveTab] = useState<SettingTabType>('users');

  // State form tạo người dùng mới
  const [employeeCode, setEmployeeCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Default permissions matrix
  const defaultPermissions: TabPermission[] = [
    { tabName: 'Trang chủ', permission: 'View + Edit' },
    { tabName: 'Quản lý tài sản', permission: 'View + Edit' },
    { tabName: 'Trang cá nhân', permission: 'View + Edit' },
    { tabName: 'Cài đặt', permission: 'View only' },
    { tabName: 'HRM', permission: 'View + Edit' },
    { tabName: 'Production', permission: 'View + Edit' },
    { tabName: 'Canteen', permission: 'Không được phép' },
  ];

  const [permissions, setPermissions] = useState<TabPermission[]>(defaultPermissions);

  // State danh sách users từ Database
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // --- 🛠️ STATE QUẢN LÝ MODAL EDIT USER ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [editForm, setEditForm] = useState({
    username: '',
    fullName: '',
    email: '',
    department: '',
    isActive: true,
    isAdmin: false,
  });
  const [editPermissions, setEditPermissions] = useState<TabPermission[]>(defaultPermissions);

  // Tải danh sách user từ Backend PostgreSQL khi vào trang
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await UserService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Lỗi tải danh sách user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionChange = (index: number, newPerm: TabPermission['permission'], isEditing = false) => {
    if (isEditing) {
      const updated = [...editPermissions];
      updated[index].permission = newPerm;
      setEditPermissions(updated);
    } else {
      const updated = [...permissions];
      updated[index].permission = newPerm;
      setPermissions(updated);
    }
  };

  // ➕ TẠO USER MỚI VÀ LƯU VÀO DATABASE
  const handleCreateUser = async () => {
    if (!employeeCode.trim() || !fullName.trim() || !email.trim() || !department.trim()) {
      alert('Vui lòng nhập đầy đủ Mã nhân viên, Họ và tên, Email và Phòng ban!');
      return;
    }

    try {
      const newUserData = {
        username: employeeCode,
        fullName: fullName,
        email: email,
        department: department,
        role: isAdmin ? ('ADMIN' as const) : ('USER' as const),
        status: 'Hoạt động' as const,
        password: password || '123456',
        permissions: permissions,
      };

      const created = await UserService.createUser(newUserData);
      setUsers(prev => [created, ...prev]);
      alert('Đã tạo người dùng thành công vào Database!');
      
      // Reset form
      setEmployeeCode('');
      setFullName('');
      setEmail('');
      setDepartment('');
      setPassword('');
      setIsAdmin(false);
    } catch (err: any) {
      console.error('Lỗi tạo user:', err);
      alert(err.message || 'Không thể tạo user (Có thể trùng Tên đăng nhập).');
    }
  };

  // --- MỞ MODAL EDIT CHO USER ĐƯỢC CHỌN ---
  const handleOpenEditModal = (user: UserDTO) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      fullName: user.fullName,
      email: user.email || '',
      department: user.department || '',
      isActive: user.status === 'Hoạt động',
      isAdmin: user.role === 'ADMIN',
    });
    setEditPermissions(user.permissions ? JSON.parse(JSON.stringify(user.permissions)) : defaultPermissions);
    setIsEditModalOpen(true);
  };

  // --- LƯU THAY ĐỔI SAU KHI EDIT ---
  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      const updatedData = {
        username: editForm.username,
        fullName: editForm.fullName,
        email: editForm.email,
        department: editForm.department,
        role: editForm.isAdmin ? ('ADMIN' as const) : ('USER' as const),
        status: editForm.isActive ? ('Hoạt động' as const) : ('Đã khóa' as const),
        permissions: editPermissions,
      };

      const updated = await UserService.updateUser(editingUser.id, updatedData);
      setUsers(prev => prev.map(u => u.id === editingUser.id ? updated : u));
      setIsEditModalOpen(false);
      alert('Đã cập nhật thông tin người dùng thành công!');
    } catch (err: any) {
      console.error('Lỗi cập nhật user:', err);
      alert(err.message || 'Không thể cập nhật thông tin user.');
    }
  };

  // --- XÓA USER TRONG MODAL ---
  const handleDeleteUser = async () => {
    if (!editingUser) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa user "${editingUser.fullName}" không?`)) {
      try {
        await UserService.deleteUser(editingUser.id);
        setUsers(prev => prev.filter(u => u.id !== editingUser.id));
        setIsEditModalOpen(false);
        alert('Đã xóa người dùng thành công!');
      } catch (err: any) {
        console.error('Lỗi xóa user:', err);
        alert('Không thể xóa người dùng này.');
      }
    }
  };

  // Lọc danh sách user theo từ khóa tìm kiếm
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    u.fullName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    u.email.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="bg-light min-vh-100 font-sans">
      <Header onLogout={onLogout} activeTab="settings" onTabChange={onTabChange} />

      <div className="d-flex" style={{ minHeight: 'calc(100vh - 56px)' }}>
        {/* Sidebar Cài đặt */}
        <aside className="text-white p-3 d-flex flex-column flex-shrink-0" style={{ width: '260px', backgroundColor: '#1E2337' }}>
          <div className="fw-bold fs-6 mb-4 d-flex align-items-center gap-2 px-2">
            <span>⚙️</span> Trung tâm cài đặt
          </div>
          <div className="list-group list-group-flush gap-2">
            <button 
              className="list-group-item list-group-item-action border-0 rounded-3 py-2 px-3 text-white d-flex align-items-center gap-2"
              style={{ 
                background: activeTab === 'users' ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' : 'transparent',
                opacity: activeTab === 'users' ? 1 : 0.7
              }}
              onClick={() => setActiveTab('users')}
            >
              👥 Người dùng & quyền
            </button>
            <button 
              className="list-group-item list-group-item-action border-0 rounded-3 py-2 px-3 text-white d-flex align-items-center gap-2"
              style={{ 
                background: activeTab === 'branches' ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' : 'transparent',
                opacity: activeTab === 'branches' ? 1 : 0.7
              }}
              onClick={() => setActiveTab('branches')}
            >
              🏢 Chi nhánh
            </button>
            <button 
              className="list-group-item list-group-item-action border-0 rounded-3 py-2 px-3 text-white d-flex align-items-center gap-2"
              style={{ 
                background: activeTab === 'history' ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' : 'transparent',
                opacity: activeTab === 'history' ? 1 : 0.7
              }}
              onClick={() => setActiveTab('history')}
            >
              📜 Lịch sử hệ thống
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow-1 p-4 overflow-auto">
          {activeTab === 'users' && (
            <>
              <div className="card border-0 shadow-sm p-4 mb-4 rounded-4 bg-white">
                <h4 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2">
                  👥 Quản lý người dùng
                </h4>

                <div className="mb-4">
                  <h6 className="fw-bold text-secondary mb-3">Tạo người dùng mới</h6>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="form-label small text-muted fw-bold">Mã nhân viên</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="VD: VN2612246"
                        value={employeeCode} 
                        onChange={(e) => setEmployeeCode(e.target.value)} 
                      />
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
                      <label className="form-label small text-muted fw-bold">Phòng ban (*)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        list="departmentOptions"
                        placeholder="Chọn hoặc tự gõ phòng ban" 
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      />
                      <datalist id="departmentOptions">
                        <option value="PS Production" />
                        <option value="Engineering" />
                        <option value="FINANCE" />
                        <option value="CUSTOMS" />
                        <option value="QA/QC" />
                        <option value="Canteen" />
                        <option value="HRM" />
                      </datalist>
                    </div>
                  </div>

                  <div className="row g-3 mt-1">
                    <div className="col-md-3">
                      <label className="form-label small text-muted fw-bold">Mật khẩu</label>
                      <input 
                        type="password" 
                        className="form-control"
                        placeholder="Tối thiểu 6 ký tự" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

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
                  </div>
                </div>

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
                </div>

                <div className="d-flex gap-3">
                  <button className="btn btn-primary px-4 fw-bold shadow-sm" onClick={handleCreateUser}>
                    Tạo người dùng
                  </button>
                  <button className="btn btn-danger px-4 fw-bold shadow-sm" onClick={() => fetchUsers()}>
                    🔄 Làm mới danh sách
                  </button>
                </div>
              </div>

              {/* BẢNG HIỂN THỊ DANH SÁCH USER TỪ DATABASE */}
              <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
                <h5 className="fw-bold mb-3 text-dark">Danh sách người dùng ({filteredUsers.length})</h5>

                <div className="row g-3 align-items-center mb-4">
                  <div className="col-md-5">
                    <div className="input-group">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Tìm theo username / tên / email" 
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                      />
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

                <div className="table-responsive rounded-3 border">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="py-3 px-3">Username</th>
                        <th className="py-3 px-3">Tên đầy đủ</th>
                        <th className="py-3 px-3">Email</th>
                        <th className="py-3 px-3">Phòng ban</th>
                        <th className="py-3 px-3">Quyền</th>
                        <th className="py-3 px-3">Trạng thái</th>
                        <th className="py-3 px-3 text-end">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-4">
                            <div className="spinner-border spinner-border-sm text-primary" role="status"></div> Đang tải dữ liệu từ Database...
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-4 text-muted">Không tìm thấy người dùng nào trong cơ sở dữ liệu.</td>
                        </tr>
                      ) : (
                        filteredUsers.slice(0, rowsPerPage).map((u) => (
                          <tr key={u.id}>
                            <td className="py-3 px-3 fw-semibold text-primary">{u.username}</td>
                            <td className="py-3 px-3 fw-bold">{u.fullName}</td>
                            <td className="py-3 px-3 text-muted">{u.email || '-'}</td>
                            <td className="py-3 px-3">{u.department || '-'}</td>
                            <td className="py-3 px-3">
                              <span className={`badge ${u.role === 'ADMIN' ? 'bg-danger' : 'bg-secondary'} px-2 py-1`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-success fw-semibold">{u.status}</td>
                            <td className="py-3 px-3 text-end">
                              <button 
                                className="btn btn-sm btn-primary px-3 fw-bold shadow-sm d-inline-flex align-items-center gap-1"
                                onClick={() => handleOpenEditModal(u)}
                              >
                                ✏️ Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'branches' && (
            <div className="card border-0 shadow-sm p-5 rounded-4 bg-white text-center">
              <h3 className="fw-bold text-dark mb-3">🏢 Quản lý Chi nhánh</h3>
              <p className="text-muted">Giao diện quản lý cấu hình các chi nhánh XP Power.</p>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="card border-0 shadow-sm p-5 rounded-4 bg-white text-center">
              <h3 className="fw-bold text-dark mb-3">📜 Lịch sử hoạt động hệ thống</h3>
              <p className="text-muted">Nhật ký (Audit Log) toàn bộ thao tác hệ thống.</p>
            </div>
          )}
        </main>
      </div>

      {/* --- 📝 MODAL CHỈNH SỬA USER (POPUP EDIT) --- */}
      {isEditModalOpen && (
        <div className="modal show d-block fade" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header text-white rounded-top-4" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2 m-0">
                  ✏️ Chỉnh sửa User: {editForm.fullName}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsEditModalOpen(false)}></button>
              </div>

              <div className="modal-body p-4 bg-light">
                <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-3">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Tên đăng nhập</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={editForm.username} 
                        onChange={(e) => setEditForm({...editForm, username: e.target.value})} 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Họ và tên</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={editForm.fullName} 
                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})} 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Email</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        value={editForm.email} 
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Phòng ban</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={editForm.department} 
                        onChange={(e) => setEditForm({...editForm, department: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="mt-3 d-flex flex-column gap-2">
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="activeCheck" 
                        checked={editForm.isActive} 
                        onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})} 
                      />
                      <label className="form-check-label fw-semibold" htmlFor="activeCheck">Tài khoản hoạt động</label>
                    </div>
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="adminRoleCheck" 
                        checked={editForm.isAdmin} 
                        onChange={(e) => setEditForm({...editForm, isAdmin: e.target.checked})} 
                      />
                      <label className="form-check-label fw-semibold text-danger" htmlFor="adminRoleCheck">Quyền Admin</label>
                    </div>
                  </div>
                </div>

                <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mb-3">
                  <h6 className="fw-bold text-secondary mb-3">Ma trận phân quyền chi tiết theo tab</h6>
                  <div className="table-responsive rounded-3 border">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="py-2 px-3">Tab/Chức năng</th>
                          <th className="py-2 px-3 text-end">Quyền hạn</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editPermissions.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3">{item.tabName}</td>
                            <td className="py-2 px-3 text-end">
                              <select 
                                className="form-select form-select-sm d-inline-block w-auto fw-bold text-center"
                                value={item.permission}
                                disabled={editForm.isAdmin}
                                onChange={(e) => handlePermissionChange(idx, e.target.value as TabPermission['permission'], true)}
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
                </div>
              </div>

              <div className="modal-footer bg-white border-top px-4 py-3 d-flex justify-content-between align-items-center">
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-primary fw-bold px-3 shadow-sm" onClick={handleSaveEdit}>
                    💾 Lưu thay đổi
                  </button>
                  <button type="button" className="btn btn-dark fw-bold px-3 shadow-sm" style={{ backgroundColor: '#ff4757', border: 'none' }} onClick={handleDeleteUser}>
                    🗑️ Xóa User
                  </button>
                </div>
                <button type="button" className="btn btn-secondary fw-bold px-4" onClick={() => setIsEditModalOpen(false)}>
                  ❌ Hủy
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};