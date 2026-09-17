const pool = require("../config/db");

const LANGS = ["uz", "ru", "en", "ar"];

const emptyLangRecord = () =>
  LANGS.reduce((acc, lang) => {
    acc[lang] = "";
    return acc;
  }, {});

const clampRate = (value) => {
  const rate = Number(value);
  if (!Number.isFinite(rate)) return 5;
  return Math.min(5, Math.max(1, Math.round(rate)));
};

const mapRow = (row) => ({
  id: row.id,
  author: row.author,
  avatar: row.avatar || "",
  rate: row.rate,
  published: row.published,
  text: row.text,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getAll = async () => {
  const { rows } = await pool.query(
    "SELECT * FROM testimonials ORDER BY created_at DESC"
  );
  return rows.map(mapRow);
};

const getById = async (id) => {
  const { rows } = await pool.query(
    "SELECT * FROM testimonials WHERE id = $1",
    [id]
  );
  return rows[0] ? mapRow(rows[0]) : null;
};

const create = async (data) => {
  const id = `testimonial_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const { rows } = await pool.query(
    `INSERT INTO testimonials (id, author, avatar, rate, published, text)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      id,
      data.author || "",
      data.avatar || "",
      clampRate(data.rate),
      data.published !== false,
      JSON.stringify({ ...emptyLangRecord(), ...data.text }),
    ]
  );

  return mapRow(rows[0]);
};

const update = async (id, data) => {
  const existing = await getById(id);
  if (!existing) return null;

  const merged = {
    author: data.author ?? existing.author,
    avatar: data.avatar ?? existing.avatar,
    rate: data.rate !== undefined ? clampRate(data.rate) : existing.rate,
    published:
      data.published !== undefined ? data.published : existing.published,
    text: data.text ? { ...existing.text, ...data.text } : existing.text,
  };

  const { rows } = await pool.query(
    `UPDATE testimonials
     SET author = $1, avatar = $2, rate = $3, published = $4, text = $5, updated_at = now()
     WHERE id = $6
     RETURNING *`,
    [
      merged.author,
      merged.avatar,
      merged.rate,
      merged.published,
      JSON.stringify(merged.text),
      id,
    ]
  );

  return mapRow(rows[0]);
};

const remove = async (id) => {
  const { rowCount } = await pool.query(
    "DELETE FROM testimonials WHERE id = $1",
    [id]
  );
  return rowCount > 0;
};

module.exports = {
  LANGS,
  getAll,
  getById,
  create,
  update,
  remove,
};
