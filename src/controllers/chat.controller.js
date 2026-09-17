const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { SYSTEM_PROMPT_TEMPLATE } = require("../services/chatbotKnowledge");

const LANGUAGE_NAMES = {
  uz: "o'zbek",
  ru: "rus",
  en: "ingliz",
  ar: "arab",
};

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY = 10;

const sendMessage = asyncHandler(async (req, res) => {
  if (!env.openaiApiKey) {
    throw new ApiError(
      503,
      "AI-yordamchi hozircha sozlanmagan (OPENAI_API_KEY yo'q)"
    );
  }

  const body = req.body || {};
  const message = String(body.message || "").trim();
  const language = LANGUAGE_NAMES[body.language] ? body.language : "uz";
  const history = Array.isArray(body.history) ? body.history : [];

  if (!message) {
    throw new ApiError(400, "Xabar matni bo'sh bo'lishi mumkin emas");
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new ApiError(400, "Xabar juda uzun");
  }

  const trimmedHistory = history
    .slice(-MAX_HISTORY)
    .filter(
      (item) =>
        item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string"
    )
    .map((item) => ({
      role: item.role,
      content: item.content.slice(0, MAX_MESSAGE_LENGTH),
    }));

  const messages = [
    { role: "system", content: SYSTEM_PROMPT_TEMPLATE(LANGUAGE_NAMES[language]) },
    ...trimmedHistory,
    { role: "user", content: message },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: env.openaiModel,
      messages,
      temperature: 0.4,
      max_tokens: 400,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    console.error("OpenAI xatoligi:", payload);
    throw new ApiError(502, "AI-yordamchidan javob olishda xatolik yuz berdi");
  }

  const reply = payload.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new ApiError(502, "AI-yordamchidan bo'sh javob keldi");
  }

  res.json({ success: true, data: { reply } });
});

module.exports = { sendMessage };
