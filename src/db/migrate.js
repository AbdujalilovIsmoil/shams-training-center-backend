require("dotenv").config();

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const env = require("../config/env");
const adminsRepository = require("../repositories/adminsRepository");

const run = async () => {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  console.log("Jadvallar yaratilmoqda...");
  await pool.query(schema);

  // "npm run migrate" qayta ishga tushirilganda .env dagi eski qiymatlar bilan
  // admin parolini ustidan yozib yubormasligi uchun — faqat ADMIN_USERNAME
  // hali mavjud bo'lmasa (masalan, birinchi marta) seed qilinadi.
  const existingAdmin = await adminsRepository.findByUsername(
    env.seedAdminUsername
  );

  if (existingAdmin) {
    console.log(
      `Admin foydalanuvchi allaqachon mavjud: ${env.seedAdminUsername} (seed o'tkazib yuborildi)`
    );
  } else {
    console.log(`Admin foydalanuvchi seed qilinmoqda: ${env.seedAdminUsername}`);
    const passwordHash = bcrypt.hashSync(env.seedAdminPassword, 10);
    await adminsRepository.upsert(env.seedAdminUsername, passwordHash);
  }

  console.log("Migratsiya muvaffaqiyatli yakunlandi");
  await pool.end();
};

run().catch((err) => {
  console.error("Migratsiyada xatolik:", err);
  process.exit(1);
});
