const { Router } = require("express");
const { login, me, getLoginLogs } = require("../controllers/auth.controller");
const requireAuth = require("../middleware/auth.middleware");

const router = Router();

router.post("/login", login);
router.get("/me", requireAuth, me);
router.get("/login-logs", requireAuth, getLoginLogs);

module.exports = router;
