// IP manzildan shahar/mamlakatni aniqlaydi (kirish tarixida "qayerdan
// kirilgani"ni ko'rsatish uchun). Bepul, kalitsiz servis — login javobini
// sekinlashtirmasligi uchun bu funksiya login javobidan keyin, fonda chaqiriladi.
const TIMEOUT_MS = 3000;

const LOCAL_IPS = new Set(["127.0.0.1", "::1"]);

const lookupLocation = async (ip) => {
  if (!ip || LOCAL_IPS.has(ip)) return { city: null, country: null };

  const cleanIp = ip.replace(/^::ffff:/, "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(
      `http://ip-api.com/json/${cleanIp}?fields=status,country,city`,
      { signal: controller.signal }
    );
    const payload = await response.json();

    if (payload.status !== "success") return { city: null, country: null };

    return { city: payload.city || null, country: payload.country || null };
  } catch {
    return { city: null, country: null };
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = { lookupLocation };
