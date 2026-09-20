const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const adBannerStore = require("../services/adBannerStore");

const MAX_ITEMS = 5;
const DEFAULT_DURATION = 5;

// Sayt tepasidagi banner karuseli — client sayt shu orqali o'qiydi,
// avtorizatsiya talab qilinmaydi.
const getBanner = asyncHandler(async (req, res) => {
  const banner = await adBannerStore.getAll();
  res.json({ success: true, data: banner });
});

const updateBanner = asyncHandler(async (req, res) => {
  const { isEnabled, items } = req.body || {};

  if (!Array.isArray(items)) {
    throw new ApiError(400, "Banner rasmlari ro'yxati noto'g'ri");
  }

  if (items.length > MAX_ITEMS) {
    throw new ApiError(400, `Ko'pi bilan ${MAX_ITEMS} ta rasm qo'shish mumkin`);
  }

  if (isEnabled && items.length === 0) {
    throw new ApiError(400, "Banner yoqilishi uchun kamida bitta rasm kerak");
  }

  const normalized = items.map((item, index) => {
    const imageUrl = typeof item?.imageUrl === "string" ? item.imageUrl.trim() : "";
    const linkUrl = typeof item?.linkUrl === "string" ? item.linkUrl.trim() : "";
    const durationSeconds = Number(item?.durationSeconds);

    if (!imageUrl) {
      throw new ApiError(400, `${index + 1}-rasm tanlanmagan`);
    }

    if (!linkUrl) {
      throw new ApiError(400, `${index + 1}-rasm uchun havola manzili kerak`);
    }

    try {
      new URL(linkUrl);
    } catch {
      throw new ApiError(
        400,
        `${index + 1}-rasm uchun havola to'liq bo'lishi kerak (masalan https://...)`
      );
    }

    if (!Number.isFinite(durationSeconds) || durationSeconds < 1 || durationSeconds > 60) {
      throw new ApiError(
        400,
        `${index + 1}-rasm uchun davomiylik 1 dan 60 gacha son bo'lishi kerak`
      );
    }

    return {
      imageUrl,
      linkUrl,
      durationSeconds: Math.round(durationSeconds),
      isEnabled: item?.isEnabled !== false,
    };
  });

  const updated = await adBannerStore.replaceAll({
    isEnabled: Boolean(isEnabled),
    items: normalized,
  });

  res.json({ success: true, data: updated });
});

// "O'chirish" tugmasi bosilganda shu bitta rasm darhol (saqlash tugmasini
// bosmasdan) backendda o'chiriladi.
const deleteBannerItem = asyncHandler(async (req, res) => {
  const removed = await adBannerStore.deleteItem(req.params.id);

  if (!removed) {
    throw new ApiError(404, "Banner rasmi topilmadi");
  }

  const updated = await adBannerStore.getAll();
  res.json({ success: true, data: updated });
});

module.exports = { getBanner, updateBanner, deleteBannerItem, DEFAULT_DURATION };
