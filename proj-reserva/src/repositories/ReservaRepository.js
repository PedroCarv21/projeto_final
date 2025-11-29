import { randomUUID } from "node:crypto";
import db from "../database/conexao.js"; // Assumindo que seu arquivo de conexão se chama 'conexao.js'

class ReservaRepository {
  // 🔹 NOVO: Função auxiliar para buscar dados do quarto na API de quartos
  async fetchQuartoData(idQuarto) {
    try {
      const QUARTO_API_URL = process.env.QUARTO_API_URL || 'http://localhost:3003';
      const response = await fetch(`${QUARTO_API_URL}/api/quarto/${idQuarto}`);
      
      if (!response.ok) {
        console.warn(`Não foi possível buscar dados do quarto ${idQuarto}`);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar dados do quarto ${idQuarto}:`, error);
      return null;
    }
  }

  async findAllWithHospede() {
    const sql = `
      SELECT r.*, h.nome AS nomeHospede, h.email AS emailHospede
      FROM Reserva r
      JOIN Hospede h ON r.idHospede = h.idHospede;
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }

  // 🔹 MODIFICADO: Buscar reservas por ID do cliente com informações do quarto
  async findByClienteIdWithHospede(idCliente) {
    const sql = `
      SELECT r.*, h.nome AS nomeHospede, h.email AS emailHospede
      FROM Reserva r
      JOIN Hospede h ON r.idHospede = h.idHospede
      WHERE r.idCliente = ?
      ORDER BY r.dataEntrada DESC;
    `;
    const [rows] = await db.execute(sql, [idCliente]);
    
    // 🔹 NOVO: Enriquecer dados com informações do quarto
    const reservasEnriquecidas = await Promise.all(
      rows.map(async (reserva) => {
        const quartoData = await this.fetchQuartoData(reserva.idQuarto);
        
        return {
          ...reserva,
          quarto: quartoData ? {
            nome: quartoData.nome || `Quarto ${reserva.idQuarto}`,
            tipo: quartoData.tipo || 'Standard',
            descricao: quartoData.descricao || '',
            capacidade: quartoData.capacidade || reserva.quantidadeHospedes,
            precoPorNoite: quartoData.precoPorNoite || (parseFloat(reserva.precoTotal) / reserva.quantidadeDiarias),
            imagens: quartoData.imagens || [],
            comodidades: quartoData.comodidades || []
          } : null
        };
      })
    );
    
    return reservasEnriquecidas;
  }

  async findByIdWithHospede(id) {
    const sql = `
      SELECT r.*, h.nome, h.email, h.telefone
      FROM Reserva r
      JOIN Hospede h ON r.idHospede = h.idHospede
      WHERE r.idReserva = ?;
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  }

  async create(reservaData, connection) {
    const newId = randomUUID();
    const {
      dataEntrada,
      dataSaida,
      status,
      idQuarto,
      idCliente,
      precoTotal,
      quantidadeHospedes,
      quantidadeDiarias,
      idHospede,
    } = reservaData;

    const sql = `
      INSERT INTO Reserva (
        idReserva, dataEntrada, dataSaida, status, idQuarto, idCliente,
        precoTotal, quantidadeHospedes, quantidadeDiarias, idHospede
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const values = [
      newId,
      dataEntrada,
      dataSaida,
      status || process.env.DEFAULT_RESERVATION_STATUS || "Pendente",
      idQuarto,
      idCliente,
      precoTotal,
      quantidadeHospedes,
      quantidadeDiarias,
      idHospede,
    ];

    // Usa a conexão da transação se ela for fornecida
    const executor = connection || db;
    await executor.execute(sql, values);

    return { idReserva: newId, ...reservaData };
  }

  async update(id, reservaData) {
    const setClause = Object.keys(reservaData)
      .map((key) => `\`${key}\` = ?`)
      .join(", ");
    const values = [...Object.values(reservaData), id];
    const sql = `UPDATE Reserva SET ${setClause} WHERE idReserva = ?`;
    const [result] = await db.execute(sql, values);
    return { affectedRows: result.affectedRows };
  }

  async delete(id) {
    const sql = "DELETE FROM Reserva WHERE idReserva = ?;";
    const [result] = await db.execute(sql, [id]);
    return { affectedRows: result.affectedRows };
  }
}

export default new ReservaRepository();
