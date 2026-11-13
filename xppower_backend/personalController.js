// xppower_backend/personalController.js
// API Trang cá nhân: lịch chấm công, xin nghỉ, đổi ca, đặt cơm. Mọi route đã qua requireAuth (req.user).
const pool = require('./db');

const TZ = process.env.APP_TZ || 'Asia/Ho_Chi_Minh';
const SHIFTS = ['ca HC', 'ca DL', 'Ca 1', 'Ca 2', 'Ca 3'];
const DISHES = ['Món mặn', 'Món chay'];
const LEAVE_TYPES = ['Phép năm', 'Nghỉ ốm', 'Nghỉ việc riêng', 'Nghỉ không lương'];
const DURATIONS = ['Cả ngày', 'Nửa ngày sáng', 'Nửa ngày chiều'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEAVE_DAYS = 60;
const MAX_MEAL_DAYS = 31;
const MAX_MEAL_AHEAD_DAYS = 60;

/** Ngày hôm nay theo múi giờ công ty, dạng YYYY-MM-DD */
const todayKey = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());

const isDateKey = (s) =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;

const dayDiff = (from, to) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);

const bad = (res, message) => res.status(400).json({ message });

const optStr = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);

// ---------------------------------------------------------------- Hồ sơ & thiết bị của chính mình
// GET /api/v1/personal/me
exports.getMe = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.username, u.full_name, u.email, u.department, u.role,
              s.full_name AS staff_name, s.department AS staff_department, s.email AS staff_email, s.position, s.shift
         FROM users u LEFT JOIN staff s ON s.staff_code = u.username
        WHERE u.username = $1`,
      [req.user.username],
    );
    const r = rows[0];
    if (!r) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    res.json({
      username: r.username,
      fullName: r.staff_name || r.full_name || r.username,
      email: r.email || r.staff_email || '',
      department: r.staff_department || r.department || '-',
      position: r.position || '-',
      shift: r.shift || '-',
      role: r.role,
    });
  } catch (err) {
    console.error('Lỗi lấy hồ sơ cá nhân:', err);
    res.status(500).json({ message: 'Không thể tải hồ sơ cá nhân.' });
  }
};

const mapAsset = (r) => ({
  id: String(r.id),
  itAssetCode: r.it_asset_code,
  hostname: r.hostname,
  category: r.category,
  product: r.product,
  productionLine: r.production_line,
  financeAssetCode: r.finance_asset_code,
  poInvoice: r.po_invoice,
  serialNumber: r.serial_number,
  computerDescription: r.computer_description,
  assetStatus: r.asset_status,
  staffCode: r.staff_code,
  assignedTo: r.assigned_to,
  mailUser: r.mail_user,
  department: r.department,
  managedBy: r.managed_by,
  managedByGroup: r.managed_by_group,
  purchaseDate: r.purchase_date,
  note: r.note,
  imageUrl: r.image_url,
  macAddressWireless: r.mac_address_wireless,
  macAddressLan: r.mac_address_lan,
  ipAddress: r.ip_address,
});

// GET /api/v1/personal/assets -> { owned, managed }
exports.getMyAssets = async (req, res) => {
  try {
    const me = await pool.query('SELECT username, full_name, email FROM users WHERE username = $1', [req.user.username]);
    const u = me.rows[0];
    if (!u) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });

    const owned = await pool.query(
      `SELECT * FROM assets
        WHERE lower(staff_code) = lower($1) OR ($2 <> '' AND lower(mail_user) = lower($2))
        ORDER BY created_at DESC`,
      [u.username, u.email || ''],
    );
    const managed = await pool.query(
      `SELECT * FROM assets
        WHERE lower(managed_by) = lower($1) OR lower(managed_by) = lower($2)
        ORDER BY created_at DESC`,
      [u.username, u.full_name || u.username],
    );
    res.json({ owned: owned.rows.map(mapAsset), managed: managed.rows.map(mapAsset) });
  } catch (err) {
    console.error('Lỗi lấy thiết bị cá nhân:', err);
    res.status(500).json({ message: 'Không thể tải danh sách thiết bị.' });
  }
};

// ---------------------------------------------------------------- Chấm công (xem lịch)
// GET /api/v1/personal/attendance?month=YYYY-MM
// Giờ vào = lần quẹt đầu tiên trong ngày, giờ ra = lần quẹt cuối (chỉ khi có từ 2 lần quẹt).
exports.getAttendance = async (req, res) => {
  const month = String(req.query.month || '');
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return bad(res, 'Tháng không hợp lệ (định dạng YYYY-MM).');
  try {
    const { rows } = await pool.query(
      `SELECT to_char((punched_at AT TIME ZONE $1)::date, 'YYYY-MM-DD') AS date,
              to_char(MIN(punched_at AT TIME ZONE $1), 'HH24:MI') AS check_in,
              CASE WHEN COUNT(*) > 1 THEN to_char(MAX(punched_at AT TIME ZONE $1), 'HH24:MI') END AS check_out
         FROM attendance_logs
        WHERE username = $2
          AND (punched_at AT TIME ZONE $1) >= $3::date
          AND (punched_at AT TIME ZONE $1) < ($3::date + INTERVAL '1 month')
        GROUP BY 1
        ORDER BY 1`,
      [TZ, req.user.username, `${month}-01`],
    );
    res.json(rows.map((r) => ({ date: r.date, checkIn: r.check_in, checkOut: r.check_out })));
  } catch (err) {
    console.error('Lỗi lấy chấm công:', err);
    res.status(500).json({ message: 'Không thể tải dữ liệu chấm công.' });
  }
};

// ---------------------------------------------------------------- Nghỉ phép
const mapLeave = (r) => ({
  id: String(r.id),
  managerEmail: r.manager_email,
  leaderEmail: r.leader_email || undefined,
  supervisorEmail: r.supervisor_email || undefined,
  leaveType: r.leave_type,
  duration: r.duration,
  fromDate: r.from_date,
  toDate: r.to_date,
  reason: r.reason || undefined,
  status: r.status,
  createdAt: new Date(r.created_at).toISOString(),
});

const LEAVE_COLS = `id, manager_email, leader_email, supervisor_email, leave_type, duration,
  to_char(from_date, 'YYYY-MM-DD') AS from_date, to_char(to_date, 'YYYY-MM-DD') AS to_date, reason, status, created_at`;

exports.getLeaveRequests = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${LEAVE_COLS} FROM leave_requests WHERE username = $1 ORDER BY created_at DESC LIMIT 100`,
      [req.user.username],
    );
    res.json(rows.map(mapLeave));
  } catch (err) {
    console.error('Lỗi lấy đơn nghỉ phép:', err);
    res.status(500).json({ message: 'Không thể tải danh sách nghỉ phép.' });
  }
};

