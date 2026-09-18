const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const slugify = require("../utils/slugify");
const postsStore = require("../services/postsStore");

const buildUniqueSlug = async (rawSlug, fallbackTitle, excludeId) => {
  let base = slugify(rawSlug || fallbackTitle || "maqola");
  if (!base) base = "maqola";

  let slug = base;
  let counter = 2;

  while (await postsStore.isSlugTaken(slug, excludeId)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
};

const getPosts = asyncHandler(async (req, res) => {
  const { published } = req.query;
  let posts = await postsStore.getAll();

  if (published === "true") {
    posts = posts.filter((post) => post.published);
  }

  res.json({ success: true, data: posts });
});

// Bu endpoint client saytda bitta maqolani ochish uchun ishlatiladi, shuning
// uchun har chaqirilganda ko'rishlar sonini (views) oshiradi. Admin panel
// tahrirlash uchun getPostById'dan (id bo'yicha) foydalanadi — u ko'rishni
// oshirmaydi, aks holda admin maqolani ochib tahrirlaganda ham view hisoblanardi.
const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await postsStore.incrementViewsBySlug(req.params.slug);

  if (!post) {
    throw new ApiError(404, "Maqola topilmadi");
  }

  res.json({ success: true, data: post });
});

const getPostById = asyncHandler(async (req, res) => {
  const post = await postsStore.getById(req.params.id);

  if (!post) {
    throw new ApiError(404, "Maqola topilmadi");
  }

  res.json({ success: true, data: post });
});

const createPost = asyncHandler(async (req, res) => {
  const body = req.body || {};

  if (!body.title?.uz) {
    throw new ApiError(400, "Kamida o'zbek tilidagi sarlavha kiritilishi shart");
  }

  const slug = await buildUniqueSlug(body.slug, body.title?.uz);
  const post = await postsStore.create({ ...body, slug });

  res.status(201).json({ success: true, data: post });
});

const updatePost = asyncHandler(async (req, res) => {
  const existing = await postsStore.getById(req.params.id);

  if (!existing) {
    throw new ApiError(404, "Maqola topilmadi");
  }

  const body = req.body || {};
  const nextSlugSource = body.slug ?? existing.slug;
  const slug = await buildUniqueSlug(nextSlugSource, body.title?.uz, existing.id);

  const updated = await postsStore.update(existing.id, { ...body, slug });

  res.json({ success: true, data: updated });
});

const deletePost = asyncHandler(async (req, res) => {
  const removed = await postsStore.remove(req.params.id);

  if (!removed) {
    throw new ApiError(404, "Maqola topilmadi");
  }

  res.json({ success: true, data: { id: req.params.id } });
});

module.exports = {
  getPosts,
  getPostBySlug,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
