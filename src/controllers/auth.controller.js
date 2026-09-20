const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const adminsRepository = require("../repositories/adminsRepository");
const loginLogsStore = require("../services/loginLogsStore");
const { lookupLocation } = require("../utils/geoLookup");

// Login javobini kutdirmaslik uchun IP->shahar aniqlash fonda bajariladi va
// log qatori keyinroq shu ma'lumot bilan to'ldiriladi (qator o'zi login
// javobidan oldin — sinxron — yoziladi, aks holda shu tokenning birinchi
// so'rovi requireAuth'da "sessiya topilmadi" deb rad etilib qolishi mumkin edi).
const fillLocationInBackground = async (logId, ip) => {
  const { city, country } = await lookupLocation(ip);
  await loginLogsStore.setLocation(logId, { city, country });
};

// "Kirish tarixi" ro'yxatida so'rovni yuborayotgan admin o'zining joriy
// sessiyasini birinchi bo'lib, undan keyin esa boshqalarni ko'rishi uchun.
const withCurrentFirst = (logs, currentJti) => {
  if (!currentJti) return logs;

  const current = [];
  const others = [];

  for (const log of logs) {
    (log.jti && log.jti === currentJti ? current : others).push(log);
  }

  return [...current, ...others];
};

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    throw new ApiError(400, "Login va parolni kiriting");
  }

  const admin = await adminsRepository.findByUsername(username);
  const isValidPassword =
    admin && bcrypt.compareSync(password, admin.password_hash);

  if (!admin || !isValidPassword) {
    throw new ApiError(401, "Login yoki parol noto'g'ri");
  }

  const jti = crypto.randomUUID();
  const ip = req.ip;
  const userAgent = req.headers["user-agent"] || "";

  const logEntry = await loginLogsStore.create({
    username: admin.username,
    ip,
    userAgent,
    jti,
  });

  // Bir vaqtda ko'pi bilan `env.maxActiveSessions` ta (standart: 3) sessiya
  // faol bo'lishi mumkin — qaysi tizimdan (Windows, macOS, Linux, Android,
  // iOS yoki boshqa) kirilishidan qat'i nazar. Shu chegaradan oshsa, eng
  // ESKI sessiya(lar) avtomatik chiqarib yuboriladi.
  await loginLogsStore.enforceSessionLimit(admin.username, env.maxActiveSessions);

  const token = jwt.sign({ username: admin.username, jti }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  fillLocationInBackground(logEntry.id, ip).catch(() => {});

  res.json({
    success: true,
    data: { token, username: admin.username },
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { username: req.user.username, jti: req.user.jti || null },
  });
});

const getLoginLogs = asyncHandler(async (req, res) => {
  // Jadvalda endi faqat hozir FAOL sessiyalar saqlanadi (chiqarilganlar
  // darhol o'chiriladi), shuning uchun limit ko'p bo'lishi shart emas —
  // 200 shunchaki katta yetarli chegara.
  const logs = await loginLogsStore.getRecent(200);
  res.json({ success: true, data: withCurrentFirst(logs, req.user.jti) });
});

// Joriy sessiyadan boshqa barcha faol sessiyalarni bir zumda chiqarib
// yuborish uchun — "Kirish tarixi" sahifasidagi "Boshqalarni chiqarib
// yuborish" tugmasi shu yerga murojaat qiladi.
const revokeOtherSessions = asyncHandler(async (req, res) => {
  await loginLogsStore.revokeAllExcept(req.user.username, req.user.jti);
  const logs = await loginLogsStore.getRecent(200);
  res.json({ success: true, data: withCurrentFirst(logs, req.user.jti) });
});

const revokeLoginLog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const found = await loginLogsStore.findById(id);

  if (!found) {
    throw new ApiError(404, "Yozuv topilmadi");
  }

  if (found.jti && found.jti === req.user.jti) {
    throw new ApiError(400, "O'zingizni chiqarib yubora olmaysiz");
  }

  const revoked = await loginLogsStore.revoke(id);

  if (!revoked) {
    throw new ApiError(409, "Bu sessiya allaqachon chiqarib yuborilgan");
  }

  res.json({ success: true, data: revoked });
});

module.exports = {
  login,
  me,
  getLoginLogs,
  revokeLoginLog,
  revokeOtherSessions,
};
