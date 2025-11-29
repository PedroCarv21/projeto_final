import pool from '../database/db.js';
import { randomUUID } from 'crypto';

class RoomRepository {

  async getAllRooms() {
    const [rooms] = await pool.query(`
      SELECT 
        q.id, 
        q.titulo AS name, 
        q.descricao AS description, 
        q.preco AS price, 
        q.tipo AS type, 
        q.capacidade AS capacity,
        q.Resumo AS resume,
        sq.descricao AS status 
      FROM QUARTO q
      LEFT JOIN statusquarto sq ON q.status = sq.id_status
      WHERE q.status <> 2;
    `);
    return rooms;
  }

  async getRoomFeatures(roomId) {
    const [features] = await pool.query(`
      SELECT r.descricao AS feature
      FROM RECURSO r
      JOIN quartorecurso qr ON r.id = qr.idRecuso
      WHERE qr.idQuarto = ?
    `, [roomId]);
    return features.map(f => f.feature);
  }

  async getRoomImage(roomId) {
    const [images] = await pool.query(`
      SELECT url FROM IMAGEM
      WHERE id_quarto = ?
      LIMIT 1
    `, [roomId]);
    return images.length > 0 ? images[0].url : '';
  }

  async getRoomId(id) {
  const [rows] = await pool.query(`
    SELECT
      q.id, 
      q.titulo AS name, 
      q.descricao AS description, 
      q.preco AS price, 
      q.tipo AS type, 
      q.capacidade AS capacity,
      q.Resumo AS resume,
      sq.descricao AS status 
    FROM QUARTO q
    LEFT JOIN statusquarto sq ON q.status = sq.id_status
    WHERE q.id = ?
  `, [id]);

  return rows[0] || null;
}

  async updateRoom(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) throw new Error('Nada para atualizar.');

    const updates = keys.map(key => `${key} = ?`).join(', ');
    const values = Object.values(fields);

    const sql = `UPDATE QUARTO SET ${updates} WHERE id = ?`;
    const [result] = await pool.query(sql, [...values, id]);

    return result; // tem result.affectedRows
  }

  // === INSERT do QUARTO ===
  async insertRoom(conn, room) {
    const id = `q_${randomUUID().slice(0, 5)}`
    const sql = `
      INSERT INTO QUARTO (
        id, titulo, tipo, descricao, preco, capacidade, status, area, camas, banheiro, resumo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      id ,
      room.titulo,
      room.tipo,
      room.descricao ?? null,
      room.preco,
      room.capacidade,
      room.status,                 // <= recebe o número e grava direto
      room.area ?? null,
      room.camas ?? null,
      room.banheiro ?? null,
      room.resumo ?? null
    ];
    await conn.query(sql, params);
    return id;
  }

  // === INSERT de 1 imagem (opcional no POST /rooms) ===
  async insertSingleImage(conn, roomId, imagem) {
    if (!imagem || !imagem.url) return;
    const id = imagem.id || randomUUID();
    const sql = `
      INSERT INTO IMAGEM (id, id_quarto, url, descricao)
      VALUES (?, ?, ?, ?)
    `;
    await conn.query(sql, [id, roomId, imagem.url, imagem.descricao ?? null]);
  }

  // === Criação transacional do quarto + imagem opcional ===
  async createRoomWithOptionalImage(data) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const roomId = await this.insertRoom(conn, data);
      await this.insertSingleImage(conn, roomId, data.imagem); // opcional

      await conn.commit();
      return roomId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
  
  // === Rota separada: anexar 1..N imagens depois ===
  async addImages(roomId, imagens) {
    const list = Array.isArray(imagens) ? imagens : [imagens];
    if (!list.length) return;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const sql = `
        INSERT INTO IMAGEM (id, id_quarto, url, descricao)
        VALUES (?, ?, ?, ?)
      `;
      for (const img of list) {
        if (!img?.url) continue; // ignora itens inválidos silenciosamente
        const id = img.id || randomUUID();
        await conn.execute(sql, [id, roomId, img.url, img.descricao ?? null]);
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  //DELETE
  async killRoom(id){
    const [result] = await pool.query('DELETE FROM QUARTO WHERE id = ?', [id]);
    return result.affectedRows;
  }

  // Busca quartos disponíveis excluindo os ocupados
  async getAvailableRooms(excludeRoomIds, minCapacity) {
    let sql = `
      SELECT 
        q.id, 
        q.titulo AS name, 
        q.descricao AS description, 
        q.preco AS price, 
        q.tipo AS type, 
        q.capacidade AS capacity,
        q.Resumo AS resume,
        sq.descricao AS status 
      FROM QUARTO q
      LEFT JOIN statusquarto sq ON q.status = sq.id_status
      WHERE q.status <> 2
    `;

    const params = [];

    // Adiciona filtro de capacidade mínima
    if (minCapacity) {
      sql += ' AND q.capacidade >= ?';
      params.push(minCapacity);
    }

    // Exclui quartos ocupados
    if (excludeRoomIds && excludeRoomIds.length > 0) {
      sql += ` AND q.id NOT IN (${excludeRoomIds.map(() => '?').join(', ')})`;
      params.push(...excludeRoomIds);
    }

    const [rooms] = await pool.query(sql, params);
    return rooms;
  }

}

export default new RoomRepository();
