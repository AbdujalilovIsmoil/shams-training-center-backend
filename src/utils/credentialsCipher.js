const crypto = require("crypto");
const env = require("../config/env");

// Admin profil sahifasida joriy parolni inputda ko'rsatish uchun qaytarib
// ochiladigan (reversible) shifrlash — autentifikatsiya hali ham bcrypt hash
// orqali tekshiriladi, bu faqat "ko'rsatish" maqsadida ishlatiladi.
const ALGORITHM = "aes-256-gcm";
const SALT = "shams-admin-credentials";

const getKey = () => crypto.scryptSync(env.credentialsEncKey, SALT, 32);

const encrypt = (plainText) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(String(plainText), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
};

const decrypt = (payload) => {
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, 12);
  const authTag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8"
  );
};

module.exports = { encrypt, decrypt };
