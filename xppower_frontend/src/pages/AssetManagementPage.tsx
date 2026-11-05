import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from '../components/layout/Header';
import { AssetService } from '../services/AssetService';
import { AxiosClient } from '../services/api/AxiosClient';
import type { AssetDTO } from '../dtos/AssetDTO';
import { compressImage } from '../utils/imageCompress';
import { SEARCH_SCOPES, DEFAULT_SCOPE, createSearch, filterAssets, isActive } from '../utils/assetSearch';

interface AssetManagementPageProps {
  onLogout?: () => void;
  onTabChange?: (tab: 'dashboard' | 'assets') => void;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB - khớp giới hạn của backend
// Ảnh chụp bằng iPhone có thể là HEIC; trình duyệt sẽ chuyển sang JPEG khi nén
const INPUT_IMAGE_TYPES = [...ACCEPTED_IMAGE_TYPES, 'image/heic', 'image/heif'];

export const AssetManagementPage: React.FC<AssetManagementPageProps> = ({ onLogout, onTabChange }) => {
  const [assets, setAssets] = useState<AssetDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [searchField, setSearchField] = useState<string>(DEFAULT_SCOPE);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    itAssetCode: '',
    hostname: '',
    category: '',
    product: '',
    productionLine: '',
    financeAssetCode: '',
    poInvoice: '',
    serialNumber: '',
    macAddressWireless: '',
    macAddressLan: '',
    ipAddress: '',
    computerDescription: '',
    assetStatus: 'In Stock' as 'In Stock' | 'In Use' | 'Damaged' | 'Không xác định' | 'Write off' | 'Retired' | 'Backup',
    staffCode: '',
    assignedTo: '',
    mailUser: '',
    department: '0',
    purchaseDate: '',
    managedBy: 'Johnny Anh',
    managedByGroup: 'Asia - Vietnam',
    note: '',
  });

  // --- HÌNH ẢNH TÀI SẢN (trong modal Create / Edit) ---
  const [imageFile, setImageFile] = useState<File | null>(null);          // file người dùng vừa chọn
  const [imagePreview, setImagePreview] = useState<string | null>(null);  // URL tạm để xem trước
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');     // ảnh đang lưu trên server (khi Edit)
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);    // chọn ảnh từ thư viện / tệp
  const cameraInputRef = useRef<HTMLInputElement>(null);  // mở camera để chụp trực tiếp
  // Chỉ hiện nút chụp ảnh trên thiết bị cảm ứng (điện thoại, máy tính bảng)
  const [isTouchDevice] = useState<boolean>(() => window.matchMedia('(pointer: coarse)').matches);

  // Giải phóng URL tạm khi đổi ảnh khác hoặc đóng modal để không rò rỉ bộ nhớ
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const resetImagePicker = (existingUrl: string = '') => {
    setImageFile(null);
    setImagePreview(null);
    setCurrentImageUrl(existingUrl);
  };

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // cho phép chọn/chụp lại đúng ảnh vừa rồi
    if (!file) return;

    if (!INPUT_IMAGE_TYPES.includes(file.type)) {
      alert('Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF!');
      return;
    }

    setIsProcessingImage(true);
    try {
      // Thu nhỏ + nén trước khi upload (ảnh chụp điện thoại thường rất nặng)
      let processed = file;
      try {
        processed = await compressImage(file);
      } catch {
        // Không đọc được (vd HEIC trên trình duyệt không hỗ trợ): chỉ dùng tiếp nếu backend nhận được định dạng gốc
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          alert('Không đọc được định dạng ảnh này. Hãy chọn ảnh JPG hoặc PNG!');
          return;
        }
      }

      if (processed.size > MAX_IMAGE_SIZE) {
        alert('Ảnh vượt quá 5MB, vui lòng chọn ảnh nhỏ hơn!');
        return;
      }
      setImageFile(processed);
      setImagePreview(URL.createObjectURL(processed));
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Ưu tiên ảnh vừa chọn, nếu chưa có thì dùng ảnh đã lưu trên server
  const displayedImage = imagePreview ?? (currentImageUrl ? AxiosClient.resolveUrl(currentImageUrl) : null);

  const closeModal = () => {
    setIsModalOpen(false);
    resetImagePicker();
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // --- TÌM KIẾM REALTIME (lọc trực tiếp trên bảng, không dropdown) ---
  // useDeferredValue: ô nhập luôn phản hồi tức thì, việc lọc bảng được ưu tiên thấp hơn
  const deferredKeyword = useDeferredValue(searchKeyword);
  const search = useMemo(() => createSearch(deferredKeyword, searchField), [deferredKeyword, searchField]);
  const filteredAssets = useMemo(() => filterAssets(assets, search), [assets, search]);
  const isSearching = isActive(search);

  // Bỏ chọn các dòng đã bị lọc ẩn đi, tránh việc Edit/Xóa nhầm tài sản không còn nhìn thấy
  useEffect(() => {
    const visible = new Set(filteredAssets.map(a => a.id));
    setSelectedAssetIds(prev => {
      const next = prev.filter(id => visible.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [filteredAssets]);

  const fetchAssets = () => {
    setIsLoading(true);
    AssetService.getAssets()
      .then((data) => {
        setAssets(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi tải danh sách tài sản:', err);
        setIsLoading(false);
      });
  };

  const handleToggleSelectRow = (id: string) => {
    if (selectedAssetIds.includes(id)) {
      setSelectedAssetIds(selectedAssetIds.filter(item => item !== id));
    } else {
      setSelectedAssetIds([...selectedAssetIds, id]);
    }
  };

  const allVisibleSelected =
    filteredAssets.length > 0 && filteredAssets.every(item => selectedAssetIds.includes(item.id));

  const handleToggleSelectAll = () => {
    setSelectedAssetIds(allVisibleSelected ? [] : filteredAssets.map(item => item.id));
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({
      itAssetCode: 'VN-' + Math.floor(10000 + Math.random() * 90000),
      hostname: '',
      category: '',
      product: '',
      productionLine: '',
      financeAssetCode: '',
      poInvoice: '',
      serialNumber: '',
      macAddressWireless: '',
      macAddressLan: '',
      ipAddress: '',
      computerDescription: '',
      assetStatus: 'In Stock',
      staffCode: '',
      assignedTo: '',
      mailUser: '',
      department: '0',
      purchaseDate: '',
      managedBy: 'Johnny Anh',
      managedByGroup: 'Asia - Vietnam',
      note: '',
    });
    resetImagePicker();
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (selectedAssetIds.length === 0) {
      alert('Vui lòng tích chọn một tài sản trong bảng cần chỉnh sửa!');
      return;
    }
    const targetId = selectedAssetIds[0];
    const targetAsset = assets.find((item) => item.id === targetId);
    if (targetAsset) {
      setModalMode('edit');
      setFormData({
        itAssetCode: targetAsset.itAssetCode || '',
        hostname: targetAsset.hostname || '',
        category: targetAsset.category || '',
        product: targetAsset.product || '',
        productionLine: targetAsset.productionLine || '',
        financeAssetCode: targetAsset.financeAssetCode || '',
        poInvoice: targetAsset.poInvoice || '',
        serialNumber: targetAsset.serialNumber || '',
        macAddressWireless: targetAsset.macAddressWireless || '',
        macAddressLan: targetAsset.macAddressLan || '',
        ipAddress: targetAsset.ipAddress || '',
        computerDescription: targetAsset.computerDescription || '',
        assetStatus: targetAsset.assetStatus || 'In Stock',
        staffCode: targetAsset.staffCode || '',
        assignedTo: targetAsset.assignedTo || '',
        mailUser: targetAsset.mailUser || '',
        department: targetAsset.department || '0',
        purchaseDate: targetAsset.purchaseDate || '',
        managedBy: targetAsset.managedBy || 'Johnny Anh',
        managedByGroup: targetAsset.managedByGroup || 'Asia - Vietnam',
        note: targetAsset.note || '',
      });
      resetImagePicker(targetAsset.imageUrl || '');
      setIsModalOpen(true);
    }
  };

  // --- HÀM XỬ LÝ XÓA / THANH LÝ TÀI SẢN (ASSET LIQUIDATION) ---
  const handleLiquidation = async () => {
    if (selectedAssetIds.length === 0) {
      alert('Vui lòng tích chọn ít nhất một tài sản cần thanh lý/xóa!');
      return;
    }

    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn thanh lý (xóa) ${selectedAssetIds.length} tài sản đã chọn không?`);
    if (confirmDelete) {
      try {
        await AssetService.deleteAssets(selectedAssetIds);
        // Cập nhật lại giao diện sau khi Backend đã xóa thành công
        setAssets(assets.filter(item => !selectedAssetIds.includes(item.id)));
        setSelectedAssetIds([]);
        alert('Đã xóa thành công trên hệ thống!');
      } catch (error) {
        console.error('Lỗi khi xóa tài sản:', error);
        alert('Không thể xóa tài sản, vui lòng thử lại!');
    }
    }
  };

  // --- XỬ LÝ LƯU (CREATE / EDIT) QUA BACKEND ---
  // Dữ liệu và hình ảnh gửi trong CÙNG một request nên không bao giờ bị lệch nhau.
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (modalMode === 'create') {
        const created = await AssetService.createAsset(formData, imageFile);
        setAssets([created, ...assets]);
      } else {
        const targetId = selectedAssetIds[0];
        const updated = await AssetService.updateAsset(targetId, formData, imageFile);
        setAssets(assets.map((item) => (item.id === targetId ? updated : item)));
      }
      closeModal();
      alert('Lưu dữ liệu thành công!');
    } catch (error) {
      console.error('Lỗi khi lưu tài sản:', error);
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu dữ liệu vào Backend.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 font-sans position-relative">
      <Header onLogout={onLogout} activeTab="assets" onTabChange={onTabChange} />

      <main className="container-fluid px-4 py-4">
        {/* 1. KHU VỰC THANH CÔNG CỤ */}
        <div className="card border-0 shadow-sm p-3 mb-3 bg-white rounded-3">
          <div className="text-secondary small fw-bold mb-2">Thao tác</div>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <button onClick={handleOpenCreate} className="btn btn-success btn-sm d-flex align-items-center gap-1 fw-bold px-3 py-2 rounded-2">
              ➕ Create New
            </button>
            <button onClick={handleOpenEdit} className="btn btn-primary btn-sm d-flex align-items-center gap-1 fw-bold px-3 py-2 rounded-2">
              ✏️ Edit
            </button>
            <button className="btn btn-secondary btn-sm d-flex align-items-center gap-1 fw-bold px-3 py-2 rounded-2 text-white" style={{ backgroundColor: '#9C88EB' }}>
              📜 History
            </button>
            <button className="btn btn-warning btn-sm d-flex align-items-center gap-1 fw-bold px-3 py-2 rounded-2 text-dark" style={{ backgroundColor: '#FAD390' }}>
              🖨️ In mã tài sản
            </button>
            <button className="btn btn-success btn-sm d-flex align-items-center gap-1 fw-bold px-3 py-2 rounded-2" style={{ backgroundColor: '#20bf6b' }}>
              🤝 Bàn giao
            </button>
            <button className="btn btn-danger btn-sm d-flex align-items-center gap-1 fw-bold px-3 py-2 rounded-2" style={{ backgroundColor: '#eb3b5a' }}>
              🔄 Thu hồi
            </button>
            <button className="btn btn-info btn-sm d-flex align-items-center gap-1 fw-bold px-3 py-2 rounded-2 text-white" style={{ backgroundColor: '#0fb9b1' }}>
              ☁️ Sync to Freshservice
            </button>
            <button className="btn btn-primary btn-sm d-flex align-items-center gap-1 fw-bold px-3 py-2 rounded-2" style={{ backgroundColor: '#4b7bec' }}>
              📊 Xuất nhập dữ liệu
            </button>
            {/* Nút Asset Liquidation thực hiện chức năng Xóa */}
            <button 
              onClick={handleLiquidation} 
              className="btn btn-danger btn-sm d-flex align-items-center gap-1 fw-bold px-3 py-2 rounded-2" 
              style={{ backgroundColor: '#fc5c65' }}
            >
              🗑️ Asset Liquidation
            </button>
          </div>
        </div>

        {/* 2. Bộ lọc tìm kiếm */}
        <div className="card border-0 shadow-sm p-3 mb-3 bg-white rounded-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-3">
              <select className="form-select form-select-sm fw-bold bg-light text-dark" value={searchField} onChange={(e) => setSearchField(e.target.value)}>
                {Object.keys(SEARCH_SCOPES).map(label => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <div className="position-relative">
                <input
                  type="search"
                  className="form-control form-control-sm pe-4"
                  placeholder="Gõ để tìm: laptop, vn1, dell..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Escape') setSearchKeyword(''); }}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>
            <div className="col-6 col-md-2">
              <input type="date" className="form-control form-control-sm" />
            </div>
            <span className="col-auto text-muted text-center d-none d-md-block">→</span>
            <div className="col-6 col-md-2">
              <input type="date" className="form-control form-control-sm" />
            </div>
            <div className="col-12 col-md-auto d-flex gap-2">
              <button className="btn btn-primary btn-sm px-3 fw-bold">🔍 Lọc</button>
              <button className="btn btn-secondary btn-sm px-3 fw-bold" style={{ backgroundColor: '#718093' }} onClick={() => setSearchKeyword('')}>🧹 Xóa lọc</button>
            </div>
          </div>
          {isSearching && (
            <div className="small text-muted mt-2" role="status" aria-live="polite">
              Tìm thấy <strong className="text-dark">{filteredAssets.length}</strong> / {assets.length} tài sản
              {' '}khớp “<strong className="text-dark">{deferredKeyword.trim()}</strong>”
            </div>
          )}
        </div>

        {/* 3. Tùy chỉnh cột */}
        <div className="mb-3 d-flex align-items-center gap-2">
          <button className="btn btn-primary btn-sm d-flex align-items-center gap-1 fw-bold px-3 py-1 shadow-sm" onClick={() => alert('Tính năng tùy chỉnh ẩn/hiện cột đang được phát triển!')}>
            👁️ Hiển thị cột
          </button>
          <span className="text-muted small fw-semibold">(Đang hiển thị đầy đủ thông tin)</span>
        </div>

        {/* 4. Bảng dữ liệu */}
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
          <div className="table-responsive" style={{ maxHeight: '600px' }}>
            <table className="table table-hover table-bordered align-middle mb-0 text-nowrap" style={{ fontSize: '13px' }}>
              <thead className="table-light text-secondary text-uppercase fs-7" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ width: '40px' }} className="text-center">
                    <input type="checkbox" className="form-check-input" checked={allVisibleSelected} onChange={handleToggleSelectAll} />
                  </th>
                  <th>IT ASSET-CODE</th>
                  <th>Hostname</th>
                  <th>Category</th>
                  <th>Product</th>
                  <th>Production Line</th>
                  <th>Finance Asset Code</th>
                  <th>PO/Invoice</th>
                  <th>Serial Number</th>
                  <th>MAC Address (Wireless)</th>
                  <th>MAC Address (LAN)</th>
                  <th>IP Address</th>
                  <th>Computer Description</th>
                  <th>Asset Status</th>
                  <th>Staff Code</th>
                  <th>Assigned To</th>
                  <th>Mail User</th>
                  <th>Department</th>
                  <th>Managed By</th>
                  <th>Managed By Group</th>
                  <th>Purchase Date</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={22} className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-success" role="status"></div> Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={22} className="text-center py-4 text-muted">
                      {isSearching
                        ? <>Không tìm thấy tài sản nào khớp “{deferredKeyword.trim()}”.</>
                        : 'Không có dữ liệu tài sản nào.'}
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((item) => {
                    const isSelected = selectedAssetIds.includes(item.id);
                    return (
                      <tr key={item.id} onClick={() => handleToggleSelectRow(item.id)} className={isSelected ? 'table-active' : ''} style={{ cursor: 'pointer' }}>
                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected} onChange={() => handleToggleSelectRow(item.id)} className="form-check-input" />
                        </td>
                        <td className="fw-bold text-primary">{item.itAssetCode}</td>
                        <td>{item.hostname}</td>
                        <td>{item.category}</td>
                        <td>{item.product}</td>
                        <td>{item.productionLine}</td>
                        <td>{item.financeAssetCode}</td>
                        <td>{item.poInvoice}</td>
                        <td>{item.serialNumber}</td>
                        <td>{item.macAddressWireless}</td>
                        <td>{item.macAddressLan}</td>
                        <td>{item.ipAddress}</td>
                        <td className="text-wrap" style={{ minWidth: '220px' }}>{item.computerDescription}</td>
                        <td>
                          <span className={`badge fw-bold px-2 py-1 ${
                            item.assetStatus === 'In Use' ? 'bg-success' :
                            item.assetStatus === 'In Stock' ? 'bg-warning text-dark' :
                            item.assetStatus === 'Damaged' ? 'bg-danger' :
                            item.assetStatus === 'Backup' ? 'bg-primary' : 'bg-secondary'
                          }`}>
                            {item.assetStatus}
                          </span>
                        </td>
                        <td>{item.staffCode}</td>
                        <td>{item.assignedTo || '-'}</td>
                        <td>{item.mailUser || '-'}</td>
                        <td>{item.department || '-'}</td>
                        <td>{item.managedBy || '-'}</td>
                        <td>{item.managedByGroup || '-'}</td>
                        <td>{item.purchaseDate || '-'}</td>
                        <td className="text-wrap" style={{ minWidth: '150px' }}>{item.note || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* --- MODAL CREATE / EDIT --- */}
      {isModalOpen && (
        <div className="modal show d-block fade" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow-lg rounded-4 p-4">
              <div className="text-center border-bottom pb-3 mb-3 position-relative">
                <h3 className="fs-5 fw-bold text-dark m-0">
                  {modalMode === 'create' ? 'Add New Asset' : 'Edit Asset'}
                </h3>
                <button type="button" className="btn-close position-absolute top-0 end-0" onClick={closeModal}></button>
              </div>

              <form onSubmit={handleSaveForm}>
                {/* Hình ảnh tài sản: 1 khung ảnh lớn + nút bút chì để đổi ảnh */}
                <div className="d-flex justify-content-center mb-4">
                  <div className="position-relative" style={{ width: '100%', maxWidth: '380px' }}>
                    <div
                      className="border rounded-4 bg-light d-flex align-items-center justify-content-center overflow-hidden"
                      style={{ width: '100%', height: '260px' }}
                    >
                      {displayedImage ? (
                        <img
                          src={displayedImage}
                          alt={formData.itAssetCode || 'Asset'}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <div className="text-center text-muted">
                          <div style={{ fontSize: '64px', lineHeight: 1 }}>🖼️</div>
                          <div className="small mt-2">Chưa có hình ảnh</div>
                        </div>
                      )}
                    </div>

                    {isProcessingImage && (
                      <div
                        className="position-absolute top-0 start-0 w-100 d-flex align-items-center justify-content-center rounded-4 bg-white bg-opacity-75"
                        style={{ height: '260px' }}
                      >
                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                        <span className="small fw-bold">Đang xử lý ảnh...</span>
                      </div>
                    )}

                    {/* Nút bút chì: chọn ảnh từ thư viện / tệp */}
                    <button
                      type="button"
                      className="btn btn-primary rounded-circle shadow d-flex align-items-center justify-content-center position-absolute"
                      style={{ width: '42px', height: '42px', bottom: '-12px', right: '-12px' }}
                      title="Chọn ảnh từ thư viện"
                      aria-label="Chọn ảnh từ thư viện"
                      disabled={isProcessingImage}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      ✏️
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={INPUT_IMAGE_TYPES.join(',')}
                      className="d-none"
                      onChange={handleImageSelected}
                    />

                    {/* Nút máy ảnh: chỉ hiện trên điện thoại / máy tính bảng, mở thẳng camera sau */}
                    {isTouchDevice && (
                      <>
                        <button
                          type="button"
                          className="btn btn-success rounded-circle shadow d-flex align-items-center justify-content-center position-absolute"
                          style={{ width: '42px', height: '42px', bottom: '-12px', right: '38px' }}
                          title="Chụp ảnh"
                          aria-label="Chụp ảnh"
                          disabled={isProcessingImage}
                          onClick={() => cameraInputRef.current?.click()}
                        >
                          📷
                        </button>
                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="d-none"
                          onChange={handleImageSelected}
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Asset Code</label>
                      <input type="text" className="form-control form-control-sm" value={formData.itAssetCode} onChange={(e) => setFormData({...formData, itAssetCode: e.target.value})} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Hostname</label>
                      <input type="text" className="form-control form-control-sm" value={formData.hostname} onChange={(e) => setFormData({...formData, hostname: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Device Type (Category)</label>
                      <select className="form-select form-select-sm" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        <option value="">-- Chọn loại thiết bị --</option>
                        <option value="Laptop">Laptop</option>
                        <option value="Monitor">Monitor</option>
                        <option value="Desktop">Desktop</option>
                        <option value="Network Device">Network Device</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Finance Code</label>
                      <input type="text" className="form-control form-control-sm" value={formData.financeAssetCode} onChange={(e) => setFormData({...formData, financeAssetCode: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Serial Number</label>
                      <input type="text" className="form-control form-control-sm" value={formData.serialNumber} onChange={(e) => setFormData({...formData, serialNumber: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Description</label>
                      <input type="text" className="form-control form-control-sm" value={formData.computerDescription} onChange={(e) => setFormData({...formData, computerDescription: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Product</label>
                      <input type="text" className="form-control form-control-sm" value={formData.product} onChange={(e) => setFormData({...formData, product: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">PO/Invoice</label>
                      <input type="text" className="form-control form-control-sm" value={formData.poInvoice} onChange={(e) => setFormData({...formData, poInvoice: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Status</label>
                      <select 
                        className="form-select form-select-sm" 
                        value={formData.assetStatus} 
                        onChange={(e) => setFormData({...formData, assetStatus: e.target.value as any})}
                      >
                        <option value="In Stock">In Stock</option>
                        <option value="In Use">In Use</option>
                        <option value="Damaged">Damaged</option>
                        <option value="Không xác định">Không xác định</option>
                        <option value="Write off">Write off</option>
                        <option value="Retired">Retired</option>
                        <option value="Backup">Backup</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Production Line</label>
                      <select className="form-select form-select-sm" value={formData.productionLine} onChange={(e) => setFormData({...formData, productionLine: e.target.value})}>
                        <option value="">-- Chọn Production Line --</option>
                        <option value="PS Production">PS Production</option>
                        <option value="ENG-PS-IDL">ENG-PS-IDL</option>
                        <option value="IE-IDL">IE-IDL</option>
                        <option value="FACILITY">FACILITY</option>
                        <option value="FINANCE">FINANCE</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Staff Code</label>
                      <input type="text" className="form-control form-control-sm" value={formData.staffCode} onChange={(e) => setFormData({...formData, staffCode: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Assigned To</label>
                      <input type="text" className="form-control form-control-sm" value={formData.assignedTo} onChange={(e) => setFormData({...formData, assignedTo: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Mail User</label>
                      <input type="email" className="form-control form-control-sm" value={formData.mailUser} onChange={(e) => setFormData({...formData, mailUser: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">MAC Address (Wireless)</label>
                      <input type="text" className="form-control form-control-sm" placeholder="AA:BB:CC:DD:EE:FF" value={formData.macAddressWireless} onChange={(e) => setFormData({...formData, macAddressWireless: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">MAC Address (LAN)</label>
                      <input type="text" className="form-control form-control-sm" placeholder="AA:BB:CC:DD:EE:FF" value={formData.macAddressLan} onChange={(e) => setFormData({...formData, macAddressLan: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">IP Address</label>
                      <input type="text" className="form-control form-control-sm" placeholder="192.168.1.10" value={formData.ipAddress} onChange={(e) => setFormData({...formData, ipAddress: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Department</label>
                      <select className="form-select form-select-sm" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                        <option value="0">0 - Mặc định</option>
                        <option value="PS Production">PS Production</option>
                        <option value="Engineering">Engineering</option>
                        <option value="FINANCE">FINANCE</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Purchase Date</label>
                      <input type="date" className="form-control form-control-sm" value={formData.purchaseDate} onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Managed By</label>
                      <input type="text" className="form-control form-control-sm" value={formData.managedBy} onChange={(e) => setFormData({...formData, managedBy: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Managed By Group</label>
                      <select className="form-select form-select-sm" value={formData.managedByGroup} onChange={(e) => setFormData({...formData, managedByGroup: e.target.value})}>
                        <option value="Asia - Vietnam">Asia - Vietnam</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Note</label>
                      <textarea className="form-control form-control-sm" rows={3} value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})}></textarea>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-center gap-3 mt-4 pt-3 border-top">
                  <button type="submit" className="btn btn-primary px-5 fw-bold rounded-pill" disabled={isSaving || isProcessingImage}>{isSaving ? 'Đang lưu...' : 'Save'}</button>
                  <button type="button" className="btn btn-secondary px-5 fw-bold rounded-pill" style={{ backgroundColor: '#6c757d' }} onClick={closeModal}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
