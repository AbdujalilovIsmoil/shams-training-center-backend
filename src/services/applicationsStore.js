const pool = require("../config/db");

const mapRow = (row) => ({
  id: row.id,
  fullName: row.full_name,
  phoneNumber: row.phone_number,
  email: row.email || "",
  message: row.message || "",
  isRead: row.is_read,
  createdAt: row.created_at,
});

const getAll = async () => {
  const { rows } = await pool.query(
    "SELECT * FROM applications ORDER BY created_at DESC"
  );
  return rows.map(mapRow);
};

const getById = async (id) => {
  const { rows } = await pool.query(
    "SELECT * FROM applications WHERE id = $1",
    [id]
  );
  return rows[0] ? mapRow(rows[0]) : null;
};

const create = async (data) => {
  const id = `application_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const { rows } = await pool.query(
    `INSERT INTO applications (id, full_name, phone_number, email, message)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      id,
      data.fullName || "",
      data.phoneNumber || "",
      data.email || "",
      data.message || "",
    ]
  );

  return mapRow(rows[0]);
};

const setRead = async (id, isRead) => {
  const { rows } = await pool.query(
    `UPDATE applications SET is_read = $1 WHERE id = $2 RETURNING *`,
    [isRead, id]
  );
  return rows[0] ? mapRow(rows[0]) : null;
};

const remove = async (id) => {
  const { rowCount } = await pool.query(
    "DELETE FROM applications WHERE id = $1",
    [id]
  );
  return rowCount > 0;
};

module.exports = { getAll, getById, create, setRead, remove };