exports.createLeaveRequest = async (req, res) => {
  const b = req.body || {};
  const managerEmail = optStr(b.managerEmail);
  const leaderEmail = optStr(b.leaderEmail);
  const supervisorEmail = optStr(b.supervisorEmail);
  const reason = optStr(b.reason);

  if (!managerEmail || !EMAIL_REGEX.test(managerEmail) || managerEmail.length > 150) return bad(res, 'Email quản lý không hợp lệ.');
  if (leaderEmail && (!EMAIL_REGEX.test(leaderEmail) || leaderEmail.length > 150)) return bad(res, 'Email Leader không hợp lệ.');
  if (supervisorEmail && (!EMAIL_REGEX.test(supervisorEmail) || supervisorEmail.length > 150)) return bad(res, 'Email Supervisor không hợp lệ.');
  if (!LEAVE_TYPES.includes(b.leaveType)) return bad(res, 'Loại phép không hợp lệ.');
  if (!DURATIONS.includes(b.duration)) return bad(res, 'Thời gian nghỉ không hợp lệ.');
  if (!isDateKey(b.fromDate) || !isDateKey(b.toDate)) return bad(res, 'Ngày nghỉ không hợp lệ.');
  if (b.toDate < b.fromDate) return bad(res, 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.');
  if (b.fromDate < todayKey()) return bad(res, 'Không thể xin nghỉ cho ngày đã qua.');
  if (dayDiff(b.fromDate, b.toDate) + 1 > MAX_LEAVE_DAYS) return bad(res, `Mỗi đơn nghỉ tối đa ${MAX_LEAVE_DAYS} ngày.`);
  if (reason && reason.length > 300) return bad(res, 'Lý do tối đa 300 ký tự.');
  if (b.duration !== 'Cả ngày' && b.fromDate !== b.toDate) return bad(res, 'Nghỉ nửa ngày chỉ áp dụng cho một ngày duy nhất.');

  try {
    const overlap = await pool.query(
      `SELECT 1 FROM leave_requests
        WHERE username = $1 AND status <> 'Từ chối' AND from_date <= $3::date AND to_date >= $2::date LIMIT 1`,
      [req.user.username, b.fromDate, b.toDate],
    );
    if (overlap.rows.length > 0) return res.status(409).json({ message: 'Khoảng ngày này trùng với một đơn nghỉ khác của bạn.' });

    const { rows } = await pool.query(
      `INSERT INTO leave_requests (username, manager_email, leader_email, supervisor_email, leave_type, duration, from_date, to_date, reason)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING ${LEAVE_COLS}`,
      [req.user.username, managerEmail, leaderEmail, supervisorEmail, b.leaveType, b.duration, b.fromDate, b.toDate, reason],
    );
    res.status(201).json(mapLeave(rows[0]));
  } catch (err) {
    console.error('Lỗi tạo đơn nghỉ phép:', err);
    res.status(500).json({ message: 'Không thể gửi đơn nghỉ phép.' });
  }
};

// ---------------------------------------------------------------- Đổi ca
const mapShift = (r) => ({
  id: String(r.id),
  currentShift: r.current_shift,
  desiredShift: r.desired_shift,
  reason: r.reason,
  status: r.status,
  createdAt: new Date(r.created_at).toISOString(),
});

exports.getShiftChanges = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM shift_change_requests WHERE username = $1 ORDER BY created_at DESC LIMIT 100',
      [req.user.username],
    );
    res.json(rows.map(mapShift));
  } catch (err) {
    console.error('Lỗi lấy yêu cầu đổi ca:', err);
    res.status(500).json({ message: 'Không thể tải yêu cầu đổi ca.' });
  }
};

