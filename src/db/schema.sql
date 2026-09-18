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

-- Admin panelga har bir kirish (login) urinishi shu yerga yoziladi —
-- "qayerdan kirilgani" (IP, shahar/mamlakat, brauzer) ko'rinishi uchun.
CREATE TABLE IF NOT EXISTS login_logs (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  ip TEXT,
  city TEXT,
  country TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
