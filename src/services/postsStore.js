const pool = require("../config/db");

const LANGS = ["uz", "ru", "en", "ar"];

const emptyLangRecord = () =>
  LANGS.reduce((acc, lang) => {
    acc[lang] = "";
    return acc;
  }, {});

const toDateString = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};

const mapRow = (row) => ({
  id: row.id,
  slug: row.slug,
  images: Array.isArray(row.images) ? row.images : [],
  date: toDateString(row.date),
  readTime: row.read_time,
  published: row.published,
  views: Number(row.views) || 0,
  category: row.category,
  title: row.title,
  excerpt: row.excerpt,
  content: row.content,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getAll = async () => {
  const { rows } = await pool.query("SELECT * FROM posts ORDER BY date DESC, created_at DESC");
  return rows.map(mapRow);
};

const getById = async (id) => {
  const { rows } = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
  return rows[0] ? mapRow(rows[0]) : null;
};

const getBySlug = async (slug) => {
  const { rows } = await pool.query("SELECT * FROM posts WHERE slug = $1", [slug]);
  return rows[0] ? mapRow(rows[0]) : null;
};

// Client sayt bitta maqolani slug bo'yicha ochganda chaqiriladi — bir so'rovda
// ham hisoblaydi, ham eng so'nggi qatorni qaytaradi (race condition bo'lmasligi uchun).
const incrementViewsBySlug = async (slug) => {
  const { rows } = await pool.query(
    "UPDATE posts SET views = views + 1 WHERE slug = $1 RETURNING *",
    [slug]
  );
  return rows[0] ? mapRow(rows[0]) : null;
};

const isSlugTaken = async (slug, excludeId) => {
  const { rows } = await pool.query(
    "SELECT id FROM posts WHERE slug = $1 AND ($2::text IS NULL OR id != $2)",
    [slug, excludeId || null]
  );
  return rows.length > 0;
};

const create = async (data) => {
  const id = `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const { rows } = await pool.query(
    `INSERT INTO posts (id, slug, images, date, read_time, published, category, title, excerpt, content)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      id,
      data.slug,
      JSON.stringify(Array.isArray(data.images) ? data.images : []),
      data.date || new Date().toISOString().slice(0, 10),
      Number(data.readTime) || 1,
      data.published !== false,
      JSON.stringify({ ...emptyLangRecord(), ...data.category }),
      JSON.stringify({ ...emptyLangRecord(), ...data.title }),
      JSON.stringify({ ...emptyLangRecord(), ...data.excerpt }),
      JSON.stringify({ ...emptyLangRecord(), ...data.content }),
    ]
  );

  return mapRow(rows[0]);
};

const update = async (id, data) => {
  const existing = await getById(id);
  if (!existing) return null;

  const merged = {
    slug: data.slug ?? existing.slug,
    images: Array.isArray(data.images) ? data.images : existing.images,
    date: data.date ?? existing.date,
    readTime:
      data.readTime !== undefined ? Number(data.readTime) : existing.readTime,
    published:
      data.published !== undefined ? data.published : existing.published,
    category: data.category
      ? { ...existing.category, ...data.category }
      : existing.category,
    title: data.title ? { ...existing.title, ...data.title } : existing.title,
    excerpt: data.excerpt
      ? { ...existing.excerpt, ...data.excerpt }
      : existing.excerpt,
    content: data.content
      ? { ...existing.content, ...data.content }
      : existing.content,
  };

  const { rows } = await pool.query(
    `UPDATE posts
     SET slug = $1, images = $2, date = $3, read_time = $4, published = $5,
         category = $6, title = $7, excerpt = $8, content = $9, updated_at = now()
     WHERE id = $10
     RETURNING *`,
    [
      merged.slug,
      JSON.stringify(merged.images),
      merged.date,
      merged.readTime,
      merged.published,
      JSON.stringify(merged.category),
      JSON.stringify(merged.title),
      JSON.stringify(merged.excerpt),
      JSON.stringify(merged.content),
      id,
    ]
  );

  return mapRow(rows[0]);
};

const remove = async (id) => {
  const { rowCount } = await pool.query("DELETE FROM posts WHERE id = $1", [id]);
  return rowCount > 0;
};

module.exports = {
  LANGS,
  getAll,
  getById,
  getBySlug,
  isSlugTaken,
  incrementViewsBySlug,
  create,
  update,
  remove,
};
