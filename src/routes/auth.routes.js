const { Router } = require("express");
const {
  login,
  me,
  getLoginLogs,
  revokeLoginLog,
  revokeOtherSessions,
  getProfile,
  updateProfile,
} = require("../controllers/auth.controller");
const requireAuth = require("../middleware/auth.middleware");

const router = Router();

router.post("/login", login);
router.get("/me", requireAuth, me);
router.get("/login-logs", requireAuth, getLoginLogs);
router.post("/login-logs/revoke-others", requireAuth, revokeOtherSessions);
router.delete("/login-logs/:id", requireAuth, revokeLoginLog);
router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);

module.exports = router;
