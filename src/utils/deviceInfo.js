// Node'ning o'rnatilgan "os" moduli faqat shu kodni ishga tushirayotgan
// SERVERning tizimini aniqlaydi (masalan doim "Linux" — chunki backend Linux
// serverda ishlaydi), u sayohatchi/admin panelga kirayotgan brauzerning
// operatsion tizimini bila olmaydi. Klient qaysi tizimdan (Windows, macOS,
// Linux, Android, iOS) kirganini bilish uchun yagona yo'l — so'rov bilan
// birga keladigan User-Agent sarlavhasini o'qish, shuni shu yerda qilamiz.
const detectOS = (userAgent) => {
  if (!userAgent) return "Noma'lum";
  if (/Windows/i.test(userAgent)) return "Windows";
  if (/Mac OS/i.test(userAgent)) return "macOS";
  if (/Android/i.test(userAgent)) return "Android";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  return "Noma'lum";
};

const detectBrowser = (userAgent) => {
  if (!userAgent) return "Noma'lum";
  if (/Edg\//.test(userAgent)) return "Edge";
  if (/Chrome\//.test(userAgent)) return "Chrome";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  if (/Safari\//.test(userAgent)) return "Safari";
  return "Boshqa brauzer";
};

module.exports = { detectOS, detectBrowser };
