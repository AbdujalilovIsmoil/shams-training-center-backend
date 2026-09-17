const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const applicationsStore = require("../services/applicationsStore");

const getApplications = asyncHandler(async (req, res) => {
  const applications = await applicationsStore.getAll();
  res.json({ success: true, data: applications });
});

const createApplication = asyncHandler(async (req, res) => {
  const body = req.body || {};

  if (!body.fullName?.trim() || !body.phoneNumber?.trim()) {
    throw new ApiError(400, "Ism va telefon raqami kiritilishi shart");
  }

  const application = await applicationsStore.create(body);
  res.status(201).json({ success: true, data: application });
});

const markApplicationRead = asyncHandler(async (req, res) => {
  const isRead = req.body?.isRead !== false;
  const application = await applicationsStore.setRead(req.params.id, isRead);

  if (!application) {
    throw new ApiError(404, "Ariza topilmadi");
  }

  res.json({ success: true, data: application });
});

const deleteApplication = asyncHandler(async (req, res) => {
  const removed = await applicationsStore.remove(req.params.id);

  if (!removed) {
    throw new ApiError(404, "Ariza topilmadi");
  }

  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = {
  getApplications,
  createApplication,
  markApplicationRead,
  deleteApplication,
};
