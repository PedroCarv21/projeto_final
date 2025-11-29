const pool = require('../db/db');

class PaymentMethodRepository {
  constructor() {
    this.pool = pool;
  }

  /**
   * Retorna todos os métodos de pagamento ativos no banco de dados
   * @returns {Promise<Array>} Array de métodos de pagamento
   */
  async findAllActive() {
    try {
      const [rows] = await this.pool.execute(
        'SELECT idMetodoPagamento, tipo, status, created_at, updated_at FROM MetodoPagamento WHERE status = 1'
      );
      return rows;
    } catch (error) {
      console.error('Repository: Erro ao consultar métodos de pagamento:', error);
      throw error;
    }
  }

  /**
   * Retorna um método de pagamento pelo ID no banco de dados
   * @param {number} id - ID do método de pagamento
   * @returns {Promise<Object|null>} Método de pagamento ou nulo se não encontrado
   */
  async findById(id) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT idMetodoPagamento, tipo, status, created_at, updated_at FROM MetodoPagamento WHERE idMetodoPagamento = ? AND status = 1',
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Repository: Erro ao consultar método de pagamento por ID:', error);
      throw error;
    }
  }

  /**
   * Retorna um método de pagamento pelo tipo no banco de dados
   * @param {number} tipo - Tipo do método de pagamento (1 = Cartão, 2 = PIX)
   * @returns {Promise<Object|null>} Método de pagamento ou nulo se não encontrado
   */
  async findByTipo(tipo) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT idMetodoPagamento, tipo, status, created_at, updated_at FROM MetodoPagamento WHERE tipo = ? AND status = 1',
        [tipo]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Repository: Erro ao consultar método de pagamento por tipo:', error);
      throw error;
    }
  }
}

module.exports = PaymentMethodRepository;