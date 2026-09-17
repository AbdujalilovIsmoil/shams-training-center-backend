const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const testimonialsStore = require("../services/testimonialsStore");

const getTestimonials = asyncHandler(async (req, res) => {
  const { published } = req.query;
  let testimonials = await testimonialsStore.getAll();

  if (published === "true") {
    testimonials = testimonials.filter((item) => item.published);
  }

  res.json({ success: true, data: testimonials });
});

const getTestimonialById = asyncHandler(async (req, res) => {
  const testimonial = await testimonialsStore.getById(req.params.id);

  if (!testimonial) {
    throw new ApiError(404, "Fikr topilmadi");
  }

  res.json({ success: true, data: testimonial });
});

const createTestimonial = asyncHandler(async (req, res) => {
  const body = req.body || {};

  if (!body.author?.trim()) {
    throw new ApiError(400, "O'quvchi ismi kiritilishi shart");
  }

  if (!body.text?.uz?.trim()) {
    throw new ApiError(400, "Kamida o'zbek tilidagi fikr matni kiritilishi shart");
  }

  const testimonial = await testimonialsStore.create(body);
  res.status(201).json({ success: true, data: testimonial });
});

const updateTestimonial = asyncHandler(async (req, res) => {
  const existing = await testimonialsStore.getById(req.params.id);

  if (!existing) {
    throw new ApiError(404, "Fikr topilmadi");
  }

  const updated = await testimonialsStore.update(existing.id, req.body || {});
  res.json({ success: true, data: updated });
});

const deleteTestimonial = asyncHandler(async (req, res) => {
  const removed = await testimonialsStore.remove(req.params.id);

  if (!removed) {
    throw new ApiError(404, "Fikr topilmadi");
  }

  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = {
  getTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
