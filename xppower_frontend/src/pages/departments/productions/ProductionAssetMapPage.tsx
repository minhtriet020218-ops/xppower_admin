import React, { useState } from 'react';

interface ProductionAssetMapPageProps {
  onNavigate: (tab: 'dashboard' | 'lines' | 'map' | 'staff') => void;
  activeSubTab: string;
}

// Danh sách toàn bộ các Group sản xuất theo yêu cầu của bạn
const ASSET_GROUPS = [
  { groupName: 'VNEMCO-ASSY', managerName: 'NGUYỄN HỮU CẨM', managerEmail: 'nhcam2006@gmail.com', themeColor: '#7C3AED', totalDevices: 2, activeCount: 2, brokenCount: 0, otherCount: 0, lines: [{ code: 'EMCO_ASSY_01', name: 'EMCO ASSY 01', owner: 'LÊ VĂN HOÀI', dùng: 2, hỏng: 0, khác: 0 }] },
  { groupName: 'VNEMCO-BI', managerName: 'NGUYỄN HỮU CẨM', managerEmail: 'nhcam2006@gmail.com', themeColor: '#DC2626', totalDevices: 0, activeCount: 0, brokenCount: 0, otherCount: 0, lines: [{ code: 'EMCO_BI', name: 'EMCO BI', owner: 'HUỲNH THỊ MỸ CHI', dùng: 0, hỏng: 0, khác: 0 }] },
  { groupName: 'VNEMCO-COATING', managerName: 'NGUYỄN HOÀNG PHI LONG', managerEmail: 'longnh@xppower.com', themeColor: '#2563EB', totalDevices: 5, activeCount: 5, brokenCount: 0, otherCount: 0, lines: [{ code: 'EMCO_COATING', name: 'EMCO COATING', owner: 'HUỲNH THỊ MỸ CHI', dùng: 5, hỏng: 0, khác: 0 }] },
  { groupName: 'VNEMCO-PKG', managerName: 'NGUYỄN HOÀNG PHI LONG', managerEmail: 'longnh@xppower.com', themeColor: '#059669', totalDevices: 3, activeCount: 3, brokenCount: 0, otherCount: 0, lines: [{ code: 'EMCO_PKG_01', name: 'EMCO PACKING 01', owner: 'LÊ VĂN HOÀI', dùng: 3, hỏng: 0, khác: 0 }] },
  { groupName: 'VNEMCO-POTTING', managerName: 'NGUYỄN HOÀNG PHI LONG', managerEmail: 'longnh@xppower.com', themeColor: '#D97706', totalDevices: 1, activeCount: 1, brokenCount: 0, otherCount: 0, lines: [{ code: 'EMCO_POTTING', name: 'EMCO POTTING', owner: 'HUỲNH THỊ MỸ CHI', dùng: 1, hỏng: 0, khác: 0 }] },
  { groupName: 'VNEMCO-PRE', managerName: 'NGUYỄN HOÀNG PHI LONG', managerEmail: 'longnh@xppower.com', themeColor: '#7C3AED', totalDevices: 4, activeCount: 4, brokenCount: 0, otherCount: 0, lines: [{ code: 'EMCO_PRE_01', name: 'EMCO PRE 01', owner: 'LÊ VĂN HOÀI', dùng: 4, hỏng: 0, khác: 0 }] },
  { groupName: 'VNEMCO-TEST', managerName: 'NGUYỄN HOÀNG PHI LONG', managerEmail: 'longnh@xppower.com', themeColor: '#4F46E5', totalDevices: 2, activeCount: 2, brokenCount: 0, otherCount: 0, lines: [{ code: 'EMCO_TEST', name: 'EMCO TEST 01', owner: 'HUỲNH THỊ KIM PHƯỢNG', dùng: 2, hỏng: 0, khác: 0 }] },
  { groupName: 'VNEMCO-TOUCH UP', managerName: 'NGUYỄN HOÀNG PHI LONG', managerEmail: 'longnh@xppower.com', themeColor: '#DB2777', totalDevices: 1, activeCount: 1, brokenCount: 0, otherCount: 0, lines: [{ code: 'EMCO_TOUCHUP', name: 'EMCO TOUCH UP', owner: 'HUỲNH THỊ MỸ CHI', dùng: 1, hỏng: 0, khác: 0 }] },
  { groupName: 'VNEMCO MAGS', managerName: 'TRẦN VĂN AN', managerEmail: 'antv@xppower.com', themeColor: '#0EA5E9', totalDevices: 6, activeCount: 6, brokenCount: 0, otherCount: 0, lines: [{ code: 'MAGS_01', name: 'MAGS ASSEMBLY 01', owner: 'NGUYỄN VĂN TÙNG', dùng: 6, hỏng: 0, khác: 0 }] },
  { groupName: 'VNHVHP', managerName: 'LÊ VĂN MINH', managerEmail: 'minhlv@xppower.com', themeColor: '#10B981', totalDevices: 4, activeCount: 4, brokenCount: 0, otherCount: 0, lines: [{ code: 'HVHP_MAIN', name: 'HVHP MAIN LINE', owner: 'ĐỖ VĂN HOÀNG', dùng: 4, hỏng: 0, khác: 0 }] },
  { groupName: 'VNHVHP-ASSY', managerName: 'LÊ VĂN MINH', managerEmail: 'minhlv@xppower.com', themeColor: '#6366F1', totalDevices: 3, activeCount: 3, brokenCount: 0, otherCount: 0, lines: [{ code: 'HVHP_ASSY', name: 'HVHP ASSY LINE', owner: 'ĐỖ VĂN HOÀNG', dùng: 3, hỏng: 0, khác: 0 }] },
  { groupName: 'VNHVHP-HARNESS', managerName: 'LÊ VĂN MINH', managerEmail: 'minhlv@xppower.com', themeColor: '#8B5CF6', totalDevices: 2, activeCount: 2, brokenCount: 0, otherCount: 0, lines: [{ code: 'HVHP_HARN', name: 'HVHP HARNESS', owner: 'PHẠM VĂN ĐỨC', dùng: 2, hỏng: 0, khác: 0 }] },
  { groupName: 'VNHVHP-MITU', managerName: 'LÊ VĂN MINH', managerEmail: 'minhlv@xppower.com', themeColor: '#EC4899', totalDevices: 1, activeCount: 1, brokenCount: 0, otherCount: 0, lines: [{ code: 'HVHP_MITU', name: 'HVHP MITU LINE', owner: 'PHẠM VĂN ĐỨC', dùng: 1, hỏng: 0, khác: 0 }] },
  { groupName: 'VNHVHP-PKG', managerName: 'LÊ VĂN MINH', managerEmail: 'minhlv@xppower.com', themeColor: '#14B8A6', totalDevices: 2, activeCount: 2, brokenCount: 0, otherCount: 0, lines: [{ code: 'HVHP_PKG', name: 'HVHP PACKING', owner: 'ĐỖ VĂN HOÀNG', dùng: 2, hỏng: 0, khác: 0 }] },
  { groupName: 'VNHVHP-PRE', managerName: 'LÊ VĂN MINH', managerEmail: 'minhlv@xppower.com', themeColor: '#F59E0B', totalDevices: 3, activeCount: 3, brokenCount: 0, otherCount: 0, lines: [{ code: 'HVHP_PRE', name: 'HVHP PRE LINE', owner: 'PHẠM VĂN ĐỨC', dùng: 3, hỏng: 0, khác: 0 }] },
  { groupName: 'VNIPC', managerName: 'HOÀNG VĂN TUẤN', managerEmail: 'tuanhv@xppower.com', themeColor: '#3B82F6', totalDevices: 5, activeCount: 5, brokenCount: 0, otherCount: 0, lines: [{ code: 'IPC_01', name: 'IPC CONTROL LINE', owner: 'VŨ THỊ MAI', dùng: 5, hỏng: 0, khác: 0 }] },
  { groupName: 'VNIQC', managerName: 'HOÀNG VĂN TUẤN', managerEmail: 'tuanhv@xppower.com', themeColor: '#6D28D9', totalDevices: 4, activeCount: 4, brokenCount: 0, otherCount: 0, lines: [{ code: 'IQC_01', name: 'IQC INSPECTION', owner: 'VŨ THỊ MAI', dùng: 4, hỏng: 0, khác: 0 }] },
  { groupName: 'VNMAGS', managerName: 'TRẦN VĂN AN', managerEmail: 'antv@xppower.com', themeColor: '#0284C7', totalDevices: 4, activeCount: 4, brokenCount: 0, otherCount: 0, lines: [{ code: 'MAGS_TEST', name: 'MAGS TEST LINE', owner: 'NGUYỄN VĂN TÙNG', dùng: 4, hỏng: 0, khác: 0 }] },
  { groupName: 'VNOQC', managerName: 'HOÀNG VĂN TUẤN', managerEmail: 'tuanhv@xppower.com', themeColor: '#0D9488', totalDevices: 3, activeCount: 3, brokenCount: 0, otherCount: 0, lines: [{ code: 'OQC_01', name: 'OQC CHECK LINE', owner: 'VŨ THỊ MAI', dùng: 3, hỏng: 0, khác: 0 }] },
  { groupName: 'VNPS-ASSY', managerName: 'NGUYỄN VĂN HÙNG', managerEmail: 'hungnv@xppower.com', themeColor: '#4338CA', totalDevices: 12, activeCount: 12, brokenCount: 0, otherCount: 0, lines: [{ code: 'PS_ASSY_01', name: 'PS ASSEMBLY 01', owner: 'HOÀNG VĂN NAM', dùng: 6, hỏng: 0, khác: 0 }, { code: 'PS_ASSY_02', name: 'PS ASSEMBLY 02', owner: 'HOÀNG VĂN NAM', dùng: 6, hỏng: 0, khác: 0 }] },
  { groupName: 'VNPS-ASSYSV', managerName: 'NGUYỄN VĂN HÙNG', managerEmail: 'hungnv@xppower.com', themeColor: '#6366F1', totalDevices: 2, activeCount: 2, brokenCount: 0, otherCount: 0, lines: [{ code: 'PS_ASSYSV', name: 'PS ASSY SUPERVISION', owner: 'HOÀNG VĂN NAM', dùng: 2, hỏng: 0, khác: 0 }] },
  { groupName: 'VNPS-ATE', managerName: 'NGUYỄN VĂN HÙNG', managerEmail: 'hungnv@xppower.com', themeColor: '#9333EA', totalDevices: 8, activeCount: 8, brokenCount: 0, otherCount: 0, lines: [{ code: 'PS_ATE_01', name: 'PS ATE LINE 01', owner: 'NGUYỄN VĂN TÙNG', dùng: 8, hỏng: 0, khác: 0 }] },
  { groupName: 'VNPS-ATESV', managerName: 'NGUYỄN VĂN HÙNG', managerEmail: 'hungnv@xppower.com', themeColor: '#C084FC', totalDevices: 1, activeCount: 1, brokenCount: 0, otherCount: 0, lines: [{ code: 'PS_ATESV', name: 'PS ATE SUPERVISION', owner: 'NGUYỄN VĂN TÙNG', dùng: 1, hỏng: 0, khác: 0 }] },
  { groupName: 'VNPS-BI', managerName: 'NGUYỄN VĂN HÙNG', managerEmail: 'hungnv@xppower.com', themeColor: '#E11D48', totalDevices: 5, activeCount: 5, brokenCount: 0, otherCount: 0, lines: [{ code: 'PS_BI_01', name: 'PS BURN IN 01', owner: 'HUỲNH THỊ MỸ CHI', dùng: 5, hỏng: 0, khác: 0 }] },
  { groupName: 'VNPS-BISV', managerName: 'NGUYỄN VĂN HÙNG', managerEmail: 'hungnv@xppower.com', themeColor: '#FB7185', totalDevices: 1, activeCount: 1, brokenCount: 0, otherCount: 0, lines: [{ code: 'PS_BISV', name: 'PS BURN IN SUP', owner: 'HUỲNH THỊ MỸ CHI', dùng: 1, hỏng: 0, khác: 0 }] },
  { groupName: 'VNPS-HARNESS', managerName: 'NGUYỄN VĂN HÙNG', managerEmail: 'hungnv@xppower.com', themeColor: '#0284C7', totalDevices: 4, activeCount: 4, brokenCount: 0, otherCount: 0, lines: [{ code: 'PS_HARN', name: 'PS HARNESS LINE', owner: 'PHẠM VĂN ĐỨC', dùng: 4, hỏng: 0, khác: 0 }] },
  { groupName: 'VNPS-HIPOT', managerName: 'NGUYỄN VĂN HÙNG', managerEmail: 'hungnv@xppower.com', themeColor: '#EA580C', totalDevices: 3, activeCount: 3, brokenCount: 0, otherCount: 0, lines: [{ code: 'PS_HIPOT', name: 'PS HIPOT TEST', owner: 'ĐỖ VĂN HOÀNG', dùng: 3, hỏng: 0, khác: 0 }] },
  { groupName: 'VNPS-HIPOTSV', managerName: 'NGUYỄN VĂN HÙNG', managerEmail: 'hungnv@xppower.com', themeColor: '#F97316', totalDevices: 1, activeCount: 1, brokenCount: 0, otherCount: 0, lines: [{ code: 'PS_HIPOTSV', name: 'PS HIPOT SUP', owner: 'ĐỖ VĂN HOÀNG', dùng: 1, hỏng: 0, khác: 0 }] },
  { groupName: 'VNPS-MH', managerName: 'NGUYỄN VĂN HÙNG', managerEmail: 'hungnv@xppower.com', themeColor: '#16A34A', totalDevices: 2, activeCount: 2, brokenCount: 0, otherCount: 0, lines: [{ code: 'PS_MH', name: 'PS MATERIAL HANDLING', owner: 'VŨ THỊ MAI', dùng: 2, hỏng: 0, khác: 0 }] },
  { groupName: 'VNPS-MITU', managerName: 'NGUYỄN VĂN HÙNG', managerEmail: 'hungnv@xppower.com', themeColor: '#65A30D', totalDevices: 2, activeCount: 2, brokenCount: 0, otherCount: 0, lines: [{ code: 'PS_MITU', name: 'PS MITUTOYO LINE', owner: 'VŨ THỊ MAI', dùng: 2, hỏng: 0, khác: 0 }] },
  { groupName: 'VNPS-PKG', managerName: 'NGUYỄN VĂN HÙNG', managerEmail: 'hungnv@xppower.com', themeColor: '#0D9488', totalDevices: 4, activeCount: 4, brokenCount: 0, otherCount: 0, lines: [{ code: 'PS_PKG', name: 'PS PACKING LINE', owner: 'LÊ VĂN HOÀI', dùng: 4, hỏng: 0, khác: 0 }] },
  { groupName: 'VNPS-PKGSV', managerName: 'NGUYỄN VĂN HÙNG', managerEmail: 'hungnv@xppower.com', themeColor: '#2DD4BF', totalDevices: 1, activeCount: 1, brokenCount: 0, otherCount: 0, lines: [{ code: 'PS_PKGSV', name: 'PS PACKING SUP', owner: 'LÊ VĂN HOÀI', dùng: 1, hỏng: 0, khác: 0 }] },
  { groupName: 'VNPS-PRE', managerName: 'NGUYỄN VĂN HÙNG', managerEmail: 'hungnv@xppower.com', themeColor: '#2563EB', totalDevices: 6, activeCount: 6, brokenCount: 0, otherCount: 0, lines: [{ code: 'PS_PRE', name: 'PS PREPARATION LINE', owner: 'LÊ VĂN HOÀI', dùng: 6, hỏng: 0, khác: 0 }] },
  { groupName: 'VNPS-REWORK', managerName: 'NGUYỄN VĂN HÙNG', managerEmail: 'hungnv@xppower.com', themeColor: '#475569', totalDevices: 2, activeCount: 2, brokenCount: 0, otherCount: 0, lines: [{ code: 'PS_REWORK', name: 'PS REWORK LINE', owner: 'ĐỖ VĂN HOÀNG', dùng: 2, hỏng: 0, khác: 0 }] },
  { groupName: 'VNPS-SMT', managerName: 'NGUYỄN VĂN HÙNG', managerEmail: 'hungnv@xppower.com', themeColor: '#1E293B', totalDevices: 10, activeCount: 10, brokenCount: 0, otherCount: 0, lines: [{ code: 'SMT_01', name: 'SMT HIGH SPEED 01', owner: 'VŨ THỊ MAI', dùng: 5, hỏng: 0, khác: 0 }, { code: 'SMT_02', name: 'SMT FLEX 02', owner: 'VŨ THỊ MAI', dùng: 5, hỏng: 0, khác: 0 }] },
  { groupName: 'VNQC', managerName: 'HOÀNG VĂN TUẤN', managerEmail: 'tuanhv@xppower.com', themeColor: '#059669', totalDevices: 4, activeCount: 4, brokenCount: 0, otherCount: 0, lines: [{ code: 'QC_GENERAL', name: 'QC GENERAL LINE', owner: 'VŨ THỊ MAI', dùng: 4, hỏng: 0, khác: 0 }] },
  { groupName: 'VNTEST', managerName: 'NGUYỄN VĂN TÙNG', managerEmail: 'tungnv@xppower.com', themeColor: '#7C3AED', totalDevices: 7, activeCount: 7, brokenCount: 0, otherCount: 0, lines: [{ code: 'TEST_GENERAL', name: 'GENERAL TEST LINE', owner: 'NGUYỄN VĂN TÙNG', dùng: 7, hỏng: 0, khác: 0 }] },
  { groupName: 'VNTSHOOT', managerName: 'NGUYỄN VĂN TÙNG', managerEmail: 'tungnv@xppower.com', themeColor: '#9333EA', totalDevices: 2, activeCount: 2, brokenCount: 0, otherCount: 0, lines: [{ code: 'TSHOOT_01', name: 'TROUBLESHOOT LINE', owner: 'NGUYỄN VĂN TÙNG', dùng: 2, hỏng: 0, khác: 0 }] },
  { groupName: 'VNWH', managerName: 'LÊ VĂN KHOA', managerEmail: 'khoalv@xppower.com', themeColor: '#57534E', totalDevices: 5, activeCount: 5, brokenCount: 0, otherCount: 0, lines: [{ code: 'WH_LINE', name: 'WAREHOUSE LINE', owner: 'LÊ VĂN KHOA', dùng: 5, hỏng: 0, khác: 0 }] },
  { groupName: 'Ungrouped Lines', managerName: 'Chưa phân công', managerEmail: 'n/a', themeColor: '#6B7280', totalDevices: 24, activeCount: 24, brokenCount: 0, otherCount: 0, lines: [{ code: 'UNGROUP_01', name: 'MISC LINE 01', owner: 'KHÔNG XÁC ĐỊNH', dùng: 12, hỏng: 0, khác: 0 }, { code: 'UNGROUP_02', name: 'MISC LINE 02', owner: 'KHÔNG XÁC ĐỊNH', dùng: 12, hỏng: 0, khác: 0 }] }
];

