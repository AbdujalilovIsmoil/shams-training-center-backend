const LATIN_MAP = {
  "ʻ": "",
  "‘": "",
  "’": "",
  "ʼ": "",
  "o‘": "o",
  "g‘": "g",
};

const slugify = (value) => {
  let text = String(value || "").toLowerCase();

  Object.keys(LATIN_MAP).forEach((key) => {
    text = text.split(key).join(LATIN_MAP[key]);
  });

  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9؀-ۿ\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

module.exports = slugify;
