import React, { useState, useEffect, useMemo } from 'react';
import { DepartmentService, type StaffDTO } from '../../../services/DepartmentService';

interface HrmStaffPageProps {
  onNavigate: (tab: 'dashboard' | 'staff') => void;
}

const PAGE_SIZE = 50; // Hiển thị 50 nhân viên mỗi trang

export const HrmStaffPage: React.FC<HrmStaffPageProps> = ({ onNavigate }) => {
  const [employees, setEmployees] = useState<StaffDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('Tất cả phòng ban');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // State quản lý Modal Thêm / Sửa nhân viên
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    staffCode: '',
    fullName: '',
    position: 'Staff',
    department: 'PS Production',
    email: '',
    hireDate: new Date().toISOString().slice(0, 10),
    shift: '-- Chưa gán --',
  });

  // 1. Tải danh sách từ PostgreSQL
  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    setIsLoading(true);
    try {
      const data = await DepartmentService.getStaffList();
      setEmployees(data);
    } catch (error) {
      console.error('Lỗi tải danh sách nhân sự:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Lọc & Phân trang 50 dòng/trang
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchKeyword = 
        emp.staffCode.toLowerCase().includes(keyword.toLowerCase()) ||
        emp.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
        emp.position.toLowerCase().includes(keyword.toLowerCase()) ||
        emp.email.toLowerCase().includes(keyword.toLowerCase());
      
      const matchDept = selectedDept === 'Tất cả phòng ban' || emp.department === selectedDept;
      return matchKeyword && matchDept;
    });
  }, [employees, keyword, selectedDept]);

  const totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEmployees.slice(start, start + PAGE_SIZE);
  }, [filteredEmployees, currentPage]);

  // Xử lý Checkbox chọn hàng
  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginatedEmployees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedEmployees.map(e => e.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // --- 🛠️ 3. FUNCTION: MỞ MODAL THÊM MỚI ---
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormData({
      staffCode: 'VN' + Math.floor(1000000 + Math.random() * 9000000),
      fullName: '',
      position: 'Staff',
      department: 'PS Production',
      email: '',
      hireDate: new Date().toISOString().slice(0, 10),
      shift: '-- Chưa gán --',
    });
    setIsModalOpen(true);
  };

  // --- 🛠️ 4. FUNCTION: MỞ MODAL SỬA ---
  const handleOpenEditModal = (emp: StaffDTO) => {
    setModalMode('edit');
    setEditingId(emp.id);
    setFormData({
      staffCode: emp.staffCode,
      fullName: emp.fullName,
      position: emp.position,
      department: emp.department,
      email: emp.email,
      hireDate: emp.hireDate || new Date().toISOString().slice(0, 10),
      shift: emp.shift || '-- Chưa gán --',
    });
    setIsModalOpen(true);
  };

  // --- 🛠️ 5. FUNCTION: LƯU (THÊM HOẶC CẬP NHẬT) ---
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.staffCode.trim()) {
      alert('Vui lòng nhập đầy đủ Mã NV và Họ tên!');
      return;
    }

    setIsSaving(true);
    try {
      if (modalMode === 'create') {
        const created = await DepartmentService.createStaff(formData);
        setEmployees(prev => [created, ...prev]);
        alert('Thêm nhân viên thành công!');
      } else if (modalMode === 'edit' && editingId) {
        const updated = await DepartmentService.updateStaff(editingId, formData);
        setEmployees(prev => prev.map(item => item.id === editingId ? updated : item));
        alert('Cập nhật nhân viên thành công!');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Lỗi khi lưu nhân viên:', error);
      alert(error.message || 'Có lỗi xảy ra khi kết nối Backend PostgreSQL!');
    } finally {
      setIsSaving(false);
    }
  };

  // --- 🛠️ 6. FUNCTION: XÓA ĐƠN ĐẺ (NÚT XÓA TẠI CỘT THAO TÁC) ---
  const handleDeleteSingle = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên "${name}" không?`)) {
      try {
        await DepartmentService.deleteStaff(id);
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        setSelectedIds(prev => prev.filter(itemId => itemId !== id));
        alert('Đã xóa nhân viên thành công!');
      } catch (error) {
        console.error('Lỗi khi xóa nhân viên:', error);
        alert('Không thể xóa nhân viên này!');
      }
    }
  };

  // --- 🛠️ 7. FUNCTION: XÓA NHÂN VIÊN ĐÃ NGHỈ (XÓA HÀNG LOẠT CÁC MỤC ĐÃ TÍCH CHỌN) ---
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      alert('Vui lòng tích chọn ít nhất một nhân viên đã nghỉ trong danh sách để xóa!');
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa hàng loạt ${selectedIds.length} nhân viên đã chọn không?`)) {
      try {
        // Thực hiện xóa từng nhân viên đã tích chọn
        await Promise.all(selectedIds.map(id => DepartmentService.deleteStaff(id)));
        setEmployees(prev => prev.filter(emp => !selectedIds.includes(emp.id)));
        setSelectedIds([]);
        alert(`Đã xóa thành công ${selectedIds.length} nhân viên khỏi hệ thống!`);
      } catch (error) {
        console.error('Lỗi xóa hàng loạt:', error);
        alert('Đã có lỗi xảy ra trong quá trình xóa dữ liệu!');
      }
    }
  };

  // --- 🛠️ 8. FUNCTION: ĐỔI CA TRỰC TIẾP TRÊN BẢNG ---
  const handleChangeShift = async (emp: StaffDTO, newShift: string) => {
    try {
      const updated = await DepartmentService.updateStaff(emp.id, { ...emp, shift: newShift });
      setEmployees(prev => prev.map(item => item.id === emp.id ? updated : item));
    } catch (error) {
      console.error('Lỗi cập nhật ca:', error);
      alert('Không thể thay đổi ca cho nhân viên này!');
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-light font-sans position-relative">
      {/* 1. SIDEBAR */}
      <aside className="bg-dark text-white p-3 d-flex flex-column" style={{ width: '260px', minHeight: '100vh' }}>
        <div className="list-group list-group-flush gap-2">
          <button 
            className="list-group-item list-group-item-action bg-transparent text-white-50 border-0 rounded-2 py-2 d-flex align-items-center gap-3"
            onClick={() => onNavigate('dashboard')}
          >
            <span>📊</span> Dashboard
          </button>
          <button 
            className="list-group-item list-group-item-action active bg-gradient border-0 rounded-2 py-3 d-flex align-items-center gap-3 fw-bold text-white shadow-sm" 
            style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}
            onClick={() => onNavigate('staff')}
          >
            <span>👥</span> Quản Lý Nhân Sự
          </button>
          <button className="list-group-item list-group-item-action bg-transparent text-white-50 border-0 rounded-2 py-2 d-flex align-items-center gap-3">
            <span>⏰</span> Chấm Công
          </button>
          <button className="list-group-item list-group-item-action bg-transparent text-white-50 border-0 rounded-2 py-2 d-flex align-items-center gap-3">
            <span>⭐</span> Đánh Giá
          </button>
          <button className="list-group-item list-group-item-action bg-transparent text-white-50 border-0 rounded-2 py-2 d-flex align-items-center gap-3">
            <span>📅</span> Nghỉ Phép
          </button>
          <button className="list-group-item list-group-item-action bg-transparent text-white-50 border-0 rounded-2 py-2 d-flex align-items-center gap-3">
            <span>📋</span> Báo Cáo
          </button>
        </div>
        <div className="mt-auto pt-3 border-top border-secondary">
          <button className="list-group-item list-group-item-action bg-transparent text-white-50 border-0 rounded-2 py-2 d-flex align-items-center gap-3">
            <span>⚙️</span> Cài Đặt
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-grow-1 p-4">
        {/* HEADER TOOLBAR */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fs-3 fw-bold text-dark m-0">Quản Lý Nhân Sự</h2>
          <div className="d-flex gap-2">
            <button className="btn btn-info btn-sm text-white fw-bold px-3 py-2 rounded-2" style={{ backgroundColor: '#38bdf8' }}>
              📥 Import Nhân viên
            </button>
            <button className="btn btn-light btn-sm fw-bold px-3 py-2 rounded-2 border shadow-sm">
              👥 Quản lý Nhân viên
            </button>
            <button className="btn btn-warning btn-sm text-white fw-bold px-3 py-2 rounded-2 position-relative" style={{ backgroundColor: '#f59e0b' }}>
              🔄 Yêu Cầu Đổi Ca <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">0</span>
            </button>
          </div>
        </div>

        {/* SEARCH BOX */}
        <div className="card border-0 shadow-sm p-4 mb-4 rounded-4 bg-white">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-lg-6">
              <label className="form-label small fw-bold text-secondary">Tìm kiếm nhân viên:</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Nhập mã NV, tên, chức vụ..." 
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="col-12 col-lg-4">
              <label className="form-label small fw-bold text-secondary">Phòng ban:</label>
              <select 
                className="form-select"
                value={selectedDept}
                onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
              >
                <option>Tất cả phòng ban</option>
                <option value="CUSTOMS">CUSTOMS</option>
                <option value="PS Production">PS Production</option>
                <option value="Engineering">Engineering</option>
                <option value="FINANCE">FINANCE</option>
                <option value="QA/QC">QA/QC</option>
              </select>
            </div>
            <div className="col-12 col-lg-2 d-flex align-items-end gap-2 pt-2">
              <button className="btn btn-primary w-50 fw-bold" style={{ backgroundColor: '#0ea5e9' }}>Tìm kiếm</button>
              <button className="btn btn-light w-50 fw-bold border" onClick={() => { setKeyword(''); setSelectedDept('Tất cả phòng ban'); }}>Làm mới</button>
            </div>
          </div>
        </div>

        {/* THAO TÁC BẢNG: NÚT THÊM & XÓA NV ĐÃ NGHỈ */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="small fw-bold text-secondary">Hiển thị:</span>
            <select className="form-select form-select-sm w-auto" disabled value={50}>
              <option value={50}>50 dòng</option>
            </select>
            {/* 🟢 NÚT THÊM NHÂN VIÊN */}
            <button 
              className="btn btn-success btn-sm fw-bold px-3 py-2" 
              style={{ backgroundColor: '#16a34a' }}
              onClick={handleOpenCreateModal}
            >
              ➕ Thêm nhân viên
            </button>

            <button className="btn btn-primary btn-sm fw-bold px-3 py-2" style={{ backgroundColor: '#0284c7' }} onClick={fetchStaffList}>
              🔄 Đồng bộ dữ liệu HRM
            </button>

            {/* 🔴 NÚT XÓA NV ĐÃ NGHỈ (XÓA CÁC NV ĐƯỢC TÍCH CHỌN) */}
            <button 
              className="btn btn-danger btn-sm fw-bold px-3 py-2" 
              style={{ backgroundColor: '#dc2626' }}
              onClick={handleDeleteSelected}
            >
              🗑️ Xóa NV đã nghỉ ({selectedIds.length})
            </button>
          </div>

          <button className="btn btn-secondary btn-sm fw-bold px-3 py-2 text-white" style={{ backgroundColor: '#64748b' }} onClick={() => onNavigate('dashboard')}>
            Đóng
          </button>
        </div>

        {/* COUNTER INFO */}
        <div className="text-secondary small fw-bold mb-2">
          Tổng số nhân viên: <span className="text-dark">{filteredEmployees.length}</span> | Hiển thị: <span className="text-dark">{paginatedEmployees.length}</span> nhân viên | Trang: <span className="text-primary">{currentPage}/{totalPages}</span>
        </div>

        {/* TABLE */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive" style={{ maxHeight: '600px' }}>
            <table className="table table-hover table-bordered align-middle mb-0 text-nowrap" style={{ fontSize: '13px' }}>
              <thead className="table-light text-secondary text-uppercase fs-7" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ width: '40px' }} className="text-center">
                    <input 
                      type="checkbox" 
                      className="form-check-input" 
                      checked={paginatedEmployees.length > 0 && selectedIds.length === paginatedEmployees.length} 
                      onChange={handleToggleSelectAll} 
                    />
                  </th>
                  <th>Mã NV</th>
                  <th>Tên nhân viên</th>
                  <th>Chức vụ</th>
                  <th>Phòng ban</th>
                  <th>Email</th>
                  <th>Ngày vào làm</th>
                  <th>Ca</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-primary" role="status"></div> Đang tải dữ liệu từ PostgreSQL...
                    </td>
                  </tr>
                ) : paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-muted">Không tìm thấy nhân viên phù hợp.</td>
                  </tr>
                ) : (
                  paginatedEmployees.map((emp) => {
                    const isSelected = selectedIds.includes(emp.id);
                    return (
                      <tr key={emp.id} onClick={() => handleToggleSelectRow(emp.id)} className={isSelected ? 'table-active' : ''} style={{ cursor: 'pointer' }}>
                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected} onChange={() => handleToggleSelectRow(emp.id)} className="form-check-input" />
                        </td>
                        <td className="fw-bold text-primary">{emp.staffCode}</td>
                        <td>{emp.fullName}</td>
                        <td>{emp.position}</td>
                        <td>{emp.department}</td>
                        <td>{emp.email}</td>
                        <td>{emp.hireDate}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <select 
                            className="form-select form-select-sm" 
                            value={emp.shift || '-- Chưa gán --'}
                            onChange={(e) => handleChangeShift(emp, e.target.value)}
                          >
                            <option value="-- Chưa gán --">-- Chưa gán --</option>
                            <option value="Ca 1 (Sáng)">Ca 1 (Sáng)</option>
                            <option value="Ca 2 (Chiều)">Ca 2 (Chiều)</option>
                            <option value="Ca 3 (Đêm)">Ca 3 (Đêm)</option>
                          </select>
                        </td>
                        <td>
                          <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
                            {/* ✏️ NÚT SỬA */}
                            <button 
                              className="btn btn-primary btn-sm px-2 py-1 fw-bold" 
                              style={{ fontSize: '11px' }}
                              onClick={() => handleOpenEditModal(emp)}
                            >
                              ✏️ Sửa
                            </button>
                            {/* 🗑️ NÚT XÓA */}
                            <button 
                              className="btn btn-danger btn-sm px-2 py-1 fw-bold" 
                              style={{ fontSize: '11px' }}
                              onClick={() => handleDeleteSingle(emp.id, emp.fullName)}
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top bg-white">
              <div className="small text-muted">
                Hiển thị từ <span className="fw-bold text-dark">{Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredEmployees.length)}</span> đến <span className="fw-bold text-dark">{Math.min(currentPage * PAGE_SIZE, filteredEmployees.length)}</span> trong tổng số <span className="fw-bold text-dark">{filteredEmployees.length}</span> nhân viên (50 nhân viên/trang)
              </div>
              <nav aria-label="Page navigation">
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(1)}>«« Đầu</button>
                  </li>
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>« Trước</button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Sau »</button>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(totalPages)}>Cuối »»</button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </main>

      {/* --- 📝 MODAL POPUP: THÊM / SỬA NHÂN VIÊN --- */}
      {isModalOpen && (
        <div className="modal show d-block fade" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 p-3">
              <div className="modal-header border-bottom pb-2">
                <h5 className="modal-title fw-bold text-primary">
                  {modalMode === 'create' ? '➕ Thêm nhân viên mới' : '✏️ Cập nhật thông tin nhân viên'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
              </div>

              <form onSubmit={handleSaveStaff}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-secondary">Mã nhân viên (*)</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        value={formData.staffCode}
                        onChange={(e) => setFormData({...formData, staffCode: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-secondary">Họ và tên (*)</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        placeholder="Nhập đầy đủ họ tên..."
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-secondary">Chức vụ</label>
                      <select 
                        className="form-select form-select-sm"
                        value={formData.position}
                        onChange={(e) => setFormData({...formData, position: e.target.value})}
                      >
                        <option value="Staff">Staff</option>
                        <option value="Intern">Intern</option>
                        <option value="Engineer">Engineer</option>
                        <option value="Team Leader">Team Leader</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-secondary">Phòng ban</label>
                      <select 
                        className="form-select form-select-sm"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                      >
                        <option value="PS Production">PS Production</option>
                        <option value="CUSTOMS">CUSTOMS</option>
                        <option value="Engineering">Engineering</option>
                        <option value="FINANCE">FINANCE</option>
                        <option value="QA/QC">QA/QC</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-secondary">Email liên hệ</label>
                      <input 
                        type="email" 
                        className="form-control form-control-sm" 
                        placeholder="example@xppower.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-secondary">Ngày vào làm</label>
                      <input 
                        type="date" 
                        className="form-control form-control-sm" 
                        value={formData.hireDate}
                        onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-secondary">Ca làm việc</label>
                      <select 
                        className="form-select form-select-sm"
                        value={formData.shift}
                        onChange={(e) => setFormData({...formData, shift: e.target.value})}
                      >
                        <option value="-- Chưa gán --">-- Chưa gán --</option>
                        <option value="Ca 1 (Sáng)">Ca 1 (Sáng)</option>
                        <option value="Ca 2 (Chiều)">Ca 2 (Chiều)</option>
                        <option value="Ca 3 (Đêm)">Ca 3 (Đêm)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top pt-2">
                  <button type="submit" className="btn btn-primary btn-sm px-4 fw-bold rounded-pill" disabled={isSaving}>
                    {isSaving ? 'Đang lưu...' : 'Lưu dữ liệu'}
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm px-4 fw-bold rounded-pill" onClick={() => setIsModalOpen(false)}>
                    Hủy bỏ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};