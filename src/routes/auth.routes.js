const { Router } = require("express");
const {
  login,
  me,
  getLoginLogs,
  revokeLoginLog,
  revokeOtherSessions,
} = require("../controllers/auth.controller");
const requireAuth = require("../middleware/auth.middleware");

const router = Router();

router.post("/login", login);
router.get("/me", requireAuth, me);
router.get("/login-logs", requireAuth, getLoginLogs);
router.post("/login-logs/revoke-others", requireAuth, revokeOtherSessions);
router.delete("/login-logs/:id", requireAuth, revokeLoginLog);

module.exports = router;
