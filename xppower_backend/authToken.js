// xppower_backend/authToken.js
// Token đăng nhập có chữ ký HMAC-SHA256 (không cần thư viện ngoài) + middleware + giới hạn thử sai.
const crypto = require('crypto');

let SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  SECRET = crypto.randomBytes(32).toString('hex');
  console.warn('⚠️  Chưa đặt JWT_SECRET: dùng khóa ngẫu nhiên, mọi người sẽ phải đăng nhập lại mỗi lần restart server.');
}

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 giờ

const b64 = (buf) => Buffer.from(buf).toString('base64url');
const sign = (data) => crypto.createHmac('sha256', SECRET).update(data).digest('base64url');

function signToken(user) {
  const payload = b64(JSON.stringify({ u: user.username, r: user.role, exp: Date.now() + TOKEN_TTL_MS }));
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token) {
  if (typeof token !== 'string') return null;
  const [payload, sig, extra] = token.split('.');
  if (!payload || !sig || extra !== undefined) return null;

  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.u || typeof data.exp !== 'number' || data.exp < Date.now()) return null;
    return { username: data.u, role: data.r };
  } catch {
    return null;
  }
}

/** Bắt buộc đăng nhập: gắn req.user = { username, role } */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const user = header.startsWith('Bearer ') ? verifyToken(header.slice(7)) : null;
  if (!user) return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.' });
  req.user = user;
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
  next();
}

/** Giới hạn số lần thử sai theo khóa (vd "ip|username"), lưu trong RAM. */
function createLimiter({ max, windowMs }) {
  const hits = new Map(); // key -> { count, resetAt }
  const current = (key) => {
    const e = hits.get(key);
    if (e && e.resetAt <= Date.now()) { hits.delete(key); return null; }
    return e || null;
  };
  return {
    isBlocked: (key) => (current(key)?.count ?? 0) >= max,
    retryAfterSec: (key) => Math.max(1, Math.ceil(((current(key)?.resetAt ?? Date.now()) - Date.now()) / 1000)),
    fail: (key) => {
      const e = current(key);
      if (e) e.count += 1; else hits.set(key, { count: 1, resetAt: Date.now() + windowMs });
    },
    reset: (key) => hits.delete(key),
  };
}

/** So sánh chuỗi không lộ thời gian xử lý */
function safeEqual(a, b) {
  const x = Buffer.from(String(a ?? ''));
  const y = Buffer.from(String(b ?? ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

module.exports = { signToken, verifyToken, requireAuth, requireAdmin, createLimiter, safeEqual };