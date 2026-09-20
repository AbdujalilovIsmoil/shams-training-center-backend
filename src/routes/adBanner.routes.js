const { Router } = require("express");
const requireAuth = require("../middleware/auth.middleware");
const { getBanner, updateBanner } = require("../controllers/adBanner.controller");

const router = Router();

router.get("/", getBanner);
router.put("/", requireAuth, updateBanner);

module.exports = router;
