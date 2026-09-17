const ApiError = require("../utils/ApiError");

// Oddiy xotiradagi rate-limit: bitta IP uchun belgilangan vaqt oynasida
// cheklangan sondagi so'rov. Autentifikatsiyasiz, tashqi to'lovli API'ga
// (masalan OpenAI) murojaat qiluvchi endpointlarni suiiste'moldan himoya qiladi.
const createRateLimiter = ({ windowMs, max }) => {
  const hits = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (now - entry.start > windowMs) hits.delete(key);
    }
  }, windowMs).unref();

  return (req, res, next) => {
    const key = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now - entry.start > windowMs) {
      hits.set(key, { start: now, count: 1 });
      return next();
    }

    if (entry.count >= max) {
      return next(
        new ApiError(429, "Juda ko'p so'rov yuborildi, birozdan so'ng qayta urinib ko'ring")
      );
    }

    entry.count += 1;
    return next();
  };
};

module.exports = createRateLimiter;
