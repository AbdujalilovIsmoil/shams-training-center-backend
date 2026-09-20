# Shams Blog API — endpointlar

Base URL: `https://api.shamsoquvmarkaz.uz/api`

Barcha javoblar `{ "success": boolean, "data"?: ..., "message"?: string }` shaklida qaytadi.
`requireAuth` deb belgilangan endpointlarga `Authorization: Bearer <token>` header kerak
(token `/auth/login` orqali olinadi).

## Auth

| Metod | Yo'l | Ruxsat | Tavsif |
|---|---|---|---|
| POST | `/auth/login` | ochiq | `{ username, password }` → `{ token, username }`. Muvaffaqiyatli kirishda fonda IP/shahar/mamlakat/brauzer bazaga yoziladi. **Bir vaqtda ko'pi bilan `MAX_ACTIVE_SESSIONS` ta (standart: 3) sessiya faol bo'ladi** — shundan ortiq tizim/qurilmadan (Windows, macOS, Linux, Android, iOS va h.k.) kirilsa, eng ESKI sessiya(lar) avtomatik chiqarib yuboriladi |
| GET | `/auth/me` | admin | joriy admin ma'lumoti |
| GET | `/auth/login-logs` | admin | hozir **faol** bo'lgan barcha sessiyalar: `{ id, username, ip, city, country, userAgent, os, browser, jti, createdAt }[]`. Ro'yxat **joriy so'rovni yuborayotgan admin sessiyasi birinchi**, qolgan boshqa sessiyalar keyin keladigan tartibda qaytadi. `os`/`browser` `User-Agent` sarlavhasidan backendda aniqlanadi (Node'ning o'rnatilgan `os` moduli emas — u faqat serverning o'z tizimini bilar edi, klientnikini emas) |
| DELETE | `/auth/login-logs/:id` | admin | shu sessiyani **butunlay o'chiradi** (soft-revoke emas) — o'sha token bilan keyingi so'rov darhol rad etiladi va sessiya ro'yxatda boshqa ko'rinmaydi. **O'z joriy sessiyangizni chiqarib yubora olmaysiz** — `400` bilan rad etiladi |
| POST | `/auth/login-logs/revoke-others` | admin | joriy sessiyadan **boshqa barcha faol sessiyalarni** jadvaldan butunlay o'chiradi, yangilangan (faqat joriy sessiyani o'z ichiga olgan) ro'yxatni qaytaradi |

## Posts (bloglar)

| Metod | Yo'l | Ruxsat | Tavsif |
|---|---|---|---|
| GET | `/posts` | ochiq | barcha maqolalar (`?published=true` — faqat chop etilganlar) |
| GET | `/posts/id/:id` | ochiq | maqolani **id** bo'yicha olish — admin panel tahrirlash uchun ishlatadi, **views'ni oshirmaydi** |
| GET | `/posts/:slug` | ochiq | maqolani **slug** bo'yicha olish — client sayt bitta blogni ochganda ishlatadi, **har chaqirilganda `views` +1 oshadi** |
| POST | `/posts` | admin | yangi maqola yaratish |
| PUT | `/posts/:id` | admin | maqolani tahrirlash |
| DELETE | `/posts/:id` | admin | maqolani o'chirish |

