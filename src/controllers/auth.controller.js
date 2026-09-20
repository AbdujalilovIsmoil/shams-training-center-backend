const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const adminsRepository = require("../repositories/adminsRepository");
const loginLogsStore = require("../services/loginLogsStore");
const { lookupLocation } = require("../utils/geoLookup");
const credentialsCipher = require("../utils/credentialsCipher");

// Login javobini kutdirmaslik uchun IP->shahar aniqlash fonda bajariladi va
// log qatori keyinroq shu ma'lumot bilan to'ldiriladi (qator o'zi login
// javobidan oldin — sinxron — yoziladi, aks holda shu tokenning birinchi
// so'rovi requireAuth'da "sessiya topilmadi" deb rad etilib qolishi mumkin edi).
const fillLocationInBackground = async (logId, ip) => {
  const { city, country } = await lookupLocation(ip);
  await loginLogsStore.setLocation(logId, { city, country });
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

  // Bitta paytda faqat bitta qurilma/tizim (Windows, macOS, Linux va h.k.)
  // sessiyasi faol bo'lishi kerak — qaysi tizimdan (yangi kompyuter/brauzer)
  // kirilishidan qat'i nazar, shu tizim endi yagona faol sessiya bo'lib
  // qoladi, avvalgi barcha sessiyalar (boshqa tizimlardagilar ham) darhol
  // chiqarib yuboriladi.
  await loginLogsStore.revokeAllExcept(admin.username, jti);

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
  // 50 emas, 200 — negaki faqat "eng so'nggilar" emas, hozir faol bo'lgan
  // (revoke qilinmagan) barcha sessiyalar ro'yxatda ko'rinishi kerak,
  // shu jumladan boshqa qurilma/brauzerdan kirilganlari ham.
  const logs = await loginLogsStore.getRecent(200);
  res.json({ success: true, data: logs });
});

// Joriy sessiyadan boshqa barcha faol sessiyalarni bir zumda chiqarib
// yuborish uchun — "Kirish tarixi" sahifasidagi "Boshqalarni chiqarib
// yuborish" tugmasi shu yerga murojaat qiladi.
const revokeOtherSessions = asyncHandler(async (req, res) => {
  await loginLogsStore.revokeAllExcept(req.user.username, req.user.jti);
  const logs = await loginLogsStore.getRecent(200);
  res.json({ success: true, data: logs });
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

// Profil sahifasi uchun — admin o'zi kiritgan login va parolni ko'rishi.
// Parol bcrypt hash sifatida qaytarilmasdan, alohida qaytarib ochiladigan
// shifrlangan nusxadan (password_encrypted) o'qib ochiladi.
const getProfile = asyncHandler(async (req, res) => {
  const admin = await adminsRepository.findByUsername(req.user.username);

  if (!admin) {
    throw new ApiError(404, "Admin topilmadi");
  }

  let password = null;
  if (admin.password_encrypted) {
    try {
      password = credentialsCipher.decrypt(admin.password_encrypted);
    } catch {
      password = null;
    }
  }

  res.json({
    success: true,
    data: { username: admin.username, password },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { currentPassword, newUsername, newPassword } = req.body || {};

  if (!currentPassword) {
    throw new ApiError(400, "Joriy parolni kiriting");
  }

  const admin = await adminsRepository.findByUsername(req.user.username);
  const isCurrentValid =
    admin && bcrypt.compareSync(currentPassword, admin.password_hash);

  if (!admin || !isCurrentValid) {
    throw new ApiError(401, "Joriy parol noto'g'ri");
  }

  const nextUsername = (newUsername ?? admin.username).trim();
  const nextPassword = newPassword || currentPassword;

  if (!nextUsername) {
    throw new ApiError(400, "Login bo'sh bo'lishi mumkin emas");
  }

  if (nextPassword.length < 6) {
    throw new ApiError(400, "Parol kamida 6 belgidan iborat bo'lishi kerak");
  }

  if (nextUsername !== admin.username) {
    const existing = await adminsRepository.findByUsername(nextUsername);
    if (existing) {
      throw new ApiError(409, "Bu login band, boshqasini tanlang");
    }
  }

  const passwordHash = bcrypt.hashSync(nextPassword, 10);
  const passwordEncrypted = credentialsCipher.encrypt(nextPassword);

  const updated = await adminsRepository.updateCredentials(admin.username, {
    username: nextUsername,
    passwordHash,
    passwordEncrypted,
  });

  if (!updated) {
    throw new ApiError(500, "Ma'lumotlarni yangilab bo'lmadi");
  }

  if (nextUsername !== admin.username) {
    await loginLogsStore.renameUsername(admin.username, nextUsername);
  }

  // Xavfsizlik uchun boshqa barcha faol sessiyalar chiqarib yuboriladi —
  // joriy sessiya (shu so'rovni yuborayotgan brauzer) tegilmaydi.
  if (req.user.jti) {
    await loginLogsStore.revokeAllExcept(nextUsername, req.user.jti);
  }

  const token = jwt.sign(
    { username: nextUsername, jti: req.user.jti },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  res.json({
    success: true,
    data: { token, username: nextUsername },
  });
});

module.exports = {
  login,
  me,
  getLoginLogs,
  revokeLoginLog,
  revokeOtherSessions,
  getProfile,
  updateProfile,
};
