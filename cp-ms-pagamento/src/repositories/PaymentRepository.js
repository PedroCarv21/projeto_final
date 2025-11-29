const pool = require("../db/db");

const STATUS = {
  PENDENTE: 0,
  APROVADO: 1,
  RECUSADO: 2,
  CANCELADO: 3,
};

class PaymentRepository {
  constructor() {
    this.pool = pool;
  }

  async create(payment) {
    const {
      idPagamento,
      valorTotal,
      statusPagamento = STATUS.PENDENTE,
      dataHoraConfirmacao = null,
      codigoAutorizacao = null,
      qrCode = null,
      copiaCola = null,
      idUsuario,
      idReserva,
      idMetodoPagamento,
    } = payment;

    const sql = `INSERT INTO Pagamento (
      idPagamento, valorTotal, statusPagamento, dataHoraConfirmacao, codigoAutorizacao,
      qrCode, copiaCola, idUsuario, idReserva, idMetodoPagamento
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      idPagamento,
      valorTotal,
      statusPagamento,
      dataHoraConfirmacao,
      codigoAutorizacao,
      qrCode,
      copiaCola,
      idUsuario,
      idReserva,
      idMetodoPagamento,
    ];

    await this.pool.execute(sql, params);

    return {
      idPagamento,
      valorTotal,
      statusPagamento,
      dataHoraConfirmacao,
      codigoAutorizacao,
      qrCode,
      copiaCola,
      idUsuario,
      idReserva,
      idMetodoPagamento,
    };
  }

  async updateFields(idPagamento, fields) {
    const keys = Object.keys(fields).filter((k) => fields[k] !== undefined);
    if (!keys.length) return 0;

    const sets = keys.map((k) => `${k} = ?`).join(", ");
    const params = keys.map((k) => fields[k]);
    params.push(idPagamento);

    const sql = `UPDATE Pagamento SET ${sets} WHERE idPagamento = ?`;
    const [result] = await this.pool.execute(sql, params);
    return result.affectedRows || 0;
  }

  async findById(idPagamento) {
    const sql = `SELECT idPagamento, valorTotal, statusPagamento, dataHoraConfirmacao, codigoAutorizacao,
      qrCode, copiaCola, idUsuario, idReserva, idMetodoPagamento, created_at, updated_at
      FROM Pagamento WHERE idPagamento = ?`;
    const [rows] = await this.pool.execute(sql, [idPagamento]);
    return rows[0] || null;
  }

  async findAll() {
    const sql = `SELECT idPagamento, valorTotal, statusPagamento, dataHoraConfirmacao, codigoAutorizacao,
      qrCode, copiaCola, idUsuario, idReserva, idMetodoPagamento, created_at, updated_at
      FROM Pagamento
      ORDER BY created_at DESC`;
    const [rows] = await this.pool.execute(sql);
    return rows;
  }
}

PaymentRepository.STATUS = STATUS;

module.exports = PaymentRepository;
