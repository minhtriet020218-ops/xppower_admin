import React, { useState, useMemo } from 'react';

interface Employee {
  id: string;
  staffCode: string;
  fullName: string;
  position: string;
  department: string;
  email: string;
  hireDate: string;
  shift: string;
}

// Tạo dữ liệu mẫu giả lập 150 nhân viên để kiểm tra tính năng phân trang (50 dòng/trang)
const MOCK_EMPLOYEES: Employee[] = Array.from({ length: 150 }, (_, index) => {
  const idNum = 2610769 + index;
  const depts = ['CUSTOMS', 'PS Production', 'Engineering', 'FINANCE', 'QA/QC'];
  const positions = ['Intern', 'Staff', 'Engineer', 'Team Leader', 'Manager'];
  return {
    id: String(idNum),
    staffCode: `VN${idNum}`,
    fullName: `NGUYỄN VĂN ${String.fromCharCode(65 + (index % 26))} ${index + 1}`,
    position: positions[index % positions.length],
    department: depts[index % depts.length],
    email: `vn.employee${index + 1}@xppower.com`,
    hireDate: '30/03/2026',
    shift: index % 3 === 0 ? 'Ca 1 (Sáng)' : index % 3 === 1 ? 'Ca 2 (Chiều)' : '-- Chưa gán --',
  };
});

const PAGE_SIZE = 50; // Cố định hiển thị 50 nhân viên mỗi trang theo yêu cầu

export const HrmStaffPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [keyword, setKeyword] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('Tất cả phòng ban');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Lọc nhân viên theo từ khóa và phòng ban
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

  // Tính toán phân trang (50 nhân viên/trang)
  const totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEmployees.slice(start, start + PAGE_SIZE);
  }, [filteredEmployees, currentPage]);

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

  return (
    <div className="d-flex min-vh-100 bg-light font-sans">
      {/* 1. THANH MENU BÊN TRÁI (SIDEBAR) */}
      <aside className="bg-dark text-white p-3 d-flex flex-column" style={{ width: '260px', minHeight: '100vh' }}>
        <div className="list-group list-group-flush gap-2">
          <button className="list-group-item list-group-item-action bg-transparent text-white-50 border-0 rounded-2 py-2 d-flex align-items-center gap-3">
            <span>📊</span> Dashboard
          </button>
          <button className="list-group-item list-group-item-action active bg-gradient border-0 rounded-2 py-3 d-flex align-items-center gap-3 fw-bold text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}>
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

      {/* 2. NỘI DUNG CHÍNH (MAIN CONTENT) */}
      <main className="flex-grow-1 p-4">
        {/* THANH ĐẦU TRANG & CÁC NÚT TÁC VỤ NHƯ HÌNH */}
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

        {/* KHUNG TÌM KIẾM NHÂN VIÊN & PHÒNG BAN */}
        <div className="card border-0 shadow-sm p-4 mb-4 rounded-4 bg-white">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-lg-6">
              <label className="form-label small fw-bold text-secondary">Tìm kiếm nhân viên:</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Nhập mã NV, tên, chức vụ..." 
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="col-12 col-lg-4">
              <label className="form-label small fw-bold text-secondary">Phòng ban:</label>
              <select 
                className="form-select"
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setCurrentPage(1);
                }}
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

        {/* THANH THAO TÁC BẢNG (HIỂN THỊ, THÊM, ĐỒNG BỘ...) */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="small fw-bold text-secondary">Hiển thị:</span>
            <select className="form-select form-select-sm w-auto" disabled value={50}>
              <option value={50}>50 dòng</option>
            </select>
            <button className="btn btn-success btn-sm fw-bold px-3 py-2" style={{ backgroundColor: '#16a34a' }}>
              ➕ Thêm nhân viên
            </button>
            <button className="btn btn-primary btn-sm fw-bold px-3 py-2" style={{ backgroundColor: '#0284c7' }}>
              🔄 Đồng bộ dữ liệu HRM
            </button>
            <button className="btn btn-danger btn-sm fw-bold px-3 py-2" style={{ backgroundColor: '#dc2626' }}>
              🗑️ Xóa NV đã nghỉ
            </button>
          </div>
          <button className="btn btn-secondary btn-sm fw-bold px-3 py-2 text-white" style={{ backgroundColor: '#64748b' }}>
            Đóng
          </button>
        </div>

        {/* THÔNG TIN THỐNG KÊ SỐ LƯỢNG & TRANG */}
        <div className="text-secondary small fw-bold mb-2">
          Tổng số nhân viên: <span className="text-dark">{filteredEmployees.length}</span> | Hiển thị: <span className="text-dark">{paginatedEmployees.length}</span> nhân viên | Trang: <span className="text-primary">{currentPage}/{totalPages}</span>
        </div>

        {/* BẢNG DỮ LIỆU NHÂN SỰ */}
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
                {paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-muted">Không tìm thấy nhân viên phù hợp.</td>
                  </tr>
                ) : (
                  paginatedEmployees.map((emp) => {
                    const isSelected = selectedIds.includes(emp.id);
                    return (
                      <tr key={emp.id} onClick={() => handleToggleSelectRow(emp.id)} className={isSelected ? 'table-active' : ''} style={{ cursor: 'pointer' }}>
                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={() => handleToggleSelectRow(emp.id)} 
                            className="form-check-input" 
                          />
                        </td>
                        <td className="fw-bold text-primary">{emp.staffCode}</td>
                        <td>{emp.fullName}</td>
                        <td>{emp.position}</td>
                        <td>{emp.department}</td>
                        <td>{emp.email}</td>
                        <td>{emp.hireDate}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <select className="form-select form-select-sm" defaultValue={emp.shift}>
                            <option value="-- Chưa gán --">-- Chưa gán --</option>
                            <option value="Ca 1 (Sáng)">Ca 1 (Sáng)</option>
                            <option value="Ca 2 (Chiều)">Ca 2 (Chiều)</option>
                          </select>
                        </td>
                        <td>
                          <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <button className="btn btn-primary btn-sm px-2 py-1 fw-bold" style={{ fontSize: '11px' }}>✏️ Sửa</button>
                            <button className="btn btn-danger btn-sm px-2 py-1 fw-bold" style={{ fontSize: '11px' }}>🗑️ Xóa</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* THANH PHÂN TRANG (PAGINATION CONTROLS) */}
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
    </div>
  );
};