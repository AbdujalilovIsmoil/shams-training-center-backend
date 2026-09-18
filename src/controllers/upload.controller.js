const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { UPLOAD_DIR, buildFilename } = require("../middleware/upload.middleware");

// Katta (masalan telefon kamerasidan olingan 10-20 MB) rasmlarni shu
// o'lchamda saqlash disk hajmini isrof qiladi va saytda ochilishini
// sekinlashtiradi — shu uchun eni/bo'yi shundan katta rasmlar shu chegaraga
// tushuriladi (proporsiya saqlanadi, faqat kattalari kichraytiriladi).
const MAX_DIMENSION = 1920;

// SVG vektor, GIF esa animatsiyali bo'lishi mumkin — ikkalasini ham qayta
// kodlash ma'nosiz yoki animatsiyani buzadi, shu uchun o'zgarishsiz saqlanadi.
const RASTER_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);

const persistFile = async (file) => {
  if (!RASTER_MIME_TYPES.has(file.mimetype)) {
    const filename = buildFilename(file.originalname);
    await fs.writeFile(path.join(UPLOAD_DIR, filename), file.buffer);
    return filename;
  }

  const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
  const filename = buildFilename(file.originalname, ext);
  const pipeline = sharp(file.buffer).resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: "inside",
    withoutEnlargement: true,
  });

  const output =
    file.mimetype === "image/png"
      ? await pipeline.png({ compressionLevel: 9 }).toBuffer()
      : file.mimetype === "image/webp"
        ? await pipeline.webp({ quality: 85 }).toBuffer()
        : await pipeline.jpeg({ quality: 85, mozjpeg: true }).toBuffer();

  await fs.writeFile(path.join(UPLOAD_DIR, filename), output);
  return filename;
};

const uploadImage = asyncHandler(async (req, res) => {
  const file = req.file || (req.files && req.files[0]);

  if (!file) {
    throw new ApiError(400, "Rasm fayli topilmadi");
  }

  const filename = await persistFile(file);
  const fileUrl = `/uploads/${filename}`;

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
