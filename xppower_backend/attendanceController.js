// xppower_backend/attendanceController.js
// Chấm công bằng vân tay / Face ID trên điện thoại qua WebAuthn (passkey).
//
// Cách hoạt động: lúc đăng ký, điện thoại tạo cặp khóa trong chip bảo mật, khóa bí mật không bao giờ rời máy
// và chỉ dùng được sau khi quét vân tay. Mỗi lần chấm công server gửi một "thử thách" ngẫu nhiên, điện thoại
// ký bằng khóa bí mật sau khi xác thực vân tay, server kiểm chữ ký bằng khóa công khai đã lưu.
// Server không bao giờ nhận hay lưu dấu vân tay.
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const pool = require('./db');
const { createLimiter, safeEqual } = require('./authToken');

// --- Cấu hình (đặt bằng biến môi trường khi chạy thật) ---
// RP_ID: tên miền (không có https://, không có cổng). Passkey gắn chặt với tên miền này:
//        đổi tên miền thì mọi người phải đăng ký lại vân tay.
// WEBAUTHN_ORIGINS: các địa chỉ đầy đủ mà web được mở, cách nhau bằng dấu phẩy.
const RP_ID = process.env.RP_ID || 'localhost';
const RP_NAME = process.env.RP_NAME || 'XP Power Asset Management';
const ORIGINS = (process.env.WEBAUTHN_ORIGINS || 'http://localhost:5173,http://localhost:8080')
  .split(',').map((s) => s.trim()).filter(Boolean);

const TZ = process.env.APP_TZ || 'Asia/Ho_Chi_Minh';
const MAX_DEVICES = 2;              // số điện thoại tối đa mỗi người
const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const MIN_GAP_SECONDS = 120;        // chống bấm đúp: 2 lần chấm phải cách nhau tối thiểu 2 phút

// Giới hạn vị trí (tuỳ chọn): đặt cả 3 biến để bật. Để trống = không kiểm tra vị trí.
const OFFICE_LAT = parseFloat(process.env.OFFICE_LAT);
const OFFICE_LNG = parseFloat(process.env.OFFICE_LNG);
const OFFICE_RADIUS_M = parseFloat(process.env.OFFICE_RADIUS_M);
const LOCATION_REQUIRED = [OFFICE_LAT, OFFICE_LNG, OFFICE_RADIUS_M].every(Number.isFinite);
const MAX_GPS_ACCURACY_M = 200;

// Thử thách đang chờ (RAM, đủ cho 1 server; chạy nhiều server thì chuyển sang DB/Redis)
const challenges = new Map(); // `${kind}:${username}` -> { challenge, expires }
const passwordLimiter = createLimiter({ max: 5, windowMs: 15 * 60 * 1000 });

const saveChallenge = (kind, username, challenge) =>
  challenges.set(`${kind}:${username}`, { challenge, expires: Date.now() + CHALLENGE_TTL_MS });

/** Lấy rồi xóa ngay (mỗi thử thách chỉ dùng được một lần) */
const takeChallenge = (kind, username) => {
  const key = `${kind}:${username}`;
  const c = challenges.get(key);
  challenges.delete(key);
  return c && c.expires > Date.now() ? c.challenge : null;
};

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of challenges) if (v.expires <= now) challenges.delete(k);
}, 60 * 1000).unref();

const getActiveUser = async (username) => {
  const { rows } = await pool.query("SELECT username, full_name, password_hash FROM users WHERE username = $1 AND status = 'Hoạt động'", [username]);
  return rows[0] || null;
};

const getCredentials = async (username) => {
  const { rows } = await pool.query('SELECT * FROM passkey_credentials WHERE username = $1 ORDER BY id', [username]);
  return rows;
};

