const crypto = require("crypto");

const TOKENIZATION_SECRET =
  process.env.TOKENIZATION_SECRET || "dev-tokenization-secret";
const GATEWAY_WEBHOOK_SECRET =
  process.env.GATEWAY_WEBHOOK_SECRET || "dev-webhook-secret";

function detectBrand(cardNumber) {
  const n = cardNumber.replace(/\s|-/g, "");
  if (/^4[0-9]{6,}$/.test(n)) return "VISA";
  if (/^5[1-5][0-9]{5,}$/.test(n)) return "MASTERCARD";
  if (/^3[47][0-9]{5,}$/.test(n)) return "AMEX";
  if (/^3(?:0[0-5]|[68][0-9])[0-9]{4,}$/.test(n)) return "DINERS";
  if (/^6(?:011|5[0-9]{2})[0-9]{3,}$/.test(n)) return "DISCOVER";
  if (/^(?:2131|1800|35\d{3})\d{11}$/.test(n)) return "JCB";
  return "DESCONHECIDA";
}

// Simulação de tokenização: HMAC do cartão + salt aleatório + contexto
function tokenizeCard(card, contextId = "") {
  const { number } = card;
  const salt = crypto.randomBytes(16).toString("hex");
  const hmac = crypto.createHmac("sha256", TOKENIZATION_SECRET);
  hmac.update(`${number}|${salt}|${contextId}`);
  const token = `tok_${hmac.digest("hex")}`;
  const last4 = (number || "").replace(/\D/g, "").slice(-4);
  const brand = detectBrand(number || "");
  return { token, last4, brand };
}

function signPayload(rawBodyBuffer) {
  const hmac = crypto.createHmac("sha256", GATEWAY_WEBHOOK_SECRET);
  hmac.update(rawBodyBuffer);
  return hmac.digest("hex");
}

function verifySignature(signature, rawBodyBuffer) {
  try {
    const expected = signPayload(rawBodyBuffer);
    const sigBuf = Buffer.from(signature || "", "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch (e) {
    return false;
  }
}

module.exports = {
  tokenizeCard,
  signPayload,
  verifySignature,
};
