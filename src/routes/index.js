const { Router } = require("express");
const authRoutes = require("./auth.routes");
const postsRoutes = require("./posts.routes");
const uploadRoutes = require("./upload.routes");
const testimonialsRoutes = require("./testimonials.routes");
const applicationsRoutes = require("./applications.routes");
const chatRoutes = require("./chat.routes");
const allViewRoutes = require("./allView.routes");
const siteStatsRoutes = require("./siteStats.routes");

const router = Router();

router.get("/", (req, res) => {
  res.json({ success: true, message: "Shams Blog API ishlamoqda" });
});

router.use("/auth", authRoutes);
router.use("/posts", postsRoutes);
router.use("/upload", uploadRoutes);
router.use("/testimonials", testimonialsRoutes);
router.use("/applications", applicationsRoutes);
router.use("/chat", chatRoutes);
router.use("/all-view", allViewRoutes);
router.use("/site-stats", siteStatsRoutes);

module.exports = router;
