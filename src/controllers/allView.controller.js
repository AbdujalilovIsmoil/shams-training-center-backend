const asyncHandler = require("../utils/asyncHandler");
const siteViewsStore = require("../services/siteViewsStore");

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

module.exports = { trackView, getViews };
