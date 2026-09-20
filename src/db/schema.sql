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
