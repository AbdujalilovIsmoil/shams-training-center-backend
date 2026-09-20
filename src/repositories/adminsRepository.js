const pool = require("../config/db");

const findByUsername = async (username) => {
  const { rows } = await pool.query(
    "SELECT * FROM admins WHERE username = $1",
    [username]
  );

  return rows[0] || null;
};

const upsert = async (username, passwordHash, passwordEncrypted = null) => {
  const { rows } = await pool.query(
    `INSERT INTO admins (username, password_hash, password_encrypted)
     VALUES ($1, $2, $3)
     ON CONFLICT (username) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       password_encrypted = EXCLUDED.password_encrypted
     RETURNING *`,
    [username, passwordHash, passwordEncrypted]
  );

  return rows[0];
};

// Profil sahifasidan login/parolni o'zgartirish uchun — joriy username orqali
// topib, yangi username/parol bilan yangilaydi.
const updateCredentials = async (
  currentUsername,
  { username, passwordHash, passwordEncrypted }
) => {
  const { rows } = await pool.query(
    `UPDATE admins
     SET username = $1, password_hash = $2, password_encrypted = $3
     WHERE username = $4
     RETURNING *`,
    [username, passwordHash, passwordEncrypted, currentUsername]
  );

  return rows[0] || null;
};

module.exports = { findByUsername, upsert, updateCredentials };
