const { Router } = require("express");
const requireAuth = require("../middleware/auth.middleware");
const {
  getPosts,
  getPostBySlug,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/posts.controller");

const router = Router();

router.get("/", getPosts);
router.get("/id/:id", getPostById);
router.get("/:slug", getPostBySlug);

router.post("/", requireAuth, createPost);
router.put("/:id", requireAuth, updatePost);
router.delete("/:id", requireAuth, deletePost);

module.exports = router;
