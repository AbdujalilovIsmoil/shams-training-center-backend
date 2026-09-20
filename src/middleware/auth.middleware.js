const jwt = require("jsonwebtoken");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const loginLogsStore = require("../services/loginLogsStore");

const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new ApiError(401, "Avtorizatsiyadan o'tilmagan"));
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return next(new ApiError(401, "Token yaroqsiz yoki muddati tugagan"));
  }

  try {
    // Eski (jti'siz) tokenlar bekor qilish imkoniyati kiritilishidan oldin
    // berilgan — ular muddati tugaguncha amal qiladi. Yangi tokenlar esa
    // "Kirish tarixi" orqali chiqarib yuborilgan (shu bilan jadvaldan
    // o'chirilgan) bo'lsa, shu yerda rad etiladi.
    if (payload.jti) {
      const session = await loginLogsStore.findByJti(payload.jti);
      if (!session) {
        return next(new ApiError(401, "Sessiya tugatilgan, qayta kiring"));
      }
    }

    req.user = payload;
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = requireAuth;
