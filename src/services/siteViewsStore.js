const pool = require("../config/db");

const TIME_ZONE = "Asia/Tashkent";
const GROUPS = ["day", "week", "month", "year"];

const getViews = async () => {
  const { rows } = await pool.query("SELECT views FROM site_views WHERE id = 1");
  return rows[0]?.views ?? 0;
};

// Umumiy hisoblagich bilan birga bugungi kun qatorini ham (bitta so'rovda)
// oshiradi — data-modifying CTE natijasi ishlatilmasa ham baribir bajariladi.
const incrementViews = async () => {
  const { rows } = await pool.query(
    `WITH daily AS (
       INSERT INTO site_views_daily (day, views)
       VALUES ((now() AT TIME ZONE $1)::date, 1)
       ON CONFLICT (day) DO UPDATE SET views = site_views_daily.views + 1
     )
     UPDATE site_views SET views = views + 1 WHERE id = 1 RETURNING views`,
    [TIME_ZONE]
  );
  return rows[0]?.views ?? 0;
};

const getToday = async () => {
  const { rows } = await pool.query(
    "SELECT to_char((now() AT TIME ZONE $1)::date, 'YYYY-MM-DD') AS today",
    [TIME_ZONE]
  );
  return rows[0].today;
};

// from..to (ikkalasi ham kiritiladi) oralig'ini day/week/month/year bo'yicha
// guruhlaydi. Tashrifi bo'lmagan davrlar ham 0 bilan qaytadi (grafik uzilmasin).
const getViewsReport = async ({ from, to, group }) => {
  if (!GROUPS.includes(group)) throw new Error("Noto'g'ri group");

  const { rows } = await pool.query(
    `SELECT to_char(p.period, 'YYYY-MM-DD') AS period,
            COALESCE(SUM(d.views), 0)::int AS views
     FROM generate_series(
            date_trunc($3, $1::date::timestamp),
            $2::date::timestamp,
            ('1 ' || $3)::interval
          ) AS p(period)
     LEFT JOIN site_views_daily d
       ON date_trunc($3, d.day::timestamp) = p.period
      AND d.day BETWEEN $1::date AND $2::date
     GROUP BY p.period
     ORDER BY p.period`,
    [from, to, group]
  );

  const total = rows.reduce((sum, row) => sum + row.views, 0);
  return { from, to, group, total, series: rows };
};

module.exports = { getViews, incrementViews, getViewsReport, getToday, GROUPS };
