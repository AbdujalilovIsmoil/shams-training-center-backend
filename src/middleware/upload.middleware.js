const fs = require("fs");
const path = require("path");
const multer = require("multer");
const ApiError = require("../utils/ApiError");

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new ApiError(400, "Faqat rasm fayllarini yuklash mumkin"));
  }
  cb(null, true);
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Fayl xotirada (buffer) qabul qilinadi — diskka yozishdan oldin
// controller uni sharp bilan siqib/kichraytirib keyin yozadi
// (qarang: controllers/upload.controller.js). Shu tufayli kattaroq
// yuklangan rasmlar ham diskda ortiqcha joy egallamaydi va saytda
// tezroq yuklanadi.
//
// `limits.fileSize` multer/busboy darajasida ishlaydi: chegaradan oshgan
// zahoti oqim to'xtatiladi (butun faylni xotiraga o'qib bo'lguncha
// kutilmaydi), shuning uchun katta fayl serverni sekinlashtirmaydi.
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

const buildFilename = (originalname, ext) => {
  const safeExt = ext || path.extname(originalname).toLowerCase();
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${safeExt}`;
};

module.exports = { upload, UPLOAD_DIR, buildFilename, MAX_FILE_SIZE };
