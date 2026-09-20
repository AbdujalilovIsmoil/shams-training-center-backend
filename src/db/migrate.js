require("dotenv").config();

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const env = require("../config/env");
const adminsRepository = require("../repositories/adminsRepository");
const adBannerStore = require("../services/adBannerStore");
const testimonialsStore = require("../services/testimonialsStore");

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

  // Bir martalik migratsiya: eski (bitta rasmli) ad_banner'da rasm bo'lsa va
  // yangi ad_banner_items hali bo'sh bo'lsa — mavjud banner birinchi element
  // sifatida ko'chiriladi, hech narsa yo'qolmaydi.
  const existingItems = await adBannerStore.getItems();
  if (existingItems.length === 0) {
    const legacy = await adBannerStore.getLegacyBanner();
    if (legacy?.image_url && legacy?.link_url) {
      console.log("Eski banner topildi, yangi formatga ko'chirilmoqda...");
      await adBannerStore.replaceAll({
        isEnabled: Boolean(legacy.is_enabled),
        items: [
          {
            imageUrl: legacy.image_url,
            linkUrl: legacy.link_url,
            durationSeconds: 5,
            isEnabled: true,
          },
        ],
      });
    }
  }

  // Bir martalik migratsiya: "O'quvchilar fikri" tartiblash uchun qo'shilgan
  // "position" ustuni hali bo'sh bo'lgan qatorlarga joriy tartib asosida
  // qiymat beriladi.
  await testimonialsStore.backfillPositions();

  console.log("Migratsiya muvaffaqiyatli yakunlandi");
  await pool.end();
};

run().catch((err) => {
  console.error("Migratsiyada xatolik:", err);
  process.exit(1);
});
