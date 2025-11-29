import { randomUUID } from "node:crypto";
import db from "../database/conexao.js"; // Assumindo que seu arquivo de conexão se chama 'conexao.js'

class HospedeRepository {
  async findAll() {
    const sql = "SELECT * FROM Hospede;";
    const [rows] = await db.execute(sql);
    return rows;
  }

  async findById(id) {
    const sql = "SELECT * FROM Hospede WHERE idHospede = ?;";
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  }

  async create(hospedeData, connection) {
    const newId = randomUUID();
    const { nome, sobrenome, cpf, email, dataNascimento, telefone } = hospedeData;

    const sql = `
      INSERT INTO Hospede (idHospede, nome, cpf, email, dataNascimento, telefone)
      VALUES (?, ?, ?, ?, ?, ?);
    `;

    const nomeCompleto = sobrenome ? `${nome} ${sobrenome}` : nome;
    const values = [newId, nomeCompleto, cpf, email, dataNascimento, telefone];
    console.log('💾 Inserindo hóspede:', values);
    
    // Usa a conexão da transação se ela for fornecida
    const executor = connection || db;
    await executor.execute(sql, values);
    return { idHospede: newId, ...hospedeData };
  }

  async update(id, hospedeData) {
    const { nome, cpf, email, dataNascimento, telefone } = hospedeData;

    const sql = `
      UPDATE Hospede SET
        nome = ?, cpf = ?, email = ?, dataNascimento = ?, telefone = ?
      WHERE idHospede = ?;
    `;
    const values = [nome, cpf, email, dataNascimento, telefone, id];

    const [result] = await db.execute(sql, values);
    return { affectedRows: result.affectedRows };
  }

  async delete(id) {
    const sql = "DELETE FROM Hospede WHERE idHospede = ?;";
    const [result] = await db.execute(sql, [id]);
    return { affectedRows: result.affectedRows };
  }
}

export default new HospedeRepository();
