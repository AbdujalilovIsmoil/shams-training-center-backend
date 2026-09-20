const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const adBannerStore = require("../services/adBannerStore");

// Sayt tepasidagi banner — client sayt shu orqali o'qiydi, avtorizatsiya
// talab qilinmaydi. Yoqilgan-yoqilmaganidan qat'i nazar joriy holatni
// qaytaradi (admin panel tahrirlash formasini shu bilan to'ldiradi).
const getBanner = asyncHandler(async (req, res) => {
  const banner = await adBannerStore.get();
  res.json({ success: true, data: banner });
});

const updateBanner = asyncHandler(async (req, res) => {
  const { imageUrl, linkUrl, isEnabled } = req.body || {};

  if (isEnabled) {
    if (!imageUrl || typeof imageUrl !== "string") {
      throw new ApiError(400, "Banner yoqilishi uchun rasm tanlang");
    }

    if (!linkUrl || typeof linkUrl !== "string") {
      throw new ApiError(400, "Banner yoqilishi uchun havola manzilini kiriting");
    }

    try {
      new URL(linkUrl);
    } catch {
      throw new ApiError(
        400,
        "Havola manzili to'liq bo'lishi kerak (masalan https://...)"
      );
    }
  }

  const updated = await adBannerStore.update({
    imageUrl: typeof imageUrl === "string" ? imageUrl : "",
    linkUrl: typeof linkUrl === "string" ? linkUrl : "",
    isEnabled: Boolean(isEnabled),
  });

  res.json({ success: true, data: updated });
});

module.exports = { getBanner, updateBanner };
