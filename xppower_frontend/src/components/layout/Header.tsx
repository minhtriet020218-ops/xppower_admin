import React, { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  username?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ username = 'VN2612246', onLogout }) => {
  // Quản lý trạng thái mở/đóng dropdown bằng cách bấm (click) vào avatar
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Xử lý click ra bên ngoài để tự động đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm px-4 py-2 border-bottom">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Left Section: Chi nhánh, Logo, Title & Nav */}
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex flex-column border-end pe-3">
            <span className="text-muted" style={{ fontSize: '10px', fontWeight: 'bold' }}>CHI NHÁNH HIỆN TẠI</span>
            <select className="form-select form-select-sm border-0 bg-light fw-bold py-0" style={{ fontSize: '12px', width: '130px' }}>
              <option>VN - Vietnam</option>
            </select>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="bg-dark text-white px-2 py-1 rounded fw-bold small">XP IT</div>
            <span className="fw-bold fs-5">Asset Management</span>
          </div>

          <nav className="ms-3 d-none d-lg-flex gap-1 text-secondary small align-items-center">
            <span className="bg-light px-3 py-1 rounded-pill fw-bold text-dark cursor-pointer">Trang chủ</span>
            <span className="px-3 py-1 cursor-pointer">Quản Lý Tài sản</span>
            <span className="px-3 py-1 cursor-pointer">🏛 Bộ phận</span>
            <span className="px-3 py-1 cursor-pointer">Trang cá nhân</span>
            <span className="px-3 py-1 cursor-pointer">Cài Đặt</span>
          </nav>
        </div>

        {/* Right Section: Thông tin user, thông báo và Click Dropdown */}
        <div className="d-flex align-items-center gap-3">
          <div className="text-end small lh-sm d-none d-sm-block">
            <div className="fw-bold text-dark">{username}</div>
            <div className="text-muted" style={{ fontSize: '11px' }}>Admin</div>
          </div>

          {/* Nút thông báo */}
          <button className="btn btn-light btn-sm rounded-circle position-relative p-2" title="Thông báo">
            🔔
          </button>

          {/* Khu vực chứa Avatar và Dropdown menu (Hoạt động theo cơ chế CLICK) */}
          <div className="position-relative" ref={dropdownRef}>
            {/* Avatar - Bấm vào đây để bật/tắt menu */}
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-sm" 
              style={{ width: '38px', height: '38px', backgroundColor: '#8B5CF6', cursor: 'pointer' }}
            >
              V
            </div>
            
            {/* Menu xổ xuống khi bấm vào avatar */}
            {isDropdownOpen && (
              <ul 
                className="dropdown-menu show shadow border-0 p-3 position-absolute" 
                style={{ 
                  width: '260px', 
                  borderRadius: '12px', 
                  right: 0, 
                  top: '100%', 
                  marginTop: '8px',
                  display: 'block',
                  zIndex: 1050 
                }}
              >
                {/* Header bên trong Dropdown */}
                <li className="text-center pb-3 border-bottom mb-2">
                  <div className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold mx-auto mb-2" style={{ width: '48px', height: '48px', backgroundColor: '#8B5CF6', fontSize: '18px' }}>
                    V
                  </div>
                  <div className="fw-bold text-dark">{username}</div>
                  <div className="text-muted small" style={{ fontSize: '12px' }}>Admin</div>
                </li>

                {/* Các tùy chọn */}
                <li>
                  <a className="dropdown-item rounded py-2 small d-flex align-items-center gap-2" href="#change-avatar" onClick={() => setIsDropdownOpen(false)}>
                    🖼️ Đổi hình đại diện
                  </a>
                </li>
                <li>
                  <div className="dropdown-item py-2 small d-flex flex-column gap-1">
                    <span className="text-muted" style={{ fontSize: '11px' }}>🌐 Ngôn ngữ</span>
                    <select className="form-select form-select-sm py-1" style={{ fontSize: '12px' }}>
                      <option>🇻🇳 Tiếng Việt</option>
                      <option>🇬🇧 English</option>
                    </select>
                  </div>
                </li>
                <li><hr className="dropdown-divider my-2" /></li>
                <li>
                  <button 
                    className="dropdown-item rounded py-2 small text-danger fw-bold d-flex align-items-center gap-2 w-100 border-0 bg-transparent text-start" 
                    onClick={() => {
                      setIsDropdownOpen(false);
                      if (onLogout) onLogout();
                    }}
                  >
                    🚪 Đăng xuất
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};