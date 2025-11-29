const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const PaymentRepository = require("../repositories/PaymentRepository");
const PaymentMethodRepository = require("../repositories/PaymentMethodRepository");
const { tokenizeCard } = require("../utils/security");

class PaymentController {
  constructor() {
    this.paymentRepository = new PaymentRepository();
    this.methodRepository = new PaymentMethodRepository();
    this.STATUS = PaymentRepository.STATUS;
  }

  async createPayment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: errors.array(),
        });
      }

      const { valorTotal, idUsuario, idReserva, idMetodoPagamento, cartao } =
        req.body;

      const method = await this.methodRepository.findById(idMetodoPagamento);
      if (!method) {
        return res.status(400).json({
          success: false,
          message: "Método de pagamento inválido ou inativo",
        });
      }

      const idPagamento = uuidv4();

      await this.paymentRepository.create({
        idPagamento,
        valorTotal,
        statusPagamento: this.STATUS.PENDENTE,
        idUsuario,
        idReserva,
        idMetodoPagamento: String(idMetodoPagamento),
      });

      const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:3005';

      if (method.tipo === 1) {
        const { token, last4, brand } = tokenizeCard(cartao || {}, idPagamento);

        // Chama mock-gateway para processar cobrança de forma assíncrona
        try {
          await axios.post(
            `${PUBLIC_BASE_URL}/api/mock-gateway/charge`,
            {
              idPagamento,
              amount: Number(valorTotal),
              cardToken: token,
            },
            { timeout: 5000 }
          );
        } catch (e) {
          console.warn("Falha ao acionar mock-gateway/charge:", e.message);
        }

        return res.status(201).json({
          success: true,
          message: "Pagamento criado e em processamento",
          data: {
            idPagamento,
            status: "pendente",
            metodo: "cartao",
            card: { brand, last4 },
            valorTotal: Number(valorTotal),
          },
        });
      }

      if (method.tipo === 2) {
        const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:3005';
        let pixData = null;
        try {
          const resp = await axios.post(
            `${PUBLIC_BASE_URL}/api/mock-gateway/pix`,
            {
              idPagamento,
              amount: Number(valorTotal),
            },
            { timeout: 5000 }
          );
          pixData = resp.data?.data || null;
        } catch (e) {
          console.warn("Falha ao acionar mock-gateway/pix:", e.message);
        }

        if (pixData?.qrCode || pixData?.copiaCola) {
          await this.paymentRepository.updateFields(idPagamento, {
            qrCode: pixData.qrCode,
            copiaCola: pixData.copiaCola,
          });
        }

        return res.status(201).json({
          success: true,
          message: "Pagamento PIX criado. Aguarde confirmação.",
          data: {
            idPagamento,
            status: "pendente",
            metodo: "pix",
            valorTotal: Number(valorTotal),
            qrCode: pixData?.qrCode || null,
            copiaCola: pixData?.copiaCola || null,
          },
        });
      }

      return res
        .status(400)
        .json({ success: false, message: "Tipo de método não suportado" });
    } catch (error) {
      console.error("Erro ao criar pagamento:", error);
      return res
        .status(500)
        .json({ success: false, message: "Erro interno ao criar pagamento" });
    }
  }

  async getPaymentById(req, res) {
    try {
      const { id } = req.params;
      if (!id)
        return res
          .status(400)
          .json({ success: false, message: "ID é obrigatório" });

      const payment = await this.paymentRepository.findById(id);
      if (!payment)
        return res
          .status(404)
          .json({ success: false, message: "Pagamento não encontrado" });

      const statusMap = {
        0: "pendente",
        1: "aprovado",
        2: "recusado",
        3: "cancelado",
      };

      return res.status(200).json({
        success: true,
        data: {
          idPagamento: payment.idPagamento,
          status: statusMap[payment.statusPagamento] || "desconhecido",
          valorTotal: Number(payment.valorTotal),
          dataHoraConfirmacao: payment.dataHoraConfirmacao,
          codigoAutorizacao: payment.codigoAutorizacao,
          qrCode: payment.qrCode || null,
          copiaCola: payment.copiaCola || null,
          idUsuario: payment.idUsuario,
          idReserva: payment.idReserva,
          idMetodoPagamento: payment.idMetodoPagamento,
          createdAt: payment.created_at,
          updatedAt: payment.updated_at,
        },
      });
    } catch (error) {
      console.error("Erro ao buscar pagamento:", error);
      return res
        .status(500)
        .json({ success: false, message: "Erro interno ao buscar pagamento" });
    }
  }

  async getAllPayments(req, res) {
    try {
      const payments = await this.paymentRepository.findAll();

      const statusMap = {
        0: "pendente",
        1: "aprovado",
        2: "recusado",
        3: "cancelado",
      };

      const data = payments.map((payment) => ({
        idPagamento: payment.idPagamento,
        status: statusMap[payment.statusPagamento] || "desconhecido",
        valorTotal: Number(payment.valorTotal),
        dataHoraConfirmacao: payment.dataHoraConfirmacao,
        codigoAutorizacao: payment.codigoAutorizacao,
        qrCode: payment.qrCode || null,
        copiaCola: payment.copiaCola || null,
        idUsuario: payment.idUsuario,
        idReserva: payment.idReserva,
        idMetodoPagamento: payment.idMetodoPagamento,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
      }));

      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Erro ao listar pagamentos:", error);
      return res
        .status(500)
        .json({ success: false, message: "Erro interno ao listar pagamentos" });
    }
  }
}

module.exports = PaymentController;
