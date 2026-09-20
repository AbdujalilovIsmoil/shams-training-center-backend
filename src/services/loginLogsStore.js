const pool = require("../config/db");
const { detectOS, detectBrowser } = require("../utils/deviceInfo");

const mapRow = (row) => ({
  id: row.id,
  username: row.username,
  ip: row.ip,
  city: row.city,
  country: row.country,
  userAgent: row.user_agent,
  os: detectOS(row.user_agent),
  browser: detectBrowser(row.user_agent),
  jti: row.jti,
  createdAt: row.created_at,
});

// Login paytida chaqiriladi — geo-joylashuv hali aniqlanmagan bo'ladi
// (u keyinroq setLocation orqali to'ldiriladi), lekin jti darhol yoziladi,
// aks holda shu tokenning birinchi so'rovi "sessiya topilmadi" deb rad etilib qolardi.
const create = async ({ username, ip, userAgent, jti }) => {
  const { rows } = await pool.query(
    `INSERT INTO login_logs (username, ip, user_agent, jti)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [username, ip || null, userAgent || null, jti]
  );

  return mapRow(rows[0]);
};

const setLocation = async (id, { city, country }) => {
  await pool.query(
    "UPDATE login_logs SET city = $1, country = $2 WHERE id = $3",
    [city || null, country || null, id]
  );
};

const findById = async (id) => {
  const { rows } = await pool.query("SELECT * FROM login_logs WHERE id = $1", [
    id,
  ]);

  return rows[0] ? mapRow(rows[0]) : null;
};

const findByJti = async (jti) => {
  const { rows } = await pool.query(
    "SELECT * FROM login_logs WHERE jti = $1",
    [jti]
  );

  return rows[0] ? mapRow(rows[0]) : null;
};

// Sessiyani chiqarib yuborish — qatorni "revoked" deb belgilash o'rniga
// jadvaldan butunlay o'chiradi: shu bois "Kirish tarixi" doim faqat hozir
// FAOL bo'lgan sessiyalarni ko'rsatadi, chiqarilganlar ro'yxatda qolmaydi.
const revoke = async (id) => {
  const { rows } = await pool.query(
    "DELETE FROM login_logs WHERE id = $1 RETURNING *",
    [id]
  );

  return rows[0] ? mapRow(rows[0]) : null;
};

const getRecent = async (limit = 50) => {
  const { rows } = await pool.query(
    "SELECT * FROM login_logs ORDER BY created_at DESC LIMIT $1",
    [limit]
  );

  return rows.map(mapRow);
};

// "Boshqalarni chiqarib yuborish" tugmasi bosilganda (yoki parol
// o'zgartirilganda) — joriy sessiyadan (jti) boshqa barcha qatorlar
// jadvaldan o'chiriladi, ular endi "Sessiyalar"da ko'rinmaydi.
const revokeAllExcept = async (username, exceptJti) => {
  await pool.query(
    `DELETE FROM login_logs
     WHERE username = $1 AND (jti IS NULL OR jti != $2)`,
    [username, exceptJti || null]
  );
};

// Har bir login'dan keyin chaqiriladi — bitta admin uchun bir vaqtda
// ko'pi bilan `maxSessions` ta sessiya faol bo'lishi kerak (masalan 3):
// eng yangi `maxSessions` ta qator (yangi kirgan qurilma shular ichida)
// qoldiriladi, undan ortiq — eng ESKI sessiyalar — jadvaldan o'chiriladi.
const enforceSessionLimit = async (username, maxSessions) => {
  await pool.query(
    `DELETE FROM login_logs
     WHERE id IN (
       SELECT id FROM login_logs
       WHERE username = $1
       ORDER BY created_at DESC
       OFFSET $2
     )`,
    [username, maxSessions]
  );
};

module.exports = {
  create,
  setLocation,
  findById,
  findByJti,
  revoke,
  getRecent,
  revokeAllExcept,
  enforceSessionLimit,
};