exports.createShiftChange = async (req, res) => {
  const b = req.body || {};
  const currentShift = optStr(b.currentShift);
  const reason = optStr(b.reason);

  if (!currentShift || currentShift.length > 50) return bad(res, 'Ca hiện tại không hợp lệ.');
  if (!SHIFTS.includes(b.desiredShift)) return bad(res, 'Ca muốn đổi không hợp lệ.');
  if (b.desiredShift === currentShift) return bad(res, 'Ca muốn đổi phải khác ca hiện tại.');
  if (!reason) return bad(res, 'Vui lòng nhập lý do đổi ca.');
  if (reason.length > 200) return bad(res, 'Lý do tối đa 200 ký tự.');

  try {
    const pending = await pool.query(
      `SELECT 1 FROM shift_change_requests WHERE username = $1 AND status = 'Chờ duyệt' LIMIT 1`,
      [req.user.username],
    );
    if (pending.rows.length > 0) return res.status(409).json({ message: 'Bạn đang có một yêu cầu đổi ca chờ duyệt.' });

    const { rows } = await pool.query(
      `INSERT INTO shift_change_requests (username, current_shift, desired_shift, reason)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.username, currentShift, b.desiredShift, reason],
    );
    res.status(201).json(mapShift(rows[0]));
  } catch (err) {
    console.error('Lỗi tạo yêu cầu đổi ca:', err);
    res.status(500).json({ message: 'Không thể gửi yêu cầu đổi ca.' });
  }
};

// ---------------------------------------------------------------- Đặt cơm
exports.getMealOrders = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, to_char(meal_date, 'YYYY-MM-DD') AS date, shift, dish, created_at
         FROM meal_orders
        WHERE username = $1 AND meal_date >= ($2::date - INTERVAL '30 days')
        ORDER BY meal_date DESC`,
      [req.user.username, todayKey()],
    );
    res.json(rows.map((r) => ({
      id: String(r.id),
      items: [{ date: r.date, shift: r.shift, dish: r.dish }],
      createdAt: new Date(r.created_at).toISOString(),
    })));
  } catch (err) {
    console.error('Lỗi lấy lịch sử đặt cơm:', err);
    res.status(500).json({ message: 'Không thể tải lịch sử đặt cơm.' });
  }
};

exports.createMealOrder = async (req, res) => {
  const items = (req.body || {}).items;
  if (!Array.isArray(items) || items.length === 0) return bad(res, 'Chưa có ngày nào để đặt cơm.');
  if (items.length > MAX_MEAL_DAYS) return bad(res, `Chỉ đặt tối đa ${MAX_MEAL_DAYS} ngày mỗi lần.`);

  const today = todayKey();
  const byDate = new Map(); // trùng ngày thì lấy mục cuối
  for (const it of items) {
    if (!it || !isDateKey(it.date)) return bad(res, 'Ngày đặt cơm không hợp lệ.');
    if (it.date < today) return bad(res, 'Không thể đặt cơm cho ngày đã qua.');
    if (dayDiff(today, it.date) > MAX_MEAL_AHEAD_DAYS) return bad(res, `Chỉ đặt trước tối đa ${MAX_MEAL_AHEAD_DAYS} ngày.`);
    if (!SHIFTS.includes(it.shift)) return bad(res, 'Ca ăn không hợp lệ.');
    if (!DISHES.includes(it.dish)) return bad(res, 'Món ăn không hợp lệ.');
    byDate.set(it.date, it);
  }
  const list = [...byDate.values()];

  try {
    const { rows } = await pool.query(
      `INSERT INTO meal_orders (username, meal_date, shift, dish)
       SELECT $1, t.d, t.s, t.x FROM unnest($2::date[], $3::text[], $4::text[]) AS t(d, s, x)
       ON CONFLICT (username, meal_date)
       DO UPDATE SET shift = EXCLUDED.shift, dish = EXCLUDED.dish, created_at = now()
       RETURNING id, to_char(meal_date, 'YYYY-MM-DD') AS date, shift, dish`,
      [req.user.username, list.map((i) => i.date), list.map((i) => i.shift), list.map((i) => i.dish)],
    );
    res.status(201).json({
      id: String(rows[0].id),
      items: rows.map((r) => ({ date: r.date, shift: r.shift, dish: r.dish })),
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Lỗi đặt cơm:', err);
    res.status(500).json({ message: 'Không thể đặt cơm.' });
  }
};

exports._test = { isDateKey, dayDiff, todayKey };