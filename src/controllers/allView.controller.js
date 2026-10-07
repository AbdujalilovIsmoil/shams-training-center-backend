const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const siteViewsStore = require("../services/siteViewsStore");

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 366 * 5;
const DAY_MS = 24 * 60 * 60 * 1000;

const isValidDate = (value) =>
  ISO_DATE.test(value) &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

const addDays = (iso, days) =>
  new Date(new Date(`${iso}T00:00:00Z`).getTime() + days * DAY_MS)
    .toISOString()
    .slice(0, 10);

// Client sayt har bir sahifa ochilganda chaqiradi (postga bog'lanmagan,
// butun sayt bo'yicha umumiy tashrif hisoblagichi).
const trackView = asyncHandler(async (req, res) => {
  const views = await siteViewsStore.incrementViews();
  res.json({ success: true, data: { views } });
});

// Admin panel shu orqali umumiy tashrif sonini ko'radi — bu chaqiruv
// hisoblagichni oshirmaydi.
const getViews = asyncHandler(async (req, res) => {
  const views = await siteViewsStore.getViews();
  res.json({ success: true, data: { views } });
});

// ?from=YYYY-MM-DD&to=YYYY-MM-DD&group=day|week|month|year
// Standart: oxirgi 30 kun, kunlik. Faqat kunlik taqsimot saqlana boshlagandan
// keyingi tashriflar hisobga olinadi.
const getViewsStats = asyncHandler(async (req, res) => {
  const group = req.query.group || "day";
  if (!siteViewsStore.GROUPS.includes(group)) {
    throw new ApiError(400, "group: day, week, month yoki year bo'lishi kerak");
  }

  const today = await siteViewsStore.getToday();
  const to = req.query.to || today;
  const from = req.query.from || addDays(to, -29);

  if (!isValidDate(from) || !isValidDate(to)) {
    throw new ApiError(400, "Sana YYYY-MM-DD formatida bo'lishi kerak");
  }
  if (from > to) {
    throw new ApiError(400, "Boshlanish sanasi tugash sanasidan keyin bo'lishi mumkin emas");
  }
  const days = (new Date(to) - new Date(from)) / DAY_MS + 1;
  if (days > MAX_RANGE_DAYS) {
    throw new ApiError(400, "Sana oralig'i 5 yildan oshmasligi kerak");
  }
  if (group === "day" && days > 366) {
    throw new ApiError(400, "Kunlik ko'rinish uchun oralig'i 1 yildan oshmasligi kerak");
  }

  const report = await siteViewsStore.getViewsReport({ from, to, group });
  res.json({ success: true, data: { ...report, allTime: await siteViewsStore.getViews() } });
});

module.exports = { trackView, getViews, getViewsStats };
