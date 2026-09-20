const pool = require("../config/db");

const findByUsername = async (username) => {
  const { rows } = await pool.query(
    "SELECT * FROM admins WHERE username = $1",
    [username]
  );

  return rows[0] || null;
};

const upsert = async (username, passwordHash) => {
  const { rows } = await pool.query(
    `INSERT INTO admins (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
     RETURNING *`,
    [username, passwordHash]
  );

  return rows[0];
};

module.exports = { findByUsername, upsert };
