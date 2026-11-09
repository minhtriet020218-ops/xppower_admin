import React, { useState } from 'react';

interface CanteenPageProps {
  onLogout?: () => void;
  onTabChange?: (tab: 'dashboard' | 'assets' | 'department') => void;
}

export const CanteenManagementPage: React.FC<CanteenPageProps> = () => {
  // State quản lý form tạo món ăn
  const [dishName, setDishName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Món mặn chính']);
  const [dishes, setDishes] = useState([
    { id: '1', name: 'bún xì dầu đậu hũ', categories: ['veggie_1'], status: 'ACTIVE' },
    { id: '2', name: 'canh rau đay', categories: ['soup'], status: 'ACTIVE' },
    { id: '3', name: 'chuối hột', categories: ['dessert'], status: 'ACTIVE' },
    { id: '4', name: 'gà chiên mắm', categories: ['meat_1', 'meat_2', 'meat_main'], status: 'ACTIVE' },
  ]);

  // State menu ngày + ca
  const [menuDate, setMenuDate] = useState('2026-07-11');
  const [menuShift, setMenuShift] = useState('ca HC (8:00)');
  const [mainDish, setMainDish] = useState('');
  const [note, setNote] = useState('');

  // State khách đăng ký
  const [guestName, setGuestName] = useState('');
  const [guestCompany, setGuestCompany] = useState('');
  const [guests, setGuests] = useState<any[]>([]);

  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;
    const newDish = {
      id: String(Date.now()),
      name: dishName,
      categories: selectedCategories,
      status: 'ACTIVE'
    };
    setDishes([newDish, ...dishes]);
    setDishName('');
    alert('Thêm món ăn thành công!');
  };

  const handleGuestBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      alert('Vui lòng nhập tên khách!');
      return;
    }
    const newBooking = { id: Date.now(), name: guestName, company: guestCompany, date: menuDate, shift: menuShift };
    setGuests([...guests, newBooking]);
    setGuestName('');
    setGuestCompany('');
    alert('Đăng ký cơm khách thành công!');
  };

  return (
    <div className="bg-light min-vh-100 font-sans">
      <main className="container-fluid px-4 py-4">
        <h2 className="fs-4 fw-bold text-dark mb-4">🍽️ Quản Lý Canteen (Căng tin)</h2>
        <div className="row g-4">
          {/* CỘT 1: Hạn chót đặt cơm & Xuất báo cáo */}
          <div className="col-12 col-xl-3 d-flex flex-column gap-4">
            {/* Hạn chót đặt cơm theo ca */}
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
              <h5 className="fs-6 fw-bold text-secondary mb-3">🕒 Hạn chót đặt cơm theo ca</h5>
              {[
                { name: 'ca HC', time: 'Start: 8:00 | End: 16:30' },
                { name: 'ca DL', time: 'Start: 8:00 | End: 17:00' },
                { name: 'Ca 1', time: 'Start: 6:00 | End: 14:00' },
                { name: 'Ca 2', time: 'Start: 14:00 | End: 22:00' },
                { name: 'Ca 3', time: 'Start: 22:00 | End: 6:00' }
              ].map((item, idx) => (
                <div key={idx} className="mb-3 pb-2 border-bottom">
                  <div className="fw-bold small text-dark">{item.name}</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>{item.time}</div>
                  <div className="d-flex align-items-center gap-2 mt-1">
                    <select className="form-select form-select-sm" defaultValue="2 giờ">
                      <option value="1 giờ">1 giờ</option>
                      <option value="2 giờ">2 giờ</option>
                      <option value="4 giờ">4 giờ</option>
                    </select>
                    <button className="btn btn-primary btn-sm px-3 fw-bold" style={{ fontSize: '12px' }}>Lưu</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Xuất báo cáo */}
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
              <h5 className="fs-6 fw-bold text-secondary mb-3">📊 Xuất báo cáo</h5>
              <div className="d-flex gap-3 mb-2 small fw-semibold">
                <label><input type="radio" name="reportType" defaultChecked /> Theo tuần</label>
                <label><input type="radio" name="reportType" /> Theo tháng</label>
              </div>
              <div className="mb-3">
                <label className="form-label small text-muted">Chọn ngày trong tuần</label>
                <input type="date" className="form-control form-control-sm" defaultValue="2026-07-11" />
              </div>
              <button className="btn btn-success btn-sm fw-bold w-100" style={{ backgroundColor: '#20bf6b' }} onClick={() => alert('Đang xuất file Excel báo cáo Canteen...')}>
                📥 Xuất Excel
              </button>
            </div>
          </div>

          {/* CỘT 2: Menu món ăn theo ngày + ca */}
          <div className="col-12 col-xl-5">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
              <h5 className="fs-6 fw-bold text-secondary mb-3">🍱 Menu món ăn (theo ngày + ca)</h5>
              
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Ngày</label>
                  <input type="date" className="form-control form-control-sm" value={menuDate} onChange={(e) => setMenuDate(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Ca</label>
                  <select className="form-select form-select-sm" value={menuShift} onChange={(e) => setMenuShift(e.target.value)}>
                    <option value="ca HC (8:00)">ca HC (8:00)</option>
                    <option value="Ca 1">Ca 1</option>
                    <option value="Ca 2">Ca 2</option>
                    <option value="Ca 3">Ca 3</option>
                  </select>
                </div>
              </div>

              {['🥩 Món mặn chính', '🍗 Món phụ 1', '🍤 Món phụ 2', '🥗 Món chay 1', '🍲 Món canh', '🍉 Tráng miệng'].map((label, index) => (
                <div className="mb-2" key={index}>
                  <label className="form-label small text-secondary fw-semibold">{label}</label>
                  <select className="form-select form-select-sm">
                    <option value="">-- Chọn món --</option>
                    {dishes.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
              ))}

              <div className="mb-3">
                <label className="form-label small text-secondary fw-semibold">Ghi chú thêm</label>
                <textarea className="form-control form-control-sm" rows={2} placeholder="Ví dụ: trái cây + rau ghém..." value={note} onChange={(e) => setNote(e.target.value)}></textarea>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-success btn-sm fw-bold px-4" style={{ backgroundColor: '#16a34a' }} onClick={() => alert('Đã lưu menu thành công!')}>
                  💾 Lưu menu
                </button>
                <button className="btn btn-secondary btn-sm fw-bold px-4">Tải lại</button>
              </div>
            </div>
          </div>

          {/* CỘT 3: Tạo món ăn & Đăng ký cơm khách */}
          <div className="col-12 col-xl-4 d-flex flex-column gap-4">
            {/* Tạo món ăn (Danh mục) */}
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
              <h5 className="fs-6 fw-bold text-secondary mb-3">🍳 Tạo món ăn (Danh mục)</h5>
              <form onSubmit={handleAddDish}>
                <div className="mb-2">
                  <label className="form-label small fw-bold">Tên món</label>
                  <input type="text" className="form-control form-control-sm" placeholder="VD: Gà chiên mắm / Bún bò..." value={dishName} onChange={(e) => setDishName(e.target.value)} required />
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-bold">Chọn nhóm món</label>
                  <div className="border rounded p-2 bg-light" style={{ maxHeight: '130px', overflowY: 'auto', fontSize: '12px' }}>
                    {['Món mặn chính', 'Món phụ 1', 'Món phụ 2', 'Món nước', 'Món chay 1', 'Món canh', 'Tráng miệng'].map((cat, idx) => (
                      <div key={idx} className="form-check">
                        <input className="form-check-input" type="checkbox" defaultChecked={idx === 0} id={`cat_${idx}`} />
                        <label className="form-check-label" htmlFor={`cat_${idx}`}>{cat}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-sm fw-bold w-100 mt-2" style={{ backgroundColor: '#0ea5e9' }}>
                  ➕ Thêm món
                </button>
              </form>

              {/* Danh sách món ăn mẫu */}
              <div className="mt-3" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {dishes.map(dish => (
                  <div key={dish.id} className="d-flex justify-content-between align-items-center border-bottom py-1 small">
                    <div>
                      <div className="fw-bold text-dark">{dish.name}</div>
                      <div className="text-muted" style={{ fontSize: '10px' }}>{dish.categories.join(', ')}</div>
                    </div>
                    <div className="d-flex gap-1">
                      <span className="badge bg-success" style={{ fontSize: '9px' }}>ACTIVE</span>
                      <button className="btn btn-outline-danger btn-sm py-0 px-1" style={{ fontSize: '10px' }} onClick={() => setDishes(dishes.filter(d => d.id !== dish.id))}>Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Đăng ký cơm cho khách */}
            <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
              <h5 className="fs-6 fw-bold text-secondary mb-3">👥 Đăng ký cơm cho khách</h5>
              <form onSubmit={handleGuestBooking}>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <input type="date" className="form-control form-control-sm" defaultValue="2026-07-11" />
                  </div>
                  <div className="col-6">
                    <select className="form-select form-select-sm">
                      <option>ca HC (8:00)</option>
                    </select>
                  </div>
                </div>
                <div className="mb-2">
                  <input type="text" className="form-control form-control-sm" placeholder="Tên khách (tuỳ chọn)" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                </div>
                <div className="mb-2">
                  <input type="text" className="form-control form-control-sm" placeholder="Công ty/đơn vị (tuỳ chọn)" value={guestCompany} onChange={(e) => setGuestCompany(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-success btn-sm fw-bold w-100" style={{ backgroundColor: '#16a34a' }}>
                  ✅ Đăng ký ({guests.length} khách)
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* PHẦN DƯỚI: Xem trước menu theo tuần */}
        <div className="card border-0 shadow-sm p-4 rounded-4 bg-white mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fs-6 fw-bold text-secondary m-0">📅 Xem trước menu theo tuần</h5>
            <span className="text-muted small">Bảng 7 ngày theo ca ăn • Dễ kiểm tra & đối chiếu</span>
          </div>
          <div className="row g-2 mb-3">
            <div className="col-md-3">
              <input type="date" className="form-control form-control-sm" defaultValue="2026-07-11" />
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm">
                <option>ca HC (8:00)</option>
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-primary btn-sm fw-bold px-4" style={{ backgroundColor: '#4b7bec' }}>Xem tuần</button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered text-center align-middle" style={{ fontSize: '12px' }}>
              <thead className="table-light">
                <tr>
                  <th>Loại món / Ngày</th>
                  {['Thứ 2\n2026-11-02', 'Thứ 3\n2026-11-03', 'Thứ 4\n2026-11-04', 'Thứ 5\n2026-11-05', 'Thứ 6\n2026-11-06', 'Thứ 7\n2026-11-07', 'CN\n2026-11-08'].map((day, idx) => (
                    <th key={idx} style={{ whiteSpace: 'pre-line' }}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={8} className="text-center py-4 text-muted">
                    Tuần này chưa có menu nào cho ca đã chọn.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};