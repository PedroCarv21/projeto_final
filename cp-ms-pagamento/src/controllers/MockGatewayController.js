const axios = require("axios");
const crypto = require("crypto");
const { signPayload } = require("../utils/security");

class MockGatewayController {
  // Simula uma cobrança no cartão e dispara webhook com resultado
  async charge(req, res) {
    try {
      const { idPagamento, amount, cardToken } = req.body || {};
      if (!idPagamento || !amount || !cardToken) {
        return res.status(400).json({
          success: false,
          message: "Parâmetros obrigatórios ausentes",
        });
      }

      // Regras simples de simulação
      const approve = Number(amount) <= 1000 || cardToken.length % 2 === 0;
      const payload = {
        idPagamento,
        status: approve ? "approved" : "declined",
        authorizationCode: `AUTH-${crypto
          .randomBytes(4)
          .toString("hex")
          .toUpperCase()}`,
      };

      const raw = Buffer.from(JSON.stringify(payload));
      const signature = signPayload(raw);

      const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:3005';

      // Dispara webhook de forma assíncrona
      setTimeout(async () => {
        try {
          await axios.post(`${PUBLIC_BASE_URL}/api/webhooks/gateway`, raw, {
            headers: {
              "Content-Type": "application/json",
              "X-Gateway-Signature": signature,
            },
            timeout: 5000,
          });
        } catch (e) {
          console.warn("MockGateway: erro ao enviar webhook:", e.message);
        }
      }, 800);

      return res
        .status(200)
        .json({ success: true, message: "Cobrança em processamento" });
    } catch (error) {
      console.error("MockGateway charge error:", error);
      return res.status(500).json({ success: false, message: "Erro interno" });
    }
  }

  // Gera dados de PIX e agenda confirmação automática
  async pix(req, res) {
    try {
      const { idPagamento, amount } = req.body || {};
      if (!idPagamento || !amount) {
        return res.status(400).json({
          success: false,
          message: "Parâmetros obrigatórios ausentes",
        });
      }

      const payloadPix = {
        txid: `TX-${idPagamento.slice(0, 8)}`,
        qrCode: `QRDATA:${idPagamento}:${amount}`,
        copiaCola: Buffer.from(`${idPagamento}|${amount}`).toString("base64"),
      };

      const data = {
        qrCode: payloadPix.qrCode,
        copiaCola: payloadPix.copiaCola,
      };

      // Agenda uma confirmação automática (aprovada) após 5s
      const confirmation = {
        idPagamento,
        status: "approved",
        authorizationCode: `PIX-${crypto
          .randomBytes(4)
          .toString("hex")
          .toUpperCase()}`,
      };
      const raw = Buffer.from(JSON.stringify(confirmation));
      const signature = signPayload(raw);
      const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:3005';

      setTimeout(async () => {
        try {
          await axios.post(`${PUBLIC_BASE_URL}/api/webhooks/gateway`, raw, {
            headers: {
              "Content-Type": "application/json",
              "X-Gateway-Signature": signature,
            },
            timeout: 5000,
          });
        } catch (e) {
          console.warn("MockGateway: erro ao enviar webhook PIX:", e.message);
        }
      }, 5000);

      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("MockGateway pix error:", error);
      return res.status(500).json({ success: false, message: "Erro interno" });
    }
  }
}

module.exports = MockGatewayController;
