require("dotenv").config();

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const env = require("../config/env");
const adminsRepository = require("../repositories/adminsRepository");
const credentialsCipher = require("../utils/credentialsCipher");

const run = async () => {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  console.log("Jadvallar yaratilmoqda...");
  await pool.query(schema);

  // Admin profil sahifasidan login/parolni o'zgartirgandan keyin ham
  // "npm run migrate" qayta ishga tushirilsa, .env dagi eski qiymatlar bilan
  // ustidan yozib yubormasligi uchun — faqat ADMIN_USERNAME hali mavjud
  // bo'lmasa (masalan, birinchi marta) seed qilinadi.
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
    const passwordEncrypted = credentialsCipher.encrypt(env.seedAdminPassword);
    await adminsRepository.upsert(
      env.seedAdminUsername,
      passwordHash,
      passwordEncrypted
    );
  }

  console.log("Migratsiya muvaffaqiyatli yakunlandi");
  await pool.end();
};

run().catch((err) => {
  console.error("Migratsiyada xatolik:", err);
  process.exit(1);
});
