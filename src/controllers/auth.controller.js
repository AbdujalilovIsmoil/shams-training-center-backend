const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const adminsRepository = require("../repositories/adminsRepository");

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

  res.json({
    success: true,
    data: { token, username: admin.username },
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { username: req.user.username } });
});

module.exports = { login, me };
