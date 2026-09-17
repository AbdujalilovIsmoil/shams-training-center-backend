const { Router } = require("express");
const requireAuth = require("../middleware/auth.middleware");
const {
  getApplications,
  createApplication,
  markApplicationRead,
  deleteApplication,
} = require("../controllers/applications.controller");

const router = Router();

router.get("/", requireAuth, getApplications);
router.post("/", createApplication);
router.patch("/:id/read", requireAuth, markApplicationRead);
router.delete("/:id", requireAuth, deleteApplication);

module.exports = router;
