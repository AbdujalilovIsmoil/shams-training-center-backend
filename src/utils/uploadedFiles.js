const fs = require("fs/promises");
const path = require("path");
const { UPLOAD_DIR } = require("../middleware/upload.middleware");

const UPLOAD_REF = /\/uploads\/([A-Za-z0-9_.-]+)/g;

// Istalgan obyekt/massiv/matn ichidan "/uploads/<fayl>" havolalarini topadi.
const extractUploadFilenames = (value) => {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return new Set(Array.from(text.matchAll(UPLOAD_REF), (m) => m[1]));
};

const removeUploadedFiles = async (filenames, keep = new Set()) => {
  for (const name of filenames) {
    if (keep.has(name) || name !== path.basename(name)) continue;
    await fs.unlink(path.join(UPLOAD_DIR, name)).catch((err) => {
      if (err.code !== "ENOENT") throw err;
    });
  }
};

module.exports = { extractUploadFilenames, removeUploadedFiles };
