const fs = require("fs");
const path = require("path");
const app = require("./app");
const env = require("./config/env");
const pool = require("./config/db");

// Deploy jarayonida "npm run migrate" alohida qo'lda ishga tushirilmasa ham
// (masalan, hosting faqat "npm start"ni chaqiradi) jadval sxemasi yangi
// bo'lishi uchun — schema.sql butunlay idempotent (CREATE/ALTER ... IF NOT
// EXISTS, INSERT ... ON CONFLICT DO NOTHING) bo'lgani uchun har safar
// ishga tushirishda qayta bajarish xavfsiz.
const syncSchema = async () => {
  const schemaPath = path.join(__dirname, "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  try {
    await pool.query(schema);
    console.log("Baza sxemasi tekshirildi/yangilandi");
  } catch (err) {
    console.error("Baza sxemasini yangilashda xatolik:", err);
  }
};

syncSchema().then(() => {
  app.listen(env.port, () => {
    console.log(`Shams Blog API http://localhost:${env.port} portida ishga tushdi`);
  });
});