const haversineMeters = (lat1, lon1, lat2, lon2) => {
  const rad = (d) => (d * Math.PI) / 180;
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const fail = (res, status, message) => res.status(status).json({ message });

// GET /api/v1/attendance/status
exports.getStatus = async (req, res) => {
  try {
    const creds = await getCredentials(req.user.username);
    res.json({ registered: creds.length > 0, deviceCount: creds.length, maxDevices: MAX_DEVICES, requireLocation: LOCATION_REQUIRED });
  } catch (err) {
    console.error('Lỗi trạng thái chấm công:', err);
    fail(res, 500, 'Không thể kiểm tra trạng thái vân tay.');
  }
};

// POST /api/v1/attendance/passkey/register/options   { password }
// Bắt buộc nhập lại mật khẩu: chỉ có token đăng nhập thì chưa đủ để gắn vân tay mới vào tài khoản.
exports.registerOptions = async (req, res) => {
  const { username } = req.user;
  const password = (req.body || {}).password;
  const limitKey = `reg|${username}`;
  try {
    if (passwordLimiter.isBlocked(limitKey)) {
      return fail(res, 429, `Nhập sai mật khẩu quá nhiều lần. Thử lại sau ${Math.ceil(passwordLimiter.retryAfterSec(limitKey) / 60)} phút.`);
    }
    const user = await getActiveUser(username);
    if (!user) return fail(res, 403, 'Tài khoản không hoạt động.');
    if (!password || !safeEqual(password, user.password_hash)) {
      passwordLimiter.fail(limitKey);
      return fail(res, 401, 'Mật khẩu không chính xác.');
    }
    passwordLimiter.reset(limitKey);

    const existing = await getCredentials(username);
    if (existing.length >= MAX_DEVICES) {
      return fail(res, 409, `Bạn đã đăng ký ${MAX_DEVICES} thiết bị. Nhờ quản trị viên xóa vân tay cũ nếu muốn đổi máy.`);
    }

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userName: username,
      userDisplayName: user.full_name || username,
      userID: new TextEncoder().encode(username),
      attestationType: 'none',
      excludeCredentials: existing.map((c) => ({ id: c.credential_id, transports: c.transports || undefined })),
      authenticatorSelection: { authenticatorAttachment: 'platform', residentKey: 'preferred', userVerification: 'required' },
    });
    saveChallenge('reg', username, options.challenge);
    res.json(options);
  } catch (err) {
    console.error('Lỗi tạo tùy chọn đăng ký vân tay:', err);
    fail(res, 500, 'Không thể bắt đầu đăng ký vân tay.');
  }
};

