const { Router } = require("express");
const requireAuth = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");
const { uploadImage } = require("../controllers/upload.controller");

const router = Router();

// CKEditor SimpleUploadAdapter "upload" fieldida, admin paneldagi qopqoq-rasm
// yuklovchisi esa "image" fieldida yuboradi — upload.any() ikkalasini ham qabul qiladi.
router.post("/", requireAuth, upload.any(), uploadImage);

module.exports = router;
