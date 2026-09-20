const pool = require("../config/db");

const mapRow = (row) => ({
  studentsCount: row.students_count,
  c1Students: row.c1_students,
  b1Students: row.b1_students,
  teachersTrained: row.teachers_trained,
  updatedAt: row.updated_at,
});

const get = async () => {
  const { rows } = await pool.query("SELECT * FROM site_stats WHERE id = 1");
  return rows[0] ? mapRow(rows[0]) : null;
};

const update = async ({
  studentsCount,
  c1Students,
  b1Students,
  teachersTrained,
}) => {
  const { rows } = await pool.query(
    `UPDATE site_stats
     SET students_count = $1,
         c1_students = $2,
         b1_students = $3,
         teachers_trained = $4,
         updated_at = now()
     WHERE id = 1
     RETURNING *`,
    [studentsCount, c1Students, b1Students, teachersTrained]
  );

  return mapRow(rows[0]);
};

module.exports = { get, update };
