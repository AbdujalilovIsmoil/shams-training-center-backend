const { Router } = require("express");
const requireAuth = require("../middleware/auth.middleware");
const createRateLimiter = require("../middleware/rateLimit.middleware");
const { trackView, getViews } = require("../controllers/allView.controller");

const router = Router();

// 1 daqiqada bitta IP'dan eng ko'pi bilan 60 ta hisoblash so'rovi
const trackRateLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 60 });

router.post("/", trackRateLimiter, trackView);
router.get("/", requireAuth, getViews);

module.exports = router;
