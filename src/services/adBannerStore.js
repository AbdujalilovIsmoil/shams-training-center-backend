const pool = require("../config/db");

const mapRow = (row) => ({
  imageUrl: row.image_url,
  linkUrl: row.link_url,
  isEnabled: row.is_enabled,
  updatedAt: row.updated_at,
});

const get = async () => {
  const { rows } = await pool.query("SELECT * FROM ad_banner WHERE id = 1");
  return rows[0] ? mapRow(rows[0]) : null;
};

const update = async ({ imageUrl, linkUrl, isEnabled }) => {
  const { rows } = await pool.query(
    `UPDATE ad_banner
     SET image_url = $1, link_url = $2, is_enabled = $3, updated_at = now()
     WHERE id = 1
     RETURNING *`,
    [imageUrl || null, linkUrl || null, Boolean(isEnabled)]
  );

  return mapRow(rows[0]);
};

module.exports = { get, update };
