require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    console.log('[DB] Conexão MySQL OK');
    conn.release();
  } catch (err) {
    console.error('[DB] Falha ao conectar:', err.message);
  }
})();

module.exports = pool;