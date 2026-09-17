const { Router } = require("express");
const createRateLimiter = require("../middleware/rateLimit.middleware");
const { sendMessage } = require("../controllers/chat.controller");

const router = Router();

// 1 daqiqada bitta IP'dan eng ko'pi bilan 12 ta xabar
const chatRateLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 12 });

router.post("/", chatRateLimiter, sendMessage);

module.exports = router;
