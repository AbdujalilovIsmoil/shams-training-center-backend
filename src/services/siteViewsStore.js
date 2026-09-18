const pool = require("../config/db");

const getViews = async () => {
  const { rows } = await pool.query("SELECT views FROM site_views WHERE id = 1");
  return rows[0]?.views ?? 0;
};

const incrementViews = async () => {
  const { rows } = await pool.query(
    "UPDATE site_views SET views = views + 1 WHERE id = 1 RETURNING views"
  );
  return rows[0]?.views ?? 0;
};

module.exports = { getViews, incrementViews };
