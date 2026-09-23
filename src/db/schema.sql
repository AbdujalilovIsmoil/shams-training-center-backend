CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  avatar TEXT,
  rate INTEGER NOT NULL DEFAULT 5,
  published BOOLEAN NOT NULL DEFAULT true,
  text JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin panelda drag-and-drop bilan qo'lda belgilanadigan tartib — sayt ham
-- shu tartibda ko'rsatadi. Mavjud qatorlar uchun bir martalik migrate.js
-- orqali (created_at bo'yicha) to'ldiriladi.
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS position INTEGER;

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  image TEXT,
  date DATE NOT NULL,
  read_time INTEGER NOT NULL DEFAULT 1,
  published BOOLEAN NOT NULL DEFAULT true,
  views INTEGER NOT NULL DEFAULT 0,
  category JSONB NOT NULL DEFAULT '{}',
  title JSONB NOT NULL DEFAULT '{}',
  excerpt JSONB NOT NULL DEFAULT '{}',
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Jadval avvalroq yaratilgan bo'lsa ham "views" ustuni qo'shilishi uchun
-- (CREATE TABLE IF NOT EXISTS mavjud jadvalni o'zgartirmaydi).
ALTER TABLE posts ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0;

-- Maqola endi bitta emas, bir nechta (karusel sifatida ko'rsatiladigan)
-- rasmga ega bo'lishi mumkin — tartib massiv ichidagi tartibga mos keladi.
ALTER TABLE posts ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]';

-- Bir martalik ko'chirish: eski bitta "image" ustunida qiymat bo'lgan va
-- "images" hali to'ldirilmagan qatorlar uchun eski rasm birinchi element
-- sifatida ko'chiriladi, hech narsa yo'qolmaydi.
UPDATE posts
SET images = jsonb_build_array(image)
WHERE images = '[]'::jsonb AND image IS NOT NULL AND image <> '';

-- Butun sayt bo'yicha (har bir maqolaga bog'lanmagan) umumiy tashrif soni —
-- doim bitta qator (id = 1) saqlanadi va shu qator ustida oshiriladi.
CREATE TABLE IF NOT EXISTS site_views (
  id INTEGER PRIMARY KEY DEFAULT 1,
  views INTEGER NOT NULL DEFAULT 0
);

INSERT INTO site_views (id, views) VALUES (1, 0) ON CONFLICT (id) DO NOTHING;

-- Bosh sahifadagi "2000+ o'quvchi", "110+ C1 daraja" kabi statistik
-- raqamlar — doim bitta qator (id = 1) saqlanadi, admin panel shu qatorni
-- yangilaydi, client sayt esa shu yerdan o'qib ko'rsatadi.
CREATE TABLE IF NOT EXISTS site_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  students_count INTEGER NOT NULL DEFAULT 0,
  c1_students INTEGER NOT NULL DEFAULT 0,
  b1_students INTEGER NOT NULL DEFAULT 0,
  teachers_trained INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Saytda hozir ko'rinib turgan qiymatlar bilan boshlab qo'yiladi (2000+,
-- 110+, 500+, 20+) — shu bilan birinchi deploy'da ko'rinish o'zgarmaydi.
INSERT INTO site_stats (id, students_count, c1_students, b1_students, teachers_trained)
VALUES (1, 2000, 110, 500, 20)
ON CONFLICT (id) DO NOTHING;

-- ESKI (bitta rasmli) banner jadvali — endi ad_banner_items/ad_banner_settings
-- bilan almashtirilgan, lekin mavjud ma'lumot yo'qolib ketmasligi uchun
-- (bir martalik migratsiyada shu yerdan o'qib olinadi) jadval o'zi saqlab
-- qolinadi, faqat endi yozilmaydi.
CREATE TABLE IF NOT EXISTS ad_banner (
  id INTEGER PRIMARY KEY DEFAULT 1,
  image_url TEXT,
  link_url TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO ad_banner (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Sayt tepasidagi banner endi bir nechta (ko'pi bilan 5 ta) rasmdan iborat
-- karusel bo'lishi mumkin — global yoqish/o'chirish holati alohida saqlanadi.
CREATE TABLE IF NOT EXISTS ad_banner_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO ad_banner_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Har bir banner rasmi o'zining havolasi, ekranda necha soniya turishini
-- (duration_seconds) va alohida ko'rinish holatini (is_enabled) belgilaydi;
-- position ro'yxatdagi tartibni bildiradi.
CREATE TABLE IF NOT EXISTS ad_banner_items (
  id SERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 5,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Jadval avvalroq yaratilgan bo'lsa ham (is_enabled qo'shilishidan oldin)
-- ustun mavjud bo'lishi uchun.
ALTER TABLE ad_banner_items ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN NOT NULL DEFAULT true;

-- Admin panelga har bir kirish (login) urinishi shu yerga yoziladi —
-- "qayerdan kirilgani" (IP, shahar/mamlakat, brauzer) ko'rinishi uchun.
CREATE TABLE IF NOT EXISTS login_logs (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  ip TEXT,
  city TEXT,
  country TEXT,
  user_agent TEXT,
  jti TEXT,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Jadval avvalroq yaratilgan bo'lsa ham qo'shilishi uchun.
ALTER TABLE login_logs ADD COLUMN IF NOT EXISTS jti TEXT;
ALTER TABLE login_logs ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS login_logs_jti_idx ON login_logs (jti);