Har bir maqola javobida `views` maydoni bor — bu shu **bitta maqolaning** ko'rishlar
soni (admin panel jadvalida "Ko'rishlar" ustunida ko'rinadi).

## Umumiy sayt tashriflari — `/all-view`

Bitta maqolaga bog'lanmagan, **butun sayt bo'yicha** umumiy tashrif hisoblagichi.
Admin panel dashboardida "Saytga jami tashriflar" statistika kartasi shu API'dan keladi.

| Metod | Yo'l | Ruxsat | Tavsif |
|---|---|---|---|
| POST | `/all-view` | ochiq (1 daqiqada IP'dan max 60 so'rov) | tashrif hisoblagichini +1 oshiradi, joriy sonni qaytaradi |
| GET | `/all-view` | admin | hisoblagichni **oshirmasdan** joriy sonni qaytaradi |

**Ishlatilishi:** client sayt (`shams-learning-centre`) har bir sahifa ochilganda
(shu jumladan ichki navigatsiyada) avtomatik `POST /all-view` yuboradi
(`app/_components/specific/SiteViewTracker`). Admin panel esa `GET /all-view`
orqali shu sonni o'qib ko'rsatadi.

Namuna javob:

```json
{ "success": true, "data": { "views": 1432 } }
```

## Bosh sahifa statistikasi — `/site-stats`

Bosh sahifadagi "2000+ o'qigan o'quvchi", "110+ C1 daraja" kabi 4 ta statistik
raqam. Admin panel "Statistika" sahifasidan shu raqamlarni tahrirlaydi
(matnlar/label'lar client saytda qattiq yozilgan — o'zgarmaydi, faqat sonlar).

| Metod | Yo'l | Ruxsat | Tavsif |
|---|---|---|---|
| GET | `/site-stats` | ochiq | joriy 4 ta raqamni qaytaradi: `{ studentsCount, c1Students, b1Students, teachersTrained, updatedAt }` |
| PUT | `/site-stats` | admin | shu 4 ta maydonni yangilaydi (har biri manfiy bo'lmagan butun son bo'lishi shart) |

Namuna javob:

```json
{
  "success": true,
  "data": {
    "studentsCount": 2000,
    "c1Students": 110,
    "b1Students": 500,
    "teachersTrained": 20,
    "updatedAt": "2026-09-20T12:00:00.000Z"
  }
}
```

## Sayt tepasidagi reklama banneri — `/banner`

Sayt eng tepasida ko'rinadigan bitta katta banner (rasm + bosilganda o'tiladigan
havola). Admin panel "Banner" sahifasidan rasm yuklaydi (`/upload` orqali),
havolani kiritadi va yoqadi/o'chiradi.

| Metod | Yo'l | Ruxsat | Tavsif |
|---|---|---|---|
| GET | `/banner` | ochiq | joriy holatni qaytaradi: `{ imageUrl, linkUrl, isEnabled, updatedAt }` |
| PUT | `/banner` | admin | `{ imageUrl, linkUrl, isEnabled }` ni saqlaydi. `isEnabled: true` bo'lsa `imageUrl` va to'g'ri formatdagi `linkUrl` majburiy |

Namuna javob:

```json
{
  "success": true,
  "data": {
    "imageUrl": "/uploads/banner-123.jpg",
    "linkUrl": "https://t.me/Shams_markaz_admin",
    "isEnabled": true,
    "updatedAt": "2026-09-20T12:00:00.000Z"
  }
}
```

**Ishlatilishi:** client sayt (`shams-learning-centre`) `GET /banner`ni o'qiydi;
`isEnabled` va `imageUrl` bo'lsagina rasm `linkUrl`ga olib boradigan havola
ichida sayt eng tepasida ko'rsatiladi.

## Rasm yuklash — `/upload`

| Metod | Yo'l | Ruxsat | Tavsif |
|---|---|---|---|
| POST | `/upload` | admin | `multipart/form-data`, fayl fieldi `image` yoki `upload` nomida bo'lishi mumkin |

- Maksimal fayl hajmi: **5 MB**. Undan katta fayl darhol (to'liq qabul qilinmasdan)
  rad etiladi: `{ "success": false, "message": "Rasm hajmi 5 MB dan katta bo'lmasligi kerak" }`.
- Qabul qilingan rasm serverda avtomatik kichraytiriladi/siqiladi (max 1920px, JPEG/PNG/WebP siqilishi).
- Javob: `{ "success": true, "url": "https://.../uploads/...", "data": { "url": "...", "path": "/uploads/..." } }`

## Testimonials, Applications, Chat

Bular ushbu hujjatdan tashqarida — mos `routes/*.routes.js` va `controllers/*.controller.js`
fayllarida CRUD naqshi bo'yicha yozilgan (testimonials/applications), yoki AI-chatbot uchun
maxsus endpoint (`/chat`, OpenAI orqali javob qaytaradi).
