require("dotenv").config();

const env = {
  port: Number(process.env.PORT) || 4000,
  corsOrigin: (process.env.CORS_ORIGIN || "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET || "dev_secret_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  // Admin profilida parolni "ko'rsatish" uchun qaytarib ochiladigan (reversible)
  // shifrlashda ishlatiladi. Alohida qiymat berilmasa JWT_SECRET'dan foydalaniladi.
  credentialsEncKey:
    process.env.CREDENTIALS_ENC_KEY ||
    process.env.JWT_SECRET ||
    "dev_secret_change_me",
  databaseUrl:
    process.env.DATABASE_URL || "postgresql://localhost:5432/shams_blog",
  // Faqat `npm run migrate` skripti admin foydalanuvchini shu login/parol bilan
  // (agar mavjud bo'lmasa) bazaga yozadi — login endi shu .env qiymatlari bilan
  // emas, `admins` jadvali bilan tekshiriladi.
  seedAdminUsername: process.env.ADMIN_USERNAME || "admin",
  seedAdminPassword: process.env.ADMIN_PASSWORD || "admin123",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
};

module.exports = env;
