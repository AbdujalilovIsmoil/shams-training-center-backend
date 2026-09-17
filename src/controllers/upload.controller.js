const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const uploadImage = asyncHandler(async (req, res) => {
  const file = req.file || (req.files && req.files[0]);

  if (!file) {
    throw new ApiError(400, "Rasm fayli topilmadi");
  }

  const fileUrl = `/uploads/${file.filename}`;

  res.status(201).json({
    success: true,
    // CKEditor SimpleUploadAdapter aynan shu formatni kutadi: { url: "..." }
    url: `${req.protocol}://${req.get("host")}${fileUrl}`,
    data: {
      url: `${req.protocol}://${req.get("host")}${fileUrl}`,
      path: fileUrl,
    },
  });
});

module.exports = { uploadImage };
