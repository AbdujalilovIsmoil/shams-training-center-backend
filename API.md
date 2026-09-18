# Shams Blog API — endpointlar

Base URL: `https://api.shamsoquvmarkaz.uz/api`

Barcha javoblar `{ "success": boolean, "data"?: ..., "message"?: string }` shaklida qaytadi.
`requireAuth` deb belgilangan endpointlarga `Authorization: Bearer <token>` header kerak
(token `/auth/login` orqali olinadi).

## Auth

| Metod | Yo'l | Ruxsat | Tavsif |
|---|---|---|---|
| POST | `/auth/login` | ochiq | `{ username, password }` → `{ token, username }` |
| GET | `/auth/me` | admin | joriy admin ma'lumoti |

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
