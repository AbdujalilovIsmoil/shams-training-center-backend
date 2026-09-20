const pool = require("../config/db");

const mapItem = (row) => ({
  id: row.id,
  imageUrl: row.image_url,
  linkUrl: row.link_url,
  durationSeconds: row.duration_seconds,
  isEnabled: row.is_enabled,
});

const getSettings = async () => {
  const { rows } = await pool.query(
    "SELECT is_enabled FROM ad_banner_settings WHERE id = 1"
  );
  return { isEnabled: rows[0]?.is_enabled ?? false };
};

const getItems = async () => {
  const { rows } = await pool.query(
    "SELECT * FROM ad_banner_items ORDER BY position ASC, id ASC"
  );
  return rows.map(mapItem);
};

const getAll = async () => {
  const [{ isEnabled }, items] = await Promise.all([
    getSettings(),
    getItems(),
  ]);
  return { isEnabled, items };
};

// Profil sahifasidagi ro'yxatni to'liq almashtiradi — eskisi o'chirilib,
// yangi tartib bilan qayta yoziladi. Bitta tranzaksiyada bajariladi.
const replaceAll = async ({ isEnabled, items }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE ad_banner_settings SET is_enabled = $1, updated_at = now() WHERE id = 1`,
      [Boolean(isEnabled)]
    );

    await client.query("DELETE FROM ad_banner_items");

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await client.query(
        `INSERT INTO ad_banner_items (image_url, link_url, duration_seconds, is_enabled, position)
         VALUES ($1, $2, $3, $4, $5)`,
        [item.imageUrl, item.linkUrl, item.durationSeconds, item.isEnabled, i]
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  return getAll();
};

// "O'chirish" tugmasi bosilganda shu bitta rasm darhol (saqlash tugmasini
// kutmasdan) jadvaldan o'chiriladi.
const deleteItem = async (id) => {
  const { rows } = await pool.query(
    "DELETE FROM ad_banner_items WHERE id = $1 RETURNING id",
    [id]
  );
  return rows[0] || null;
};

// Eski (bitta rasmli) ad_banner jadvalidan bir martalik migratsiya uchun.
const getLegacyBanner = async () => {
  const { rows } = await pool.query("SELECT * FROM ad_banner WHERE id = 1");
  return rows[0] || null;
};

module.exports = {
  getAll,
  getSettings,
  getItems,
  replaceAll,
  deleteItem,
  getLegacyBanner,
};
