const { Router } = require("express");
const requireAuth = require("../middleware/auth.middleware");
const {
  getBanner,
  updateBanner,
  deleteBannerItem,
} = require("../controllers/adBanner.controller");

const router = Router();

router.get("/", getBanner);
router.put("/", requireAuth, updateBanner);
router.delete("/items/:id", requireAuth, deleteBannerItem);

module.exports = router;
