const multer = require("multer");
const ApiError = require("../utils/ApiError");
const { MAX_FILE_SIZE } = require("./upload.middleware");

const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Manzil topilmadi: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: `Rasm hajmi ${MAX_FILE_SIZE / (1024 * 1024)} MB dan katta bo'lmasligi kerak`,
    });
  }

  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || "Serverda kutilmagan xatolik yuz berdi";

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { notFoundHandler, errorHandler };
