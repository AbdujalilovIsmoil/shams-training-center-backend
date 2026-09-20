const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const siteStatsStore = require("../services/siteStatsStore");

const FIELDS = ["studentsCount", "c1Students", "b1Students", "teachersTrained"];

// Bosh sahifadagi statistika bloki (2000+ o'quvchi, 110+ C1 daraja va h.k.) —
// client sayt shu orqali o'qiydi, hech qanday avtorizatsiya talab qilinmaydi.
const getStats = asyncHandler(async (req, res) => {
  const stats = await siteStatsStore.get();
  res.json({ success: true, data: stats });
});

// Admin panel "Statistika" sahifasidan shu 4 ta raqamni yangilaydi.
const updateStats = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const values = {};

  for (const field of FIELDS) {
    const value = body[field];

    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new ApiError(
        400,
        "Barcha statistik qiymatlar manfiy bo'lmagan son bo'lishi kerak"
      );
    }

    values[field] = Math.round(value);
  }

  const updated = await siteStatsStore.update(values);
  res.json({ success: true, data: updated });
});

module.exports = { getStats, updateStats };
