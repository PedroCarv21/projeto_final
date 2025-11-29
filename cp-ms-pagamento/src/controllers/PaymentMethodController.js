const PaymentMethodRepository = require('../repositories/PaymentMethodRepository');

class PaymentMethodController {
  constructor() {
    this.paymentMethodRepository = new PaymentMethodRepository();
    this.METHOD_TYPE_MAP = {
      1: 'Cartão de crédito',
      2: 'PIX'
    };
  }

  /**
   * Retorna todos os métodos de pagamento ativos
   */
  async getAllPaymentMethods(req, res) {
    try {
      const rows = await this.paymentMethodRepository.findAllActive();

      const methods = rows.map(r => ({
        id: r.idMetodoPagamento,
        tipo: r.tipo,
        tipoLabel: this.METHOD_TYPE_MAP[r.tipo] || 'desconhecido',
        status: !!r.status,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));

      res.status(200).json({ 
        success: true,
        data: { methods },
        message: 'Métodos de pagamento listados com sucesso'
      });
    } catch (error) {
      console.error('Controller: Erro ao listar métodos de pagamento:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erro interno do servidor ao listar métodos de pagamento',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Retorna um método de pagamento pelo ID
   */
  async getPaymentMethodById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID do método de pagamento é obrigatório e deve ser um número'
        });
      }

      const paymentMethod = await this.paymentMethodRepository.findById(parseInt(id));

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          message: 'Método de pagamento não encontrado'
        });
      }

      const method = {
        id: paymentMethod.idMetodoPagamento,
        tipo: paymentMethod.tipo,
        tipoLabel: this.METHOD_TYPE_MAP[paymentMethod.tipo] || 'desconhecido',
        status: !!paymentMethod.status,
        createdAt: paymentMethod.created_at,
        updatedAt: paymentMethod.updated_at
      };

      res.status(200).json({
        success: true,
        data: { method },
        message: 'Método de pagamento encontrado com sucesso'
      });
    } catch (error) {
      console.error('Controller: Erro ao buscar método de pagamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar método de pagamento',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Retorna um método de pagamento pelo tipo
   */
  async getPaymentMethodByTipo(req, res) {
    try {
      const { tipo } = req.params;

      if (!tipo || isNaN(tipo)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo do método de pagamento é obrigatório e deve ser um número (1 = Cartão, 2 = PIX)'
        });
      }

      const paymentMethod = await this.paymentMethodRepository.findByTipo(parseInt(tipo));

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          message: 'Método de pagamento não encontrado para o tipo especificado'
        });
      }

      const method = {
        id: paymentMethod.idMetodoPagamento,
        tipo: paymentMethod.tipo,
        tipoLabel: this.METHOD_TYPE_MAP[paymentMethod.tipo] || 'desconhecido',
        status: !!paymentMethod.status,
        createdAt: paymentMethod.created_at,
        updatedAt: paymentMethod.updated_at
      };

      res.status(200).json({
        success: true,
        data: { method },
        message: 'Método de pagamento encontrado com sucesso'
      });
    } catch (error) {
      console.error('Controller: Erro ao buscar método de pagamento por tipo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar método de pagamento',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  healthCheck(req, res) {
    res.status(200).json({
      success: true,
      message: '[SERVER] Microsserviço de pagamento está rodando',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
}

module.exports = PaymentMethodController;