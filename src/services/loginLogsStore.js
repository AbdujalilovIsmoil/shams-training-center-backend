const pool = require("../config/db");

const mapRow = (row) => ({
  id: row.id,
  username: row.username,
  ip: row.ip,
  city: row.city,
  country: row.country,
  userAgent: row.user_agent,
  createdAt: row.created_at,
});

const create = async ({ username, ip, city, country, userAgent }) => {
  const { rows } = await pool.query(
    `INSERT INTO login_logs (username, ip, city, country, user_agent)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [username, ip || null, city || null, country || null, userAgent || null]
  );

  return mapRow(rows[0]);
};

const getRecent = async (limit = 50) => {
  const { rows } = await pool.query(
    "SELECT * FROM login_logs ORDER BY created_at DESC LIMIT $1",
    [limit]
  );

  return rows.map(mapRow);
};

module.exports = { create, getRecent };
