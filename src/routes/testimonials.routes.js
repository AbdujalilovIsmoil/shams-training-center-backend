const { Router } = require("express");
const requireAuth = require("../middleware/auth.middleware");
const {
  getTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonials.controller");

const router = Router();

router.get("/", getTestimonials);
router.get("/:id", getTestimonialById);

router.post("/", requireAuth, createTestimonial);
router.put("/:id", requireAuth, updateTestimonial);
router.delete("/:id", requireAuth, deleteTestimonial);

module.exports = router;