export const ProductionAssetMapPage: React.FC<ProductionAssetMapPageProps> = ({ onNavigate, activeSubTab }) => {
  const [selectedGroup, setSelectedGroup] = useState('-- Tất cả nhóm --');
  const [filterBroken, setFilterBroken] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [isMiniView, setIsMiniView] = useState(false);

  // Lọc dữ liệu group theo bộ chọn phía trên
  const filteredGroups = ASSET_GROUPS.filter(g => {
    if (selectedGroup !== '-- Tất cả nhóm --' && g.groupName !== selectedGroup) return false;
    if (filterBroken && g.brokenCount === 0) return false;
    if (filterActive && g.activeCount === 0) return false;
    return true;
  });

  // Tính tổng số lượng Line và Group thực tế
  const totalGroupsCount = ASSET_GROUPS.length;
  const totalLinesCount = ASSET_GROUPS.reduce((acc, g) => acc + g.lines.length, 0);
  const ungroupedLinesCount = ASSET_GROUPS.find(g => g.groupName === 'Ungrouped Lines')?.lines.length || 24;

  return (
    <div className="d-flex min-vh-100 bg-light font-sans">
      {/* 1. SIDEBAR */}
      <aside className="p-3 d-flex flex-column text-white" style={{ width: '240px', minHeight: '100vh', backgroundColor: '#1E2337' }}>
        <div className="fw-bold fs-6 mb-4 d-flex align-items-center gap-2 px-2">
          <span>🏭</span> Productions
        </div>

        <div className="list-group list-group-flush gap-2">
          <button 
            className={`list-group-item list-group-item-action border-0 rounded-3 py-2 px-3 d-flex align-items-center gap-3 text-white ${activeSubTab === 'dashboard' ? 'shadow-sm' : ''}`} 
            style={{ 
              background: activeSubTab === 'dashboard' ? 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' : 'transparent',
              opacity: activeSubTab === 'dashboard' ? 1 : 0.7
            }}
            onClick={() => onNavigate('dashboard')}
          >
            <span>📊</span> Dashboard
          </button>
          <button 
            className={`list-group-item list-group-item-action border-0 rounded-3 py-2 px-3 d-flex align-items-center gap-3 text-white ${activeSubTab === 'lines' ? 'shadow-sm' : ''}`}
            style={{ 
              background: activeSubTab === 'lines' ? 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' : 'transparent',
              opacity: activeSubTab === 'lines' ? 1 : 0.7
            }}
            onClick={() => onNavigate('lines')}
          >
            <span>🏭</span> Production Lines
          </button>
          <button 
            className={`list-group-item list-group-item-action border-0 rounded-3 py-2 px-3 d-flex align-items-center gap-3 fw-bold text-white ${activeSubTab === 'map' ? 'shadow-sm' : ''}`}
            style={{ 
              background: activeSubTab === 'map' ? 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' : 'transparent',
              opacity: activeSubTab === 'map' ? 1 : 0.7
            }}
            onClick={() => onNavigate('map')}
          >
            <span>🌳</span> Sơ đồ quản lý tài sản line
          </button>
          <button 
            className={`list-group-item list-group-item-action border-0 rounded-3 py-2 px-3 d-flex align-items-center gap-3 text-white ${activeSubTab === 'staff' ? 'shadow-sm' : ''}`}
            style={{ 
              background: activeSubTab === 'staff' ? 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' : 'transparent',
              opacity: activeSubTab === 'staff' ? 1 : 0.7
            }}
            onClick={() => onNavigate('staff')}
          >
            <span>👥</span> Quản lý nhân sự
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-grow-1 p-4" style={{ backgroundColor: '#F8FAFC' }}>
        {/* THANH CÔNG CỤ & BỘ LỌC PHÍA TRÊN */}
        <div className="card border-0 shadow-sm p-4 mb-4 rounded-4 bg-white">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-lg-4">
              <h4 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                🌳 Sơ đồ quản lý tài sản line
              </h4>
              <div className="text-muted small">Sơ đồ tổ chức hiển thị các nhóm line, line và thiết bị được quản lý</div>
            </div>

            <div className="col-12 col-lg-8">
              <div className="d-flex flex-wrap gap-3 align-items-center justify-content-lg-end">
                <div className="d-flex align-items-center gap-1">
                  <span className="small fw-bold text-secondary">Group:</span>
                  <select 
                    className="form-select form-select-sm fw-bold" 
                    style={{ width: '190px' }}
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                  >
                    <option>-- Tất cả nhóm --</option>
                    {ASSET_GROUPS.map((g, idx) => <option key={idx} value={g.groupName}>{g.groupName}</option>)}
                  </select>
                </div>

                <div className="d-flex align-items-center gap-1">
                  <span className="small fw-bold text-secondary">Line:</span>
                  <select className="form-select form-select-sm" style={{ width: '130px' }} disabled>
                    <option>0 selected</option>
                  </select>
                </div>

                <button className="btn btn-info btn-sm text-white fw-bold px-3 d-flex align-items-center gap-1" style={{ backgroundColor: '#0EA5E9' }} onClick={() => window.location.reload()}>
                  🔄 Tải lại
                </button>
              </div>

              {/* Hàng lọc nhanh */}
              <div className="d-flex flex-wrap gap-3 align-items-center mt-3 pt-2 border-top small text-secondary">
                <span className="fw-bold">Lọc nhanh:</span>
                <label className="d-flex align-items-center gap-1 cursor-pointer">
                  <input type="checkbox" className="form-check-input m-0" checked={filterBroken} onChange={(e) => setFilterBroken(e.target.checked)} /> Hỏng {' > '} 0
                </label>
                <label className="d-flex align-items-center gap-1 cursor-pointer">
                  <input type="checkbox" className="form-check-input m-0" checked={filterActive} onChange={(e) => setFilterActive(e.target.checked)} /> Dùng {' > '} 0
                </label>
                <label className="d-flex align-items-center gap-1 cursor-pointer">
                  <input type="checkbox" className="form-check-input m-0" /> Chưa có quản lý[cite: 5]
                </label>
                <label className="d-flex align-items-center gap-1 cursor-pointer">
                  <input type="checkbox" className="form-check-input m-0" checked={isMiniView} onChange={(e) => setIsMiniView(e.target.checked)} /> Mini
                </label>
                <div className="ms-auto d-flex align-items-center gap-2">
                  <span>Tự động cập nhật[cite: 5]</span>
                  <input type="checkbox" className="form-check-input m-0" defaultChecked />
                  <select className="form-select form-select-sm py-0" style={{ width: '90px', fontSize: '11px' }}>
                    <option>30 phút[cite: 5]</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 THẺ THỐNG KÊ TỔNG QUAN (Nhóm Line, Tổng Lines, Lines chưa nhóm) */}
        <div className="row g-3 mb-4 text-center">
          <div className="col-4">
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
              <div className="fs-3 fw-bold text-primary">{totalGroupsCount}</div>
              <div className="small text-muted fw-semibold">Nhóm Line</div>
            </div>
          </div>
          <div className="col-4">
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
              <div className="fs-3 fw-bold text-success">{totalLinesCount}</div>
              <div className="small text-muted fw-semibold">Tổng Lines</div>
            </div>
          </div>
          <div className="col-4">
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
              <div className="fs-3 fw-bold text-warning">{ungroupedLinesCount}</div>
              <div className="small text-muted fw-semibold">Lines chưa nhóm</div>
            </div>
          </div>
        </div>

        {/* DANH SÁCH HIỂN THỊ CÁC NHÓM LINE & LINE CON */}
        <div className="d-flex flex-column gap-4">
          {filteredGroups.map((group, gIndex) => (
            <div key={gIndex} className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              {/* Tiêu đề Group với màu sắc tương ứng */}
              <div 
                className="px-4 py-3 text-white d-flex flex-wrap justify-content-between align-items-center gap-2"
                style={{ backgroundColor: group.themeColor }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-white text-dark rounded-circle fw-bold d-flex align-items-center justify-content-center shadow-sm" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                    {group.groupName.charAt(0)}
                  </div>
                  <div>
                    <h5 className="m-0 fw-bold fs-6">{group.groupName}</h5>
                    <div className="small text-light opacity-75" style={{ fontSize: '12px' }}>
                      👤 {group.managerName} ({group.managerEmail})
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-dark btn-sm text-white fw-bold px-3 py-1 shadow-sm" style={{ fontSize: '12px', backgroundColor: 'rgba(0,0,0,0.3)', border: 'none' }}>
                    ↓ CSV
                  </button>
                  <span className="badge bg-white text-dark px-3 py-2 fw-bold shadow-sm" style={{ fontSize: '12px' }}>
                    {group.totalDevices} Thiết bị
                  </span>
                  <span className="badge bg-success text-white px-2 py-2 fw-bold" style={{ fontSize: '11px' }}>
                    ✔ {group.activeCount}
                  </span>
                  <span className="badge bg-danger text-white px-2 py-2 fw-bold" style={{ fontSize: '11px' }}>
                    ❌ {group.brokenCount}
                  </span>
                  <span className="badge bg-secondary text-white px-2 py-2 fw-bold" style={{ fontSize: '11px' }}>
                    📦 {group.otherCount}
                  </span>
                </div>
              </div>

              {/* Lưới các Line con trực thuộc Group */}
              <div className="p-3 bg-light">
                <div className="row g-3">
                  {group.lines.map((line, lIndex) => (
                    <div key={lIndex} className={`col-12 ${isMiniView ? 'col-md-6 col-xl-3' : 'col-md-6 col-xl-3'}`}>
                      <div className="card border shadow-sm rounded-3 bg-white p-3 h-100 position-relative">
                        <div className="position-absolute top-0 start-0 w-100 bg-primary rounded-top" style={{ height: '4px' }}></div>

                        <div className="d-flex justify-content-between align-items-start mb-2 pt-1">
                          <span className="fw-bold text-dark small">{line.name}</span>
                          <span className="badge bg-light text-primary border" style={{ fontSize: '10px' }}>{line.code}</span>
                        </div>

                        <div className="row g-1 text-center my-2">
                          <div className="col-4">
                            <div className="border rounded bg-success bg-opacity-10 py-1">
                              <div className="fw-bold text-success fs-6">{line.dùng}</div>
                              <div className="text-muted" style={{ fontSize: '9px' }}>Dùng</div>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="border rounded bg-danger bg-opacity-10 py-1">
                              <div className="fw-bold text-danger fs-6">{line.hỏng}</div>
                              <div className="text-muted" style={{ fontSize: '9px' }}>Hỏng</div>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="border rounded bg-secondary bg-opacity-10 py-1">
                              <div className="fw-bold text-secondary fs-6">{line.khác}</div>
                              <div className="text-muted" style={{ fontSize: '9px' }}>Khác</div>
                            </div>
                          </div>
                        </div>

                        <div className="border-top pt-2 mt-auto d-flex align-items-center gap-1 text-secondary" style={{ fontSize: '11px' }}>
                          <span>👤</span> <span className="fw-semibold text-dark">{line.owner}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};