// POST /api/v1/attendance/passkey/register/verify   { response, deviceLabel? }
exports.registerVerify = async (req, res) => {
  const { username } = req.user;
  const { response, deviceLabel } = req.body || {};
  const expectedChallenge = takeChallenge('reg', username);
  if (!expectedChallenge) return fail(res, 400, 'Phiên đăng ký đã hết hạn. Vui lòng thử lại.');
  if (!response) return fail(res, 400, 'Thiếu dữ liệu xác thực.');

  try {
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: ORIGINS,
      expectedRPID: RP_ID,
      requireUserVerification: true,
    });
    if (!verification.verified || !verification.registrationInfo) return fail(res, 400, 'Không xác thực được vân tay.');

    const { credential } = verification.registrationInfo;
    const count = (await getCredentials(username)).length;
    if (count >= MAX_DEVICES) return fail(res, 409, `Bạn đã đăng ký ${MAX_DEVICES} thiết bị.`);

    const label = typeof deviceLabel === 'string' && deviceLabel.trim() ? deviceLabel.trim().slice(0, 100) : (req.headers['user-agent'] || 'Thiết bị').slice(0, 100);
    await pool.query(
      `INSERT INTO passkey_credentials (username, credential_id, public_key, counter, transports, device_label)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [username, credential.id, Buffer.from(credential.publicKey).toString('base64url'), credential.counter, credential.transports || null, label],
    );
    res.status(201).json({ registered: true, deviceCount: count + 1 });
  } catch (err) {
    console.error('Lỗi xác thực đăng ký vân tay:', err);
    fail(res, 400, 'Đăng ký vân tay không thành công. Hãy kiểm tra bạn đang mở web bằng đúng địa chỉ HTTPS của công ty.');
  }
};

// POST /api/v1/attendance/punch/options
exports.punchOptions = async (req, res) => {
  const { username } = req.user;
  try {
    const user = await getActiveUser(username);
    if (!user) return fail(res, 403, 'Tài khoản không hoạt động.');
    const creds = await getCredentials(username);
    if (creds.length === 0) return fail(res, 409, 'Bạn chưa đăng ký vân tay để chấm công.');

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: 'required',
      allowCredentials: creds.map((c) => ({ id: c.credential_id, transports: c.transports || undefined })),
    });
    saveChallenge('punch', username, options.challenge);
    res.json(options);
  } catch (err) {
    console.error('Lỗi tạo thử thách chấm công:', err);
    fail(res, 500, 'Không thể bắt đầu chấm công.');
  }
};

// POST /api/v1/attendance/punch/verify   { response, location?: { lat, lng, accuracy } }
exports.punchVerify = async (req, res) => {
  const { username } = req.user;
  const { response, location } = req.body || {};
  const expectedChallenge = takeChallenge('punch', username);
  if (!expectedChallenge) return fail(res, 400, 'Phiên chấm công đã hết hạn. Vui lòng bấm chấm công lại.');
  if (!response || typeof response.id !== 'string') return fail(res, 400, 'Thiếu dữ liệu xác thực.');

  try {
    const user = await getActiveUser(username);
    if (!user) return fail(res, 403, 'Tài khoản không hoạt động.');

    // Chỉ chấp nhận khóa thuộc về CHÍNH người đang đăng nhập
    const { rows } = await pool.query('SELECT * FROM passkey_credentials WHERE username = $1 AND credential_id = $2', [username, response.id]);
    const cred = rows[0];
    if (!cred) return fail(res, 403, 'Vân tay này không thuộc tài khoản của bạn.');

    // Kiểm tra vị trí (nếu bật)
    let lat = null, lng = null, accuracy = null;
    if (LOCATION_REQUIRED) {
      lat = Number(location?.lat); lng = Number(location?.lng); accuracy = Number(location?.accuracy);
      if (![lat, lng].every(Number.isFinite) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return fail(res, 400, 'Cần bật định vị để chấm công.');
      }
      if (Number.isFinite(accuracy) && accuracy > MAX_GPS_ACCURACY_M) {
        return fail(res, 400, 'Tín hiệu GPS chưa đủ chính xác. Hãy ra chỗ thoáng hơn rồi thử lại.');
      }
      const dist = haversineMeters(lat, lng, OFFICE_LAT, OFFICE_LNG);
      if (dist > OFFICE_RADIUS_M) {
        return fail(res, 403, `Bạn đang cách công ty khoảng ${Math.round(dist)} m, ngoài phạm vi cho phép (${OFFICE_RADIUS_M} m).`);
      }
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: ORIGINS,
      expectedRPID: RP_ID,
      requireUserVerification: true,
      credential: {
        id: cred.credential_id,
        publicKey: new Uint8Array(Buffer.from(cred.public_key, 'base64url')),
        counter: Number(cred.counter),
        transports: cred.transports || undefined,
      },
    });
    if (!verification.verified) return fail(res, 401, 'Không xác thực được vân tay.');

    // Chống bấm đúp
    const last = await pool.query(
      `SELECT to_char(punched_at AT TIME ZONE $2, 'HH24:MI') AS t, EXTRACT(EPOCH FROM (now() - punched_at)) AS age
         FROM attendance_logs WHERE username = $1 ORDER BY punched_at DESC LIMIT 1`,
      [username, TZ],
    );
    if (last.rows[0] && Number(last.rows[0].age) < MIN_GAP_SECONDS) {
      return fail(res, 429, `Bạn vừa chấm công lúc ${last.rows[0].t}. Vui lòng đợi vài phút rồi chấm lại.`);
    }

    // Giờ luôn do SERVER quyết định (now()), không nhận giờ từ điện thoại
    const inserted = await pool.query(
      `INSERT INTO attendance_logs (username, method, latitude, longitude, accuracy_m, ip, user_agent)
       VALUES ($1,'passkey',$2,$3,$4,$5,$6)
       RETURNING to_char(punched_at AT TIME ZONE $7, 'HH24:MI') AS time,
                 to_char(punched_at AT TIME ZONE $7, 'YYYY-MM-DD') AS date`,
      [username, lat, lng, Number.isFinite(accuracy) ? accuracy : null, String(req.ip || '').slice(0, 64), String(req.headers['user-agent'] || '').slice(0, 300), TZ],
    );
    await pool.query('UPDATE passkey_credentials SET counter = $1, last_used_at = now() WHERE id = $2', [verification.authenticationInfo.newCounter, cred.id]);

    const { time, date } = inserted.rows[0];
    const count = await pool.query(
      `SELECT COUNT(*)::int AS n FROM attendance_logs WHERE username = $1 AND (punched_at AT TIME ZONE $2)::date = $3::date`,
      [username, TZ, date],
    );
    res.status(201).json({ type: count.rows[0].n === 1 ? 'in' : 'out', time, date });
  } catch (err) {
    console.error('Lỗi xác thực chấm công:', err);
    fail(res, 400, 'Chấm công không thành công. Vui lòng thử lại.');
  }
};

// DELETE /api/v1/attendance/passkeys/:username   (chỉ ADMIN) - xóa vân tay của một nhân viên để họ đăng ký lại
exports.resetPasskeys = async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM passkey_credentials WHERE username = $1', [req.params.username]);
    res.json({ deleted: r.rowCount });
  } catch (err) {
    console.error('Lỗi xóa vân tay:', err);
    fail(res, 500, 'Không thể xóa vân tay.');
  }
};

exports._config = { RP_ID, ORIGINS, LOCATION_REQUIRED };