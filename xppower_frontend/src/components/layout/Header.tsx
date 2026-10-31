import React, { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  username?: string;
  onLogout?: () => void;
  activeTab?: 'dashboard' | 'assets';
  onTabChange?: (tab: 'dashboard' | 'assets') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  username = 'VN2612246', 
  onLogout, 
  activeTab = 'dashboard', 
  onTabChange 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

          {/* THANH ĐIỀU HƯỚNG (NAVBAR) ĐÃ ĐƯỢC GẮN SỰ KIỆN CLICK CHUYỂN TAB */}
          <nav className="ms-3 d-none d-lg-flex gap-1 text-secondary small align-items-center" style={{ cursor: 'pointer' }}>
            <span 
              onClick={() => onTabChange && onTabChange('dashboard')}
              className={`px-3 py-1 rounded-pill fw-bold ${activeTab === 'dashboard' ? 'bg-light text-dark shadow-sm' : 'text-secondary'}`}
            >
              Trang chủ
            </span>
            <span 
              onClick={() => onTabChange && onTabChange('assets')}
              className={`px-3 py-1 rounded-pill fw-bold ${activeTab === 'assets' ? 'bg-light text-dark shadow-sm' : 'text-secondary'}`}
            >
              Quản Lý Tài sản
            </span>
            <span className="px-3 py-1">🏛 Bộ phận</span>
            <span className="px-3 py-1">Trang cá nhân</span>
            <span className="px-3 py-1">Cài Đặt</span>
          </nav>
        </div>

        {/* Right Section: User & Dropdown */}
        <div className="d-flex align-items-center gap-3">
          <div className="text-end small lh-sm d-none d-sm-block">
            <div className="fw-bold text-dark">{username}</div>
            <div className="text-muted" style={{ fontSize: '11px' }}>Admin</div>
          </div>

          <button className="btn btn-light btn-sm rounded-circle position-relative p-2" title="Thông báo">
            🔔
          </button>

          <div className="position-relative" ref={dropdownRef}>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-sm" 
              style={{ width: '38px', height: '38px', backgroundColor: '#8B5CF6', cursor: 'pointer' }}
            >
              V
            </div>
            
            {isDropdownOpen && (
              <ul className="dropdown-menu show shadow border-0 p-3 position-absolute" style={{ width: '260px', borderRadius: '12px', right: 0, top: '100%', marginTop: '8px', zIndex: 1050 }}>
                <li className="text-center pb-3 border-bottom mb-2">
                  <div className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold mx-auto mb-2" style={{ width: '48px', height: '48px', backgroundColor: '#8B5CF6', fontSize: '18px' }}>
                    V
                  </div>
                  <div className="fw-bold text-dark">{username}</div>
                  <div className="text-muted small" style={{ fontSize: '12px' }}>Admin</div>
                </li>
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