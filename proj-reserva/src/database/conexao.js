// Carrega as variáveis de ambiente do arquivo .env
import "dotenv/config";

// Importa a biblioteca para conectar com o MySQL
import mysql from "mysql2/promise";

// Cria um "pool" de conexões, que é uma forma eficiente de gerenciar as conexões com o banco
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0'),
});

// Exporta o pool para que nosso servidor principal (index.js) possa usá-lo
export default pool;
