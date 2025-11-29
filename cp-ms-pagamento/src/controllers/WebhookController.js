const PaymentRepository = require("../repositories/PaymentRepository");
const { verifySignature } = require("../utils/security");

class WebhookController {
  constructor() {
    this.paymentRepository = new PaymentRepository();
    this.STATUS = PaymentRepository.STATUS;
  }

  // Recebe eventos do gateway simulado
  async handleGatewayWebhook(req, res) {
    try {
      const signature = req.header("X-Gateway-Signature");
      const raw = req.body;
      if (!Buffer.isBuffer(raw)) {
        return res
          .status(400)
          .json({ success: false, message: "Corpo inválido" });
      }

      const ok = verifySignature(signature, raw);
      if (!ok) {
        return res
          .status(401)
          .json({ success: false, message: "Assinatura inválida" });
      }

      const payload = JSON.parse(raw.toString("utf8"));
      const { idPagamento, status, authorizationCode = null } = payload || {};
      if (!idPagamento || !status) {
        return res
          .status(400)
          .json({ success: false, message: "Payload inválido" });
      }

      if (status === "approved") {
        await this.paymentRepository.updateFields(idPagamento, {
          statusPagamento: this.STATUS.APROVADO,
          dataHoraConfirmacao: new Date(),
          codigoAutorizacao: authorizationCode,
        });
      } else if (status === "declined") {
        await this.paymentRepository.updateFields(idPagamento, {
          statusPagamento: this.STATUS.RECUSADO,
          codigoAutorizacao: authorizationCode,
        });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Erro no webhook do gateway:", error);
      return res.status(500).json({ success: false });
    }
  }
}

module.exports = WebhookController;
