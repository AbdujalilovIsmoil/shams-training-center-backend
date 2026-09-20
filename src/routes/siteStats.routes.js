const { Router } = require("express");
const requireAuth = require("../middleware/auth.middleware");
const { getStats, updateStats } = require("../controllers/siteStats.controller");

const router = Router();

router.get("/", getStats);
router.put("/", requireAuth, updateStats);

module.exports = router;
