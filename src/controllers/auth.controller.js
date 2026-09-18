const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const adminsRepository = require("../repositories/adminsRepository");
const loginLogsStore = require("../services/loginLogsStore");
const { lookupLocation } = require("../utils/geoLookup");

// Login javobini kutdirmaslik uchun IP->shahar aniqlash va bazaga yozish
// fonda bajariladi (login javobi shu tugashini kutmaydi).
const recordLoginAttempt = async (username, req) => {
  const ip = req.ip;
  const userAgent = req.headers["user-agent"] || "";
  const { city, country } = await lookupLocation(ip);

  await loginLogsStore.create({ username, ip, city, country, userAgent });
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

  const token = jwt.sign({ username: admin.username }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  recordLoginAttempt(admin.username, req).catch(() => {});

  res.json({
    success: true,
    data: { token, username: admin.username },
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { username: req.user.username } });
});

const getLoginLogs = asyncHandler(async (req, res) => {
  const logs = await loginLogsStore.getRecent(50);
  res.json({ success: true, data: logs });
});

module.exports = { login, me, getLoginLogs };
